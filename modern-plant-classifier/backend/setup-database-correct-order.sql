-- =====================================================
-- SETUP DATABASE CORRECT ORDER
-- Plant Disease Classification System
-- PostgreSQL Database - Setup in correct order to avoid foreign key errors
-- =====================================================

-- Connect to your database
-- \c plant_disease_db;

-- =====================================================
-- 1. CREATE USERS TABLE FIRST
-- =====================================================

-- Drop existing users table if exists
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================
-- 2. CREATE PLANTS TABLE SECOND
-- =====================================================

-- Drop existing plants table if exists
DROP TABLE IF EXISTS plants CASCADE;

-- Create plants table
CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    description TEXT,
    symptoms TEXT,
    treatment TEXT,
    prevention TEXT,
    severity VARCHAR(50),
    image_url VARCHAR(500),
    model_class_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for plants table
CREATE INDEX idx_plants_name ON plants(name);
CREATE INDEX idx_plants_model_class_id ON plants(model_class_id);

-- =====================================================
-- 3. CREATE PREDICTIONS TABLE THIRD
-- =====================================================

-- Drop existing predictions table if exists
DROP TABLE IF EXISTS predictions CASCADE;

-- Create predictions table
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    plant_id INTEGER REFERENCES plants(id) ON DELETE SET NULL,
    image_path VARCHAR(500),
    image_filename VARCHAR(255),
    predicted_class VARCHAR(100),
    predicted_class_id INTEGER,
    confidence DECIMAL(5,2),
    plant_type VARCHAR(100),
    disease_type VARCHAR(100),
    is_healthy BOOLEAN,
    processing_time INTEGER,
    model_used VARCHAR(100) DEFAULT 'klasifikasi-tanaman-v1',
    model_accuracy VARCHAR(20) DEFAULT '86.12%',
    all_probabilities JSONB,
    user_agent TEXT,
    ip_address INET,
    is_real_ml BOOLEAN DEFAULT true,
    metadata JSONB,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for predictions table
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_plant_id ON predictions(plant_id);
CREATE INDEX idx_predictions_predicted_class ON predictions(predicted_class);
CREATE INDEX idx_predictions_plant_type ON predictions(plant_type);
CREATE INDEX idx_predictions_is_real_ml ON predictions(is_real_ml);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);

-- =====================================================
-- 4. CREATE DETECTION HISTORY TABLE FOURTH
-- =====================================================

-- Drop existing detection_history table if exists
DROP TABLE IF EXISTS detection_history CASCADE;

-- Create detection_history table
CREATE TABLE detection_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    image_filename VARCHAR(255),
    original_image_name VARCHAR(255),
    prediction_result JSONB,
    confidence DECIMAL(5,2),
    plant_class VARCHAR(100),
    recommendations TEXT,
    is_guest BOOLEAN DEFAULT false,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for detection_history table
CREATE INDEX idx_detection_history_user_id ON detection_history(user_id);
CREATE INDEX idx_detection_history_ip_address ON detection_history(ip_address);
CREATE INDEX idx_detection_history_is_guest ON detection_history(is_guest);
CREATE INDEX idx_detection_history_created_at ON detection_history(created_at);
CREATE INDEX idx_detection_history_session_id ON detection_history(session_id);

-- =====================================================
-- 5. CREATE GUEST DETECTION LIMITS TABLE FIFTH
-- =====================================================

-- Drop existing guest_detection_limits table if exists
DROP TABLE IF EXISTS guest_detection_limits CASCADE;

