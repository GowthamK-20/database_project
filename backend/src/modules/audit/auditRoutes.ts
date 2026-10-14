import { Router } from 'express';
import { listAuditLogs } from './auditController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, requireRole('ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'), listAuditLogs);

export default router;
