# 🚀 Deployment & Movement Guide

## 📁 Moving modern-plant-classifier to Different Location

The `modern-plant-classifier` app can be moved to any location while maintaining ML functionality.

### Option 1: Move Within Same Project (Recommended)

```bash
# Move to subfolder
mkdir webapp
move modern-plant-classifier webapp/

# Or move to parent directory  
move modern-plant-classifier ../plant-disease-webapp/
```

### Option 2: Move to Completely Separate Project

```bash
# Copy to new location
cp -r modern-plant-classifier /path/to/new-location/

# Or use Windows
xcopy modern-plant-classifier D:\NewProject\plant-app\ /E /I
```

## ⚙️ Configuration After Moving

### 1. Copy TensorFlow.js Model (if needed)

Run the provided script in modern-plant-classifier folder:
```bash
# Windows
copy-model.bat

# Linux/Mac  
chmod +x copy-model.sh && ./copy-model.sh
```

### 2. Configure Environment Variables

Create `.env` file in backend folder:

```bash
# Copy example
cp backend/env.example backend/.env
```

Edit `.env` file:

#### For Moved Location:
```env
# If model is copied locally (recommended)
# Use default relative paths - no changes needed

# If using original model location
TFJS_MODEL_PATH=D:/Projects/klasifikasi-tanaman/tfjs_model/model.json
TFJS_CLASSES_PATH=D:/Projects/klasifikasi-tanaman/tfjs_model/classes.json
```

### 3. Install and Run

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend  
npm install
npm run dev
```

## 🔄 Synchronization Options

### A. Self-Contained (Recommended)
- Copy TensorFlow.js model to app directory
- App becomes completely independent
- No external dependencies

### B. Reference Original Model  
- Use environment variables to point to original model
- Keeps single source of truth
- Requires original folder to remain accessible

### C. Symbolic Link (Advanced)
```bash
# Create symlink to model
ln -s ../klasifikasi-tanaman/tfjs_model backend/tfjs_model
```

## 📋 Verification Checklist

After moving and configuration:

- [ ] Backend starts without errors
- [ ] Model loads successfully (check console logs)
- [ ] Frontend connects to backend
- [ ] Image upload works
- [ ] AI prediction returns results
- [ ] Admin panel accessible
- [ ] Database operations work

## 🐛 Troubleshooting

### Model Not Found Error
```
❌ Failed to load model: Error: Model not found
```

**Solutions:**
1. Check TFJS_MODEL_PATH in .env
2. Verify model files exist at specified path
3. Check file permissions
4. Use absolute paths if relative paths fail

### CORS Errors
```
❌ CORS error: Access blocked
```

**Solution:** Update FRONTEND_URL in backend .env

### Database Issues
```  
❌ Database connection failed
```

**Solution:** Check DB_PATH in .env, ensure folder is writable

## 🌍 Production Deployment

For production deployment:

1. Set NODE_ENV=production
2. Use absolute paths for model files
3. Configure proper database (PostgreSQL/MySQL)
4. Set secure JWT secrets
5. Enable HTTPS
6. Configure reverse proxy (Nginx)

## 🔗 Path Examples

### Same Machine, Different Folder:
```env
TFJS_MODEL_PATH=C:/Projects/ai-models/tfjs_model/model.json
TFJS_CLASSES_PATH=C:/Projects/ai-models/tfjs_model/classes.json
```

### Network Share:
```env
TFJS_MODEL_PATH=\\server\shared\models\tfjs_model\model.json
TFJS_CLASSES_PATH=\\server\shared\models\tfjs_model\classes.json
```

### Cloud Storage (with local cache):
```env
TFJS_MODEL_PATH=https://your-cdn.com/models/model.json
TFJS_CLASSES_PATH=https://your-cdn.com/models/classes.json
```

---

**✅ The app is designed to be portable and can run from any location!** 