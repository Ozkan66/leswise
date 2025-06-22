-- Add group type field to support klas/community classification
-- Part of Epic 2.4: Groups Management

-- Add type column to groups table
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'community' CHECK (type IN ('klas', 'community'));

-- Update existing groups to have a default type
UPDATE public.groups SET type = 'community' WHERE type IS NULL;