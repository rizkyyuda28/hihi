# 🌱 Modern Plant Disease Classifier

A modern web application for plant disease classification using TensorFlow.js, built with Node.js backend and React frontend.

## 🚀 Features

- **AI-Powered Classification**: 86.12% accuracy using TensorFlow.js
- **17 Plant Disease Categories**: Supports Corn, Potato, and Tomato diseases
- **Admin Panel**: Dynamic plant data management with CRUD operations
- **Guest Access**: Visitors can classify plants without registration
- **Real-time Predictions**: Fast image processing and classification
- **Responsive Design**: Modern UI with Tailwind CSS

## 🏗️ Architecture

- **Backend**: Node.js + Express + TensorFlow.js
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT-based with role management
- **File Upload**: Multer with image processing

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd modern-plant-classifier/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (`.env`):
```bash
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-change-this-too
```

4. Start the backend server:
```bash
npm run dev
```

The backend will:
- Start on `http://localhost:3000`
- Initialize SQLite database
- Load TensorFlow.js model
- Create default admin user (`admin@plantdisease.com` / `admin123`)
- Seed plant data

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd modern-plant-classifier/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📋 Usage

### For Guests

1. Visit the **Classify** page
2. Upload a plant leaf image (JPG, PNG, WebP)
3. View AI diagnosis with confidence score
4. Get detailed disease information and treatment recommendations

### For Registered Users

1. **Register/Login** for personalized experience
2. **Track prediction history** across sessions
3. **View statistics** of your classifications

### For Administrators

1. **Login with admin credentials**
2. **Dashboard Overview**:
   - View system statistics
   - Monitor recent predictions
   - Track usage metrics

3. **Plant Management**:
   - **Create** new plant diseases
   - **Update** existing plant information
   - **Manage** disease severity levels
   - **Soft delete** plants to preserve history

## 🔧 API Endpoints

### Public Endpoints
- `POST /api/predict/predict` - Image classification
- `GET /api/predict/history` - Prediction history
- `GET /api/predict/stats` - Statistics
- `GET /api/predict/model-info` - Model information

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Admin Only
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/plants` - List plants
- `POST /api/admin/plants` - Create plant
- `PUT /api/admin/plants/:id` - Update plant
- `DELETE /api/admin/plants/:id` - Delete plant
- `GET /api/admin/predictions` - All predictions

## 🌱 Supported Plant Diseases

### Corn (4 categories)
- Cercospora leaf spot
- Common rust
- Northern Leaf Blight
- Healthy

### Potato (3 categories)
- Early blight
- Late blight
- Healthy

### Tomato (10 categories)
- Bacterial spot
- Early blight
- Late blight
- Leaf Mold
- Septoria leaf spot
- Spider mites
- Target Spot
- Tomato mosaic virus
- Tomato Yellow Leaf Curl Virus
- Healthy

## 💾 Database Schema

### Plants Table
- `id` - Primary key
- `name` - Disease name
- `scientificName` - Scientific name
- `description` - Disease description
- `symptoms` - Disease symptoms
- `treatment` - Treatment recommendations
- `prevention` - Prevention methods
- `severity` - Low/Medium/High/Critical
- `modelClassId` - Maps to ML model class
- `imageUrl` - Reference image
- `isActive` - Active status

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - User email
- `password` - Hashed password
- `role` - admin/user
- `isActive` - Account status

### Predictions Table
- `id` - Primary key
- `userId` - User reference (nullable for guests)
- `plantId` - Plant reference
- `imagePath` - Uploaded image path
- `confidence` - Prediction confidence
- `probabilities` - All class probabilities
- `sessionId` - Guest session tracking
- `ipAddress` - Client IP

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** on API endpoints
- **Input Validation** with express-validator
- **File Upload Security** with type and size restrictions
- **CORS Protection** with specific origin allowlist
- **Password Hashing** with bcrypt
- **SQL Injection Protection** with Sequelize ORM

## 🚀 Deployment

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
JWT_SECRET=your-super-secure-production-secret
SESSION_SECRET=your-secure-session-secret
DATABASE_URL=your-production-database-url
```

### Docker Deployment (Optional)

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- TensorFlow.js team for the ML framework
- PlantVillage dataset for training data
- React and Node.js communities
- All contributors and users

---

**Happy Plant Disease Detection! 🌿🔬** 