import React, { useState } from 'react';
import {
  Compass,
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Sliders,
  FileText,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onSelectTransaction: (txnId: string) => void;
  onQuickSwitchUser: (username: string) => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectTransaction,
  onQuickSwitchUser,
}) => {
  const [activeScenarioId, setActiveScenarioId] = useState<number>(1);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 1,
      title: 'Midnight Dormant Account Drainage',
      rail: 'UPI · High Risk',
      role: 'Rahul Sharma (Fraud Analyst)',
      username: 'rahul.sharma',
      tab: 'transactions',
      txnId: 'TXN-2026-9001',
      summary:
        'Account ••••3290 (Customer: Sunita Rao) had zero debit activity for 180 days. At 02:45 AM IST, a ₹3,80,000 transfer was initiated to an offshore crypto counterparty via an unregistered Android device in Jaipur.',
      keyPoints: [
        'Deterministic Forensic Story generated from multi-table database fields.',
        'Risk Explainability: +30 High-Value, +30 Night Device, +25 Dormant Drainage, +20 Offshore MCC = 92/100 (CRITICAL).',
        'Linked to active investigation case CASE-IND-401.',
      ],
      actionLabel: 'Launch Scenario 1 // Inspect Transaction',
    },
    {
      id: 2,
      title: 'Organized Mule Ring Cluster Detection',
      rail: 'Entity Graph · Critical',
      role: 'Rahul Sharma (Fraud Analyst)',
      username: 'rahul.sharma',
      tab: 'graph',
      summary:
        'Three newly opened accounts (Deepak Verma, Suraj Yadav, Manish Tiwari) appear unrelated on the surface, but graph analysis reveals they share the exact same rooted hardware fingerprint and route funds to central mule VPA karan.mule99@okaxis.',
      keyPoints: [
        'PostgreSQL view_mule_ring_candidates aggregates shared hardware signatures across distinct users.',
        'Interactive Node-Link graph highlights compromised device in red.',
        'Single-click device inspection shows 3 distinct customer identities sharing the hardware.',
      ],
      actionLabel: 'Launch Scenario 2 // Open Relationship Graph',
    },
    {
      id: 3,
      title: 'Impossible Travel / Geolocation Leap',
      rail: 'Card E-Com · 7,190 km',
      role: 'Rahul Sharma (Fraud Analyst)',
      username: 'rahul.sharma',
      tab: 'transactions',
      txnId: 'TXN-2026-9004',
      summary:
        'Customer Rohan Gupta made a card payment in Bengaluru. Exactly 22 minutes later, an e-commerce charge of ₹72,000 was initiated from a London datacenter IP address.',
      keyPoints: [
        'Violates speed-of-light travel feasibility (>500 km within <60 min).',
        'Rule RULE_GEO_LEAP adds +35 points to the risk score.',
        'Flagged automatically into the priority triage inbox.',
      ],
      actionLabel: 'Launch Scenario 3 // Inspect Geo-Leap',
    },
    {
      id: 4,
      title: 'Historical Rule Backtesting Simulator',
      rail: 'Offline Replay · ML/Rules',
      role: 'Priya Nair (Risk Manager)',
      username: 'priya.nair',
      tab: 'rules',
      summary:
        'Risk managers test prospective policies against historical transaction corpora before pushing to production to evaluate false-alarm overhead and workload impact.',
      keyPoints: [
        'Configure thresholds (e.g. Min Amount: ₹75,000, Rooted OS required).',
        'Confusion Matrix: Calculates true fraud captured vs false alarms.',
        'Calculates precision accuracy % and projected daily analyst workload delta (+X alerts/day).',
      ],
      actionLabel: 'Launch Scenario 4 // Open Rule Simulator',
    },
    {
      id: 5,
      title: 'RBI Regulatory STR Filing & Audit Ledger',
      rail: 'PMLA 2002 · Compliance',
      role: 'Amit Patel (Compliance Officer)',
      username: 'amit.patel',
      tab: 'analytics',
      summary:
        'Generate official Suspicious Transaction Reports (STR) under RBI-FMR and PMLA regulations for filing with the Financial Intelligence Unit (FIU-IND), and review the tamper-evident audit ledger.',
      keyPoints: [
        'Pre-formatted STR schema with PAN, masked accounts, and suspicion grounds.',
        'One-click export to compliant CSV for regulatory submission.',
        'Append-only immutable audit journal tracking every state mutation with JSONB before/after states.',
      ],
      actionLabel: 'Launch Scenario 5 // Open STR Reports',
    },
  ];

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId)!;

  const handleLaunchScenario = (sc: typeof activeScenario) => {
    // 1. Switch persona
    onQuickSwitchUser(sc.username);

    // 2. Navigate to appropriate tab
    onNavigate(sc.tab);

    // 3. If there is a specific transaction, open it
    if (sc.txnId) {
      onSelectTransaction(sc.txnId);
    }

    // 4. Close modal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-veyra-900 border border-veyra-700 rounded-md w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* MODAL HEADER */}
        <div className="p-4 bg-veyra-850 border-b border-veyra-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
                  INTERACTIVE EVALUATION WALKTHROUGH & SCENARIOS
                </h2>
                <span className="text-2xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  5 REALISTIC SCENARIOS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any scenario below to auto-switch personas, navigate to the exact screen, and inspect live data.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-veyra-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY: LEFT SCENARIO LIST + RIGHT DETAILS */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* LEFT LIST (5 COLS) */}
          <div className="md:col-span-5 border-r border-veyra-800 bg-veyra-950/50 overflow-y-auto divide-y divide-veyra-800/60">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioId(sc.id)}
                className={`w-full p-3.5 text-left transition-colors flex flex-col gap-1 ${
                  activeScenarioId === sc.id
                    ? 'bg-amber-500/15 border-l-2 border-l-amber-400'
                    : 'hover:bg-veyra-850/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-mono text-amber-400 font-bold uppercase">
                    SCENARIO 0{sc.id}
                  </span>
                  <span className="text-3xs font-mono text-slate-400 bg-veyra-850 px-1.5 py-0.5 rounded border border-veyra-800">
                    {sc.rail}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  {sc.title}
                </div>
                <div className="text-2xs text-slate-400">
                  Persona: <span className="text-slate-300 font-mono">{sc.role.split('(')[0]}</span>
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT DETAIL & LAUNCHER (7 COLS) */}
          <div className="md:col-span-7 p-6 overflow-y-auto flex flex-col justify-between space-y-4 bg-veyra-900">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-2xs font-mono text-amber-400 uppercase tracking-wider font-bold">
                  SCENARIO 0{activeScenario.id} DOSSIER
                </span>
                <h3 className="text-base font-bold text-slate-100 font-sans">
                  {activeScenario.title}
                </h3>
                <div className="flex items-center gap-2 pt-1 font-mono text-2xs text-slate-400">
                  <span>REQUIRED PERSONA:</span>
                  <span className="text-slate-200 font-bold bg-veyra-800 px-2 py-0.5 rounded border border-veyra-750">
                    {activeScenario.role}
                  </span>
                </div>
              </div>

              {/* SUMMARY BOX */}
              <div className="bg-veyra-950 border border-veyra-800 rounded p-3 text-xs text-slate-300 leading-relaxed">
                {activeScenario.summary}
              </div>

              {/* KEY VERIFICATION HIGHLIGHTS */}
              <div className="space-y-2">
                <span className="text-2xs font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  WHAT THIS DEMONSTRATES TO EXAMINERS:
                </span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {activeScenario.keyPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LAUNCH BUTTON */}
            <div className="pt-4 border-t border-veyra-800">
              <button
                onClick={() => handleLaunchScenario(activeScenario)}
                className="w-full py-2.5 px-4 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{activeScenario.actionLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
