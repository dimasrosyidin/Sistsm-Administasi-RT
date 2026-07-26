# 📖 Buku Panduan Sistem Administrasi RT

Selamat datang di **Sistem Administrasi Keuangan RT**! Buku panduan ini dirancang khusus untuk memandu Anda langkah demi langkah dalam menggunakan aplikasi ini, dari awal hingga akhir. 

Setiap tahapan dilengkapi dengan instruksi yang mudah dipahami. Jika Anda menemukan tanda kotak seperti ini `[ 📸 MASUKKAN SCREENSHOT DI SINI: ... ]`, itu adalah tempat yang disediakan bagi Anda untuk menyisipkan gambar/screenshot panduan visual.

---

## 🛠️ Bagian 1: Persiapan & Menjalankan Aplikasi

Sebelum mulai menggunakan fitur RT, Anda perlu menyalakan aplikasi di komputer Anda.

### A. Mengambil (Clone) Aplikasi dan Database dari Github
Jika Anda atau tim Anda mengunduh aplikasi ini dari Github, ikuti langkah berikut untuk memasang data lokal yang sudah ada:
1. Buka Terminal/Git Bash, lalu *clone* *repository* ke komputer Anda: `git clone <link_github_repo_anda>`
2. Buka aplikasi database (misal: phpMyAdmin atau DBeaver).
3. Buat database baru bernama `rt_admin`.
4. Lakukan **Import** (atau *restore*) file bernama `database_rt_admin.sql` (berada di dalam folder `rt-backend`) ke dalam database `rt_admin` tersebut. File ini berisi seluruh contoh data lokal (rumah, penghuni, tagihan) agar aplikasi langsung siap pakai.

### B. Menjalankan di Komputer Server (Lokal)
1. Buka dua jendela Terminal/Command Prompt.
2. Di terminal pertama, masuk ke folder `rt-backend` dan ketik: `php artisan serve`
3. Di terminal kedua, masuk ke folder `rt-frontend` dan ketik: `npm run dev`
4. Buka aplikasi *browser* (Google Chrome/Firefox) dan ketik alamat: **http://localhost:5173**


### C. Mengakses Aplikasi dari HP atau Komputer Lain (Satu WiFi/LAN)
Jika Anda ingin membuka aplikasi ini di HP atau laptop lain, ikuti cara ini:
1. Pastikan HP dan Komputer Server terhubung ke WiFi yang sama.
2. Cek IP Address komputer server (misal: `192.168.1.10`).
3. Jalankan backend: `php artisan serve --host=0.0.0.0 --port=8000`
4. Ubah file `src/api.js` di frontend agar menunjuk ke IP tersebut (contoh: `baseURL: 'http://192.168.1.10:8000/api'`).
5. Jalankan frontend: `npm run dev -- --host`
6. Buka HP, masuk ke *browser*, lalu ketik: **http://192.168.1.10:5173**

---

## 🚀 Bagian 2: Panduan Langkah Demi Langkah (Step-by-Step)

Untuk memulai sistem administrasi RT dari awal, ikuti urutan langkah di bawah ini:

### Langkah 1: Menambahkan Data Penghuni (Warga)
Langkah pertama yang harus dilakukan adalah mendaftarkan warga yang tinggal di lingkungan RT.
1. Klik menu **"Penghuni"** di panel sebelah kiri.
2. Klik tombol biru **"+ Tambah Penghuni"** di pojok kanan atas.
3. Isikan data diri warga (Nama, Status Tetap/Kontrak, No. Telepon, dll). Anda juga bisa mengunggah foto KTP jika perlu.
4. Klik **"Simpan"**.

*💡 Tips: Anda dapat mencari nama warga di kolom "Search" atau memilih opsi "Semua Status" di filter dropdown untuk menampilkan semua riwayat warga.*

---

### Langkah 2: Mengelola Rumah & Memasukkan Penghuni ke Rumah
Setelah warga terdaftar, langkah selanjutnya adalah menempatkan mereka ke dalam rumah fisik.
1. Klik menu **"Rumah"** di panel sebelah kiri.
2. Jika belum ada rumah, klik **"+ Tambah Rumah"**. Jika rumah sudah ada, klik ikon pensil (Edit) pada baris rumah tersebut.
3. Pada form Edit Rumah, Anda akan melihat bagian **"Penghuni Saat Ini"**. 
4. Pilih penghuni (yang telah didaftarkan di Langkah 1) melalui kotak *dropdown*.
5. Jika satu rumah diisi oleh lebih dari satu orang, klik tombol **"+ Tambah penghuni"** di bagian bawah, lalu pilih nama warga lainnya.
6. Klik **"Simpan"**. Status rumah akan otomatis berubah menjadi "Dihuni".

*💡 Tips: Klik ikon "Mata" pada baris rumah untuk melihat sejarah (history) siapa saja yang pernah mengontrak atau menempati rumah tersebut di masa lalu.*

---

### Langkah 3: Menerima & Mencatat Pembayaran Iuran
Tiba waktunya warga membayar iuran bulanan (Kebersihan & Satpam).
1. Klik menu **"Pembayaran"** di panel sebelah kiri.
2. Anda akan melihat daftar rumah dan bulan tagihannya. Tombol merah berarti belum dibayar (*Unpaid*).
3. Untuk mencatat pembayaran, klik tombol hijau **"Bayar"** pada baris tagihan rumah yang bersangkutan.
4. Pada *pop-up* yang muncul, Anda akan diberikan 2 opsi pembayaran:
   - **Bayar Keduanya (1 Bulan):** Melunasi iuran kebersihan dan satpam sekaligus untuk bulan tersebut.
   - **Bayar 1 Tahun (12 Bulan):** Warga membayar lunas untuk 1 tahun ke depan secara instan.
5. Klik opsi yang sesuai, lalu klik **"Ya"** pada peringatan konfirmasi.
6. Indikator baris akan berubah menjadi hijau (*Paid*).

---

### Langkah 4: Mencatat Pengeluaran Kas RT
Selain pemasukan, uang kas RT juga pasti digunakan untuk berbagai keperluan.
1. Klik menu **"Pengeluaran"** di panel sebelah kiri.
2. Klik **"+ Tambah Pengeluaran"**.
3. Masukkan Keterangan (misal: "Honor Satpam Bulan Juli", "Beli Lampu Jalan", "Kerja Bakti") dan Jumlah Nominalnya.
4. Klik **"Simpan"**. Uang ini akan secara otomatis memotong saldo akhir RT.


---

### Langkah 5: Memantau Laporan Keuangan Akhir (Laporan & Dashboard)
Setelah sistem berjalan (ada pemasukan dan pengeluaran), Anda bisa melihat hasil akhirnya.
1. **Melihat Laporan Rinci:** Klik menu **"Laporan"**. Di sini Anda bisa melihat tabel rekapitulasi otomatis (Pemasukan, Pengeluaran, dan Saldo akhir) untuk setiap bulannya (Januari s.d. Desember).
2. **Cetak Laporan (Print):** Klik tombol **"Export PDF"** atau **"Export Excel"** di halaman ini untuk mencetak pertanggungjawaban dana RT di akhir tahun.
3. **Melihat Ringkasan (Dashboard):** Klik menu **"Dashboard"**. Di bagian ini Anda bisa melihat Grafik Keuangan Tahunan serta total Saldo Kas RT terkini secara visual.


---

## Selesai! 🎉
Sistem Administrasi RT Anda kini siap beroperasi sepenuhnya secara rapi, transparan, dan terdigitalisasi.
