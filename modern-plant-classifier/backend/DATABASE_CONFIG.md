# Database Configuration

## Current Database: SQLite

Sistem saat ini menggunakan **SQLite** sebagai database utama untuk development dan testing.

### Konfigurasi Database

- **Type:** SQLite
- **File:** `./database.sqlite`
- **Environment:** Development
- **Dialect:** sqlite3

### File Database

Database SQLite tersimpan di file: `D:\Projects\ML-yudha\modern-plant-classifier\backend\database.sqlite`

### Kredensial Login

- **Username:** `admin`
- **Email:** `admin@plantdisease.com`
- **Password:** `admin123`
- **Role:** `admin`

### Cara Menjalankan

1. **Server Login Test:**
   ```bash
   node test-login-simple.js
   ```
   - Port: 3006
   - Health: http://localhost:3006/api/health
   - Login: http://localhost:3006/api/auth/login

2. **Server Utama:**
   ```bash
   node src/app.js
   ```
   - Port: 3000
   - Health: http://localhost:3000/health
   - Login: http://localhost:3000/api/auth/login

### Catatan Penting

- **TIDAK AKAN BERUBAH** dari SQLite ke PostgreSQL
- Database file `database.sqlite` sudah berisi data admin user
- Semua model sudah dikonfigurasi untuk SQLite
- Password admin sudah diperbaiki dan berfungsi

### Struktur Tabel

- `users` - Data pengguna
- `plants` - Data tanaman
- `predictions` - Hasil prediksi
- `detection_history` - Riwayat deteksi
- `guest_detection_limits` - Batasan deteksi guest
- `datasets` - Dataset tanaman
- `training_datasets` - Dataset training
- `diseases` - Data penyakit

### Backup Database

Untuk backup database SQLite, cukup copy file `database.sqlite` ke lokasi aman.
