import { Router } from 'express';
import { listCases, getCaseById, addCaseNote, executeCaseAction } from './caseController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, listCases);
router.get('/:id', verifyToken, getCaseById);
router.post('/:id/notes', verifyToken, addCaseNote);
router.post('/:id/action', verifyToken, requireRole('ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST'), executeCaseAction);

export default router;
