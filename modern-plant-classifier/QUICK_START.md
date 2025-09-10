# 🚀 Quick Start Guide

## Masalah yang Diperbaiki

✅ **Dataset sesuai**: Model menggunakan dataset Corn, Potato, dan Tomato (17 kelas)  
✅ **Login persist**: Login tidak logout saat refresh  
✅ **Analisis tersimpan**: Hasil analisis masuk ke database  
✅ **npm start lengkap**: Menjalankan backend dan frontend sekaligus  

## Cara Menjalankan

### Opsi 1: Otomatis (Recommended)
```bash
# Windows
install-and-start.bat

# Linux/Mac
chmod +x install-and-start.sh
./install-and-start.sh
```

### Opsi 2: Manual
```bash
# 1. Install dependencies
npm run install:all

# 2. Start system
npm start
```

### Opsi 3: Development Mode
```bash
# Backend dan frontend terpisah
npm run dev
```

## Akses Sistem

- 🌐 **Frontend**: http://localhost:5173
- 📡 **Backend API**: http://localhost:3000
- 🔍 **Health Check**: http://localhost:3000/health

## Login Default

- **Username**: admin
- **Password**: admin123

## Fitur yang Tersedia

### Untuk Guest (Tanpa Login)
- ✅ Klasifikasi tanaman (maksimal 2 kali)
- ✅ Upload gambar daun
- ✅ Lihat hasil analisis AI

### Untuk User Login
- ✅ Klasifikasi unlimited
- ✅ Riwayat analisis
- ✅ Dashboard personal

### Untuk Admin
- ✅ Kelola data tanaman
- ✅ Lihat semua analisis
- ✅ Statistik sistem

## Dataset yang Didukung

- 🌽 **Jagung (Corn)**: 4 kategori penyakit
- 🥔 **Kentang (Potato)**: 3 kategori penyakit  
- 🍅 **Tomat (Tomato)**: 10 kategori penyakit

**Total**: 17 kelas dengan akurasi 86.12%

## Troubleshooting

### Port sudah digunakan
```bash
# Kill process di port 3000
npx kill-port 3000

# Kill process di port 5173
npx kill-port 5173
```

### Dependencies error
```bash
# Clear cache dan install ulang
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Model tidak load
- Pastikan folder `klasifikasi-tanaman/tfjs_model/` ada
- Pastikan file `model.json` dan `classes.json` ada
- Restart backend

## Struktur Project

```
modern-plant-classifier/
├── backend/          # Node.js + Express + TensorFlow.js
├── frontend/         # React + Vite
├── klasifikasi-tanaman/  # ML Model (tidak boleh diubah)
└── package.json      # Root package untuk start semua
```
