import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, X, Leaf, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/api';

const PlantNotification = ({ notification, onClose }) => {
  const [plants, setPlants] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (notification?.showPlantList) {
      fetchPlants();
    }
  }, [notification]);

  const fetchPlants = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPlants();
      if (response.data.success) {
        setPlants(response.data.plants);
      }
    } catch (error) {
      console.error('Failed to fetch plants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      case 'success':
        return 'text-green-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
      <div className={`max-w-2xl w-full ${getBgColor()} border rounded-lg shadow-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className={`text-lg font-semibold ${getTextColor()}`}>
              {notification.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`text-sm ${getTextColor()} mb-4`}>
            {notification.message}
          </p>

          {/* Plant List */}
          {notification.showPlantList && (
            <div className="mt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-5 w-5 text-green-600" />
                <h4 className="text-md font-semibold text-gray-800">
                  List Tanaman yang dapat diidentifikasi:
                </h4>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Memuat daftar tanaman...</p>
                </div>
              ) : plants ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(plants).map(([plantType, datasets]) => (
                    <div key={plantType} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-semibold text-gray-800 mb-2 capitalize">
                        {plantType.replace(/_/g, ' ')}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {datasets.map((dataset) => (
                          <div
                            key={dataset.id}
                            className={`flex items-center justify-between p-2 rounded text-sm ${
                              dataset.is_healthy 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            <span className="font-medium">
                              {dataset.name}
                            </span>
                            <span className="text-xs bg-white px-2 py-1 rounded">
                              {dataset.image_count} gambar
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Leaf className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada dataset tanaman yang tersedia</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantNotification; 