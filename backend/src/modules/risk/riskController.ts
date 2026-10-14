import { Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';
import { logAuditEvent } from '../../utils/auditLogger.js';

export async function listRules(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db.query(`
      SELECT 
        rr.*,
        u.full_name as author_name
      FROM risk_rules rr
      LEFT JOIN users u ON rr.created_by = u.id
      ORDER BY rr.weight_score DESC, rr.created_at DESC;
    `);

    res.json({ rules: result.rows });
  } catch (err) {
    console.error('[RULES_LIST_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve risk rules.' });
  }
}

export async function updateRule(req: AuthRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { name, description, weightScore, severity, isActive } = req.body;

  try {
    const existing = await db.query('SELECT * FROM risk_rules WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Rule not found.' });
      return;
    }

    const oldRule = existing.rows[0];

    await db.query(`
      UPDATE risk_rules
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        weight_score = COALESCE($3, weight_score),
        severity = COALESCE($4, severity),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6;
    `, [name, description, weightScore, severity, isActive, id]);

    await logAuditEvent({
      req,
      action: 'RISK_RULE_UPDATED',
      entityName: 'risk_rules',
      entityId: id,
      oldState: oldRule,
      newState: { name, description, weightScore, severity, isActive },
    });

    res.json({ success: true, message: 'Rule updated successfully.' });
  } catch (err) {
    console.error('[RULE_UPDATE_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to update rule.' });
  }
}

// ------------------------------------------------------------------------------
// UNIQUE FEATURE: HISTORICAL RULE BACKTESTING SIMULATOR
// ------------------------------------------------------------------------------
export async function simulateRule(req: AuthRequest, res: Response): Promise<void> {
  const {
    minAmount,
    maxAmount,
    channel,
    isRootedOnly,
    nightWindowOnly,
    isVpnOnly,
  } = req.body;

  try {
    let whereClauses: string[] = ['1=1'];
    let params: any[] = [];
    let pIdx = 1;

    if (minAmount && Number(minAmount) > 0) {
      whereClauses.push(`t.amount >= $${pIdx}`);
      params.push(Number(minAmount));
      pIdx++;
    }

    if (maxAmount && Number(maxAmount) > 0) {
      whereClauses.push(`t.amount <= $${pIdx}`);
      params.push(Number(maxAmount));
      pIdx++;
    }

    if (channel && channel !== 'ALL') {
      whereClauses.push(`t.channel = $${pIdx}`);
      params.push(channel);
      pIdx++;
    }

    if (isRootedOnly) {
      whereClauses.push(`d.is_rooted_or_jailbroken = TRUE`);
    }

    if (isVpnOnly) {
      whereClauses.push(`l.is_vpn_or_tor = TRUE`);
    }

    if (nightWindowOnly) {
      whereClauses.push(`EXTRACT(HOUR FROM t.timestamp) BETWEEN 1 AND 5`);
    }

    const whereSql = whereClauses.join(' AND ');

    // Run simulation query against all historical transactions
    const simRes = await db.query(`
      SELECT 
        t.id as transaction_id,
        t.txn_reference,
        t.amount,
        t.channel,
        t.recipient_identifier,
        t.timestamp,
        t.status,
        c.first_name || ' ' || c.last_name as customer_name,
        d.device_type,
        d.is_rooted_or_jailbroken,
        l.city as location_city,
        ra.risk_score,
        ra.risk_level
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN devices d ON t.device_id = d.id
      LEFT JOIN locations l ON t.location_id = l.id
      LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
      WHERE ${whereSql}
      ORDER BY t.timestamp DESC;
    `, params);

    const matched = simRes.rows;
    const totalMatchedCount = matched.length;
    const totalVolume = matched.reduce((acc, row) => acc + parseFloat(row.amount), 0);

    // Count true fraud among matches (flagged as high/critical or blocked)
    const confirmedFraudMatches = matched.filter(
      r => r.risk_level === 'CRITICAL' || r.risk_level === 'HIGH' || r.status === 'BLOCKED'
    ).length;

    const falsePositiveMatches = totalMatchedCount - confirmedFraudMatches;

    const precision = totalMatchedCount > 0 
      ? Math.round((confirmedFraudMatches / totalMatchedCount) * 100) 
      : 100;

    // Estimate daily workload increase
    const projectedAlertsPerDay = Math.max(1, Math.round(totalMatchedCount * 0.8));

    res.json({
      simulation: {
        totalMatchedCount,
        totalVolume,
        confirmedFraudMatches,
        falsePositiveMatches,
        precisionPct: precision,
        projectedAlertsPerDay,
        matchedSample: matched.slice(0, 10),
      },
    });
  } catch (err) {
    console.error('[SIMULATE_RULE_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Rule backtesting simulation failed.' });
  }
}
