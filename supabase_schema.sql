-- 1. Tabel untuk Menu Items (Master Menu)
CREATE TABLE IF NOT EXISTS menu_items (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" NUMERIC NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel untuk Riwayat Penjualan
CREATE TABLE IF NOT EXISTS sales (
    "id" TEXT PRIMARY KEY,
    "date" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "items" JSONB NOT NULL,
    "total" NUMERIC NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionCode" TEXT,
    "status" TEXT DEFAULT 'completed',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Kebijakan Keamanan (RLS) - Mengizinkan akses publik untuk percobaan
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Hapus kebijakan lama jika ada (untuk menghindari error duplikasi)
DROP POLICY IF EXISTS "Allow public read for menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public insert for menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public update for menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public read for sales" ON sales;
DROP POLICY IF EXISTS "Allow public insert for sales" ON sales;

-- Buat kebijakan baru
CREATE POLICY "Allow public read for menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert for menu_items" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for menu_items" ON menu_items FOR UPDATE USING (true);

CREATE POLICY "Allow public read for sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Allow public insert for sales" ON sales FOR INSERT WITH CHECK (true);
