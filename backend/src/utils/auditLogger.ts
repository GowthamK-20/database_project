import { db } from '../database/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function logAuditEvent(params: {
  req?: AuthRequest;
  action: string;
  entityName: string;
  entityId: string;
  oldState?: any;
  newState?: any;
  ip?: string;
}): Promise<void> {
  const userId = params.req?.user?.id || null;
  const userBadge = params.req?.user?.badge_number || 'SYSTEM';
  const ip = params.ip || params.req?.ip || '127.0.0.1';
  const userAgent = params.req?.headers['user-agent'] || 'Veyra-API/1.0';

  try {
    await db.query(`
      INSERT INTO audit_logs (
        user_id,
        user_badge,
        action,
        entity_name,
        entity_id,
        old_state,
        new_state,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `, [
      userId,
      userBadge,
      params.action,
      params.entityName,
      params.entityId,
      params.oldState ? JSON.stringify(params.oldState) : null,
      params.newState ? JSON.stringify(params.newState) : null,
      ip,
      userAgent,
    ]);
  } catch (err) {
    console.error('[AUDIT_ERROR] Failed to record immutable audit log entry:', err);
  }
}
