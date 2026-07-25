# 🥐 Tiara Bakery Sako - Fresh Bake & Cake

Aplikasi Web E-Commerce Premium untuk **Tiara Bakery Sako**, toko kue dan roti yang berbasis di Palembang, Sumatera Selatan. Aplikasi ini dirancang dengan estetika modern, performa tinggi, dan komitmen penuh terhadap **Security by Design** (Keamanan sejak Awal).

---

## 🌟 Fitur Utama Aplikasi

### 🛒 1. Katalog Produk & Keranjang Belanja Interaktif
*   **Katalog Terkategori**: Pengelompokan produk secara rapi mulai dari Roti, Kue Basah, Kue Kering, hingga Jajanan Pasar.
*   **Pencarian Real-Time**: Fitur pencarian produk instan berdasarkan nama atau deskripsi.
*   **Keranjang Belanja Dinamis**: Kelola kuantitas produk dengan validasi batas stok langsung secara real-time di sisi klien.

### 🤖 2. Asisten Chatbot AI (Internal NLP Parser)
*   **Bahasa Alami**: Memahami pesan teks natural bahasa Indonesia (seperti *"saya mau beli roti manis 2"* atau *"berapa harga bolu gulung?"*).
*   **Pemesanan Langsung**: Pengguna dapat menambahkan produk langsung ke keranjang belanja melalui percakapan dengan chatbot.
*   **Informasi Menu & FAQ**: Chatbot dapat menyaring menu secara otomatis dan memandu pelanggan.

### 📍 3. Checkout WhatsApp & Pelacakan Pesanan
*   **Validasi Formulir Zod**: Formulir checkout aman untuk memvalidasi nama, nomor telepon WhatsApp, metode pengiriman, dan alamat.
*   **Integrasi WhatsApp**: Mengarahkan pemesanan secara otomatis ke nomor WhatsApp resmi dengan format pesan yang rapi.
*   **Lacak Status**: Pelanggan dapat melacak status pesanan secara real-time (Pending -> Diproses -> Selesai) menggunakan ID Pesanan unik mereka.

### 🔒 4. Admin Dashboard & Log Audit Keamanan
*   **Dashboard Manajemen**: CRUD produk (tambah, edit, hapus) dan perubahan status pesanan yang aman bagi pemilik toko.
*   **Security Logs**: Panel log audit internal untuk memantau upaya login, transaksi, dan operasi sensitif database.
*   **Dual Database Mode**: Beralih secara otomatis antara Supabase Cloud dan Local Database Simulator (untuk pengembangan luring).

---

## 🏗️ Arsitektur Teknologi

Aplikasi dibangun menggunakan teknologi modern untuk kecepatan dan keamanan optimal:

*   **Frontend Framework**: React 19 (TypeScript) & Vite
*   **Pustaka Desain/Ikon**: Lucide React & Vanilla CSS kustom (Aesthetic & Responsive Layout)
*   **Skema Validasi**: Zod (Input Validation & Sanitization)
*   **Database & Autentikasi**: Supabase JS Client (dengan Fallback Database Simulator)

---

## 🔒 Desain Keamanan (Security by Design)

Untuk menjamin keandalan dan melindungi dari potensi manipulasi:
1.  **Validasi Stok Dua Arah**: Aplikasi memblokir penambahan produk ke keranjang belanja jika jumlah melebihi kapasitas stok aktual di database (Client-side and Server-side protection).
2.  **Sanitasi Input Zod**: Semua input formulir divalidasi ketat melalui skema Zod untuk mencegah eksploitasi kode atau input tidak valid (misal: format nomor WhatsApp).
3.  **Audit Logs**: Setiap aktivitas administratif (seperti modifikasi harga/stok produk, otentikasi admin) dicatat di Security Log untuk mempermudah audit keamanan.
4.  **Enkripsi Session (Simulated)**: Token login admin diamankan dan diuji secara ketat untuk mencegah manipulasi sesi.

---

## 🚀 Panduan Instalasi & Penggunaan

### Prasyarat
Pastikan Anda telah menginstal **Node.js** (versi 18+) di perangkat Anda.

### 1. Kloning & Instalasi Dependensi
```bash
# Instal seluruh pustaka dependensi proyek
npm install
```

### 2. Jalankan Server Pengembangan
```bash
# Menjalankan aplikasi secara lokal dengan HMR (Hot Module Replacement)
npm run dev
```
Buka browser Anda dan akses `http://localhost:5173`.

### 3. Build untuk Produksi
```bash
# Kompilasi TypeScript dan bundel aset web untuk rilis produksi
npm run build
```
Hasil kompilasi akan berada di folder `/dist`.

### 4. Integrasi dengan Supabase (Opsional)
Aplikasi ini berjalan dengan database simulator lokal secara default. Jika Anda ingin menghubungkannya ke Supabase asli, buatlah file `.env` di direktori utama dan isi dengan konfigurasi berikut:
```env
VITE_SUPABASE_URL=https://nama-proyek-anda.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Aplikasi secara otomatis mendeteksi variabel lingkungan ini dan berpindah dari Database Simulator ke database Supabase Cloud.

---

## 📄 Lisensi & Hak Cipta

© 2026 **TIARA BAKERY SAKO**. Hak Cipta Dilindungi Undang-Undang.

Pengembangan aplikasi web, sistem keamanan internal, dan integrasi parser chatbot didesain dan dirilis oleh:
🛡️ **MZF - 2026**
