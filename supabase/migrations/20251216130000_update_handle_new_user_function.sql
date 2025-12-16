-- Update the function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Create default checking account
  INSERT INTO public.accounts (user_id, account_number, account_type, currency, balance)
  VALUES (
    NEW.id,
    'NRB' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0'),
    'checking',
    'USD',
    0.00
  );
  
  RETURN NEW;
END;
$$;
