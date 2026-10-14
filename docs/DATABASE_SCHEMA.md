# FinGuard AI — Database Architecture & Relational Design Specification

**Platform:** FinGuard AI — Financial Intelligence & Fraud Detection Platform  
**Target RDBMS:** PostgreSQL (Native PostgreSQL 14+ primary; embedded PGlite WASM zero-config fallback)  
**Relational Rigor:** Normalized to Third Normal Form (3NF) & Boyce-Codd Normal Form (BCNF)  

---

## 1. Relational Rigor & Normalization Formalization

### 1.1 First Normal Form (1NF)
- **Atomicity:** All attribute values are strictly atomic scalars (`VARCHAR`, `NUMERIC(14,2)`, `TIMESTAMPTZ`, `INT`, `BOOLEAN`, `JSONB`).
- **Zero Repeating Groups:** Device-customer bindings and multi-factor rule outputs are normalized into dedicated junction and weak entity tables (`customer_devices`, `transaction_risk_factors`).
- **Primary Keys:** Every entity possesses an immutable primary key (`PRIMARY KEY` on `id` or composite keys on junction tables).

### 1.2 Second Normal Form (2NF)
- **Full Functional Dependency:** All non-key attributes are fully dependent on the primary key, eliminating partial dependencies.
- **Composite Junction Tables:** The `customer_devices(customer_id, device_id)` composite key only contains attributes directly dependent on the relationship (`is_primary`, `bound_at`).

### 1.3 Third Normal Form (3NF) & Boyce-Codd Normal Form (BCNF)
- **Zero Transitive Dependencies:** No non-prime attribute depends on another non-prime attribute.
  - Merchant attributes (`category_name`, `chargeback_ratio`, `risk_level`) reside strictly in `merchants`, referenced via foreign key `transactions.merchant_id`.
  - Customer KYC attributes (`pan_masked`, `kyc_status`, `risk_tier`) reside in `customers`, while financial ledgers reside in `accounts`, cards in `cards`, and credit in `loans`.
  - Geolocation attributes (`city`, `state`, `latitude`, `longitude`, `is_vpn_or_tor`) reside strictly in `locations`.
  - Loan installment tracking is isolated in `loan_payments`, depending strictly on `loan_id`.

---

## 2. Table Dictionary & Schema Constraints (16 Core + 4 Supporting)

| # | Table Name | Category | Primary Key | Key Foreign Keys & Integrity Constraints |
|---|---|---|---|---|
| 1 | `users` | Core: RBAC | `id (TEXT)` | `role IN ('ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER', 'CUSTOMER')`, Unique `username`, `email`, `badge_number`. |
| 2 | `customers` | Core: Identity | `id (TEXT)` | Masked PAN, unique `customer_code`, optional `user_id -> users(id) UNIQUE`, `risk_tier IN ('LOW','MEDIUM','HIGH','CRITICAL')`. |
| 3 | `accounts` | Core: Ledger | `id (TEXT)` | `customer_id -> customers(id) ON DELETE RESTRICT`, `balance >= 0.00`, `daily_limit >= 0.00`, Unique `account_hash`. |
| 4 | `cards` | Core: Payment | `id (TEXT)` | `account_id -> accounts(id) ON DELETE CASCADE`, `expiry_month BETWEEN 1 AND 12`, `card_type IN ('DEBIT','CREDIT','VIRTUAL')`, `status IN ('ACTIVE','BLOCKED','EXPIRED','SUSPENDED')`. |
| 5 | `devices` | Core: Hardware | `id (TEXT)` | Unique `device_fingerprint`, `trust_score BETWEEN 0 AND 100`, `is_rooted_or_jailbroken`. |
| 6 | `customer_devices` | Core: Junction | Composite `(customer_id, device_id)` | Foreign keys to `customers(id)` and `devices(id)` with `ON DELETE CASCADE`. |
| 7 | `locations` | Core: Geolocation | `id (TEXT)` | IP address, ISP, Coordinates (`latitude`, `longitude`), `is_vpn_or_tor`. |
| 8 | `merchants` | Core: Counterparty | `id (TEXT)` | `mcc`, `chargeback_ratio`, `risk_level IN ('LOW','MEDIUM','HIGH','PROHIBITED')`. |
| 9 | `transactions` | Core: Financial | `id (TEXT)` | `amount > 0`, `account_id -> accounts(id)`, optional `card_id -> cards(id)`, `status IN ('SUCCESS','PENDING_REVIEW','BLOCKED','FAILED','REVERSED')`. |
| 10 | `risk_rules` | Core: Detection | `id (TEXT)` | `weight_score BETWEEN 1 AND 100`, `severity IN ('LOW','MEDIUM','HIGH','CRITICAL')`, JSONB AST condition expressions. |
| 11 | `risk_assessments` | Core: Evaluation | `id (TEXT)` | Unique `transaction_id -> transactions(id) ON DELETE CASCADE`, `risk_score BETWEEN 0 AND 100`. |
| 12 | `transaction_risk_factors`| Core: Explainability | `id (TEXT)` | `risk_assessment_id -> risk_assessments(id)`, `rule_id -> risk_rules(id)`, point contribution score. |
| 13 | `fraud_alerts` | Core: SOC Queue | `id (TEXT)` | `transaction_id -> transactions(id)`, `assigned_to -> users(id)`, `sla_due_at`, `status IN ('NEW','ACKNOWLEDGED','INVESTIGATING','ESCALATED','RESOLVED_FRAUD','RESOLVED_FALSE_POSITIVE','DISMISSED')`. |
| 14 | `fraud_cases` | Core: Dossier | `id (TEXT)` | `primary_alert_id -> fraud_alerts(id)`, `assigned_analyst_id -> users(id)`, `priority IN ('P1_CRITICAL','P2_HIGH','P3_MEDIUM','P4_LOW')`. |
| 15 | `case_notes` | Core: Forensic Journal | `id (TEXT)` | `case_id -> fraud_cases(id) ON DELETE CASCADE`, `author_id -> users(id)`. |
| 16 | `case_evidence` | Core: Evidence Locker | `id (TEXT)` | `case_id -> fraud_cases(id) ON DELETE CASCADE`, typed references (`TRANSACTION`, `DEVICE`). |
| 17 | `audit_logs` | Core: Audit Trail | `id (BIGSERIAL)` | Append-only. Captures old/new JSONB states, user badge, IP, timestamp. |
| 18 | `loans` | Supporting: Credit | `id (TEXT)` | `customer_id -> customers(id)`, `account_id -> accounts(id)`, `principal_amount > 0`, `interest_rate >= 0`, `tenure_months > 0`, `outstanding_balance >= 0`. |
| 19 | `loan_payments` | Supporting: Repayment | `id (TEXT)` | `loan_id -> loans(id)`, `installment_number > 0`, `amount_paid > 0`, `principal_component >= 0`, `interest_component >= 0`. |
| 20 | `login_history` | Supporting: Telemetry | `id (BIGSERIAL)` | `user_id -> users(id)`, `customer_id -> customers(id)`, `location_id -> locations(id)`, `login_status IN ('SUCCESS','FAILED_BAD_PASSWORD','FAILED_LOCKED','SUSPICIOUS_CHALLENGE')`. |
| 21 | `customer_notifications` | Supporting: Customer | `id (TEXT)` | `customer_id -> customers(id) ON DELETE CASCADE`, `notification_type IN ('SECURITY_ALERT','FRAUD_WARNING','TRANSACTION_SUCCESS','ACCOUNT_FROZEN','POLICY_UPDATE')`. |

