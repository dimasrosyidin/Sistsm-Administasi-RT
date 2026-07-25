git init
git remote add origin https://github.com/dimasrosyidin/Sistsm-Administasi-RT.git
git branch -M main

# 1. Base Project & Setup
git add rt-backend/composer.json rt-backend/composer.lock rt-backend/artisan rt-backend/package.json rt-backend/.env.example rt-backend/config rt-backend/bootstrap rt-backend/public rt-backend/storage rt-backend/tests rt-backend/routes
git add rt-frontend/package.json rt-frontend/package-lock.json rt-frontend/vite.config.js rt-frontend/tailwind.config.js rt-frontend/postcss.config.js rt-frontend/index.html rt-frontend/public
git commit -m "chore: Initial project setup (Laravel 10 & React Vite)"

# 2. Database Structure & Core Models
git add rt-backend/database/migrations rt-backend/database/seeders rt-backend/database_rt_admin.sql
git commit -m "feat: Database migrations and initial SQL dump"

# 3. Feature: Data Penghuni
git add rt-backend/app/Models/Penghuni.php rt-backend/app/Http/Controllers/PenghuniController.php
git add rt-frontend/src/pages/Penghuni.jsx
git commit -m "feat(penghuni): Add Data Penghuni management"

# 4. Feature: Data Rumah & Relasi
git add rt-backend/app/Models/Rumah.php rt-backend/app/Models/PenghuniRumah.php rt-backend/app/Http/Controllers/RumahController.php
git add rt-frontend/src/pages/Rumah.jsx
git commit -m "feat(rumah): Add Data Rumah and Resident mapping"

# 5. Feature: Keuangan (Pembayaran & Pengeluaran)
git add rt-backend/app/Models/Pembayaran.php rt-backend/app/Models/Pengeluaran.php rt-backend/app/Http/Controllers/PembayaranController.php rt-backend/app/Http/Controllers/PengeluaranController.php
git add rt-frontend/src/pages/Pembayaran.jsx rt-frontend/src/pages/Pengeluaran.jsx rt-frontend/src/pages/Laporan.jsx
git commit -m "feat(finance): Add Payment, Expense, and Financial Reporting"

# 6. Feature: Dashboard & UI Polish
git add rt-backend/app/Http/Controllers/DashboardController.php
git add rt-frontend/src/App.jsx rt-frontend/src/main.jsx rt-frontend/src/index.css rt-frontend/src/api.js rt-frontend/src/pages/Dashboard.jsx rt-frontend/src/utils
git commit -m "feat(dashboard): Add Dashboard and responsive UI layout"

# 7. Documentation
# Assuming the file is in the workspace root or we can just copy it from artifacts if needed.
# Since I wrote the artifact to the brain dir, I'll copy it here first.
Copy-Item "C:\Users\ADVAN\.gemini\antigravity\brain\6440ac14-8b15-45e1-b8c9-e95b9e4435d9\Buku_Panduan_Sistem_RT.md" -Destination ".\Buku_Panduan_Sistem_RT.md"
git add Buku_Panduan_Sistem_RT.md
git commit -m "docs: Add comprehensive User Manual and LAN access guide"

# 8. Everything Else (Catch-all for any missed files)
git add .
git commit -m "chore: Add remaining project files and configs"

# Push to remote
git push -u origin main
