import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

const Navbar = () => {

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-primary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary-700 hover:text-primary-800 transition-colors">
            <Leaf className="h-8 w-8" />
            <span className="font-bold text-xl">PlantAI</span>
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
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 