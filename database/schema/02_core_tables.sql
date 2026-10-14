-- ==============================================================================
-- FINGUARD AI // FINANCIAL INTELLIGENCE & FRAUD DETECTION PLATFORM
-- DATABASE SCHEMA: RELATIONAL ENTITIES & CONSTRAINTS (16 CORE + 4 SUPPORTING)
-- Normalized: 3NF / BCNF | Target: PostgreSQL (v14+)
-- ==============================================================================

-- 1. USERS & RBAC ACCESS CONTROL
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'FRAUD_ANALYST',
    badge_number VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS (KYC IDENTITY & RISK TIERING)
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    customer_code VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_masked VARCHAR(20) NOT NULL,
    phone_hash VARCHAR(64) NOT NULL,
    pan_masked VARCHAR(15) NOT NULL,
    kyc_status kyc_status_enum NOT NULL DEFAULT 'VERIFIED',
    risk_tier VARCHAR(10) NOT NULL DEFAULT 'LOW' CHECK (risk_tier IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. BANK ACCOUNTS & LEDGERS
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    account_number_masked VARCHAR(25) NOT NULL,
    account_hash VARCHAR(64) NOT NULL UNIQUE,
    account_type account_type_enum NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00),
    daily_limit NUMERIC(14, 2) NOT NULL DEFAULT 100000.00 CHECK (daily_limit >= 0.00),
    status account_status_enum NOT NULL DEFAULT 'ACTIVE',
    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. CARDS (DEBIT & CREDIT CARDS LINKED TO ACCOUNTS)
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    card_number_masked VARCHAR(25) NOT NULL,
    card_hash VARCHAR(64) NOT NULL UNIQUE,
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('DEBIT', 'CREDIT', 'VIRTUAL')),
    card_network VARCHAR(20) NOT NULL CHECK (card_network IN ('VISA', 'MASTERCARD', 'RUPAY', 'AMEX')),
    expiry_month INT NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
    expiry_year INT NOT NULL CHECK (expiry_year >= 2024),
    cvv_hash VARCHAR(64) NOT NULL,
    daily_limit NUMERIC(14, 2) NOT NULL DEFAULT 50000.00 CHECK (daily_limit >= 0.00),
    is_international_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    is_contactless_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BLOCKED', 'EXPIRED', 'SUSPENDED')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. HARDWARE DEVICES & CLIENT FINGERPRINTS
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    device_fingerprint VARCHAR(64) NOT NULL UNIQUE,
    device_type VARCHAR(30) NOT NULL,
    os_version VARCHAR(50),
    browser VARCHAR(50),
    is_rooted_or_jailbroken BOOLEAN NOT NULL DEFAULT FALSE,
    trust_score INT NOT NULL DEFAULT 85 CHECK (trust_score BETWEEN 0 AND 100),
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. CUSTOMER-DEVICE HARDWARE BINDINGS (M:N RESOLUTION)
CREATE TABLE IF NOT EXISTS customer_devices (
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    bound_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, device_id)
);

-- 7. GEOLOCATIONS & IP NETWORK METADATA
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(3) NOT NULL DEFAULT 'IND',
    postal_code VARCHAR(10),
    ip_address VARCHAR(45) NOT NULL,
    ip_isp VARCHAR(100),
    is_vpn_or_tor BOOLEAN NOT NULL DEFAULT FALSE,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. MERCHANTS & COUNTERPARTIES
CREATE TABLE IF NOT EXISTS merchants (
    id TEXT PRIMARY KEY,
    merchant_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category_code VARCHAR(10) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    vpa_handle VARCHAR(100),
    risk_level VARCHAR(15) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'PROHIBITED')),
    chargeback_ratio NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. TRANSACTIONS (CORE FINANCIAL LEDGER)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    txn_reference VARCHAR(50) NOT NULL UNIQUE,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    card_id TEXT REFERENCES cards(id) ON DELETE SET NULL,
    merchant_id TEXT REFERENCES merchants(id) ON DELETE RESTRICT,
    device_id TEXT REFERENCES devices(id) ON DELETE RESTRICT,
    location_id TEXT REFERENCES locations(id) ON DELETE RESTRICT,
    channel payment_channel_enum NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    recipient_identifier VARCHAR(100) NOT NULL,
    status transaction_status_enum NOT NULL DEFAULT 'SUCCESS',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. RISK RULES (DETECTION LOGIC REPOSITORY)
