-- ==============================================================================
-- Creed Perfumes Algeria - Supabase Database Schema & Setup
-- Dedicated exclusively to the Algerian Market (COD / DZD)
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE order_status_type AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || extract(epoch from now())::bigint),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || extract(epoch from now())::bigint),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT,
    brand TEXT DEFAULT 'Creed',
    stock INTEGER DEFAULT 10,
    is_featured BOOLEAN DEFAULT false,
    concentration TEXT DEFAULT 'Eau De Parfum',
    size TEXT DEFAULT '100ml',
    rating NUMERIC(3, 2) DEFAULT 4.9,
    review_count INTEGER DEFAULT 1,
    fragrance_notes JSONB DEFAULT '{"top": [], "heart": [], "base": []}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Orders Table (Cash on Delivery / COD only)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord-' || extract(epoch from now())::bigint),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_secondary TEXT,
    wilaya TEXT NOT NULL,
    wilaya_code TEXT NOT NULL,
    commune TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_price NUMERIC(12, 2) NOT NULL,
    delivery_fee NUMERIC(8, 2) NOT NULL DEFAULT 600,
    status order_status_type DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin all on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow full access on products" ON public.products;
DROP POLICY IF EXISTS "Allow admin all on products" ON public.products;
DROP POLICY IF EXISTS "Allow full access on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin all on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert order" ON public.orders;

-- Categories Policies
CREATE POLICY "Public read categories"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Admin manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'admin@creedperfumes.dz')
    WITH CHECK ((auth.jwt() ->> 'email') = 'admin@creedperfumes.dz');

-- Products Policies
CREATE POLICY "Public read products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Admin manage products"
    ON public.products FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'admin@creedperfumes.dz')
    WITH CHECK ((auth.jwt() ->> 'email') = 'admin@creedperfumes.dz');

-- Orders Policies (Customers can create orders without login; Admin can read and update all)
CREATE POLICY "Public create orders"
    ON public.orders FOR INSERT
    WITH CHECK (
      char_length(customer_name) BETWEEN 2 AND 120 AND
      char_length(phone) BETWEEN 8 AND 30 AND
      char_length(address) BETWEEN 5 AND 500 AND
      jsonb_typeof(items) = 'array' AND
      jsonb_array_length(items) BETWEEN 1 AND 50 AND
      total_price >= 0 AND delivery_fee >= 0
    );

CREATE POLICY "Admin manage orders"
    ON public.orders FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'admin@creedperfumes.dz')
    WITH CHECK ((auth.jwt() ->> 'email') = 'admin@creedperfumes.dz');

-- 6. Storage Bucket for Perfume Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('perfume-images', 'perfume-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public perfume images access" ON storage.objects;
DROP POLICY IF EXISTS "Admin perfume images upload" ON storage.objects;

CREATE POLICY "Public perfume images access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'perfume-images');

CREATE POLICY "Admin manage perfume images"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'perfume-images' AND (auth.jwt() ->> 'email') = 'admin@creedperfumes.dz')
    WITH CHECK (bucket_id = 'perfume-images' AND (auth.jwt() ->> 'email') = 'admin@creedperfumes.dz');

-- 7. Seed Initial Categories
INSERT INTO public.categories (id, name, slug, icon) VALUES
('cat-all', 'جميع التشكيلات', 'all', 'auto_awesome'),
('cat-men', 'عطور رجالية', 'men', 'man'),
('cat-women', 'عطور نسائية', 'women', 'woman'),
('cat-unisex', 'للجنسين (Unisex)', 'unisex', 'group'),
('cat-exclusive', 'إصدارات نادرة وحصرية', 'exclusive', 'diamond')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- 8. Seed Initial Iconic Creed Perfumes
INSERT INTO public.products (
    id, name, slug, description, price, discount_price, images, category_id, category_name, brand, stock, is_featured, concentration, size, rating, review_count, fragrance_notes
) VALUES
(
    'prod-creed-aventus',
    'Creed Aventus',
    'creed-aventus',
    'الأيقونة العالمية وأسطورة دار كريد. عطر يجسد القوة والنجاح والسيادة بتوليفة فاكهية مدخنة لا تُقاوم. يبدأ بانفجار منعش من الأناناس والبرغموت ليتدرج نحو عمق الباتشولي وخشب البتولا الأسطوري.',
    38500.00,
    32900.00,
    ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm'],
    'cat-men',
    'عطور رجالية',
    'Creed',
    18,
    true,
    'Eau De Parfum',
    '100ml',
    4.9,
    342,
    '{"top": ["أناناس ملكي", "برغموت إيطالي", "تفاح فرنسي", "كشمش أسود"], "heart": ["أخشاب البتولا المدخنة", "باتشولي نقي", "ياسمين مغربي", "توت العرعر"], "base": ["عنبر الحوت الفاخر", "طحلب السنديان", "فانيليا بوربون", "المسك الأبيض"]}'::jsonb
),
(
    'prod-silver-mountain-water',
    'Creed Silver Mountain Water',
    'creed-silver-mountain-water',
    'مستوحى من نقاء وبهاء جبال الألب السويسرية وتدفق المياه العذبة الكريستالية. عطر أوزوني نقي يبعث على الانتعاش الفوري والطاقة المتجددة بنفحات الشاي الأخضر والكشمش الأسود.',
    34000.00,
    29500.00,
    ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuDSYAKXh0F2qCnzNVpfgUTHDKTcV1dqXfpefwKj_mEGHyoBDjZasPFw7B6yZBBvvbuNskE3ETX8h0l4gu24-PfsaHqq2dAmmBw9xD38uEJPrXvV59TkVxziIXgb_NYHXF6UXbKY2SntLKBbPUH3jn35Etx9_M-vi4rshLlrBiSzm6BiSR62PgdOa_9Gfb13mjbPdllTl6zAW7vNFEVO3mfFbl-ohBvrZwHTkOMxT4onYDorVTzYxVbY'],
    'cat-unisex',
    'للجنسين (Unisex)',
    'Creed',
    12,
    true,
    'Eau De Parfum',
    '100ml',
    4.8,
    215,
    '{"top": ["برغموت كالابريا", "يوسفي منعش", "نيرولي"], "heart": ["شاي أخضر نقي", "كشمش أسود جبلي", "أوزون متجمد"], "base": ["مسك ناصع", "خشب الصندل", "بيتي غران", "صمغ راتينجي"]}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
