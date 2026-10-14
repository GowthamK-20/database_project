import { Router } from 'express';
import { getAnalyticsMetrics, getComplianceSTRReport } from './analyticsController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/metrics', verifyToken, getAnalyticsMetrics);
router.get('/reports/str', verifyToken, requireRole('ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'), getComplianceSTRReport);

export default router;
