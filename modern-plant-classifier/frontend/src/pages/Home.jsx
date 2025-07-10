import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container-max py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI Plant Disease Detection
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Deteksi penyakit tanaman dengan teknologi AI terdepan. 
            Akurasi 86.12% untuk 17 kategori penyakit pada jagung, kentang, dan tomat.
          </p>
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/classify" className="btn-primary">
                Mulai Deteksi ➤
              </Link>
              <Link to="/login" className="btn-secondary">
                Login Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid-responsive mb-16">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Analisis gambar dalam hitungan detik dengan teknologi TensorFlow.js</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">86.12% Accuracy</h3>
            <p className="text-gray-600">Model AI yang telah dilatih dengan ribuan gambar untuk akurasi tinggi</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">17 Disease Types</h3>
            <p className="text-gray-600">Deteksi berbagai penyakit pada jagung, kentang, dan tomat</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Modern Stack</h3>
            <p className="text-gray-600">Node.js + React + TensorFlow.js untuk performa optimal</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="card mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Statistik Model AI
          </h2>
          <div className="grid-responsive">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">86.12%</div>
              <div className="text-gray-600">Model Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">17</div>
              <div className="text-gray-600">Disease Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">3</div>
              <div className="text-gray-600">Plant Types</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">~1s</div>
              <div className="text-gray-600">Response Time</div>
            </div>
          </div>
        </div>

        {/* Disease Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Kategori Penyakit yang Dapat Dideteksi
          </h2>
          <div className="grid-responsive">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🌽 Jagung (Corn)</h3>
              <ul className="text-gray-600">
                <li>• Cercospora leaf spot</li>
                <li>• Common rust</li>
                <li>• Northern Leaf Blight</li>
                <li>• Healthy</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🥔 Kentang (Potato)</h3>
              <ul className="text-gray-600">
                <li>• Early blight</li>
                <li>• Late blight</li>
                <li>• Healthy</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🍅 Tomat (Tomato)</h3>
              <ul className="text-gray-600">
                <li>• Bacterial spot</li>
                <li>• Early blight</li>
                <li>• Late blight</li>
                <li>• Leaf Mold</li>
                <li>• Septoria leaf spot</li>
                <li>• Spider mites</li>
                <li>• Target spot</li>
                <li>• Yellow leaf curl virus</li>
                <li>• Tomato mosaic virus</li>
                <li>• Healthy</li>
              </ul>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🔬 Total Coverage</h3>
              <div className="text-3xl font-bold text-primary-600 mb-2">38,000+</div>
              <p className="text-gray-600">Training Images</p>
              <div className="text-lg font-semibold text-gray-800 mt-4">
                Comprehensive Dataset
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="card text-center" style={{background: 'linear-gradient(to right, #16a34a, #15803d)', color: 'white'}}>
          <h2 className="text-3xl font-bold mb-4">
            Siap untuk Mencoba?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Upload gambar tanaman Anda dan dapatkan diagnosis penyakit secara instan
          </p>
          <Link 
            to="/classify" 
            className="btn-primary" 
            style={{backgroundColor: 'white', color: '#16a34a'}}
          >
            Mulai Deteksi Sekarang ➤
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home 