CREATE TABLE IF NOT EXISTS risk_rules (
    id TEXT PRIMARY KEY,
    rule_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    condition_expression JSONB NOT NULL,
    weight_score INT NOT NULL CHECK (weight_score BETWEEN 1 AND 100),
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. RISK ASSESSMENTS (TRANSACTION SCORING RUNS)
CREATE TABLE IF NOT EXISTS risk_assessments (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    risk_score INT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(50) NOT NULL DEFAULT 'FinGuard-Hybrid-Engine-v2.1',
    execution_time_ms INT NOT NULL DEFAULT 4
);

-- 12. TRANSACTION RISK FACTORS (EXPLAINABILITY SCORE CONTRIBUTION VECTORS)
CREATE TABLE IF NOT EXISTS transaction_risk_factors (
    id TEXT PRIMARY KEY,
    risk_assessment_id TEXT NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    rule_id TEXT REFERENCES risk_rules(id) ON DELETE SET NULL,
    factor_name VARCHAR(100) NOT NULL,
    score_contribution INT NOT NULL,
    severity VARCHAR(10) NOT NULL,
    details JSONB NOT NULL
);

-- 13. FRAUD ALERTS (OPERATIONAL INCIDENT QUEUE)
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id TEXT PRIMARY KEY,
    alert_code VARCHAR(30) NOT NULL UNIQUE,
    transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status alert_status_enum NOT NULL DEFAULT 'NEW',
    assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
    sla_due_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. FRAUD CASES (INVESTIGATION DOSSIERS)
CREATE TABLE IF NOT EXISTS fraud_cases (
    id TEXT PRIMARY KEY,
    case_number VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    priority case_priority_enum NOT NULL DEFAULT 'P2_HIGH',
    status case_status_enum NOT NULL DEFAULT 'OPEN',
    assigned_analyst_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    primary_alert_id TEXT REFERENCES fraud_alerts(id) ON DELETE RESTRICT,
    estimated_exposure NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    resolution_summary TEXT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ
);

-- 15. CASE NOTES (COLLABORATIVE FORENSIC TIMELINE)
CREATE TABLE IF NOT EXISTS case_notes (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES fraud_cases(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 16. CASE EVIDENCE (PINNED FORENSIC ARTIFACTS)
CREATE TABLE IF NOT EXISTS case_evidence (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES fraud_cases(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL,
    reference_id TEXT NOT NULL,
    notes TEXT,
    attached_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. IMMUTABLE AUDIT LOGS (APPEND-ONLY STATE MUTATION JOURNAL)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    user_badge VARCHAR(20),
    action VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    user_agent VARCHAR(255) DEFAULT 'FinGuard-Audit-Client/1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. LOANS (CREDIT FACILITIES, PERSONAL & HOME LOANS)
CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    loan_reference VARCHAR(50) NOT NULL UNIQUE,
    loan_type VARCHAR(30) NOT NULL CHECK (loan_type IN ('HOME', 'PERSONAL', 'AUTO', 'EDUCATION', 'BUSINESS')),
    principal_amount NUMERIC(14, 2) NOT NULL CHECK (principal_amount > 0.00),
    interest_rate NUMERIC(5, 2) NOT NULL CHECK (interest_rate >= 0.00),
    tenure_months INT NOT NULL CHECK (tenure_months > 0),
    emi_amount NUMERIC(14, 2) NOT NULL CHECK (emi_amount > 0.00),
    outstanding_balance NUMERIC(14, 2) NOT NULL CHECK (outstanding_balance >= 0.00),
    disbursed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'DEFAULTED', 'RESTRUCTURED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 19. LOAN PAYMENTS (EMI REPAYMENT INSTALLMENT LEDGER)
CREATE TABLE IF NOT EXISTS loan_payments (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
    payment_reference VARCHAR(50) NOT NULL UNIQUE,
    installment_number INT NOT NULL CHECK (installment_number > 0),
    amount_paid NUMERIC(14, 2) NOT NULL CHECK (amount_paid > 0.00),
    principal_component NUMERIC(14, 2) NOT NULL CHECK (principal_component >= 0.00),
    interest_component NUMERIC(14, 2) NOT NULL CHECK (interest_component >= 0.00),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('AUTO_DEBIT', 'UPI', 'NET_BANKING', 'NEFT')),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING', 'OVERDUE'))
);

-- 20. LOGIN HISTORY (SECURITY AUDITING & ACCOUNT TAKEOVER TELEMETRY)
CREATE TABLE IF NOT EXISTS login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    identifier_used VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
    device_fingerprint VARCHAR(64),
    user_agent VARCHAR(255),
    login_status VARCHAR(30) NOT NULL CHECK (login_status IN ('SUCCESS', 'FAILED_BAD_PASSWORD', 'FAILED_LOCKED', 'SUSPICIOUS_CHALLENGE')),
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 21. CUSTOMER NOTIFICATIONS (SECURITY ALERTS & FRAUD WARNINGS)
CREATE TABLE IF NOT EXISTS customer_notifications (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN ('SECURITY_ALERT', 'FRAUD_WARNING', 'TRANSACTION_SUCCESS', 'ACCOUNT_FROZEN', 'POLICY_UPDATE')),
    severity VARCHAR(10) NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_transaction_id TEXT REFERENCES transactions(id) ON DELETE SET NULL,
    related_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
