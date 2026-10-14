import { Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';
import { logAuditEvent } from '../../utils/auditLogger.js';

export async function listAlerts(req: AuthRequest, res: Response): Promise<void> {
  const status = req.query.status as string;
  const severity = req.query.severity as string;

  try {
    let whereClauses: string[] = ['1=1'];
    let params: any[] = [];
    let pIdx = 1;

    if (status) {
      whereClauses.push(`q.alert_status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    if (severity) {
      whereClauses.push(`q.severity = $${pIdx}`);
      params.push(severity);
      pIdx++;
    }

    const result = await db.query(`
      SELECT 
        q.alert_id,
        q.alert_code,
        q.severity,
        q.alert_status,
        q.sla_due_at,
        q.sla_remaining_minutes,
        q.alert_created_at,
        q.analyst_id,
        q.analyst_name,
        q.analyst_badge,
        q.transaction_id,
        q.txn_reference,
        q.amount,
        q.currency,
        q.channel,
        q.recipient_identifier,
        q.transaction_timestamp,
        q.customer_id,
        q.customer_name,
        q.phone_masked,
        q.risk_score,
        q.risk_level
      FROM view_alert_queue q
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY 
        CASE q.severity 
          WHEN 'CRITICAL' THEN 1 
          WHEN 'HIGH' THEN 2 
          WHEN 'MEDIUM' THEN 3 
          ELSE 4 
        END,
        q.sla_remaining_minutes ASC;
    `, params);

    res.json({ alerts: result.rows });
  } catch (err) {
    console.error('[ALERTS_LIST_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve fraud alerts.' });
  }
}

export async function updateAlertStatus(req: AuthRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { status, assignedTo } = req.body;

  try {
    const existing = await db.query('SELECT * FROM fraud_alerts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Alert does not exist.' });
      return;
    }

    const oldState = existing.rows[0];
    const newAssigned = assignedTo !== undefined ? assignedTo : oldState.assigned_to;
    const newStatus = status || oldState.status;

    await db.query(`
      UPDATE fraud_alerts 
      SET status = $1, assigned_to = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3;
    `, [newStatus, newAssigned, id]);

    // Record immutable audit entry
    await logAuditEvent({
      req,
      action: 'ALERT_STATUS_UPDATE',
      entityName: 'fraud_alerts',
      entityId: id,
      oldState: { status: oldState.status, assigned_to: oldState.assigned_to },
      newState: { status: newStatus, assigned_to: newAssigned },
    });

    res.json({ success: true, message: `Alert updated to [${newStatus}].` });
  } catch (err) {
    console.error('[ALERT_UPDATE_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to update alert.' });
  }
}
