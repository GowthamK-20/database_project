-- ==============================================================================
-- FINGUARD AI // FINANCIAL INTELLIGENCE & FRAUD DETECTION PLATFORM
-- DATABASE SCHEMA: ANALYTICAL & OPERATIONAL VIEWS
-- Target: PostgreSQL (v14+)
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
    -- Card context (if applicable)
    crd.id AS card_id,
    crd.card_number_masked,
    crd.card_type,
    crd.card_network,
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
LEFT JOIN cards crd ON t.card_id = crd.id
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

-- 5. CUSTOMER PORTFOLIO SUMMARY VIEW (FOR CUSTOMER PORTAL)
CREATE OR REPLACE VIEW view_customer_portfolio_summary AS
SELECT 
    c.id AS customer_id,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email,
    c.risk_tier,
    COUNT(DISTINCT a.id) AS account_count,
    COALESCE(SUM(a.balance), 0.00) AS total_liquid_balance,
    COUNT(DISTINCT crd.id) AS card_count,
    COUNT(DISTINCT ln.id) AS active_loan_count,
    COALESCE(SUM(ln.outstanding_balance), 0.00) AS total_outstanding_loans,
    COUNT(DISTINCT notif.id) FILTER (WHERE notif.is_read = FALSE) AS unread_notifications_count
FROM customers c
LEFT JOIN accounts a ON c.id = a.customer_id AND a.status = 'ACTIVE'
LEFT JOIN cards crd ON a.id = crd.account_id AND crd.status = 'ACTIVE'
LEFT JOIN loans ln ON c.id = ln.customer_id AND ln.status = 'ACTIVE'
LEFT JOIN customer_notifications notif ON c.id = notif.customer_id
GROUP BY c.id, c.customer_code, c.first_name, c.last_name, c.email, c.risk_tier;
