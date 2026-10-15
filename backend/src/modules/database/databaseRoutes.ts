import { Router } from 'express';
import { 
  listDatabaseTables, 
  getTableDetails, 
  executeRawQuery,
  getSampleQueries,
  getQueryHistory
} from './databaseController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/tables', verifyToken, requireRole('ADMIN'), listDatabaseTables);
router.get('/tables/:tableName', verifyToken, requireRole('ADMIN'), getTableDetails);
router.get('/sample-queries', verifyToken, requireRole('ADMIN'), getSampleQueries);
router.get('/history', verifyToken, requireRole('ADMIN'), getQueryHistory);
router.post('/query', verifyToken, requireRole('ADMIN'), executeRawQuery);

export default router;
