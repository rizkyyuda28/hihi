# 🚫 Guest Detection Limits Documentation

## Plant Disease Classification System - Guest Detection Limits

### 📋 Overview

Sistem pembatasan deteksi untuk user yang tidak login dengan fitur:
- **2 deteksi per IP** per 24 jam untuk guest users
- **Automatic reset** setiap 24 jam
- **IP-based tracking** dengan user agent
- **Automatic blocking** ketika limit tercapai
- **Error messages** yang informatif
- **Database logging** untuk monitoring

### 🚀 Quick Start

#### 1. Setup Database dan Guest Limits
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

#### 3. Test Guest Limits
```bash
# Windows - Double click
test-guest-limits.bat

# Manual test
node test-guest-limits.js
```

### 🔧 How It Works

#### 1. Guest Detection Limit Middleware
```javascript
// src/middleware/guestDetectionLimit.js
const guestDetectionLimit = async (req, res, next) => {
  // Skip jika user sudah login
  if (req.user || req.session.userId) {
    return next();
  }
  
  // Cek IP address dan limit
  const ipAddress = req.ip || req.connection.remoteAddress;
  let guestLimit = await GuestDetectionLimit.findOne({
    where: { ipAddress }
  });
  
  // Cek apakah sudah mencapai limit
  if (guestLimit.detectionCount >= GUEST_DETECTION_LIMIT) {
    return res.status(429).json({
      error: 'Guest detection limit reached',
      message: 'You have reached the limit of 2 detections per day. Please login to continue or try again tomorrow.',
      limitReached: true,
      remainingDetections: 0
    });
  }
  
  next();
};
```

#### 2. Database Schema
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

#### 3. Controller Integration
```javascript
// src/controllers/predictionController.js
// Update guest detection limit after successful prediction
if (!req.user && req.guestLimit) {
  await req.guestLimit.update({
    detectionCount: req.guestLimit.detectionCount + 1,
    lastDetectionAt: new Date()
  });
}
```

### 📊 API Endpoints

#### Guest Detection Limit Check
- **GET** `/api/predict/guest-limit` - Check current guest limit status

#### Plant Disease Prediction (with Guest Limits)
- **POST** `/api/predict` - Predict plant disease (guest limited to 2 per IP)

### 🔒 Security Features

#### IP-based Tracking
- **Unique IP tracking** untuk setiap guest user
- **User agent logging** untuk additional security
- **Automatic IP detection** dari request headers

#### Limit Enforcement
- **2 detections per IP** per 24 hours
- **Automatic blocking** ketika limit tercapai
- **Reset after 24 hours** secara otomatis
- **Fail-safe behavior** jika ada error

#### Error Handling
- **Informative error messages** untuk user
- **Status code 429** untuk rate limiting
- **Reset time information** untuk user guidance
- **Graceful degradation** jika sistem error

### 📈 Monitoring & Logs

#### Database Queries
```sql
-- Check current guest limits
SELECT ip_address, detection_count, is_blocked, last_detection_at 
FROM guest_detection_limits 
ORDER BY created_at DESC;

-- Check blocked IPs
SELECT ip_address, detection_count, blocked_at 
FROM guest_detection_limits 
WHERE is_blocked = true;

-- Check detection counts by IP
SELECT ip_address, detection_count, 
       CASE WHEN detection_count >= 2 THEN 'LIMIT REACHED' 
            ELSE 'OK' END as status
FROM guest_detection_limits;
```

#### Log Monitoring
```bash
# Check backend logs for guest limit messages
grep "Guest detection limit" logs/app.log

# Check for blocked requests
grep "429" logs/app.log
```

### 🧪 Testing

#### Manual Testing
1. **Upload image tanpa login** - Seharusnya berhasil
2. **Upload image kedua tanpa login** - Seharusnya berhasil
3. **Upload image ketiga tanpa login** - Seharusnya gagal dengan error 429
4. **Check guest limit status** - Seharusnya menunjukkan limit reached

#### Automated Testing
```bash
# Run comprehensive guest limits test
test-guest-limits.bat

# Check system integration
verify-guest-limits.bat
```

