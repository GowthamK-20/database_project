import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';

dotenv.config();

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

class DatabaseManager {
  private pgPool: pg.Pool | null = null;
  private pgliteInstance: PGlite | null = null;
  private isInitialized = false;
  private mode: 'NATIVE_PG' | 'PGLITE' = 'PGLITE';

  async init(): Promise<void> {
    if (this.isInitialized) return;

    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
      try {
        console.log('[DB] Connecting to PostgreSQL instance via DATABASE_URL...');
        this.pgPool = new pg.Pool({ connectionString: databaseUrl });
        await this.pgPool.query('SELECT 1');
        this.mode = 'NATIVE_PG';
        console.log('[DB] Connected to native PostgreSQL successfully.');
      } catch (err) {
        console.warn('[DB] Native PostgreSQL connection failed, falling back to embedded PGlite:', (err as Error).message);
        this.pgPool = null;
      }
    }

    if (!this.pgPool) {
      // Use os.homedir() directory to avoid OneDrive file-locking issues on Windows
      const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.veyra_pgdata');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.pgliteInstance = new PGlite(dataDir);
      await this.pgliteInstance.waitReady;
      this.mode = 'PGLITE';
      console.log(`[DB] PGlite initialized with persistent storage at: ${dataDir}`);
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
      const res = await this.pgliteInstance.query<T>(sqlText, params);
      return {
        rows: res.rows,
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
    console.log('[DB] Checking and applying database migrations...');
    const migrationsDir = path.resolve(process.cwd(), 'src', 'database', 'migrations');
    
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_views_triggers.sql'
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
