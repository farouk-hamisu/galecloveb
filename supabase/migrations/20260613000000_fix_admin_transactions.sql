-- Fix transactions type constraint
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'card_payment', 'credit', 'debit', 'transfer'));

-- Function to create transaction by admin using email
CREATE OR REPLACE FUNCTION public.create_admin_transaction(
  p_email text,
  p_amount numeric,
  p_type text,
  p_description text DEFAULT '',
  p_recipient_name text DEFAULT '',
  p_recipient_account text DEFAULT '',
  p_status text DEFAULT 'completed'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_account_id uuid;
  v_ref text;
  v_currency text;
  v_is_admin boolean;
BEGIN
  -- Check if caller is admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized: Admin role required');
  END IF;

  -- Find user by email
  SELECT id INTO v_user_id FROM profiles WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;

  -- Find primary account
  SELECT id, currency INTO v_account_id, v_currency FROM accounts WHERE user_id = v_user_id LIMIT 1;

  IF v_account_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Account not found for this user');
  END IF;

  -- Generate reference
  v_ref := 'TXN' || upper(to_hex(extract(epoch from now())::bigint)) || upper(substring(md5(random()::text) from 1 for 6));

  -- Update balance
  IF p_type IN ('deposit', 'credit', 'transfer_in') THEN
    UPDATE accounts SET balance = balance + p_amount WHERE id = v_account_id;
  ELSIF p_type IN ('withdrawal', 'debit', 'transfer_out', 'card_payment') THEN
    UPDATE accounts SET balance = balance - p_amount WHERE id = v_account_id;
  END IF;

  -- Insert transaction
  INSERT INTO transactions (
    account_id, 
    type, 
    amount, 
    currency, 
    description, 
    reference_number, 
    recipient_name, 
    recipient_account, 
    status
  )
  VALUES (
    v_account_id, 
    p_type, 
    p_amount, 
    coalesce(v_currency, 'USD'), 
    p_description, 
    v_ref, 
    p_recipient_name, 
    p_recipient_account, 
    p_status
  );

  -- Create notification
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    v_user_id, 
    'Transaction ' || initcap(p_type), 
    'A ' || p_type || ' of ' || coalesce(v_currency, 'USD') || ' ' || p_amount || ' has been processed. Ref: ' || v_ref, 
    p_type
  );

  RETURN json_build_object('success', true, 'message', 'Transaction created successfully', 'reference_number', v_ref);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_admin_transaction TO authenticated;