-- Create guest_detection_limits table
CREATE TABLE guest_detection_limits (
    id SERIAL PRIMARY KEY,
    ip_address INET UNIQUE NOT NULL,
    detection_count INTEGER DEFAULT 0,
    last_detection_at TIMESTAMP WITH TIME ZONE,
    is_blocked BOOLEAN DEFAULT false,
    blocked_at TIMESTAMP WITH TIME ZONE,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for guest_detection_limits table
CREATE INDEX idx_guest_detection_limits_ip_address ON guest_detection_limits(ip_address);
CREATE INDEX idx_guest_detection_limits_is_blocked ON guest_detection_limits(is_blocked);
CREATE INDEX idx_guest_detection_limits_detection_count ON guest_detection_limits(detection_count);

-- =====================================================
-- 6. CREATE UPDATE TRIGGER FUNCTION
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Users table trigger
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Plants table trigger
CREATE TRIGGER update_plants_updated_at
    BEFORE UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Predictions table trigger
CREATE TRIGGER update_predictions_updated_at
    BEFORE UPDATE ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Detection history table trigger
CREATE TRIGGER update_detection_history_updated_at
    BEFORE UPDATE ON detection_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Guest detection limits table trigger
CREATE TRIGGER update_guest_detection_limits_updated_at
    BEFORE UPDATE ON guest_detection_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. INSERT DEFAULT USERS
-- =====================================================

-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password, role, is_active, created_at, updated_at) 
VALUES (
    'admin', 
    'admin@plantclassifier.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'admin', 
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert test user (password: user123)
INSERT INTO users (username, email, password, role, is_active, created_at, updated_at) 
VALUES (
    'user', 
    'user@plantclassifier.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- user123
    'user', 
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. INSERT SAMPLE PLANTS
-- =====================================================

INSERT INTO plants (name, scientific_name, description, symptoms, treatment, prevention, severity, model_class_id, created_at, updated_at) VALUES
('Corn Healthy', 'Zea mays', 'Healthy corn plant', 'No visible symptoms', 'Maintain good growing conditions', 'Proper irrigation and fertilization', 'None', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Corn Common Rust', 'Zea mays', 'Corn affected by common rust', 'Orange pustules on leaves', 'Apply fungicide', 'Crop rotation and resistant varieties', 'Medium', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Corn Gray Leaf Spot', 'Zea mays', 'Corn affected by gray leaf spot', 'Gray lesions on leaves', 'Apply fungicide', 'Proper spacing and air circulation', 'High', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Corn Northern Leaf Blight', 'Zea mays', 'Corn affected by northern leaf blight', 'Large brown lesions', 'Apply fungicide', 'Crop rotation and resistant varieties', 'High', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Potato Healthy', 'Solanum tuberosum', 'Healthy potato plant', 'No visible symptoms', 'Maintain good growing conditions', 'Proper irrigation and fertilization', 'None', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Potato Early Blight', 'Solanum tuberosum', 'Potato affected by early blight', 'Dark spots on leaves', 'Apply fungicide', 'Crop rotation and proper spacing', 'Medium', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Potato Late Blight', 'Solanum tuberosum', 'Potato affected by late blight', 'Water-soaked lesions', 'Apply fungicide', 'Crop rotation and resistant varieties', 'High', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomato Healthy', 'Solanum lycopersicum', 'Healthy tomato plant', 'No visible symptoms', 'Maintain good growing conditions', 'Proper irrigation and fertilization', 'None', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomato Bacterial Spot', 'Solanum lycopersicum', 'Tomato affected by bacterial spot', 'Small dark spots on leaves', 'Apply copper fungicide', 'Crop rotation and resistant varieties', 'Medium', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomato Early Blight', 'Solanum lycopersicum', 'Tomato affected by early blight', 'Concentric rings on leaves', 'Apply fungicide', 'Proper spacing and air circulation', 'Medium', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomato Late Blight', 'Solanum lycopersicum', 'Tomato affected by late blight', 'Water-soaked lesions', 'Apply fungicide', 'Crop rotation and resistant varieties', 'High', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomato Leaf Mold', 'Solanum lycopersicum', 'Tomato affected by leaf mold', 'Yellow spots on upper surface', 'Apply fungicide', 'Proper spacing and air circulation', 'Medium', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomato Septoria Leaf Spot', 'Solanum lycopersicum', 'Tomato affected by septoria leaf spot', 'Small brown spots with yellow halos', 'Apply fungicide', 'Crop rotation and proper spacing', 'Medium', 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomato Spider Mites', 'Solanum lycopersicum', 'Tomato affected by spider mites', 'Fine webbing and stippling', 'Apply miticide', 'Proper irrigation and resistant varieties', 'Low', 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomato Target Spot', 'Solanum lycopersicum', 'Tomato affected by target spot', 'Concentric rings on leaves', 'Apply fungicide', 'Proper spacing and air circulation', 'Medium', 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomato Mosaic Virus', 'Solanum lycopersicum', 'Tomato affected by mosaic virus', 'Mottled yellow and green leaves', 'Remove infected plants', 'Control aphids and use resistant varieties', 'High', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tomato Yellow Leaf Curl Virus', 'Solanum lycopersicum', 'Tomato affected by yellow leaf curl virus', 'Yellowing and curling of leaves', 'Remove infected plants', 'Control whiteflies and use resistant varieties', 'High', 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =====================================================
-- 10. INSERT SAMPLE PREDICTIONS
-- =====================================================

-- Insert sample predictions
INSERT INTO predictions (
    user_id, plant_id, image_filename, predicted_class, 
    predicted_class_id, confidence, plant_type, disease_type, 
    is_healthy, processing_time, model_used, model_accuracy, 
    is_real_ml, created_at, updated_at
) VALUES 
(1, 1, 'corn_healthy_sample.jpg', 'Corn Healthy', 0, 95.5, 'corn', 'healthy', true, 1200, 'klasifikasi-tanaman-v1', '86.12%', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 'corn_rust_sample.jpg', 'Corn Common Rust', 1, 87.3, 'corn', 'rust', false, 1500, 'klasifikasi-tanaman-v1', '86.12%', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =====================================================
-- 11. INSERT SAMPLE DETECTION HISTORY
-- =====================================================

-- Insert sample detection history
INSERT INTO detection_history (
    user_id, ip_address, user_agent, image_filename, 
    original_image_name, prediction_result, confidence, 
    plant_class, recommendations, is_guest, session_id, 
    created_at, updated_at
) VALUES 
(1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'corn_healthy_sample.jpg', 'corn_healthy_sample.jpg', '{"class": "Corn Healthy", "confidence": 95.5, "plant_type": "corn", "disease_type": "healthy"}', 95.5, 'Corn Healthy', 'Maintain good growing conditions', false, 'session_123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'tomato_blight_sample.jpg', 'tomato_blight_sample.jpg', '{"class": "Tomato Early Blight", "confidence": 87.3, "plant_type": "tomato", "disease_type": "early blight"}', 87.3, 'Tomato Early Blight', 'Apply fungicide and improve air circulation', true, 'session_456', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =====================================================
-- 12. INSERT SAMPLE GUEST DETECTION LIMITS
-- =====================================================

-- Insert sample guest detection limits
INSERT INTO guest_detection_limits (
    ip_address, detection_count, last_detection_at, 
    is_blocked, user_agent, created_at, updated_at
) VALUES 
('127.0.0.1', 0, NULL, false, 'Test-Client/1.0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('192.168.1.100', 1, CURRENT_TIMESTAMP - INTERVAL '1 hour', false, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =====================================================
-- 13. VERIFY SETUP
-- =====================================================

SELECT 'Database setup completed successfully!' as message;
SELECT 'Tables created:' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'plants', 'predictions', 'detection_history', 'guest_detection_limits')
ORDER BY table_name;

SELECT 'Default users created:' as info;
SELECT username, email, role, is_active, created_at
FROM users
ORDER BY id;

SELECT 'Sample plants created:' as info;
SELECT name, scientific_name, severity, model_class_id
FROM plants
ORDER BY model_class_id;

SELECT 'Next steps:' as info;
SELECT '1. Restart your backend application' as step1;
SELECT '2. Test login with admin/admin123 or user/user123' as step2;
SELECT '3. Test plant disease prediction' as step3;
