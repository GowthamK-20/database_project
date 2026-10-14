import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './database/db.js';

import authRoutes from './modules/auth/authRoutes.js';
import overviewRoutes from './modules/overview/overviewRoutes.js';
import transactionRoutes from './modules/transactions/transactionRoutes.js';
import alertRoutes from './modules/alerts/alertRoutes.js';
import caseRoutes from './modules/cases/caseRoutes.js';
import riskRoutes from './modules/risk/riskRoutes.js';
import graphRoutes from './modules/graph/graphRoutes.js';
import entityRoutes from './modules/entities/entityRoutes.js';
import analyticsRoutes from './modules/analytics/analyticsRoutes.js';
import auditRoutes from './modules/audit/auditRoutes.js';
import databaseRoutes from './modules/database/databaseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging (high-density operational format)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/api/health')) {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'Veyra Risk Operations Core',
    database: db.getMode(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/overview', overviewRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/rules', riskRoutes);
app.use('/api/v1/graph', graphRoutes);
app.use('/api/v1/entities', entityRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/database', databaseRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED_ERROR]', err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred.',
  });
});

// Bootstrap server
async function startServer() {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`================================================================`);
      console.log(`[VEYRA RISK] CORE BACKEND ACTIVE ON PORT: ${PORT}`);
      console.log(`[DATABASE] RUNNING IN MODE: ${db.getMode()}`);
      console.log(`[ENDPOINTS] MOUNTED UNDER /api/v1/*`);
      console.log(`================================================================`);
    });
  } catch (err) {
    console.error('[SERVER_BOOT_FAILED]', err);
    process.exit(1);
  }
}

startServer();
