# FinGuard AI — Database Backup & Restore Guide (Windows)

This directory provides scripts and commands for backing up and restoring the FinGuard AI PostgreSQL database on Windows workstations and servers.

---

## 1. Quick Backup & Restore via Batch Scripts

### Creating a Backup
Double-click `backup_windows.bat` or run it from Command Prompt / PowerShell:
```cmd
cd database\backups
backup_windows.bat
```
This generates a timestamped plain-text SQL backup file (e.g., `finguard_backup_20261014_230000.sql`).

### Restoring a Backup
Run `restore_windows.bat` passing the path of the SQL file:
```cmd
cd database\backups
restore_windows.bat finguard_backup_20261014_230000.sql
```

---

## 2. Manual Backup with Native PostgreSQL Tools

If running native PostgreSQL:

### Backup (Plain-Text SQL with Drop/Recreate commands)
```powershell
pg_dump -h localhost -p 5432 -U postgres -d finguard_db --clean --if-exists -F p -f finguard_dump.sql
```

### Backup (Custom Binary Format with Compression)
```powershell
pg_dump -h localhost -p 5432 -U postgres -d finguard_db -F c -f finguard_dump.dump
```

### Restore (From Plain-Text SQL)
```powershell
psql -h localhost -p 5432 -U postgres -d finguard_db -f finguard_dump.sql
```

### Restore (From Custom Binary Format)
```powershell
pg_restore -h localhost -p 5432 -U postgres -d finguard_db --clean --if-exists finguard_dump.dump
```

---

## 3. PGlite Persistent Storage Backup (Zero-Config Mode)

When running in embedded PGlite mode, the database data resides on disk at:
- **Default Path:** `%USERPROFILE%\.veyra_pgdata` (or custom `$env:DATA_DIR`)

### Backing up PGlite Data Directory:
```powershell
Compress-Archive -Path "$env:USERPROFILE\.veyra_pgdata" -DestinationPath "database\backups\pglite_storage_backup.zip"
```

### Restoring PGlite Data Directory:
```powershell
Expand-Archive -Path "database\backups\pglite_storage_backup.zip" -DestinationPath "$env:USERPROFILE\.veyra_pgdata" -Force
```
