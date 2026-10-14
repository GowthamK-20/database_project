import { Router } from 'express';
import { getOverviewMetrics, getAttentionQueue, getRiskDistribution } from './overviewController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/metrics', verifyToken, getOverviewMetrics);
router.get('/attention-queue', verifyToken, getAttentionQueue);
router.get('/risk-distribution', verifyToken, getRiskDistribution);

export default router;
