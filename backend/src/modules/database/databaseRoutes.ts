import { Router } from 'express';
import { 
  listDatabaseTables, 
  getTableDetails, 
  executeRawQuery,
  getSampleQueries,
  getQueryHistory
} from './databaseController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/tables', verifyToken, listDatabaseTables);
router.get('/tables/:tableName', verifyToken, getTableDetails);
router.get('/sample-queries', verifyToken, getSampleQueries);
router.get('/history', verifyToken, getQueryHistory);
router.post('/query', verifyToken, executeRawQuery);

export default router;
