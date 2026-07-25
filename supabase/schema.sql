-- Skema Database Lengkap untuk TIARA BAKERY SAKO (Supabase SQL Editor Ready)
-- Prioritas Keamanan: Row-Level Security (RLS) diaktifkan sejak awal.

-- =========================================================================
-- 1. TABEL UTAMA (PRODUCTS, ORDERS, ORDER_ITEMS, CHATBOT, USERS, EXPENSES, COUPONS, REVIEWS, RECIPES & DELIVERY)
-- =========================================================================

-- 1.1 Tabel Produk
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('Roti', 'Kue Basah', 'Kue Kering', 'Jajanan Pasar')),
    variants JSONB DEFAULT '[]'::jsonb, -- e.g. [{"size": "Sedang", "price": 18000}, {"size": "Besar", "price": 32000}]
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
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dikonfirmasi', 'Diproses Dapur', 'Dikemas', 'Siap Kirim', 'Dalam Perjalanan', 'Selesai', 'Dibatalkan')),
    assigned_staff TEXT DEFAULT 'Belum Ditugaskan',
    special_notes TEXT, -- alergen / requirment khusus
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

-- 1.6 Tabel Akun Pengelola & Divisi Pegawai (User Accounts)
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'pegawai')),
    division TEXT NOT NULL DEFAULT 'admin' CHECK (division IN ('admin', 'dapur', 'packaging', 'kasir', 'kurir')),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.7 Tabel Pengeluaran Operasional Toko (Expenses / HPP UMKM)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('Bahan Baku', 'Operasional Toko', 'Gaji/Bonus Staf', 'Lain-lain')),
    description TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    expense_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.8 Tabel Kode Voucher / Promo (Coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    max_discount INTEGER NOT NULL DEFAULT 50000,
    min_order INTEGER NOT NULL DEFAULT 0,
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + INTERVAL '30 days') NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.9 Tabel Rating & Review Pelanggan (Customer Reviews)
CREATE TABLE IF NOT EXISTS public.customer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.10 Tabel Resep & Standar Operasional Dapur (Recipes SOP)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    ingredients JSONB NOT NULL, -- e.g. [{"name": "Tepung Terigu", "amount": "500gr"}, {"name": "Mentega Wisman", "amount": "200gr"}]
    steps JSONB NOT NULL, -- e.g. ["Campur adonan", "Panggang 180C 25 menit"]
    allergen_info TEXT DEFAULT 'Bebas Alergen Khusus',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.11 Tabel Tracking Pengiriman & Bukti Foto Kurir (Delivery Trackers)
CREATE TABLE IF NOT EXISTS public.delivery_trackers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    courier_name TEXT NOT NULL,
    route_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Siap Kirim' CHECK (status IN ('Siap Kirim', 'Dalam Perjalanan', 'Tiba di Tujuan')),
    photo_proof_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =========================================================================
-- 2. INDEKS PERFORMA KEUANGAN & LAPORAN
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);


-- =========================================================================
-- 3. KEAMANAN: ROW LEVEL SECURITY (RLS)
-- =========================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_trackers ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS Publik
CREATE POLICY "Siapa saja bisa membaca produk" ON public.products FOR SELECT USING (true);
CREATE POLICY "Siapa saja bisa membaca pesanan" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Siapa saja bisa membuat pesanan" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Siapa saja bisa membaca order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Siapa saja bisa membuat order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Siapa saja bisa membaca pengetahuan chatbot" ON public.chatbot_knowledge FOR SELECT USING (true);
CREATE POLICY "Siapa saja bisa membaca ulasan pelanggan" ON public.customer_reviews FOR SELECT USING (true);
CREATE POLICY "Siapa saja bisa membaca voucher promo" ON public.coupons FOR SELECT USING (true);


-- =========================================================================
-- 4. DATA AWAL (SEED DATA)
-- =========================================================================

