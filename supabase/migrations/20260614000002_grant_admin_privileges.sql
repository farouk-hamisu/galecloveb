-- Migration: Grant admin role to specific user
-- Description: Assigns the 'admin' role to admin@galecloveb.com in the user_roles table.

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 1. Get the user ID for the specified email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'admin@galecloveb.com';

    -- 2. If the user exists, assign the admin role
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role granted to admin@galecloveb.com';
    ELSE
        RAISE NOTICE 'User admin@galecloveb.com not found. Please ensure the user is registered first.';
    END IF;
END $$;
