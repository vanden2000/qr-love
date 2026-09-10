-- ============================================================================
-- QR LOVE: Default Active & 24h Auto Draft Migration
-- Safe, Idempotent, Non-destructive Migration
-- ============================================================================

-- 1. Change default value of status column in gifts table to 'active'
ALTER TABLE public.gifts
ALTER COLUMN status SET DEFAULT 'active';

-- 2. Create function to automatically transition 24h expired active gifts to draft
CREATE OR REPLACE FUNCTION public.expire_active_gifts_24h()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE public.gifts
    SET status = 'draft',
        updated_at = now()
    WHERE status = 'active'
      AND created_at < (now() - interval '24 hours');
      
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$;

-- 3. Grant execute permission
REVOKE ALL ON FUNCTION public.expire_active_gifts_24h() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_active_gifts_24h() TO authenticated, service_role;
