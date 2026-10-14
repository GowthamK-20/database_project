-- ==============================================================================
-- FINGUARD AI // FINANCIAL INTELLIGENCE & FRAUD DETECTION PLATFORM
-- DATABASE SCHEMA: STORED FUNCTIONS, AUDIT TRIGGERS & BUSINESS LOGIC
-- Target: PostgreSQL (v14+)
-- ==============================================================================

-- 1. AUDIT TRIGGER FUNCTION ON FRAUD CASE MUTATIONS
CREATE OR REPLACE FUNCTION fn_audit_case_mutation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        user_badge,
        action,
        entity_name,
        entity_id,
        old_state,
        new_state,
        ip_address
    ) VALUES (
        NEW.assigned_analyst_id,
        'SYSTEM-OP',
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'CASE_CREATED'
            WHEN OLD.status <> NEW.status THEN 'CASE_STATUS_CHANGED'
            ELSE 'CASE_UPDATED'
        END,
        'fraud_cases',
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        to_jsonb(NEW),
        '127.0.0.1'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_fraud_cases ON fraud_cases;
CREATE TRIGGER trg_audit_fraud_cases
AFTER INSERT OR UPDATE ON fraud_cases
FOR EACH ROW
EXECUTE FUNCTION fn_audit_case_mutation();

-- 2. TRIGGER TO ATOMICALLY UPDATE ACCOUNT ACTIVITY TIMESTAMPS
CREATE OR REPLACE FUNCTION fn_touch_account_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE accounts 
    SET last_activity_at = NEW.timestamp 
    WHERE id = NEW.account_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_account_activity ON transactions;
CREATE TRIGGER trg_touch_account_activity
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION fn_touch_account_activity();

-- 3. AUDIT TRIGGER ON USER ROLE AND ACTIVATION MUTATIONS (ADMIN PORTAL)
CREATE OR REPLACE FUNCTION fn_audit_user_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND (OLD.is_active <> NEW.is_active OR OLD.role <> NEW.role) THEN
        INSERT INTO audit_logs (
            user_id,
            user_badge,
            action,
            entity_name,
            entity_id,
            old_state,
            new_state,
            ip_address
        ) VALUES (
            NEW.id,
            NEW.badge_number,
            CASE 
                WHEN OLD.is_active <> NEW.is_active AND NEW.is_active = FALSE THEN 'USER_DEACTIVATED'
                WHEN OLD.is_active <> NEW.is_active AND NEW.is_active = TRUE THEN 'USER_REACTIVATED'
                ELSE 'USER_ROLE_MODIFIED'
            END,
            'users',
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            '127.0.0.1'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_users ON users;
CREATE TRIGGER trg_audit_users
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_audit_user_mutation();

-- 4. TRIGGER TO SYNC LOAN OUTSTANDING BALANCE ON SUCCESSFUL PAYMENT
CREATE OR REPLACE FUNCTION fn_sync_loan_balance_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'SUCCESS' THEN
        UPDATE loans
        SET outstanding_balance = GREATEST(0.00, outstanding_balance - NEW.principal_component)
        WHERE id = NEW.loan_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_loan_balance ON loan_payments;
CREATE TRIGGER trg_sync_loan_balance
AFTER INSERT ON loan_payments
FOR EACH ROW
EXECUTE FUNCTION fn_sync_loan_balance_on_payment();
