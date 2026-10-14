-- ==============================================================================
-- FINGUARD AI // FINANCIAL INTELLIGENCE & FRAUD DETECTION PLATFORM
-- DATABASE SCHEMA: ENUMERATIONS, TYPES & EXTENSIONS
-- Normalized: 3NF / BCNF | Target: PostgreSQL (v14+)
-- ==============================================================================

-- Enable standard cryptographic extension if available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USER ROLES (Role-Based Access Control)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'ADMIN',
        'RISK_MANAGER',
        'FRAUD_ANALYST',
        'COMPLIANCE_ANALYST',
        'VIEWER',
        'CUSTOMER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. KYC STATUS
DO $$ BEGIN
    CREATE TYPE kyc_status_enum AS ENUM (
        'VERIFIED',
        'PENDING',
        'FLAGGED',
        'SUSPENDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. ACCOUNT TYPE
DO $$ BEGIN
    CREATE TYPE account_type_enum AS ENUM (
        'SAVINGS',
        'CURRENT',
        'VIRTUAL_VPA',
        'CREDIT_LINE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. ACCOUNT STATUS
DO $$ BEGIN
    CREATE TYPE account_status_enum AS ENUM (
        'ACTIVE',
        'FROZEN',
        'DORMANT',
        'CLOSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. PAYMENT CHANNELS
DO $$ BEGIN
    CREATE TYPE payment_channel_enum AS ENUM (
        'UPI',
        'IMPS',
        'NEFT',
        'RTGS',
        'CARD_POS',
        'CARD_ECOM'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. TRANSACTION STATUS
DO $$ BEGIN
    CREATE TYPE transaction_status_enum AS ENUM (
        'SUCCESS',
        'PENDING_REVIEW',
        'BLOCKED',
        'FAILED',
        'REVERSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. ALERT TRIAGE STATUS
DO $$ BEGIN
    CREATE TYPE alert_status_enum AS ENUM (
        'NEW',
        'ACKNOWLEDGED',
        'INVESTIGATING',
        'ESCALATED',
        'RESOLVED_FRAUD',
        'RESOLVED_FALSE_POSITIVE',
        'DISMISSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 8. FRAUD CASE PRIORITY
DO $$ BEGIN
    CREATE TYPE case_priority_enum AS ENUM (
        'P1_CRITICAL',
        'P2_HIGH',
        'P3_MEDIUM',
        'P4_LOW'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. FRAUD CASE DISPOSITION STATUS
DO $$ BEGIN
    CREATE TYPE case_status_enum AS ENUM (
        'OPEN',
        'IN_REVIEW',
        'ACTION_TAKEN',
        'CLOSED_CONFIRMED_FRAUD',
        'CLOSED_FALSE_POSITIVE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
