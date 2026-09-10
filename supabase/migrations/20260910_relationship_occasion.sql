-- =========================================================================
-- Migration: Add relationship_type, occasion_type, pronoun_type
-- Idempotent, safe for existing data
-- =========================================================================

-- 1. Add columns to gifts table if they do not exist
ALTER TABLE public.gifts 
ADD COLUMN IF NOT EXISTS relationship_type TEXT DEFAULT 'COUPLE',
ADD COLUMN IF NOT EXISTS occasion_type TEXT DEFAULT 'ANNIVERSARY',
ADD COLUMN IF NOT EXISTS pronoun_type TEXT DEFAULT 'HE_TO_SHE';

-- 2. Add columns to stream_phrase_categories for admin tagging
ALTER TABLE public.stream_phrase_categories
ADD COLUMN IF NOT EXISTS relationship_type TEXT DEFAULT 'COUPLE',
ADD COLUMN IF NOT EXISTS occasion_type TEXT DEFAULT 'ANNIVERSARY';

-- 3. Create index for fast filtering
CREATE INDEX IF NOT EXISTS idx_gifts_relationship_occasion 
ON public.gifts (relationship_type, occasion_type);

CREATE INDEX IF NOT EXISTS idx_categories_relationship_occasion 
ON public.stream_phrase_categories (relationship_type, occasion_type);
