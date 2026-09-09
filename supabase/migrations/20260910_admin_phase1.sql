-- Migration: Phase 1 Admin Management & RBAC for QR Love

-- 1. Create profiles table linked to Supabase Auth auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Add status column to gifts table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'gifts' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.gifts 
      ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'hidden'));
  END IF;
END $$;

-- 3. Ensure existing gifts have status = 'active'
UPDATE public.gifts SET status = 'active' WHERE status IS NULL OR status = '';

-- 4. Automatically create a profile entry whenever a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email, updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RLS Policies
-- Profiles: Authenticated users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Gifts: Public can ONLY read gifts with status = 'active'
DROP POLICY IF EXISTS "Public can view active gifts" ON public.gifts;
CREATE POLICY "Public can view active gifts"
  ON public.gifts FOR SELECT
  TO anon, authenticated
  USING (status = 'active');
