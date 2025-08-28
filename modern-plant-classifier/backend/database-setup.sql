-- Database Setup Script for Plant Disease Classification System
-- PostgreSQL Database

-- Create database (run this as superuser)
-- CREATE DATABASE plant_classifier_dev;

-- Connect to the database
-- \c plant_classifier_dev;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plants table (for plant data)
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    description TEXT,
    symptoms TEXT,
    treatment TEXT,
    prevention TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    image_url VARCHAR(255),
    model_class_id VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictions table (for storing prediction results)
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    plant_id INTEGER REFERENCES plants(id) ON DELETE CASCADE,
    image_path VARCHAR(255),
    confidence DECIMAL(5,4),
    probabilities JSONB,
    session_id VARCHAR(100),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detection History table (for storing all detection records)
CREATE TABLE IF NOT EXISTS detection_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    image_file_name VARCHAR(255) NOT NULL,
    original_image_name VARCHAR(255) NOT NULL,
    prediction_result JSONB NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    plant_class VARCHAR(100) NOT NULL,
    recommendations TEXT,
    is_guest BOOLEAN DEFAULT true,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guest Detection Limits table (for tracking guest user limits)
CREATE TABLE IF NOT EXISTS guest_detection_limits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    detection_count INTEGER DEFAULT 0,
    last_detection_at TIMESTAMP,
    is_blocked BOOLEAN DEFAULT false,
    blocked_at TIMESTAMP,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_plants_model_class_id ON plants(model_class_id);
CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name);

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_plant_id ON predictions(plant_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);

CREATE INDEX IF NOT EXISTS idx_detection_history_user_id ON detection_history(user_id);
CREATE INDEX IF NOT EXISTS idx_detection_history_ip_address ON detection_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_detection_history_created_at ON detection_history(created_at);
CREATE INDEX IF NOT EXISTS idx_detection_history_plant_class ON detection_history(plant_class);

CREATE INDEX IF NOT EXISTS idx_guest_detection_limits_ip_address ON guest_detection_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_guest_detection_limits_is_blocked ON guest_detection_limits(is_blocked);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_detection_history_updated_at BEFORE UPDATE ON detection_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guest_detection_limits_updated_at BEFORE UPDATE ON guest_detection_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@plantclassifier.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample plants data
INSERT INTO plants (name, scientific_name, description, symptoms, treatment, prevention, severity, model_class_id) VALUES
('Corn Healthy', 'Zea mays', 'Healthy corn plant without disease', 'No symptoms', 'No treatment needed', 'Maintain good soil health and proper irrigation', 'none', 'Corn_(maize)___healthy'),
('Corn Common Rust', 'Zea mays', 'Corn plant affected by common rust disease', 'Reddish-brown pustules on leaves', 'Apply fungicides, remove infected plants', 'Plant resistant varieties, avoid overhead irrigation', 'medium', 'Corn_(maize)___Common_rust_'),
('Corn Gray Leaf Spot', 'Zea mays', 'Corn plant with gray leaf spot disease', 'Gray to tan lesions on leaves', 'Apply fungicides, improve air circulation', 'Crop rotation, tillage practices', 'high', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot'),
('Corn Northern Leaf Blight', 'Zea mays', 'Corn plant affected by northern leaf blight', 'Large cigar-shaped lesions on leaves', 'Apply fungicides, remove crop debris', 'Crop rotation, resistant varieties', 'high', 'Corn_(maize)___Northern_Leaf_Blight'),
('Potato Healthy', 'Solanum tuberosum', 'Healthy potato plant', 'No symptoms', 'No treatment needed', 'Good soil management and rotation', 'none', 'Potato___healthy'),
('Potato Early Blight', 'Solanum tuberosum', 'Potato plant with early blight disease', 'Dark brown spots with concentric rings', 'Apply fungicides, remove infected leaves', 'Crop rotation, proper spacing', 'medium', 'Potato___Early_blight'),
('Potato Late Blight', 'Solanum tuberosum', 'Potato plant affected by late blight', 'Water-soaked lesions on leaves and stems', 'Apply fungicides, destroy infected plants', 'Avoid overhead irrigation, resistant varieties', 'high', 'Potato___Late_blight'),
('Tomato Healthy', 'Solanum lycopersicum', 'Healthy tomato plant', 'No symptoms', 'No treatment needed', 'Good cultural practices', 'none', 'Tomato___healthy'),
('Tomato Bacterial Spot', 'Solanum lycopersicum', 'Tomato plant with bacterial spot', 'Small dark spots with yellow halos', 'Remove infected plants, copper-based sprays', 'Use disease-free seeds, avoid overhead irrigation', 'medium', 'Tomato___Bacterial_spot'),
('Tomato Early Blight', 'Solanum lycopersicum', 'Tomato plant affected by early blight', 'Dark brown spots with target-like appearance', 'Apply fungicides, improve air circulation', 'Crop rotation, proper spacing', 'medium', 'Tomato___Early_blight'),
('Tomato Late Blight', 'Solanum lycopersicum', 'Tomato plant with late blight', 'Water-soaked lesions, white fungal growth', 'Apply fungicides, destroy infected plants', 'Avoid overhead irrigation, resistant varieties', 'high', 'Tomato___Late_blight'),
('Tomato Leaf Mold', 'Solanum lycopersicum', 'Tomato plant affected by leaf mold', 'Yellow spots with olive-green mold', 'Improve air circulation, apply fungicides', 'Proper spacing, avoid overhead irrigation', 'medium', 'Tomato___Leaf_Mold'),
('Tomato Septoria Leaf Spot', 'Solanum lycopersicum', 'Tomato plant with septoria leaf spot', 'Small circular spots with dark borders', 'Remove infected leaves, apply fungicides', 'Crop rotation, avoid overhead irrigation', 'medium', 'Tomato___Septoria_leaf_spot'),
('Tomato Spider Mites', 'Solanum lycopersicum', 'Tomato plant infested with spider mites', 'Yellow stippling on leaves, fine webbing', 'Apply miticides, release beneficial insects', 'Regular monitoring, avoid dusty conditions', 'low', 'Tomato___Spider_mites Two-spotted_spider_mite'),
('Tomato Target Spot', 'Solanum lycopersicum', 'Tomato plant with target spot disease', 'Concentric rings on leaves and fruit', 'Apply fungicides, remove infected parts', 'Crop rotation, proper spacing', 'medium', 'Tomato___Target_Spot'),
('Tomato Mosaic Virus', 'Solanum lycopersicum', 'Tomato plant infected with mosaic virus', 'Mottled leaves, stunted growth', 'Remove infected plants, control aphids', 'Use virus-free seeds, control vectors', 'high', 'Tomato___Tomato_mosaic_virus'),
('Tomato Yellow Leaf Curl Virus', 'Solanum lycopersicum', 'Tomato plant with yellow leaf curl virus', 'Yellow curled leaves, stunted growth', 'Remove infected plants, control whiteflies', 'Use resistant varieties, control vectors', 'high', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus')
ON CONFLICT (model_class_id) DO NOTHING;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Verify tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verify data
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_plants FROM plants;
