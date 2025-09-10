-- =====================================================
-- FIX USERS TABLE
-- Plant Disease Classification System
-- PostgreSQL Database - Fix users table created_at issue
-- =====================================================

-- Connect to your database (uncomment and modify as needed)
-- \c plant_classifier_dev;

-- =====================================================
-- 1. CHECK CURRENT USERS TABLE STRUCTURE
-- =====================================================

SELECT 'Current users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. FIX USERS TABLE - ADD DEFAULT VALUES
-- =====================================================

-- Add default values for created_at and updated_at if they don't exist
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- =====================================================
-- 3. UPDATE EXISTING RECORDS WITH NULL TIMESTAMPS
-- =====================================================

-- Update any existing records that have NULL timestamps
UPDATE users 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

UPDATE users 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

-- =====================================================
-- 4. CLEAR EXISTING USERS (OPTIONAL - UNCOMMENT IF NEEDED)
-- =====================================================

-- Uncomment the following lines if you want to clear existing users
-- DELETE FROM users WHERE username IN ('admin', 'user');

-- =====================================================
-- 5. INSERT DEFAULT USERS WITH EXPLICIT TIMESTAMPS
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
-- 6. VERIFY USERS TABLE
-- =====================================================

SELECT 'Users table after fix:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Users data:' as info;
SELECT id, username, email, role, is_active, created_at, updated_at
FROM users
ORDER BY id;

-- =====================================================
-- 7. TEST INSERT (OPTIONAL)
-- =====================================================

-- Test insert to make sure timestamps work
INSERT INTO users (username, email, password, role, is_active) 
VALUES (
    'test_user', 
    'test@plantclassifier.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- test123
    'user', 
    true
) ON CONFLICT (username) DO NOTHING;

-- Check the test user
SELECT 'Test user created:' as info;
SELECT id, username, email, role, is_active, created_at, updated_at
FROM users
WHERE username = 'test_user';

-- Clean up test user
DELETE FROM users WHERE username = 'test_user';

-- =====================================================
-- SCRIPT COMPLETION
-- =====================================================

SELECT '🎉 Users table fix completed!' as message;
SELECT 'Default users should now be created successfully' as info;
SELECT 'Timestamps should work correctly' as next_step;
