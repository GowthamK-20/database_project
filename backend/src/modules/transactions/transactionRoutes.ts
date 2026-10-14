import { Router } from 'express';
import { listTransactions, getTransactionById } from './transactionController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, listTransactions);
router.get('/:id', verifyToken, getTransactionById);

export default router;
