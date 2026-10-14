-- ==============================================================================
-- FINGUARD AI // FINANCIAL INTELLIGENCE & FRAUD DETECTION PLATFORM
-- REPRODUCIBLE NATIVE SQL SEED SCRIPT (16 CORE ENTITIES + SUPPORTING LEDGERS)
-- Target: PostgreSQL (v14+)
-- ==============================================================================

-- 1. SEED RBAC USERS
-- Password for all seed users is 'VeyraRisk@2026' (Bcrypt hash below)
-- $2a$10$w4rYv0UuCg6bK1qZgK9l.Ohj9U6a8G1i6g8s6E4bO0w1K1e1e1e1e (or standard hash)
INSERT INTO users (id, username, email, password_hash, full_name, role, badge_number) VALUES
('USR-ADMIN-01', 'admin', 'admin@veyrarisk.internal', '$2a$10$iW3G0vXkH89VdC1tY0n7G.XvM6T5kH9uH8wW4c5vX2uV4c5vX2uV4', 'Siddharth Varma', 'ADMIN', 'BADGE-ADM-01'),
('USR-ANL-101', 'rahul.sharma', 'rahul.sharma@veyrarisk.internal', '$2a$10$iW3G0vXkH89VdC1tY0n7G.XvM6T5kH9uH8wW4c5vX2uV4c5vX2uV4', 'Rahul Sharma', 'FRAUD_ANALYST', 'BADGE-ANL-101'),
('USR-MGR-201', 'priya.nair', 'priya.nair@veyrarisk.internal', '$2a$10$iW3G0vXkH89VdC1tY0n7G.XvM6T5kH9uH8wW4c5vX2uV4c5vX2uV4', 'Priya Nair', 'RISK_MANAGER', 'BADGE-MGR-201'),
('USR-CMP-301', 'amit.patel', 'amit.patel@veyrarisk.internal', '$2a$10$iW3G0vXkH89VdC1tY0n7G.XvM6T5kH9uH8wW4c5vX2uV4c5vX2uV4', 'Amit Patel', 'COMPLIANCE_ANALYST', 'BADGE-CMP-301'),
('USR-CUST-803', 'rohan.gupta', 'rohan.g@techcorp.io', '$2a$10$iW3G0vXkH89VdC1tY0n7G.XvM6T5kH9uH8wW4c5vX2uV4c5vX2uV4', 'Rohan Gupta', 'CUSTOMER', 'BADGE-CUST-803'),
('USR-CUST-807', 'sunita.rao', 'sunita.rao@rediffmail.com', '$2a$10$iW3G0vXkH89VdC1tY0n7G.XvM6T5kH9uH8wW4c5vX2uV4c5vX2uV4', 'Sunita Rao', 'CUSTOMER', 'BADGE-CUST-807'),
('USR-CUST-801', 'ananya.deshmukh', 'ananya.d@gmail.com', '$2a$10$iW3G0vXkH89VdC1tY0n7G.XvM6T5kH9uH8wW4c5vX2uV4c5vX2uV4', 'Ananya Deshmukh', 'CUSTOMER', 'BADGE-CUST-801')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- 2. SEED CUSTOMERS
INSERT INTO customers (id, user_id, customer_code, first_name, last_name, email, phone_masked, phone_hash, pan_masked, kyc_status, risk_tier) VALUES
('CUST-001', 'USR-CUST-801', 'CUST-IND-801', 'Ananya', 'Deshmukh', 'ananya.d@gmail.com', '+91 98201 ••••2', 'hash_cust_001', 'ABCDE1234F', 'VERIFIED', 'LOW'),
('CUST-002', NULL, 'CUST-IND-802', 'Vikram', 'Mehta', 'vikram.m@corporatesolutions.in', '+91 98112 ••••5', 'hash_cust_002', 'BCDEF2345G', 'VERIFIED', 'LOW'),
('CUST-003', 'USR-CUST-803', 'CUST-IND-803', 'Rohan', 'Gupta', 'rohan.g@techcorp.io', '+91 97410 ••••9', 'hash_cust_003', 'CDEFG3456H', 'VERIFIED', 'MEDIUM'),
('CUST-004', NULL, 'CUST-IND-804', 'Deepak', 'Verma', 'deepak.v91@yahoo.com', '+91 91234 ••••0', 'hash_cust_004', 'DEFGH4567J', 'PENDING', 'CRITICAL'),
('CUST-005', NULL, 'CUST-IND-805', 'Suraj', 'Yadav', 'suraj.yadav@fastmail.com', '+91 91234 ••••1', 'hash_cust_005', 'EFGHI5678K', 'FLAGGED', 'CRITICAL'),
('CUST-006', NULL, 'CUST-IND-806', 'Manish', 'Tiwari', 'manish.t@inbox.ru', '+91 91234 ••••2', 'hash_cust_006', 'FGHIJ6789L', 'FLAGGED', 'CRITICAL'),
('CUST-007', 'USR-CUST-807', 'CUST-IND-807', 'Sunita', 'Rao', 'sunita.rao@rediffmail.com', '+91 99887 ••••3', 'hash_cust_007', 'GHIJK7890M', 'VERIFIED', 'HIGH')
ON CONFLICT (id) DO UPDATE SET risk_tier = EXCLUDED.risk_tier, kyc_status = EXCLUDED.kyc_status, user_id = EXCLUDED.user_id;

