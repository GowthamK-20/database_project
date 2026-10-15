import { Request, Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';

interface QueryHistoryItem {
  id: string;
  sql: string;
  executionMs: number;
  rowCount: number;
  success: boolean;
  error?: string;
  timestamp: string;
  userBadge?: string;
}

const queryHistory: QueryHistoryItem[] = [];

// Curated Fraud Analysis & Relational SQL Templates
export const SAMPLE_QUERIES = [
  {
    id: 'Q-HIGH-VAL',
    title: '1. High-Value Financial Outliers',
    category: 'Transaction Outliers',
    description: 'Identifies high-value debit events (>= ₹1,00,000) joined across customers, accounts, and calculated risk scores.',
    sql: `SELECT 
    t.id AS transaction_id,
    t.txn_reference,
    t.amount,
    t.channel,
    t.timestamp,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.risk_tier,
    ra.risk_score,
    ra.risk_level
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
WHERE t.amount >= 100000.00
ORDER BY t.amount DESC
LIMIT 50;`
  },
  {
    id: 'Q-VELOCITY',
    title: '2. Unusually Frequent Velocity Patterns',
    category: 'Velocity & Frequency',
    description: 'Aggregates transaction velocity per customer identity to detect bursts and unusual transaction frequencies.',
    sql: `SELECT 
    c.id AS customer_id,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.risk_tier,
    COUNT(t.id) AS transaction_count,
    SUM(t.amount) AS total_volume_inr,
    ROUND(AVG(t.amount), 2) AS avg_transaction_amount
FROM customers c
JOIN accounts a ON c.id = a.customer_id
JOIN transactions t ON a.id = t.account_id
GROUP BY c.id, c.customer_code, c.first_name, c.last_name, c.risk_tier
HAVING COUNT(t.id) >= 2
ORDER BY transaction_count DESC, total_volume_inr DESC
LIMIT 25;`
  },
  {
    id: 'Q-CUST-MERCH',
    title: '3. Volume Grouped by Customer and Merchant',
    category: 'Counterparty Aggregation',
    description: 'Multi-table grouping calculating spend concentrations, payment counts, and counterparty risk exposure.',
    sql: `SELECT 
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    m.merchant_code,
    m.name AS merchant_name,
    m.risk_level AS merchant_risk,
    COUNT(t.id) AS total_transactions,
    SUM(t.amount) AS total_spend_inr,
    MAX(t.timestamp) AS last_transaction_at
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
JOIN merchants m ON t.merchant_id = m.id
GROUP BY c.customer_code, c.first_name, c.last_name, m.merchant_code, m.name, m.risk_level
ORDER BY total_spend_inr DESC
LIMIT 30;`
  },
  {
    id: 'Q-SUSPICIOUS-HEURISTICS',
    title: '4. Potentially Suspicious Heuristic Patterns',
    category: 'Fraud Detection Heuristics',
    description: 'Labels multi-vector risk indicators (rooted hardware, prohibited merchants, extreme amounts) as potential risks.',
    sql: `SELECT 
    t.id AS txn_id,
    t.txn_reference,
    t.amount,
    t.channel,
    t.timestamp,
    c.first_name || ' ' || c.last_name AS customer_name,
    d.device_type,
    d.is_rooted_or_jailbroken,
    m.name AS merchant_name,
    m.risk_level AS merchant_risk,
    ra.risk_score,
    ra.risk_level,
    CASE 
        WHEN d.is_rooted_or_jailbroken = true THEN 'POTENTIAL_RISK: Compromised Hardware Signature'
        WHEN m.risk_level = 'PROHIBITED' THEN 'POTENTIAL_RISK: Prohibited Quasi-Cash Counterparty'
        WHEN t.amount >= 200000.00 THEN 'POTENTIAL_RISK: Extreme Outlier Value'
        ELSE 'POTENTIAL_RISK: Heuristic Aggregate Score'
    END AS risk_heuristic_rationale
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
LEFT JOIN devices d ON t.device_id = d.id
LEFT JOIN merchants m ON t.merchant_id = m.id
JOIN risk_assessments ra ON t.id = ra.transaction_id
WHERE ra.risk_score >= 60 
   OR d.is_rooted_or_jailbroken = true 
   OR m.risk_level IN ('HIGH', 'PROHIBITED')
ORDER BY ra.risk_score DESC, t.amount DESC
LIMIT 50;`
  },
  {
    id: 'Q-ALERTS-SEVERITY',
    title: '5. Fraud Alert Breakdown by Severity and Status',
    category: 'Operational Surveillance',
    description: 'Aggregates open alerts across operational queues with SLA tracking and exposed transaction volume.',
    sql: `SELECT 
    fa.severity,
    fa.status AS alert_status,
    COUNT(fa.id) AS alert_count,
    SUM(t.amount) AS total_exposed_volume_inr,
    ROUND(AVG(ra.risk_score), 1) AS avg_risk_score,
    MIN(fa.sla_due_at) AS earliest_sla_due
FROM fraud_alerts fa
JOIN transactions t ON fa.transaction_id = t.id
LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
GROUP BY fa.severity, fa.status
ORDER BY 
    CASE fa.severity 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        ELSE 4 
    END, 
    alert_count DESC;`
  },
  {
    id: 'Q-3WAY-JOIN',
    title: '6. Joins Across Customers, Accounts, Cards & Transactions',
    category: 'Relational Integrity',
    description: 'Complete 4-entity join tracing customers, accounts, linked cards, and financial transactions.',
    sql: `SELECT 
    t.txn_reference,
    t.channel,
    t.amount,
    t.status AS txn_status,
    t.timestamp,
    a.account_number_masked,
    a.account_type,
    a.balance AS current_account_balance,
    crd.card_number_masked,
    crd.card_type,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.kyc_status,
    c.risk_tier
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
LEFT JOIN cards crd ON t.card_id = crd.id
ORDER BY t.timestamp DESC
LIMIT 50;`
  },
  {
    id: 'Q-WINDOW-SPEND',
    title: '7. Cumulative Spending & Account Rank (Window Functions)',
    category: 'Advanced SQL Analytics',
    description: 'Leverages SUM() OVER and DENSE_RANK() OVER to compute cumulative account spend profiles.',
    sql: `SELECT 
    t.id AS txn_id,
    t.txn_reference,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    t.amount,
    t.timestamp,
    SUM(t.amount) OVER (
        PARTITION BY a.id 
        ORDER BY t.timestamp 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_spent_inr,
    DENSE_RANK() OVER (
        PARTITION BY a.id 
        ORDER BY t.amount DESC
    ) AS spend_rank_in_account
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
ORDER BY c.customer_code, t.timestamp DESC
LIMIT 50;`
  },
  {
    id: 'Q-EXPLAIN-BENCHMARK',
    title: '8. EXPLAIN (ANALYZE, BUFFERS) Index Performance Benchmark',
    category: 'Database Optimization',
    description: 'Inspects execution plan, planning time, execution time, and shared buffer hits on composite index.',
    sql: `EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    t.id AS txn_id,
    t.amount,
    t.timestamp,
    a.account_number_masked,
    c.customer_code
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
WHERE t.account_id = 'ACC-007' 
  AND t.timestamp >= '2026-01-01'
ORDER BY t.timestamp DESC;`
  }
];

export async function listDatabaseTables(req: AuthRequest, res: Response): Promise<void> {
  try {
    const tablesRes = await db.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_type, table_name;
    `);

    const tableList: Array<{ 
      name: string; 
      type: string; 
      rowCount: number; 
      primaryKeys: string[];
      columnCount: number;
    }> = [];

    for (const row of tablesRes.rows) {
      let rowCount = 0;
      let primaryKeys: string[] = [];
      let columnCount = 0;

      try {
        const countRes = await db.query(`SELECT COUNT(*) as count FROM "${row.table_name}";`);
        rowCount = parseInt(countRes.rows[0].count, 10);
      } catch {
        rowCount = 0;
      }

      try {
        const pkRes = await db.query(`
          SELECT kcu.column_name 
          FROM information_schema.table_constraints tc 
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name 
            AND tc.table_schema = kcu.table_schema 
          WHERE tc.constraint_type = 'PRIMARY KEY' 
            AND tc.table_name = $1;
        `, [row.table_name]);
        primaryKeys = pkRes.rows.map(r => r.column_name);

        const colsRes = await db.query(`
          SELECT count(*) as count 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1;
        `, [row.table_name]);
        columnCount = parseInt(colsRes.rows[0].count, 10);
      } catch {
        primaryKeys = [];
      }

      tableList.push({
        name: row.table_name,
        type: row.table_type,
        rowCount,
        primaryKeys,
        columnCount
      });
    }

    res.json({
      databaseDialect: 'PostgreSQL',
      mode: db.getMode(),
      tables: tableList.filter(t => t.type === 'BASE TABLE'),
      views: tableList.filter(t => t.type === 'VIEW'),
      totalTables: tableList.filter(t => t.type === 'BASE TABLE').length,
      totalViews: tableList.filter(t => t.type === 'VIEW').length,
    });
  } catch (err) {
    console.error('[DB_TABLES_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve database catalog.' });
  }
}

export async function getTableDetails(req: AuthRequest, res: Response): Promise<void> {
  const tableName = String(req.params.tableName);
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const pageSize = Math.min(100, Math.max(5, parseInt(String(req.query.pageSize || '25'), 10)));
  const offset = (page - 1) * pageSize;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy.trim() : '';
  const sortOrder = String(req.query.sortOrder || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  try {
    // 1. Column metadata
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
      res.status(404).json({ error: 'NOT_FOUND', message: `Table or view [${tableName}] does not exist.` });
      return;
    }

    // 2. Primary Keys
    const pkRes = await db.query(`
      SELECT kcu.column_name 
      FROM information_schema.table_constraints tc 
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema 
      WHERE tc.constraint_type = 'PRIMARY KEY' 
        AND tc.table_name = $1;
    `, [tableName]);
    const primaryKeys = pkRes.rows.map(r => r.column_name);

    // 3. Foreign Keys
    const fkRes = await db.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = $1;
    `, [tableName]);

    // 4. Build Paginated Query with Safe Column Checking
    const validColumnNames = new Set(colsRes.rows.map(c => c.column_name));
    let whereClause = '';
    const queryParams: any[] = [];

    if (search) {
      // Find text/varchar columns for search
      const textCols = colsRes.rows
        .filter(c => ['character varying', 'text', 'character'].includes(c.data_type))
        .map(c => `"${c.column_name}"::text ILIKE $1`);
      
      if (textCols.length > 0) {
        whereClause = `WHERE (${textCols.join(' OR ')})`;
        queryParams.push(`%${search}%`);
      }
    }

    // Row Count
    const countQuery = `SELECT count(*) as count FROM "${tableName}" ${whereClause}`;
    const countRes = await db.query(countQuery, queryParams);
    const totalRowCount = parseInt(countRes.rows[0].count, 10);

    // Sorting
    let orderClause = '';
    if (sortBy && validColumnNames.has(sortBy)) {
      orderClause = `ORDER BY "${sortBy}" ${sortOrder}`;
    } else if (primaryKeys.length > 0) {
      orderClause = `ORDER BY "${primaryKeys[0]}" ASC`;
    }

    // Rows Query
    const rowQueryParams = [...queryParams];
    const limitOffsetClause = `LIMIT $${rowQueryParams.length + 1} OFFSET $${rowQueryParams.length + 2}`;
    rowQueryParams.push(pageSize, offset);

    const rowsQuery = `SELECT * FROM "${tableName}" ${whereClause} ${orderClause} ${limitOffsetClause};`;
    const rowsRes = await db.query(rowsQuery, rowQueryParams);

    res.json({
      tableName,
      columns: colsRes.rows.map(c => ({
        ...c,
        isPrimaryKey: primaryKeys.includes(c.column_name),
        foreignKey: fkRes.rows.find(fk => fk.column_name === c.column_name) || null
      })),
      primaryKeys,
      foreignKeys: fkRes.rows,
      rows: rowsRes.rows,
      pagination: {
        page,
        pageSize,
        totalRows: totalRowCount,
        totalPages: Math.ceil(totalRowCount / pageSize)
      }
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

  // Multi-tier Security Guard: Strictly read-only
  const upperSql = trimmedSql.toUpperCase();
  const startsWithAllowed = upperSql.startsWith('SELECT') || upperSql.startsWith('WITH') || upperSql.startsWith('EXPLAIN');

  if (!startsWithAllowed) {
    res.status(403).json({
      error: 'SECURITY_VIOLATION',
      message: 'Write operations are strictly prohibited in the educational SQL Laboratory. Only read-only queries (SELECT, WITH, EXPLAIN) are permitted.'
    });
    return;
  }

  // Reject destructive DDL/DML keywords anywhere in query to block SQL injection / multi-statements
  const forbiddenPatterns = [
    /\bINSERT\b/i,
    /\bUPDATE\b/i,
    /\bDELETE\b/i,
    /\bDROP\b/i,
    /\bALTER\b/i,
    /\bTRUNCATE\b/i,
    /\bCREATE\b/i,
    /\bGRANT\b/i,
    /\bREVOKE\b/i,
    /\bCOPY\b/i,
    /\bEXECUTE\b/i,
    /\bLOCK\b/i,
    /;.*[a-zA-Z]/s // Multi-statement chaining
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(trimmedSql)) {
      res.status(403).json({
        error: 'SECURITY_VIOLATION',
        message: 'Security Policy Violation: SQL contains disallowed write/administrative commands or statement chaining.'
      });
      return;
    }
  }

  // Safety safeguard: Append LIMIT 500 if no LIMIT is specified in SELECT query
  let executableSql = trimmedSql.replace(/;+\s*$/, '');
  if (!upperSql.startsWith('EXPLAIN') && !upperSql.includes('LIMIT')) {
    executableSql = `${executableSql} LIMIT 500`;
  }

  const start = performance.now();
  try {
    const result = await db.query(executableSql);
    const executionMs = parseFloat((performance.now() - start).toFixed(2));

    const historyRecord: QueryHistoryItem = {
      id: `QH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sql: trimmedSql,
      executionMs,
      rowCount: result.rowCount,
      success: true,
      timestamp: new Date().toISOString(),
      userBadge: req.user?.badge_number || 'ANONYMOUS'
    };

    queryHistory.unshift(historyRecord);
    if (queryHistory.length > 50) queryHistory.pop();

    res.json({
      success: true,
      executionMs,
      rowCount: result.rowCount,
      columns: result.rows.length > 0 ? Object.keys(result.rows[0]) : [],
      rows: result.rows,
      hasLimitCap: !upperSql.includes('LIMIT') && result.rowCount === 500
    });
  } catch (err) {
    const executionMs = parseFloat((performance.now() - start).toFixed(2));
    const historyRecord: QueryHistoryItem = {
      id: `QH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sql: trimmedSql,
      executionMs,
      rowCount: 0,
      success: false,
      error: (err as Error).message,
      timestamp: new Date().toISOString(),
      userBadge: req.user?.badge_number || 'ANONYMOUS'
    };

    queryHistory.unshift(historyRecord);
    if (queryHistory.length > 50) queryHistory.pop();

    res.status(400).json({
      success: false,
      error: 'SQL_EXECUTION_ERROR',
      message: (err as Error).message,
      executionMs
    });
  }
}

export function getSampleQueries(req: Request, res: Response): void {
  res.json({
    categories: [
      'Transaction Outliers',
      'Velocity & Frequency',
      'Counterparty Aggregation',
      'Fraud Detection Heuristics',
      'Operational Surveillance',
      'Relational Integrity',
      'Advanced SQL Analytics',
      'Database Optimization'
    ],
    sampleQueries: SAMPLE_QUERIES
  });
}

export function getQueryHistory(req: Request, res: Response): void {
  res.json({
    history: queryHistory
  });
}
