-- =====================================================
-- SETUP DATABASE COMPLETE
-- Plant Disease Classification System
-- PostgreSQL Database - Complete Setup
-- =====================================================

-- Connect to your database
-- \c plant_disease_db;

-- =====================================================
-- 1. CREATE USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CREATE PLANTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS plants (
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

-- =====================================================
-- 3. CREATE PREDICTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS predictions (
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

-- =====================================================
-- 4. CREATE DETECTION HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS detection_history (
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

-- =====================================================
-- 5. CREATE GUEST DETECTION LIMITS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS guest_detection_limits (
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

-- =====================================================
-- 6. CREATE INDEXES
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Plants table indexes
CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name);
CREATE INDEX IF NOT EXISTS idx_plants_model_class_id ON plants(model_class_id);

-- Predictions table indexes
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_plant_id ON predictions(plant_id);
CREATE INDEX IF NOT EXISTS idx_predictions_predicted_class ON predictions(predicted_class);
CREATE INDEX IF NOT EXISTS idx_predictions_plant_type ON predictions(plant_type);
CREATE INDEX IF NOT EXISTS idx_predictions_is_real_ml ON predictions(is_real_ml);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);

-- Detection history table indexes
CREATE INDEX IF NOT EXISTS idx_detection_history_user_id ON detection_history(user_id);
CREATE INDEX IF NOT EXISTS idx_detection_history_ip_address ON detection_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_detection_history_is_guest ON detection_history(is_guest);
CREATE INDEX IF NOT EXISTS idx_detection_history_created_at ON detection_history(created_at);

-- Guest detection limits table indexes
CREATE INDEX IF NOT EXISTS idx_guest_detection_limits_ip_address ON guest_detection_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_guest_detection_limits_is_blocked ON guest_detection_limits(is_blocked);

-- =====================================================
-- 7. CREATE UPDATE TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 8. CREATE TRIGGERS
-- =====================================================

-- Users table trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Plants table trigger
DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at
    BEFORE UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Predictions table trigger
DROP TRIGGER IF EXISTS update_predictions_updated_at ON predictions;
CREATE TRIGGER update_predictions_updated_at
    BEFORE UPDATE ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Detection history table trigger
DROP TRIGGER IF EXISTS update_detection_history_updated_at ON detection_history;
CREATE TRIGGER update_detection_history_updated_at
    BEFORE UPDATE ON detection_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Guest detection limits table trigger
DROP TRIGGER IF EXISTS update_guest_detection_limits_updated_at ON guest_detection_limits;
CREATE TRIGGER update_guest_detection_limits_updated_at
    BEFORE UPDATE ON guest_detection_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. INSERT DEFAULT USERS
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
) ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

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
) ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 10. INSERT SAMPLE PLANTS
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
('Tomato Yellow Leaf Curl Virus', 'Solanum lycopersicum', 'Tomato affected by yellow leaf curl virus', 'Yellowing and curling of leaves', 'Remove infected plants', 'Control whiteflies and use resistant varieties', 'High', 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 11. VERIFY SETUP
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
