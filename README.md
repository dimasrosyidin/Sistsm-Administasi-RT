# Sistem Administrasi RT (Rukun Tetangga)

Aplikasi ini dibuat menggunakan framework **Laravel 11** untuk Backend (API) dan **React + Vite** untuk Frontend.

## Struktur Direktori
- `rt-backend`: Berisi source code API Laravel.
- `rt-frontend`: Berisi source code antarmuka React.

## Persyaratan Sistem
- PHP >= 8.2
- Composer
- Node.js (direkomendasikan versi 18 atau 20+)
- MySQL

## Panduan Instalasi Backend (Laravel)

1. Buka terminal dan masuk ke folder backend:
   ```bash
   cd rt-backend
   ```
2. Salin file environment:
   ```bash
   cp .env.example .env
   ```
3. Sesuaikan konfigurasi database pada file `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=rt_admin
   DB_USERNAME=root
   DB_PASSWORD=
   ```
4. Buat database MySQL dengan nama `rt_admin`.
5. Install dependensi composer:
   ```bash
   composer install
   ```
6. Generate application key:
   ```bash
   php artisan key:generate
   ```
7. Jalankan migrasi database untuk membuat tabel:
   ```bash
   php artisan migrate
   ```
8. Buat symbolic link untuk folder storage. **Langkah ini WAJIB dilakukan agar foto KTP dapat ditampilkan di aplikasi**:
   ```bash
   php artisan storage:link
   ```
9. Jalankan server backend:
   ```bash
   php artisan serve
   ```
   Backend akan berjalan di `http://localhost:8000`.

## Panduan Instalasi Frontend (React)

1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd rt-frontend
   ```
2. Install dependensi NPM:
   ```bash
   npm install
   ```
3. Jika port Backend Laravel Anda berbeda dari `8000`, silakan ubah konfigurasi base URL pada file `src/api.js`.
4. Jalankan server frontend:
   ```bash
   npm run dev
   ```
5. Buka browser dan akses URL yang diberikan oleh Vite (biasanya `http://localhost:5173`).

## Fitur Utama
1. **Data Penghuni**: Menambahkan, mengedit, dan melihat penghuni (dilengkapi fitur upload KTP).
2. **Data Rumah**: Manajemen status rumah (Dihuni/Tidak Dihuni), penetapan penghuni, dan melihat history (riwayat) siapa saja yang pernah menempati.
3. **Pembayaran**: Mencatat pembayaran iuran Kebersihan dan Satpam dari warga setiap bulan.
4. **Pengeluaran**: Mencatat pengeluaran RT (perbaikan jalan, gaji, dll).
5. **Dashboard & Laporan**: Grafik ringkasan pemasukan dan pengeluaran selama setahun serta laporan rincian saldo bulanan.
