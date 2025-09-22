import api from './api'

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response
    } catch (error) {
      throw new Error(error.message || 'Login failed')
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response
    } catch (error) {
      throw new Error(error.message || 'Registration failed')
    }
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      const response = await api.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data.user
    } catch (error) {
      throw new Error('Invalid token')
    }
  },

  // Test login (for demo purposes)
  testLogin: async (credentials) => {
    // Mock authentication for demo
    if (credentials.username === 'admin' && credentials.password === 'password') {
      return {
        token: 'demo_token_' + Date.now(),
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          name: 'Administrator'
        }
      }
    } else {
      throw new Error('Invalid credentials')
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token')
  }
} 