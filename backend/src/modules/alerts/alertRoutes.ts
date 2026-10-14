import { Router } from 'express';
import { listAlerts, updateAlertStatus } from './alertController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, listAlerts);
router.patch('/:id/status', verifyToken, updateAlertStatus);

export default router;
