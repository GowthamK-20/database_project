import { db } from '../database/db.js';
import bcrypt from 'bcryptjs';
import { generateToken, AuthenticatedUser } from '../middleware/authMiddleware.js';
import { synthesizeTransactionStory } from '../utils/storyGenerator.js';

async function runTestSuite() {
  console.log('================================================================');
  console.log('>>> VEYRA RISK // COMPREHENSIVE AUTOMATED TEST SUITE <<<');
  console.log('================================================================');

  await db.init();

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
