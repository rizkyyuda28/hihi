import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, LogOut, BarChart3 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-primary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary-700 hover:text-primary-800 transition-colors">
            <Leaf className="h-8 w-8" />
            <span className="font-bold text-xl">PlantML</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/classify" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Classify
            </Link>
            
            {/* Show Dashboard and Logout if authenticated */}
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
                <span className="text-sm text-gray-500">
                  Welcome, {user?.username || 'User'}
                </span>
              </>
            )}
            
            {/* Show Login if not authenticated */}
            {!isAuthenticated && (
              <Link 
                to="/login" 
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 