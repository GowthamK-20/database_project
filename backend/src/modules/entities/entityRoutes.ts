import { Router } from 'express';
import { getCustomer360, listCustomers, listMerchants } from './entityController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/customers', verifyToken, listCustomers);
router.get('/customers/:id', verifyToken, getCustomer360);
router.get('/merchants', verifyToken, listMerchants);

export default router;
