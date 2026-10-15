# FinGuard AI — Synthetic Banking Dataset Specification & Query Guide

## 1. Overview and Academic Purpose
Stage 2 of **FinGuard AI** introduces a large-scale, referentially intact synthetic banking dataset specifically designed for benchmarking transaction monitoring, risk scoring models, entity resolution, and SQL query performance in an educational DBMS platform.

This dataset replaces placeholder mock arrays with authentic relational records persisted in PostgreSQL/PGlite.

---

## 2. Dataset Scale and Live Record Counts

| Entity Table | Baseline Seed Rows | Synthetic Dataset Import | Total Live Records | Primary Key Format | Foreign Key Targets |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`customers`** | 7 (Demo scenarios) | 1,000 | **1,007** | `CUST-DS-XXXX` / `CUST-00X` | `users(id)` |
| **`accounts`** | 7 (Demo scenarios) | 1,000 | **1,007** | `ACC-DS-XXXX` / `ACC-00X` | `customers(id)` |
| **`transactions`** | 12 (Demo scenarios) | 1,000 | **1,012** | `TXN-DS-XXXX` / `TXN-XXXX` | `accounts(id)`, `merchants(id)`, `devices(id)` |
| **`risk_assessments`** | 12 (Demo scenarios) | 1,000 | **1,012** | `RA-DS-XXXX` / `RA-XXXX` | `transactions(id)` |
| **`cards`** | 4 | — | **4** | `CARD-00X` | `accounts(id)` |
| **`loans`** | 2 | — | **2** | `LOAN-00X` | `customers(id)` |
| **`loan_payments`** | 3 | — | **3** | `LPAY-00X` | `loans(id)` |
| **`login_history`** | 4 | — | **4** | `LOG-00X` | `customers(id)`, `devices(id)` |
| **`customer_notifications`**| 4 | — | **4** | `NOTIF-00X` | `customers(id)` |

---

## 3. Data Integrity & Rejection Metrics
- **Total Records Attempted:** 1,000 customers, 1,000 accounts, 1,000 transactions, 1,000 risk assessments.
- **Total Records Accepted:** 1,000 customers, 1,000 accounts, 1,000 transactions, 1,000 risk assessments.
- **Rejected Records:** **0 (0.00%)**.
- **Referential Integrity Audit:** 
  - `0` orphan transactions missing parent accounts.
  - `0` orphan accounts missing parent customers.
  - `0` unmapped merchant foreign keys.
  - Baseline fraud scenario records (`CUST-001` through `CUST-007` and `TXN-IND-994023`, etc.) remained 100% intact.

---

## 4. Source, Privacy, and Licensing
- **Origin:** Algorithmically generated deterministic synthetic banking data created via `backend/src/scripts/generateDataset.ts`.
- **Privacy Assurance:** Contains **zero Personally Identifiable Information (PII)** and zero actual bank account numbers. PAN numbers follow standard randomized masking patterns (`ABCDE1234F`), phone numbers use reserved non-allocable carrier prefixes (`+91 98200 XXXXX`), and customer names are combinatorially drawn from common Indian first and last names.
- **License:** **CC0 1.0 Universal (Public Domain Dedication) / MIT License**. Free for academic, university grading, research, and non-commercial educational benchmarking.

---

## 5. CSV Schema Mapping

### 5.1 Customers (`database/data/synthetic_customers_1000.csv`)
| CSV Header | SQL Column | Data Type | Notes / Constraints |
| :--- | :--- | :--- | :--- |
| `customer_id` | `id` | `VARCHAR(32)` | Primary Key (`CUST-DS-0001` ... `CUST-DS-1000`) |
| `customer_code` | `customer_code` | `VARCHAR(32)` | Unique business identifier |
| `first_name` | `first_name` | `VARCHAR(64)` | Synthetic given name |
| `last_name` | `last_name` | `VARCHAR(64)` | Synthetic surname |
| `email` | `email` | `VARCHAR(128)` | Domain: `@synthetic-bank.in` |
| `phone_masked` | `phone_masked` | `VARCHAR(20)` | Format: `+91 98XXX XXXXX` |
| `pan_masked` | `pan_masked` | `VARCHAR(16)` | Format: `ABCDE****F` |
| `kyc_status` | `kyc_status` | `VARCHAR(32)` | `VERIFIED`, `PENDING_REVIEW` |
| `risk_tier` | `risk_tier` | `VARCHAR(16)` | `LOW` (70%), `MEDIUM` (20%), `HIGH` (10%) |
| `created_at` | `created_at` | `TIMESTAMP WITH TIME ZONE` | Historical distribution over past 12 months |

