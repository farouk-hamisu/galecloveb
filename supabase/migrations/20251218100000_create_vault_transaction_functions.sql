CREATE OR REPLACE FUNCTION public.deposit_to_vault(p_vault_id UUID, p_amount DECIMAL, p_from_account_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  from_account_balance DECIMAL;
  vault_current_balance DECIMAL;
BEGIN
  -- Check for sufficient funds in the source account
  SELECT balance INTO from_account_balance FROM public.accounts WHERE id = p_from_account_id AND user_id = p_user_id;
  IF from_account_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds in source account';
  END IF;

  -- Debit source account
  UPDATE public.accounts SET balance = balance - p_amount WHERE id = p_from_account_id;

  -- Credit savings vault
  UPDATE public.savings_vaults SET current_balance = current_balance + p_amount WHERE id = p_vault_id;

  -- Record transaction for source account
  INSERT INTO public.transactions(account_id, type, amount, description, reference_number)
  VALUES (p_from_account_id, 'transfer_out', -p_amount, 'Deposit to savings vault', gen_random_uuid());

  -- Record transaction for savings vault (optional, depending on how you want to track this)
  -- For simplicity, we'll only record one transaction from the main account.
  
END;
$$;

CREATE OR REPLACE FUNCTION public.withdraw_from_vault(p_vault_id UUID, p_amount DECIMAL, p_to_account_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  vault public.savings_vaults;
BEGIN
  -- Check if vault exists and belongs to the user
  SELECT * INTO vault FROM public.savings_vaults WHERE id = p_vault_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Savings vault not found';
  END IF;

  -- Check if vault is locked
  IF vault.is_locked AND (vault.maturity_date IS NULL OR vault.maturity_date > NOW()) THEN
    RAISE EXCEPTION 'Savings vault is locked';
  END IF;

  -- Check for sufficient funds in the vault
  IF vault.current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds in savings vault';
  END IF;

  -- Debit savings vault
  UPDATE public.savings_vaults SET current_balance = current_balance - p_amount WHERE id = p_vault_id;

  -- Credit destination account
  UPDATE public.accounts SET balance = balance + p_amount WHERE id = p_to_account_id;

  -- Record transaction for destination account
  INSERT INTO public.transactions(account_id, type, amount, description, reference_number)
  VALUES (p_to_account_id, 'transfer_in', p_amount, 'Withdrawal from savings vault', gen_random_uuid());
END;
$$;
