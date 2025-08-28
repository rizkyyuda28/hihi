@echo off
REM Database Backup and Restore Script for Plant Disease Classification System
REM PostgreSQL Database - Windows Batch File

REM Configuration
set DB_NAME=plant_classifier_dev
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432
set BACKUP_DIR=.\backups
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATE=%DATE: =0%

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Function to print colored output
:print_status
echo [INFO] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

REM Function to backup database
:backup_database
set backup_file=%BACKUP_DIR%\%DB_NAME%_%DATE%.sql
call :print_status "Starting database backup..."
call :print_status "Database: %DB_NAME%"
call :print_status "Backup file: %backup_file%"

pg_dump -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" > "%backup_file%"
if %errorlevel% equ 0 (
    call :print_status "Database backup completed successfully!"
    call :print_status "Backup file: %backup_file%"
    
    REM Show backup file size
    for %%A in ("%backup_file%") do call :print_status "Backup file size: %%~zA bytes"
) else (
    call :print_error "Database backup failed!"
    exit /b 1
)
goto :eof

REM Function to restore database
:restore_database
set backup_file=%~1
if "%backup_file%"=="" (
    call :print_error "Please specify backup file to restore from"
    echo Usage: %0 restore ^<backup_file^>
    exit /b 1
)

if not exist "%backup_file%" (
    call :print_error "Backup file not found: %backup_file%"
    exit /b 1
)

call :print_warning "This will overwrite the current database: %DB_NAME%"
set /p confirm="Are you sure you want to continue? (y/N): "
if /i "%confirm%"=="y" (
    call :print_status "Starting database restore..."
    call :print_status "Database: %DB_NAME%"
    call :print_status "Backup file: %backup_file%"
    
    psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" < "%backup_file%"
    if %errorlevel% equ 0 (
        call :print_status "Database restore completed successfully!"
    ) else (
        call :print_error "Database restore failed!"
        exit /b 1
    )
) else (
    call :print_status "Database restore cancelled."
)
goto :eof

REM Function to list backup files
:list_backups
call :print_status "Available backup files:"
if not exist "%BACKUP_DIR%\*.sql" (
    call :print_warning "No backup files found in %BACKUP_DIR%"
    goto :eof
)

echo Backup files in %BACKUP_DIR%:
dir /b "%BACKUP_DIR%\*.sql"
goto :eof

REM Function to clean old backups
:clean_backups
set days_to_keep=%~1
if "%days_to_keep%"=="" set days_to_keep=7

call :print_status "Cleaning backups older than %days_to_keep% days..."
REM Note: Windows doesn't have easy date arithmetic, this is a simplified version
REM For production use, consider using PowerShell or a more sophisticated script

echo Note: Windows batch file has limited date arithmetic capabilities.
echo Consider using the bash script or PowerShell for advanced backup management.
goto :eof

REM Function to show database status
:show_status
call :print_status "Database Status:"
call :print_status "Database: %DB_NAME%"
call :print_status "Host: %DB_HOST%"
call :print_status "Port: %DB_PORT%"
call :print_status "User: %DB_USER%"

REM Test connection
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT version();" >nul 2>&1
if %errorlevel% equ 0 (
    call :print_status "Connection: OK"
    
    REM Show table counts
    call :print_status "Table counts:"
    psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -t -c "SELECT schemaname, tablename, n_tup_ins as inserts, n_tup_upd as updates, n_tup_del as deletes FROM pg_stat_user_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>nul || call :print_warning "Could not retrieve table statistics"
) else (
    call :print_error "Connection: FAILED"
)
goto :eof

REM Function to show help
:show_help
echo Plant Disease Classification Database Management Script
echo.
echo Usage: %0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   backup              Create a new database backup
echo   restore ^<file^>      Restore database from backup file
echo   list                List available backup files
echo   clean [days]        Clean backups older than specified days ^(default: 7^)
echo   status              Show database status and connection info
echo   help                Show this help message
echo.
echo Examples:
echo   %0 backup                    # Create backup
echo   %0 restore backup_file.sql   # Restore from backup
echo   %0 list                      # List backups
echo   %0 clean 30                  # Clean backups older than 30 days
echo   %0 status                    # Show database status
echo.
echo Environment variables:
echo   DB_NAME, DB_USER, DB_HOST, DB_PORT can be set to override defaults
goto :eof

REM Main script logic
if "%1"=="backup" (
    call :backup_database
) else if "%1"=="restore" (
    call :restore_database %2
) else if "%1"=="list" (
    call :list_backups
) else if "%1"=="clean" (
    call :clean_backups %2
) else if "%1"=="status" (
    call :show_status
) else if "%1"=="help" (
    call :show_help
) else if "%1"=="" (
    call :show_help
) else (
    call :print_error "Unknown command: %1"
    echo Use '%0 help' for usage information.
    exit /b 1
)

exit /b 0
