import { app } from './app.js';
import { db } from './database/db.js';

const PORT = process.env.PORT || 5000;

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
