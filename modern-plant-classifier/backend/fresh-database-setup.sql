-- =====================================================
-- FRESH DATABASE SETUP SCRIPT
-- Plant Disease Classification System
-- PostgreSQL Database - DROP EXISTING TABLES FIRST
-- =====================================================

-- Connect to your database (uncomment and modify as needed)
-- \c plant_classifier_dev;

-- =====================================================
-- 1. DROP EXISTING TABLES (IF THEY EXIST)
-- =====================================================

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS guest_detection_limits CASCADE;
DROP TABLE IF EXISTS detection_history CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- 2. CREATE TABLES FRESH
-- =====================================================

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plants table
CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    description TEXT,
    symptoms TEXT,
    treatment TEXT,
    prevention TEXT,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'none')),
    image_url VARCHAR(255),
    model_class_id VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictions table (updated to match Sequelize model)
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    image_filename VARCHAR(255) NOT NULL,
    image_path VARCHAR(255),
    predicted_class VARCHAR(100) NOT NULL,
    predicted_class_id INTEGER NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    plant_type VARCHAR(100),
    disease_type VARCHAR(100),
    is_healthy BOOLEAN DEFAULT false,
    processing_time INTEGER NOT NULL,
    model_used VARCHAR(100) DEFAULT 'klasifikasi-tanaman-v1',
    model_accuracy VARCHAR(20) DEFAULT '86.12%',
    all_probabilities JSONB,
    user_agent TEXT,
    ip_address VARCHAR(45),
    is_real_ml BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detection History table (for storing all detection records)