---

## 3. Database Views & Trigger Functions

### 3.1 Analytical Views
1. **`view_transaction_risk_summary`**: Denormalizes transactions across customers, accounts, cards, devices, locations, merchants, and risk assessments for sub-millisecond table lookups.
2. **`view_alert_queue`**: Computes `sla_remaining_minutes` dynamically against `CURRENT_TIMESTAMP` for the SOC console.
3. **`view_mule_ring_candidates`**: Executes relational aggregation (`HAVING COUNT(DISTINCT cd.customer_id) > 1`) to discover hardware sharing across distinct accounts.
4. **`view_analyst_workload`**: Aggregates active cases, active alerts, and confirmed fraud metrics per operational user.
5. **`view_customer_portfolio_summary`**: Aggregates accounts, liquid balances, active cards, loans, and unread security notifications per customer.

### 3.2 Stored Functions & Triggers
1. **`fn_audit_case_mutation()` & `trg_audit_fraud_cases`**:
   - `AFTER INSERT OR UPDATE ON fraud_cases`
   - Automatically serializes `to_jsonb(OLD)` and `to_jsonb(NEW)` into `audit_logs` guaranteeing tamper-evident records.
2. **`fn_touch_account_activity()` & `trg_touch_account_activity`**:
   - `AFTER INSERT ON transactions`
   - Atomically updates `accounts.last_activity_at = NEW.timestamp`.
3. **`fn_audit_user_mutation()` & `trg_audit_users`**:
   - `AFTER UPDATE ON users`
   - Captures role modifications and account deactivations/reactivations in `audit_logs`.
4. **`fn_sync_loan_balance_on_payment()` & `trg_sync_loan_balance`**:
   - `AFTER INSERT ON loan_payments`
   - Atomically decrements `loans.outstanding_balance` by `NEW.principal_component` upon successful payment.

---

## 4. Performance Index Strategy

- **`idx_transactions_account_timestamp`**: Composite `(account_id, timestamp DESC)` for instantaneous customer statement paging.
- **`idx_transactions_card_id`**: Filtered index on `transactions(card_id) WHERE card_id IS NOT NULL` for POS/E-commerce filtering.
- **`idx_customer_devices_device_customer`**: Composite `(device_id, customer_id)` optimizing mule ring graph traversal.
- **`idx_customer_notifications_unread`**: Partial index on `(customer_id, is_read, created_at DESC) WHERE is_read = FALSE`.
- **`idx_login_history_telemetry`**: Composite `(user_id, customer_id, attempted_at DESC)` for account takeover detection.
