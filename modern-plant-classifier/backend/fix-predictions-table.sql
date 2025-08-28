-- =====================================================
-- FIX PREDICTIONS TABLE SCRIPT
-- Plant Disease Classification System
-- PostgreSQL Database - Fix existing predictions table
-- =====================================================

-- Connect to your database (uncomment and modify as needed)
-- \c plant_classifier_dev;

-- =====================================================
-- 1. BACKUP EXISTING DATA (OPTIONAL)
-- =====================================================

-- Create backup table if you want to preserve existing data
CREATE TABLE IF NOT EXISTS predictions_backup AS 
SELECT * FROM predictions WHERE 1=0;

-- Copy existing data to backup (uncomment if you want to backup)
-- INSERT INTO predictions_backup SELECT * FROM predictions;

-- =====================================================
-- 2. DROP EXISTING PREDICTIONS TABLE
-- =====================================================

-- Drop existing predictions table and all its dependencies
DROP TABLE IF EXISTS predictions CASCADE;

-- =====================================================
-- 3. RECREATE PREDICTIONS TABLE WITH CORRECT STRUCTURE
-- =====================================================

-- Create predictions table with correct structure matching Sequelize model
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

-- =====================================================
-- 4. CREATE INDEXES FOR PREDICTIONS
-- =====================================================

-- Create all necessary indexes for predictions table
CREATE INDEX idx_predictions_predicted_class ON predictions(predicted_class);
CREATE INDEX idx_predictions_predicted_class_id ON predictions(predicted_class_id);
CREATE INDEX idx_predictions_confidence ON predictions(confidence);
CREATE INDEX idx_predictions_plant_type ON predictions(plant_type);
CREATE INDEX idx_predictions_disease_type ON predictions(disease_type);
CREATE INDEX idx_predictions_is_healthy ON predictions(is_healthy);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);
CREATE INDEX idx_predictions_ip_address ON predictions(ip_address);

-- =====================================================
-- 5. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for predictions table
CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. INSERT SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample predictions for testing
INSERT INTO predictions (image_filename, image_path, predicted_class, predicted_class_id, confidence, plant_type, disease_type, is_healthy, processing_time, model_used, model_accuracy, all_probabilities, user_agent, ip_address, is_real_ml) VALUES
('corn_healthy.jpg', '/uploads/corn_healthy_123.jpg', 'Corn_(maize)___healthy', 1, 0.95, 'Corn', 'Healthy', true, 1250, 'klasifikasi-tanaman-v1', '86.12%', '{"Corn_(maize)___healthy": 0.95, "Corn_(maize)___Common_rust_": 0.03, "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": 0.02}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.100', true),
('tomato_blight.jpg', '/uploads/tomato_blight_456.jpg', 'Tomato___Early_blight', 8, 0.87, 'Tomato', 'Early Blight', false, 1180, 'klasifikasi-tanaman-v1', '86.12%', '{"Tomato___Early_blight": 0.87, "Tomato___healthy": 0.08, "Tomato___Late_blight": 0.05}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.101', true),
('potato_rust.jpg', '/uploads/potato_rust_789.jpg', 'Potato___Early_blight', 6, 0.92, 'Potato', 'Early Blight', false, 1320, 'klasifikasi-tanaman-v1', '86.12%', '{"Potato___Early_blight": 0.92, "Potato___healthy": 0.05, "Potato___Late_blight": 0.03}', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.102', true);

-- =====================================================
-- 7. VERIFICATION
-- =====================================================

-- Show table structure
SELECT 'Predictions Table Fixed' as status;

-- Verify table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'predictions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'predictions'
ORDER BY indexname;

-- Verify sample data
SELECT 'Sample Predictions' as section, predicted_class, confidence, plant_type, disease_type FROM predictions LIMIT 5;

-- Count records
SELECT 'Total Predictions' as info, COUNT(*) as count FROM predictions;

-- =====================================================
-- SCRIPT COMPLETION
-- =====================================================

SELECT '🎉 Predictions table fixed successfully!' as message;
SELECT 'Table structure now matches Sequelize model' as info;
SELECT 'All indexes created correctly' as info;
SELECT 'Sample data inserted for testing' as info;
