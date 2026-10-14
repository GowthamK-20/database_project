import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../../database/db.js';
import { generateToken, AuthRequest } from '../../middleware/authMiddleware.js';
import { logAuditEvent } from '../../utils/auditLogger.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'BAD_REQUEST', message: 'Username and password are required.' });
    return;
  }

  try {
    const result = await db.query(`
      SELECT id, username, email, password_hash, full_name, role, badge_number, is_active
      FROM users
      WHERE username = $1 OR email = $1;
    `, [username]);

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'AUTH_FAILED', message: 'Invalid credentials.' });
      return;
    }

    const user = result.rows[0];

    if (!user.is_active) {
      res.status(403).json({ error: 'ACCOUNT_LOCKED', message: 'User account has been deactivated.' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'AUTH_FAILED', message: 'Invalid credentials.' });
      return;
    }

    // Update last login
    await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
      badge_number: user.badge_number,
    });

    // Record audit event
    await logAuditEvent({
      action: 'USER_LOGIN_SUCCESS',
      entityName: 'users',
      entityId: user.id,
      ip: req.ip,
      newState: { username: user.username, role: user.role },
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        badge_number: user.badge_number,
      },
    });
  } catch (err) {
    console.error('[AUTH_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Authentication process encountered an error.' });
  }
}

export async function getSession(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  res.json({ user: req.user });
}
