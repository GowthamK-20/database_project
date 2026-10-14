-- ==============================================================================
-- FINGUARD AI // FINANCIAL INTELLIGENCE & FRAUD DETECTION PLATFORM
-- DATABASE PERFORMANCE INDEXES & OPTIMIZATION SPECIFICATION
-- Target: PostgreSQL (v14+)
-- ==============================================================================

-- 1. TRANSACTION LEDGER COMPOSITE & FILTER INDEXES
-- Optimizes customer personal statement retrieval (filters by account, orders by timestamp)
CREATE INDEX IF NOT EXISTS idx_transactions_account_timestamp 
ON transactions(account_id, timestamp DESC);

-- Optimizes card-based POS and E-Commerce transaction queries
CREATE INDEX IF NOT EXISTS idx_transactions_card_id 
ON transactions(card_id) 
WHERE card_id IS NOT NULL;

-- Optimizes risk triage queries by payment channel and transaction status
CREATE INDEX IF NOT EXISTS idx_transactions_status_amount 
ON transactions(status, amount);

-- Optimizes high-speed hardware correlation and velocity lookups
CREATE INDEX IF NOT EXISTS idx_transactions_device_id 
ON transactions(device_id);

-- Optimizes chronological global audit and SOC timeline displays
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp_desc 
ON transactions(timestamp DESC);

-- 2. RISK ENGINE & ASSESSMENTS
-- B-Tree index on calculated risk score for rapid outlier identification
CREATE INDEX IF NOT EXISTS idx_risk_assessments_score 
ON risk_assessments(risk_score DESC);

-- Composite index for priority triage queue lookup by status and severity
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status_severity 
ON fraud_alerts(status, severity, sla_due_at);

-- Composite index for active case workload sorting
CREATE INDEX IF NOT EXISTS idx_fraud_cases_status_priority 
ON fraud_cases(status, priority);

-- 3. HARDWARE & IDENTITY CLUSTER INDEXES
-- Unique index enforcing single device identity resolution
CREATE UNIQUE INDEX IF NOT EXISTS idx_devices_fingerprint_unique 
ON devices(device_fingerprint);

-- Composite index on customer-device junction table for mule ring aggregation
CREATE INDEX IF NOT EXISTS idx_customer_devices_device_customer 
ON customer_devices(device_id, customer_id);

-- 4. CARDS & LOANS LEDGERS
-- Accelerates card lookups by linked account
CREATE INDEX IF NOT EXISTS idx_cards_account_id 
ON cards(account_id);

CREATE INDEX IF NOT EXISTS idx_cards_status 
ON cards(status);

-- Accelerates customer loan portfolio lookups
CREATE INDEX IF NOT EXISTS idx_loans_customer_id 
ON loans(customer_id);

CREATE INDEX IF NOT EXISTS idx_loans_status 
ON loans(status);

-- Composite index for installment repayment schedule queries
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_installment 
ON loan_payments(loan_id, installment_number);

-- 5. SECURITY & TELEMETRY INDEXES
-- Partial index for active customer unread notifications
CREATE INDEX IF NOT EXISTS idx_customer_notifications_unread 
ON customer_notifications(customer_id, is_read, created_at DESC) 
WHERE is_read = FALSE;

-- Composite index for account takeover telemetry lookups
CREATE INDEX IF NOT EXISTS idx_login_history_telemetry 
ON login_history(user_id, customer_id, attempted_at DESC);

-- Audit log lookup index by entity type and record ID
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity 
ON audit_logs(entity_name, entity_id, created_at DESC);
