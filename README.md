# KopiKita — Coffee & Boba Shop (MERN Stack)

Aplikasi pemesanan kopi, non-kopi, dan boba, dibangun dengan **MongoDB, Express,
React, dan Node.js (MERN)** + **Tailwind CSS**. Dibuat sebagai proyek portofolio,
mereplikasi alur: landing page → menu dengan kustomisasi → checkout → lacak
pesanan → dashboard admin dengan laporan Excel.

## Fitur

- 🏠 **Landing page** dengan hero, promo banner (klik untuk salin kode)
- 🧋 **Menu** — filter kategori (Kopi Spesial / Non-Kopi / Boba), kustomisasi
  ukuran, level es, level manis, dan topping tambahan per produk
- 🛒 **Keranjang** (drawer) dan **checkout** — kode promo, ongkir, PB1 (pajak
  restoran 10%), dan tipe pesanan (ambil sendiri / diantar)
- 🔒 **Harga dihitung ulang di server** saat checkout (bukan dari input client),
  supaya aman dari manipulasi harga
- 📦 **Lacak pesanan** — cari via ID pesanan (KPK-XXXXXXXX), timeline status,
  kirim struk ke WhatsApp
- 📊 **Dashboard admin** — statistik pendapatan, grafik 7 hari, menu terlaris,
  kelola pesanan/produk/kode promo, dan **export laporan ke Excel**
- 🔑 Login admin sederhana dengan JWT

> Integrasi Midtrans disiapkan sebagai stub — tambahkan kunci sandbox/produksi
> kamu sendiri di `backend/.env` untuk mengaktifkan transaksi pembayaran nyata.

## Struktur Proyek 

```
kopikita/
├── backend/            # Node.js + Express + MongoDB (Mongoose)
│   ├── config/db.js
│   ├── models/         # Product, Order, Promo, Admin
│   ├── routes/         # productRoutes, orderRoutes, promoRoutes, adminRoutes
│   ├── middleware/      # auth (JWT) & error handling
│   ├── seed.js          # data contoh (9 produk + 3 kode promo)
│   └── server.js
└── frontend/            # React (Vite) + Tailwind CSS
    └── src/
        ├── pages/        # Home, Menu, Checkout, TrackOrder, AdminDashboard...
        ├── components/   # Navbar, ProductCard, ProductModal, CartDrawer...
        └── context/      # CartContext
```

## Cara Menjalankan

### 1. Backend

```bash
cd backend
cp .env.example .env      # lalu isi MONGO_URI, JWT_SECRET, dsb.
npm install
npm run seed               # isi database dengan 9 produk & 3 kode promo contoh
npm run dev                # jalan di http://localhost:5000
```

Butuh MongoDB lokal (`mongodb://localhost:27017/kopikita`) atau pakai
[MongoDB Atlas](https://www.mongodb.com/atlas) (tinggal ganti `MONGO_URI`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # jalan di http://localhost:5173
```

Vite sudah dikonfigurasi proxy `/api` → `http://localhost:5000`, jadi frontend
otomatis terhubung ke backend tanpa setting CORS tambahan saat development.

### 3. Login Admin

Buka `http://localhost:5173/admin`, login dengan kredensial default:

```
Username: admin
Password: admin123
```

(ubah di `backend/.env` → `ADMIN_USERNAME` / `ADMIN_PASSWORD`)

## Tech Stack

| Layer     | Teknologi |
|-----------|-----------|
| Frontend  | React 18, React Router, Tailwind CSS, Recharts, Axios |
| Backend   | Node.js, Express, JWT, bcrypt, ExcelJS |
| Database  | MongoDB + Mongoose |
| Pembayaran| Midtrans (sandbox stub, siap dihubungkan) |

## Ide Pengembangan Lanjutan

- Integrasi webhook Midtrans asli untuk update `paymentStatus` otomatis
- Upload gambar produk (mis. via Cloudinary) alih-alih URL manual
- Push notification real-time (WebSocket) saat status pesanan berubah
- Riwayat pesanan per nomor WhatsApp pelanggan
- Multi-admin dengan role (kasir / dapur / owner)

---

Dibuat untuk kebutuhan portofolio — silakan disesuaikan nama toko, harga,
lokasi, dan branding sesuai kebutuhanmu. 🎉
