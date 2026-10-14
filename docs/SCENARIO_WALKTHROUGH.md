# Veyra Risk — Live Demo & Evaluation Walkthrough

This guide details the **5 realistic fraud and risk scenarios** pre-seeded into Veyra Risk, showing exactly how to demonstrate the platform to evaluators, professors, or industry stakeholders.

---

## Access & Pre-Configured Personas

All users share the demonstration password: `VeyraRisk@2026`.
Use the **Active Persona** switcher at the bottom-left of the navigation rail to toggle between roles without logging out.

| Persona | Role | Badge | Responsibilities Demonstrated |
|---|---|---|---|
| **Rahul Sharma** | `FRAUD_ANALYST` | `BADGE-ANL-101` | Daily triage, investigating alerts, writing notes, freezing accounts. |
| **Priya Nair** | `RISK_MANAGER` | `BADGE-MGR-201` | Tuning risk rules, running historical backtest simulations. |
| **Amit Patel** | `COMPLIANCE_ANALYST` | `BADGE-CMP-301` | Reviewing audit trails, exporting RBI/PMLA STR compliance reports. |
| **Siddharth Varma** | `ADMIN` | `BADGE-ADM-01` | Full system governance, telemetry oversight. |

---

## Scenario 1: Midnight Dormant Account Drainage (Jaipur/Offshore)
- **Problem:** Account `••••3290` (Customer: Sunita Rao) was dormant for 180 days with an average daily balance of ₹4,80,000. At 02:45 AM IST, a ₹3,80,000 UPI transfer was initiated to offshore crypto exchange `vaultex.crypto@international` from an unregistered Android device in Jaipur.
- **How to Demonstrate:**
  1. Go to **Command Center**: The top attention item shows `[Critical] ₹3,80,000` with 25m remaining SLA.
  2. Click the alert: Opens **Transaction Detail** (`TXN-2026-9001`).
  3. Inspect **Forensic Transaction Story**: Note the factual summary synthesized directly from PostgreSQL.
  4. Inspect **Risk Explainability**: See the exact point breakdown:
     - `+30` High-Value Outlier
     - `+30` Unregistered Device During Night Window
     - `+25` Sudden Inactive Account Drainage
     - `+20` Offshore Quasi-Cash Merchant
     - Total: `92/100 (CRITICAL)`
  5. Click **Open Case [CASE-IND-401]**: Opens the investigation workspace with Rahul Sharma's notes, pinned evidence, and click **Freeze Origin Account**.

---

## Scenario 2: Organized Mule Account Ring Detection
- **Problem:** Multiple unrelated accounts (`ACC-004`, `ACC-005`, `ACC-006`) opened across different names are routing ₹1,80,000+ payments to the same destination VPA `karan.mule99@okaxis`.
- **How to Demonstrate:**
  1. Click **Relationship Explorer** in the left navigation.
  2. The system triggers the red banner: `[CRITICAL MULE RING DETECTED: Subject shares identical hardware fingerprint with 2 other newly created accounts]`.
  3. Select **Deepak Verma** from the subject selector.
  4. Inspect the interactive node-link map: Observe how the rooted device `LineageOS 21` links across Deepak Verma, Suraj Yadav, and Manish Tiwari.
  5. Click on the device node: Inspector panel displays `3 DISTINCT USERS` sharing the exact same hardware fingerprint.

---

## Scenario 3: Impossible Geolocation Leap (London / Bengaluru)
- **Problem:** Customer Rohan Gupta logged in from Bengaluru. Exactly 22 minutes later, an e-commerce card transaction of ₹72,000 was initiated from a London IP address (7,190 km distance leap).
- **How to Demonstrate:**
  1. Open **Transaction Explorer**.
  2. Filter by Rail: `CARD_ECOM` or Risk Tier: `HIGH`.
  3. Click `TXN-2026-9004`.
  4. Notice the triggered rule: `RULE_GEO_LEAP` with `+35` points explaining the speed-of-light velocity violation.

---

## Scenario 4: Historical Rule Backtesting Simulator
- **Problem:** Risk managers want to test a new policy: "Flag all UPI transactions over ₹75,000 initiated from rooted/modified devices." How will this affect false positives and analyst workload?
- **How to Demonstrate:**
  1. Switch Persona to **Priya Nair (Risk Manager)**.
  2. Navigate to **Rule Engine & Simulator**.
  3. Enter Min Value: `75000`, Channel: `ALL`, Check `Compromised/Rooted OS signature`.
  4. Click **Run Historical Replay Simulation**.
  5. The platform replays the rule against the historical database corpus and returns:
     - Matched Transactions count
     - True Fraud Captured vs False Alarms
     - Precision Accuracy %
     - Projected Analyst Workload Delta (`+X alerts/day`)

---

## Scenario 5: RBI Regulatory Reporting & Immutable Audit Ledger
- **Problem:** Compliance officers must file Suspicious Transaction Reports (STR) under PMLA 2002 guidelines to the Financial Intelligence Unit (FIU-IND).
- **How to Demonstrate:**
  1. Switch Persona to **Amit Patel (Compliance Officer)**.
  2. Navigate to **Analytics & STR Reports**.
  3. Click **RBI STR Compliance Extract** tab: Review structured format with PAN numbers, grounds for suspicion, and reporting officers.
  4. Click **Export Compliant CSV**: Downloads the regulatory filing ready for submission.
  5. Navigate to **Immutable Audit Ledger**: Inspect tamper-evident journal entries showing every session login, account freeze, and rule modification.
