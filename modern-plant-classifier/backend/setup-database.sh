#!/bin/bash

# ========================================
# Database Setup Script for Plant Disease Classification System
# PostgreSQL Database - Linux/Mac Bash Script
# ========================================

echo "========================================"
echo "Plant Disease Classification Database Setup"
echo "========================================"
echo

# Configuration
DB_NAME="plant_classifier_dev"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "[INFO] Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo

# Check if PostgreSQL is running
echo "[INFO] Checking PostgreSQL connection..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT version();" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[ERROR] Cannot connect to PostgreSQL!"
    echo "Please make sure PostgreSQL is running and accessible."
    echo
    read -p "Press Enter to continue..."
    exit 1
fi
echo "[SUCCESS] PostgreSQL connection OK"
echo

# Step 1: Create database
echo "[STEP 1] Creating database $DB_NAME..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -f "create-database.sql"
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to create database!"
    read -p "Press Enter to continue..."
    exit 1
fi
echo "[SUCCESS] Database $DB_NAME created"
echo

# Step 2: Setup tables and data
echo "[STEP 2] Setting up tables and sample data..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "fresh-database-setup.sql"
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to setup tables and data!"
    read -p "Press Enter to continue..."
    exit 1
fi
echo "[SUCCESS] Tables and data setup completed"
echo

# Step 3: Verification
echo "[STEP 3] Verifying database setup..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 'Verification Complete' as status; SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
if [ $? -ne 0 ]; then
    echo "[ERROR] Verification failed!"
    read -p "Press Enter to continue..."
    exit 1
fi
echo

echo "========================================"
echo "Database Setup Completed Successfully!"
echo "========================================"
echo
echo "[INFO] Database: $DB_NAME"
echo "[INFO] Admin User: admin/admin123"
echo "[INFO] Regular User: user1/user123"
echo
echo "[INFO] You can now start the backend application"
echo "[INFO] The system will automatically connect to the database"
echo
read -p "Press Enter to continue..."
