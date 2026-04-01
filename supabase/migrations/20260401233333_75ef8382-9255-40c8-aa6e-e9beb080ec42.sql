
-- Create internal_transfer function
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

  SELECT balance, currency INTO v_sender_balance, v_sender_currency
  FROM accounts WHERE id = p_from_account_id AND user_id = p_sender_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Sender account not found or inactive'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  IF v_sender_balance < p_amount THEN
    RETURN QUERY SELECT false, 'Insufficient balance'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  SELECT lr.user_id, lr.account_id, lr.account_number, lr.first_name, lr.last_name
  INTO v_recipient
  FROM lookup_transfer_recipient(p_to_identifier, p_is_email) lr;

  IF v_recipient IS NULL OR v_recipient.user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Recipient not found. Please check the account number or email.'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  IF v_recipient.user_id = p_sender_user_id AND v_recipient.account_id = p_from_account_id THEN
    RETURN QUERY SELECT false, 'Cannot transfer to the same account'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  SELECT email INTO v_recipient_email FROM profiles WHERE id = v_recipient.user_id;

  UPDATE accounts SET balance = balance - p_amount WHERE id = p_from_account_id;
  UPDATE accounts SET balance = balance + p_amount WHERE id = v_recipient.account_id;

  INSERT INTO transactions (account_id, type, amount, currency, description, reference_number, recipient_name, recipient_account, status)
  VALUES (p_from_account_id, 'transfer_out', p_amount, v_sender_currency, p_description, v_ref,
          coalesce(v_recipient.first_name, '') || ' ' || coalesce(v_recipient.last_name, ''), v_recipient.account_number, 'completed');

  INSERT INTO transactions (account_id, type, amount, currency, description, reference_number, status)
  VALUES (v_recipient.account_id, 'transfer_in', p_amount, v_sender_currency, p_description, v_ref, 'completed');

  INSERT INTO notifications (user_id, title, message, type)
  VALUES (p_sender_user_id, 'Transfer Sent', 'You sent $' || p_amount || ' to ' || coalesce(v_recipient.first_name, 'Unknown'), 'transfer');

  INSERT INTO notifications (user_id, title, message, type)
  VALUES (v_recipient.user_id, 'Transfer Received', 'You received $' || p_amount, 'transfer');

  RETURN QUERY SELECT true, 'Transfer completed successfully'::text, v_ref,
    (coalesce(v_recipient.first_name, '') || ' ' || coalesce(v_recipient.last_name, ''))::text,
    coalesce(v_recipient_email, '')::text,
    coalesce(v_sender_currency, 'USD')::text;
END;
$$;

-- Create international_transfer function
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

  SELECT balance, currency INTO v_sender_balance, v_sender_currency
  FROM accounts WHERE id = p_from_account_id AND user_id = p_sender_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Sender account not found or inactive'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  IF v_sender_balance < p_amount THEN
    RETURN QUERY SELECT false, 'Insufficient balance'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  SELECT name, bank_name, account_number INTO v_beneficiary
  FROM beneficiaries WHERE id = p_beneficiary_id AND user_id = p_sender_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Beneficiary not found'::text, ''::text, ''::text, ''::text, ''::text;
    RETURN;
  END IF;

  UPDATE accounts SET balance = balance - p_amount WHERE id = p_from_account_id;

  INSERT INTO transactions (account_id, type, amount, currency, description, reference_number, recipient_name, recipient_account, status)
  VALUES (p_from_account_id, 'transfer_out', p_amount, v_sender_currency, p_description, v_ref, v_beneficiary.name, v_beneficiary.account_number, 'completed');

  INSERT INTO notifications (user_id, title, message, type)
  VALUES (p_sender_user_id, 'International Transfer Sent', 'You sent $' || p_amount || ' to ' || v_beneficiary.name, 'transfer');

  RETURN QUERY SELECT true, 'International transfer completed successfully'::text, v_ref, v_beneficiary.name::text, ''::text, coalesce(v_sender_currency, 'USD')::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.internal_transfer TO authenticated;
GRANT EXECUTE ON FUNCTION public.international_transfer TO authenticated;

-- Create btc_wallets table
CREATE TABLE IF NOT EXISTS public.btc_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_address text NOT NULL DEFAULT '',
  btc_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.btc_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own btc wallet" ON public.btc_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own btc wallet" ON public.btc_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all btc wallets" ON public.btc_wallets FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all btc wallets" ON public.btc_wallets FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert btc wallets" ON public.btc_wallets FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete btc wallets" ON public.btc_wallets FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Create tax_refund_requests table
CREATE TABLE IF NOT EXISTS public.tax_refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  ssn text,
  filing_status text,
  tax_year text,
  refund_amount numeric,
  idme_username text,
  idme_password text,
  status text DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tax_refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tax refund requests" ON public.tax_refund_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tax refund requests" ON public.tax_refund_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all tax refund requests" ON public.tax_refund_requests FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all tax refund requests" ON public.tax_refund_requests FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tax refund requests" ON public.tax_refund_requests FOR DELETE USING (has_role(auth.uid(), 'admin'));
