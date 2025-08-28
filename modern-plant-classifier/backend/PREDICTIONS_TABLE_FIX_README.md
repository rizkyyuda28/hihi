# Predictions Table Fix Guide

## Overview
Panduan untuk memperbaiki masalah struktur tabel `predictions` yang tidak sesuai dengan model Sequelize.

## Masalah yang Ditemui

### **1. Column Name Mismatch**
```
❌ Failed to save prediction to database: column "is_real_m_l" of relation "predictions" does not exist
```

**Root Cause:**
- Sequelize mencoba insert ke column `is_real_m_l` 
- Tapi database memiliki column `is_real_ml`
- Ada typo atau konfigurasi Sequelize yang salah

### **2. Sequelize Configuration Issue**
- `underscored: false` di config database
- Sequelize tidak otomatis convert camelCase ke snake_case
- Model menggunakan `isRealML` tapi database `is_real_ml`

## Solusi

### **Option 1: Fix Sequelize Config (Recommended)**

#### **Update Database Config**
File: `src/config/database.js`
```javascript
define: {
  timestamps: true,
  underscored: true,  // Changed from false to true
  freezeTableName: false
}
```

#### **Restart Backend**
```bash
# Stop backend
Ctrl+C

# Start backend again
npm start
```

### **Option 2: Fix Database Table Structure**

#### **Run Fix Script**
```bash
# Windows
fix-predictions-table-v2.bat

# Manual SQL
psql -U postgres -d plant_classifier_dev -f fix-predictions-table-v2.sql
```

## File Scripts

### **1. `fix-predictions-table-v2.sql`**
- Drop dan recreate tabel predictions
- Struktur sesuai Sequelize `underscored: true`
- Column names: `image_filename`, `predicted_class`, `is_real_ml`

### **2. `fix-predictions-table-v2.bat`**
- Script otomatis untuk Windows
- Check connection dan database
- Run fix script dan verification

### **3. `fresh-database-setup.sql`**
- Setup database lengkap dari awal
- Drop semua tabel dan buat ulang
- Struktur yang benar untuk semua tabel

## Column Mapping

### **Sequelize Model → Database Column**
```
imageFilename → image_filename
imagePath → image_path
predictedClass → predicted_class
predictedClassId → predicted_class_id
plantType → plant_type
diseaseType → disease_type
isHealthy → is_healthy
processingTime → processing_time
modelUsed → model_used
modelAccuracy → model_accuracy
allProbabilities → all_probabilities
userAgent → user_agent
ipAddress → ip_address
isRealML → is_real_ml
createdAt → created_at
updatedAt → updated_at
```

## Verification

### **Check Table Structure**
```sql
-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'predictions' 
ORDER BY ordinal_position;

-- Expected columns:
-- id, image_filename, image_path, predicted_class, predicted_class_id
-- confidence, plant_type, disease_type, is_healthy, processing_time
-- model_used, model_accuracy, all_probabilities, user_agent
-- ip_address, is_real_ml, metadata, created_at, updated_at
```

### **Check Indexes**
```sql
-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'predictions'
ORDER BY indexname;
```

### **Test Insert**
```sql
-- Test insert sample data
INSERT INTO predictions (
    image_filename, predicted_class, predicted_class_id, 
    confidence, plant_type, disease_type, is_healthy, 
    processing_time, model_used, model_accuracy
) VALUES (
    'test.jpg', 'Corn_(maize)___healthy', 1, 
    0.95, 'Corn', 'Healthy', true, 
    1000, 'test-model', '90%'
);
```

## Troubleshooting

### **1. Still Getting Column Errors**
```bash
# Check if backend restarted
ps aux | grep node

# Check Sequelize logs
# Look for "Executing (default): INSERT INTO..."

# Verify database connection
psql -U postgres -d plant_classifier_dev -c "SELECT current_database();"
```

### **2. Database Sync Issues**
```javascript
// In database.js, check sync options
await sequelize.sync({ alter: true }); // This will auto-fix table structure
```

### **3. Model Definition Issues**
```javascript
// In Prediction.js, ensure field names match
isRealML: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: true
}
```

## Complete Fix Process

### **Step 1: Update Sequelize Config**
```bash
# Edit src/config/database.js
# Change underscored: false to underscored: true
```

### **Step 2: Fix Database Table**
```bash
# Run fix script
./fix-predictions-table-v2.bat

# Or manual SQL
psql -U postgres -d plant_classifier_dev -f fix-predictions-table-v2.sql
```

### **Step 3: Restart Backend**
```bash
# Stop backend
Ctrl+C

# Start backend
npm start
```

### **Step 4: Test**
```bash
# Check health endpoint
curl http://localhost:3000/health

# Test prediction endpoint
curl -X POST http://localhost:3000/api/predict/predict \
  -F "image=@test-image.jpg"
```

## Prevention

### **1. Always Use underscored: true**
```javascript
// In database config
define: {
  timestamps: true,
  underscored: true,  // Always true for PostgreSQL
  freezeTableName: false
}
```

### **2. Consistent Naming Convention**
- Model fields: camelCase (`isRealML`)
- Database columns: snake_case (`is_real_ml`)
- Sequelize handles conversion automatically

### **3. Database Schema Validation**
```bash
# Regular check
psql -U postgres -d plant_classifier_dev -c "\d predictions"

# Compare with model definition
# Ensure all required columns exist
```

## Support

### **Common Issues**
- Column name typos
- Sequelize config not updated
- Backend not restarted after config change
- Database table structure mismatch

### **Next Steps**
- Test prediction functionality
- Verify detection history
- Check guest detection limits
- Test complete workflow

### **Files to Check**
- `src/config/database.js` - Sequelize config
- `src/models/Prediction.js` - Model definition
- `fix-predictions-table-v2.sql` - Database fix script
- `fix-predictions-table-v2.bat` - Windows automation script
