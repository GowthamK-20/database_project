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

// Security & Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.includes('/health')) {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
const handleHealth = (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'Veyra Risk Operations Core',
    database: db.getMode(),
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Subrouter for V1 API
const v1Router = express.Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/overview', overviewRoutes);
v1Router.use('/transactions', transactionRoutes);
v1Router.use('/alerts', alertRoutes);
v1Router.use('/cases', caseRoutes);
v1Router.use('/rules', riskRoutes);
v1Router.use('/graph', graphRoutes);
v1Router.use('/entities', entityRoutes);
v1Router.use('/analytics', analyticsRoutes);
v1Router.use('/audit', auditRoutes);
v1Router.use('/database', databaseRoutes);

// Mount router on all path variants so rewrites never fail
app.use('/api/v1', v1Router);
app.use('/v1', v1Router);
app.use('/api', v1Router);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED_ERROR]', err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred.',
  });
});

export { app };
export default app;
