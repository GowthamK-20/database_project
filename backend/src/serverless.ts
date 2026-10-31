import app from './app.js';
import { db } from './database/db.js';

let isDbReady = false;

export default async function handler(req: any, res: any) {
  if (!isDbReady) {
    try {
      await db.init();
      isDbReady = true;
    } catch (err) {
      console.error('[SERVERLESS_DB_INIT_ERROR]', err);
    }
  }
  return app(req, res);
}
