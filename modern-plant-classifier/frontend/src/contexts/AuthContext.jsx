import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token')
    if (token) {
      // Verify token and get user info
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  // Add a function to manually refresh user data
  const refreshUser = async () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      await verifyToken(token)
    }
  }

  const verifyToken = async (token) => {
    try {
      console.log('🔍 Verifying token...')
      const userData = await authService.verifyToken(token)
      setUser(userData)
      console.log('✅ Token verified, user logged in:', userData)
    } catch (error) {
      console.log('❌ Token verification failed:', error.message)
      // Only clear token if it's actually invalid, not just a network error
      if (error.message.includes('Invalid token') || error.message.includes('User not found')) {
        localStorage.removeItem('auth_token')
        setUser(null)
      }
      // Don't set error to avoid showing "Session expired" message
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authService.login({ username, password })
      
      console.log('🔍 Login response:', response)
      
      // Check if response has data property (axios response)
      const responseData = response.data || response
      
      if (responseData.success && responseData.token) {
        localStorage.setItem('auth_token', responseData.token)
        setUser(responseData.user)
        console.log('✅ Login successful, token saved:', responseData.token)
        return { success: true }
      } else {
        console.log('❌ No token in response:', responseData)
        setError(responseData.error || 'No token received from server')
        return { success: false, error: responseData.error || 'No token received' }
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setError(error.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 