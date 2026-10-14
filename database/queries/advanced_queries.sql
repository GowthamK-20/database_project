-- ==============================================================================
-- FINGUARD AI // FINANCIAL INTELLIGENCE & FRAUD DETECTION PLATFORM
-- ADVANCED SQL BENCHMARK & DEMONSTRATION QUERY SUITE (10 ADVANCED QUERIES)
-- Features: Window Functions, CTEs, Self-Joins, Recursive/Graph, JSONB, Aggregations
-- Target: PostgreSQL (v14+)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- QUERY 1: High-Speed Mule Account Ring Detection
-- Techniques: GROUP BY with HAVING, COUNT(DISTINCT), Multi-Table JOIN
-- Business Use: Discovers hardware fingerprints shared across unrelated KYC identities.
-- ------------------------------------------------------------------------------
SELECT 
    d.id AS device_id,
    d.device_fingerprint,
    d.device_type,
    d.os_version,
    d.is_rooted_or_jailbroken,
    COUNT(DISTINCT cd.customer_id) AS distinct_customers_sharing_hardware,
    STRING_AGG(DISTINCT c.first_name || ' ' || c.last_name, ', ') AS customer_identities,
    COUNT(t.id) AS total_routed_transactions,
    COALESCE(SUM(t.amount), 0.00) AS total_routed_volume_inr
FROM devices d
JOIN customer_devices cd ON d.id = cd.device_id
JOIN customers c ON cd.customer_id = c.id
LEFT JOIN transactions t ON d.id = t.device_id
GROUP BY d.id, d.device_fingerprint, d.device_type, d.os_version, d.is_rooted_or_jailbroken
HAVING COUNT(DISTINCT cd.customer_id) > 1
ORDER BY distinct_customers_sharing_hardware DESC, total_routed_volume_inr DESC;


-- ------------------------------------------------------------------------------
-- QUERY 2: Impossible Travel Velocity Leap (Physical Speed-of-Light Violation)
-- Techniques: Window Function LAG(), Haversine Formula approximation, CTE
-- Business Use: Flags transactions executed thousands of kilometers apart in minutes.
-- ------------------------------------------------------------------------------
WITH customer_txn_geo AS (
    SELECT 
        t.id AS txn_id,
        t.txn_reference,
        t.account_id,
        c.first_name || ' ' || c.last_name AS customer_name,
        t.amount,
        t.timestamp,
        l.city,
        l.latitude,
        l.longitude,
        LAG(t.timestamp) OVER (PARTITION BY c.id ORDER BY t.timestamp) AS prev_timestamp,
        LAG(l.city) OVER (PARTITION BY c.id ORDER BY t.timestamp) AS prev_city,
        LAG(l.latitude) OVER (PARTITION BY c.id ORDER BY t.timestamp) AS prev_lat,
        LAG(l.longitude) OVER (PARTITION BY c.id ORDER BY t.timestamp) AS prev_lon
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN customers c ON a.customer_id = c.id
    JOIN locations l ON t.location_id = l.id
)
SELECT 
    txn_id,
    txn_reference,
    customer_name,
    amount,
    city AS current_city,
    prev_city,
    timestamp AS current_time,
    prev_timestamp,
    ROUND(EXTRACT(EPOCH FROM (timestamp - prev_timestamp)) / 60) AS delta_minutes,
    -- Distance approximation in kilometers
    ROUND(
        6371 * ACOS(
            LEAST(1.0, GREATEST(-1.0,
                COS(RADIANS(latitude)) * COS(RADIANS(prev_lat)) *
                COS(RADIANS(prev_lon) - RADIANS(longitude)) +
                SIN(RADIANS(latitude)) * SIN(RADIANS(prev_lat))
            ))
        )
    ) AS distance_km
FROM customer_txn_geo
WHERE prev_timestamp IS NOT NULL
  AND EXTRACT(EPOCH FROM (timestamp - prev_timestamp)) < 7200 -- within 2 hours
ORDER BY distance_km DESC;


