-- =====================================================
-- FIX USERS TABLE ONLY
-- Plant Disease Classification System
-- PostgreSQL Database - Fix users table
-- =====================================================

-- Connect to your database
-- \c plant_disease_db;

-- =====================================================
-- 1. DROP AND RECREATE USERS TABLE
-- =====================================================

-- Drop existing users table if exists
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with correct structure
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

-- =====================================================
-- 2. CREATE INDEXES FOR USERS TABLE
-- =====================================================

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================
-- 3. CREATE UPDATE TRIGGER FOR USERS TABLE
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. INSERT DEFAULT USERS
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
-- 5. VERIFY USERS TABLE
-- =====================================================

SELECT 'Users table fixed successfully!' as message;
SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Users data:' as info;
SELECT id, username, email, role, is_active, created_at, updated_at
FROM users
ORDER BY id;

SELECT 'Next steps:' as info;
SELECT '1. Restart your backend application' as step1;
SELECT '2. Test login with admin/admin123 or user/user123' as step2;
SELECT '3. Check if login works in frontend' as step3;
