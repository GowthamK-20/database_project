import fs from 'fs';
import path from 'path';

// Deterministic Pseudo-Random Generator (Linear Congruential Generator)
class SeededRandom {
  private seed: number;
  constructor(seed = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  intBetween(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

const rng = new SeededRandom(20261014);

const firstNames = [
  'Aarav', 'Aditi', 'Alok', 'Amit', 'Ananya', 'Anil', 'Anushka', 'Arjun', 'Bhavna', 'Chetan',
  'Deepa', 'Deepak', 'Divya', 'Gaurav', 'Geeta', 'Harish', 'Isha', 'Jaya', 'Karan', 'Kavita',
  'Madhav', 'Manish', 'Meera', 'Mohit', 'Neha', 'Nikhil', 'Pooja', 'Pranav', 'Priya', 'Rahul',
  'Rajesh', 'Ritu', 'Rohan', 'Rohit', 'Sanjay', 'Santosh', 'Shreya', 'Siddharth', 'Smita', 'Sneha',
  'Suresh', 'Swati', 'Tarun', 'Umesh', 'Varun', 'Vidya', 'Vikas', 'Vikram', 'Vinay', 'Yash'
];

const lastNames = [
  'Agarwal', 'Bansal', 'Bhat', 'Chauhan', 'Deshmukh', 'Gupta', 'Iyer', 'Jain', 'Jha', 'Joshi',
  'Kapoor', 'Khan', 'Kulkarni', 'Kumar', 'Mehta', 'Mishra', 'Mukherjee', 'Nair', 'Patel', 'Patil',
  'Pillai', 'Prasad', 'Rao', 'Reddy', 'Saxena', 'Shah', 'Sharma', 'Singh', 'Sinha', 'Tiwari',
  'Verma', 'Yadav'
];

const cities = [
  { city: 'Mumbai', state: 'Maharashtra', locId: 'LOC-MUM-01' },
  { city: 'Bengaluru', state: 'Karnataka', locId: 'LOC-BLR-02' },
  { city: 'New Delhi', state: 'Delhi', locId: 'LOC-DEL-03' },
  { city: 'Hyderabad', state: 'Telangana', locId: 'LOC-HYD-04' },
  { city: 'Jaipur', state: 'Rajasthan', locId: 'LOC-JAI-05' },
];

const merchants = [
  'M-SWIGGY-01',
  'M-AMZN-02',
  'M-ZOMATO-03',
  'M-FLIP-04',
  'M-CRYPTO-05',
  'M-JEWEL-06',
  'M-MULE-07',
];

const devices = [
  'DEV-IPH-01',
  'DEV-SMG-02',
  'DEV-MAC-03',
  'DEV-WIN-05',
  'DEV-ROOT-04',
];

const channels = ['UPI', 'IMPS', 'NEFT', 'RTGS', 'CARD_POS', 'CARD_ECOM'];
const riskTiers = ['LOW', 'LOW', 'LOW', 'LOW', 'MEDIUM', 'MEDIUM', 'HIGH', 'CRITICAL'];
const kycStatuses = ['VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED', 'PENDING', 'FLAGGED'];

export function generateSyntheticDataset() {
  const outputDir = path.resolve(process.cwd(), '..', 'database', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Generate 1,000 Customers CSV
  const customersFile = path.join(outputDir, 'synthetic_customers_1000.csv');
  const custHeaders = [
    'customer_id',
    'customer_code',
    'first_name',
    'last_name',
    'email',
    'phone_masked',
    'pan_masked',
    'kyc_status',
    'risk_tier',
    'account_id',
    'account_type',
    'initial_balance',
    'daily_limit',
    'account_status'
  ];

  const customerRows: string[] = [custHeaders.join(',')];

  for (let i = 1; i <= 1000; i++) {
    const id = `CUST-DS-${String(i).padStart(4, '0')}`;
    const code = `CUST-IND-${1000 + i}`;
    const fn = rng.choice(firstNames);
    const ln = rng.choice(lastNames);
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@demo-bank.in`;
    const phone = `+91 ${rng.intBetween(90000, 99999)} ••••${rng.intBetween(1, 9)}`;
    const pan = `ABCDE${String(rng.intBetween(1000, 9999))}${rng.choice(['F', 'G', 'H', 'J', 'K'])}`;
    const kyc = rng.choice(kycStatuses);
    const tier = rng.choice(riskTiers);
    const accId = `ACC-DS-${String(i).padStart(4, '0')}`;
    const accType = rng.choice(['SAVINGS', 'SAVINGS', 'CURRENT', 'CREDIT_LINE']);
    const bal = (rng.intBetween(10, 850) * 1000).toFixed(2);
    const lim = (rng.intBetween(50, 200) * 1000).toFixed(2);
    const stat = tier === 'CRITICAL' && rng.next() > 0.7 ? 'FROZEN' : 'ACTIVE';

    customerRows.push([
      id, code, fn, ln, email, phone, pan, kyc, tier, accId, accType, bal, lim, stat
    ].join(','));
  }

  fs.writeFileSync(customersFile, customerRows.join('\n'), 'utf-8');
  console.log(`[GENERATOR] Successfully created: ${customersFile} (1,000 records)`);

  // 2. Generate 1,000 Transactions CSV
  const transactionsFile = path.join(outputDir, 'synthetic_transactions_1000.csv');
  const txnHeaders = [
    'txn_id',
    'txn_reference',
    'account_id',
    'channel',
    'amount',
    'currency',
    'recipient_identifier',
    'merchant_id',
    'device_id',
    'location_id',
    'status',
    'timestamp'
  ];

  const txnRows: string[] = [txnHeaders.join(',')];

  // Base timestamp: 30 days ago to current
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  for (let i = 1; i <= 1000; i++) {
    const id = `TXN-DS-${String(i).padStart(4, '0')}`;
    const ref = `TXN-REF-DS-${String(i).padStart(4, '0')}`;
    // Map to one of the 1,000 accounts
    const accIndex = rng.intBetween(1, 1000);
    const accId = `ACC-DS-${String(accIndex).padStart(4, '0')}`;
    const chan = rng.choice(channels);
    
    // Amount distribution: mostly normal (₹500 - ₹25,000), occasional high-value outliers (₹50,000 - ₹3,50,000)
    let amount: number;
    if (rng.next() < 0.08) {
      amount = rng.intBetween(75, 400) * 1000; // High value outlier
    } else {
      amount = rng.intBetween(5, 450) * 100; // Standard retail payment
    }

    const cur = 'INR';
    const isP2P = chan === 'UPI' && rng.next() > 0.5;
    const recipient = isP2P ? `user${rng.intBetween(100, 999)}@okhdfcbank` : `merchant${rng.intBetween(10, 99)}@pos`;
    const merch = isP2P ? '' : rng.choice(merchants);
    const dev = rng.choice(devices);
    const loc = rng.choice(cities).locId;
    
    // Status
    let status = 'SUCCESS';
    if (amount > 150000 && rng.next() > 0.4) {
      status = 'PENDING_REVIEW';
    } else if (rng.next() < 0.03) {
      status = 'FAILED';
    }

    const txnTime = new Date(now - rng.intBetween(0, thirtyDaysMs)).toISOString();

    txnRows.push([
      id, ref, accId, chan, amount.toFixed(2), cur, recipient, merch, dev, loc, status, txnTime
    ].join(','));
  }

  fs.writeFileSync(transactionsFile, txnRows.join('\n'), 'utf-8');
  console.log(`[GENERATOR] Successfully created: ${transactionsFile} (1,000 records)`);
}

// Execute generator if invoked directly
if (process.argv[1]?.endsWith('generateDataset.ts') || process.argv[1]?.endsWith('generateDataset.js')) {
  generateSyntheticDataset();
}
