# Dataset Filename Validation

## Overview
Sistem Plant Disease Classification sekarang memiliki fitur validasi nama file berdasarkan dataset tanaman yang tersedia. Hanya foto dengan nama file yang mengandung kata kunci terkait dataset yang bisa dideteksi.

## Fitur Utama

### 1. **Validasi Nama File**
- Hanya file dengan nama yang mengandung kata kunci dataset yang bisa diupload
- Validasi berdasarkan nama tumbuhan dan penyakit yang ada di dataset
- Support untuk bahasa Indonesia dan Inggris

### 2. **Kata Kunci yang Diizinkan**
- **Nama Tumbuhan**: corn, maize, jagung, potato, kentang, tomato, tomat
- **Nama Penyakit**: healthy, blight, rust, mold, virus, bacterial, spot, mite
- **Variasi Bahasa**: Support untuk bahasa Indonesia dan Inggris
- **Nama Ilmiah**: Solanum tuberosum, Zea mays, Solanum lycopersicum

### 3. **Deteksi Otomatis**
- Otomatis mendeteksi jenis tumbuhan dari nama file
- Otomatis mendeteksi jenis penyakit dari nama file
- Metadata lengkap tersimpan di database

## Dataset yang Didukung

### **Corn/Maize (Jagung)**
```
- Corn_(maize)___healthy
- Corn_(maize)___Common_rust_
- Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot
- Corn_(maize)___Northern_Leaf_Blight
```

### **Potato (Kentang)**
```
- Potato___healthy
- Potato___Early_blight
- Potato___Late_blight
```

### **Tomato (Tomat)**
```
- Tomato___healthy
- Tomato___Bacterial_spot
- Tomato___Early_blight
- Tomato___Late_blight
- Tomato___Leaf_Mold
- Tomato___Septoria_leaf_spot
- Tomato___Spider_mites Two-spotted_spider_mite
- Tomato___Target_Spot
- Tomato___Tomato_mosaic_virus
- Tomato___Tomato_Yellow_Leaf_Curl_Virus
```

## Contoh Nama File yang Valid

### **Format Dasar**
```
{tumbuhan}_{penyakit}.{extensi}
```

### **Contoh Valid**
```
✅ corn_healthy.jpg
✅ tomato_blight.jpg
✅ potato_rust.jpg
✅ jagung_sehat.jpg
✅ tomat_penyakit.jpg
✅ kentang_healthy.jpg
✅ maize_common_rust.jpg
✅ solanum_tuberosum_early_blight.jpg
✅ lycopersicon_esculentum_leaf_mold.jpg
✅ zea_mays_gray_leaf_spot.jpg
```

### **Contoh Tidak Valid**
```
❌ random_image.jpg
❌ IMG_001.jpg
❌ photo.jpg
❌ test.jpg
❌ sample.png
❌ image_123.webp
❌ camera_shot.jpeg
❌ screenshot.jpg
```

## API Endpoints

### **Upload dengan Validasi**
```
POST /api/predict/predict
```
- File harus melewati validasi nama file
- Middleware `validateDatasetFilename` akan mengecek nama file
- Hanya file dengan nama valid yang bisa diproses

### **Cek Kata Kunci yang Diizinkan**
```
GET /api/predict/allowed-keywords
```
Response:
```json
{
  "success": true,
  "data": {
    "allowedKeywords": ["corn", "maize", "jagung", "potato", "kentang", ...],
    "plantNames": ["corn", "maize", "jagung", "potato", "kentang", "tomato", "tomat"],
    "diseaseNames": ["healthy", "blight", "rust", "mold", "virus", ...],
    "totalKeywords": 45,
    "examples": [
      "corn_healthy.jpg",
      "tomato_blight.jpg",
      "potato_rust.jpg"
    ]
  }
}
```

## Middleware

### **validateDatasetFilename**
```javascript
const { validateDatasetFilename } = require('../middleware/datasetValidationMiddleware');

// Gunakan di routes
router.post('/predict', 
  handleImageUpload,
  validateUploadedFile,
  validateDatasetFilename, // Validasi nama file
  predictionController.predictDisease
);
```

### **Fungsi Helper**
```javascript
const { 
  containsAllowedWords,
  getPlantTypeFromFilename,
  getDiseaseTypeFromFilename 
} = require('../middleware/datasetValidationMiddleware');

// Cek apakah nama file valid
const isValid = containsAllowedWords('corn_healthy.jpg'); // true

// Dapatkan jenis tumbuhan
const plantType = getPlantTypeFromFilename('jagung_rust.jpg'); // 'corn'

// Dapatkan jenis penyakit
const diseaseType = getDiseaseTypeFromFilename('tomato_blight.jpg'); // 'blight'
```

## Flow Validasi

