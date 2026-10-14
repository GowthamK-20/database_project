import { Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';

export async function listAuditLogs(req: AuthRequest, res: Response): Promise<void> {
  const entityName = req.query.entity as string;
  const action = req.query.action as string;

  try {
    let whereClauses: string[] = ['1=1'];
    let params: any[] = [];
    let pIdx = 1;

    if (entityName) {
      whereClauses.push(`a.entity_name = $${pIdx}`);
      params.push(entityName);
      pIdx++;
    }

    if (action) {
      whereClauses.push(`a.action = $${pIdx}`);
      params.push(action);
      pIdx++;
    }

    const result = await db.query(`
      SELECT 
        a.id,
        a.user_id,
        a.user_badge,
        a.action,
        a.entity_name,
        a.entity_id,
        a.old_state,
        a.new_state,
        a.ip_address,
        a.user_agent,
        a.created_at,
        u.full_name as user_full_name,
        u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY a.created_at DESC
      LIMIT 100;
    `, params);

    res.json({ logs: result.rows });
  } catch (err) {
    console.error('[AUDIT_LIST_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve immutable audit logs.' });
  }
}
