#!/bin/bash

# Database Backup and Restore Script for Plant Disease Classification System
# PostgreSQL Database

# Configuration
DB_NAME="plant_classifier_dev"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to backup database
backup_database() {
    local backup_file="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"
    
    print_status "Starting database backup..."
    print_status "Database: $DB_NAME"
    print_status "Backup file: $backup_file"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$backup_file"; then
        print_status "Database backup completed successfully!"
        print_status "Backup file: $backup_file"
        
        # Show backup file size
        local file_size=$(du -h "$backup_file" | cut -f1)
        print_status "Backup file size: $file_size"
    else
        print_error "Database backup failed!"
        exit 1
    fi
}

# Function to restore database
restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file to restore from"
        echo "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "This will overwrite the current database: $DB_NAME"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Starting database restore..."
        print_status "Database: $DB_NAME"
        print_status "Backup file: $backup_file"
        
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$backup_file"; then
            print_status "Database restore completed successfully!"
        else
            print_error "Database restore failed!"
            exit 1
        fi
    else
        print_status "Database restore cancelled."
    fi
}

# Function to list backup files
list_backups() {
    print_status "Available backup files:"
    
    if [ -z "$(ls -A "$BACKUP_DIR")" ]; then
        print_warning "No backup files found in $BACKUP_DIR"
        return
    fi
    
    echo "Backup files in $BACKUP_DIR:"
    ls -lh "$BACKUP_DIR"/*.sql 2>/dev/null | while read -r line; do
        echo "  $line"
    done
}

# Function to clean old backups
clean_backups() {
    local days_to_keep="$1"
    
    if [ -z "$days_to_keep" ]; then
        days_to_keep=7
    fi
    
    print_status "Cleaning backups older than $days_to_keep days..."
    
    local deleted_count=0
    while IFS= read -r -d '' file; do
        if [ -f "$file" ]; then
            rm "$file"
            ((deleted_count++))
            print_status "Deleted: $(basename "$file")"
        fi
    done < <(find "$BACKUP_DIR" -name "*.sql" -type f -mtime +"$days_to_keep" -print0)
    
    if [ $deleted_count -eq 0 ]; then
        print_status "No old backups to clean."
    else
        print_status "Cleaned $deleted_count old backup files."
    fi
}

# Function to show database status
show_status() {
    print_status "Database Status:"
    print_status "Database: $DB_NAME"
    print_status "Host: $DB_HOST"
    print_status "Port: $DB_PORT"
    print_status "User: $DB_USER"
    
    # Test connection
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" >/dev/null 2>&1; then
        print_status "Connection: ${GREEN}OK${NC}"
        
        # Show table counts
        print_status "Table counts:"
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
            SELECT 
                schemaname,
                tablename,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes
            FROM pg_stat_user_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename;
        " 2>/dev/null || print_warning "Could not retrieve table statistics"
    else
        print_error "Connection: ${RED}FAILED${NC}"
    fi
}

# Function to show help
show_help() {
    echo "Plant Disease Classification Database Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  backup              Create a new database backup"
    echo "  restore <file>      Restore database from backup file"
    echo "  list                List available backup files"
    echo "  clean [days]        Clean backups older than specified days (default: 7)"
    echo "  status              Show database status and connection info"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backup                    # Create backup"
    echo "  $0 restore backup_file.sql   # Restore from backup"
    echo "  $0 list                      # List backups"
    echo "  $0 clean 30                  # Clean backups older than 30 days"
    echo "  $0 status                    # Show database status"
    echo ""
    echo "Environment variables:"
    echo "  DB_NAME, DB_USER, DB_HOST, DB_PORT can be set to override defaults"
}

# Main script logic
case "$1" in
    "backup")
        backup_database
        ;;
    "restore")
        restore_database "$2"
        ;;
    "list")
        list_backups
        ;;
    "clean")
        clean_backups "$2"
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for usage information."
        exit 1
        ;;
esac