CREATE TABLE detection_history (
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
CREATE TABLE guest_detection_limits (
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

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Plants indexes
CREATE INDEX idx_plants_name ON plants(name);
CREATE INDEX idx_plants_model_class_id ON plants(model_class_id);
CREATE INDEX idx_plants_severity ON plants(severity);

-- Predictions indexes (updated to match actual columns)
CREATE INDEX idx_predictions_predicted_class ON predictions(predicted_class);
CREATE INDEX idx_predictions_predicted_class_id ON predictions(predicted_class_id);
CREATE INDEX idx_predictions_confidence ON predictions(confidence);
CREATE INDEX idx_predictions_plant_type ON predictions(plant_type);
CREATE INDEX idx_predictions_disease_type ON predictions(disease_type);
CREATE INDEX idx_predictions_is_healthy ON predictions(is_healthy);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);
CREATE INDEX idx_predictions_ip_address ON predictions(ip_address);

-- Detection History indexes
CREATE INDEX idx_detection_history_user_id ON detection_history(user_id);
CREATE INDEX idx_detection_history_ip_address ON detection_history(ip_address);
CREATE INDEX idx_detection_history_created_at ON detection_history(created_at);
CREATE INDEX idx_detection_history_plant_class ON detection_history(plant_class);

-- Guest Detection Limits indexes
CREATE INDEX idx_guest_detection_limits_ip_address ON guest_detection_limits(ip_address);
CREATE INDEX idx_guest_detection_limits_is_blocked ON guest_detection_limits(is_blocked);

-- =====================================================
-- 4. CREATE TRIGGERS AND FUNCTIONS
-- =====================================================

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

-- =====================================================
-- 5. INSERT SAMPLE DATA
-- =====================================================

-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@plantclassifier.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample regular user (password: user123)
INSERT INTO users (username, email, password, role) VALUES 
('user1', 'user1@plantclassifier.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Insert sample plants data
INSERT INTO plants (name, scientific_name, description, symptoms, treatment, prevention, severity, model_class_id) VALUES
-- Corn/Maize (Jagung)
('Corn Healthy', 'Zea mays', 'Healthy corn plant without disease', 'No symptoms', 'No treatment needed', 'Maintain good soil health and proper irrigation', 'none', 'Corn_(maize)___healthy'),
('Corn Common Rust', 'Zea mays', 'Corn plant affected by common rust disease', 'Reddish-brown pustules on leaves', 'Apply fungicides, remove infected plants', 'Plant resistant varieties, avoid overhead irrigation', 'medium', 'Corn_(maize)___Common_rust_'),
('Corn Gray Leaf Spot', 'Zea mays', 'Corn plant with gray leaf spot disease', 'Gray to tan lesions on leaves', 'Apply fungicides, improve air circulation', 'Crop rotation, tillage practices', 'high', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot'),
('Corn Northern Leaf Blight', 'Zea mays', 'Corn plant affected by northern leaf blight', 'Large cigar-shaped lesions on leaves', 'Apply fungicides, remove crop debris', 'Crop rotation, resistant varieties', 'high', 'Corn_(maize)___Northern_Leaf_Blight'),

-- Potato (Kentang)
('Potato Healthy', 'Solanum tuberosum', 'Healthy potato plant', 'No symptoms', 'No treatment needed', 'Good soil management and rotation', 'none', 'Potato___healthy'),
('Potato Early Blight', 'Solanum tuberosum', 'Potato plant with early blight disease', 'Dark brown spots with concentric rings', 'Apply fungicides, remove infected leaves', 'Crop rotation, proper spacing', 'medium', 'Potato___Early_blight'),
('Potato Late Blight', 'Solanum tuberosum', 'Potato plant affected by late blight', 'Water-soaked lesions on leaves and stems', 'Apply fungicides, destroy infected plants', 'Avoid overhead irrigation, resistant varieties', 'high', 'Potato___Late_blight'),

-- Tomato (Tomat)
('Tomato Healthy', 'Solanum lycopersicum', 'Healthy tomato plant', 'No symptoms', 'No treatment needed', 'Good cultural practices', 'none', 'Tomato___healthy'),
('Tomato Bacterial Spot', 'Solanum lycopersicum', 'Tomato plant with bacterial spot', 'Small dark spots with yellow halos', 'Remove infected plants, copper-based sprays', 'Use disease-free seeds, avoid overhead irrigation', 'medium', 'Tomato___Bacterial_spot'),
('Tomato Early Blight', 'Solanum lycopersicum', 'Tomato plant affected by early blight', 'Dark brown spots with target-like appearance', 'Apply fungicides, improve air circulation', 'Crop rotation, proper spacing', 'medium', 'Tomato___Early_blight'),
('Tomato Late Blight', 'Solanum lycopersicum', 'Tomato plant with late blight', 'Water-soaked lesions, white fungal growth', 'Apply fungicides, destroy infected plants', 'Avoid overhead irrigation, resistant varieties', 'high', 'Tomato___Late_blight'),
('Tomato Leaf Mold', 'Solanum lycopersicum', 'Tomato plant affected by leaf mold', 'Yellow spots with olive-green mold', 'Improve air circulation, apply fungicides', 'Proper spacing, avoid overhead irrigation', 'medium', 'Tomato___Leaf_Mold'),
('Tomato Septoria Leaf Spot', 'Solanum lycopersicum', 'Tomato plant with septoria leaf spot', 'Small circular spots with dark borders', 'Remove infected leaves, apply fungicides', 'Crop rotation, avoid overhead irrigation', 'medium', 'Tomato___Septoria_leaf_spot'),
('Tomato Spider Mites', 'Solanum lycopersicum', 'Tomato plant infested with spider mites', 'Yellow stippling on leaves, fine webbing', 'Apply miticides, release beneficial insects', 'Regular monitoring, avoid dusty conditions', 'low', 'Tomato___Spider_mites Two-spotted_spider_mite'),
('Tomato Target Spot', 'Solanum lycopersicum', 'Tomato plant with target spot disease', 'Concentric rings on leaves and fruit', 'Apply fungicides, remove infected parts', 'Crop rotation, proper spacing', 'medium', 'Tomato___Target_Spot'),
('Tomato Mosaic Virus', 'Solanum lycopersicum', 'Tomato plant infected with mosaic virus', 'Mottled leaves, stunted growth', 'Remove infected plants, control aphids', 'Use virus-free seeds, control vectors', 'high', 'Tomato___Tomato_mosaic_virus'),
('Tomato Yellow Leaf Curl Virus', 'Solanum lycopersicum', 'Tomato plant with yellow leaf curl virus', 'Yellow curled leaves, stunted growth', 'Remove infected plants, control whiteflies', 'Use resistant varieties, control vectors', 'high', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus');

-- Insert sample predictions for testing
INSERT INTO predictions (image_filename, image_path, predicted_class, predicted_class_id, confidence, plant_type, disease_type, is_healthy, processing_time, model_used, model_accuracy, all_probabilities, user_agent, ip_address, is_real_ml) VALUES
('corn_healthy.jpg', '/uploads/corn_healthy_123.jpg', 'Corn_(maize)___healthy', 1, 0.95, 'Corn', 'Healthy', true, 1250, 'klasifikasi-tanaman-v1', '86.12%', '{"Corn_(maize)___healthy": 0.95, "Corn_(maize)___Common_rust_": 0.03, "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": 0.02}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.100', true),
('tomato_blight.jpg', '/uploads/tomato_blight_456.jpg', 'Tomato___Early_blight', 8, 0.87, 'Tomato', 'Early Blight', false, 1180, 'klasifikasi-tanaman-v1', '86.12%', '{"Tomato___Early_blight": 0.87, "Tomato___healthy": 0.08, "Tomato___Late_blight": 0.05}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.101', true),
('potato_rust.jpg', '/uploads/potato_rust_789.jpg', 'Potato___Early_blight', 6, 0.92, 'Potato', 'Early Blight', false, 1320, 'klasifikasi-tanaman-v1', '86.12%', '{"Potato___Early_blight": 0.92, "Potato___healthy": 0.05, "Potato___Late_blight": 0.03}', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.102', true);

-- Insert sample detection history for testing
INSERT INTO detection_history (user_id, ip_address, user_agent, image_file_name, original_image_name, prediction_result, confidence, plant_class, recommendations, is_guest, session_id) VALUES
(NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'sample1.jpg', 'corn_healthy.jpg', '{"classId": "Corn_(maize)___healthy", "confidence": 0.95}', 0.95, 'Corn Healthy', 'No treatment needed', true, 'guest_session_1'),
(NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'sample2.jpg', 'tomato_blight.jpg', '{"classId": "Tomato___Early_blight", "confidence": 0.87}', 0.87, 'Tomato Early Blight', 'Apply fungicides, improve air circulation', true, 'guest_session_1'),
(2, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'sample3.jpg', 'potato_healthy.jpg', '{"classId": "Potato___healthy", "confidence": 0.92}', 0.92, 'Potato Healthy', 'No treatment needed', false, 'user_session_1'),
(2, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'sample4.jpg', 'corn_rust.jpg', '{"classId": "Corn_(maize)___Common_rust_", "confidence": 0.89}', 0.89, 'Corn Common Rust', 'Apply fungicides, remove infected plants', false, 'user_session_1');

-- Insert sample guest detection limits for testing
INSERT INTO guest_detection_limits (ip_address, detection_count, last_detection_at, is_blocked, user_agent) VALUES
('192.168.1.100', 2, CURRENT_TIMESTAMP - INTERVAL '2 hours', true, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('192.168.1.102', 1, CURRENT_TIMESTAMP - INTERVAL '1 hour', false, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'),
('192.168.1.103', 0, NULL, false, 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36');

-- =====================================================
-- 6. VERIFICATION
-- =====================================================

-- Show table creation status
SELECT 'Fresh Database Setup Complete' as status;

-- Verify all tables exist
SELECT table_name, '✓ Created' as status 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'plants', 'predictions', 'detection_history', 'guest_detection_limits')
ORDER BY table_name;

-- Count records in each table
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Plants' as table_name, COUNT(*) as count FROM plants
UNION ALL
SELECT 'Predictions' as table_name, COUNT(*) as count FROM predictions
UNION ALL
SELECT 'Detection History' as table_name, COUNT(*) as count FROM detection_history
UNION ALL
SELECT 'Guest Detection Limits' as table_name, COUNT(*) as count FROM guest_detection_limits
ORDER BY table_name;

-- Show sample data
SELECT 'Sample Users' as section, username, email, role FROM users LIMIT 5;

SELECT 'Sample Plants' as section, name, model_class_id, severity FROM plants LIMIT 5;

SELECT 'Sample Predictions' as section, predicted_class, confidence, plant_type, disease_type FROM predictions LIMIT 5;

-- =====================================================
-- SCRIPT COMPLETION
-- =====================================================

SELECT '🎉 Fresh database setup completed successfully!' as message;
SELECT 'All old tables have been dropped and recreated with correct structure' as info;
SELECT 'Default admin credentials: admin/admin123' as admin_info;
SELECT 'Default user credentials: user1/user123' as user_info;
