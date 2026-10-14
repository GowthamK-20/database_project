import { Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';
import { synthesizeTransactionStory } from '../../utils/storyGenerator.js';
import { logAuditEvent } from '../../utils/auditLogger.js';

export async function listTransactions(req: AuthRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = (page - 1) * limit;

  const search = (req.query.search as string || '').trim();
  const channel = req.query.channel as string;
  const riskTier = req.query.riskTier as string;
  const status = req.query.status as string;
  const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount as string) : null;
  const maxAmount = req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : null;

  try {
    let whereClauses: string[] = ['1=1'];
    let params: any[] = [];
    let pIdx = 1;

    if (search) {
      whereClauses.push(`(
        t.txn_reference ILIKE $${pIdx} OR 
        c.first_name ILIKE $${pIdx} OR 
        c.last_name ILIKE $${pIdx} OR 
        t.recipient_identifier ILIKE $${pIdx}
      )`);
      params.push(`%${search}%`);
      pIdx++;
    }

    if (channel) {
      whereClauses.push(`t.channel = $${pIdx}`);
      params.push(channel);
      pIdx++;
    }

    if (riskTier) {
      whereClauses.push(`COALESCE(ra.risk_level, 'SAFE') = $${pIdx}`);
      params.push(riskTier);
      pIdx++;
    }

    if (status) {
      whereClauses.push(`t.status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    if (minAmount !== null) {
      whereClauses.push(`t.amount >= $${pIdx}`);
      params.push(minAmount);
      pIdx++;
    }

    if (maxAmount !== null) {
      whereClauses.push(`t.amount <= $${pIdx}`);
      params.push(maxAmount);
      pIdx++;
    }

    const whereSql = whereClauses.join(' AND ');

    // Total count
    const countRes = await db.query(`
      SELECT COUNT(*) as total 
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
      WHERE ${whereSql};
    `, params);

    const totalCount = parseInt(countRes.rows[0].total, 10);

    // Query rows with analytical view data
    const querySql = `
      SELECT 
        v.transaction_id,
        v.txn_reference,
        v.amount,
        v.currency,
        v.channel,
        v.recipient_identifier,
        v.transaction_status,
        v.transaction_timestamp,
        v.account_id,
        v.account_number_masked,
        v.customer_id,
        v.customer_name,
        v.customer_risk_tier,
        v.merchant_name,
        v.location_city,
        v.device_type,
        v.risk_score,
        v.risk_level,
        v.is_flagged
      FROM view_transaction_risk_summary v
      LEFT JOIN transactions t ON v.transaction_id = t.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
      WHERE ${whereSql}
      ORDER BY v.transaction_timestamp DESC
      LIMIT $${pIdx} OFFSET $${pIdx + 1};
    `;

    const dataRes = await db.query(querySql, [...params, limit, offset]);

    res.json({
      data: dataRes.rows,
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error('[TXN_LIST_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch transaction catalog.' });
  }
}

export async function getTransactionById(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const txnRes = await db.query(`
      SELECT * FROM view_transaction_risk_summary
      WHERE transaction_id = $1 OR txn_reference = $1;
    `, [id]);

    if (txnRes.rows.length === 0) {
      res.status(404).json({ error: 'NOT_FOUND', message: `Transaction [${id}] does not exist.` });
      return;
    }

    const txn = txnRes.rows[0];

    // Fetch Risk Factors
    const factorsRes = await db.query(`
      SELECT 
        trf.id,
        trf.factor_name,
        trf.score_contribution,
        trf.severity,
        trf.details,
        rr.name as rule_name,
        rr.rule_code
      FROM transaction_risk_factors trf
      LEFT JOIN risk_rules rr ON trf.rule_id = rr.id
      WHERE trf.risk_assessment_id = $1
      ORDER BY trf.score_contribution DESC;
    `, [txn.risk_assessment_id]);

    // Fetch related/recent transactions from same account
    const relatedTxns = await db.query(`
      SELECT 
        id as transaction_id, 
        txn_reference, 
        amount, 
        channel, 
        recipient_identifier, 
        status, 
        timestamp
      FROM transactions
      WHERE account_id = $1 AND id <> $2
      ORDER BY timestamp DESC
      LIMIT 5;
    `, [txn.account_id, txn.transaction_id]);

    // Fetch active alert/case if any
    const alertRes = await db.query(`
      SELECT 
        fa.id as alert_id,
        fa.alert_code,
        fa.severity,
        fa.status,
        fa.sla_due_at,
        fc.id as case_id,
        fc.case_number,
        fc.title as case_title
      FROM fraud_alerts fa
      LEFT JOIN fraud_cases fc ON fa.id = fc.primary_alert_id
      WHERE fa.transaction_id = $1;
    `, [txn.transaction_id]);

    // Generate Transaction Story
    const transactionStory = synthesizeTransactionStory({
      amount: parseFloat(txn.amount),
      currency: txn.currency,
      timestamp: txn.transaction_timestamp,
      channel: txn.channel,
      recipient: txn.recipient_identifier,
      customerName: txn.customer_name,
      customerRiskTier: txn.customer_risk_tier,
      accountNumberMasked: txn.account_number_masked,
      deviceType: txn.device_type,
      isRooted: txn.is_rooted_or_jailbroken,
      deviceTrust: txn.device_trust_score,
      city: txn.location_city,
      state: txn.location_state,
      isVpn: txn.is_vpn_or_tor,
      factors: factorsRes.rows,
      riskScore: txn.risk_score,
      riskLevel: txn.risk_level,
    });

    res.json({
      transaction: txn,
      riskFactors: factorsRes.rows,
      transactionStory,
      relatedTransactions: relatedTxns.rows,
      associatedAlert: alertRes.rows[0] || null,
    });
  } catch (err) {
    console.error('[TXN_DETAIL_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve transaction details.' });
  }
}