-- 3. SEED ACCOUNTS
INSERT INTO accounts (id, customer_id, account_number_masked, account_hash, account_type, balance, daily_limit, status) VALUES
('ACC-001', 'CUST-001', '•••• •••• •••• 4912', 'acc_hash_001', 'SAVINGS', 345000.00, 100000.00, 'ACTIVE'),
('ACC-002', 'CUST-002', '•••• •••• •••• 8821', 'acc_hash_002', 'CURRENT', 1850000.00, 1000000.00, 'ACTIVE'),
('ACC-003', 'CUST-003', '•••• •••• •••• 1147', 'acc_hash_003', 'SAVINGS', 82000.00, 50000.00, 'ACTIVE'),
('ACC-004', 'CUST-004', '•••• •••• •••• 9901', 'acc_hash_004', 'SAVINGS', 12000.00, 200000.00, 'ACTIVE'),
('ACC-005', 'CUST-005', '•••• •••• •••• 9902', 'acc_hash_005', 'SAVINGS', 8500.00, 200000.00, 'ACTIVE'),
('ACC-006', 'CUST-006', '•••• •••• •••• 9903', 'acc_hash_006', 'SAVINGS', 14000.00, 200000.00, 'ACTIVE'),
('ACC-007', 'CUST-007', '•••• •••• •••• 3290', 'acc_hash_007', 'SAVINGS', 480000.00, 500000.00, 'DORMANT')
ON CONFLICT (id) DO UPDATE SET balance = EXCLUDED.balance, status = EXCLUDED.status;