### 5.2 Transactions (`database/data/synthetic_transactions_1000.csv`)
| CSV Header | SQL Column | Data Type | Notes / Constraints |
| :--- | :--- | :--- | :--- |
| `transaction_id` | `id` | `VARCHAR(32)` | Primary Key (`TXN-DS-0001` ... `TXN-DS-1000`) |
| `txn_reference` | `txn_reference` | `VARCHAR(64)` | Unique reference (`TXN-REF-DS-XXXX`) |
| `account_id` | `account_id` | `VARCHAR(32)` | Foreign Key -> `accounts(id)` |
| `amount` | `amount` | `NUMERIC(14,2)` | Check constraint: `amount > 0` |
| `currency` | `currency` | `VARCHAR(3)` | Default: `INR` |
| `channel` | `channel` | `VARCHAR(20)` | `UPI` (50%), `IMPS` (20%), `NEFT` (15%), `CARD_ECOM` (10%), `RTGS` (5%) |
| `recipient_identifier` | `recipient_identifier` | `VARCHAR(128)` | Synthetic VPA or account |
| `merchant_id` | `merchant_id` | `VARCHAR(32)` | Foreign Key -> `merchants(id)` (optional) |
| `status` | `status` | `VARCHAR(32)` | `SUCCESS` (90%), `PENDING_REVIEW` (6%), `BLOCKED` (4%) |
| `timestamp` | `timestamp` | `TIMESTAMP WITH TIME ZONE` | Distributed timestamps with velocity clusters |
| `risk_score` | (via `risk_assessments`) | `INTEGER` | Range 0–100 |
| `risk_level` | (via `risk_assessments`) | `VARCHAR(16)` | `SAFE`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |

---

## 6. Accessing Data: 3 Flexible Interfaces

### Interface A: Database Explorer UI (Web)
- Open FinGuard AI at `http://localhost:5173`.
- Navigate to **DATABASE & SQL INTELLIGENCE** -> **Database Explorer** in the sidebar.
- Inspect all **25 tables and views**, search records, sort columns, view primary and foreign key constraints, and switch between live data grids and schema dictionaries.

### Interface B: SQL Query Lab UI (Web)
- Navigate to **DATABASE & SQL INTELLIGENCE** -> **SQL Query Lab**.
- Choose from 8 pre-configured fraud analysis queries or author custom SQL queries.
- Enjoy keyboard execution (`Ctrl + Enter`), read-only safety guardrails (blocking all write operations), CSV exporting, and real-time execution timing in milliseconds.

### Interface C: Command-Line SQL Utility (CLI)
From the `backend/` folder in terminal, run:
```powershell
npm run sql "SELECT count(*) FROM customers;"
npm run sql "SELECT t.txn_reference, t.amount, c.first_name, c.last_name FROM transactions t JOIN accounts a ON t.account_id = a.id JOIN customers c ON a.customer_id = c.id WHERE t.amount >= 200000 ORDER BY t.amount DESC LIMIT 5;"
```
Output is formatted in an ASCII table with execution timing and row count metrics.

---

## 7. Curated Fraud Investigation Queries

### Query 1: High-Value Outlier Transactions
Identifies large financial transfers exceeding ₹1,00,000 for high-risk accounts:
```sql
SELECT 
    t.txn_reference,
    t.amount,
    t.channel,
    t.timestamp,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.risk_tier,
    ra.risk_score,
    ra.risk_level
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
JOIN risk_assessments ra ON t.id = ra.transaction_id
WHERE t.amount >= 100000.00
ORDER BY t.amount DESC
LIMIT 50;
```

### Query 2: Rapid Velocity & High Transaction Frequency
Detects accounts executing multiple transactions within short timeframes:
```sql
SELECT 
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.risk_tier,
    COUNT(t.id) AS transaction_count,
    SUM(t.amount) AS total_volume_inr,
    ROUND(AVG(t.amount), 2) AS avg_transaction_inr
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
GROUP BY c.id, c.customer_code, c.first_name, c.last_name, c.risk_tier
HAVING COUNT(t.id) >= 2
ORDER BY transaction_count DESC, total_volume_inr DESC
LIMIT 25;
```

### Query 3: Multi-Entity 4-Way Join (Transactions, Cards, Accounts, Customers)
Demonstrates complete relational integrity across 4 tables:
```sql
SELECT 
    t.txn_reference,
    t.channel,
    t.amount,
    t.status AS txn_status,
    t.timestamp,
    a.account_number_masked,
    a.account_type,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    cd.card_number_masked,
    cd.card_network
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
LEFT JOIN cards cd ON t.card_id = cd.id
ORDER BY t.timestamp DESC
LIMIT 30;
```

---

## 8. Automated Verification
The test suite in `backend/src/tests/runTests.ts` automatically asserts:
1. Customers count $\ge$ 1,000.
2. Accounts count $\ge$ 1,000.
3. Transactions count $\ge$ 1,000.
4. Risk assessments count $\ge$ 1,000.
5. Zero orphan transactions missing account parents.
6. Zero orphan accounts missing customer parents.
7. Zero transactions with unmapped merchant foreign keys.
8. Security rejection of `DROP`, `DELETE`, `UPDATE`, `INSERT`, and statement chaining.
9. Execution of analytical `SELECT`, `WITH`, and `EXPLAIN` queries.

Run tests at any time with:
```powershell
npm test
```
All **42 automated test assertions** currently pass with zero failures.
