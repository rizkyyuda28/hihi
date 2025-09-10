-- =====================================================
-- FIX DETECTION HISTORY TABLE ONLY
-- Plant Disease Classification System
-- PostgreSQL Database - Fix detection history table
-- =====================================================

-- Connect to your database
-- \c plant_disease_db;

-- =====================================================
-- 1. DROP AND RECREATE DETECTION HISTORY TABLE
-- =====================================================

-- Drop existing detection_history table if exists
DROP TABLE IF EXISTS detection_history CASCADE;

-- Create detection_history table with correct structure
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

-- =====================================================
-- 2. CREATE INDEXES FOR DETECTION HISTORY TABLE
-- =====================================================

CREATE INDEX idx_detection_history_user_id ON detection_history(user_id);
CREATE INDEX idx_detection_history_ip_address ON detection_history(ip_address);
CREATE INDEX idx_detection_history_is_guest ON detection_history(is_guest);
CREATE INDEX idx_detection_history_created_at ON detection_history(created_at);
CREATE INDEX idx_detection_history_session_id ON detection_history(session_id);

-- =====================================================
-- 3. CREATE UPDATE TRIGGER FOR DETECTION HISTORY TABLE
-- =====================================================

-- Function to update updated_at column (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for detection_history table
CREATE TRIGGER update_detection_history_updated_at
    BEFORE UPDATE ON detection_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. INSERT SAMPLE DETECTION HISTORY (SKIP IF USERS TABLE NOT EXISTS)
-- =====================================================

-- Check if users table exists and has data
DO $$
BEGIN
    -- Only insert sample detection history if users table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        -- Check if users table has data
        IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
            -- Insert sample detection history
            INSERT INTO detection_history (
                user_id, ip_address, user_agent, image_filename, 
                original_image_name, prediction_result, confidence, 
                plant_class, recommendations, is_guest, session_id, 
                created_at, updated_at
            ) 
            SELECT 
                (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
                '127.0.0.1', 
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
                'corn_healthy_sample.jpg', 
                'corn_healthy_sample.jpg', 
                '{"class": "Corn Healthy", "confidence": 95.5, "plant_type": "corn", "disease_type": "healthy"}', 
                95.5, 
                'Corn Healthy', 
                'Maintain good growing conditions', 
                false, 
                'session_123', 
                CURRENT_TIMESTAMP, 
                CURRENT_TIMESTAMP
            WHERE EXISTS (SELECT 1 FROM users WHERE username = 'admin')
            ON CONFLICT DO NOTHING;
            
            -- Insert guest detection history (no user_id)
            INSERT INTO detection_history (
                user_id, ip_address, user_agent, image_filename, 
                original_image_name, prediction_result, confidence, 
                plant_class, recommendations, is_guest, session_id, 
                created_at, updated_at
            ) VALUES 
            (NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'tomato_blight_sample.jpg', 'tomato_blight_sample.jpg', '{"class": "Tomato Early Blight", "confidence": 87.3, "plant_type": "tomato", "disease_type": "early blight"}', 87.3, 'Tomato Early Blight', 'Apply fungicide and improve air circulation', true, 'session_456', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Sample detection history inserted successfully';
        ELSE
            RAISE NOTICE 'Users table exists but has no data, skipping sample detection history';
        END IF;
    ELSE
        RAISE NOTICE 'Users table does not exist, skipping sample detection history';
    END IF;
END $$;

-- =====================================================
-- 5. VERIFY DETECTION HISTORY TABLE
-- =====================================================

SELECT 'Detection history table fixed successfully!' as message;
SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'detection_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Sample detection history:' as info;
SELECT id, user_id, ip_address, image_filename, plant_class, confidence, is_guest
FROM detection_history
ORDER BY id;

SELECT 'Next steps:' as info;
SELECT '1. Restart your backend application' as step1;
SELECT '2. Test detection history functionality' as step2;
SELECT '3. Check if history is saved correctly' as step3;
