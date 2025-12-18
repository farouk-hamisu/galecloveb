-- Create savings_vaults table
CREATE TABLE public.savings_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_balance DECIMAL(15,2) DEFAULT 0.00,
  is_locked BOOLEAN DEFAULT false,
  maturity_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.savings_vaults ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own savings vaults" ON public.savings_vaults FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own savings vaults" ON public.savings_vaults FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savings vaults" ON public.savings_vaults FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own savings vaults" ON public.savings_vaults FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_savings_vaults_updated_at BEFORE UPDATE ON public.savings_vaults FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
