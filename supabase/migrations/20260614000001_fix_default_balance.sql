-- Migration: Set default balance to 0.00 for new users
-- Description: Updates the handle_new_user function to ensure new accounts start with a 0.00 balance instead of 1000.00.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Create default checking account with 0.00 balance
  INSERT INTO public.accounts (user_id, account_number, account_type, currency, balance)
  VALUES (
    NEW.id,
    'GLB' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0'),
    'checking',
    'USD',
    0.00
  );

  -- Create default BTC wallet with placeholder address
  INSERT INTO public.btc_wallets (user_id, wallet_address, btc_balance)
  VALUES (
    NEW.id,
    'bc1q' || substr(md5(NEW.id::text || random()::text), 1, 38),
    0.00000000
  );
  
  RETURN NEW;
END;
$$;
