-- Database Update Script for Plant Disease Classification System
-- PostgreSQL Database - Update existing database

-- Connect to your existing database
-- \c your_existing_database_name;

-- Add new tables for detection history and guest limits

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
CREATE INDEX IF NOT EXISTS idx_detection_history_user_id ON detection_history(user_id);
CREATE INDEX IF NOT EXISTS idx_detection_history_ip_address ON detection_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_detection_history_created_at ON detection_history(created_at);
CREATE INDEX IF NOT EXISTS idx_detection_history_plant_class ON detection_history(plant_class);

CREATE INDEX IF NOT EXISTS idx_guest_detection_limits_ip_address ON guest_detection_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_guest_detection_limits_is_blocked ON guest_detection_limits(is_blocked);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_detection_history_updated_at BEFORE UPDATE ON detection_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guest_detection_limits_updated_at BEFORE UPDATE ON guest_detection_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add triggers to existing tables if they don't have them
DO $$
BEGIN
    -- Check if trigger exists for users table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Check if trigger exists for plants table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_plants_updated_at') THEN
        CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Check if trigger exists for predictions table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_predictions_updated_at') THEN
        CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Verify new tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('detection_history', 'guest_detection_limits');

-- Verify triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table IN ('detection_history', 'guest_detection_limits', 'users', 'plants', 'predictions');
