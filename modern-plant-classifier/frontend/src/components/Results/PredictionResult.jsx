import React from 'react'
import { CheckCircle, AlertTriangle, Info, Zap, Clock, Leaf, Shield, Stethoscope } from 'lucide-react'

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'Low':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'Medium':
      return <Info className="h-5 w-5 text-yellow-500" />
    case 'High':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />
    case 'Critical':
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    default:
      return <Info className="h-5 w-5 text-gray-500" />
  }
}

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'Low':
      return 'green'
    case 'Medium':
      return 'yellow'
    case 'High':
      return 'orange'
    case 'Critical':
      return 'red'
    default:
      return 'gray'
  }
}

const PredictionResult = ({ result, responseTime }) => {
  if (!result) return null

  // Backend sends: { plant: "Tomato", disease: "Disease Name", confidence: 0.99, ... }
  // Component expects: { plant: { name: "Disease Name", ... }, confidence: 0.99 }
  
  console.log('🎯 PredictionResult received data:', result);
  
  // Fix: Access nested plant object correctly
  const plant = {
    name: result.plant?.name || result.disease || result.plant || 'Unknown Disease',
    severity: result.plant?.severity || result.severity || 'Medium',
    description: result.plant?.description || result.description || null,
    symptoms: result.plant?.symptoms || result.symptoms || null,
    treatment: result.plant?.treatment || result.treatment || null,
    prevention: result.plant?.prevention || result.prevention || null,
    scientificName: result.plant?.scientificName || result.scientificName || null
  };
  
  const confidence = result.confidence ? (result.confidence * 100).toFixed(1) : '0'
  const severityColor = getSeverityColor(plant?.severity || 'Medium')

  return (
    <div className="card animate-fade-in">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
          <Zap className="h-6 w-6 mr-2 text-secondary-600" />
          Hasil Prediksi AI
        </h3>
        {responseTime && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Dianalisis dalam {responseTime}s
          </div>
        )}
      </div>

      {/* Main Result */}
      <div className={`p-6 rounded-lg mb-6 ${
        severityColor === 'green' ? 'bg-green-50 border border-green-200' :
        severityColor === 'red' ? 'bg-red-50 border border-red-200' :
        severityColor === 'orange' ? 'bg-orange-50 border border-orange-200' :
        'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="text-center">
          <h4 className="text-2xl font-bold text-gray-800 mb-2">
            {plant?.name || 'Unknown Disease'}
          </h4>
          {plant?.scientificName && (
            <p className="text-lg italic text-gray-600 mb-2">{plant.scientificName}</p>
          )}
          <div className={`text-4xl font-bold mb-2 ${
            severityColor === 'green' ? 'text-green-600' :
            severityColor === 'red' ? 'text-red-600' :
            severityColor === 'orange' ? 'text-orange-600' :
            'text-yellow-600'
          }`}>
            {confidence}%
          </div>
          <p className="text-gray-600">Confidence Level</p>
        </div>
      </div>

      {/* Disease Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {plant?.description && (
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Info className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-1">Description</h5>
                <p className="text-sm text-gray-600">{plant.description}</p>
              </div>
            </div>
          )}

          {plant?.symptoms && (
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Stethoscope className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-1">Symptoms</h5>
                <p className="text-sm text-gray-600">{plant.symptoms}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h5 className="font-semibold text-gray-800">Detection Confidence</h5>
              <p className="text-sm text-gray-600">
                AI is {confidence}% confident in this diagnosis
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-secondary-100 rounded-lg">
              {getSeverityIcon(plant?.severity)}
            </div>
            <div>
              <h5 className="font-semibold text-gray-800 mb-1">Severity Level</h5>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                severityColor === 'green' ? 'bg-green-100 text-green-800' :
                severityColor === 'red' ? 'bg-red-100 text-red-800' :
                severityColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {plant?.severity || 'Unknown'}
              </span>
            </div>
          </div>

          {plant?.treatment && (
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-1">Treatment</h5>
                <p className="text-sm text-gray-600">{plant.treatment}</p>
              </div>
            </div>
          )}

          {plant?.prevention && (
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-1">Prevention</h5>
                <p className="text-sm text-gray-600">{plant.prevention}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Confidence Score</span>
          <span className="text-sm font-medium text-gray-700">{confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              parseFloat(confidence) >= 80 ? 'bg-green-500' :
              parseFloat(confidence) >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default PredictionResult