-- 4. SEED CARDS
INSERT INTO cards (id, account_id, card_number_masked, card_hash, card_type, card_network, expiry_month, expiry_year, cvv_hash, daily_limit, is_international_enabled, is_contactless_enabled, status) VALUES
('CARD-001', 'ACC-001', '•••• •••• •••• 1024', 'hash_card_001', 'DEBIT', 'RUPAY', 12, 2028, 'cvv_hash_01', 50000.00, false, true, 'ACTIVE'),
('CARD-002', 'ACC-002', '•••• •••• •••• 5591', 'hash_card_002', 'CREDIT', 'VISA', 8, 2029, 'cvv_hash_02', 200000.00, true, true, 'ACTIVE'),
('CARD-003', 'ACC-003', '•••• •••• •••• 4892', 'hash_card_003', 'DEBIT', 'MASTERCARD', 5, 2027, 'cvv_hash_03', 75000.00, true, true, 'ACTIVE'),
('CARD-004', 'ACC-007', '•••• •••• •••• 8832', 'hash_card_004', 'DEBIT', 'RUPAY', 11, 2026, 'cvv_hash_04', 25000.00, false, false, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED HARDWARE DEVICES & MULE LINKAGE
INSERT INTO devices (id, device_fingerprint, device_type, os_version, browser, is_rooted_or_jailbroken, trust_score) VALUES
('DEV-IPH-01', 'fp_a94f1c9028e1837d991', 'MOBILE_IOS', 'iOS 17.5.1', 'Mobile Safari', false, 95),
('DEV-SMG-02', 'fp_c88319e74bb0147e822', 'MOBILE_ANDROID', 'Android 14 (OneUI 6.1)', 'Chrome Mobile 128', false, 88),
('DEV-MAC-03', 'fp_3f0982bb901e8200143', 'WEB_DESKTOP', 'macOS Sonoma 14.6', 'Chrome 128', false, 92),
('DEV-ROOT-04', 'fp_mule_shared_device_99', 'MOBILE_ANDROID', 'LineageOS 21 (Custom)', 'Custom WebView', true, 15),
('DEV-WIN-05', 'fp_e1208a99cc1289fe401', 'WEB_DESKTOP', 'Windows 11 Enterprise', 'Edge 128', false, 90)
ON CONFLICT (id) DO UPDATE SET trust_score = EXCLUDED.trust_score, is_rooted_or_jailbroken = EXCLUDED.is_rooted_or_jailbroken;

INSERT INTO customer_devices (customer_id, device_id, is_primary) VALUES
('CUST-001', 'DEV-IPH-01', true),
('CUST-002', 'DEV-MAC-03', true),
('CUST-003', 'DEV-SMG-02', true),
('CUST-004', 'DEV-ROOT-04', true),
('CUST-005', 'DEV-ROOT-04', true),
('CUST-006', 'DEV-ROOT-04', true),
('CUST-007', 'DEV-WIN-05', true)
ON CONFLICT (customer_id, device_id) DO NOTHING;

-- 6. SEED LOCATIONS
INSERT INTO locations (id, city, state, country, postal_code, ip_address, ip_isp, is_vpn_or_tor, latitude, longitude) VALUES
('LOC-MUM-01', 'Mumbai', 'Maharashtra', 'IND', '400051', '103.21.124.5', 'Jio Fiber Commercial', false, 19.0760, 72.8777),
('LOC-BLR-02', 'Bengaluru', 'Karnataka', 'IND', '560100', '122.175.40.18', 'Airtel Broadband', false, 12.9716, 77.5946),
('LOC-DEL-03', 'New Delhi', 'Delhi', 'IND', '110001', '14.139.60.10', 'Tata Teleservices', false, 28.6139, 77.2090),
('LOC-HYD-04', 'Hyderabad', 'Telangana', 'IND', '500081', '49.207.180.22', 'ACT Fibernet', false, 17.3850, 78.4867),
('LOC-JAI-05', 'Jaipur', 'Rajasthan', 'IND', '302001', '43.242.176.88', 'Excitel Broadband', false, 26.9124, 75.7873),
('LOC-LON-06', 'London', 'Greater London', 'GBR', 'EC1A', '185.220.101.5', 'Datacenter Transit Host', true, 51.5074, -0.1278)
ON CONFLICT (id) DO NOTHING;

-- 7. SEED MERCHANTS
INSERT INTO merchants (id, merchant_code, name, category_code, category_name, vpa_handle, risk_level, chargeback_ratio) VALUES
('MERCH-001', 'MER-AMZN-IND', 'Amazon India Payments', '5399', 'E-Commerce Marketplace', 'amazonpay@apl', 'LOW', 0.0004),
('MERCH-002', 'MER-FLPK-IND', 'Flipkart Internet Pvt Ltd', '5399', 'E-Commerce Marketplace', 'flipkart@axis', 'LOW', 0.0006),
('MERCH-003', 'MER-CRPT-OFF', 'Vaultex Crypto Global Ltd', '6051', 'Offshore Quasi-Cash Crypto', 'vaultex.crypto@international', 'PROHIBITED', 0.0780),
('MERCH-004', 'MER-GMBL-CUR', 'BetWin High Roller Club', '7995', 'Betting & Casino Operations', 'betwin.pay@curacao', 'PROHIBITED', 0.1250),
('MERCH-005', 'MER-P2P-MULE', 'Karan Enterprises Peer VPA', '4829', 'Money Transfer / Remittance', 'karan.mule99@okaxis', 'HIGH', 0.0420)
ON CONFLICT (id) DO NOTHING;

-- 8. SEED RISK RULES
INSERT INTO risk_rules (id, rule_code, name, description, condition_expression, weight_score, severity, is_active, version) VALUES
('RULE-VEL-01', 'RULE_VELOCITY_BURST', 'High-Frequency Velocity Surge', 'Triggered when > 3 outgoing transactions occur within a 5-minute rolling window.', '{"type": "VELOCITY", "window_minutes": 5, "max_count": 3}', 25, 'HIGH', true, '1.2.0'),
('RULE-GEO-02', 'RULE_GEO_LEAP', 'Impossible Travel Velocity Leap', 'Triggered when successive card or login events occur at physical speeds exceeding 500 km/h.', '{"type": "GEOLOCATION_LEAP", "min_km_per_hour": 500}', 35, 'HIGH', true, '1.4.0'),
('RULE-DOR-03', 'RULE_DORMANT_DRAIN', 'Dormant Account Rapid Outflow', 'Triggered when a previously inactive account (> 90 days) initiates transfers exceeding 50% of available balance.', '{"type": "DORMANT_DRAIN", "dormancy_days": 90, "balance_drain_pct": 50}', 30, 'CRITICAL', true, '2.0.0'),
('RULE-DEV-04', 'RULE_ROOTED_NIGHT', 'Unregistered Rooted Hardware at Night', 'Triggered when high-value transfers originate from a rooted or modified OS during the 01:00 AM - 05:00 AM window.', '{"type": "DEVICE_THREAT", "requires_rooted": true, "night_window_start": "01:00", "night_window_end": "05:00"}', 30, 'CRITICAL', true, '2.1.0'),
('RULE-MCC-05', 'RULE_HIGH_RISK_MCC', 'High-Risk Quasi-Cash / Crypto Counterparty', 'Triggered when counterparty MCC belongs to gambling, offshore crypto, or prohibited remitter classifications.', '{"type": "MCC_PROHIBITED", "categories": ["6051", "7995"]}', 20, 'HIGH', true, '1.0.0')
ON CONFLICT (id) DO UPDATE SET weight_score = EXCLUDED.weight_score, severity = EXCLUDED.severity;

-- 9. SEED LOANS & LOAN PAYMENTS
INSERT INTO loans (id, customer_id, account_id, loan_reference, loan_type, principal_amount, interest_rate, tenure_months, emi_amount, outstanding_balance, status) VALUES
('LOAN-001', 'CUST-007', 'ACC-007', 'LN-MUM-2024-881', 'HOME', 4500000.00, 8.50, 240, 39052.00, 3420000.00, 'ACTIVE'),
('LOAN-002', 'CUST-003', 'ACC-003', 'LN-BLR-2025-412', 'PERSONAL', 500000.00, 11.50, 36, 16498.00, 280000.00, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO loan_payments (id, loan_id, payment_reference, installment_number, amount_paid, principal_component, interest_component, payment_method, status) VALUES
('LPAY-001', 'LOAN-001', 'PAY-LN-881-01', 1, 39052.00, 7177.00, 31875.00, 'AUTO_DEBIT', 'SUCCESS'),
('LPAY-002', 'LOAN-001', 'PAY-LN-881-02', 2, 39052.00, 7228.00, 31824.00, 'AUTO_DEBIT', 'SUCCESS'),
('LPAY-003', 'LOAN-002', 'PAY-LN-412-01', 1, 16498.00, 11706.00, 4792.00, 'UPI', 'SUCCESS')
ON CONFLICT (id) DO NOTHING;

-- 10. SEED LOGIN HISTORY (SECURITY AUDITING & SCENARIO TELEMETRY)
INSERT INTO login_history (user_id, customer_id, identifier_used, ip_address, location_id, device_fingerprint, user_agent, login_status) VALUES
('USR-CUST-803', 'CUST-003', 'rohan.g@techcorp.io', '122.175.40.18', 'LOC-BLR-02', 'fp_c88319e74bb0147e822', 'Chrome Mobile 128 (Android 14)', 'SUCCESS'),
('USR-CUST-803', 'CUST-003', 'rohan.g@techcorp.io', '185.220.101.5', 'LOC-LON-06', 'fp_unknown_datacenter', 'Headless Chrome / Tor Node', 'SUSPICIOUS_CHALLENGE'),
('USR-CUST-807', 'CUST-007', 'sunita.rao@rediffmail.com', '43.242.176.88', 'LOC-JAI-05', 'fp_mule_shared_device_99', 'LineageOS 21 Custom WebView', 'SUSPICIOUS_CHALLENGE');

-- 11. SEED CUSTOMER NOTIFICATIONS
INSERT INTO customer_notifications (id, customer_id, title, message, notification_type, severity, is_read, related_account_id) VALUES
('NOTIF-001', 'CUST-007', 'URGENT SECURITY ALERT: Protective Account Hold', 'An unusual midnight withdrawal of ₹3,80,000 was initiated from Jaipur. Account ••••3290 has been temporarily frozen for your security.', 'ACCOUNT_FROZEN', 'CRITICAL', false, 'ACC-007'),
('NOTIF-002', 'CUST-003', 'SECURITY ALERT: High-Risk Geolocation Leap', 'A transaction attempt of ₹72,000 from London was detected shortly after your Bengaluru login. Transaction has been flagged for analyst review.', 'FRAUD_WARNING', 'WARNING', false, 'ACC-003'),
('NOTIF-003', 'CUST-001', 'TRANSACTION SUCCESS: Statement Update', 'Your payment of ₹15,000 via UPI has been processed successfully.', 'TRANSACTION_SUCCESS', 'INFO', true, 'ACC-001')
ON CONFLICT (id) DO NOTHING;
