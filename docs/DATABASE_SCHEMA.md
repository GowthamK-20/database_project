# Veyra Risk — Database Architecture & Relational Design Specification

## 1. Relational Rigor & Normalization Formalization

### 1.1 First Normal Form (1NF)
- All attribute values are strictly atomic (scalars: `UUID`, `VARCHAR`, `NUMERIC(14,2)`, `TIMESTAMPTZ`, `INT`).
- Zero repeating groups or comma-separated lists. Compound structures (such as devices bound to customers) are normalized into junction entity tables (`customer_devices`).
- Every table possesses an immutable primary key (`PRIMARY KEY`).

### 1.2 Second Normal Form (2NF)
- All non-key attributes are fully functionally dependent on the primary key, eliminating partial dependencies.
- Junction tables with composite keys (e.g., `customer_devices(customer_id, device_id)`) only store relationship attributes directly dependent on the pair (`is_primary`, `bound_at`).

### 1.3 Third Normal Form (3NF) & Boyce-Codd Normal Form (BCNF)
- Zero transitive dependencies: No non-prime attribute depends on another non-prime attribute.
  - Merchant attributes (`mcc`, `category_name`, `chargeback_ratio`) reside strictly in `merchants`, referenced by `transactions.merchant_id`.
  - Customer KYC attributes (`pan_masked`, `kyc_status`) reside in `customers`, while financial balance and limits reside in `accounts`.
  - Geolocation metrics (`latitude`, `longitude`, `isp`, `is_vpn_or_tor`) reside strictly in `locations`.

---

## 2. Table Dictionary & Schema Constraints

| Table Name | Cardinality / Role | Primary Key | Key Foreign Keys & Integrity Constraints |
|---|---|---|---|
| `users` | System Access / RBAC | `id (TEXT)` | `role IN ('ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER')`, Unique `username`, `email`, `badge_number`. |
| `customers` | KYC / Identity | `id (TEXT)` | Masked PAN, unique `customer_code`, `risk_tier IN ('LOW','MEDIUM','HIGH','CRITICAL')`. |
| `accounts` | Banking Ledgers | `id (TEXT)` | `customer_id -> customers(id) ON DELETE RESTRICT`, `balance >= 0.00`, Unique `account_hash`. |
| `devices` | Hardware Telemetry | `id (TEXT)` | Unique `device_fingerprint`, `trust_score BETWEEN 0 AND 100`. |
| `customer_devices` | Hardware Binding (M:N) | Composite `(customer_id, device_id)` | Foreign keys with `ON DELETE CASCADE`. |
| `locations` | IP & Geolocation | `id (TEXT)` | Stores IP, ISP, Coordinates, `is_vpn_or_tor`. |
| `merchants` | Counterparties | `id (TEXT)` | `mcc`, `chargeback_ratio`, `risk_level IN ('LOW','MEDIUM','HIGH','PROHIBITED')`. |
| `transactions` | Core Financial Ledger | `id (TEXT)` | `amount > 0`, `account_id -> accounts(id)`, `status IN ('SUCCESS','PENDING_REVIEW','BLOCKED','FAILED')`. |
| `risk_rules` | Detection Rule Engine | `id (TEXT)` | `weight_score BETWEEN 1 AND 100`, JSONB AST condition expressions. |
| `risk_assessments` | Evaluated Scoring | `id (TEXT)` | `transaction_id -> transactions(id) ON DELETE CASCADE`, `risk_score BETWEEN 0 AND 100`. |
| `transaction_risk_factors` | Explainability Vectors | `id (TEXT)` | `risk_assessment_id -> risk_assessments(id)`, score contribution points. |
| `fraud_alerts` | Operational Triage Queue | `id (TEXT)` | `transaction_id -> transactions(id)`, `assigned_to -> users(id)`, `sla_due_at`. |
| `fraud_cases` | Forensic Dossiers | `id (TEXT)` | `primary_alert_id -> fraud_alerts(id)`, `assigned_analyst_id -> users(id)`. |
| `case_notes` | Investigation Timeline | `id (TEXT)` | `case_id -> fraud_cases(id) ON DELETE CASCADE`, author attribution. |
| `case_evidence` | Pinned Evidence Locker | `id (TEXT)` | `case_id -> fraud_cases(id)`, typed references (`TRANSACTION`, `DEVICE`). |
| `audit_logs` | Immutable Ledger | `id (BIGSERIAL)` | Append-only. Captures old/new JSONB states, user badge, IP, timestamp. |

---

## 3. Database Views & Trigger Functions

### 3.1 Analytical Views
1. **`view_transaction_risk_summary`**: Denormalizes transactions across customers, accounts, devices, locations, merchants, and risk assessments for sub-millisecond table lookups.
2. **`view_alert_queue`**: Computes `sla_remaining_minutes` dynamically against `CURRENT_TIMESTAMP` for the SOC console.
3. **`view_mule_ring_candidates`**: Executes relational aggregation (`HAVING COUNT(DISTINCT cd.customer_id) > 1`) to discover hardware sharing across accounts.
4. **`view_analyst_workload`**: Aggregates active cases, active alerts, and confirmed fraud metrics per operational user.

### 3.2 Stored Functions & Triggers
1. **`fn_audit_case_mutation()` & `trg_audit_fraud_cases`**:
   - `AFTER INSERT OR UPDATE ON fraud_cases`
   - Automatically serializes `to_jsonb(OLD)` and `to_jsonb(NEW)` into `audit_logs` guaranteeing tamper-evident records.
2. **`fn_touch_account_activity()` & `trg_touch_account_activity`**:
   - `AFTER INSERT ON transactions`
   - Atomically updates `accounts.last_activity_at = NEW.timestamp`.
