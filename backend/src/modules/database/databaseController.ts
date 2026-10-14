import { Request, Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';

export async function listDatabaseTables(req: AuthRequest, res: Response): Promise<void> {
  try {
    // 1. Get all base tables with row count estimates
    const tablesRes = await db.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_type, table_name;
    `);

    // Get row counts for all base tables
    const tableList: Array<{ name: string; type: string; rowCount: number }> = [];

    for (const row of tablesRes.rows) {
      try {
        const countRes = await db.query(`SELECT COUNT(*) as count FROM "${row.table_name}";`);
        tableList.push({
          name: row.table_name,
          type: row.table_type,
          rowCount: parseInt(countRes.rows[0].count, 10),
        });
      } catch {
        tableList.push({
          name: row.table_name,
          type: row.table_type,
          rowCount: 0,
        });
      }
    }

    res.json({
      databaseDialect: 'PostgreSQL',
      mode: db.getMode(),
      tables: tableList.filter(t => t.type === 'BASE TABLE'),
      views: tableList.filter(t => t.type === 'VIEW'),
    });
  } catch (err) {
    console.error('[DB_TABLES_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve database catalog.' });
  }
}

export async function getTableDetails(req: AuthRequest, res: Response): Promise<void> {
  const tableName = String(req.params.tableName);

  try {
    // 1. Fetch column metadata from information_schema.columns
    const colsRes = await db.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);

    if (colsRes.rows.length === 0) {
      res.status(404).json({ error: 'NOT_FOUND', message: `Table [${tableName}] does not exist.` });
      return;
    }

    // 2. Fetch sample data (top 20 rows)
    const rowsRes = await db.query(`SELECT * FROM "${tableName}" LIMIT 20;`);

    res.json({
      tableName,
      columns: colsRes.rows,
      sampleRows: rowsRes.rows,
      totalSampleCount: rowsRes.rows.length,
    });
  } catch (err) {
    console.error('[TABLE_DETAIL_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to inspect table details.' });
  }
}

export async function executeRawQuery(req: AuthRequest, res: Response): Promise<void> {
  const { sql } = req.body;

  if (!sql || typeof sql !== 'string' || !sql.trim()) {
    res.status(400).json({ error: 'BAD_REQUEST', message: 'SQL query string is required.' });
    return;
  }

  const trimmedSql = sql.trim();

  // Safety: Allow only SELECT queries in evaluation console
  if (!trimmedSql.toUpperCase().startsWith('SELECT') && !trimmedSql.toUpperCase().startsWith('EXPLAIN')) {
    res.status(400).json({ error: 'FORBIDDEN', message: 'Only read-only SELECT and EXPLAIN queries are permitted in the evaluation console.' });
    return;
  }

  const start = Date.now();
  try {
    const result = await db.query(trimmedSql);
    const executionMs = Date.now() - start;

    res.json({
      success: true,
      executionMs,
      rowCount: result.rowCount,
      columns: result.rows.length > 0 ? Object.keys(result.rows[0]) : [],
      rows: result.rows,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'SQL_SYNTAX_ERROR',
      message: (err as Error).message,
    });
  }
}