### **1. Upload File**
```
User upload file → handleImageUpload → validateUploadedFile → validateDatasetFilename
```

### **2. Validasi Nama File**
```
- Cek ekstensi file (.jpg, .jpeg, .png, .webp)
- Cek apakah nama file mengandung kata kunci yang diizinkan
- Ekstrak informasi tumbuhan dan penyakit
- Tambah metadata ke request
```

### **3. Proses Deteksi**
```
- Jika validasi berhasil → lanjut ke ML prediction
- Jika validasi gagal → return error 400 dengan pesan detail
```

## Response Error

### **Nama File Tidak Valid**
```json
{
  "success": false,
  "error": "Invalid filename",
  "message": "Filename must contain plant or disease related keywords from the dataset",
  "filename": "random_image.jpg",
  "allowedKeywords": ["corn", "maize", "jagung", "potato", "kentang", ...],
  "suggestion": "Please rename your file to include plant/disease keywords (e.g., corn_healthy.jpg, tomato_blight.jpg)"
}
```

### **Ekstensi File Tidak Valid**
```json
{
  "success": false,
  "error": "Invalid file type",
  "message": "Only .jpg, .jpeg, .png, .webp files are allowed",
  "allowedExtensions": [".jpg", ".jpeg", ".png", ".webp"]
}
```

## Metadata yang Ditambahkan

### **req.fileMetadata**
```javascript
{
  originalName: "corn_healthy.jpg",
  plantType: "corn",
  diseaseType: "healthy",
  isValidDataset: true
}
```

### **Response dengan Metadata**
```json
{
  "success": true,
  "prediction": {
    // ... prediction data ...
    "filenameAnalysis": {
      "originalName": "corn_healthy.jpg",
      "detectedPlantType": "corn",
      "detectedDiseaseType": "healthy",
      "validationPassed": true
    }
  }
}
```

## Testing

### **Run Tests**
```bash
# Test validasi dataset filename
node test-dataset-validation.js
```

### **Test Coverage**
- ✅ Validasi nama file
- ✅ Deteksi jenis tumbuhan
- ✅ Deteksi jenis penyakit
- ✅ Kata kunci yang diizinkan
- ✅ Edge cases dan error handling
- ✅ Integrasi middleware

## Konfigurasi

### **Environment Variables**
```env
# Tidak ada konfigurasi khusus yang diperlukan
# Word list sudah hardcoded berdasarkan dataset yang tersedia
```

### **Customization**
Untuk menambah kata kunci baru, edit file `datasetValidationMiddleware.js`:

```javascript
const ALLOWED_PLANT_NAMES = [
  // ... existing words ...
  'new_plant_name' // Tambah kata kunci baru
];

const ALLOWED_DISEASE_NAMES = [
  // ... existing words ...
  'new_disease_name' // Tambah kata kunci baru
];
```

## Monitoring & Logging

### **Log Validasi**
```
[Dataset Validation] ℹ️ File validation passed: corn_healthy.jpg (Plant: corn, Disease: healthy)
```

### **Error Logging**
```
❌ Dataset validation error: Error message
```

## Troubleshooting

### **1. File Ditolak Meski Nama Valid**
- Cek apakah ada spasi atau karakter khusus di nama file
- Pastikan ekstensi file benar (.jpg, .jpeg, .png, .webp)
- Cek log untuk error detail

### **2. Kata Kunci Tidak Dikenali**
- Pastikan kata kunci ada di `ALLOWED_WORDS`
- Cek case sensitivity (huruf besar/kecil)
- Gunakan endpoint `/api/predict/allowed-keywords` untuk cek kata kunci yang tersedia

### **3. Middleware Error**
- Pastikan middleware `validateDatasetFilename` sudah terpasang
- Cek import dan require path
- Verifikasi file `datasetValidationMiddleware.js` ada

## Best Practices

### **1. Nama File yang Baik**
```
✅ corn_healthy_001.jpg
✅ tomato_early_blight_2024.jpg
✅ potato_late_blight_field_1.jpg
```

### **2. Nama File yang Kurang Baik**
```
⚠️ corn.jpg (tidak ada indikator penyakit)
⚠️ healthy.jpg (tidak ada indikator tumbuhan)
⚠️ plant_disease.jpg (terlalu umum)
```

### **3. Struktur Nama File**
```
{jenis_tumbuhan}_{jenis_penyakit}_{tambahan_info}.{extensi}
```

## Future Enhancements

### **1. Dynamic Word List**
- Load kata kunci dari database
- Admin bisa tambah/edit kata kunci
- Support untuk multiple languages

### **2. Advanced Validation**
- Pattern matching dengan regex
- Fuzzy matching untuk typo
- Machine learning untuk nama file

### **3. File Content Validation**
- Validasi konten gambar
- Cek apakah gambar sesuai dengan nama file
- AI-powered content verification
