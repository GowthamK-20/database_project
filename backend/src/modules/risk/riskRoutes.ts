import { Router } from 'express';
import { listRules, updateRule, simulateRule } from './riskController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, listRules);
router.patch('/:id', verifyToken, requireRole('ADMIN', 'RISK_MANAGER'), updateRule);
router.post('/simulate', verifyToken, simulateRule);

export default router;
