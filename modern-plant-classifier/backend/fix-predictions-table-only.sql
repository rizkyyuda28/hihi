-- =====================================================
-- FIX PREDICTIONS TABLE ONLY
-- Plant Disease Classification System
-- PostgreSQL Database - Fix predictions table
-- =====================================================

-- Connect to your database
-- \c plant_disease_db;

-- =====================================================
-- 1. DROP AND RECREATE PREDICTIONS TABLE
-- =====================================================

-- Drop existing predictions table if exists
DROP TABLE IF EXISTS predictions CASCADE;

-- Create predictions table with correct structure
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

-- =====================================================
-- 2. CREATE INDEXES FOR PREDICTIONS TABLE
-- =====================================================

CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_plant_id ON predictions(plant_id);
CREATE INDEX idx_predictions_predicted_class ON predictions(predicted_class);
CREATE INDEX idx_predictions_plant_type ON predictions(plant_type);
CREATE INDEX idx_predictions_is_real_ml ON predictions(is_real_ml);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);

-- =====================================================
-- 3. CREATE UPDATE TRIGGER FOR PREDICTIONS TABLE
-- =====================================================

-- Function to update updated_at column (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for predictions table
CREATE TRIGGER update_predictions_updated_at
    BEFORE UPDATE ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. INSERT SAMPLE PREDICTIONS (SKIP IF PLANTS TABLE NOT EXISTS)
-- =====================================================

-- Check if plants table exists and has data
DO $$
BEGIN
    -- Only insert sample predictions if plants table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plants' AND table_schema = 'public') THEN
        -- Check if plants table has data
        IF EXISTS (SELECT 1 FROM plants LIMIT 1) THEN
            -- Insert sample predictions
            INSERT INTO predictions (
                user_id, plant_id, image_filename, predicted_class, 
                predicted_class_id, confidence, plant_type, disease_type, 
                is_healthy, processing_time, model_used, model_accuracy, 
                is_real_ml, created_at, updated_at
            ) 
            SELECT 
                1, 
                (SELECT id FROM plants WHERE model_class_id = 0 LIMIT 1),
                'corn_healthy_sample.jpg', 
                'Corn Healthy', 
                0, 
                95.5, 
                'corn', 
                'healthy', 
                true, 
                1200, 
                'klasifikasi-tanaman-v1', 
                '86.12%', 
                true, 
                CURRENT_TIMESTAMP, 
                CURRENT_TIMESTAMP
            WHERE EXISTS (SELECT 1 FROM plants WHERE model_class_id = 0)
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Sample predictions inserted successfully';
        ELSE
            RAISE NOTICE 'Plants table exists but has no data, skipping sample predictions';
        END IF;
    ELSE
        RAISE NOTICE 'Plants table does not exist, skipping sample predictions';
    END IF;
END $$;

-- =====================================================
-- 5. VERIFY PREDICTIONS TABLE
-- =====================================================

SELECT 'Predictions table fixed successfully!' as message;
SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'predictions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Sample predictions:' as info;
SELECT id, image_filename, predicted_class, confidence, plant_type, is_real_ml
FROM predictions
ORDER BY id;

SELECT 'Next steps:' as info;
SELECT '1. Restart your backend application' as step1;
SELECT '2. Test plant disease prediction' as step2;
SELECT '3. Check if predictions are saved correctly' as step3;
