import { Router } from 'express';
import { login, getSession } from './authController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', verifyToken, getSession);

export default router;
