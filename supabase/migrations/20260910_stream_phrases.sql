-- ============================================================================
-- QR LOVE: Admin Stream Phrases & Categories Migration
-- Safe, Idempotent, Non-destructive Migration
-- ============================================================================

-- 1. Create table stream_phrase_categories
CREATE TABLE IF NOT EXISTS public.stream_phrase_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create table stream_phrases
CREATE TABLE IF NOT EXISTS public.stream_phrases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.stream_phrase_categories(id) ON DELETE CASCADE,
    content VARCHAR(80) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Add stream_phrase_category_id to gifts table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'gifts'
          AND column_name = 'stream_phrase_category_id'
    ) THEN
        ALTER TABLE public.gifts
        ADD COLUMN stream_phrase_category_id UUID REFERENCES public.stream_phrase_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.stream_phrase_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_phrases ENABLE ROW LEVEL SECURITY;

-- 5. Public SELECT policies (Only active categories/phrases can be read publicly)
DROP POLICY IF EXISTS "Public can view active phrase categories" ON public.stream_phrase_categories;
CREATE POLICY "Public can view active phrase categories"
ON public.stream_phrase_categories
FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active phrases" ON public.stream_phrases;
CREATE POLICY "Public can view active phrases"
ON public.stream_phrases
FOR SELECT
USING (is_active = true);

-- 6. Helper Function: public.is_admin()
-- Created BEFORE admin policies to prevent error 42883
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    );
$$;

-- 7. Grant execution permissions on public.is_admin()
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 8. Admin Policies (Full CRUD for authenticated users with role = 'admin')
DROP POLICY IF EXISTS "Admin full access stream_phrase_categories" ON public.stream_phrase_categories;
CREATE POLICY "Admin full access stream_phrase_categories"
ON public.stream_phrase_categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access stream_phrases" ON public.stream_phrases;
CREATE POLICY "Admin full access stream_phrases"
ON public.stream_phrases
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 9. Clean up any historical duplicates if present before creating unique index
DELETE FROM public.stream_phrases a
USING public.stream_phrases b
WHERE a.id > b.id
  AND a.category_id = b.category_id
  AND a.content = b.content;

-- 10. Unique index to guarantee idempotency and prevent duplicate phrases per category
CREATE UNIQUE INDEX IF NOT EXISTS stream_phrases_category_content_unique
ON public.stream_phrases (category_id, content);

-- 11. Seed Categories (idempotent via ON CONFLICT (slug) DO UPDATE / DO NOTHING)
INSERT INTO public.stream_phrase_categories (id, name, slug, description, sort_order)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Yêu thương', 'yeu-thuong', 'Những câu nhắn gửi tình yêu ngọt ngào, lãng mạn', 1),
    ('a2222222-2222-2222-2222-222222222222', 'Cổ vũ', 'co-vu', 'Những lời cổ vũ tinh thần, tiếp thêm niềm tin và năng lượng', 2),
    ('a3333333-3333-3333-3333-333333333333', 'Động viên', 'dong-vien', 'Những lời động viên chân thành, sát cánh vượt qua khó khăn', 3),
    ('a4444444-4444-4444-4444-444444444444', 'Chữa lành', 'chua-lanh', 'Những câu vỗ về dịu dàng, xoa dịu tâm hồn và mang lại bình yên', 4)
ON CONFLICT (slug) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

-- 12. Seed Phrases (idempotent via ON CONFLICT (category_id, content) DO NOTHING)

-- Seed Phrases: Yêu thương
INSERT INTO public.stream_phrases (category_id, content, sort_order)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Anh yêu em', 1),
    ('a1111111-1111-1111-1111-111111111111', 'Thương em nhiều lắm', 2),
    ('a1111111-1111-1111-1111-111111111111', 'Có em là đủ', 3),
    ('a1111111-1111-1111-1111-111111111111', 'Mãi bên nhau nhé', 4),
    ('a1111111-1111-1111-1111-111111111111', 'Luôn nhớ đến em', 5),
    ('a1111111-1111-1111-1111-111111111111', 'Ở bên anh nhé', 6),
    ('a1111111-1111-1111-1111-111111111111', 'Anh luôn thương em', 7),
    ('a1111111-1111-1111-1111-111111111111', 'Em thật đặc biệt', 8)
ON CONFLICT (category_id, content) DO NOTHING;

-- Seed Phrases: Cổ vũ
INSERT INTO public.stream_phrases (category_id, content, sort_order)
VALUES
    ('a2222222-2222-2222-2222-222222222222', 'Cố lên nhé', 1),
    ('a2222222-2222-2222-2222-222222222222', 'Em làm được mà', 2),
    ('a2222222-2222-2222-2222-222222222222', 'Đừng bỏ cuộc nha', 3),
    ('a2222222-2222-2222-2222-222222222222', 'Luôn tin vào em', 4),
    ('a2222222-2222-2222-2222-222222222222', 'Tự hào về em', 5),
    ('a2222222-2222-2222-2222-222222222222', 'Cố thêm một chút nhé', 6),
    ('a2222222-2222-2222-2222-222222222222', 'Em giỏi lắm', 7),
    ('a2222222-2222-2222-2222-222222222222', 'Ngày mai sẽ tốt hơn', 8)
ON CONFLICT (category_id, content) DO NOTHING;

-- Seed Phrases: Động viên
INSERT INTO public.stream_phrases (category_id, content, sort_order)
VALUES
    ('a3333333-3333-3333-3333-333333333333', 'Anh luôn ở đây', 1),
    ('a3333333-3333-3333-3333-333333333333', 'Mọi chuyện rồi sẽ ổn', 2),
    ('a3333333-3333-3333-3333-333333333333', 'Nghỉ một chút cũng được', 3),
    ('a3333333-3333-3333-3333-333333333333', 'Em đã làm rất tốt rồi', 4),
    ('a3333333-3333-3333-3333-333333333333', 'Đừng tự áp lực nhé', 5),
    ('a3333333-3333-3333-3333-333333333333', 'Mỉm cười lên nha', 6),
    ('a3333333-3333-3333-3333-333333333333', 'Hãy tin vào chính mình', 7),
    ('a3333333-3333-3333-3333-333333333333', 'Bình yên rồi sẽ đến', 8)
ON CONFLICT (category_id, content) DO NOTHING;

-- Seed Phrases: Chữa lành
INSERT INTO public.stream_phrases (category_id, content, sort_order)
VALUES
    ('a4444444-4444-4444-4444-444444444444', 'Không sao đâu', 1),
    ('a4444444-4444-4444-4444-444444444444', 'Chậm lại một chút nhé', 2),
    ('a4444444-4444-4444-4444-444444444444', 'Hãy thương lấy mình', 3),
    ('a4444444-4444-4444-4444-444444444444', 'Mọi chuyện sẽ qua thôi', 4),
    ('a4444444-4444-4444-4444-444444444444', 'Em xứng đáng được vui', 5),
    ('a4444444-4444-4444-4444-444444444444', 'Hôm nay nghỉ ngơi nhé', 6),
    ('a4444444-4444-4444-4444-444444444444', 'Luôn có người thương em', 7),
    ('a4444444-4444-4444-4444-444444444444', 'Ngày mới sẽ dịu dàng hơn', 8)
ON CONFLICT (category_id, content) DO NOTHING;

