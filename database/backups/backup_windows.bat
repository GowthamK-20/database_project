@echo off
REM ==============================================================================
REM FINGUARD AI // POSTGRESQL DATABASE BACKUP SCRIPT FOR WINDOWS
REM ==============================================================================

setlocal enabledelayedexpansion

REM Set Default Variables (Can be overridden by environment variables)
if "%PGHOST%"=="" set PGHOST=localhost
if "%PGPORT%"=="" set PGPORT=5432
if "%PGUSER%"=="" set PGUSER=postgres
if "%PGDATABASE%"=="" set PGDATABASE=finguard_db

REM Format timestamp YYYYMMDD_HHMMSS
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%
set BACKUP_FILE=%~dp0finguard_backup_%TIMESTAMP%.sql

echo ==============================================================================
echo [FINGUARD AI] POSTGRESQL DATABASE BACKUP UTILITY (WINDOWS)
echo ==============================================================================
echo Target Database: %PGDATABASE% on %PGHOST%:%PGPORT% (User: %PGUSER%)
echo Backup Destination: %BACKUP_FILE%
echo.

where pg_dump >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 'pg_dump' utility not found in PATH!
    echo Please ensure PostgreSQL 'bin' directory is added to your Windows PATH,
    echo or specify the full path to pg_dump.exe (e.g. C:\Program Files\PostgreSQL\16\bin\pg_dump.exe)
    pause
    exit /b 1
)

echo [INFO] Running pg_dump...
pg_dump -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% --clean --if-exists --format=plain --file="%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo [SUCCESS] Database backup successfully written to:
    echo %BACKUP_FILE%
) else (
    echo [FAILED] pg_dump encountered an error (Code: %errorlevel%).
)

echo ==============================================================================
endlocal
