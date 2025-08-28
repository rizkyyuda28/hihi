-- =====================================================
-- CREATE DATABASE SCRIPT
-- Plant Disease Classification System
-- PostgreSQL Database
-- =====================================================

-- Connect to postgres database first
\c postgres;

-- Drop database if exists (be careful with this in production!)
DROP DATABASE IF EXISTS plant_classifier_dev;

-- Create new database
CREATE DATABASE plant_classifier_dev
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the new database
\c plant_classifier_dev;

-- Show database creation status
SELECT 'Database plant_classifier_dev created successfully!' as status;
SELECT current_database() as current_database;
SELECT current_user as current_user;

-- Show database size
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size;
