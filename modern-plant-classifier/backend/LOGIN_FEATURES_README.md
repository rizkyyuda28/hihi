# Login Features & Guest Detection Limits

## Overview
Sistem Plant Disease Classification sekarang memiliki fitur login dengan batasan deteksi untuk guest user dan riwayat deteksi untuk user yang sudah login.

## Fitur Utama

### 1. Guest Detection Limits
- **Batasan**: Guest user hanya bisa melakukan deteksi maksimal 2 kali per IP address
- **Reset**: Limit akan di-reset setiap 24 jam
- **Tracking**: Sistem melacak IP address dan user agent untuk monitoring

### 2. User Authentication
- **Login/Register**: User dapat membuat akun dan login
- **JWT Token**: Authentication menggunakan JWT token
- **Session Management**: Support untuk session-based dan token-based auth

### 3. Detection History
- **Riwayat Lengkap**: Semua deteksi tersimpan dengan detail lengkap
- **User Dashboard**: User yang login dapat melihat riwayat deteksi mereka
- **Search & Filter**: Fitur pencarian dan filter berdasarkan tanggal, plant class, dll

## Database Schema

### Tabel Baru

#### 1. `detection_history`
```sql
- id: Primary key
- user_id: Foreign key ke users (null untuk guest)
- ip_address: IP address user
- user_agent: Browser/device info
- image_file_name: Nama file gambar
- original_image_name: Nama asli file
- prediction_result: JSON hasil prediksi
- confidence: Tingkat kepercayaan prediksi
- plant_class: Klasifikasi tanaman
- recommendations: Rekomendasi treatment
- is_guest: Boolean untuk guest user
- session_id: Session ID untuk tracking
- created_at, updated_at: Timestamps
```

#### 2. `guest_detection_limits`
```sql
- id: Primary key
- ip_address: IP address (unique)
- detection_count: Jumlah deteksi yang sudah dilakukan
- last_detection_at: Waktu deteksi terakhir
- is_blocked: Status blocked
- blocked_at: Waktu blocked
- user_agent: Browser/device info
- created_at, updated_at: Timestamps
```

## API Endpoints

### Authentication
```
POST /api/auth/register    - Register user baru
POST /api/auth/login       - Login user
POST /api/auth/logout      - Logout user
GET  /api/auth/profile     - Get user profile
```

### Detection History
```
GET  /api/detection-history/my-history     - Riwayat deteksi user
GET  /api/detection-history/:id            - Detail deteksi spesifik
DELETE /api/detection-history/:id          - Hapus riwayat deteksi
GET  /api/detection-history/stats/summary  - Statistik deteksi
GET  /api/detection-history/search         - Search riwayat deteksi
```

### Guest Limit Check
```
GET  /api/predict/guest-limit              - Cek limit deteksi guest
```

## Middleware

### 1. `guestDetectionLimit`
- Mengecek apakah user sudah mencapai limit deteksi
- Hanya berlaku untuk guest user (tidak login)
- Auto-reset setelah 24 jam

### 2. `authenticateToken`
- Verifikasi JWT token
- Mengambil user data dari database
- Handle token expired dan invalid

### 3. `optionalAuth`
- Authentication opsional
- User bisa akses sebagai guest atau authenticated user

## Cara Penggunaan

### 1. Setup Database
```bash
# Buat database baru
psql -U postgres -c "CREATE DATABASE plant_classifier_dev;"

# Jalankan setup script
psql -U postgres -d plant_classifier_dev -f database-setup.sql

# Atau update database yang sudah ada
psql -U postgres -d your_existing_db -f database-update.sql
```

### 2. Seed Data
```bash
# Insert sample data
psql -U postgres -d plant_classifier_dev -f database-seed.sql
```

### 3. Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plant_classifier_dev
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Session
SESSION_SECRET=your-super-secret-session-key
```

## Flow Deteksi

### Guest User
1. Upload gambar
2. Middleware cek limit deteksi
3. Jika belum limit: proses deteksi dan simpan ke history
4. Jika sudah limit: return error 429 dengan pesan limit reached
5. Update counter deteksi di `guest_detection_limits`

### Authenticated User
1. Upload gambar dengan token/session
2. Proses deteksi tanpa batasan
3. Simpan ke history dengan `user_id`
4. User bisa lihat riwayat di dashboard

## Monitoring & Maintenance

### 1. Backup Database
```bash
# Linux/Mac
./database-backup-restore.sh backup

# Windows
database-backup-restore.bat backup
```

### 2. Reset Guest Limits
```bash
# Reset semua limit
psql -U postgres -d plant_classifier_dev -f database-reset-guest-limits.sql

# Reset specific IP
UPDATE guest_detection_limits 
SET detection_count = 0, is_blocked = false 
WHERE ip_address = '192.168.1.100';
```

### 3. View Statistics
```sql
-- Total deteksi per user
SELECT 
    COALESCE(u.username, 'Guest') as user_type,
    COUNT(*) as total_detections
FROM detection_history dh
LEFT JOIN users u ON dh.user_id = u.id
GROUP BY u.username
ORDER BY total_detections DESC;

-- Guest detection limits status
SELECT 
    ip_address,
    detection_count,
    is_blocked,
    CASE 
        WHEN is_blocked THEN 'Blocked'
        WHEN detection_count >= 2 THEN 'Warning'
        ELSE 'OK'
    END as status
FROM guest_detection_limits
ORDER BY created_at DESC;
```

## Security Features

### 1. Rate Limiting
- Global rate limit: 100 requests per 15 minutes per IP
- Guest detection limit: 2 deteksi per 24 jam per IP

### 2. Input Validation
- File upload validation (size, type)
- User input sanitization
- SQL injection prevention

### 3. Authentication
- JWT token dengan expiration
- Password hashing dengan bcrypt
- Session management yang aman

## Troubleshooting

### 1. Guest Limit Not Working
- Cek apakah middleware `guestDetectionLimit` sudah terpasang
- Verifikasi tabel `guest_detection_limits` sudah dibuat
- Cek log untuk error database

### 2. Authentication Issues
- Verifikasi JWT_SECRET sudah diset
- Cek apakah user ada di database
- Pastikan token tidak expired

### 3. Database Connection
- Test connection dengan `psql`
- Verifikasi environment variables
- Cek PostgreSQL service status

## Performance Considerations

### 1. Indexes
- Semua tabel sudah memiliki indexes yang diperlukan
- Index pada `user_id`, `ip_address`, `created_at`

### 2. Cleanup
- File upload otomatis dihapus setelah processing
- Guest limits auto-reset setiap 24 jam
- Backup rotation untuk database

### 3. Caching
- Consider Redis untuk caching user sessions
- Cache ML model predictions
- Rate limiting dengan Redis

## Future Enhancements

### 1. Advanced Analytics
- Dashboard analytics untuk admin
- User behavior tracking
- Performance metrics

### 2. Multi-tenancy
- Support untuk multiple organizations
- Role-based access control
- Data isolation

### 3. API Rate Limiting
- Per-user rate limiting
- Tiered access levels
- API key management