-- Seed Data Produk
INSERT INTO public.products (name, description, price, category, stock, image_url) VALUES
('Roti Manis Cokelat', 'Roti lembut dengan isian cokelat Belgia yang melimpah.', 8000, 'Roti', 50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400'),
('Roti Sobek Keju', 'Roti sobek lembut bertabur dan berisi keju cheddar premium.', 18000, 'Roti', 20, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=400'),
('Roti Tawar Gandum', 'Roti tawar gandum tinggi serat yang sehat dan gurih.', 15000, 'Roti', 4, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400'),
('Kue Lumpur Surga', 'Kue basah tradisional bertekstur lembut dengan rasa pandan dan santan gurih.', 5000, 'Kue Basah', 60, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=400'),
('Lemper Ayam Premium', 'Ketan pulen berisi ayam suwir berbumbu gurih dibungkus daun pisang harum.', 4000, 'Kue Basah', 80, 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=400'),
('Kue Mangkok Merah', 'Kue basah kukus tradisional yang merekah manis dan lembut.', 3500, 'Kue Basah', 3, 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=400'),
('Nastar Klasik Wisman', 'Kue kering nastar lembut dengan selai nanas asli home-made berlapis mentega Wisman.', 85000, 'Kue Kering', 25, 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?auto=format&fit=crop&q=80&w=400'),
('Kastengel Keju Edam', 'Kue kering keju yang renyah dan asin gurih khas keju Edam Belanda.', 90000, 'Kue Kering', 20, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=400'),
('Kue Semprit Sagu', 'Kue kering sagu keju klasik lumer di mulut.', 65000, 'Kue Kering', 30, 'https://images.unsplash.com/photo-1558961309-dbdf717a1e4d?auto=format&fit=crop&q=80&w=400'),
('Risoles Rogout Ayam', 'Jajanan pasar berkulit renyah dengan isian sayur dan ayam rogout creamy.', 4500, 'Jajanan Pasar', 70, 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=400'),
('Pastel Bihun Telur', 'Pastel renyah berisi sayur, bihun, dan potongan telur rebus.', 4000, 'Jajanan Pasar', 65, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400'),
('Kroket Kentang Daging', 'Kroket kentang lembut berlapis tepung roti dengan isian daging sapi cincang.', 5000, 'Jajanan Pasar', 50, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400');

-- Seed Data Coupons / Voucher Promo
INSERT INTO public.coupons (code, discount_percent, max_discount, min_order) VALUES
('TIARA10', 10, 20000, 50000),
('TIARA20', 20, 40000, 100000),
('SAKOHAT', 15, 30000, 75000)
ON CONFLICT (code) DO NOTHING;

-- Seed Data Ulasan Pelanggan
INSERT INTO public.customer_reviews (customer_name, product_name, rating, comment, admin_response) VALUES
('Siti Nurhaliza', 'Nastar Klasik Wisman', 5, 'Nastarnya sangat lembut, selai nanasnya melimpah dan gurih mentega Wisman terasa sekali!', 'Terima kasih Kak Siti! Senang Kakak menyukainya ❤️'),
('Rian Hidayat', 'Roti Sobek Keju', 5, 'Rotinya empuk banget walaupun sudah hari kedua. Kejuny melimpah!', 'Alhamdulillah, terima kasih mas Rian! ditunggu order selanjutnya 😊'),
('Dewi Kartika', 'Kue Lumpur Surga', 4, 'Manisnya pas, harum santan pandan asli.', NULL)
ON CONFLICT DO NOTHING;

-- Seed Data User Accounts (Admin & Staf Pegawai per Divisi)
INSERT INTO public.user_accounts (username, name, role, division, password_hash) VALUES
('admin', 'Administrator (Owner)', 'admin', 'admin', 'e8d1a1ca60cb46dc1e7372cf931b6cc8f07cd7fa8fb3c2fb67c69ffb1dc6a9db'),
('pegawai', 'Budi (Staf Kasir)', 'pegawai', 'kasir', 'a587eeedef2ebfdfa40c62ff92429a1b154a4f8d22bb425c2ee035c9118e6cb0'),
('dapur', 'Chef Ani (Staf Dapur)', 'pegawai', 'dapur', 'a587eeedef2ebfdfa40c62ff92429a1b154a4f8d22bb425c2ee035c9118e6cb0'),
('gudang', 'Doni (Staf Packing)', 'pegawai', 'packaging', 'a587eeedef2ebfdfa40c62ff92429a1b154a4f8d22bb425c2ee035c9118e6cb0'),
('kurir', 'Eko (Staf Kurir)', 'pegawai', 'kurir', 'a587eeedef2ebfdfa40c62ff92429a1b154a4f8d22bb425c2ee035c9118e6cb0')
ON CONFLICT (username) DO NOTHING;
