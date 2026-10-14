import { Router } from 'express';
import { getEntityGraph, getMuleRingClusters } from './graphController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/entity/:id', verifyToken, getEntityGraph);
router.get('/mule-clusters', verifyToken, getMuleRingClusters);

export default router;
