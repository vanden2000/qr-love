-- ============================================================================
-- QR LOVE: Create gift_messages Table Migration
-- Safe, Idempotent, Non-destructive Migration
-- ============================================================================

-- 1. Create table gift_messages if not exists
CREATE TABLE IF NOT EXISTS public.gift_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_id UUID NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
    content VARCHAR(160) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create index for fast retrieval by gift_id
CREATE INDEX IF NOT EXISTS idx_gift_messages_gift_id
ON public.gift_messages(gift_id);

-- 3. Enable RLS
ALTER TABLE public.gift_messages ENABLE ROW LEVEL SECURITY;

-- 4. Public SELECT policy
DROP POLICY IF EXISTS "Public can view gift messages" ON public.gift_messages;
CREATE POLICY "Public can view gift messages"
ON public.gift_messages
FOR SELECT
USING (true);

-- 5. Admin full access policy
DROP POLICY IF EXISTS "Admin full access gift messages" ON public.gift_messages;
CREATE POLICY "Admin full access gift messages"
ON public.gift_messages
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
