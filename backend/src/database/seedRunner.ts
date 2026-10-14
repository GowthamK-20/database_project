import { runSeeds } from './seeds/seedData.js';
import { db } from './db.js';

runSeeds()
  .then(async () => {
    console.log('[SEED RUNNER] Database seeding successfully completed.');
    await db.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[SEED RUNNER FAILED]:', err);
    await db.close();
    process.exit(1);
  });
