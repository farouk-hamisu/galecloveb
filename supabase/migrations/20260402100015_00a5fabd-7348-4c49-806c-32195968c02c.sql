
-- Add card_status column for approval-based virtual cards
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS card_status text NOT NULL DEFAULT 'pending';

-- Update existing cards to 'approved' status
UPDATE public.cards SET card_status = 'approved' WHERE card_status = 'pending';
