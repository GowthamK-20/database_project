import React, { useState } from 'react';
import {
  ShieldAlert,
  Terminal,
  Activity,
  Layers,
  Share2,
  Sliders,
  FileText,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Fingerprint,
  Globe,
  Database,
  Lock,
  ChevronRight
} from 'lucide-react';

interface IncidentReplayProps {
  onNavigate: (tab: string) => void;
  onSelectTransaction: (txnId: string) => void;
  onQuickSwitchUser: (username: string) => void;
}

export const IncidentReplay: React.FC<IncidentReplayProps> = ({
  onNavigate,
  onSelectTransaction,
  onQuickSwitchUser,
}) => {
  const [activeDossierId, setActiveDossierId] = useState<number>(1);

  const dossiers = [
    {
      id: 1,
      code: 'INC-2026-081',
      title: 'Midnight Dormant Account Liquidation',
      classification: 'ACCOUNT TAKEOVER // DORMANT FUNDS HARVESTING',
      severity: 'CRITICAL',
      operator: 'Rahul Sharma (Fraud Operations)',
      username: 'rahul.sharma',
      tab: 'transactions',
      txnId: 'TXN-2026-9001',
      timestamp: '2026-10-14 02:45:18 IST',
      accountNumber: '•••• •••• •••• 3290',
      accountHolder: 'Sunita Rao (CUST-001)',
      amount: '₹3,80,000.00',
      channel: 'UPI // IMPS DUAL-LEG',
      threatVector: 'Hardware Impersonation & Dormancy Breach',
      narrative:
        'Account #••••3290 had zero debit velocity for 180 consecutive calendar days. At 02:45 AM IST, a ₹3,80,000 liquidation order was triggered toward an offshore pseudo-exchange counterparty from an unregistered Xiaomi Android hardware signature localized in Jaipur, Rajasthan.',
      forensicEvidence: [
        { label: 'OS Root Signature', value: 'is_rooted_or_jailbroken = TRUE (Kernel modified)' },
        { label: 'Hardware Trust Score', value: '15 / 100 (High compromise confidence)' },
        { label: 'Temporal Outlier', value: '+30 pts penalty (02:45 AM outside diurnal baseline)' },
        { label: 'Dormancy Status', value: '+25 pts penalty (180 days inactive balance spike)' },
      ],
      heuristicScores: [
        { factor: 'High-Value Outlier Flag', weight: '+30 pts', status: 'CRITICAL' },
        { factor: 'Unregistered Night Device', weight: '+30 pts', status: 'CRITICAL' },
        { factor: 'Dormant Account Drainage', weight: '+25 pts', status: 'HIGH' },
        { factor: 'Prohibited MCC Counterparty', weight: '+20 pts', status: 'HIGH' },
      ],
      actionTitle: 'Inspect Forensic Docket in Transaction Ledger',
    },
    {
      id: 2,
      code: 'INC-2026-042',
      title: 'Organized Mule Ring Topology & Shared Hardware',
      classification: 'SYNDICATE FRAUD // MULTI-IDENTITY HARDWARE LINKAGE',
      severity: 'CRITICAL',
      operator: 'Rahul Sharma (Fraud Operations)',
      username: 'rahul.sharma',
      tab: 'graph',
      timestamp: '2026-10-14 04:15:00 IST',
      accountNumber: 'MULTIPLE (3 Linked Accounts)',
      accountHolder: 'Deepak Verma, Suraj Yadav, Manish Tiwari',
      amount: '₹2,65,000.00 Cumulative',
      channel: 'UPI P2P LAYERING',
      threatVector: 'App Cloner / Device Farm Clustering',
      narrative:
        'Three newly KYC-approved accounts appeared completely disjoint in individual customer tables. Relational graph traversal resolved that all 3 customer identities authenticate through the identical rooted Android device fingerprint (HW-MULE-ANDROID-09) and rapidly route inbound micro-deposits to a single consolidation node: karan.mule99@okaxis.',
      forensicEvidence: [
        { label: 'Hardware Fingerprint', value: 'HW-MULE-ANDROID-09 (Shared by 3 distinct PAN identities)' },
        { label: 'Consolidation VPA', value: 'karan.mule99@okaxis (Known aggregator)' },
        { label: 'PostgreSQL View Query', value: 'SELECT * FROM v_mule_account_candidates' },
        { label: 'Link Type', value: 'Bipartite Customer-to-Device Junction' },
      ],
      heuristicScores: [
        { factor: 'Shared Hardware Identifier', weight: '+45 pts', status: 'CRITICAL' },
        { factor: 'Rapid Layering Velocity', weight: '+30 pts', status: 'CRITICAL' },
        { factor: 'New Account Aggregation', weight: '+20 pts', status: 'HIGH' },
      ],
      actionTitle: 'Launch Entity Link Graph Analyzer',
    },
    {
      id: 3,
      code: 'INC-2026-019',
      title: 'Supersonic Impossible Geolocation Leap',
      classification: 'CARD COMPROMISE // GEOGRAPHICAL SPEED BREACH',
      severity: 'HIGH',
      operator: 'Rahul Sharma (Fraud Operations)',
      username: 'rahul.sharma',
      tab: 'transactions',
      txnId: 'TXN-2026-9004',
      timestamp: '2026-10-14 11:22:00 IST',
      accountNumber: '•••• •••• •••• 9901',
      accountHolder: 'Rohan Gupta (CUST-003)',
      amount: '₹72,000.00',
      channel: 'CARD_ECOM (3D Secure Bypass Attempt)',
      threatVector: 'Credential Scraping / Cloud Proxy',
      narrative:
        'Customer Rohan Gupta performed a physical POS card tap at an authorized merchant in Bengaluru, Karnataka. Exactly 22 minutes later, an e-commerce charge of ₹72,000 was submitted originating from a London datacenter IP address. Physical travel between the two coordinates would require a sustained speed exceeding 19,000 km/h.',
      forensicEvidence: [
        { label: 'Origin Point A', value: 'Bengaluru, Karnataka (POS Physical Terminal)' },
        { label: 'Origin Point B', value: 'London, UK (Datacenter ASN Proxy IP)' },
        { label: 'Delta Distance / Time', value: '7,190 km within 22 minutes (Physical impossibility)' },
        { label: 'Triggered Rule', value: 'RULE_GEO_LEAP (+35 Risk Penalty)' },
      ],
      heuristicScores: [
        { factor: 'Impossible Velocity Violation', weight: '+35 pts', status: 'CRITICAL' },
        { factor: 'Datacenter Subnet Hosting', weight: '+25 pts', status: 'HIGH' },
        { factor: 'Card-Not-Present Surge', weight: '+15 pts', status: 'MEDIUM' },
      ],
      actionTitle: 'Inspect Geo-Leap Incident in Ledger',
    },
    {
      id: 4,
      code: 'SIM-POLICY-2026',
      title: 'Historical Detection Policy Backtesting',
      classification: 'RULE ENGINE // CONFUSION MATRIX & WORKLOAD SIMULATION',
      severity: 'MEDIUM',
      operator: 'Priya Nair (Risk Engineering Lead)',
      username: 'priya.nair',
      tab: 'rules',
      timestamp: 'OFFLINE BENCHMARK CORPUS (1,012 Trans)',
      accountNumber: 'CORPUS AGGREGATE',
      accountHolder: 'Historical Database Baseline',
      amount: '₹14.2M Tested Volume',
      channel: 'CROSS-RAIL REPLAY',
      threatVector: 'Policy Tuning & False-Positive Minimization',
      narrative:
        'Prior to deploying new deterministic rules into live payment authorization pipelines, risk engineering runs backtesting iterations against historical transactional databases to calculate exact precision metrics, true fraud capture rates, and analyst operational workload deltas.',
      forensicEvidence: [
        { label: 'Evaluation Corpus', value: '1,012 Historical Transactions in PostgreSQL' },
        { label: 'Confusion Matrix', value: 'True Positives vs False Alarms calculated live' },
        { label: 'Precision Efficiency', value: 'Calculates precision % before production commit' },
        { label: 'Workload Projection', value: 'Estimates projected daily alerts delta (+X/day)' },
      ],
      heuristicScores: [
        { factor: 'Deterministic Threshold Filter', weight: 'Configurable', status: 'MEDIUM' },
        { factor: 'Hardware Integrity Filter', weight: 'Configurable', status: 'MEDIUM' },
        { factor: 'Counterparty Risk Filter', weight: 'Configurable', status: 'MEDIUM' },
      ],
      actionTitle: 'Open Policy Simulator & Confusion Matrix',
    },
    {
      id: 5,
      code: 'REG-STR-2026',
      title: 'Regulatory Suspicious Transaction Report (STR)',
      classification: 'AML COMPLIANCE // FIU-IND REPORTING DISPATCH',
      severity: 'HIGH',
      operator: 'Amit Patel (Chief Compliance Officer)',
      username: 'amit.patel',
      tab: 'analytics',
      timestamp: 'QUARTERLY STATUTORY FILING',
      accountNumber: 'AUDIT PORTFOLIO',
      accountHolder: 'FIU-IND Regulatory Entity Registry',
      amount: 'Statutory Threshold (> ₹10 Lakh / Suspicious)',
      channel: 'OFFICIAL FIU-IND XML SCHEMA',
      threatVector: 'AML Violation & Structured Concealment',
      narrative:
        'Under Prevention of Money Laundering Act (PMLA) and FIU-IND directives, all confirmed fraudulent or structured transfers must generate a legally binding, cryptographically signed Suspicious Transaction Report (STR) complete with transaction stories, PAN cross-references, and immutable audit logs.',
      forensicEvidence: [
        { label: 'Regulatory Mandate', value: 'PMLA 2002 / RBI Master Directions on Fraud' },
        { label: 'Export Schema', value: 'Standardized FIU-IND Regulatory Dossier XML/JSON' },
        { label: 'Chain of Custody', value: 'Tied to Immutable Audit Ledger' },
        { label: 'Filing Workflow', value: 'Analyst Sign-off $\\to$ Compliance Review $\\to$ Formal Dispatch' },
      ],
      heuristicScores: [
        { factor: 'PMLA AML Structuring Flag', weight: '+40 pts', status: 'CRITICAL' },
        { factor: 'Confirmed Case Adjudication', weight: '+35 pts', status: 'HIGH' },
        { factor: 'Regulatory Reporting Mandate', weight: 'STATUTORY', status: 'HIGH' },
      ],
      actionTitle: 'Open Compliance & STR Export Registry',
    },
  ];

  const activeDossier = dossiers.find((d) => d.id === activeDossierId) || dossiers[0];

  const handleLaunch = () => {
    onQuickSwitchUser(activeDossier.username);
    if (activeDossier.txnId) {
      onSelectTransaction(activeDossier.txnId);
    } else {
      onNavigate(activeDossier.tab);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              INCIDENT REPLAY & ADVERSARIAL SIMULATION SUITE
            </h1>
            <span className="text-2xs font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
              5 HISTORICAL DOSSIERS
            </span>
            <span className="text-2xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              POSTGRESQL 18 BACKTESTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational attack vector replays, threat scenario modeling, and forensic case dossiers for institutional risk analysts.
          </p>
        </div>

        <button
          onClick={handleLaunch}
          className="flex items-center gap-1.5 px-3 py-1.5 text-2xs font-mono font-bold rounded bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-sm"
        >
          <span>EXECUTE DOSSIER #{activeDossier.code}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: DOSSIER SELECTOR (col-span-4) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-2xs font-mono text-slate-400 font-semibold uppercase tracking-wider px-1">
            FORENSIC INCIDENT ARCHIVES
          </div>

          <div className="space-y-1.5">
            {dossiers.map((d) => {
              const isSelected = d.id === activeDossierId;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDossierId(d.id)}
                  className={`w-full text-left p-3 rounded text-xs transition-all border ${
                    isSelected
                      ? 'bg-veyra-900 border-rose-500/60 shadow-sm text-slate-100'
                      : 'bg-veyra-950/70 hover:bg-veyra-900/60 border-veyra-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-2xs mb-1">
                    <span className="font-bold text-rose-400">{d.code}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-3xs font-semibold ${
                        d.severity === 'CRITICAL'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          : d.severity === 'HIGH'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                          : 'bg-blue-950/60 text-blue-400 border border-blue-800/60'
                      }`}
                    >
                      {d.severity}
                    </span>
                  </div>

                  <div className="font-bold text-xs font-mono text-slate-200 truncate">
                    {d.title}
                  </div>

                  <div className="text-3xs text-slate-400 truncate mt-0.5">
                    {d.classification}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE INCIDENT DOSSIER DETAILS (col-span-8) */}
        <div className="lg:col-span-8 space-y-3">
          {/* DOSSIER HEADER PANEL */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-veyra-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-mono bg-rose-950/60 text-rose-300 border border-rose-800/50 px-2 py-0.5 rounded font-bold">
                    {activeDossier.code}
                  </span>
                  <span className="text-2xs font-mono text-slate-400">
                    {activeDossier.classification}
                  </span>
                </div>
                <h2 className="text-base font-bold font-mono text-slate-100 mt-1">
                  {activeDossier.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xs font-mono text-slate-400">DUTY OFFICER:</span>
                <span className="text-2xs font-mono text-blue-300 font-semibold bg-blue-950/40 px-2 py-1 rounded border border-blue-800/40">
                  {activeDossier.operator}
                </span>
              </div>
            </div>

            {/* KEY METRICS STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs font-mono">
              <div className="bg-veyra-950 p-2.5 rounded border border-veyra-800">
                <span className="text-slate-500 uppercase block">SUBJECT ENTITY</span>
                <span className="font-bold text-slate-200 mt-0.5 block truncate">
                  {activeDossier.accountHolder}
                </span>
              </div>

              <div className="bg-veyra-950 p-2.5 rounded border border-veyra-800">
                <span className="text-slate-500 uppercase block">EXPOSURE VOLUME</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">
                  {activeDossier.amount}
                </span>
              </div>

              <div className="bg-veyra-950 p-2.5 rounded border border-veyra-800">
                <span className="text-slate-500 uppercase block">PAYMENT RAIL</span>
                <span className="font-bold text-blue-400 mt-0.5 block truncate">
                  {activeDossier.channel}
                </span>
              </div>

              <div className="bg-veyra-950 p-2.5 rounded border border-veyra-800">
                <span className="text-slate-500 uppercase block">INCIDENT TIME</span>
                <span className="font-bold text-slate-300 mt-0.5 block truncate">
                  {activeDossier.timestamp}
                </span>
              </div>
            </div>

            {/* FORENSIC CASE NARRATIVE */}
            <div className="space-y-1.5 pt-1">
              <div className="text-2xs font-mono text-slate-400 uppercase font-semibold">
                SURVEILLANCE FORENSIC SYNOPSIS
              </div>
              <p className="text-xs text-slate-300 bg-veyra-950 p-3 rounded border border-veyra-800/80 leading-relaxed font-sans">
                {activeDossier.narrative}
              </p>
            </div>

            {/* FORENSIC EVIDENCE & HEURISTIC BREAKDOWN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="space-y-2 bg-veyra-950 p-3 rounded border border-veyra-800">
                <div className="text-2xs font-mono text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
                  <span>TECHNICAL EVIDENCE ARTIFACTS</span>
                </div>
                <div className="space-y-1.5">
                  {activeDossier.forensicEvidence.map((ev, idx) => (
                    <div key={idx} className="text-2xs font-mono">
                      <span className="text-slate-500 block">{ev.label}:</span>
                      <span className="text-slate-200 font-semibold block">{ev.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 bg-veyra-950 p-3 rounded border border-veyra-800">
                <div className="text-2xs font-mono text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>HEURISTIC SCORING BREAKDOWN</span>
                </div>
                <div className="space-y-1.5">
                  {activeDossier.heuristicScores.map((h, idx) => (
                    <div key={idx} className="flex items-center justify-between text-2xs font-mono bg-veyra-900/60 px-2 py-1 rounded border border-veyra-850">
                      <span className="text-slate-300 truncate max-w-[200px]">{h.factor}</span>
                      <span className="text-rose-400 font-bold">{h.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION LAUNCH BAR */}
            <div className="pt-2 border-t border-veyra-800 flex items-center justify-between">
              <div className="text-2xs font-mono text-slate-400">
                Switch role to <strong className="text-blue-300">{activeDossier.operator}</strong> and execute live deep-dive.
              </div>

              <button
                onClick={handleLaunch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-2xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <span>{activeDossier.actionTitle}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