#### Test Scenarios
- **Single IP testing** - Test dengan IP yang sama
- **Multiple IP testing** - Test dengan IP berbeda
- **Limit reset testing** - Test reset setelah 24 jam
- **Error handling testing** - Test behavior saat error

### 🔄 Maintenance

#### Daily Tasks
- **Monitor guest limits** untuk abuse patterns
- **Check blocked IPs** dan reset jika diperlukan
- **Review detection patterns** untuk insights

#### Weekly Tasks
- **Clean old guest limit records** (optional)
- **Analyze guest behavior** patterns
- **Update limit policies** jika diperlukan

#### Monthly Tasks
- **Review limit effectiveness** dan adjust
- **Backup guest limit data** untuk analysis
- **Update security policies** berdasarkan data

### 🚨 Troubleshooting

#### Common Issues

1. **"Guest limit not working"**
   ```bash
   # Check if middleware is enabled
   grep "guestDetectionLimit" src/routes/predictionRoutes.js
   
   # Check database table
   psql -U postgres -d plant_classifier_dev -c "SELECT * FROM guest_detection_limits;"
   ```

2. **"Limit not resetting after 24 hours"**
   ```bash
   # Check last detection time
   psql -U postgres -d plant_classifier_dev -c "SELECT ip_address, last_detection_at, detection_count FROM guest_detection_limits;"
   
   # Manual reset
   psql -U postgres -d plant_classifier_dev -c "UPDATE guest_detection_limits SET detection_count = 0, is_blocked = false;"
   ```

3. **"Error 429 not showing"**
   ```bash
   # Check middleware order
   grep -A 10 "router.post('/predict'" src/routes/predictionRoutes.js
   
   # Check controller logic
   grep -A 5 "guestLimit" src/controllers/predictionController.js
   ```

#### Debug Commands

```bash
# Check guest limits table
psql -U postgres -d plant_classifier_dev -c "SELECT * FROM guest_detection_limits ORDER BY created_at DESC;"

# Check prediction routes
grep -n "guestDetectionLimit" src/routes/predictionRoutes.js

# Check middleware files
ls -la src/middleware/guestDetectionLimit.js

# Test API endpoint
curl -X GET http://localhost:3000/api/predict/guest-limit
```

### 📈 Performance

#### Database Optimization
- **Indexes** pada ip_address dan is_blocked
- **Automatic cleanup** untuk old records
- **Efficient queries** untuk limit checking

#### Memory Management
- **Minimal data storage** untuk guest limits
- **Automatic cleanup** setelah reset
- **Efficient middleware** execution

#### Rate Limiting
- **IP-based limits** untuk guest users
- **Automatic reset** setiap 24 jam
- **Graceful degradation** saat error

### 🔄 Future Enhancements

#### Planned Features
- **Dynamic limit adjustment** berdasarkan usage patterns
- **IP whitelisting** untuk trusted sources
- **Advanced analytics** untuk guest behavior
- **Mobile app** integration
- **Real-time monitoring** dashboard

#### Security Improvements
- **Advanced IP detection** untuk proxy/VPN
- **Behavioral analysis** untuk abuse detection
- **Machine learning** untuk limit optimization
- **Advanced logging** untuk security audit

### 📞 Support

Jika mengalami masalah dengan guest detection limits:

1. **Check logs** di console backend
2. **Verify database** connection dan tables
3. **Test endpoints** dengan Postman atau curl
4. **Review middleware** configuration
5. **Run diagnostic scripts** yang tersedia

### 📝 Changelog

#### Version 1.0.0
- ✅ Initial guest detection limits implementation
- ✅ 2 detections per IP per 24 hours
- ✅ Automatic limit reset
- ✅ IP-based tracking
- ✅ User agent logging
- ✅ Automatic blocking
- ✅ Informative error messages
- ✅ Database logging
- ✅ Comprehensive testing suite
- ✅ Monitoring and maintenance tools

---

**🎉 Guest detection limits siap digunakan! Silakan jalankan `test-guest-limits.bat` untuk test lengkap.**
