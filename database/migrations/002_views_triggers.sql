-- ==============================================================================
-- VEYRA RISK // ENTERPRISE FRAUD & RISK INTELLIGENCE PLATFORM
-- DATABASE SCHEMA MIGRATION 002: ANALYTICAL VIEWS, STORED FUNCTIONS & TRIGGERS
-- Target: PostgreSQL (Native & PGlite compatible)
-- ==============================================================================

-- 1. ANALYTICAL VIEW: COMPREHENSIVE TRANSACTION RISK SUMMARY
CREATE OR REPLACE VIEW view_transaction_risk_summary AS
SELECT 
    t.id AS transaction_id,
    t.txn_reference,
    t.amount,
    t.currency,
    t.channel,
    t.recipient_identifier,
    t.status AS transaction_status,
    t.timestamp AS transaction_timestamp,
    -- Account context
    a.id AS account_id,
    a.account_number_masked,
    a.account_type,
    a.status AS account_status,
    a.balance AS current_balance,
    -- Customer context
    c.id AS customer_id,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email AS customer_email,
    c.phone_masked AS customer_phone,
    c.pan_masked AS customer_pan,
    c.kyc_status,
    c.risk_tier AS customer_risk_tier,
    -- Merchant context
    m.id AS merchant_id,
    m.name AS merchant_name,
    m.category_name AS merchant_category,
    m.vpa_handle AS merchant_vpa,
    m.risk_level AS merchant_risk_level,
    m.chargeback_ratio AS merchant_chargeback_ratio,
    -- Device context
    d.id AS device_id,
    d.device_fingerprint,
    d.device_type,
    d.is_rooted_or_jailbroken,
    d.trust_score AS device_trust_score,
    -- Location context
    l.id AS location_id,
    l.city AS location_city,
    l.state AS location_state,
    l.ip_address,
    l.is_vpn_or_tor,
    -- Risk Assessment
    ra.id AS risk_assessment_id,
    COALESCE(ra.risk_score, 0) AS risk_score,
    COALESCE(ra.risk_level, 'SAFE') AS risk_level,
    COALESCE(ra.is_flagged, FALSE) AS is_flagged,
    ra.model_version,
    ra.execution_time_ms
FROM transactions t
LEFT JOIN accounts a ON t.account_id = a.id
LEFT JOIN customers c ON a.customer_id = c.id
LEFT JOIN merchants m ON t.merchant_id = m.id
LEFT JOIN devices d ON t.device_id = d.id
LEFT JOIN locations l ON t.location_id = l.id
LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id;

-- 2. OPERATIONAL VIEW: HIGH-SPEED ALERT TRIAGE QUEUE
CREATE OR REPLACE VIEW view_alert_queue AS
SELECT 
    fa.id AS alert_id,
    fa.alert_code,
    fa.severity,
    fa.status AS alert_status,
    fa.sla_due_at,
    ROUND(EXTRACT(EPOCH FROM (fa.sla_due_at - CURRENT_TIMESTAMP)) / 60) AS sla_remaining_minutes,
    fa.created_at AS alert_created_at,
    -- Assigned Analyst
    u.id AS analyst_id,
    u.full_name AS analyst_name,
    u.badge_number AS analyst_badge,
    -- Underlying Transaction
    t.id AS transaction_id,
    t.txn_reference,
    t.amount,
    t.currency,
    t.channel,
    t.recipient_identifier,
    t.timestamp AS transaction_timestamp,
    -- Customer context
    c.id AS customer_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.phone_masked,
    -- Risk info
    ra.risk_score,
    ra.risk_level
FROM fraud_alerts fa
JOIN transactions t ON fa.transaction_id = t.id
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
LEFT JOIN users u ON fa.assigned_to = u.id;

-- 3. MULE RING DETECTOR: SHARED HARDWARE IDENTITIES ACROSS DISTINCT CUSTOMERS
CREATE OR REPLACE VIEW view_mule_ring_candidates AS
SELECT 
    d.id AS device_id,
    d.device_fingerprint,
    d.device_type,
    d.trust_score,
    COUNT(DISTINCT cd.customer_id) AS distinct_customer_count,
    COUNT(DISTINCT t.id) AS associated_transaction_count,
    SUM(t.amount) AS total_routed_volume
FROM devices d
JOIN customer_devices cd ON d.id = cd.device_id
LEFT JOIN transactions t ON d.id = t.device_id
GROUP BY d.id, d.device_fingerprint, d.device_type, d.trust_score
HAVING COUNT(DISTINCT cd.customer_id) > 1;

-- 4. ANALYST WORKLOAD AGGREGATION VIEW
CREATE OR REPLACE VIEW view_analyst_workload AS
SELECT 
    u.id AS analyst_id,
    u.full_name,
    u.badge_number,
    u.role,
    COUNT(DISTINCT CASE WHEN fc.status IN ('OPEN', 'IN_REVIEW') THEN fc.id END) AS active_cases,
    COUNT(DISTINCT CASE WHEN fa.status IN ('NEW', 'ACKNOWLEDGED', 'INVESTIGATING') THEN fa.id END) AS active_alerts,
    COUNT(DISTINCT CASE WHEN fc.status = 'CLOSED_CONFIRMED_FRAUD' THEN fc.id END) AS fraud_confirmed_count
FROM users u
LEFT JOIN fraud_cases fc ON u.id = fc.assigned_analyst_id
LEFT JOIN fraud_alerts fa ON u.id = fa.assigned_to
WHERE u.role IN ('FRAUD_ANALYST', 'RISK_MANAGER') AND u.is_active = TRUE
GROUP BY u.id, u.full_name, u.badge_number, u.role;

-- 5. AUDIT TRIGGER FUNCTION ON FRAUD CASE MUTATIONS
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

-- 6. TRIGGER TO UPDATE ACCOUNT ACTIVITY TIMESTAMPS
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
