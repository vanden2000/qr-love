-- ============================================================================
-- QR LOVE: Audio Start Position (Audio Seek) Migration
-- Safe, Idempotent, Non-destructive Migration
-- ============================================================================

-- 1. Add audio_start_seconds column to gifts table if not exists
ALTER TABLE public.gifts
ADD COLUMN IF NOT EXISTS audio_start_seconds DOUBLE PRECISION NOT NULL DEFAULT 0;

-- 2. Add check constraint (audio_start_seconds >= 0) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gifts_audio_start_seconds_check'
  ) THEN
    ALTER TABLE public.gifts
    ADD CONSTRAINT gifts_audio_start_seconds_check CHECK (audio_start_seconds >= 0);
  END IF;
END $$;
