-- Create a function to look up recipient by email or account number (bypasses RLS)
CREATE OR REPLACE FUNCTION public.lookup_transfer_recipient(
  p_identifier TEXT,
  p_is_email BOOLEAN
)
RETURNS TABLE(
  user_id UUID,
  account_id UUID,
  account_number TEXT,
  first_name TEXT,
  last_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_is_email THEN
    -- Look up by email
    RETURN QUERY
    SELECT
      p.id AS user_id,
      a.id AS account_id,
      a.account_number,
      p.first_name,
      p.last_name
    FROM profiles p
    INNER JOIN accounts a ON a.user_id = p.id AND a.is_active = true
    WHERE LOWER(p.email) = LOWER(TRIM(p_identifier))
    ORDER BY a.created_at ASC
    LIMIT 1;
  ELSE
    -- Look up by account number
    RETURN QUERY
    SELECT
      p.id AS user_id,
      a.id AS account_id,
      a.account_number,
      p.first_name,
      p.last_name
    FROM accounts a
    INNER JOIN profiles p ON p.id = a.user_id
    WHERE a.account_number = TRIM(p_identifier) AND a.is_active = true
    LIMIT 1;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.lookup_transfer_recipient(TEXT, BOOLEAN) TO authenticated;

-- Create the internal transfer function
CREATE OR REPLACE FUNCTION public.internal_transfer(
  p_sender_user_id UUID,
  p_from_account_id UUID,
  p_to_identifier TEXT,
  p_is_email BOOLEAN,
  p_amount NUMERIC,
  p_description TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  reference_number TEXT,
  recipient_name TEXT,
  recipient_user_id UUID,
  currency TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_account_info RECORD;
  recipient_lookup_info RECORD;
  recipient_account_info RECORD;
  new_sender_balance NUMERIC;
  new_recipient_balance NUMERIC;
  v_reference_number TEXT;
  v_recipient_name TEXT;
  sender_full_name TEXT;
  formatted_amount TEXT;
BEGIN
  -- 1. Get sender account and validate
  SELECT * INTO sender_account_info
  FROM accounts
  WHERE id = p_from_account_id AND user_id = p_sender_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Sender account not found'::TEXT, null::TEXT, null::TEXT, null::UUID, null::TEXT;
    RETURN;
  END IF;

  IF sender_account_info.balance < p_amount THEN
    RETURN QUERY SELECT false, 'Insufficient funds'::TEXT, null::TEXT, null::TEXT, null::UUID, null::TEXT;
    RETURN;
  END IF;

  -- 2. Get recipient account
  SELECT * INTO recipient_lookup_info
  FROM lookup_transfer_recipient(p_to_identifier, p_is_email);

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Recipient not found'::TEXT, null::TEXT, null::TEXT, null::UUID, null::TEXT;
    RETURN;
  END IF;

  -- Prevent self-transfer to the same account
  IF recipient_lookup_info.account_id = sender_account_info.id THEN
    RETURN QUERY SELECT false, 'Cannot transfer to the same account'::TEXT, null::TEXT, null::TEXT, null::UUID, null::TEXT;
    RETURN;
  END IF;

  -- Get full recipient account info
  SELECT * INTO recipient_account_info
  FROM accounts
  WHERE id = recipient_lookup_info.account_id;

  -- 3. Generate reference number and names
  v_reference_number := 'TRF' || upper(to_hex(extract(epoch from now)::integer)) || upper(substring(md5(random()::text) from 1 for 6));
  v_recipient_name := concat_ws(' ', recipient_lookup_info.first_name, recipient_lookup_info.last_name);
  SELECT concat_ws(' ', first_name, last_name) INTO sender_full_name
  FROM profiles WHERE id = p_sender_user_id;

  -- 4. Perform the transfer
  new_sender_balance := sender_account_info.balance - p_amount;
  UPDATE accounts SET balance = new_sender_balance WHERE id = sender_account_info.id;

  new_recipient_balance := recipient_account_info.balance + p_amount;
  UPDATE accounts SET balance = new_recipient_balance WHERE id = recipient_account_info.id;

  -- 5. Create transaction records
  -- Debit transaction for sender
  INSERT INTO transactions (account_id, type, amount, currency, description, reference_number, recipient_name, recipient_account, status)
  VALUES (sender_account_info.id, 'transfer_out', -p_amount, sender_account_info.currency, p_description, v_reference_number, v_recipient_name, recipient_account_info.account_number, 'completed');

  -- Credit transaction for recipient
  INSERT INTO transactions (account_id, type, amount, currency, description, reference_number, recipient_name, recipient_account, status)
  VALUES (recipient_account_info.id, 'transfer_in', p_amount, sender_account_info.currency, p_description, v_reference_number, sender_full_name, sender_account_info.account_number, 'completed');

  -- 6. Create notifications
  formatted_amount := to_char(p_amount, 'FM999,999,990.00');

  -- Notification for sender
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (p_sender_user_id, 'Transfer Sent Successfully', 'You sent ' || sender_account_info.currency || formatted_amount || ' to ' || v_recipient_name || '. Reference: ' || v_reference_number, 'transaction');

  -- Notification for recipient
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (recipient_lookup_info.user_id, 'Money Received', 'You received ' || sender_account_info.currency || formatted_amount || ' from ' || sender_full_name || '. Reference: ' || v_reference_number, 'transaction');

  -- 7. Return success
  RETURN QUERY SELECT true, 'Transfer successful'::TEXT, v_reference_number, v_recipient_name, recipient_lookup_info.user_id, sender_account_info.currency;

EXCEPTION
  WHEN OTHERS THEN
    -- On any error, rollback and return failure
    RAISE WARNING 'Internal transfer failed: %', SQLERRM;
    RETURN QUERY SELECT false, 'An unexpected error occurred. The transaction has been rolled back.'::TEXT, null::TEXT, null::TEXT, null::UUID, null::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.internal_transfer(UUID, UUID, TEXT, BOOLEAN, NUMERIC, TEXT) TO authenticated;
