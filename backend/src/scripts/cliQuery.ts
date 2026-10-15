import http from 'http';

const query = process.argv[2] || `
SELECT 
  c.id AS customer_id,
  c.customer_code,
  c.first_name || ' ' || c.last_name AS full_name,
  c.email,
  c.risk_tier,
  c.kyc_status,
  a.account_number_masked,
  a.balance,
  u.role AS portal_role
FROM customers c
LEFT JOIN accounts a ON c.id = a.customer_id
LEFT JOIN users u ON c.user_id = u.id
ORDER BY c.id;
`;

async function main() {
  console.log('================================================================');
  console.log('>>> FINGUARD AI // SQL QUERY RUNNER & BENCHMARK UTILITY <<<');
  console.log('================================================================');
  console.log(`Executing SQL Query:\n\n${query.trim()}\n`);

  // Step 1: Login to get admin token
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'VeyraRisk@2026' })
  });

  if (!loginRes.ok) {
    throw new Error(`Failed to authenticate with backend: ${loginRes.statusText}`);
  }

  const { token } = (await loginRes.json()) as any;

  // Step 2: Execute raw query
  const start = performance.now();
  const queryRes = await fetch('http://localhost:5000/api/v1/database/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ sql: query })
  });

  const durationMs = (performance.now() - start).toFixed(2);

  if (!queryRes.ok) {
    const err = (await queryRes.json()) as any;
    console.error('[SQL ERROR]:', err.message || err.error);
    process.exit(1);
  }

  const data = (await queryRes.json()) as any;

  if (!data.rows || data.rows.length === 0) {
    console.log('[RESULT] Query executed successfully. 0 rows returned.');
  } else {
    console.table(data.rows);
    console.log(`[PERFORMANCE] ${data.rowCount} row(s) returned | Server execution: ${data.executionMs}ms | Network round-trip: ${durationMs}ms`);
  }
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('[QUERY RUNNER FAILED]:', err.message);
  process.exit(1);
});
