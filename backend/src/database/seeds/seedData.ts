import bcrypt from 'bcryptjs';
import { db } from '../db.js';

export async function runSeeds() {
  console.log('[SEED] Starting Veyra Risk seed data generation...');
  await db.init();

  const passwordHash = await bcrypt.hash('VeyraRisk@2026', 10);

  // 1. SEED OPERATIONAL USERS
  console.log('[SEED] Seeding users with RBAC roles...');
  const users = [
    {
      id: 'USR-ADMIN-01',
      username: 'admin',
      email: 'admin@veyrarisk.internal',
      full_name: 'Siddharth Varma',
      role: 'ADMIN',
      badge_number: 'BADGE-ADM-01',
    },
    {
      id: 'USR-ANL-101',
      username: 'rahul.sharma',
      email: 'rahul.sharma@veyrarisk.internal',
      full_name: 'Rahul Sharma',
      role: 'FRAUD_ANALYST',
      badge_number: 'BADGE-ANL-101',
    },
    {
      id: 'USR-MGR-201',
      username: 'priya.nair',
      email: 'priya.nair@veyrarisk.internal',
      full_name: 'Priya Nair',
      role: 'RISK_MANAGER',
      badge_number: 'BADGE-MGR-201',
    },
    {
      id: 'USR-CMP-301',
      username: 'amit.patel',
      email: 'amit.patel@veyrarisk.internal',
      full_name: 'Amit Patel',
      role: 'COMPLIANCE_ANALYST',
      badge_number: 'BADGE-CMP-301',
    },
    {
      id: 'USR-CUST-803',
      username: 'rohan.gupta',
      email: 'rohan.g@techcorp.io',
      full_name: 'Rohan Gupta',
      role: 'CUSTOMER',
      badge_number: 'BADGE-CUST-803',
    },
    {
      id: 'USR-CUST-807',
      username: 'sunita.rao',
      email: 'sunita.rao@rediffmail.com',
      full_name: 'Sunita Rao',
      role: 'CUSTOMER',
      badge_number: 'BADGE-CUST-807',
    },
    {
      id: 'USR-CUST-801',
      username: 'ananya.deshmukh',
      email: 'ananya.d@gmail.com',
      full_name: 'Ananya Deshmukh',
      role: 'CUSTOMER',
      badge_number: 'BADGE-CUST-801',
    },
  ];

  for (const u of users) {
    await db.query(`
      INSERT INTO users (id, username, email, password_hash, full_name, role, badge_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE 
      SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash;
    `, [u.id, u.username, u.email, passwordHash, u.full_name, u.role, u.badge_number]);
  }

  // 2. SEED RISK RULES
  console.log('[SEED] Seeding deterministic risk rules...');
  const rules = [
    {
      id: 'RULE-VEL-01',
      rule_code: 'RULE_VELOCITY_RAPID',
      name: 'High-Frequency Rapid Velocity',
      description: 'More than 3 transactions originating within a 10-minute sliding window.',
      condition_expression: { window_minutes: 10, threshold_count: 3 },
      weight_score: 25,
      severity: 'HIGH',
    },
    {
      id: 'RULE-VAL-02',
      rule_code: 'RULE_UNUSUAL_HIGH_VALUE',
      name: 'High-Value Outlier Transaction',
      description: 'Transaction amount exceeds ₹1,00,000 or exceeds 5x customer historical average.',
      condition_expression: { absolute_threshold: 100000, baseline_multiplier: 5.0 },
      weight_score: 30,
      severity: 'HIGH',
    },
    {
      id: 'RULE-DEV-03',
      rule_code: 'RULE_NEW_DEVICE_NIGHT',
      name: 'Unregistered Device During Night Window',
      description: 'Transaction initiated between 01:00 AM and 05:00 AM IST from an unverified device fingerprint.',
      condition_expression: { start_hour: 1, end_hour: 5, new_device: true },
      weight_score: 30,
      severity: 'CRITICAL',
    },
    {
      id: 'RULE-GEO-04',
      rule_code: 'RULE_GEO_LEAP',
      name: 'Impossible Travel / Geolocation Leap',
      description: 'Physical location change exceeding 500 km within less than 60 minutes.',
      condition_expression: { min_distance_km: 500, max_time_minutes: 60 },
      weight_score: 35,
      severity: 'CRITICAL',
    },
    {
      id: 'RULE-MERCH-05',
      rule_code: 'RULE_HIGH_RISK_MERCHANT',
      name: 'High-Risk Merchant / Prohibited MCC',
      description: 'Transactions routed to crypto exchanges, offshore gaming, or MCCs with >3% chargeback ratio.',
      condition_expression: { high_risk_mcc: true, chargeback_threshold: 0.03 },
      weight_score: 20,
      severity: 'MEDIUM',
    },
    {
      id: 'RULE-DORM-06',
      rule_code: 'RULE_DORMANT_REACTIVATED',
      name: 'Sudden Inactive Account Liquidation',
      description: 'Account with no debit activity for >90 days transferring >70% of available balance.',
      condition_expression: { dormant_days: 90, balance_drain_pct: 70 },
      weight_score: 25,
      severity: 'HIGH',
    },
    {
      id: 'RULE-ROOT-07',
      rule_code: 'RULE_ROOTED_DEVICE',
      name: 'Compromised or Rooted Operating System',
      description: 'Transaction initiated from a jailbroken, rooted, or emulator-based environment.',
      condition_expression: { is_rooted: true },
      weight_score: 20,
      severity: 'MEDIUM',
    },
    {
      id: 'RULE-MULE-08',
      rule_code: 'RULE_MULE_RING_RECIPIENT',
      name: 'Known Mule Recipient VPA / Cluster Link',
      description: 'Recipient identifier linked to multiple unrelated originator accounts within 48 hours.',
      condition_expression: { cluster_link_detected: true },
      weight_score: 35,
      severity: 'CRITICAL',
    },
  ];

  for (const r of rules) {
    await db.query(`
      INSERT INTO risk_rules (id, rule_code, name, description, condition_expression, weight_score, severity, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE 
      SET name = EXCLUDED.name, description = EXCLUDED.description, weight_score = EXCLUDED.weight_score, severity = EXCLUDED.severity;
    `, [r.id, r.rule_code, r.name, r.description, JSON.stringify(r.condition_expression), r.weight_score, r.severity, 'USR-MGR-201']);
  }

  // 3. SEED MERCHANTS
  console.log('[SEED] Seeding realistic merchants & counterparties...');
  const merchants = [
    { id: 'M-SWIGGY-01', code: 'MERCH-SWIGGY', name: 'Swiggy Food & Instamart', mcc: '5814', cat: 'Dining & Quick Service', vpa: 'swiggy.orders@icici', risk: 'LOW', cb: 0.001 },
    { id: 'M-AMZN-02', code: 'MERCH-AMAZON', name: 'Amazon India Payments', mcc: '5311', cat: 'E-Commerce Marketplace', vpa: 'amazon.pay@axis', risk: 'LOW', cb: 0.002 },
    { id: 'M-ZOMATO-03', code: 'MERCH-ZOMATO', name: 'Zomato Online Ordering', mcc: '5812', cat: 'Food Delivery', vpa: 'zomato.merchant@hdfc', risk: 'LOW', cb: 0.0015 },
    { id: 'M-FLIP-04', code: 'MERCH-FLIPKART', name: 'Flipkart Internet Private Ltd', mcc: '5311', cat: 'E-Commerce Marketplace', vpa: 'flipkart.payments@yesbank', risk: 'LOW', cb: 0.0025 },
    { id: 'M-CRYPTO-05', code: 'MERCH-VAULTEX', name: 'VaulteX Offshore Virtual Assets', mcc: '6051', cat: 'Non-Financial Quasi-Cash', vpa: 'vaultex.crypto@international', risk: 'HIGH', cb: 0.048 },
    { id: 'M-JEWEL-06', code: 'MERCH-TANISHQ', name: 'Tanishq Flagship Mumbai', mcc: '5944', cat: 'Jewelry & Precious Metals', vpa: 'tanishq.mumbai@sbi', risk: 'MEDIUM', cb: 0.005 },
    { id: 'M-MULE-07', code: 'MERCH-PEERPAY', name: 'FastPayouts Direct VPA', mcc: '8999', cat: 'Unclassified P2P Gateway', vpa: 'karan.mule99@okaxis', risk: 'HIGH', cb: 0.062 },
  ];

  for (const m of merchants) {
    await db.query(`
      INSERT INTO merchants (id, merchant_code, name, category_code, category_name, vpa_handle, risk_level, chargeback_ratio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE 
      SET name = EXCLUDED.name, risk_level = EXCLUDED.risk_level, chargeback_ratio = EXCLUDED.chargeback_ratio;
    `, [m.id, m.code, m.name, m.mcc, m.cat, m.vpa, m.risk, m.cb]);
  }

  // 4. SEED LOCATIONS
  console.log('[SEED] Seeding network locations...');
  const locations = [
    { id: 'LOC-MUM-01', city: 'Mumbai', state: 'Maharashtra', ip: '49.36.128.44', isp: 'Reliance Jio Infocomm', vpn: false, lat: 19.0760, lon: 72.8777 },
    { id: 'LOC-BLR-02', city: 'Bengaluru', state: 'Karnataka', ip: '106.51.72.19', isp: 'Bharti Airtel Broadband', vpn: false, lat: 12.9716, lon: 77.5946 },
    { id: 'LOC-DEL-03', city: 'New Delhi', state: 'Delhi NCR', ip: '122.161.49.202', isp: 'ACT Fibernet', vpn: false, lat: 28.6139, lon: 77.2090 },
    { id: 'LOC-HYD-04', city: 'Hyderabad', state: 'Telangana', ip: '183.82.111.4', isp: 'Hathway Cable', vpn: false, lat: 17.3850, lon: 78.4867 },
    { id: 'LOC-JAI-05', city: 'Jaipur', state: 'Rajasthan', ip: '43.242.176.88', isp: 'Excitel Broadband', vpn: false, lat: 26.9124, lon: 75.7873 },
    { id: 'LOC-LON-06', city: 'London', state: 'Greater London', ip: '185.220.101.5', isp: 'Datacenter Transit Host', vpn: true, lat: 51.5074, lon: -0.1278 },
  ];

  for (const loc of locations) {
    await db.query(`
      INSERT INTO locations (id, city, state, ip_address, ip_isp, is_vpn_or_tor, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
    `, [loc.id, loc.city, loc.state, loc.ip, loc.isp, loc.vpn, loc.lat, loc.lon]);
  }

  // 5. SEED HARDWARE DEVICES
  console.log('[SEED] Seeding hardware device fingerprints...');
  const devices = [
    { id: 'DEV-IPH-01', fp: 'fp_a94f1c9028e1837d991', type: 'MOBILE_IOS', os: 'iOS 17.5.1', br: 'Mobile Safari', rooted: false, trust: 95 },
    { id: 'DEV-SMG-02', fp: 'fp_c88319e74bb0147e822', type: 'MOBILE_ANDROID', os: 'Android 14 (OneUI 6.1)', br: 'Chrome Mobile 128', rooted: false, trust: 88 },
    { id: 'DEV-MAC-03', fp: 'fp_3f0982bb901e8200143', type: 'WEB_DESKTOP', os: 'macOS Sonoma 14.6', br: 'Chrome 128', rooted: false, trust: 92 },
    { id: 'DEV-ROOT-04', fp: 'fp_mule_shared_device_99', type: 'MOBILE_ANDROID', os: 'LineageOS 21 (Custom)', br: 'Custom WebView', rooted: true, trust: 15 }, // SHARED MULE DEVICE
    { id: 'DEV-WIN-05', fp: 'fp_e1208a99cc1289fe401', type: 'WEB_DESKTOP', os: 'Windows 11 Enterprise', br: 'Edge 128', rooted: false, trust: 90 },
  ];

  for (const d of devices) {
    await db.query(`
      INSERT INTO devices (id, device_fingerprint, device_type, os_version, browser, is_rooted_or_jailbroken, trust_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE 
      SET trust_score = EXCLUDED.trust_score, is_rooted_or_jailbroken = EXCLUDED.is_rooted_or_jailbroken;
    `, [d.id, d.fp, d.type, d.os, d.br, d.rooted, d.trust]);
  }

  // 6. SEED CUSTOMERS & ACCOUNTS
  console.log('[SEED] Seeding realistic Indian customers and bank accounts...');
  const customers = [
    { id: 'CUST-001', userId: 'USR-CUST-801', code: 'CUST-IND-801', fn: 'Ananya', ln: 'Deshmukh', em: 'ananya.d@gmail.com', ph: '+91 98201 ••••2', pan: 'ABCDE1234F', kyc: 'VERIFIED', tier: 'LOW' },
    { id: 'CUST-002', userId: null, code: 'CUST-IND-802', fn: 'Vikram', ln: 'Mehta', em: 'vikram.m@corporatesolutions.in', ph: '+91 98112 ••••5', pan: 'BCDEF2345G', kyc: 'VERIFIED', tier: 'LOW' },
    { id: 'CUST-003', userId: 'USR-CUST-803', code: 'CUST-IND-803', fn: 'Rohan', ln: 'Gupta', em: 'rohan.g@techcorp.io', ph: '+91 97410 ••••9', pan: 'CDEFG3456H', kyc: 'VERIFIED', tier: 'MEDIUM' },
    // MULE RING SUSPECTS
    { id: 'CUST-004', userId: null, code: 'CUST-IND-804', fn: 'Deepak', ln: 'Verma', em: 'deepak.v91@yahoo.com', ph: '+91 91234 ••••0', pan: 'DEFGH4567J', kyc: 'PENDING', tier: 'CRITICAL' },
    { id: 'CUST-005', userId: null, code: 'CUST-IND-805', fn: 'Suraj', ln: 'Yadav', em: 'suraj.yadav@fastmail.com', ph: '+91 91234 ••••1', pan: 'EFGHI5678K', kyc: 'FLAGGED', tier: 'CRITICAL' },
    { id: 'CUST-006', userId: null, code: 'CUST-IND-806', fn: 'Manish', ln: 'Tiwari', em: 'manish.t@inbox.ru', ph: '+91 91234 ••••2', pan: 'FGHIJ6789L', kyc: 'FLAGGED', tier: 'CRITICAL' },
    // DORMANT PROFILE
    { id: 'CUST-007', userId: 'USR-CUST-807', code: 'CUST-IND-807', fn: 'Sunita', ln: 'Rao', em: 'sunita.rao@rediffmail.com', ph: '+91 99887 ••••3', pan: 'GHIJK7890M', kyc: 'VERIFIED', tier: 'HIGH' },
  ];

  for (const c of customers) {
    await db.query(`
      INSERT INTO customers (id, user_id, customer_code, first_name, last_name, email, phone_masked, phone_hash, pan_masked, kyc_status, risk_tier)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE 
      SET risk_tier = EXCLUDED.risk_tier, kyc_status = EXCLUDED.kyc_status, user_id = EXCLUDED.user_id;
    `, [c.id, c.userId, c.code, c.fn, c.ln, c.em, c.ph, `hash_${c.id}`, c.pan, c.kyc, c.tier]);
  }

  // Bind devices to customers (Notice DEV-ROOT-04 is intentionally bound to CUST-004, CUST-005, CUST-006 -> MULE RING!)
  await db.query(`
    INSERT INTO customer_devices (customer_id, device_id, is_primary) VALUES
    ('CUST-001', 'DEV-IPH-01', true),
    ('CUST-002', 'DEV-MAC-03', true),
    ('CUST-003', 'DEV-SMG-02', true),
    ('CUST-004', 'DEV-ROOT-04', true),
    ('CUST-005', 'DEV-ROOT-04', true),
    ('CUST-006', 'DEV-ROOT-04', true),
    ('CUST-007', 'DEV-WIN-05', true)
    ON CONFLICT (customer_id, device_id) DO NOTHING;
  `);

  // Accounts
  const accounts = [
    { id: 'ACC-001', cust: 'CUST-001', mask: '•••• •••• •••• 4912', hash: 'acc_hash_001', type: 'SAVINGS', bal: 345000.00, limit: 100000.00, stat: 'ACTIVE' },
    { id: 'ACC-002', cust: 'CUST-002', mask: '•••• •••• •••• 8821', hash: 'acc_hash_002', type: 'CURRENT', bal: 1850000.00, limit: 1000000.00, stat: 'ACTIVE' },
    { id: 'ACC-003', cust: 'CUST-003', mask: '•••• •••• •••• 1147', hash: 'acc_hash_003', type: 'SAVINGS', bal: 82000.00, limit: 50000.00, stat: 'ACTIVE' },
    // Mule accounts
    { id: 'ACC-004', cust: 'CUST-004', mask: '•••• •••• •••• 9901', hash: 'acc_hash_004', type: 'SAVINGS', bal: 12000.00, limit: 200000.00, stat: 'ACTIVE' },
    { id: 'ACC-005', cust: 'CUST-005', mask: '•••• •••• •••• 9902', hash: 'acc_hash_005', type: 'SAVINGS', bal: 8500.00, limit: 200000.00, stat: 'ACTIVE' },
    { id: 'ACC-006', cust: 'CUST-006', mask: '•••• •••• •••• 9903', hash: 'acc_hash_006', type: 'SAVINGS', bal: 14000.00, limit: 200000.00, stat: 'ACTIVE' },
    // Dormant account
    { id: 'ACC-007', cust: 'CUST-007', mask: '•••• •••• •••• 3290', hash: 'acc_hash_007', type: 'SAVINGS', bal: 480000.00, limit: 500000.00, stat: 'DORMANT' },
  ];

  for (const a of accounts) {
    await db.query(`
      INSERT INTO accounts (id, customer_id, account_number_masked, account_hash, account_type, balance, daily_limit, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE 
      SET balance = EXCLUDED.balance, status = EXCLUDED.status;
    `, [a.id, a.cust, a.mask, a.hash, a.type, a.bal, a.limit, a.stat]);
  }

  // 7. SEED HIGH-FIDELITY TRANSACTIONS WITH DETAILED FORENSIC SCENARIOS
  console.log('[SEED] Seeding realistic transactions and risk assessments...');

  // Helper to add txn + assessment + factors
  async function insertTxn(data: {
    id: string;
    ref: string;
    acc: string;
    merch?: string;
    dev?: string;
    loc?: string;
    channel: string;
    amount: number;
    recipient: string;
    status: string;
    timeOffsetHours: number;
    riskScore: number;
    riskLevel: string;
    flagged: boolean;
    factors: Array<{ ruleId?: string; name: string; score: number; severity: string; details: any }>;
  }) {
    const timestamp = new Date(Date.now() - data.timeOffsetHours * 3600 * 1000).toISOString();

    await db.query(`
      INSERT INTO transactions (id, txn_reference, account_id, merchant_id, device_id, location_id, channel, amount, recipient_identifier, status, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO NOTHING;
    `, [data.id, data.ref, data.acc, data.merch || null, data.dev || null, data.loc || null, data.channel, data.amount, data.recipient, data.status, timestamp]);

    const assessId = `ASSESS-${data.id}`;
    await db.query(`
      INSERT INTO risk_assessments (id, transaction_id, risk_score, risk_level, is_flagged, execution_time_ms)
      VALUES ($1, $2, $3, $4, $5, 4)
      ON CONFLICT (transaction_id) DO UPDATE 
      SET risk_score = EXCLUDED.risk_score, risk_level = EXCLUDED.risk_level, is_flagged = EXCLUDED.is_flagged;
    `, [assessId, data.id, data.riskScore, data.riskLevel, data.flagged]);

    for (const f of data.factors) {
      const factorId = `FCT-${data.id}-${f.score}-${Math.floor(Math.random() * 10000)}`;
      await db.query(`
        INSERT INTO transaction_risk_factors (id, risk_assessment_id, rule_id, factor_name, score_contribution, severity, details)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `, [factorId, assessId, f.ruleId || null, f.name, f.score, f.severity, JSON.stringify(f.details)]);
    }
  }

  // --- CRITICAL SCENARIO 1: Midnight Velocity Burst on Dormant Account ---
  await insertTxn({
    id: 'TXN-2026-9001',
    ref: 'TXN-IND-994012',
    acc: 'ACC-007',
    merch: 'M-CRYPTO-05',
    dev: 'DEV-ROOT-04',
    loc: 'LOC-JAI-05',
    channel: 'UPI',
    amount: 380000.00,
    recipient: 'vaultex.crypto@international',
    status: 'BLOCKED',
    timeOffsetHours: 0.3, // 18 mins ago
    riskScore: 92,
    riskLevel: 'CRITICAL',
    flagged: true,
    factors: [
      { ruleId: 'RULE-VAL-02', name: 'High-Value Outlier Transaction', score: 30, severity: 'HIGH', details: { amount: 380000, avg_baseline: 4200 } },
      { ruleId: 'RULE-DEV-03', name: 'Unregistered Device During Night Window', score: 30, severity: 'CRITICAL', details: { observed_hour: '02:45 IST', device: 'Unregistered Android' } },
      { ruleId: 'RULE-DORM-06', name: 'Sudden Inactive Account Liquidation', score: 25, severity: 'HIGH', details: { dormant_days: 180, drain_pct: 79.1 } },
      { ruleId: 'RULE-MERCH-05', name: 'High-Risk Offshore Quasi-Cash Merchant', score: 20, severity: 'MEDIUM', details: { mcc: '6051', chargeback: '4.8%' } },
    ],
  });

  // --- CRITICAL SCENARIO 2: Mule Ring Outflow 1 ---
  await insertTxn({
    id: 'TXN-2026-9002',
    ref: 'TXN-IND-994013',
    acc: 'ACC-004',
    merch: 'M-MULE-07',
    dev: 'DEV-ROOT-04',
    loc: 'LOC-DEL-03',
    channel: 'IMPS',
    amount: 195000.00,
    recipient: 'karan.mule99@okaxis',
    status: 'PENDING_REVIEW',
    timeOffsetHours: 0.8,
    riskScore: 88,
    riskLevel: 'CRITICAL',
    flagged: true,
    factors: [
      { ruleId: 'RULE-MULE-08', name: 'Known Mule Recipient VPA Link', score: 35, severity: 'CRITICAL', details: { recipient: 'karan.mule99@okaxis', cluster_size: 3 } },
      { ruleId: 'RULE-ROOT-07', name: 'Compromised or Rooted Operating System', score: 20, severity: 'MEDIUM', details: { os: 'LineageOS 21 (Custom)' } },
      { ruleId: 'RULE-VAL-02', name: 'High-Value Outlier Transaction', score: 30, severity: 'HIGH', details: { amount: 195000, baseline: 12000 } },
    ],
  });

  // --- CRITICAL SCENARIO 2 (B): Mule Ring Outflow 2 ---
  await insertTxn({
    id: 'TXN-2026-9003',
    ref: 'TXN-IND-994014',
    acc: 'ACC-005',
    merch: 'M-MULE-07',
    dev: 'DEV-ROOT-04',
    loc: 'LOC-DEL-03',
    channel: 'UPI',
    amount: 189000.00,
    recipient: 'karan.mule99@okaxis',
    status: 'PENDING_REVIEW',
    timeOffsetHours: 1.1,
    riskScore: 86,
    riskLevel: 'CRITICAL',
    flagged: true,
    factors: [
      { ruleId: 'RULE-MULE-08', name: 'Known Mule Recipient VPA Link', score: 35, severity: 'CRITICAL', details: { recipient: 'karan.mule99@okaxis', cluster_size: 3 } },
      { ruleId: 'RULE-ROOT-07', name: 'Compromised or Rooted Operating System', score: 20, severity: 'MEDIUM', details: { os: 'LineageOS 21' } },
    ],
  });

  // --- HIGH SCENARIO 3: Impossible Geolocation Leap ---
  await insertTxn({
    id: 'TXN-2026-9004',
    ref: 'TXN-IND-994015',
    acc: 'ACC-003',
    dev: 'DEV-WIN-05',
    loc: 'LOC-LON-06',
    channel: 'CARD_ECOM',
    amount: 72000.00,
    recipient: 'luxury-intl-goods.uk',
    status: 'PENDING_REVIEW',
    timeOffsetHours: 1.7,
    riskScore: 78,
    riskLevel: 'HIGH',
    flagged: true,
    factors: [
      { ruleId: 'RULE-GEO-04', name: 'Impossible Travel / Geolocation Leap', score: 35, severity: 'CRITICAL', details: { distance_km: 7190, time_elapsed_mins: 22, prev_city: 'Bengaluru', curr_city: 'London' } },
      { ruleId: 'RULE-VAL-02', name: 'Transaction Exceeds Daily Limit Pattern', score: 30, severity: 'HIGH', details: { amount: 72000, limit: 50000 } },
    ],
  });

  // --- BENIGN SCENARIO 4: Legitimate Corporate Supplier Transfer (False Positive Candidate) ---
  await insertTxn({
    id: 'TXN-2026-9005',
    ref: 'TXN-IND-994016',
    acc: 'ACC-002',
    merch: 'M-AMZN-02',
    dev: 'DEV-MAC-03',
    loc: 'LOC-MUM-01',
    channel: 'NEFT',
    amount: 450000.00,
    recipient: 'amazon.procurement@axis',
    status: 'SUCCESS',
    timeOffsetHours: 3.5,
    riskScore: 32,
    riskLevel: 'LOW',
    flagged: false,
    factors: [
      { ruleId: 'RULE-VAL-02', name: 'High-Value Corporate Settlement', score: 30, severity: 'LOW', details: { amount: 450000, account_type: 'CURRENT' } },
    ],
  });

  // --- NORMAL EVERYDAY TRANSACTIONS (Batch Seed) ---
  const normalTxns = [
    { id: 'TXN-2026-9006', ref: 'TXN-IND-994017', acc: 'ACC-001', merch: 'M-SWIGGY-01', dev: 'DEV-IPH-01', loc: 'LOC-MUM-01', ch: 'UPI', amt: 640.00, rec: 'swiggy.orders@icici', hours: 4.2 },
    { id: 'TXN-2026-9007', ref: 'TXN-IND-994018', acc: 'ACC-001', merch: 'M-ZOMATO-03', dev: 'DEV-IPH-01', loc: 'LOC-MUM-01', ch: 'UPI', amt: 1250.00, rec: 'zomato.merchant@hdfc', hours: 6.5 },
    { id: 'TXN-2026-9008', ref: 'TXN-IND-994019', acc: 'ACC-002', merch: 'M-FLIP-04', dev: 'DEV-MAC-03', loc: 'LOC-MUM-01', ch: 'CARD_POS', amt: 14999.00, rec: 'flipkart.payments@yesbank', hours: 7.1 },
    { id: 'TXN-2026-9009', ref: 'TXN-IND-994020', acc: 'ACC-003', merch: 'M-SWIGGY-01', dev: 'DEV-SMG-02', loc: 'LOC-BLR-02', ch: 'UPI', amt: 420.00, rec: 'swiggy.orders@icici', hours: 9.0 },
    { id: 'TXN-2026-9010', ref: 'TXN-IND-994021', acc: 'ACC-001', merch: 'M-JEWEL-06', dev: 'DEV-IPH-01', loc: 'LOC-MUM-01', ch: 'UPI', amt: 48500.00, rec: 'tanishq.mumbai@sbi', hours: 11.4 },
    { id: 'TXN-2026-9011', ref: 'TXN-IND-994022', acc: 'ACC-003', merch: 'M-AMZN-02', dev: 'DEV-SMG-02', loc: 'LOC-BLR-02', ch: 'CARD_ECOM', amt: 3200.00, rec: 'amazon.pay@axis', hours: 14.2 },
    { id: 'TXN-2026-9012', ref: 'TXN-IND-994023', acc: 'ACC-002', merch: 'M-AMZN-02', dev: 'DEV-MAC-03', loc: 'LOC-MUM-01', ch: 'RTGS', amt: 890000.00, rec: 'corporate.vendor@hdfc', hours: 18.0 },
  ];

  for (const n of normalTxns) {
    await insertTxn({
      id: n.id,
      ref: n.ref,
      acc: n.acc,
      merch: n.merch,
      dev: n.dev,
      loc: n.loc,
      channel: n.ch,
      amount: n.amt,
      recipient: n.rec,
      status: 'SUCCESS',
      timeOffsetHours: n.hours,
      riskScore: Math.floor(Math.random() * 18) + 4,
      riskLevel: 'SAFE',
      flagged: false,
      factors: [],
    });
  }

  // 8. SEED FRAUD ALERTS & CASES
  console.log('[SEED] Seeding active alerts and investigation cases...');

  // Alert 1 (Critical Midnight Dormant Account)
  await db.query(`
    INSERT INTO fraud_alerts (id, alert_code, transaction_id, severity, status, assigned_to, sla_due_at, created_at)
    VALUES (
      'ALT-2026-001', 'ALT-IND-9011', 'TXN-2026-9001', 'CRITICAL', 'INVESTIGATING', 'USR-ANL-101', 
      CURRENT_TIMESTAMP + INTERVAL '25 minutes', CURRENT_TIMESTAMP - INTERVAL '18 minutes'
    ) ON CONFLICT (id) DO NOTHING;
  `);

  // Alert 2 (Mule Outflow 1)
  await db.query(`
    INSERT INTO fraud_alerts (id, alert_code, transaction_id, severity, status, assigned_to, sla_due_at, created_at)
    VALUES (
      'ALT-2026-002', 'ALT-IND-9012', 'TXN-2026-9002', 'CRITICAL', 'NEW', NULL, 
      CURRENT_TIMESTAMP + INTERVAL '12 minutes', CURRENT_TIMESTAMP - INTERVAL '48 minutes'
    ) ON CONFLICT (id) DO NOTHING;
  `);

  // Alert 3 (Geo Leap)
  await db.query(`
    INSERT INTO fraud_alerts (id, alert_code, transaction_id, severity, status, assigned_to, sla_due_at, created_at)
    VALUES (
      'ALT-2026-003', 'ALT-IND-9013', 'TXN-2026-9004', 'HIGH', 'ACKNOWLEDGED', 'USR-ANL-101', 
      CURRENT_TIMESTAMP + INTERVAL '45 minutes', CURRENT_TIMESTAMP - INTERVAL '102 minutes'
    ) ON CONFLICT (id) DO NOTHING;
  `);

  // Fraud Case 1 (Assigned to Rahul Sharma)
  await db.query(`
    INSERT INTO fraud_cases (id, case_number, title, priority, status, assigned_analyst_id, primary_alert_id, estimated_exposure)
    VALUES (
      'CASE-2026-101', 'CASE-IND-401', 'Suspicious Midnight Account Drainage (Jaipur/Offshore)', 
      'P1_CRITICAL', 'IN_REVIEW', 'USR-ANL-101', 'ALT-2026-001', 380000.00
    ) ON CONFLICT (id) DO NOTHING;
  `);

  // Case Notes & Evidence
  await db.query(`
    INSERT INTO case_notes (id, case_id, author_id, content) VALUES
    ('NOTE-01', 'CASE-2026-101', 'USR-ANL-101', 'Alert received at 02:46 AM IST. Customer Sunita Rao has had zero debit activity since April 2026. IP belongs to an unfamiliar Excitel broadband node in Jaipur while customer address is registered in Mumbai.'),
    ('NOTE-02', 'CASE-2026-101', 'USR-ANL-101', 'Hardware fingerprint matches a rooted LineageOS device that has appeared on 2 other flagged accounts. Escalating to Risk Manager for account freeze.')
    ON CONFLICT (id) DO NOTHING;
  `);

  await db.query(`
    INSERT INTO case_evidence (id, case_id, evidence_type, reference_id, notes) VALUES
    ('EVD-01', 'CASE-2026-101', 'TRANSACTION', 'TXN-2026-9001', 'Primary flagged transaction of ₹3,80,000 to quasi-cash exchange.'),
    ('EVD-02', 'CASE-2026-101', 'DEVICE', 'DEV-ROOT-04', 'Compromised hardware fingerprint linked across mule network.')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 9. SEED AUDIT LOG
  console.log('[SEED] Seeding forensic audit log entries...');
  await db.query(`
    INSERT INTO audit_logs (user_id, user_badge, action, entity_name, entity_id, old_state, new_state, ip_address) VALUES
    ('USR-ANL-101', 'BADGE-ANL-101', 'ALERT_CLAIMED', 'fraud_alerts', 'ALT-2026-001', '{"status": "NEW"}', '{"status": "INVESTIGATING"}', '192.168.1.104'),
    ('USR-ANL-101', 'BADGE-ANL-101', 'ACCOUNT_HOLD_RECOMMENDED', 'accounts', 'ACC-007', '{"status": "DORMANT"}', '{"status": "DORMANT", "hold_requested": true}', '192.168.1.104');
  `);

  // 10. SEED CARDS
  console.log('[SEED] Seeding payment cards...');
  const cards = [
    { id: 'CARD-001', accId: 'ACC-001', mask: '•••• •••• •••• 1024', hash: 'hash_card_001', type: 'DEBIT', net: 'RUPAY', m: 12, y: 2028, cvv: 'cvv_01', lim: 50000.00, intl: false, nfc: true, stat: 'ACTIVE' },
    { id: 'CARD-002', accId: 'ACC-002', mask: '•••• •••• •••• 5591', hash: 'hash_card_002', type: 'CREDIT', net: 'VISA', m: 8, y: 2029, cvv: 'cvv_02', lim: 200000.00, intl: true, nfc: true, stat: 'ACTIVE' },
    { id: 'CARD-003', accId: 'ACC-003', mask: '•••• •••• •••• 4892', hash: 'hash_card_003', type: 'DEBIT', net: 'MASTERCARD', m: 5, y: 2027, cvv: 'cvv_03', lim: 75000.00, intl: true, nfc: true, stat: 'ACTIVE' },
    { id: 'CARD-004', accId: 'ACC-007', mask: '•••• •••• •••• 8832', hash: 'hash_card_004', type: 'DEBIT', net: 'RUPAY', m: 11, y: 2026, cvv: 'cvv_04', lim: 25000.00, intl: false, nfc: false, stat: 'ACTIVE' },
  ];

  for (const crd of cards) {
    await db.query(`
      INSERT INTO cards (id, account_id, card_number_masked, card_hash, card_type, card_network, expiry_month, expiry_year, cvv_hash, daily_limit, is_international_enabled, is_contactless_enabled, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO NOTHING;
    `, [crd.id, crd.accId, crd.mask, crd.hash, crd.type, crd.net, crd.m, crd.y, crd.cvv, crd.lim, crd.intl, crd.nfc, crd.stat]);
  }

  // Link London Geo-Leap transaction (TXN-2026-9004) to CARD-003
  await db.query(`UPDATE transactions SET card_id = 'CARD-003' WHERE id = 'TXN-2026-9004';`);

  // 11. SEED LOANS & LOAN PAYMENTS
  console.log('[SEED] Seeding loans and payment schedules...');
  const loans = [
    { id: 'LOAN-001', custId: 'CUST-007', accId: 'ACC-007', ref: 'LN-MUM-2024-881', type: 'HOME', prin: 4500000.00, rate: 8.50, tenure: 240, emi: 39052.00, bal: 3420000.00, stat: 'ACTIVE' },
    { id: 'LOAN-002', custId: 'CUST-003', accId: 'ACC-003', ref: 'LN-BLR-2025-412', type: 'PERSONAL', prin: 500000.00, rate: 11.50, tenure: 36, emi: 16498.00, bal: 280000.00, stat: 'ACTIVE' },
  ];

  for (const ln of loans) {
    await db.query(`
      INSERT INTO loans (id, customer_id, account_id, loan_reference, loan_type, principal_amount, interest_rate, tenure_months, emi_amount, outstanding_balance, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO NOTHING;
    `, [ln.id, ln.custId, ln.accId, ln.ref, ln.type, ln.prin, ln.rate, ln.tenure, ln.emi, ln.bal, ln.stat]);
  }

  const loanPayments = [
    { id: 'LPAY-001', loanId: 'LOAN-001', ref: 'PAY-LN-881-01', inst: 1, amt: 39052.00, prin: 7177.00, int: 31875.00, meth: 'AUTO_DEBIT', stat: 'SUCCESS' },
    { id: 'LPAY-002', loanId: 'LOAN-001', ref: 'PAY-LN-881-02', inst: 2, amt: 39052.00, prin: 7228.00, int: 31824.00, meth: 'AUTO_DEBIT', stat: 'SUCCESS' },
    { id: 'LPAY-003', loanId: 'LOAN-002', ref: 'PAY-LN-412-01', inst: 1, amt: 16498.00, prin: 11706.00, int: 4792.00, meth: 'UPI', stat: 'SUCCESS' },
  ];

  for (const lp of loanPayments) {
    await db.query(`
      INSERT INTO loan_payments (id, loan_id, payment_reference, installment_number, amount_paid, principal_component, interest_component, payment_method, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO NOTHING;
    `, [lp.id, lp.loanId, lp.ref, lp.inst, lp.amt, lp.prin, lp.int, lp.meth, lp.stat]);
  }

  // 12. SEED LOGIN HISTORY (SECURITY AUDITING)
  console.log('[SEED] Seeding authentication and security login history...');
  await db.query(`
    INSERT INTO login_history (user_id, customer_id, identifier_used, ip_address, location_id, device_fingerprint, user_agent, login_status) VALUES
    ('USR-CUST-803', 'CUST-003', 'rohan.g@techcorp.io', '122.175.40.18', 'LOC-BLR-02', 'fp_c88319e74bb0147e822', 'Chrome Mobile 128 (Android 14)', 'SUCCESS'),
    ('USR-CUST-803', 'CUST-003', 'rohan.g@techcorp.io', '185.220.101.5', 'LOC-LON-06', 'fp_unknown_datacenter', 'Headless Chrome / Tor Node', 'SUSPICIOUS_CHALLENGE'),
    ('USR-CUST-807', 'CUST-007', 'sunita.rao@rediffmail.com', '43.242.176.88', 'LOC-JAI-05', 'fp_mule_shared_device_99', 'LineageOS 21 Custom WebView', 'SUSPICIOUS_CHALLENGE');
  `);

  // 13. SEED CUSTOMER NOTIFICATIONS
  console.log('[SEED] Seeding customer in-app notifications...');
  await db.query(`
    INSERT INTO customer_notifications (id, customer_id, title, message, notification_type, severity, is_read, related_account_id) VALUES
    ('NOTIF-001', 'CUST-007', 'URGENT SECURITY ALERT: Protective Account Hold', 'An unusual midnight withdrawal of ₹3,80,000 was initiated from Jaipur. Account ••••3290 has been temporarily frozen for your security.', 'ACCOUNT_FROZEN', 'CRITICAL', false, 'ACC-007'),
    ('NOTIF-002', 'CUST-003', 'SECURITY ALERT: High-Risk Geolocation Leap', 'A transaction attempt of ₹72,000 from London was detected shortly after your Bengaluru login. Transaction has been flagged for analyst review.', 'FRAUD_WARNING', 'WARNING', false, 'ACC-003'),
    ('NOTIF-003', 'CUST-001', 'TRANSACTION SUCCESS: Statement Update', 'Your payment of ₹15,000 via UPI has been processed successfully.', 'TRANSACTION_SUCCESS', 'INFO', true, 'ACC-001')
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log('[SEED] FinGuard AI seed generation completed successfully!');
}
