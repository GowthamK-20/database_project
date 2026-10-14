import { Router } from 'express';
import { listDatabaseTables, getTableDetails, executeRawQuery } from './databaseController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/tables', verifyToken, listDatabaseTables);
router.get('/tables/:tableName', verifyToken, getTableDetails);
router.post('/query', verifyToken, executeRawQuery);

export default router;
