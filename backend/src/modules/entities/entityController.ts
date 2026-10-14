import { Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';

export async function getCustomer360(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const custRes = await db.query('SELECT * FROM customers WHERE id = $1 OR customer_code = $1', [id]);
    if (custRes.rows.length === 0) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Customer not found.' });
      return;
    }
    const customer = custRes.rows[0];

    // Accounts
    const accRes = await db.query('SELECT * FROM accounts WHERE customer_id = $1', [customer.id]);

    // Devices
    const devRes = await db.query(`
      SELECT d.*, cd.is_primary, cd.bound_at 
      FROM devices d 
      JOIN customer_devices cd ON d.id = cd.device_id 
      WHERE cd.customer_id = $1;
    `, [customer.id]);

    // Transactions
    const txnRes = await db.query(`
      SELECT 
        t.*, 
        ra.risk_score, 
        ra.risk_level 
      FROM transactions t 
      JOIN accounts a ON t.account_id = a.id 
      LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id 
      WHERE a.customer_id = $1 
      ORDER BY t.timestamp DESC 
      LIMIT 15;
    `, [customer.id]);

    // Alerts
    const alertRes = await db.query(`
      SELECT fa.* 
      FROM fraud_alerts fa 
      JOIN transactions t ON fa.transaction_id = t.id 
      JOIN accounts a ON t.account_id = a.id 
      WHERE a.customer_id = $1 
      ORDER BY fa.created_at DESC;
    `, [customer.id]);

    res.json({
      customer,
      accounts: accRes.rows,
      devices: devRes.rows,
      recentTransactions: txnRes.rows,
      alerts: alertRes.rows,
    });
  } catch (err) {
    console.error('[CUST_360_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve Customer 360.' });
  }
}

export async function listCustomers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db.query(`
      SELECT 
        c.*, 
        COUNT(DISTINCT a.id) as account_count,
        COALESCE(SUM(a.balance), 0) as total_balance
      FROM customers c
      LEFT JOIN accounts a ON c.id = a.customer_id
      GROUP BY c.id
      ORDER BY c.created_at ASC;
    `);
    res.json({ customers: result.rows });
  } catch (err) {
    console.error('[LIST_CUSTOMERS_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch customers.' });
  }
}

export async function listMerchants(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db.query(`
      SELECT 
        m.*,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_volume,
        COUNT(CASE WHEN ra.risk_level IN ('HIGH', 'CRITICAL') THEN 1 END) as flagged_count
      FROM merchants m
      LEFT JOIN transactions t ON m.id = t.merchant_id
      LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
      GROUP BY m.id
      ORDER BY m.chargeback_ratio DESC;
    `);
    res.json({ merchants: result.rows });
  } catch (err) {
    console.error('[MERCHANTS_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch merchants.' });
  }
}
