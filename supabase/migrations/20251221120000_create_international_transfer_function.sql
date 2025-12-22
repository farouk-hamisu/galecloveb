CREATE OR REPLACE FUNCTION public.international_transfer(
  p_sender_user_id UUID,
  p_from_account_id UUID,
  p_beneficiary_id UUID,
  p_amount NUMERIC,
  p_description TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  reference_number TEXT,
  recipient_name TEXT,
  recipient_email TEXT,
  currency TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_account_info RECORD;
  beneficiary_info RECORD;
  new_sender_balance NUMERIC;
  v_reference_number TEXT;
  v_recipient_name TEXT;
  sender_full_name TEXT;
  formatted_amount TEXT;
  sender_account_status TEXT;

BEGIN
  -- 1. Get sender account and validate
  SELECT * INTO sender_account_info
  FROM accounts
  WHERE id = p_from_account_id AND user_id = p_sender_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Sender account not found'::TEXT, null::TEXT, null::TEXT, null::TEXT, null::TEXT;
    RETURN;
  END IF;

  -- Get sender's account status
  SELECT account_status INTO sender_account_status
  FROM profiles
  WHERE id = p_sender_user_id;

  IF sender_account_status = 'frozen' THEN
    RETURN QUERY SELECT false, 'This account is frozen. Outgoing transfers are disabled.'::TEXT, null::TEXT, null::TEXT, null::TEXT, null::TEXT;
    RETURN;
  END IF;

  IF sender_account_info.balance < p_amount THEN
    RETURN QUERY SELECT false, 'Insufficient funds'::TEXT, null::TEXT, null::TEXT, null::TEXT, null::TEXT;
    RETURN;
  END IF;

  -- 2. Get beneficiary account
  SELECT * INTO beneficiary_info
  FROM beneficiaries
  WHERE id = p_beneficiary_id AND user_id = p_sender_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Beneficiary not found'::TEXT, null::TEXT, null::TEXT, null::TEXT, null::TEXT;
    RETURN;
  END IF;

  -- 3. Generate reference number and names
  v_reference_number := 'TRF' || upper(to_hex(extract(epoch from now)::integer)) || upper(substring(md5(random()::text) from 1 for 6));
  v_recipient_name := beneficiary_info.name;
  SELECT concat_ws(' ', first_name, last_name) INTO sender_full_name
  FROM profiles WHERE id = p_sender_user_id;

  -- 4. Perform the transfer
  new_sender_balance := sender_account_info.balance - p_amount;
  UPDATE accounts SET balance = new_sender_balance WHERE id = sender_account_info.id;

  -- 5. Create transaction record for sender
  INSERT INTO transactions (account_id, type, amount, currency, description, reference_number, recipient_name, recipient_account, status)
  VALUES (sender_account_info.id, 'transfer_out', -p_amount, sender_account_info.currency, p_description, v_reference_number, v_recipient_name, beneficiary_info.account_number, 'completed');

  -- 6. Create notification for sender
  formatted_amount := to_char(p_amount, 'FM999,999,990.00');

  INSERT INTO notifications (user_id, title, message, type)
  VALUES (p_sender_user_id, 'International Transfer Sent Successfully', 'You sent ' || sender_account_info.currency || formatted_amount || ' to ' || v_recipient_name || '. Reference: ' || v_reference_number, 'transaction');

  -- 7. Return success
  RETURN QUERY SELECT true, 'Transfer successful'::TEXT, v_reference_number, v_recipient_name, beneficiary_info.email, sender_account_info.currency;

EXCEPTION
  WHEN OTHERS THEN
    -- On any error, rollback and return failure
    RAISE WARNING 'International transfer failed: %', SQLERRM;
    RETURN QUERY SELECT false, 'An unexpected error occurred. The transaction has been rolled back.'::TEXT, null::TEXT, null::TEXT, null::TEXT, null::TEXT;
END;
$$;
