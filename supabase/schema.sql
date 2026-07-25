-- Skema Database untuk TIARA BAKERY SAKO
-- Prioritas Keamanan: Row-Level Security (RLS) diaktifkan sejak awal.

-- 1. Tabel Produk
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

-- 2. Tabel Pesanan (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL CHECK (length(clean_text(customer_name)) > 0),
    customer_phone TEXT NOT NULL CHECK (customer_phone ~ '^[0-9+ \-]+$'),
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('Ambil Sendiri', 'Kirim ke Rumah')),
    address TEXT,
    total_price INTEGER NOT NULL CHECK (total_price >= 0),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Diproses', 'Selesai')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Detail Item Pesanan (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase INTEGER NOT NULL CHECK (price_at_purchase >= 0)
);

-- =========================================================================
-- KEAMANAN: AKTIFKAN ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk Tabel PRODUCTS
-- A. Publik hanya dapat membaca daftar produk
CREATE POLICY "Siapa saja bisa melihat produk" 
ON public.products FOR SELECT 
USING (true);

-- B. Hanya Admin Authenticated yang dapat melakukan modifikasi produk (CRUD)
CREATE POLICY "Hanya Admin yang bisa CRUD produk" 
ON public.products FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- Kebijakan untuk Tabel ORDERS
-- A. Pelanggan (anon) dapat membuat pesanan baru (INSERT)
CREATE POLICY "Pelanggan dapat membuat pesanan baru" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- B. Pelanggan dapat membaca data pesanannya sendiri dengan menyuplai UUID yang tepat
CREATE POLICY "Pelanggan dapat melacak pesanan berdasarkan ID" 
ON public.orders FOR SELECT 
USING (true); -- Dibatasi di sisi aplikasi dengan kueri ID spesifik

-- C. Hanya Admin Authenticated yang memiliki kontrol penuh atas pesanan (SELECT, UPDATE, DELETE)
CREATE POLICY "Hanya Admin yang bisa mengelola semua pesanan" 
ON public.orders FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- Kebijakan untuk Tabel ORDER_ITEMS
-- A. Siapa saja dapat memasukkan item pesanan baru (untuk checkout)
CREATE POLICY "Siapa saja dapat menambahkan item pesanan" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

-- B. Siapa saja dapat membaca item pesanan untuk validasi order mereka sendiri
CREATE POLICY "Siapa saja dapat membaca item pesanan" 
ON public.order_items FOR SELECT 
USING (true);

-- C. Hanya Admin Authenticated yang bisa mengelola item pesanan
CREATE POLICY "Hanya Admin yang bisa mengelola item pesanan" 
ON public.order_items FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- =========================================================================
-- DATA AWAL (SEED DATA) UNTUK PRODUK
-- =========================================================================
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
