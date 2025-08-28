const fs = require('fs');
const path = require('path');

// Path to the dataset folder
const DATASET_PATH = path.join(__dirname, '../../../../klasifikasi-tanaman/Dataset tanaman');

// Read classes from the ML model
const getClassesFromML = () => {
  try {
    const classesPath = path.join(__dirname, '../../../../klasifikasi-tanaman/tfjs_model/classes.json');
    const classesData = fs.readFileSync(classesPath, 'utf8');
    return JSON.parse(classesData);
  } catch (error) {
    console.error('❌ Error reading classes.json:', error);
    return {};
  }
};

// Parse folder name to get plant and disease info
const parseFolderName = (folderName) => {
  // Remove file extensions and special characters
  const cleanName = folderName.replace(/\.(h5|txt|ipynb)$/, '');
  
  // Skip non-dataset folders
  if (['model-massive_16-80.51', 'massive_16-17', 'Model_CNN_Finished'].includes(cleanName)) {
    return null;
  }

  // Parse folder names like "Corn_(maize)___healthy" or "Tomato___Bacterial_spot"
  const parts = cleanName.split('___');
  if (parts.length < 2) return null;

  const plantPart = parts[0].replace(/[()]/g, '').replace(/_/g, ' ');
  const diseasePart = parts[1].replace(/_/g, ' ');

  // Handle special cases for plant names
  let finalPlantType = plantPart;
  if (plantPart.toLowerCase().includes('corn') || plantPart.toLowerCase().includes('maize')) {
    finalPlantType = 'Corn';
  } else if (plantPart.toLowerCase().includes('potato')) {
    finalPlantType = 'Potato';
  } else if (plantPart.toLowerCase().includes('tomato')) {
    finalPlantType = 'Tomato';
  }

  return {
    folderName: cleanName,
    plantType: finalPlantType,
    diseaseType: diseasePart,
    isHealthy: diseasePart.toLowerCase().includes('healthy'),
    displayName: `${finalPlantType} ${diseasePart}`.trim()
  };
};

// Count images in a folder
const countImagesInFolder = (folderPath) => {
  try {
    if (!fs.existsSync(folderPath)) return 0;
    
    const files = fs.readdirSync(folderPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG'];
    
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    }).length;
  } catch (error) {
    console.error(`❌ Error counting images in ${folderPath}:`, error);
    return 0;
  }
};

// Get all available datasets from folder structure
const getAvailableDatasets = () => {
  try {
    if (!fs.existsSync(DATASET_PATH)) {
      console.error('❌ Dataset path does not exist:', DATASET_PATH);
      return [];
    }

    const folders = fs.readdirSync(DATASET_PATH);
    const datasets = [];

    folders.forEach(folder => {
      const folderPath = path.join(DATASET_PATH, folder);
      const stats = fs.statSync(folderPath);
      
      if (stats.isDirectory()) {
        const parsed = parseFolderName(folder);
        if (parsed) {
          const imageCount = countImagesInFolder(folderPath);
          datasets.push({
            ...parsed,
            imageCount,
            folderPath: folderPath
          });
        }
      }
    });
    return datasets;
  } catch (error) {
    console.error('❌ Error reading datasets from folder:', error);
    return [];
  }
};

// Get datasets grouped by plant type
const getDatasetsByPlantType = () => {
  const datasets = getAvailableDatasets();
  const grouped = {};

  datasets.forEach(dataset => {
    if (!grouped[dataset.plantType]) {
      grouped[dataset.plantType] = [];
    }
    
    grouped[dataset.plantType].push({
      id: dataset.folderName, // Use folder name as ID
      name: dataset.displayName,
      disease_type: dataset.diseaseType,
      is_healthy: dataset.isHealthy,
      image_count: dataset.imageCount,
      folder_path: dataset.folderPath
    });
  });

  return grouped;
};

// Get list of all identifiable classes
const getIdentifiableClasses = () => {
  const mlClasses = getClassesFromML();
  const folderDatasets = getAvailableDatasets();
  
  // Create a map of ML classes to folder datasets
  const classMap = {};
  
  Object.entries(mlClasses).forEach(([id, className]) => {
    // Find matching folder dataset
    const matchingDataset = folderDatasets.find(dataset => {
      const mlPlant = className.split(' ')[0]; // "Corn", "Potato", "Tomato"
      const mlDisease = className.split(' ').slice(1).join(' '); // rest of the name
      
      return dataset.plantType.toLowerCase().includes(mlPlant.toLowerCase()) &&
             dataset.diseaseType.toLowerCase().includes(mlDisease.toLowerCase());
    });
    
    if (matchingDataset) {
      classMap[id] = {
        className,
        plantType: matchingDataset.plantType,
        diseaseType: matchingDataset.diseaseType,
        isHealthy: matchingDataset.isHealthy,
        displayName: matchingDataset.displayName,
        imageCount: matchingDataset.imageCount
      };
    }
  });
  
  return classMap;
};

module.exports = {
  getAvailableDatasets,
  getDatasetsByPlantType,
  getIdentifiableClasses,
  getClassesFromML,
  DATASET_PATH
}; 