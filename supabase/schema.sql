-- Skema Database Lengkap untuk TIARA BAKERY SAKO (Supabase SQL Editor Ready)
-- Prioritas Keamanan: Row-Level Security (RLS) diaktifkan sejak awal.

-- =========================================================================
-- 1. TABEL UTAMA (PRODUCTS, ORDERS, ORDER_ITEMS, CHATBOT SETTINGS & KNOWLEDGE)
-- =========================================================================

-- 1.1 Tabel Produk
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('Roti', 'Kue Basah', 'Kue Kering', 'Jajanan Pasar')),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.2 Tabel Pesanan (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL CHECK (length(trim(customer_name)) > 0),
    customer_phone TEXT NOT NULL CHECK (customer_phone ~ '^[0-9+ \-]+$'),
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('Ambil Sendiri', 'Kirim ke Rumah')),
    address TEXT,
    total_price INTEGER NOT NULL CHECK (total_price >= 0),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Diproses', 'Selesai')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.3 Tabel Detail Item Pesanan (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase INTEGER NOT NULL CHECK (price_at_purchase >= 0)
);

-- 1.4 Tabel Pengaturan Chatbot Virtual (Chatbot Settings)
CREATE TABLE IF NOT EXISTS public.chatbot_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "botName" TEXT NOT NULL DEFAULT 'Tiara',
    "welcomeMessage" TEXT NOT NULL,
    "defaultFallback" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.5 Tabel Basis Pengetahuan Chatbot (Chatbot Knowledge / FAQ)
CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =========================================================================
-- 2. KEAMANAN: ROW LEVEL SECURITY (RLS)
-- =========================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;

-- Reset kebijakan jika sudah ada sebelumnya (Idempotent)
DROP POLICY IF EXISTS "Siapa saja bisa melihat produk" ON public.products;
DROP POLICY IF EXISTS "Hanya Admin yang bisa CRUD produk" ON public.products;
DROP POLICY IF EXISTS "Pelanggan dapat membuat pesanan baru" ON public.orders;
DROP POLICY IF EXISTS "Pelanggan dapat melacak pesanan berdasarkan ID" ON public.orders;
DROP POLICY IF EXISTS "Hanya Admin yang bisa mengelola semua pesanan" ON public.orders;
DROP POLICY IF EXISTS "Siapa saja dapat menambahkan item pesanan" ON public.order_items;
DROP POLICY IF EXISTS "Siapa saja dapat membaca item pesanan" ON public.order_items;
DROP POLICY IF EXISTS "Hanya Admin yang bisa mengelola item pesanan" ON public.order_items;
DROP POLICY IF EXISTS "Siapa saja bisa membaca pengaturan chatbot" ON public.chatbot_settings;
DROP POLICY IF EXISTS "Hanya Admin yang bisa mengelola pengaturan chatbot" ON public.chatbot_settings;
DROP POLICY IF EXISTS "Siapa saja bisa membaca pengetahuan chatbot" ON public.chatbot_knowledge;
DROP POLICY IF EXISTS "Hanya Admin yang bisa mengelola pengetahuan chatbot" ON public.chatbot_knowledge;

-- Kebijakan untuk Tabel PRODUCTS
CREATE POLICY "Siapa saja bisa melihat produk" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Hanya Admin yang bisa CRUD produk" 
ON public.products FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Kebijakan untuk Tabel ORDERS
CREATE POLICY "Pelanggan dapat membuat pesanan baru" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Pelanggan dapat melacak pesanan berdasarkan ID" 
ON public.orders FOR SELECT 
USING (true);

CREATE POLICY "Hanya Admin yang bisa mengelola semua pesanan" 
ON public.orders FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Kebijakan untuk Tabel ORDER_ITEMS
CREATE POLICY "Siapa saja dapat menambahkan item pesanan" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Siapa saja dapat membaca item pesanan" 
ON public.order_items FOR SELECT 
USING (true);

CREATE POLICY "Hanya Admin yang bisa mengelola item pesanan" 
ON public.order_items FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Kebijakan untuk Tabel CHATBOT_SETTINGS
CREATE POLICY "Siapa saja bisa membaca pengaturan chatbot"
ON public.chatbot_settings FOR SELECT
USING (true);

CREATE POLICY "Hanya Admin yang bisa mengelola pengaturan chatbot"
ON public.chatbot_settings FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Kebijakan untuk Tabel CHATBOT_KNOWLEDGE
CREATE POLICY "Siapa saja bisa membaca pengetahuan chatbot"
ON public.chatbot_knowledge FOR SELECT
USING (true);

CREATE POLICY "Hanya Admin yang bisa mengelola pengetahuan chatbot"
ON public.chatbot_knowledge FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- =========================================================================
-- 3. DATA AWAL (SEED DATA)
-- =========================================================================

