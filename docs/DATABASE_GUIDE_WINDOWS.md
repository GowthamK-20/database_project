# FinGuard AI — Complete PostgreSQL Database Guide for Windows

This guide provides reproducible step-by-step instructions for database creation, migrations, seeding, backup, restore, and testing on Windows.

---

## 1. Prerequisites & Database Targets

FinGuard AI supports two database targets:
1. **Native PostgreSQL (Primary Target):** Running locally or on a remote server via standard `DATABASE_URL`.
2. **Embedded PGlite (Zero-Config Fallback):** Real PostgreSQL v16 engine compiled to WebAssembly with persistent storage on disk at `%USERPROFILE%\.veyra_pgdata`. Enables instant evaluation without installing external server packages.

---

## 2. Environment Configuration (`.env`)

Create or update `.env` in the `backend/` directory (or use `.env.example` as a template):

```bash
# ==============================================================================
# FINGUARD AI ENVIRONMENT CONFIGURATION
# ==============================================================================
PORT=5000
NODE_ENV=development

# ------------------------------------------------------------------------------
# PRIMARY TARGET: Native PostgreSQL Connection String
# Format: postgresql://[user]:[password]@[host]:[port]/[database_name]
# ------------------------------------------------------------------------------
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finguard_db

# ------------------------------------------------------------------------------
# FALLBACK TARGET: Custom persistent disk storage path for PGlite (Optional)
# If omitted, defaults to C:\Users\<Username>\.veyra_pgdata
# ------------------------------------------------------------------------------
# DATA_DIR=C:\Users\<Username>\.veyra_pgdata

# JWT Secret for Authenticated Personas
JWT_SECRET=finguard_super_secret_production_key_2026_jwt
```

---

## 3. Database Initialization for Native PostgreSQL (Step-by-Step)

If you have PostgreSQL installed on Windows:

### Step 3.1: Create Database via Command Prompt or PowerShell
```powershell
# Open PostgreSQL shell (psql)
psql -U postgres

# Inside psql, create the database:
CREATE DATABASE finguard_db;
\q
```
Or directly from PowerShell:
```powershell
createdb -U postgres finguard_db
```

### Step 3.2: Apply Schema DDL in Order
Execute the modular scripts in `database/schema/`:
```powershell
psql -U postgres -d finguard_db -f "database/schema/01_types_and_extensions.sql"
psql -U postgres -d finguard_db -f "database/schema/02_core_tables.sql"
psql -U postgres -d finguard_db -f "database/schema/03_views.sql"
psql -U postgres -d finguard_db -f "database/schema/04_triggers_and_procedures.sql"
psql -U postgres -d finguard_db -f "database/indexes/01_performance_indexes.sql"
```

### Step 3.3: Seed Initial Data
```powershell
# Via raw SQL:
psql -U postgres -d finguard_db -f "database/seeds/01_initial_seed.sql"

# OR via Node.js seed runner:
cd backend
npm run seed
```

---

## 4. Automatic Migration & Seeding via Node.js (Both Native PG & PGlite)

When running the application, the backend automatically reads and applies versioned migrations in `database/migrations/`:
- `001_initial_schema.sql`
- `002_views_triggers.sql`
- `003_add_cards_loans_notifications.sql`

To run migrations and seed data automatically:
```powershell
cd backend
npm run seed
```

---

## 5. Running Database Benchmarks & Advanced Queries

To execute the 10 advanced analytical queries (CTEs, Window Functions, Mule Ring Detection, Outliers):
```powershell
psql -U postgres -d finguard_db -f "database/queries/advanced_queries.sql"
```

---

## 6. Backup and Restore on Windows

### Method A: Automated Batch Scripts
- **Backup:** Run `database\backups\backup_windows.bat`. Creates `finguard_backup_YYYYMMDD_HHMMSS.sql`.
- **Restore:** Run `database\backups\restore_windows.bat path\to\backup.sql`.

### Method B: Native PostgreSQL Commands
```powershell
# Create SQL dump
pg_dump -U postgres -d finguard_db --clean --if-exists -F p -f database\backups\finguard_dump.sql

# Restore SQL dump
psql -U postgres -d finguard_db -f database\backups\finguard_dump.sql
```

---

## 7. Running the Automated Test Suite

To verify database integrity, constraints, foreign keys, triggers, and query logic:
```powershell
cd backend
npm test
```
The test suite executes 25 assertions covering all 16 core entities, triggers, views, and fraud detection logic.
