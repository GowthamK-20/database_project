@echo off
REM ==============================================================================
REM FINGUARD AI // POSTGRESQL DATABASE RESTORE SCRIPT FOR WINDOWS
REM ==============================================================================

setlocal enabledelayedexpansion

REM Set Default Variables
if "%PGHOST%"=="" set PGHOST=localhost
if "%PGPORT%"=="" set PGPORT=5432
if "%PGUSER%"=="" set PGUSER=postgres
if "%PGDATABASE%"=="" set PGDATABASE=finguard_db

if "%~1"=="" (
    echo [USAGE] restore_windows.bat path\to\backup_file.sql
    echo Example: restore_windows.bat finguard_backup_20261014.sql
    exit /b 1
)

set BACKUP_FILE=%~1

echo ==============================================================================
echo [FINGUARD AI] POSTGRESQL DATABASE RESTORE UTILITY (WINDOWS)
echo ==============================================================================
echo Target Database: %PGDATABASE% on %PGHOST%:%PGPORT% (User: %PGUSER%)
echo Source File: %BACKUP_FILE%
echo.

where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 'psql' utility not found in PATH!
    echo Please ensure PostgreSQL 'bin' directory is added to your Windows PATH,
    echo or specify the full path to psql.exe (e.g. C:\Program Files\PostgreSQL\16\bin\psql.exe)
    pause
    exit /b 1
)

echo [WARNING] This will restore SQL commands directly into database '%PGDATABASE%'.
set /p CONFIRM="Are you sure you want to proceed? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo [ABORTED] Restore cancelled by user.
    exit /b 0
)

echo [INFO] Restoring database from %BACKUP_FILE%...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -f "%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo [SUCCESS] Database restore successfully executed!
) else (
    echo [FAILED] psql restore encountered an error (Code: %errorlevel%).
)

echo ==============================================================================
endlocal
