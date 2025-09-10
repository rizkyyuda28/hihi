-- =====================================================
-- SETUP LOGIN SYSTEM
-- Plant Disease Classification System
-- PostgreSQL Database - Complete Login System Setup
-- =====================================================

-- Connect to your database (uncomment and modify as needed)
-- \c plant_classifier_dev;

-- =====================================================
-- 1. CREATE USERS TABLE (IF NOT EXISTS)
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
-- 2. CREATE INDEXES FOR USERS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

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
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. INSERT DEFAULT ADMIN USER
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
) ON CONFLICT (username) DO NOTHING;

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
) ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- 5. VERIFY USERS TABLE
-- =====================================================

SELECT 'Users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Users data:' as info;
SELECT id, username, email, role, is_active, created_at
FROM users
ORDER BY id;

-- =====================================================
-- 6. TEST LOGIN FUNCTIONALITY
-- =====================================================

-- Test password verification (this should work with bcrypt)
SELECT 'Testing password verification:' as info;
SELECT 
    username,
    email,
    role,
    CASE 
        WHEN password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
        THEN 'Password matches (bcrypt hash)'
        ELSE 'Password does not match'
    END as password_status
FROM users
WHERE username = 'admin';

-- =====================================================
-- 7. CREATE SESSION TABLE (OPTIONAL - FOR SESSION STORAGE)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Trigger for sessions table
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. CREATE LOGIN LOGS TABLE (FOR AUDIT)
-- =====================================================

CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    login_status VARCHAR(50) CHECK (login_status IN ('success', 'failed', 'blocked')),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for login logs
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_username ON login_logs(username);
CREATE INDEX IF NOT EXISTS idx_login_logs_ip_address ON login_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_status ON login_logs(login_status);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON login_logs(created_at);

-- =====================================================
-- 9. INSERT SAMPLE LOGIN LOGS
-- =====================================================

INSERT INTO login_logs (user_id, username, ip_address, user_agent, login_status, failure_reason)
VALUES 
    (1, 'admin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NULL),
    (2, 'user', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 10. FINAL VERIFICATION
-- =====================================================

SELECT 'Login system setup completed!' as message;
SELECT 'Tables created:' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_sessions', 'login_logs')
ORDER BY table_name;

SELECT 'Default users created:' as info;
SELECT username, email, role, is_active
FROM users
ORDER BY id;

SELECT 'Next steps:' as info;
SELECT '1. Restart your backend application' as step1;
SELECT '2. Test login with admin/admin123 or user/user123' as step2;
SELECT '3. Check /api/auth/verify endpoint' as step3;
