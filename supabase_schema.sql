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

-- Server-only idempotency gate for Telegram order notifications.
CREATE TABLE IF NOT EXISTS public.telegram_notified_orders (
    order_id TEXT PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
    notified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.telegram_notified_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.telegram_notified_orders FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.telegram_notified_orders TO service_role;
CREATE POLICY "Server manages notification receipts"
    ON public.telegram_notified_orders FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- Brute-force throttle for exact order-code + phone tracking lookups.
CREATE TABLE IF NOT EXISTS public.tracking_attempts (
    phone TEXT PRIMARY KEY,
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    attempt_count INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.tracking_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.tracking_attempts FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.tracking_attempts TO service_role;
CREATE POLICY "Server manages tracking attempts"
    ON public.tracking_attempts FOR ALL
    TO service_role USING (true) WITH CHECK (true);

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
REVOKE ALL ON TABLE public.admin_settings FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_settings TO authenticated, service_role;

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
    USING ((SELECT auth.uid()) = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK ((SELECT auth.uid()) = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

-- Products Policies
CREATE POLICY "Public read products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Admin manage products"
    ON public.products FOR ALL
    TO authenticated
    USING ((SELECT auth.uid()) = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK ((SELECT auth.uid()) = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

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
REVOKE ALL ON TABLE public.orders FROM PUBLIC, anon;
GRANT INSERT ON TABLE public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated, service_role;

CREATE POLICY "Admin manage orders"
    ON public.orders FOR ALL
    TO authenticated
    USING ((SELECT auth.uid()) = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK ((SELECT auth.uid()) = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

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
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    item_record jsonb;
    verified_items jsonb := '[]'::jsonb;
    calculated_subtotal NUMERIC(12, 2) := 0;
    item_price NUMERIC(12, 2);
    item_qty INT;
    v_recent_count INT;
    v_product_id TEXT;
    v_product_name TEXT;
    v_stock INT;
    v_bundle_product_ids jsonb;
    v_bundle_price NUMERIC(12, 2);
    v_bundle_discount NUMERIC(12, 2);
    v_coupon RECORD;
    v_disc NUMERIC(12, 2) := 0;
    v_child_id TEXT;
BEGIN
    IF jsonb_typeof(NEW.items) IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.items) NOT BETWEEN 1 AND 50 THEN
        RAISE EXCEPTION 'Order must contain at least one item.';
    END IF;

    FOR item_record IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
        item_qty := (item_record->>'qty')::INT;
        v_product_id := item_record->>'product_id';
        IF item_qty IS NULL OR item_qty NOT BETWEEN 1 AND 20 OR v_product_id IS NULL THEN
            RAISE EXCEPTION 'Invalid product or quantity.';
        END IF;

        IF coalesce((item_record->>'is_bundle')::boolean, false) THEN
            SELECT b.price, b.discount_price, b.name, b.product_ids
              INTO v_bundle_price, v_bundle_discount, v_product_name, v_bundle_product_ids
              FROM public.bundles AS b
             WHERE b.id = v_product_id AND b.is_active = true
             FOR SHARE;
            IF NOT FOUND THEN RAISE EXCEPTION 'This bundle is unavailable.'; END IF;
            item_price := coalesce(v_bundle_discount, v_bundle_price);
            IF jsonb_typeof(v_bundle_product_ids) IS DISTINCT FROM 'array' OR jsonb_array_length(v_bundle_product_ids) = 0 THEN
                RAISE EXCEPTION 'This bundle has no available products.';
            END IF;
            FOR v_child_id IN SELECT jsonb_array_elements_text(v_bundle_product_ids) LOOP
                SELECT p.stock INTO v_stock FROM public.products AS p WHERE p.id = v_child_id FOR SHARE;
                IF NOT FOUND OR v_stock < item_qty THEN RAISE EXCEPTION 'A product in this bundle is out of stock.'; END IF;
            END LOOP;
            item_record := jsonb_set(item_record, '{bundle_product_ids}', v_bundle_product_ids, true);
        ELSE
            SELECT coalesce(p.discount_price, p.price), p.name, p.stock
              INTO item_price, v_product_name, v_stock
              FROM public.products AS p
             WHERE p.id = v_product_id
             FOR SHARE;
            IF NOT FOUND THEN RAISE EXCEPTION 'This product is unavailable.'; END IF;
            IF v_stock < item_qty THEN RAISE EXCEPTION 'This product is out of stock.'; END IF;
        END IF;

        IF item_price IS NULL OR item_price < 0 THEN RAISE EXCEPTION 'Invalid product price.'; END IF;
        item_record := jsonb_set(item_record, '{price}', to_jsonb(item_price), true);
        item_record := jsonb_set(item_record, '{name}', to_jsonb(v_product_name), true);
        verified_items := verified_items || jsonb_build_array(item_record);
        calculated_subtotal := calculated_subtotal + (item_price * item_qty);
    END LOOP;
    NEW.items := verified_items;

    IF NEW.delivery_fee IS NULL OR NEW.delivery_fee < 0 THEN
        NEW.delivery_fee := 600;
    END IF;

    -- (4c) If coupon applied, validate and apply discount server-side
    IF NEW.coupon_code IS NOT NULL AND TRIM(NEW.coupon_code) != '' THEN
        SELECT * INTO v_coupon FROM public.coupons
         WHERE upper(code) = upper(trim(NEW.coupon_code))
         FOR UPDATE;
        IF NOT FOUND OR NOT v_coupon.is_active
           OR (v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at <= now())
           OR (v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses)
           OR calculated_subtotal < coalesce(v_coupon.min_order_amount, 0) THEN
            RAISE EXCEPTION 'Coupon is invalid or no longer available.';
        END IF;
        IF v_coupon.discount_type = 'percentage' THEN
            v_disc := round(calculated_subtotal * v_coupon.discount_value / 100, 2);
        ELSE
            v_disc := least(calculated_subtotal, v_coupon.discount_value);
        END IF;
        NEW.discount_amount := v_disc;
        calculated_subtotal := greatest(0, calculated_subtotal - v_disc);
        UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;
    ELSE
        NEW.discount_amount := 0;
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

    -- Keep the random checkout code; fall back to the sequence for trusted imports.
    IF NEW.order_number IS NULL OR NEW.order_number !~ '^DZ-[A-F0-9]{8}$' THEN
        NEW.order_number := 'DZ-' || nextval('creed_order_seq')::text;
    END IF;

    IF EXISTS (SELECT 1 FROM public.blocked_phones b WHERE regexp_replace(b.phone, '[^0-9]', '', 'g') = regexp_replace(NEW.phone, '[^0-9]', '', 'g')) THEN
        RAISE EXCEPTION 'This phone number cannot place an order.';
    END IF;

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
REVOKE ALL ON FUNCTION public.verify_and_recalc_order_total() FROM PUBLIC, anon, authenticated;

-- Public order tracking requires both the exact order number and the phone
-- used at checkout. Return only the fields required by the tracking screen.
DROP FUNCTION IF EXISTS public.track_orders(text);
CREATE OR REPLACE FUNCTION public.track_order_with_phone(p_order_number text, p_phone text)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    clean_phone text;
    normalized_phone text;
    clean_order_number text;
    matched_order public.orders%ROWTYPE;
    v_window_started_at timestamptz;
    v_attempt_count integer;
BEGIN
    clean_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
    clean_order_number := upper(regexp_replace(coalesce(p_order_number, ''), '[\s-]', '', 'g'));
    IF clean_phone = '' OR clean_order_number !~ '^DZ[A-F0-9]{8}$' THEN
        RETURN;
    END IF;

    IF clean_phone LIKE '213%' THEN
        normalized_phone := '0' || substr(clean_phone, 4);
    ELSIF clean_phone LIKE '0%' THEN
        normalized_phone := clean_phone;
    ELSE
        normalized_phone := '0' || clean_phone;
    END IF;

    IF normalized_phone !~ '^0[567][0-9]{8}$' THEN RETURN; END IF;

    INSERT INTO public.tracking_attempts (phone, window_started_at, attempt_count)
    VALUES (normalized_phone, now(), 1)
    ON CONFLICT (phone) DO UPDATE
      SET window_started_at = CASE
            WHEN public.tracking_attempts.window_started_at <= now() - interval '15 minutes' THEN now()
            ELSE public.tracking_attempts.window_started_at END,
          attempt_count = CASE
            WHEN public.tracking_attempts.window_started_at <= now() - interval '15 minutes' THEN 1
            ELSE public.tracking_attempts.attempt_count + 1 END
    RETURNING window_started_at, attempt_count INTO v_window_started_at, v_attempt_count;
    IF v_attempt_count > 8 THEN RAISE EXCEPTION 'Too many tracking attempts. Try again later.'; END IF;

    SELECT o.* INTO matched_order
    FROM public.orders AS o
    WHERE upper(regexp_replace(o.order_number, '[\s-]', '', 'g')) = clean_order_number
      AND regexp_replace(coalesce(o.phone, ''), '[^0-9]', '', 'g') IN (clean_phone, normalized_phone)
    LIMIT 1;

    IF FOUND THEN
        RETURN NEXT jsonb_build_object(
            'id', matched_order.id,
            'order_number', matched_order.order_number,
            'status', matched_order.status,
            'created_at', matched_order.created_at,
            'wilaya', matched_order.wilaya,
            'commune', matched_order.commune,
            'items', matched_order.items,
            'total_price', matched_order.total_price,
            'delivery_fee', matched_order.delivery_fee,
            'tracking_number', matched_order.tracking_number,
            'delivery_provider', matched_order.delivery_provider,
            'delivery_tracking_url', matched_order.delivery_tracking_url,
            'delivery_status_raw', matched_order.delivery_status_raw
        );
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.track_order_with_phone(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order_with_phone(text, text) TO anon, authenticated;

-- RPC: Atomic Product Stock Adjustment
CREATE OR REPLACE FUNCTION public.adjust_product_stock(p_product_id text, p_delta int)
RETURNS int
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_new_stock int;
BEGIN
    IF (SELECT auth.uid()) IS DISTINCT FROM '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    UPDATE public.products
    SET stock = GREATEST(0, stock + p_delta)
    WHERE id = p_product_id OR slug = p_product_id
    RETURNING stock INTO v_new_stock;
    RETURN COALESCE(v_new_stock, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_product_stock(text, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(text, int) TO authenticated, service_role;

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
SET search_path = pg_catalog, public
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

REVOKE ALL ON FUNCTION public.update_order_status_via_bot(text, order_status_type, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_order_status_via_bot(text, order_status_type, text) TO service_role;

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
REVOKE ALL ON TABLE public.stock_notifications FROM PUBLIC, anon;
GRANT INSERT ON TABLE public.stock_notifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.stock_notifications TO authenticated, service_role;

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

-- 12. Coupons & Promo Codes
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY DEFAULT ('cpn-' || gen_random_uuid()),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0,
    max_uses INT DEFAULT NULL,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.coupons FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.coupons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coupons TO authenticated, service_role;

DROP POLICY IF EXISTS "Allow public select active coupons" ON public.coupons;
CREATE POLICY "Allow public select active coupons"
    ON public.coupons FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage coupons" ON public.coupons;
CREATE POLICY "Admin manage coupons"
    ON public.coupons FOR ALL
    TO authenticated
    USING (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

-- Add coupon columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) DEFAULT 0;

-- Initial Seed Coupon: WELCOME10 (10% off)
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_amount, is_active)
VALUES ('cpn-welcome10', 'CREED10', 'percentage', 10, 10000, true)
ON CONFLICT (code) DO NOTHING;

-- 13. Blocked Phones (Blacklist for repeat no-shows)
CREATE TABLE IF NOT EXISTS public.blocked_phones (
    phone TEXT PRIMARY KEY,
    reason TEXT DEFAULT 'عدم الرد أو رفض الاستلام المتكرر',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.blocked_phones ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.blocked_phones FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.blocked_phones TO authenticated, service_role;

DROP POLICY IF EXISTS "Admin manage blocked phones" ON public.blocked_phones;
CREATE POLICY "Admin manage blocked phones"
    ON public.blocked_phones FOR ALL
    TO authenticated
    USING (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

-- 14. Product Bundles & Gift Sets (أطقم الهدايا والمجموعات الخاصة)
CREATE TABLE IF NOT EXISTS public.bundles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    badge_label TEXT DEFAULT 'مجموعة خاصة',
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    product_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    image TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.bundles FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.bundles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bundles TO authenticated, service_role;

DROP POLICY IF EXISTS "Public select active bundles" ON public.bundles;
CREATE POLICY "Public select active bundles"
    ON public.bundles FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage bundles" ON public.bundles;
CREATE POLICY "Admin manage bundles"
    ON public.bundles FOR ALL
    TO authenticated
    USING (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid)
    WITH CHECK (auth.uid() = '698fd6a7-930d-45f4-93e7-0462a296646a'::uuid);

-- Per-IP write throttling for anonymous checkout and stock-notification writes.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS private.order_request_limits (
    client_ip INET PRIMARY KEY,
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    request_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS order_request_limits_window_idx
    ON private.order_request_limits(window_started_at);
ALTER TABLE private.order_request_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.order_request_limits FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.check_request()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, private
AS $$
DECLARE
    v_method TEXT := upper(coalesce(current_setting('request.method', true), ''));
    v_role TEXT := coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', '');
    v_path TEXT := trim(both '/' from coalesce(current_setting('request.path', true), ''));
    v_headers jsonb := coalesce(current_setting('request.headers', true)::jsonb, '{}'::jsonb);
    v_ip_text TEXT;
    v_ip INET;
    v_window_started_at TIMESTAMPTZ;
    v_request_count INTEGER;
    v_limit INTEGER;
BEGIN
    IF v_role <> 'anon' OR v_method NOT IN ('POST', 'PUT', 'PATCH', 'DELETE') THEN RETURN; END IF;
    IF v_path = 'orders' THEN v_limit := 6;
    ELSIF v_path = 'stock_notifications' THEN v_limit := 10;
    ELSE RETURN;
    END IF;

    v_ip_text := split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1);
    IF trim(v_ip_text) = '' THEN RETURN; END IF;
    BEGIN
        v_ip := trim(v_ip_text)::inet;
    EXCEPTION WHEN invalid_text_representation THEN
        RETURN;
    END;

    INSERT INTO private.order_request_limits(client_ip, window_started_at, request_count)
    VALUES (v_ip, now(), 1)
    ON CONFLICT (client_ip) DO UPDATE
      SET window_started_at = CASE
            WHEN private.order_request_limits.window_started_at <= now() - interval '5 minutes' THEN now()
            ELSE private.order_request_limits.window_started_at END,
          request_count = CASE
            WHEN private.order_request_limits.window_started_at <= now() - interval '5 minutes' THEN 1
            ELSE private.order_request_limits.request_count + 1 END
    RETURNING window_started_at, request_count INTO v_window_started_at, v_request_count;

    IF v_request_count > v_limit THEN
        RAISE SQLSTATE 'PGRST'
          USING message = json_build_object('message', 'Request limit exceeded. Please try again later.')::text,
                detail = json_build_object('status', 429)::text;
    END IF;

    IF random() < 0.01 THEN
        DELETE FROM private.order_request_limits
        WHERE window_started_at < now() - interval '1 day';
    END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.check_request() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_request() TO anon, authenticated, authenticator;
ALTER ROLE authenticator SET pgrst.db_pre_request = 'public.check_request';
NOTIFY pgrst, 'reload config';