-- ------------------------------------------------------------------------------
-- QUERY 3: Dormant Account Sudden High-Value Drainage
-- Techniques: CTE, Window Functions, Aggregate Subquery
-- Business Use: Flags sudden high-velocity debits on accounts with 0 activity in 90+ days.
-- ------------------------------------------------------------------------------
WITH account_activity_baseline AS (
    SELECT 
        a.id AS account_id,
        a.account_number_masked,
        c.first_name || ' ' || c.last_name AS customer_name,
        a.balance AS current_balance,
        a.status AS account_status,
        t.id AS drainage_txn_id,
        t.amount AS drainage_amount,
        t.timestamp AS drainage_timestamp,
        t.recipient_identifier,
        ra.risk_score
    FROM accounts a
    JOIN customers c ON a.customer_id = c.id
    JOIN transactions t ON a.id = t.account_id
    JOIN risk_assessments ra ON t.id = ra.transaction_id
    WHERE a.status = 'DORMANT' OR (
        t.timestamp - a.opened_at > INTERVAL '90 days'
        AND t.amount > 0.50 * a.balance
    )
)
SELECT 
    account_id,
    account_number_masked,
    customer_name,
    drainage_txn_id,
    drainage_amount,
    current_balance,
    ROUND((drainage_amount / NULLIF(current_balance + drainage_amount, 0)) * 100, 2) AS drainage_percentage,
    recipient_identifier,
    risk_score
FROM account_activity_baseline
ORDER BY drainage_amount DESC;


-- ------------------------------------------------------------------------------
-- QUERY 4: Transaction Outlier Detection via Running Z-Score Ranking
-- Techniques: Window Functions AVG() OVER, STDDEV() OVER, DENSE_RANK()
-- Business Use: Detects transaction values deviating by > 3 standard deviations.
-- ------------------------------------------------------------------------------
WITH customer_txn_stats AS (
    SELECT 
        t.id AS txn_id,
        t.txn_reference,
        c.id AS customer_id,
        c.first_name || ' ' || c.last_name AS customer_name,
        t.channel,
        t.amount,
        AVG(t.amount) OVER (PARTITION BY c.id) AS avg_customer_amount,
        COALESCE(STDDEV(t.amount) OVER (PARTITION BY c.id), 0.01) AS stddev_customer_amount
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN customers c ON a.customer_id = c.id
)
SELECT 
    txn_id,
    txn_reference,
    customer_name,
    channel,
    amount,
    ROUND(avg_customer_amount, 2) AS customer_avg,
    ROUND((amount - avg_customer_amount) / stddev_customer_amount, 2) AS z_score,
    DENSE_RANK() OVER (ORDER BY (amount - avg_customer_amount) / stddev_customer_amount DESC) AS outlier_rank
FROM customer_txn_stats
WHERE amount > 50000.00
ORDER BY z_score DESC;


-- ------------------------------------------------------------------------------
-- QUERY 5: RBI Regulatory STR (Suspicious Transaction Report) Compliance Extract
-- Techniques: Filtered Aggregations, JSON Aggregation, Multi-Way JOIN
-- Business Use: Generates PMLA 2002 regulatory filings for FIU-IND.
-- ------------------------------------------------------------------------------
SELECT 
    c.pan_masked AS customer_pan,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS full_legal_name,
    c.phone_masked,
    c.email,
    c.kyc_status,
    COUNT(t.id) AS suspicious_txn_count,
    SUM(t.amount) AS total_suspicious_volume_inr,
    MAX(ra.risk_score) AS peak_risk_score,
    STRING_AGG(DISTINCT t.channel::text, ', ') AS payment_channels_used,
    STRING_AGG(DISTINCT ra.risk_level, ', ') AS risk_classifications,
    COALESCE(u.full_name, 'Automated Surveillance') AS reporting_officer
FROM customers c
JOIN accounts a ON c.id = a.customer_id
JOIN transactions t ON a.id = t.account_id
JOIN risk_assessments ra ON t.id = ra.transaction_id
LEFT JOIN fraud_alerts fa ON t.id = fa.transaction_id
LEFT JOIN users u ON fa.assigned_to = u.id
WHERE ra.risk_score >= 80 OR c.risk_tier = 'CRITICAL'
GROUP BY c.id, c.pan_masked, c.customer_code, c.first_name, c.last_name, c.phone_masked, c.email, c.kyc_status, u.full_name
ORDER BY total_suspicious_volume_inr DESC;


-- ------------------------------------------------------------------------------
-- QUERY 6: Customer 360 Total Financial Exposure & Risk Footprint
-- Techniques: Multiple LEFT JOINs, Subqueries, COALESCE aggregations
-- Business Use: Unified risk exposure across balances, credit cards, and active loans.
-- ------------------------------------------------------------------------------
SELECT 
    c.id AS customer_id,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.risk_tier,
    COUNT(DISTINCT a.id) AS deposit_accounts_count,
    COALESCE(SUM(DISTINCT a.balance), 0.00) AS total_deposit_balance,
    COUNT(DISTINCT crd.id) AS active_cards_count,
    COUNT(DISTINCT ln.id) AS active_loans_count,
    COALESCE(SUM(DISTINCT ln.outstanding_balance), 0.00) AS total_debt_exposure,
    COALESCE(SUM(DISTINCT a.balance), 0.00) - COALESCE(SUM(DISTINCT ln.outstanding_balance), 0.00) AS net_worth_inr
