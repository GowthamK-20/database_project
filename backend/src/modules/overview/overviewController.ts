import { Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';

export async function getOverviewMetrics(req: AuthRequest, res: Response): Promise<void> {
  try {
    // 1. Critical Alerts Count
    const critAlerts = await db.query(`
      SELECT COUNT(*) AS count 
      FROM fraud_alerts 
      WHERE severity = 'CRITICAL' AND status IN ('NEW', 'ACKNOWLEDGED', 'INVESTIGATING');
    `);

    // 2. Transactions Under Review Count
    const underReview = await db.query(`
      SELECT COUNT(*) AS count 
      FROM transactions 
      WHERE status = 'PENDING_REVIEW';
    `);

    // 3. Estimated Exposure in INR
    const exposure = await db.query(`
      SELECT COALESCE(SUM(t.amount), 0) AS total_exposure
      FROM transactions t
      JOIN risk_assessments ra ON t.id = ra.transaction_id
      WHERE ra.risk_level IN ('HIGH', 'CRITICAL') AND t.status IN ('PENDING_REVIEW', 'BLOCKED');
    `);

    // 4. Open Cases Count
    const openCases = await db.query(`
      SELECT COUNT(*) AS count 
      FROM fraud_cases 
      WHERE status IN ('OPEN', 'IN_REVIEW');
    `);

    // 5. Total Daily Volume
    const totalVolume = await db.query(`
      SELECT COUNT(*) as txn_count, COALESCE(SUM(amount), 0) as total_volume
      FROM transactions;
    `);

    res.json({
      criticalAlertsCount: parseInt(critAlerts.rows[0].count, 10),
      transactionsUnderReviewCount: parseInt(underReview.rows[0].count, 10),
      estimatedExposure: parseFloat(exposure.rows[0].total_exposure),
      openCasesCount: parseInt(openCases.rows[0].count, 10),
      totalTransactionCount: parseInt(totalVolume.rows[0].txn_count, 10),
      totalTransactionVolume: parseFloat(totalVolume.rows[0].total_volume),
      systemStatus: {
        engine: 'ONLINE',
        mode: db.getMode(),
        uptimePct: 99.98,
        region: 'AP-SOUTH-1 (MUMBAI)',
        activeRuleEngineVersion: 'Veyra-Hybrid-v2.1',
      },
    });
  } catch (err) {
    console.error('[METRICS_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to compute overview metrics.' });
  }
}

export async function getAttentionQueue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db.query(`
      SELECT 
        q.alert_id,
        q.alert_code,
        q.severity,
        q.alert_status,
        q.sla_remaining_minutes,
        q.transaction_id,
        q.txn_reference,
        q.amount,
        q.currency,
        q.channel,
        q.customer_name,
        q.phone_masked,
        q.risk_score,
        q.risk_level,
        q.analyst_name,
        q.transaction_timestamp
      FROM view_alert_queue q
      WHERE q.alert_status IN ('NEW', 'ACKNOWLEDGED', 'INVESTIGATING')
      ORDER BY 
        CASE q.severity 
          WHEN 'CRITICAL' THEN 1 
          WHEN 'HIGH' THEN 2 
          WHEN 'MEDIUM' THEN 3 
          ELSE 4 
        END,
        q.sla_remaining_minutes ASC
      LIMIT 10;
    `);

    res.json({ items: result.rows });
  } catch (err) {
    console.error('[ATTENTION_QUEUE_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve attention queue.' });
  }
}

export async function getRiskDistribution(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db.query(`
      SELECT 
        COALESCE(ra.risk_level, 'SAFE') as risk_tier,
        COUNT(t.id) as count,
        COALESCE(SUM(t.amount), 0) as total_amount
      FROM transactions t
      LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
      GROUP BY COALESCE(ra.risk_level, 'SAFE')
      ORDER BY 
        CASE COALESCE(ra.risk_level, 'SAFE')
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          WHEN 'LOW' THEN 4
          ELSE 5
        END;
    `);

    res.json({ distribution: result.rows });
  } catch (err) {
    console.error('[RISK_DIST_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve risk distribution.' });
  }
}
