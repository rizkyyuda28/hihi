# 🔐 Login System Documentation

## Plant Disease Classification System - Complete Login System

### 📋 Overview

Sistem login yang lengkap untuk Plant Disease Classification System dengan fitur:
- **User Authentication** dengan JWT tokens
- **Password Hashing** menggunakan bcrypt
- **Role-based Access Control** (admin/user)
- **Session Management** dengan express-session
- **Login Audit Logs** untuk keamanan
- **Guest Detection Limits** (2 deteksi per IP)
- **Detection History** untuk user yang login

### 🚀 Quick Start

#### 1. Setup Database dan Login System
```bash
# Windows - Double click
complete-login-setup.bat

# Manual setup
setup-database.bat
setup-login-system.bat
quick-fix-predictions.bat
```

#### 2. Restart Backend
```bash
# Stop backend (Ctrl+C)
# Start backend lagi
npm start
```

#### 3. Test Login System
```bash
# Windows - Double click
test-login-system.bat

# Manual test
node test-login-system.js
```

### 👥 Default Accounts

| Username | Password | Role  | Description |
|----------|----------|-------|-------------|
| admin    | admin123 | admin | Administrator account |
| user     | user123  | user  | Regular user account |

### 🔧 API Endpoints

#### Authentication
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/verify` - Verify JWT token
- **POST** `/api/auth/register-admin` - Register admin (initial setup)

#### Detection History (Authenticated Users)
- **GET** `/api/detection-history/my-history` - Get user's detection history
- **GET** `/api/detection-history/:id` - Get specific detection detail
- **DELETE** `/api/detection-history/:id` - Delete detection record
- **GET** `/api/detection-history/stats/summary` - Get detection statistics
- **GET** `/api/detection-history/search` - Search detection history

#### Plant Disease Prediction
- **POST** `/api/predict` - Predict plant disease (with guest limits)
- **GET** `/api/predict/guest-limit` - Check guest detection limit
- **GET** `/api/predict/allowed-keywords` - Get allowed filename keywords

### 🗄️ Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Detection History Table
```sql
CREATE TABLE detection_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    image_filename VARCHAR(255),
    original_image_name VARCHAR(255),
    prediction_result JSONB,
    confidence DECIMAL(5,2),
    plant_class VARCHAR(100),
    recommendations TEXT,
    is_guest BOOLEAN DEFAULT false,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Guest Detection Limits Table
```sql
CREATE TABLE guest_detection_limits (
    id SERIAL PRIMARY KEY,
    ip_address INET UNIQUE NOT NULL,
    detection_count INTEGER DEFAULT 0,
    last_detection_at TIMESTAMP WITH TIME ZONE,
    is_blocked BOOLEAN DEFAULT false,
    blocked_at TIMESTAMP WITH TIME ZONE,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 🔒 Security Features

#### Password Security
- **bcrypt hashing** dengan salt rounds 10
- **Password validation** sebelum hash
- **Secure password storage** di database

#### JWT Token Security
- **24-hour expiration** untuk token
- **Role-based claims** dalam token
- **Token verification** middleware
- **Secure secret key** dari environment

#### Rate Limiting
- **15 minutes window** dengan 100 requests per IP
- **Guest detection limits** (2 deteksi per IP per 24 jam)
- **IP-based blocking** untuk guest users

#### Session Management
- **Express-session** dengan secure cookies
- **Session expiration** 24 jam
- **HTTP-only cookies** untuk keamanan
- **CSRF protection** dengan helmet

### 🛡️ Middleware

#### Authentication Middleware
```javascript
// Required authentication
app.use('/api/detection-history', authenticateToken);

// Optional authentication (guest allowed)
app.use('/api/predict', optionalAuth);
```

#### Guest Detection Limit Middleware
```javascript
// Enforce 2-detection limit for guests
app.use('/api/predict', guestDetectionLimit);
```

#### Dataset Validation Middleware
```javascript
// Validate uploaded filenames against dataset
app.use('/api/predict', validateDatasetFilename);
```

### 📊 User Experience

#### Guest Users
- **2 deteksi per IP** per 24 jam
- **No detection history** stored
- **Basic prediction** functionality
- **Filename validation** required

#### Authenticated Users
- **Unlimited detections** per session
- **Full detection history** accessible
- **Advanced features** available
- **Personal dashboard** with statistics

#### Admin Users
- **All user features** plus admin panel
- **User management** capabilities
- **System monitoring** and logs
- **Dataset management** tools

### 🔍 Monitoring & Logs

#### Login Logs
```sql
SELECT * FROM login_logs 
WHERE login_status = 'failed' 
ORDER BY created_at DESC;
```

#### Detection Statistics
```sql
SELECT 
    COUNT(*) as total_detections,
    COUNT(CASE WHEN is_guest = false THEN 1 END) as authenticated_detections,
    COUNT(CASE WHEN is_guest = true THEN 1 END) as guest_detections
