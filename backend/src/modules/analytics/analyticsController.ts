import { Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';

export async function getAnalyticsMetrics(req: AuthRequest, res: Response): Promise<void> {
  try {
    // 1. Channel Breakdown
    const channelRes = await db.query(`
      SELECT 
        channel,
        COUNT(id) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM transactions
      GROUP BY channel
      ORDER BY count DESC;
    `);

    // 2. Analyst Workload from View
    const workloadRes = await db.query(`
      SELECT * FROM view_analyst_workload;
    `);

    // 3. Overall Fraud Ratio
    const fraudRateRes = await db.query(`
      SELECT 
        COUNT(CASE WHEN ra.risk_level IN ('CRITICAL', 'HIGH') THEN 1 END) as flagged_count,
        COUNT(t.id) as total_count,
        COALESCE(SUM(CASE WHEN ra.risk_level IN ('CRITICAL', 'HIGH') THEN t.amount END), 0) as flagged_volume,
        COALESCE(SUM(t.amount), 0) as total_volume
      FROM transactions t
      LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id;
    `);

    const stats = fraudRateRes.rows[0];
    const totalCount = parseInt(stats.total_count, 10) || 1;
    const flaggedCount = parseInt(stats.flagged_count, 10) || 0;
    const fraudRatioPct = ((flaggedCount / totalCount) * 100).toFixed(2);

    res.json({
      overall: {
        totalTransactions: totalCount,
        flaggedTransactions: flaggedCount,
        fraudRatioPct: parseFloat(fraudRatioPct),
        totalVolume: parseFloat(stats.total_volume),
        flaggedVolume: parseFloat(stats.flagged_volume),
      },
      channelDistribution: channelRes.rows,
      analystWorkload: workloadRes.rows,
    });
  } catch (err) {
    console.error('[ANALYTICS_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to compute analytics.' });
  }
}

export async function getComplianceSTRReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Generates RBI / FIU-IND compliant Suspicious Transaction Report extract
    const strRes = await db.query(`
      SELECT 
        t.txn_reference as "transaction_ref",
        t.timestamp as "transaction_timestamp",
        t.amount as "amount_inr",
        t.channel as "payment_rail",
        c.customer_code as "customer_id",
        c.first_name || ' ' || c.last_name as "account_holder_name",
        c.pan_masked as "pan_number",
        a.account_number_masked as "account_number",
        m.name as "counterparty_or_merchant",
        ra.risk_score as "computed_risk_score",
        ra.risk_level as "severity",
        fc.case_number,
        fc.title as "suspicion_grounds",
        u.badge_number as "reporting_officer"
      FROM fraud_cases fc
      JOIN fraud_alerts fa ON fc.primary_alert_id = fa.id
      JOIN transactions t ON fa.transaction_id = t.id
      JOIN accounts a ON t.account_id = a.id
      JOIN customers c ON a.customer_id = c.id
      LEFT JOIN merchants m ON t.merchant_id = m.id
      LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
      LEFT JOIN users u ON fc.assigned_analyst_id = u.id
      WHERE fc.status IN ('ACTION_TAKEN', 'CLOSED_CONFIRMED_FRAUD', 'IN_REVIEW');
    `);

    res.json({
      reportHeader: {
        regulatoryStandard: 'RBI-FMR / PMLA (FIU-IND STR Schema v3.2)',
        generatedAt: new Date().toISOString(),
        filingInstitution: 'Veyra Risk Operations Core',
        totalRecords: strRes.rows.length,
      },
      records: strRes.rows,
    });
  } catch (err) {
    console.error('[STR_REPORT_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate STR report.' });
  }
}
