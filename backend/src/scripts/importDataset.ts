import fs from 'fs';
import path from 'path';
import { db } from '../database/db.js';

interface ImportSummary {
  customersRead: number;
  customersImported: number;
  accountsImported: number;
  transactionsRead: number;
  transactionsImported: number;
  riskAssessmentsGenerated: number;
  rejectedCount: number;
  rejectionErrors: string[];
}

export async function runDatasetImport(): Promise<ImportSummary> {
  console.log('================================================================');
  console.log('>>> FINGUARD AI // DATASET IMPORT & RECONCILIATION ENGINE <<<');
  console.log('================================================================');

  await db.init();

  const dataDir = path.resolve(process.cwd(), '..', 'database', 'data');
  const customersCsvPath = path.join(dataDir, 'synthetic_customers_1000.csv');
  const transactionsCsvPath = path.join(dataDir, 'synthetic_transactions_1000.csv');

  if (!fs.existsSync(customersCsvPath) || !fs.existsSync(transactionsCsvPath)) {
    throw new Error(`Dataset files not found in ${dataDir}. Run generateDataset first.`);
  }

  const summary: ImportSummary = {
    customersRead: 0,
    customersImported: 0,
    accountsImported: 0,
    transactionsRead: 0,
    transactionsImported: 0,
    riskAssessmentsGenerated: 0,
    rejectedCount: 0,
    rejectionErrors: []
  };

  const startTime = Date.now();

  // ----------------------------------------------------------------------------
  // 1. IMPORT CUSTOMERS & LINKED ACCOUNTS
  // ----------------------------------------------------------------------------
  console.log(`[IMPORT] Reading customers dataset: ${customersCsvPath}`);
  const customerContent = fs.readFileSync(customersCsvPath, 'utf-8');
  const customerLines = customerContent.split('\n').filter(l => l.trim().length > 0);
  const custHeader = customerLines[0].split(',').map(h => h.trim());

  console.log(`[IMPORT] Detected Customer CSV Headers: ${custHeader.join(', ')}`);

  // Batch insert customers and accounts
  for (let i = 1; i < customerLines.length; i++) {
    const cols = customerLines[i].split(',').map(c => c.trim());
    if (cols.length < 14) continue;
    summary.customersRead++;

    const [
      customerId, customerCode, firstName, lastName, email, phoneMasked,
      panMasked, kycStatus, riskTier, accountId, accountType, initialBalance,
      dailyLimit, accountStatus
    ] = cols;

    try {
      // Upsert Customer
      await db.query(`
        INSERT INTO customers (id, customer_code, first_name, last_name, email, phone_masked, phone_hash, pan_masked, kyc_status, risk_tier)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email,
          kyc_status = EXCLUDED.kyc_status,
          risk_tier = EXCLUDED.risk_tier;
      `, [
        customerId,
        customerCode,
        firstName,
        lastName,
        email,
        phoneMasked,
        `hash_${customerId}`,
        panMasked,
        kycStatus,
        riskTier
      ]);
      summary.customersImported++;

      // Upsert Account
      const accNumberMasked = `•••• •••• •••• ${accountId.slice(-4)}`;
      const accHash = `hash_${accountId}`;

      await db.query(`
        INSERT INTO accounts (id, customer_id, account_number_masked, account_hash, account_type, balance, daily_limit, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          balance = EXCLUDED.balance,
          daily_limit = EXCLUDED.daily_limit,
          status = EXCLUDED.status;
      `, [
        accountId,
        customerId,
        accNumberMasked,
        accHash,
        accountType,
        parseFloat(initialBalance),
        parseFloat(dailyLimit),
        accountStatus
      ]);
      summary.accountsImported++;

    } catch (err) {
      summary.rejectedCount++;
      summary.rejectionErrors.push(`Row ${i} (Customer ${customerId}): ${(err as Error).message}`);
    }
  }

  console.log(`[IMPORT] Imported ${summary.customersImported} customers & ${summary.accountsImported} accounts.`);

  // ----------------------------------------------------------------------------
  // 2. IMPORT TRANSACTIONS & EVALUATE RISK
  // ----------------------------------------------------------------------------
  console.log(`[IMPORT] Reading transactions dataset: ${transactionsCsvPath}`);
  const txnContent = fs.readFileSync(transactionsCsvPath, 'utf-8');
  const txnLines = txnContent.split('\n').filter(l => l.trim().length > 0);
  const txnHeader = txnLines[0].split(',').map(h => h.trim());

  console.log(`[IMPORT] Detected Transaction CSV Headers: ${txnHeader.join(', ')}`);

  for (let i = 1; i < txnLines.length; i++) {
    const cols = txnLines[i].split(',').map(c => c.trim());
    if (cols.length < 12) continue;
    summary.transactionsRead++;

    const [
      txnId, txnReference, accountId, channel, amountStr, currency,
      recipientIdentifier, merchantId, deviceId, locationId, status, timestamp
    ] = cols;

    const amount = parseFloat(amountStr);

    try {
      // Validate foreign key existence for account
      const accCheck = await db.query('SELECT id FROM accounts WHERE id = $1', [accountId]);
      if (accCheck.rows.length === 0) {
        throw new Error(`Referenced account ${accountId} does not exist in accounts ledger.`);
      }

      // Upsert Transaction
      await db.query(`
        INSERT INTO transactions (
          id, txn_reference, account_id, channel, amount, currency, 
          recipient_identifier, merchant_id, device_id, location_id, status, timestamp
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          amount = EXCLUDED.amount,
          status = EXCLUDED.status;
      `, [
        txnId,
        txnReference,
        accountId,
        channel,
        amount,
        currency,
        recipientIdentifier,
        merchantId ? merchantId : null,
        deviceId ? deviceId : null,
        locationId ? locationId : null,
        status,
        timestamp
      ]);
      summary.transactionsImported++;

      // Compute deterministic risk score
      let score = 15;
      if (amount > 100000) score += 35;
      else if (amount > 50000) score += 20;

      if (deviceId === 'DEV-ROOT-04') score += 30; // Rooted device
      if (merchantId === 'M-CRYPTO-05' || merchantId === 'M-MULE-07') score += 25; // Prohibited crypto/gambling

      score = Math.min(100, Math.max(0, score));
      let riskLevel = 'SAFE';
      if (score >= 80) riskLevel = 'CRITICAL';
      else if (score >= 60) riskLevel = 'HIGH';
      else if (score >= 35) riskLevel = 'MEDIUM';
      else if (score >= 20) riskLevel = 'LOW';

      const isFlagged = score >= 60;
      const riskAssessmentId = `RA-${txnId}`;

      await db.query(`
        INSERT INTO risk_assessments (id, transaction_id, risk_score, risk_level, is_flagged, evaluated_at, model_version, execution_time_ms)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (transaction_id) DO UPDATE SET
          risk_score = EXCLUDED.risk_score,
          risk_level = EXCLUDED.risk_level,
          is_flagged = EXCLUDED.is_flagged;
      `, [
        riskAssessmentId,
        txnId,
        score,
        riskLevel,
        isFlagged,
        timestamp,
        'FinGuard-Hybrid-Engine-v2.1',
        3
      ]);
      summary.riskAssessmentsGenerated++;

    } catch (err) {
      summary.rejectedCount++;
      summary.rejectionErrors.push(`Row ${i} (Transaction ${txnId}): ${(err as Error).message}`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('================================================================');
  console.log(`[IMPORT COMPLETE] Duration: ${durationSec}s`);
  console.log(`- Customers Read: ${summary.customersRead} | Imported: ${summary.customersImported}`);
  console.log(`- Accounts Imported: ${summary.accountsImported}`);
  console.log(`- Transactions Read: ${summary.transactionsRead} | Imported: ${summary.transactionsImported}`);
  console.log(`- Risk Assessments Generated: ${summary.riskAssessmentsGenerated}`);
  console.log(`- Rejected Records: ${summary.rejectedCount}`);
  if (summary.rejectedCount > 0) {
    console.warn(`[WARNING] First 3 rejections:`, summary.rejectionErrors.slice(0, 3));
  }
  console.log('================================================================');

  return summary;
}

if (process.argv[1]?.endsWith('importDataset.ts') || process.argv[1]?.endsWith('importDataset.js')) {
  runDatasetImport()
    .then(async () => {
      await db.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[IMPORT FAILED]:', err);
      await db.close();
      process.exit(1);
    });
}
