-- Fix ambiguous column reference "currency" in transfer functions
-- Root cause: "currency" is both a column in "accounts" and an output column in "RETURNS TABLE"

-- 1. Fix internal_transfer
CREATE OR REPLACE FUNCTION public.internal_transfer(
  p_sender_user_id uuid,
  p_from_account_id uuid,
  p_to_identifier text,
  p_is_email boolean,
  p_amount numeric,
  p_description text DEFAULT ''
)
RETURNS TABLE(
  success boolean,
  message text,
  reference_number text,
  recipient_name text,
  recipient_email text,
  currency text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sender_balance numeric;
  v_sender_currency text;
  v_recipient record;
  v_ref text;
  v_recipient_email text;
BEGIN
  v_ref := 'TRF' || upper(to_hex(extract(epoch from now())::bigint)) || upper(substring(md5(random()::text) from 1 for 6));

  -- Use alias 'a' to avoid ambiguity with output column 'currency'
  SELECT a.balance, a.currency INTO v_sender_balance, v_sender_currency
  FROM public.accounts a 
  WHERE a.id = p_from_account_id 
    AND a.user_id = p_sender_user_id 
    AND a.is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Sender account not found or inactive'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  IF v_sender_balance < p_amount THEN
    RETURN QUERY SELECT false, 'Insufficient balance'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  -- Look up recipient using the helper function
  SELECT lr.user_id, lr.account_id, lr.account_number, lr.first_name, lr.last_name
  INTO v_recipient
  FROM public.lookup_transfer_recipient(p_to_identifier, p_is_email) lr;

  IF v_recipient IS NULL OR v_recipient.user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Recipient not found. Please check the account number or email.'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  IF v_recipient.user_id = p_sender_user_id AND v_recipient.account_id = p_from_account_id THEN
    RETURN QUERY SELECT false, 'Cannot transfer to the same account'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  -- Get recipient email for the notification
  SELECT p.email INTO v_recipient_email FROM public.profiles p WHERE p.id = v_recipient.user_id;

  -- Perform the transfer
  UPDATE public.accounts SET balance = balance - p_amount WHERE id = p_from_account_id;
  UPDATE public.accounts SET balance = balance + p_amount WHERE id = v_recipient.account_id;

  -- Record transactions
  INSERT INTO public.transactions (account_id, type, amount, currency, description, reference_number, recipient_name, recipient_account, status)
  VALUES (p_from_account_id, 'transfer_out', p_amount, v_sender_currency, p_description, v_ref,
          coalesce(v_recipient.first_name, '') || ' ' || coalesce(v_recipient.last_name, ''), v_recipient.account_number, 'completed');

  INSERT INTO public.transactions (account_id, type, amount, currency, description, reference_number, status)
  VALUES (v_recipient.account_id, 'transfer_in', p_amount, v_sender_currency, p_description, v_ref, 'completed');

  -- Create notifications
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (p_sender_user_id, 'Transfer Sent', 'You sent ' || coalesce(v_sender_currency, '$') || ' ' || p_amount || ' to ' || coalesce(v_recipient.first_name, 'Unknown'), 'transfer');

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_recipient.user_id, 'Transfer Received', 'You received ' || coalesce(v_sender_currency, '$') || ' ' || p_amount, 'transfer');

  -- Return results
  RETURN QUERY SELECT 
    true, 
    'Transfer completed successfully'::text, 
    v_ref,
    (coalesce(v_recipient.first_name, '') || ' ' || coalesce(v_recipient.last_name, ''))::text,
    coalesce(v_recipient_email, '')::text,
    coalesce(v_sender_currency, 'USD')::text;
END;
$$;

-- 2. Fix international_transfer
CREATE OR REPLACE FUNCTION public.international_transfer(
  p_sender_user_id uuid,
  p_from_account_id uuid,
  p_beneficiary_id uuid,
  p_amount numeric,
  p_description text DEFAULT ''
)
RETURNS TABLE(
  success boolean,
  message text,
  reference_number text,
  recipient_name text,
  recipient_email text,
  currency text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sender_balance numeric;
  v_sender_currency text;
  v_beneficiary record;
  v_ref text;
BEGIN
  v_ref := 'INT' || upper(to_hex(extract(epoch from now())::bigint)) || upper(substring(md5(random()::text) from 1 for 6));

  -- Use alias 'a' to avoid ambiguity with output column 'currency'
  SELECT a.balance, a.currency INTO v_sender_balance, v_sender_currency
  FROM public.accounts a 
  WHERE a.id = p_from_account_id 
    AND a.user_id = p_sender_user_id 
    AND a.is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Sender account not found or inactive'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  IF v_sender_balance < p_amount THEN
    RETURN QUERY SELECT false, 'Insufficient balance'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  -- Use alias 'b' for clarity
  SELECT b.name, b.bank_name, b.account_number INTO v_beneficiary
  FROM public.beneficiaries b 
  WHERE b.id = p_beneficiary_id 
    AND b.user_id = p_sender_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Beneficiary not found'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  -- Perform the transfer
  UPDATE public.accounts SET balance = balance - p_amount WHERE id = p_from_account_id;

  -- Record transaction
  INSERT INTO public.transactions (account_id, type, amount, currency, description, reference_number, recipient_name, recipient_account, status)
  VALUES (p_from_account_id, 'transfer_out', p_amount, v_sender_currency, p_description, v_ref, v_beneficiary.name, v_beneficiary.account_number, 'completed');

  -- Create notification
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (p_sender_user_id, 'International Transfer Sent', 'You sent ' || coalesce(v_sender_currency, '$') || ' ' || p_amount || ' to ' || v_beneficiary.name, 'transfer');

  -- Return results
  RETURN QUERY SELECT 
    true, 
    'International transfer completed successfully'::text, 
    v_ref, 
    v_beneficiary.name::text, 
    ''::text, 
    coalesce(v_sender_currency, 'USD')::text;
END;
$$;

-- Ensure permissions are set correctly
GRANT EXECUTE ON FUNCTION public.internal_transfer TO authenticated;
GRANT EXECUTE ON FUNCTION public.international_transfer TO authenticated;
