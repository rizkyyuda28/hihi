import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Dataset form
  const [datasetForm, setDatasetForm] = useState({
    plantType: '',
    diseaseType: '',
    displayName: '',
    description: '',
    isHealthy: false,
    images: []
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadDashboardData();
    loadDatasets();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.dashboard);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadDatasets = async () => {
    try {
      const response = await api.get('/admin/datasets');
      setDatasets(response.datasets);
    } catch (error) {
      console.error('Failed to load datasets:', error);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setDatasetForm(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleDatasetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('plantType', datasetForm.plantType);
      formData.append('diseaseType', datasetForm.diseaseType);
      formData.append('displayName', datasetForm.displayName);
      formData.append('description', datasetForm.description);
      formData.append('isHealthy', datasetForm.isHealthy);

      // Add all images
      datasetForm.images.forEach(image => {
        formData.append('images', image);
      });

      const response = await api.post('/admin/datasets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ 
        type: 'success', 
        text: `Dataset "${response.dataset.displayName}" created successfully with ${response.processedFiles} images!` 
      });

      // Reset form
      setDatasetForm({
        plantType: '',
        diseaseType: '',
        displayName: '',
        description: '',
        isHealthy: false,
        images: []
      });

      // Reload data
      loadDashboardData();
      loadDatasets();

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to create dataset' 
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDataset = async (id) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return;

    try {
      await api.delete(`/admin/datasets/${id}`);
      setMessage({ type: 'success', text: 'Dataset deleted successfully' });
      loadDatasets();
      loadDashboardData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete dataset' });
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold">Total Datasets</h3>
        <p className="text-3xl font-bold">{dashboardData?.totalDatasets || 0}</p>
      </div>
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold">Total Images</h3>
        <p className="text-3xl font-bold">{dashboardData?.totalImages || 0}</p>
      </div>
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold">Total Predictions</h3>
        <p className="text-3xl font-bold">{dashboardData?.totalPredictions || 0}</p>
      </div>
    </div>
  );

  const renderDatasetForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Add New Dataset</h3>
      
      <form onSubmit={handleDatasetSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Plant Type</label>
            <input
              type="text"
              value={datasetForm.plantType}
              onChange={(e) => setDatasetForm(prev => ({...prev, plantType: e.target.value}))}
              placeholder="e.g., Mango, Apple, Tomato"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Disease Type</label>
            <input
              type="text"
              value={datasetForm.diseaseType}
              onChange={(e) => setDatasetForm(prev => ({...prev, diseaseType: e.target.value}))}
              placeholder="e.g., healthy, leaf_spot, rust"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Display Name</label>
          <input
            type="text"
            value={datasetForm.displayName}
            onChange={(e) => setDatasetForm(prev => ({...prev, displayName: e.target.value}))}
            placeholder="e.g., Mango Leaf Spot Disease"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={datasetForm.description}
            onChange={(e) => setDatasetForm(prev => ({...prev, description: e.target.value}))}
            placeholder="Optional description..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isHealthy"
            checked={datasetForm.isHealthy}
            onChange={(e) => setDatasetForm(prev => ({...prev, isHealthy: e.target.checked}))}
            className="mr-2"
          />
          <label htmlFor="isHealthy" className="text-sm text-gray-700">
            This is a healthy plant dataset
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Select multiple images (max 50). Images will be saved to: klasifikasi-tanaman/Dataset tanaman/
          </p>
          {datasetForm.images.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              {datasetForm.images.length} image(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creating Dataset...' : 'Create Dataset'}
        </button>
      </form>
    </div>
  );

  const renderDatasetList = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold">Existing Datasets</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disease</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datasets.map(dataset => (
              <tr key={dataset.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{dataset.displayName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dataset.plantType}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    dataset.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {dataset.diseaseType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{dataset.imageCount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    dataset.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {dataset.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => deleteDataset(dataset.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {datasets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No datasets found. Create your first dataset above.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.username}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('datasets')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'datasets' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Datasets
            </button>
          </nav>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Content */}
        {activeTab === 'dashboard' && (
          <>
            {renderDashboard()}
            {renderDatasetList()}
          </>
        )}

        {activeTab === 'datasets' && (
          <div className="space-y-6">
            {renderDatasetForm()}
            {renderDatasetList()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 