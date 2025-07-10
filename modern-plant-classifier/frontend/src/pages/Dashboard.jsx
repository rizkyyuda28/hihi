import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Leaf } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    totalPredictions: 0,
    todayPredictions: 0,
    avgConfidence: 0,
    healthyPlants: 0,
    diseasedPlants: 0
  })
  const [recentPredictions, setRecentPredictions] = useState([])

  useEffect(() => {
    if (isAuthenticated) {
      // Load dashboard data
      loadDashboardData()
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    // Simulate loading dashboard data
    // In real app, this would fetch from API
    const mockStats = {
      totalPredictions: 247,
      todayPredictions: 15,
      avgConfidence: 84.2,
      healthyPlants: 142,
      diseasedPlants: 105
    }

    const mockRecent = [
      {
        id: 1,
        image: '/api/placeholder/80/80',
        prediction: 'Tomato - Healthy',
        confidence: 92.5,
        timestamp: '2 minutes ago',
        status: 'healthy'
      },
      {
        id: 2,
        image: '/api/placeholder/80/80',
        prediction: 'Corn - Northern Leaf Blight',
        confidence: 88.3,
        timestamp: '1 hour ago',
        status: 'diseased'
      },
      {
        id: 3,
        image: '/api/placeholder/80/80',
        prediction: 'Potato - Early Blight',
        confidence: 76.8,
        timestamp: '3 hours ago',
        status: 'diseased'
      },
      {
        id: 4,
        image: '/api/placeholder/80/80',
        prediction: 'Tomato - Healthy',
        confidence: 94.1,
        timestamp: '5 hours ago',
        status: 'healthy'
      }
    ]

    setStats(mockStats)
    setRecentPredictions(mockRecent)
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.name || user?.username}! Here's your plant disease detection overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Predictions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPredictions}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Predictions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayPredictions}</p>
            </div>
            <div className="p-3 bg-secondary-100 rounded-full">
              <Clock className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgConfidence}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Healthy vs Diseased</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.healthyPlants}:{stats.diseasedPlants}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Leaf className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Predictions */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Recent Predictions
            </h2>
            <div className="space-y-4">
              {recentPredictions.map((prediction) => (
                <div key={prediction.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Leaf className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{prediction.prediction}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Confidence: {prediction.confidence}%</span>
                      <span>{prediction.timestamp}</span>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    prediction.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {prediction.status === 'healthy' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Overview */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Plant Health Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Healthy Plants</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.healthyPlants}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${(stats.healthyPlants / (stats.healthyPlants + stats.diseasedPlants)) * 100}%` 
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-gray-700">Diseased Plants</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.diseasedPlants}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ 
                    width: `${(stats.diseasedPlants / (stats.healthyPlants + stats.diseasedPlants)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                New Classification
              </button>
              <button className="w-full btn-secondary">
                Export Reports
              </button>
              <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                View All History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 