FROM detection_history;
```

#### Guest Limit Monitoring
```sql
SELECT 
    ip_address,
    detection_count,
    is_blocked,
    last_detection_at
FROM guest_detection_limits
WHERE is_blocked = true;
```

### 🚨 Troubleshooting

#### Common Issues

1. **"Database connection failed"**
   ```bash
   # Check PostgreSQL is running
   psql -U postgres -c "SELECT version();"
   
   # Check database exists
   psql -U postgres -c "\l"
   ```

2. **"Invalid credentials"**
   ```bash
   # Check user exists
   psql -U postgres -d plant_classifier_dev -c "SELECT * FROM users;"
   
   # Reset password
   psql -U postgres -d plant_classifier_dev -c "UPDATE users SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE username = 'admin';"
   ```

3. **"Token verification failed"**
   ```bash
   # Check JWT_SECRET in environment
   echo $JWT_SECRET
   
   # Restart backend
   npm start
   ```

4. **"Guest limit exceeded"**
   ```bash
   # Reset guest limits
   psql -U postgres -d plant_classifier_dev -c "UPDATE guest_detection_limits SET detection_count = 0, is_blocked = false;"
   ```

#### Debug Commands

```bash
# Check database tables
psql -U postgres -d plant_classifier_dev -c "\dt"

# Check user accounts
psql -U postgres -d plant_classifier_dev -c "SELECT username, email, role, is_active FROM users;"

# Check detection history
psql -U postgres -d plant_classifier_dev -c "SELECT COUNT(*) FROM detection_history;"

# Check guest limits
psql -U postgres -d plant_classifier_dev -c "SELECT ip_address, detection_count, is_blocked FROM guest_detection_limits;"
```

### 📈 Performance

#### Database Indexes
- **Primary keys** pada semua tabel
- **Foreign key indexes** untuk relationships
- **Composite indexes** untuk queries yang sering
- **Timestamp indexes** untuk sorting

#### Caching
- **JWT token caching** untuk performance
- **Session storage** dengan memory store
- **Static file caching** untuk uploads

#### Optimization
- **Connection pooling** untuk database
- **Query optimization** dengan Sequelize
- **Rate limiting** untuk resource protection

### 🔄 Maintenance

#### Daily Tasks
- **Monitor login logs** untuk security
- **Check guest limits** untuk abuse
- **Verify database health** dengan health checks

#### Weekly Tasks
- **Clean old sessions** dan expired tokens
- **Archive old detection history** jika diperlukan
- **Update security patches** dan dependencies

#### Monthly Tasks
- **Review user accounts** dan permissions
- **Analyze detection patterns** untuk insights
- **Backup database** dan configuration

### 🚀 Future Enhancements

#### Planned Features
- **Two-factor authentication** (2FA)
- **Password reset** functionality
- **Email notifications** untuk detections
- **Advanced user roles** dan permissions
- **API rate limiting** per user
- **Mobile app** authentication

#### Security Improvements
- **OAuth integration** (Google, GitHub)
- **Advanced session management** dengan Redis
- **Audit logging** yang lebih detail
- **IP whitelisting** untuk admin access

### 📞 Support

Jika mengalami masalah dengan login system:

1. **Check logs** di console backend
2. **Verify database** connection dan tables
3. **Test endpoints** dengan Postman atau curl
4. **Review configuration** di environment files
5. **Run diagnostic scripts** yang tersedia

### 📝 Changelog

#### Version 1.0.0
- ✅ Initial login system implementation
- ✅ JWT token authentication
- ✅ Password hashing dengan bcrypt
- ✅ Role-based access control
- ✅ Guest detection limits
- ✅ Detection history untuk users
- ✅ Session management
- ✅ Login audit logs
- ✅ Complete API documentation
- ✅ Automated setup scripts
- ✅ Comprehensive testing suite

---

**🎉 Login system siap digunakan! Silakan jalankan `complete-login-setup.bat` untuk setup lengkap.**
