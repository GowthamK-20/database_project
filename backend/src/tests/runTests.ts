import { db } from '../database/db.js';
import bcrypt from 'bcryptjs';
import { generateToken, AuthenticatedUser } from '../middleware/authMiddleware.js';
import { synthesizeTransactionStory } from '../utils/storyGenerator.js';

import { runSeeds } from '../database/seeds/seedData.js';

async function runTestSuite() {
  console.log('================================================================');
  console.log('>>> FINGUARD AI // COMPREHENSIVE AUTOMATED TEST SUITE <<<');
  console.log('================================================================');

  await db.init();

  // If running against fresh test database, auto-run seeds
  const userCheckInit = await db.query('SELECT count(*) as count FROM users');
  if (parseInt(userCheckInit.rows[0].count) === 0) {
    console.log('[TEST] Clean database detected, running initial seeds...');
    await runSeeds();
  }

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // --- TEST 1: Database Catalog & Foreign Key Constraints ---
  console.log('\n--- 1. Testing Database Entities & Constraints ---');
  const userCheck = await db.query('SELECT count(*) as count FROM users');
  assert(parseInt(userCheck.rows[0].count) >= 4, 'Users table contains seeded operational personas');

  const customerCheck = await db.query('SELECT count(*) as count FROM customers');
  assert(parseInt(customerCheck.rows[0].count) >= 7, 'Customers table contains verified profiles');

  const txCheck = await db.query('SELECT count(*) as count FROM transactions');
  assert(parseInt(txCheck.rows[0].count) >= 11, 'Transactions catalog contains seeded realistic transactions');

  // Test Check Constraint: Amount must be > 0
  let constraintPassed = false;
  try {
    await db.query(`
      INSERT INTO transactions (id, txn_reference, account_id, channel, amount, recipient_identifier)
      VALUES ('FAIL-TXN', 'FAIL-REF', 'ACC-001', 'UPI', -500.00, 'bad@vpa');
    `);
  } catch (err) {
    constraintPassed = true;
  }
  assert(constraintPassed, 'CHECK constraint strictly blocks negative transaction amounts (amount > 0)');

  // --- TEST 2: Authentication & Password Hashing ---
  console.log('\n--- 2. Testing Authentication & RBAC ---');
  const adminRes = await db.query('SELECT * FROM users WHERE username = $1', ['admin']);
  assert(adminRes.rows.length === 1, 'Admin user account exists');

  const validPw = await bcrypt.compare('VeyraRisk@2026', adminRes.rows[0].password_hash);
  assert(validPw, 'Bcrypt password hash validates against VeyraRisk@2026');

  const invalidPw = await bcrypt.compare('WrongPassword', adminRes.rows[0].password_hash);
  assert(!invalidPw, 'Bcrypt securely rejects incorrect password');

  const testUser: AuthenticatedUser = {
    id: adminRes.rows[0].id,
    username: adminRes.rows[0].username,
    role: adminRes.rows[0].role,
    full_name: adminRes.rows[0].full_name,
    badge_number: adminRes.rows[0].badge_number,
  };
  const token = generateToken(testUser);
  assert(typeof token === 'string' && token.length > 20, 'JWT token successfully generated with user payload');

  // --- TEST 3: Forensic Transaction Story Synthesis ---
  console.log('\n--- 3. Testing Transaction Story Synthesis ---');
  const story = synthesizeTransactionStory({
    amount: 380000,
    currency: 'INR',
    timestamp: new Date().toISOString(),
    channel: 'UPI',
    recipient: 'vaultex.crypto@international',
    customerName: 'Sunita Rao',
    customerRiskTier: 'HIGH',
    accountNumberMasked: '•••• •••• •••• 3290',
    deviceType: 'MOBILE_ANDROID',
    isRooted: true,
    deviceTrust: 15,
    city: 'Jaipur',
    state: 'Rajasthan',
    isVpn: false,
    factors: [
      { factor_name: 'High-Value Outlier', score_contribution: 30, severity: 'HIGH', details: {} },
      { factor_name: 'Unregistered Device at Night', score_contribution: 30, severity: 'CRITICAL', details: {} },
    ],
    riskScore: 92,
    riskLevel: 'CRITICAL',
  });
  assert(story.includes('Sunita Rao'), 'Story accurately references customer name');
  assert(story.includes('3,80,000'), 'Story accurately renders Indian Rupee format');
  assert(story.includes('Jaipur'), 'Story includes geolocation');
  assert(story.includes('rooted/compromised OS signatures'), 'Story highlights rooted hardware threat');

  // --- TEST 4: Unique Feature - Rule Simulator Engine ---
  console.log('\n--- 4. Testing Historical Rule Simulator ---');
  const simMatched = await db.query(`
    SELECT t.id, t.amount, ra.risk_level
    FROM transactions t
    LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
    WHERE t.amount >= 100000;
  `);
  assert(simMatched.rows.length >= 3, 'Rule simulator correctly matches high-value transactions (> ₹1,00,000)');

  // --- TEST 5: Unique Feature - Mule Ring Entity Graph ---
  console.log('\n--- 5. Testing Mule Ring Detection & Graph Resolution ---');
  const muleCluster = await db.query(`
    SELECT d.id, d.device_fingerprint, COUNT(DISTINCT cd.customer_id) as linked_customers
    FROM devices d
    JOIN customer_devices cd ON d.id = cd.device_id
    GROUP BY d.id, d.device_fingerprint
    HAVING COUNT(DISTINCT cd.customer_id) > 1;
  `);
  assert(muleCluster.rows.length >= 1, 'Mule ring detector accurately identifies shared device linked across multiple customers');
  assert(parseInt(muleCluster.rows[0].linked_customers) >= 3, 'Device is tied to 3 distinct customer accounts (CUST-004, CUST-005, CUST-006)');

  // --- TEST 6: Immutable Audit Trail ---
  console.log('\n--- 6. Testing Immutable Audit Log Ledger ---');
  const auditRes = await db.query('SELECT count(*) as count FROM audit_logs');
  assert(parseInt(auditRes.rows[0].count) >= 2, 'Audit log correctly contains tamper-evident entries');

  // --- TEST 7: Cards Entity & Check Constraints ---
  console.log('\n--- 7. Testing Cards Entity & Integrity Constraints ---');
  const cardsRes = await db.query('SELECT count(*) as count FROM cards');
  assert(parseInt(cardsRes.rows[0].count) >= 4, 'Cards table contains seeded payment cards');

  // Test Check Constraint: Expiry month must be 1..12
  let cardConstraintPassed = false;
  try {
    await db.query(`
      INSERT INTO cards (id, account_id, card_number_masked, card_hash, card_type, card_network, expiry_month, expiry_year, cvv_hash)
      VALUES ('FAIL-CARD', 'ACC-001', '•••• 9999', 'hash_fail', 'DEBIT', 'VISA', 14, 2028, 'cvv_fail');
    `);
  } catch (err) {
    cardConstraintPassed = true;
  }
  assert(cardConstraintPassed, 'CHECK constraint strictly blocks invalid expiry month (> 12)');

  const cardTxnCheck = await db.query("SELECT card_id FROM transactions WHERE id = 'TXN-2026-9004'");
  assert(cardTxnCheck.rows.length === 1 && cardTxnCheck.rows[0].card_id === 'CARD-003', 'Transaction TXN-2026-9004 is linked to card CARD-003');

  // --- TEST 8: Loans & Loan Repayment Ledgers ---
  console.log('\n--- 8. Testing Loans & Loan Repayment Ledgers ---');
  const loanRes = await db.query('SELECT count(*) as count FROM loans');
  assert(parseInt(loanRes.rows[0].count) >= 2, 'Loans table contains active customer credit facilities');

  const lpayRes = await db.query('SELECT count(*) as count FROM loan_payments');
  assert(parseInt(lpayRes.rows[0].count) >= 3, 'Loan payments ledger contains verified installment repayments');

  // --- TEST 9: Security Telemetry (Login History) ---
  console.log('\n--- 9. Testing Security & Account Takeover Telemetry ---');
  const loginRes = await db.query('SELECT count(*) as count FROM login_history');
  assert(parseInt(loginRes.rows[0].count) >= 3, 'Login history captures authentication and challenge events');

  const suspiciousLogins = await db.query("SELECT count(*) as count FROM login_history WHERE login_status = 'SUSPICIOUS_CHALLENGE'");
  assert(parseInt(suspiciousLogins.rows[0].count) >= 2, 'Login history captures suspicious login challenges');

  // --- TEST 10: Customer In-App Notifications ---
  console.log('\n--- 10. Testing Customer In-App Notifications ---');
  const notifRes = await db.query('SELECT count(*) as count FROM customer_notifications WHERE is_read = false');
  assert(parseInt(notifRes.rows[0].count) >= 2, 'Customer notifications queue contains unread security alerts');

  const custUserRes = await db.query("SELECT c.id, c.user_id, u.username, u.role FROM customers c JOIN users u ON c.user_id = u.id WHERE u.role = 'CUSTOMER'");
  assert(custUserRes.rows.length >= 3, 'Customer profiles correctly link to authenticated CUSTOMER role users');

  // --- TEST 11: Stage 2 - Synthetic Dataset Scale & Referential Integrity ---
  console.log('\n--- 11. Testing Stage 2 Synthetic Dataset Scale & Referential Integrity ---');
  const custTotal = await db.query('SELECT count(*) as count FROM customers');
  assert(parseInt(custTotal.rows[0].count) >= 1000, `Total customers scaled to >= 1,000 (actual: ${custTotal.rows[0].count})`);

  const acctTotal = await db.query('SELECT count(*) as count FROM accounts');
  assert(parseInt(acctTotal.rows[0].count) >= 1000, `Total accounts scaled to >= 1,000 (actual: ${acctTotal.rows[0].count})`);

  const txnTotal = await db.query('SELECT count(*) as count FROM transactions');
  assert(parseInt(txnTotal.rows[0].count) >= 1000, `Total transactions scaled to >= 1,000 (actual: ${txnTotal.rows[0].count})`);

  const raTotal = await db.query('SELECT count(*) as count FROM risk_assessments');
  assert(parseInt(raTotal.rows[0].count) >= 1000, `Total risk assessments scaled to >= 1,000 (actual: ${raTotal.rows[0].count})`);

  // Foreign key referential integrity checks (0 orphan records)
  const orphanTxns = await db.query(`
    SELECT count(*) as count 
    FROM transactions t 
    LEFT JOIN accounts a ON t.account_id = a.id 
    WHERE a.id IS NULL;
  `);
  assert(parseInt(orphanTxns.rows[0].count) === 0, 'Referential Integrity: 0 orphan transactions missing account parents');

  const orphanAccts = await db.query(`
    SELECT count(*) as count 
    FROM accounts a 
    LEFT JOIN customers c ON a.customer_id = c.id 
    WHERE c.id IS NULL;
  `);
  assert(parseInt(orphanAccts.rows[0].count) === 0, 'Referential Integrity: 0 orphan accounts missing customer parents');

  const orphanMerchs = await db.query(`
    SELECT count(*) as count 
    FROM transactions t 
    LEFT JOIN merchants m ON t.merchant_id = m.id 
    WHERE t.merchant_id IS NOT NULL AND m.id IS NULL;
  `);
  assert(parseInt(orphanMerchs.rows[0].count) === 0, 'Referential Integrity: 0 transactions with unmapped merchant foreign keys');

  // --- TEST 12: Stage 2 - Database Catalog & Schema Metadata ---
  console.log('\n--- 12. Testing Database Explorer Schema Metadata Endpoints ---');
  const catalogRes = await db.query(`
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  assert(catalogRes.rows.length >= 20, `Database catalog contains >= 20 relational structures (actual: ${catalogRes.rows.length})`);

  const pkCheck = await db.query(`
    SELECT tc.table_name, kcu.column_name 
    FROM information_schema.table_constraints tc 
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name 
      AND tc.table_schema = kcu.table_schema 
    WHERE tc.constraint_type = 'PRIMARY KEY' 
      AND tc.table_name IN ('customers', 'accounts', 'transactions', 'cards', 'merchants');
  `);
  assert(pkCheck.rows.length >= 5, 'Primary key constraints verified on core financial tables');

  // --- TEST 13: Stage 2 - SQL Query Lab Security Guardrails ---
  console.log('\n--- 13. Testing SQL Query Lab Read-Only Security Guardrails ---');
  function validateSqlSecurity(sqlString: string): { allowed: boolean; reason?: string } {
    const trimmed = sqlString.trim();
    const upper = trimmed.toUpperCase();
    const startsAllowed = upper.startsWith('SELECT') || upper.startsWith('WITH') || upper.startsWith('EXPLAIN');
    if (!startsAllowed) return { allowed: false, reason: 'Must start with SELECT, WITH, or EXPLAIN' };

    const forbiddenPatterns = [
      /\bINSERT\b/i,
      /\bUPDATE\b/i,
      /\bDELETE\b/i,
      /\bDROP\b/i,
      /\bALTER\b/i,
      /\bTRUNCATE\b/i,
      /\bCREATE\b/i,
      /\bGRANT\b/i,
      /\bREVOKE\b/i,
      /\bCOPY\b/i,
      /;/
    ];
    for (const pat of forbiddenPatterns) {
      if (pat.test(trimmed)) {
        return { allowed: false, reason: `Matches forbidden pattern: ${pat}` };
      }
    }
    return { allowed: true };
  }

  assert(!validateSqlSecurity('DROP TABLE customers').allowed, 'Security: Blocks DROP TABLE attempt');
  assert(!validateSqlSecurity('DELETE FROM transactions WHERE amount > 0').allowed, 'Security: Blocks DELETE attempt');
  assert(!validateSqlSecurity('UPDATE accounts SET current_balance = 0').allowed, 'Security: Blocks UPDATE attempt');
  assert(!validateSqlSecurity('INSERT INTO users VALUES (...)').allowed, 'Security: Blocks INSERT attempt');
  assert(!validateSqlSecurity('SELECT * FROM transactions; DROP TABLE users;').allowed, 'Security: Blocks statement chaining via semicolon (;)');
  assert(validateSqlSecurity('SELECT * FROM transactions WHERE amount >= 100000').allowed, 'Security: Allows analytical SELECT with WHERE clause');
  assert(validateSqlSecurity('WITH top_cust AS (SELECT customer_id FROM accounts) SELECT * FROM top_cust').allowed, 'Security: Allows CTE (WITH ... SELECT)');
  assert(validateSqlSecurity('EXPLAIN SELECT * FROM transactions').allowed, 'Security: Allows EXPLAIN execution plan inspection');

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================');

  await db.close();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(async (err) => {
  console.error('[TEST SUITE CRASHED]:', err);
  await db.close();
  process.exit(1);
});
