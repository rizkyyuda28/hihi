# Modern Plant Disease Classification System

Sistem deteksi penyakit tanaman yang dinamis dengan admin panel untuk mengelola data tanaman dan dataset machine learning.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation & Setup

1. **Install semua dependencies:**
   ```bash
   npm run install:all
   ```

2. **Setup database:**
   ```bash
   npm run setup
   ```

3. **Jalankan sistem:**
   ```bash
   npm start
   ```

### Alternative: Gunakan Batch File (Windows)
```bash
start-system.bat
```

## 🌐 Access URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 🔐 Default Admin Login

- **Username:** admin
- **Password:** admin123

## 📁 Project Structure

```
modern-plant-classifier/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   └── config/         # Database config
│   ├── database.sqlite     # SQLite database
│   └── start-backend.js    # Main server file
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── contexts/       # React contexts
│   └── package.json
└── klasifikasi-tanaman/    # Dataset & ML models
    └── Dataset tanaman/    # Training images
```

## 🛠️ Features

### ✅ Implemented
- [x] User authentication (login/logout)
- [x] Admin dashboard
- [x] Plant disease classification
- [x] SQLite database integration
- [x] Dynamic plant data management
- [x] Prediction history tracking
- [x] Responsive UI with Tailwind CSS

### 🔄 In Progress
- [ ] Real ML model integration
- [ ] Dataset management from admin panel
- [ ] Advanced prediction analytics

## 🐛 Troubleshooting

### Port Already in Use
Jika port 3001 atau 5173 sudah digunakan:
```bash
# Kill processes on specific ports
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Database Issues
```bash
# Reset database
cd backend
rm database.sqlite
node setup-database.js
```

### Frontend Not Loading
1. Check if backend is running on port 3001
2. Check browser console for CORS errors
3. Verify API base URL in `frontend/src/services/api.js`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token

### Predictions
- `POST /api/predict` - Classify plant disease
- `GET /api/predict/history` - Get prediction history

### Health
- `GET /health` - Server health check

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Management
```bash
cd backend
node setup-database.js  # Setup/reset database
```

## 📊 Database Schema

### Users Table
- id, username, email, password, role, is_active

### Plants Table
- id, name, scientific_name, description, is_active

### Diseases Table
- id, plant_id, name, description, symptoms, treatment

### Prediction Histories Table
- id, user_id, image_path, prediction, confidence, status

## 🎯 Next Steps

1. Integrate real TensorFlow.js model
2. Add dataset management features
3. Implement advanced analytics
4. Add more plant types and diseases
5. Optimize prediction accuracy

## 📞 Support

Jika mengalami masalah, periksa:
1. Logs di terminal backend dan frontend
2. Browser console untuk error JavaScript
3. Network tab untuk API call failures
4. Database file `backend/database.sqlite` exists