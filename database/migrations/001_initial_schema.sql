-- ==============================================================================
-- VEYRA RISK // ENTERPRISE FRAUD & RISK INTELLIGENCE PLATFORM
-- DATABASE SCHEMA MIGRATION 001: CORE RELATIONAL ENTITIES & CONSTRAINTS
-- Normalized: 3NF / BCNF | Target: PostgreSQL (Native & PGlite compatible)
-- ==============================================================================

-- 1. ENUMERATED TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status_enum AS ENUM ('VERIFIED', 'PENDING', 'FLAGGED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_type_enum AS ENUM ('SAVINGS', 'CURRENT', 'VIRTUAL_VPA', 'CREDIT_LINE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status_enum AS ENUM ('ACTIVE', 'FROZEN', 'DORMANT', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_channel_enum AS ENUM ('UPI', 'IMPS', 'NEFT', 'RTGS', 'CARD_POS', 'CARD_ECOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status_enum AS ENUM ('SUCCESS', 'PENDING_REVIEW', 'BLOCKED', 'FAILED', 'REVERSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_status_enum AS ENUM ('NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'ESCALATED', 'RESOLVED_FRAUD', 'RESOLVED_FALSE_POSITIVE', 'DISMISSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE case_priority_enum AS ENUM ('P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE case_status_enum AS ENUM ('OPEN', 'IN_REVIEW', 'ACTION_TAKEN', 'CLOSED_CONFIRMED_FRAUD', 'CLOSED_FALSE_POSITIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USERS & ACCESS CONTROL (RBAC)
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

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
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

-- 4. ACCOUNTS
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    account_number_masked VARCHAR(25) NOT NULL,
    account_hash VARCHAR(64) NOT NULL UNIQUE,
    account_type account_type_enum NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00),
    daily_limit NUMERIC(14, 2) NOT NULL DEFAULT 100000.00,
    status account_status_enum NOT NULL DEFAULT 'ACTIVE',
    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. DEVICES & HARDWARE FINGERPRINTS
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

CREATE TABLE IF NOT EXISTS customer_devices (
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    bound_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, device_id)
);

-- 6. GEOLOCATIONS & IP NETWORK METADATA
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

-- 7. MERCHANTS & COUNTERPARTIES
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

-- 8. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    txn_reference VARCHAR(50) NOT NULL UNIQUE,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
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

-- 9. RISK RULES
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

-- 10. RISK ASSESSMENTS & TRANSACTION RISK FACTORS
CREATE TABLE IF NOT EXISTS risk_assessments (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    risk_score INT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(50) NOT NULL DEFAULT 'Veyra-Hybrid-Engine-v2.1',
    execution_time_ms INT NOT NULL DEFAULT 4
);

CREATE TABLE IF NOT EXISTS transaction_risk_factors (
    id TEXT PRIMARY KEY,
    risk_assessment_id TEXT NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    rule_id TEXT REFERENCES risk_rules(id) ON DELETE SET NULL,
    factor_name VARCHAR(100) NOT NULL,
    score_contribution INT NOT NULL,
    severity VARCHAR(10) NOT NULL,
    details JSONB NOT NULL
);

-- 11. FRAUD ALERTS
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

-- 12. FRAUD CASES
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

CREATE TABLE IF NOT EXISTS case_notes (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES fraud_cases(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_evidence (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES fraud_cases(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL,
    reference_id TEXT NOT NULL,
    notes TEXT,
    attached_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. IMMUTABLE AUDIT LOGS
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
    user_agent VARCHAR(255) DEFAULT 'Veyra-Audit-Client/1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_transactions_account_timestamp ON transactions(account_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status_amount ON transactions(status, amount);
CREATE INDEX IF NOT EXISTS idx_transactions_device_id ON transactions(device_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp_desc ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_score ON risk_assessments(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status_severity ON fraud_alerts(status, severity, sla_due_at);
CREATE INDEX IF NOT EXISTS idx_fraud_cases_status_priority ON fraud_cases(status, priority);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_name, entity_id, created_at DESC);
