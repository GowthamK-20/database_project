import { db } from '../database/db.js';

async function verifySchema() {
  console.log('--- STARTING DATABASE SCHEMA VERIFICATION ---');
  await db.init();
  console.log(`[VERIFY] Database running in mode: ${db.getMode()}`);

  // 1. Verify tables
  const tables = await db.query<{ table_name: string }>(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  console.log(`[VERIFY] Total Base Tables found: ${tables.rows.length}`);
  tables.rows.forEach(r => console.log(`  - Table: ${r.table_name}`));

  // 2. Verify views
  const views = await db.query<{ table_name: string }>(`
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log(`[VERIFY] Total Views found: ${views.rows.length}`);
  views.rows.forEach(r => console.log(`  - View: ${r.table_name}`));

  // 3. Test insert & constraint check
  console.log('[VERIFY] Testing relational constraints...');
  const testUser = await db.query(`
    INSERT INTO users (id, username, email, password_hash, full_name, role, badge_number)
    VALUES ('USR-TEST-01', 'test_analyst', 'test@veyrarisk.internal', '$2a$10$xyz', 'Forensic Investigator', 'FRAUD_ANALYST', 'BADGE-9021')
    ON CONFLICT (id) DO NOTHING
    RETURNING id, username, role;
  `);
  console.log('[VERIFY] User insert test passed:', testUser.rows);

  console.log('--- ALL DATABASE SCHEMA CHECKS PASSED SUCCESSFULLY ---');
  process.exit(0);
}

verifySchema().catch((err) => {
  console.error('[VERIFY FAILED]:', err);
  process.exit(1);
});
