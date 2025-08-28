import React, { useState } from 'react'
import ImageUpload from '../components/Upload/ImageUpload'
import PredictionResult from '../components/Results/PredictionResult'
import PlantNotification from '../components/Notification/PlantNotification'

const Classify = () => {
  const [predictionResult, setPredictionResult] = useState(null)
  const [responseTime, setResponseTime] = useState(null)
  const [notification, setNotification] = useState(null)

  const handlePredictionResult = (result, notificationData) => {
    console.log('🎯 Classify page received prediction result:', result)
    console.log('🔔 Notification data:', notificationData)
    
    // If there's a notification, it means the image is not valid
    if (notificationData) {
      console.log('⚠️ Invalid image detected, showing notification only')
      setPredictionResult(null)
      setResponseTime(null)
      setNotification(notificationData)
      return
    }
    
    // Valid prediction result
    if (result) {
      const responseTime = result.processingTime || 1.0
      setResponseTime(responseTime.toFixed(1))
      console.log('⏱️ Processing time:', responseTime, 'seconds')
      console.log('💾 Setting prediction result state...')
      
      setPredictionResult(result)
      setNotification(null)
    }
  }

  const resetPrediction = () => {
    setPredictionResult(null)
    setResponseTime(null)
    setNotification(null)
  }

  const closeNotification = () => {
    setNotification(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Plant Disease Classification
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload gambar daun tanaman untuk mendeteksi penyakit menggunakan AI. 
          Mendukung jagung, kentang, dan tomat dengan akurasi 86.12%.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <ImageUpload onPredictionResult={handlePredictionResult} />
          
          {/* Instructions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 Petunjuk Penggunaan
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-primary-600 font-semibold">1.</span>
                <span>Ambil foto daun tanaman dengan pencahayaan yang baik</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary-600 font-semibold">2.</span>
                <span>Pastikan daun terlihat jelas tanpa terpotong</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary-600 font-semibold">3.</span>
                <span>Upload gambar dengan format JPG, PNG, atau WebP</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary-600 font-semibold">4.</span>
                <span>AI akan menganalisis dan memberikan diagnosis dalam hitungan detik</span>
              </div>
            </div>
          </div>

          {/* Supported Plants */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🌱 Jenis Tanaman yang Didukung
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-primary-50 rounded-lg">
                <div className="text-2xl mb-1">🌽</div>
                <div className="text-sm font-medium text-gray-700">Jagung</div>
                <div className="text-xs text-gray-500">4 kategori</div>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <div className="text-2xl mb-1">🥔</div>
                <div className="text-sm font-medium text-gray-700">Kentang</div>
                <div className="text-xs text-gray-500">3 kategori</div>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <div className="text-2xl mb-1">🍅</div>
                <div className="text-sm font-medium text-gray-700">Tomat</div>
                <div className="text-xs text-gray-500">10 kategori</div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {predictionResult && !notification ? (
            <>
              <PredictionResult 
                result={predictionResult} 
                responseTime={responseTime}
              />
              <div className="text-center">
                <button 
                  onClick={resetPrediction}
                  className="btn-primary"
                >
                  Analisis Gambar Lain
                </button>
              </div>
            </>
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Siap untuk Analisis
                </h3>
                <p className="text-gray-500">
                  Upload gambar tanaman di sebelah kiri untuk melihat hasil prediksi AI
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-16">
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            💡 Tips untuk Hasil Terbaik
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">📸</div>
              <h4 className="font-semibold text-gray-700 mb-2">Pencahayaan Baik</h4>
              <p className="text-sm text-gray-600">Foto di tempat terang atau gunakan flash</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-semibold text-gray-700 mb-2">Fokus Jelas</h4>
              <p className="text-sm text-gray-600">Pastikan daun dalam fokus dan tidak blur</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📏</div>
              <h4 className="font-semibold text-gray-700 mb-2">Ukuran Cukup</h4>
              <p className="text-sm text-gray-600">Daun memenuhi minimal 70% area foto</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🌿</div>
              <h4 className="font-semibold text-gray-700 mb-2">Single Leaf</h4>
              <p className="text-sm text-gray-600">Satu daun per foto untuk akurasi optimal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <PlantNotification 
        notification={notification} 
        onClose={closeNotification}
      />
    </div>
  )
}

export default Classify 