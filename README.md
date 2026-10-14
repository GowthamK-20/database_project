# Veyra Risk // Enterprise Financial Risk & Fraud Intelligence Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20(3NF%2FBCNF)-blue)](https://postgresql.org)
[![Security](https://img.shields.io/badge/Compliance-RBI--FMR%20%2F%20PMLA-amber)](https://rbi.org.in)
[![Design Standard](https://img.shields.io/badge/UX-Anti--AI%20Fintech%20Operations-slate)](https://stripe.com)

**Veyra Risk** is a production-grade financial operations and fraud intelligence platform engineered for banks, payment gateways, and fintech platforms operating across Indian payment rails (UPI, IMPS, NEFT, RTGS, and Card/3DS).

The platform enforces zero AI marketing fluff, zero generic stock dashboards, and zero visual noise, providing high-density operational telemetry inspired by systems like Stripe Radar and Palantir Foundry.

---

## 1. Flagship Innovations

1. **Deterministic Risk Explainability Matrix**: Every 0–100 risk score breaks down into exact vector contributions (`+30 High-Value Outlier`, `+30 Night Window New Device`, `+25 Inactive Liquidation`, `+20 High-Risk MCC`).
2. **Fraud Relationship Explorer (Entity Link Analysis)**: High-speed node-link graph mapping shared hardware fingerprints, anonymized IP subnets, and counterparty VPAs to uncover organized mule rings.
3. **Historical Rule Backtesting Simulator**: Replays candidate detection rules against historical transaction datasets, calculating precision, recall, and projected analyst workload deltas before deployment.
4. **Forensic Transaction Story Generator**: Deterministic engine translating multi-table relational context into concise, factual paragraphs without LLM hallucinations.
5. **SOC-Grade Investigation Workspace**: Multi-analyst case dossiers featuring real-time SLA countdown timers, pinned evidence lockers, dual-authorization fund holds, and append-only audit tracking.

---

## 2. Technical Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js v22 LTS, TypeScript, Express, Zod, JWT, Bcrypt.
- **Database**: PostgreSQL (3NF/BCNF normalized, foreign keys with `ON DELETE RESTRICT`, CHECK constraints, views, triggers, and immutable audit journal). Supports zero-config persistent PGlite driver or external native PostgreSQL instance via `DATABASE_URL`.

---

## 3. Quick Start & Setup

### Prerequisites
- Node.js v18+ (Node v20 or v22 recommended)
- npm v10+

### Step 1: Install Dependencies & Run Database Migrations/Seeds
```bash
# Seed realistic Indian financial corpus (Users, Accounts, Rules, Scenarios)
npm run seed
```

### Step 2: Run Automated Test Suite (16/16 Passing)
```bash
npm test
```

### Step 3: Start the Full-Stack Application
```bash
# Terminal 1: Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Frontend Client (Port 5173)
npm run dev:frontend
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 4. Pre-Seeded Demonstration Personas

Password for all pre-seeded accounts: **`VeyraRisk@2026`**
*(You can also use the **Active Persona** switcher at the bottom-left of the navigation rail to instantly switch roles without re-logging in).*

| Username | Role | Full Name | Badge |
|---|---|---|---|
| `rahul.sharma` | `FRAUD_ANALYST` | Rahul Sharma | `BADGE-ANL-101` |
| `priya.nair` | `RISK_MANAGER` | Priya Nair | `BADGE-MGR-201` |
| `amit.patel` | `COMPLIANCE_ANALYST` | Amit Patel | `BADGE-CMP-301` |
| `admin` | `ADMIN` | Siddharth Varma | `BADGE-ADM-01` |

---

## 5. Architectural Documentation
- [Database Schema & Constraints Dictionary](file:///docs/DATABASE_SCHEMA.md)
- [Demonstration Scenario Walkthrough Script](file:///docs/SCENARIO_WALKTHROUGH.md)
