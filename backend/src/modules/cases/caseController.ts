import { Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';
import { logAuditEvent } from '../../utils/auditLogger.js';

export async function listCases(req: AuthRequest, res: Response): Promise<void> {
  const status = req.query.status as string;
  const priority = req.query.priority as string;

  try {
    let whereClauses: string[] = ['1=1'];
    let params: any[] = [];
    let pIdx = 1;

    if (status) {
      whereClauses.push(`fc.status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    if (priority) {
      whereClauses.push(`fc.priority = $${pIdx}`);
      params.push(priority);
      pIdx++;
    }

    const result = await db.query(`
      SELECT 
        fc.id,
        fc.case_number,
        fc.title,
        fc.priority,
        fc.status,
        fc.estimated_exposure,
        fc.opened_at,
        fc.closed_at,
        u.id as analyst_id,
        u.full_name as analyst_name,
        u.badge_number as analyst_badge,
        fa.alert_code,
        fa.severity as alert_severity,
        t.txn_reference,
        t.amount as transaction_amount,
        c.first_name || ' ' || c.last_name as customer_name
      FROM fraud_cases fc
      LEFT JOIN users u ON fc.assigned_analyst_id = u.id
      LEFT JOIN fraud_alerts fa ON fc.primary_alert_id = fa.id
      LEFT JOIN transactions t ON fa.transaction_id = t.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN customers c ON a.customer_id = c.id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY 
        CASE fc.priority 
          WHEN 'P1_CRITICAL' THEN 1 
          WHEN 'P2_HIGH' THEN 2 
          WHEN 'P3_MEDIUM' THEN 3 
          ELSE 4 
        END,
        fc.opened_at DESC;
    `, params);

    res.json({ cases: result.rows });
  } catch (err) {
    console.error('[CASES_LIST_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve cases.' });
  }
}

export async function getCaseById(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const caseRes = await db.query(`
      SELECT 
        fc.*,
        u.full_name as analyst_name,
        u.badge_number as analyst_badge,
        fa.alert_code,
        fa.severity as alert_severity,
        fa.sla_due_at,
        fa.transaction_id
      FROM fraud_cases fc
      LEFT JOIN users u ON fc.assigned_analyst_id = u.id
      LEFT JOIN fraud_alerts fa ON fc.primary_alert_id = fa.id
      WHERE fc.id = $1 OR fc.case_number = $1;
    `, [id]);

    if (caseRes.rows.length === 0) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Case not found.' });
      return;
    }

    const fraudCase = caseRes.rows[0];

    // Fetch notes
    const notesRes = await db.query(`
      SELECT 
        cn.id,
        cn.content,
        cn.created_at,
        u.full_name as author_name,
        u.badge_number as author_badge
      FROM case_notes cn
      JOIN users u ON cn.author_id = u.id
      WHERE cn.case_id = $1
      ORDER BY cn.created_at ASC;
    `, [fraudCase.id]);

    // Fetch evidence
    const evidenceRes = await db.query(`
      SELECT * FROM case_evidence
      WHERE case_id = $1
      ORDER BY attached_at DESC;
    `, [fraudCase.id]);

    // Fetch transaction details
    const txnRes = await db.query(`
      SELECT * FROM view_transaction_risk_summary
      WHERE transaction_id = $1;
    `, [fraudCase.transaction_id]);

    res.json({
      case: fraudCase,
      notes: notesRes.rows,
      evidence: evidenceRes.rows,
      transaction: txnRes.rows[0] || null,
    });
  } catch (err) {
    console.error('[CASE_DETAIL_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch case detail.' });
  }
}

export async function addCaseNote(req: AuthRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'BAD_REQUEST', message: 'Note content cannot be empty.' });
    return;
  }

  try {
    const authorId = req.user?.id || 'USR-ANL-101';
    const noteId = `NOTE-${Date.now()}`;

    await db.query(`
      INSERT INTO case_notes (id, case_id, author_id, content)
      VALUES ($1, $2, $3, $4);
    `, [noteId, id, authorId, content.trim()]);

    await logAuditEvent({
      req,
      action: 'CASE_NOTE_ADDED',
      entityName: 'fraud_cases',
      entityId: id,
      newState: { noteId, preview: content.trim().substring(0, 50) },
    });

    res.json({ success: true, message: 'Note added successfully.' });
  } catch (err) {
    console.error('[ADD_NOTE_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to save note.' });
  }
}

export async function executeCaseAction(req: AuthRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { actionType, reason, targetAccountId, targetDeviceId } = req.body;

  try {
    const caseRes = await db.query('SELECT * FROM fraud_cases WHERE id = $1', [id]);
    if (caseRes.rows.length === 0) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Case not found.' });
      return;
    }
    const currentCase = caseRes.rows[0];

    if (actionType === 'FREEZE_ACCOUNT' && targetAccountId) {
      await db.query(`UPDATE accounts SET status = 'FROZEN' WHERE id = $1`, [targetAccountId]);
      await logAuditEvent({
        req,
        action: 'ACCOUNT_FROZEN',
        entityName: 'accounts',
        entityId: targetAccountId,
        newState: { status: 'FROZEN', reason },
      });
    } else if (actionType === 'BLOCK_DEVICE' && targetDeviceId) {
      await db.query(`UPDATE devices SET trust_score = 0 WHERE id = $1`, [targetDeviceId]);
      await logAuditEvent({
        req,
        action: 'DEVICE_BLOCKED',
        entityName: 'devices',
        entityId: targetDeviceId,
        newState: { trust_score: 0, reason },
      });
    } else if (actionType === 'CLOSE_CONFIRMED_FRAUD') {
      await db.query(`
        UPDATE fraud_cases 
        SET status = 'CLOSED_CONFIRMED_FRAUD', resolution_summary = $1, closed_at = CURRENT_TIMESTAMP 
        WHERE id = $2;
      `, [reason, id]);

      await db.query(`
        UPDATE fraud_alerts SET status = 'RESOLVED_FRAUD' 
        WHERE id = $1;
      `, [currentCase.primary_alert_id]);
    } else if (actionType === 'CLOSE_FALSE_POSITIVE') {
      await db.query(`
        UPDATE fraud_cases 
        SET status = 'CLOSED_FALSE_POSITIVE', resolution_summary = $1, closed_at = CURRENT_TIMESTAMP 
        WHERE id = $2;
      `, [reason, id]);

      await db.query(`
        UPDATE fraud_alerts SET status = 'RESOLVED_FALSE_POSITIVE' 
        WHERE id = $1;
      `, [currentCase.primary_alert_id]);
    }

    res.json({ success: true, message: `Action [${actionType}] executed successfully.` });
  } catch (err) {
    console.error('[CASE_ACTION_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to execute case action.' });
  }
}