-- Seed Data Produk
INSERT INTO public.products (name, description, price, category, stock, image_url) VALUES
('Roti Manis Cokelat', 'Roti lembut dengan isian cokelat Belgia yang melimpah.', 8000, 'Roti', 50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400'),
('Roti Sobek Keju', 'Roti sobek lembut bertabur dan berisi keju cheddar premium.', 18000, 'Roti', 20, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=400'),
('Roti Tawar Gandum', 'Roti tawar gandum tinggi serat yang sehat dan gurih.', 15000, 'Roti', 15, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400'),
('Kue Lumpur Surga', 'Kue basah tradisional bertekstur lembut dengan rasa pandan dan santan gurih.', 5000, 'Kue Basah', 60, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=400'),
('Lemper Ayam Premium', 'Ketan pulen berisi ayam suwir berbumbu gurih dibungkus daun pisang harum.', 4000, 'Kue Basah', 80, 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=400'),
('Kue Mangkok Merah', 'Kue basah kukus tradisional yang merekah manis dan lembut.', 3500, 'Kue Basah', 40, 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=400'),
('Nastar Klasik Wisman', 'Kue kering nastar lembut dengan selai nanas asli home-made berlapis mentega Wisman.', 85000, 'Kue Kering', 25, 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?auto=format&fit=crop&q=80&w=400'),
('Kastengel Keju Edam', 'Kue kering keju yang renyah dan asin gurih khas keju Edam Belanda.', 90000, 'Kue Kering', 20, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=400'),
('Kue Semprit Sagu', 'Kue kering sagu keju klasik yang lumer di mulut.', 65000, 'Kue Kering', 30, 'https://images.unsplash.com/photo-1558961309-dbdf717a1e4d?auto=format&fit=crop&q=80&w=400'),
('Risoles Rogout Ayam', 'Jajanan pasar berkulit renyah dengan isian sayur dan ayam rogout creamy.', 4500, 'Jajanan Pasar', 70, 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=400'),
('Pastel Bihun Telur', 'Pastel renyah berisi sayur, bihun, dan potongan telur rebus.', 4000, 'Jajanan Pasar', 65, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400'),
('Kroket Kentang Daging', 'Kroket kentang lembut berlapis tepung roti dengan isian daging sapi cincang.', 5000, 'Jajanan Pasar', 50, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400');

-- Seed Data Chatbot Settings
INSERT INTO public.chatbot_settings ("botName", "welcomeMessage", "defaultFallback") VALUES
(
  'Tiara',
  'Halo Kak! Selamat datang di **TIARA BAKERY SAKO** 🥐✨' || CHR(10) || CHR(10) || 'Saya Tiara, pelayan virtual toko di sini. Ada yang bisa Tiara bantu? Kakak bisa ketik apa saja yang ingin dibeli (misal: *"pesan 2 lemper dan 1 nastar"*), menanyakan harga produk, atau ketik *"checkout"* untuk langsung memesan belanjaan Kakak! 😊',
  'Aduh maaf Kak, saya kurang paham maksudnya. 🥺 Maklum Tiara masih belajar melayani.' || CHR(10) || CHR(10) || 'Bisa diulangi, Kak? Atau Kakak bisa ketik *"bantuan"* untuk melihat apa saja yang bisa Tiara kerjakan, atau Kakak bisa langsung mengeklik menu di katalog atas. Terima kasih Kak! ❤️'
);

-- Seed Data Chatbot Knowledge (FAQ)
INSERT INTO public.chatbot_knowledge (keyword, question, answer) VALUES
('halal', 'Apakah produk Tiara Bakery halal?', 'Semua produk di Tiara Bakery Sako dijamin 100% Halal Kak. Kami hanya menggunakan bahan-bahan bersertifikat halal berkualitas tinggi tanpa bahan pengawet berbahaya. 😊'),
('jam buka', 'Jam berapa toko buka dan tutup?', 'Tiara Bakery Sako buka setiap hari mulai pukul **07:00 WIB** sampai **21:00 WIB** Kak. Silakan pesan kapan saja ya! ⏰'),
('alamat', 'Di mana alamat lokasi toko?', 'Toko kami berlokasi di **Jl. Sako Raya No. 45, Kecamatan Sako, Palembang** Kak. Kakak bisa cari "Tiara Bakery Sako" di Google Maps. Kami juga melayani pengiriman langsung ke rumah Kakak di area Palembang! 📍'),
('ongkir', 'Berapa biaya ongkos kirim?', 'Untuk pengiriman ke rumah di sekitar area Sako tarifnya gratis Kak! Untuk area Palembang lainnya berkisar antara Rp 10.000 - Rp 25.000 tergantung jarak dari toko. 🛵');
