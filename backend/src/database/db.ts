import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const SUPABASE_FALLBACK_URL = 'postgresql://postgres.owzmxyvdwdsdvqsgwxvf:Gowtham%40123@aws-1-eu-west-3.pooler.supabase.com:5432/postgres';

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

class DatabaseManager {
  private pgPool: pg.Pool | null = null;
  private pgliteInstance: any = null;
  private isInitialized = false;
  private mode: 'NATIVE_PG' | 'PGLITE' = 'PGLITE';

  async init(): Promise<void> {
    if (this.isInitialized) return;

    const databaseUrl = process.env.DATABASE_URL || SUPABASE_FALLBACK_URL;

    if (databaseUrl) {
      try {
        console.log('[DB] Connecting to PostgreSQL instance via DATABASE_URL...');
        this.pgPool = new pg.Pool({
          connectionString: databaseUrl,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });
        await this.pgPool.query('SELECT 1');
        this.mode = 'NATIVE_PG';
        console.log('[DB] Connected to native PostgreSQL successfully.');
      } catch (err) {
        console.warn('[DB] Native PostgreSQL connection failed, falling back to embedded PGlite:', (err as Error).message);
        this.pgPool = null;
      }
    }

    if (!this.pgPool) {
      try {
        const { PGlite } = await import('@electric-sql/pglite');
        // Use os.homedir() directory to avoid OneDrive file-locking issues on Windows
        const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.finguard_pgdata');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        } else {
          const pidFile = path.join(dataDir, 'postmaster.pid');
          if (fs.existsSync(pidFile)) {
            try {
              fs.unlinkSync(pidFile);
              console.log('[DB] Cleaned up stale postmaster.pid lock file.');
            } catch (e) {
              // ignore
            }
          }
        }
        this.pgliteInstance = new PGlite(dataDir);
        await this.pgliteInstance.waitReady;
        this.mode = 'PGLITE';
        console.log(`[DB] PGlite initialized with persistent storage at: ${dataDir}`);
      } catch (pglErr) {
        console.error('[DB] Failed to initialize embedded PGlite:', pglErr);
      }
    }

    await this.applyMigrations();
    this.isInitialized = true;
  }

  async query<T = any>(sqlText: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (this.mode === 'NATIVE_PG' && this.pgPool) {
      const res = await this.pgPool.query(sqlText, params);
      return {
        rows: res.rows as T[],
        rowCount: res.rowCount ?? res.rows.length,
      };
    } else if (this.pgliteInstance) {
      const res = await this.pgliteInstance.query(sqlText, params);
      return {
        rows: res.rows as T[],
        rowCount: res.rows.length,
      };
    }

    throw new Error('[DB] Database connection is not available.');
  }

  async close(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end();
      this.pgPool = null;
    }
    if (this.pgliteInstance) {
      await this.pgliteInstance.close();
      this.pgliteInstance = null;
    }
    this.isInitialized = false;
  }

  private async applyMigrations(): Promise<void> {
    // If native PostgreSQL already has tables, skip parsing migration files
    if (this.mode === 'NATIVE_PG' && this.pgPool) {
      try {
        const check = await this.pgPool.query(
          "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customers' LIMIT 1"
        );
        if (check.rows.length > 0) {
          console.log('[DB] Schema already verified in PostgreSQL.');
          return;
        }
      } catch (e) {
        // proceed with migrations if check fails
      }
    }

    console.log('[DB] Checking and applying database migrations...');
    const possibleDirs = [
      path.resolve(process.cwd(), 'src', 'database', 'migrations'),
      path.resolve(process.cwd(), 'database', 'migrations'),
      path.resolve(process.cwd(), '..', 'database', 'migrations'),
      path.resolve(process.cwd(), 'backend', 'src', 'database', 'migrations'),
      path.resolve(__dirname, 'migrations'),
    ];
    const migrationsDir = possibleDirs.find(d => fs.existsSync(d)) || possibleDirs[0];
    
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_views_triggers.sql',
      '003_add_cards_loans_notifications.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, 'utf-8');
        try {
          if (this.mode === 'NATIVE_PG' && this.pgPool) {
            await this.pgPool.query(sql);
          } else if (this.pgliteInstance) {
            await this.pgliteInstance.exec(sql);
          }
          console.log(`[DB] Migration applied successfully: ${file}`);
        } catch (err) {
          console.error(`[DB] Error applying migration ${file}:`, (err as Error).message);
          throw err;
        }
      } else {
        console.warn(`[DB] Migration file not found: ${filePath}`);
      }
    }
  }

  getMode(): string {
    return this.mode;
  }
}

export const db = new DatabaseManager();
