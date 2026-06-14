-- Migration: Create email_otps and password_reset_tokens tables
-- Description: These tables support the OTP-based signup and password reset flows in the auth-backend.

-- 1. Create email_otps table
CREATE TABLE IF NOT EXISTS public.email_otps (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    purpose TEXT NOT NULL, -- e.g., 'signup'
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    consumed BOOLEAN DEFAULT false
);

-- 2. Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    consumed BOOLEAN DEFAULT false
);

-- 3. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON public.email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_user_id ON public.email_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);

-- 4. Enable Row Level Security (RLS)
-- These tables are managed by the service role via the auth-backend.
-- No public policies are added to keep tokens private.
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT ALL ON public.email_otps TO service_role;
GRANT ALL ON public.password_reset_tokens TO service_role;
GRANT ALL ON public.email_otps TO postgres;
GRANT ALL ON public.password_reset_tokens TO postgres;
