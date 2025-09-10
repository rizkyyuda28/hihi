# Login Troubleshooting Guide

## ✅ Masalah yang Sudah Diperbaiki

### 1. Error: "Cannot GET /api/auth/verify"
**Solusi:** Endpoint `/api/auth/verify` sudah ditambahkan ke backend

### 2. Error: "Username and password are required" 
**Solusi:** Backend sudah diperbaiki untuk menangani request format frontend

### 3. Error: "Invalid password"
**Penyebab:** Menggunakan password yang salah

## 🔐 Kredensial Login yang Benar

**PENTING:** Gunakan kredensial ini untuk login:

- **Username:** `admin`
- **Password:** `admin123` (BUKAN "password")

## 🚀 Cara Menjalankan Backend

```bash
# Di terminal backend
cd modern-plant-classifier/backend
npm start
```

Backend akan berjalan di: `http://localhost:3000`

## 📡 Endpoint yang Tersedia

- **Health Check:** `GET http://localhost:3000/health`
- **Login:** `POST http://localhost:3000/api/auth/login`
- **Verify Token:** `GET http://localhost:3000/api/auth/verify`
- **Prediction:** `POST http://localhost:3000/api/predict`

## 🧪 Test Login dengan curl

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test verify token
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer jwt_token_123456"
```

## 🔍 Debug Frontend

Jika masih ada masalah di frontend:

1. **Cek Console Browser** - Lihat error di Developer Tools
2. **Cek Network Tab** - Lihat request/response di Network tab
3. **Pastikan Password Benar** - Gunakan "admin123" bukan "password"

## 📝 Response Format

**Login Success:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_1234567890",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@plantdisease.com",
    "role": "admin"
  }
}
```

**Login Error:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

## ⚠️ Catatan Penting

- Database menggunakan SQLite
- Password admin sudah diperbaiki di database
- Backend sudah menangani double nesting dari frontend
- Token verification sudah berfungsi

