-- =====================================================
-- FIX GUEST DETECTION LIMITS TABLE ONLY
-- Plant Disease Classification System
-- PostgreSQL Database - Fix guest detection limits table
-- =====================================================

-- Connect to your database
-- \c plant_disease_db;

-- =====================================================
-- 1. DROP AND RECREATE GUEST DETECTION LIMITS TABLE
-- =====================================================

-- Drop existing guest_detection_limits table if exists
DROP TABLE IF EXISTS guest_detection_limits CASCADE;

-- Create guest_detection_limits table with correct structure
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

-- =====================================================
-- 2. CREATE INDEXES FOR GUEST DETECTION LIMITS TABLE
-- =====================================================

CREATE INDEX idx_guest_detection_limits_ip_address ON guest_detection_limits(ip_address);
CREATE INDEX idx_guest_detection_limits_is_blocked ON guest_detection_limits(is_blocked);
CREATE INDEX idx_guest_detection_limits_detection_count ON guest_detection_limits(detection_count);

-- =====================================================
-- 3. CREATE UPDATE TRIGGER FOR GUEST DETECTION LIMITS TABLE
-- =====================================================

-- Function to update updated_at column (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for guest_detection_limits table
CREATE TRIGGER update_guest_detection_limits_updated_at
    BEFORE UPDATE ON guest_detection_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. INSERT SAMPLE GUEST DETECTION LIMITS
-- =====================================================

-- Insert sample guest detection limits (optional)
INSERT INTO guest_detection_limits (
    ip_address, detection_count, last_detection_at, 
    is_blocked, user_agent, created_at, updated_at
) VALUES 
('127.0.0.1', 0, NULL, false, 'Test-Client/1.0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('192.168.1.100', 1, CURRENT_TIMESTAMP - INTERVAL '1 hour', false, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (ip_address) DO NOTHING;

-- =====================================================
-- 5. VERIFY GUEST DETECTION LIMITS TABLE
-- =====================================================

SELECT 'Guest detection limits table fixed successfully!' as message;
SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'guest_detection_limits' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Sample guest limits:' as info;
SELECT ip_address, detection_count, is_blocked, last_detection_at
FROM guest_detection_limits
ORDER BY id;

SELECT 'Next steps:' as info;
SELECT '1. Restart your backend application' as step1;
SELECT '2. Test guest detection limits' as step2;
SELECT '3. Check if limits are enforced correctly' as step3;