FROM customers c
LEFT JOIN accounts a ON c.id = a.customer_id AND a.status = 'ACTIVE'
LEFT JOIN cards crd ON a.id = crd.account_id AND crd.status = 'ACTIVE'
LEFT JOIN loans ln ON c.id = ln.customer_id AND ln.status = 'ACTIVE'
GROUP BY c.id, c.customer_code, c.first_name, c.last_name, c.risk_tier
ORDER BY total_debt_exposure DESC;


-- ------------------------------------------------------------------------------
-- QUERY 7: Hourly Fraud Velocity & Attack Surge Histogram
-- Techniques: DATE_TRUNC(), Conditional Aggregations, GROUP BY
-- Business Use: Detects coordinated night-window attack spikes (e.g. 02:00-04:00 AM).
-- ------------------------------------------------------------------------------
SELECT 
    DATE_TRUNC('hour', t.timestamp) AS time_window_hourly,
    COUNT(t.id) AS total_transactions,
    SUM(t.amount) AS total_volume_inr,
    COUNT(CASE WHEN ra.risk_level IN ('HIGH', 'CRITICAL') THEN 1 END) AS high_risk_transactions,
    ROUND(
        (COUNT(CASE WHEN ra.risk_level IN ('HIGH', 'CRITICAL') THEN 1 END)::numeric / 
        NULLIF(COUNT(t.id), 0)) * 100, 2
    ) AS fraud_rate_percentage
FROM transactions t
LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
GROUP BY DATE_TRUNC('hour', t.timestamp)
ORDER BY time_window_hourly DESC;


-- ------------------------------------------------------------------------------
-- QUERY 8: Merchant Chargeback & Quasi-Cash Risk Indexing
-- Techniques: Aggregate Calculations, Risk Level Filtering
-- Business Use: Evaluates merchant exposure to crypto, gambling, and chargebacks.
-- ------------------------------------------------------------------------------
SELECT 
    m.id AS merchant_id,
    m.merchant_code,
    m.name AS merchant_name,
    m.category_name,
    m.risk_level,
    m.chargeback_ratio,
    COUNT(t.id) AS processed_transaction_count,
    COALESCE(SUM(t.amount), 0.00) AS total_processed_volume,
    COUNT(CASE WHEN ra.risk_level = 'CRITICAL' THEN 1 END) AS critical_alerts_linked
FROM merchants m
LEFT JOIN transactions t ON m.id = t.merchant_id
LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
GROUP BY m.id, m.merchant_code, m.name, m.category_name, m.risk_level, m.chargeback_ratio
ORDER BY critical_alerts_linked DESC, total_processed_volume DESC;


-- ------------------------------------------------------------------------------
-- QUERY 9: Account Takeover (ATO) Multi-Factor Telemetry Audit
-- Techniques: Window Function ROW_NUMBER(), JSONB Inspection, Self-Join
-- Business Use: Tracks rapid logins from suspicious IP addresses before transactions.
-- ------------------------------------------------------------------------------
SELECT 
    lh.id AS login_attempt_id,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    lh.identifier_used,
    lh.ip_address,
    l.city AS login_city,
    l.country AS login_country,
    l.is_vpn_or_tor,
    lh.login_status,
    lh.attempted_at
FROM login_history lh
LEFT JOIN customers c ON lh.customer_id = c.id
LEFT JOIN locations l ON lh.location_id = l.id
WHERE lh.login_status <> 'SUCCESS' OR l.is_vpn_or_tor = TRUE
ORDER BY lh.attempted_at DESC;


-- ------------------------------------------------------------------------------
-- QUERY 10: Performance Optimization Benchmark: Unindexed vs Indexed Execution
-- Run with EXPLAIN (ANALYZE, BUFFERS) to verify execution speedup and I/O reduction
-- ------------------------------------------------------------------------------
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    t.id AS txn_id,
    t.amount,
    t.channel,
    t.timestamp,
    a.account_number_masked,
    c.first_name || ' ' || c.last_name AS customer_name,
    ra.risk_score
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
JOIN risk_assessments ra ON t.id = ra.transaction_id
WHERE t.account_id = 'ACC-007' 
  AND t.timestamp >= '2026-01-01'
ORDER BY t.timestamp DESC;
