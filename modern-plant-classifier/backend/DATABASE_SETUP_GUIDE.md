# Database Setup Guide

## Overview
Panduan lengkap untuk setup database PostgreSQL untuk Plant Disease Classification System.

## Prerequisites

### 1. **PostgreSQL Installation**
- PostgreSQL 12+ sudah terinstall
- Service PostgreSQL sudah running
- User `postgres` sudah ada dan bisa diakses
- Password untuk user `postgres` sudah diset

### 2. **Check PostgreSQL Status**
```bash
# Windows
sc query postgresql-x64-15

# Linux/Mac
sudo systemctl status postgresql
# atau
brew services list | grep postgresql
```

### 3. **Test Connection**
```bash
psql -U postgres -h localhost -p 5432
# Masukkan password jika diminta
```

## Setup Methods

### **Method 1: Automated Script (Recommended)**

#### **Windows**
```bash
# Double click file
setup-database.bat

# Atau jalankan di Command Prompt
setup-database.bat
```

#### **Linux/Mac**
```bash
# Buat file executable
chmod +x setup-database.sh

# Jalankan script
./setup-database.sh
```

### **Method 2: Manual Step by Step**

#### **Step 1: Create Database**
```bash
# Connect ke postgres database
psql -U postgres -d postgres

# Jalankan script create database
\i create-database.sql

# Atau manual
CREATE DATABASE plant_classifier_dev;
\q
```

#### **Step 2: Setup Tables and Data**
```bash
# Connect ke database baru
psql -U postgres -d plant_classifier_dev

# Jalankan script setup
\i fresh-database-setup.sql
```

### **Method 3: SQL Tool (pgAdmin, DBeaver, etc.)**

1. **Buat Database Baru**
   - Nama: `plant_classifier_dev`
   - Owner: `postgres`
   - Encoding: `UTF8`

2. **Jalankan Script Setup**
   - Copy isi `fresh-database-setup.sql`
   - Paste ke SQL editor
   - Execute script

## File Scripts

### **1. `create-database.sql`**
- Membuat database baru `plant_classifier_dev`
- Drop database lama jika ada
- Set encoding dan permissions

### **2. `fresh-database-setup.sql`**
- Drop semua tabel lama (jika ada)
- Buat tabel baru dengan struktur yang benar
- Insert sample data
- Buat indexes dan triggers

### **3. `complete-database-setup.sql`**
- Script lengkap tanpa drop tabel
- Gunakan jika database masih kosong
- Aman untuk production

### **4. `setup-database.bat` (Windows)**
- Script otomatis untuk Windows
- Check connection
- Create database
- Setup tables dan data
- Verification

### **5. `setup-database.sh` (Linux/Mac)**
- Script otomatis untuk Linux/Mac
- Same functionality dengan Windows version

## Database Structure

### **Tables Created**
```
users                    - User accounts dan admin
plants                   - Data tanaman dan penyakit
predictions              - Riwayat prediksi
detection_history        - Riwayat deteksi lengkap
guest_detection_limits   - Batasan deteksi guest
```

### **Sample Data**
- **Admin User**: `admin/admin123`
- **Regular User**: `user1/user123`
- **15 Plant Types**: Corn, Potato, Tomato dengan berbagai penyakit
- **Sample Detection History**: Data testing
- **Guest Detection Limits**: Sample IP addresses

## Troubleshooting

### **1. Connection Error**
```
ERROR: connection to server at "localhost" (127.0.0.1), port 5432 failed
```
**Solution:**
- Pastikan PostgreSQL service running
- Check port 5432 tidak diblokir
- Verifikasi password user postgres

### **2. Permission Denied**
```
ERROR: permission denied to create database
```
**Solution:**
- Login sebagai user `postgres`
- Atau gunakan user dengan privilege CREATE DATABASE

### **3. Database Already Exists**
```
ERROR: database "plant_classifier_dev" already exists
```
**Solution:**
- Gunakan `fresh-database-setup.sql` untuk drop dan recreate
- Atau drop manual: `DROP DATABASE plant_classifier_dev;`

### **4. Column Does Not Exist**
```
ERROR: column "user_id" does not exist
```
**Solution:**
- Tabel lama memiliki struktur berbeda
- Gunakan `fresh-database-setup.sql` untuk recreate semua tabel

### **5. Port Already in Use**
```
ERROR: could not bind to port 5432
```
**Solution:**
- Check apakah PostgreSQL sudah running di port lain
- Atau stop service lain yang menggunakan port 5432

## Verification

### **Check Database Created**
```sql
\l
-- Harus ada database plant_classifier_dev
```

### **Check Tables Created**
```sql
\dt
-- Harus ada 5 tabel: users, plants, predictions, detection_history, guest_detection_limits
```

### **Check Sample Data**
```sql
SELECT COUNT(*) FROM users;        -- Harus ada 2 users
SELECT COUNT(*) FROM plants;       -- Harus ada 15 plants
SELECT COUNT(*) FROM detection_history; -- Harus ada 4 records
```

### **Check Indexes**
```sql
\di
-- Harus ada indexes untuk performance
```

## Environment Configuration

### **Backend Config**
File `config.env` harus diset:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plant_classifier_dev
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_DIALECT=postgres
```

### **Test Connection**
```bash
# Test dari backend
cd modern-plant-classifier/backend
node -e "const db = require('./src/config/database'); db.testConnection().then(() => console.log('OK')).catch(console.error)"
```

## Post-Setup

### **1. Start Backend**
```bash
cd modern-plant-classifier/backend
npm start
```

### **2. Test API Endpoints**
```bash
# Health check
curl http://localhost:3000/health

# Check allowed keywords
curl http://localhost:3000/api/predict/allowed-keywords
```

### **3. Test Login**
```bash
# Admin login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Backup & Restore

### **Backup Database**
```bash
pg_dump -U postgres -d plant_classifier_dev > backup.sql
```

### **Restore Database**
```bash
psql -U postgres -d plant_classifier_dev < backup.sql
```

## Security Notes

### **1. Change Default Passwords**
- Setelah setup, ganti password default
- Admin: `admin/admin123` → `admin/your_secure_password`
- User: `user1/user123` → `user1/your_secure_password`

### **2. Database Access**
- Restrict access hanya dari localhost
- Gunakan strong password untuk user postgres
- Consider menggunakan connection pooling untuk production

### **3. Environment Variables**
- Jangan commit `config.env` ke git
- Gunakan `.env.example` sebagai template
- Set environment variables di production

## Support

### **Common Issues**
- Check log PostgreSQL: `/var/log/postgresql/` (Linux) atau Event Viewer (Windows)
- Verify connection dengan `psql`
- Test dengan script verification

### **Next Steps**
- Setup frontend application
- Configure ML model paths
- Test complete system
- Deploy to production
