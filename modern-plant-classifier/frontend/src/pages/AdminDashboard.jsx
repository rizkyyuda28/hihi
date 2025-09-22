import React, { useState, useEffect } from 'react'
import { Users, BarChart3, Activity, Calendar, UserCheck, AlertTriangle, Edit2, Trash2, Save, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersResponse, analysesResponse] = await Promise.all([
        fetch('http://localhost:3001/api/admin/users'),
        fetch('http://localhost:3001/api/admin/analyses')
      ])

      const usersData = await usersResponse.json()
      const analysesData = await analysesResponse.json()

      if (usersData.success) {
        setUsers(usersData.users)
      }

      if (analysesData.success) {
        setAnalyses(analysesData.analyses)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEditUser = (user) => {
    setEditingUser(user.id)
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    })
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({})
  }

  const handleSaveUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (data.success) {
        // Update users list
        setUsers(users.map(u => u.id === userId ? { ...u, ...editForm } : u))
        setEditingUser(null)
        setEditForm({})
      } else {
        setError(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // Remove user from list
        setUsers(users.filter(u => u.id !== userId))
      } else {
        setError(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Failed to delete user')
    }
  }

  const getRoleBadge = (role) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    if (role === 'admin') {
      return `${baseClasses} bg-red-100 text-red-800`
    }
    return `${baseClasses} bg-green-100 text-green-800`
  }

  const getStatusBadge = (isActive) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    if (isActive) {
      return `${baseClasses} bg-green-100 text-green-800`
    }
    return `${baseClasses} bg-red-100 text-red-800`
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users and view analysis data</p>
          </div>
          
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
          </div>
        </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">{analyses.length}</p>
              </div>
            </div>
        </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
        </div>

          <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
        </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Analyses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyses.filter(a => {
                    const today = new Date().toDateString()
                    return new Date(a.createdAt).toDateString() === today
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-5 w-5 inline mr-2" />
                Users Management
              </button>
        <button
                onClick={() => setActiveTab('analyses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analyses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-5 w-5 inline mr-2" />
                Analysis Data
        </button>
            </nav>
      </div>
      
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>
                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Users Management</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
            </tr>
          </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {user.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    {editingUser === user.id ? (
                                      <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                        className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                                      />
                                    ) : (
                                      <div className="text-sm font-medium text-gray-900">
                                        {user.username}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingUser === user.id ? (
                                  <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    className="text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 w-full"
                                  />
                                ) : (
                                  <div className="text-sm text-gray-900">
                                    {user.email}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingUser === user.id ? (
                                  <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                ) : (
                                  <span className={getRoleBadge(user.role)}>
                                    {user.role}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingUser === user.id ? (
                                  <select
                                    value={editForm.isActive}
                                    onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'true'})}
                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value={true}>Active</option>
                                    <option value={false}>Inactive</option>
                                  </select>
                                ) : (
                                  <span className={getStatusBadge(user.isActive)}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {editingUser === user.id ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleSaveUser(user.id)}
                                      className="text-green-600 hover:text-green-900"
                                    >
                                      <Save className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="text-gray-600 hover:text-gray-900"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditUser(user)}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                    {user.role !== 'admin' && (
                                      <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
        </table>
                    </div>
          </div>
        )}

                {/* Analyses Tab */}
                {activeTab === 'analyses' && (
            <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Data</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Result
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Confidence
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analyses.map((analysis) => (
                            <tr key={analysis.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {analysis.User?.username?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {analysis.User?.username || 'Unknown User'}
            </div>
                                    <div className="text-sm text-gray-500">
                                      {analysis.User?.email || ''}
          </div>
        </div>
      </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {analysis.result?.class || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {analysis.confidence ? `${(analysis.confidence * 100).toFixed(2)}%` : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(analysis.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
        </div>
          </div>
        )}
          </>
        )}
          </div>
          </div>
      </div>
    </div>
  )
}

export default AdminDashboard