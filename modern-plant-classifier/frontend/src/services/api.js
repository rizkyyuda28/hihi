import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Debug: Log API base URL
console.log('🔗 API Base URL:', api.defaults.baseURL);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    
    const message = error.response?.data?.error || error.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// API endpoints
export const apiService = {
  // Health check
  health: () => api.get('/health'),

  // Authentication endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
  },

  // Prediction endpoints
  predict: (formData) => {
    console.log('🚀 Making prediction request to:', api.defaults.baseURL + '/predict');
    return api.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => {
      console.log('✅ Prediction response:', response.data);
      return response;
    }).catch(error => {
      console.error('❌ Prediction error:', error);
      throw error;
    });
  },

  // Get prediction history
  getPredictionHistory: (params = {}) => api.get('/predict/history', { params }),

  // Get prediction statistics
  getPredictionStats: () => api.get('/predict/stats'),

  // Get model information
  getModelInfo: () => api.get('/predict/model-info'),

  // Get plants list
  getPlants: () => api.get('/plants'),

  // Admin endpoints
  admin: {
    // Dashboard
    getDashboard: () => api.get('/admin/dashboard'),
    
    // Plant management
    getPlants: (params = {}) => api.get('/admin/plants', { params }),
    getPlant: (id) => api.get(`/admin/plants/${id}`),
    createPlant: (plantData) => api.post('/admin/plants', plantData),
    updatePlant: (id, plantData) => api.put(`/admin/plants/${id}`, plantData),
    deletePlant: (id) => api.delete(`/admin/plants/${id}`),
    
    // Predictions management
    getAllPredictions: (params = {}) => api.get('/admin/predictions', { params }),
  },
}

export default api 