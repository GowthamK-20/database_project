-- ==============================================================================
-- FINGUARD AI // FINANCIAL INTELLIGENCE & FRAUD DETECTION PLATFORM
-- DATABASE SCHEMA MIGRATION 003: CARDS, LOANS, LOAN PAYMENTS, LOGIN HISTORY & NOTIFICATIONS
-- Normalized: 3NF / BCNF | Target: PostgreSQL (Native & PGlite compatible)
-- ==============================================================================

-- 1. ADD 'CUSTOMER' TO USER_ROLE ENUM (IF NOT ALREADY PRESENT)
DO $$ 
BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'CUSTOMER';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. LINK CUSTOMERS TO RBAC USERS (1:1 OPTIONAL RELATIONSHIP FOR PORTAL AUTHENTICATION)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'user_id'
    ) THEN 
        ALTER TABLE customers ADD COLUMN user_id TEXT UNIQUE REFERENCES users(id) ON DELETE SET NULL;
    END IF; 
END $$;

-- 3. CARDS (DEBIT & CREDIT CARDS LINKED TO BANK ACCOUNTS)
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

-- 4. LINK TRANSACTIONS TO CARDS (OPTIONAL FK FOR CARD_POS / CARD_ECOM CHANNELS)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'card_id'
    ) THEN 
        ALTER TABLE transactions ADD COLUMN card_id TEXT REFERENCES cards(id) ON DELETE SET NULL;
    END IF; 
END $$;

-- 5. LOANS (CREDIT FACILITIES, HOME/AUTO/PERSONAL LOANS)
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

-- 6. LOAN PAYMENTS (EMI REPAYMENT INSTALLMENTS)
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

-- 7. LOGIN HISTORY (SECURITY AUDITING & ACCOUNT TAKEOVER TELEMETRY)
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

-- 8. CUSTOMER NOTIFICATIONS (TRANSACTION ALERTS & FRAUD WARNINGS)
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

-- 9. PERFORMANCE & INTEGRITY INDEXES FOR NEW ENTITIES
CREATE INDEX IF NOT EXISTS idx_cards_account_id ON cards(account_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id, installment_number);
CREATE INDEX IF NOT EXISTS idx_login_history_identity ON login_history(user_id, customer_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notifications_unread ON customer_notifications(customer_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id);
