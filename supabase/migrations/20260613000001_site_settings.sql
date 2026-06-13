-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    site_name TEXT NOT NULL DEFAULT 'Galecloveb',
    phone_number TEXT NOT NULL DEFAULT '+1 (808) 206-5163',
    address TEXT NOT NULL DEFAULT 'Tampa, Florida',
    support_email TEXT NOT NULL DEFAULT 'support@galecloveb.com',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT one_row_only CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.site_settings
    FOR SELECT USING (true);

-- Allow admin update access
CREATE POLICY "Allow admin update access" ON public.site_settings
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Insert initial settings
INSERT INTO public.site_settings (id, site_name, phone_number, address, support_email)
VALUES (1, 'Galecloveb', '+1 (808) 206-5163', 'Tampa, Florida', 'support@galecloveb.com')
ON CONFLICT (id) DO UPDATE SET
    site_name = EXCLUDED.site_name,
    phone_number = EXCLUDED.phone_number,
    address = EXCLUDED.address,
    support_email = EXCLUDED.support_email;
