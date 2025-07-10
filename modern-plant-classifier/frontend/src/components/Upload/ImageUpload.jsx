import React, { useState, useRef } from 'react'
import { Upload, Image, X, Loader2 } from 'lucide-react'
import { apiService } from '../../services/api'

const ImageUpload = ({ onPredictionResult }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    setFile(selectedFile)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    console.log('🚀 Starting upload process...')
    console.log('📁 File:', file.name, file.size, file.type)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      console.log('📤 Sending prediction request...')
      const response = await apiService.predict(formData)
      
      console.log('📥 Raw response:', response)
      console.log('📊 Response data:', response.data)
      
      if (response.data.success) {
        console.log('✅ Prediction successful:', response.data.result)
        console.log('🔄 Passing result to parent component...')
        
        // Pass only the result data, not the whole response
        onPredictionResult(response.data.result)
      } else {
        console.error('❌ Prediction failed:', response.data)
        throw new Error(response.data.error || 'Prediction failed')
      }
    } catch (error) {
      console.error('💥 Upload failed:', error)
      console.error('💥 Error details:', error.response?.data)
      alert(`Prediction failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Upload className="h-6 w-6 mr-2 text-primary-600" />
        Upload Plant Image
      </h3>

      {/* Upload Area */}
      <div
        className={`upload-area ${dragActive ? 'dragover' : ''} ${preview ? 'hidden' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Image className="h-16 w-16 text-primary-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop your plant image here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click to browse files
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={(e) => {
            e.stopPropagation()
            fileInputRef.current?.click()
          }}
        >
          Select Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={clearFile}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{file?.name}</span>
              <span className="ml-2">({(file?.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={loading}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Analyze Disease</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload 