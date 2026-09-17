-- ==============================================================================
-- Creed Perfumes Algeria - Supabase Database Schema & Setup
-- Dedicated exclusively to the Algerian Market (COD / DZD)
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE order_status_type AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned');
EXCEPTION
    WHEN duplicate_object THEN
        BEGIN
            ALTER TYPE order_status_type ADD VALUE IF NOT EXISTS 'returned';
        EXCEPTION
            WHEN OTHERS THEN null;
        END;
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
    stock_deducted BOOLEAN DEFAULT false,
    tracking_number TEXT,
    delivery_provider TEXT,
    delivery_tracking_url TEXT,
    shipping_label_url TEXT,
    delivery_status_raw TEXT,
    last_delivery_sync TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Automatic Column Migrations for Existing Databases
DO $$ BEGIN
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN DEFAULT false;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_provider TEXT;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_tracking_url TEXT;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_label_url TEXT;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_status_raw TEXT;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS last_delivery_sync TIMESTAMPTZ;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- 5. Admin Settings Table (Carrier API tokens, etc. - authenticated admin only)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

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
    USING (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

-- Products Policies
CREATE POLICY "Public read products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Admin manage products"
    ON public.products FOR ALL
    TO authenticated
    USING (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

-- Orders Policies (Customers can create orders without login; Admin can read and update all)
CREATE POLICY "Public create orders"
    ON public.orders FOR INSERT
    WITH CHECK (
        char_length(customer_name) BETWEEN 2 AND 120 AND
        char_length(phone) BETWEEN 8 AND 30 AND
        char_length(address) BETWEEN 2 AND 500 AND
        jsonb_typeof(items) = 'array' AND
        jsonb_array_length(items) BETWEEN 1 AND 50 AND
        total_price >= 0 AND delivery_fee >= 0
    );

CREATE POLICY "Admin manage orders"
    ON public.orders FOR ALL
    TO authenticated
    USING (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

-- Admin Settings Policies
CREATE POLICY "Allow admin all on settings"
    ON public.admin_settings FOR ALL
    TO authenticated
    USING (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

-- 7. Functions & Triggers

-- Trigger: Verify & Recalculate Order Total (Prevents client-side price tampering)
-- Also enforces phone-based throttle (1d) and generates unique order numbers (2d)
CREATE OR REPLACE FUNCTION public.verify_and_recalc_order_total()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    item_record jsonb;
    calculated_subtotal NUMERIC(12, 2) := 0;
    item_price NUMERIC(12, 2);
    item_qty INT;
    v_recent_count INT;
BEGIN
    IF jsonb_typeof(NEW.items) != 'array' OR jsonb_array_length(NEW.items) < 1 THEN
        RAISE EXCEPTION 'Order must contain at least one item.';
    END IF;

    FOR item_record IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
        item_price := (item_record->>'price')::NUMERIC;
        item_qty := (item_record->>'qty')::INT;
        IF item_price < 0 OR item_qty <= 0 THEN
            RAISE EXCEPTION 'Invalid item price or quantity in order.';
        END IF;
        calculated_subtotal := calculated_subtotal + (item_price * item_qty);
    END LOOP;

    IF NEW.delivery_fee IS NULL OR NEW.delivery_fee < 0 THEN
        NEW.delivery_fee := 600;
    END IF;

    -- Enforce total_price server-side
    NEW.total_price := calculated_subtotal + NEW.delivery_fee;

    -- (1d) Phone-based throttle: reject if same phone ordered within last 2 minutes
    SELECT count(*) INTO v_recent_count
    FROM public.orders
    WHERE phone = NEW.phone
      AND created_at > (now() - interval '2 minutes');
    IF v_recent_count > 0 THEN
        RAISE EXCEPTION 'تم تسجيل طلبية من هذا الرقم مؤخراً. يرجى الانتظار دقيقتين.';
    END IF;

    -- (2d) Generate collision-free order number from Postgres sequence
    NEW.order_number := 'DZ-' || nextval('creed_order_seq')::text;

    RETURN NEW;
END;
$$;

-- Sequence for unique order numbers (starts at 10000 to keep the 5-digit pattern)
CREATE SEQUENCE IF NOT EXISTS creed_order_seq START WITH 10000 INCREMENT BY 1;

DROP TRIGGER IF EXISTS trg_verify_order_total ON public.orders;
CREATE TRIGGER trg_verify_order_total
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.verify_and_recalc_order_total();

-- RPC: Scoped Order Tracking (Publicly callable, but strictly returns only matching order rows)
CREATE OR REPLACE FUNCTION public.track_orders(lookup_query text)
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    clean_q text;
    clean_no_zero text;
    clean_with_zero text;
BEGIN
    clean_q := regexp_replace(trim(lookup_query), '[\s\-\+\(\)]', '', 'g');
    IF clean_q = '' THEN
        RETURN;
    END IF;

    IF clean_q LIKE '213%' THEN
        clean_no_zero := substr(clean_q, 4);
        clean_with_zero := '0' || clean_no_zero;
    ELSIF clean_q LIKE '0%' THEN
        clean_with_zero := clean_q;
        clean_no_zero := substr(clean_q, 2);
    ELSE
        clean_no_zero := clean_q;
        clean_with_zero := '0' || clean_q;
    END IF;

    RETURN QUERY
    SELECT * FROM public.orders
    WHERE 
        lower(order_number) = lower(trim(lookup_query))
        OR regexp_replace(phone, '[\s\-\+\(\)]', '', 'g') IN (clean_q, clean_no_zero, clean_with_zero)
        OR (phone_secondary IS NOT NULL AND regexp_replace(phone_secondary, '[\s\-\+\(\)]', '', 'g') IN (clean_q, clean_no_zero, clean_with_zero))
    ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_orders(text) TO anon, authenticated;

-- RPC: Atomic Product Stock Adjustment
CREATE OR REPLACE FUNCTION public.adjust_product_stock(p_product_id text, p_delta int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_stock int;
BEGIN
    UPDATE public.products
    SET stock = GREATEST(0, stock + p_delta)
    WHERE id = p_product_id OR slug = p_product_id
    RETURNING stock INTO v_new_stock;
    RETURN COALESCE(v_new_stock, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.adjust_product_stock(text, int) TO anon, authenticated;

-- RPC: Update Order Status from Telegram Bot (Authorized via Secret)
-- The secret is stored via: ALTER DATABASE postgres SET app.telegram_bot_secret = 'your-secret-here';
-- This must match the TELEGRAM_BOT_SECRET env var in the Netlify function.
CREATE OR REPLACE FUNCTION public.update_order_status_via_bot(
    p_order_id text,
    p_status order_status_type,
    p_secret text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order public.orders%ROWTYPE;
    v_stored_secret text;
BEGIN
    -- Retrieve the real secret stored in the database configuration
    v_stored_secret := current_setting('app.telegram_bot_secret', true);

    -- Reject if no secret is configured or if it doesn't match
    IF v_stored_secret IS NULL OR v_stored_secret = '' THEN
        RAISE EXCEPTION 'Server misconfiguration: app.telegram_bot_secret is not set';
    END IF;

    IF p_secret IS DISTINCT FROM v_stored_secret THEN
        RAISE EXCEPTION 'Unauthorized: invalid bot secret';
    END IF;

    UPDATE public.orders
    SET 
        status = p_status,
        stock_deducted = CASE 
            WHEN p_status IN ('confirmed', 'shipped', 'delivered') THEN true
            WHEN p_status IN ('cancelled', 'returned') THEN false
            ELSE stock_deducted
        END
    WHERE id = p_order_id OR order_number = p_order_id
    RETURNING * INTO v_order;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'order_number', v_order.order_number, 
        'status', v_order.status
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_order_status_via_bot(text, order_status_type, text) TO anon, authenticated;

-- 8. Storage Bucket for Perfume Images
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
    USING (bucket_id = 'perfume-images' AND auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK (bucket_id = 'perfume-images' AND auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

-- 9. Seed Initial Categories
INSERT INTO public.categories (id, name, slug, icon) VALUES
('cat-all', 'جميع التشكيلات', 'all', 'auto_awesome'),
('cat-men', 'عطور رجالية', 'men', 'man'),
('cat-women', 'عطور نسائية', 'women', 'woman'),
('cat-unisex', 'للجنسين (Unisex)', 'unisex', 'group'),
('cat-exclusive', 'إصدارات نادرة وحصرية', 'exclusive', 'diamond')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- 10. Seed Initial Iconic Creed Perfumes
-- TODO: The product images below are prototype placeholder URLs (lh3.googleusercontent.com).
-- They need to be re-uploaded as real product photos through the admin panel's existing
-- image upload flow, which stores them in the 'perfume-images' Supabase Storage bucket.
INSERT INTO public.products (
    id, name, slug, description, price, discount_price, images, category_id, category_name, brand, stock, is_featured, concentration, size, fragrance_notes
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
    215,
    '{"top": ["برغموت كالابريا", "يوسفي منعش", "نيرولي"], "heart": ["شاي أخضر نقي", "كشمش أسود جبلي", "أوزون متجمد"], "base": ["مسك ناصع", "خشب الصندل", "بيتي غران", "صمغ راتينجي"]}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 11. Stock Notifications ("Notify me when back in stock")
CREATE TABLE IF NOT EXISTS public.stock_notifications (
    id TEXT PRIMARY KEY DEFAULT ('notif-' || gen_random_uuid()),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert stock notifications" ON public.stock_notifications;
CREATE POLICY "Allow public insert stock notifications"
    ON public.stock_notifications FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage stock notifications" ON public.stock_notifications;
CREATE POLICY "Admin manage stock notifications"
    ON public.stock_notifications FOR ALL
    TO authenticated
    USING (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

