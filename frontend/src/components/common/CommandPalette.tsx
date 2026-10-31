import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/soundEffects';

export interface CommandItem {
  id: string;
  title: string;
  category: 'NAVIGATION' | 'SIMULATION' | 'COMPLIANCE' | 'SYSTEM' | 'ROLES';
  subtitle?: string;
  badge?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenAttackSimulator: () => void;
  onOpenDossier: () => void;
  onOpenClearanceTerminal: () => void;
  onReplayIntro: () => void;
  onQuickSwitchUser: (username: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAttackSimulator,
  onOpenDossier,
  onOpenClearanceTerminal,
  onReplayIntro,
  onQuickSwitchUser,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sound toggle helper
  const [soundEnabled, setSoundEnabled] = useState(sounds.getSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundEnabled;
    sounds.setSoundEnabled(next);
    setSoundEnabled(next);
    sounds.playClick();
  };

  // Build command catalogue
  const allCommands: CommandItem[] = [
    // 1. NAVIGATION
    {
      id: 'nav-overview',
      title: 'Command Center',
      category: 'NAVIGATION',
      subtitle: 'Institutional threat radar & executive surveillance metrics',
      badge: 'OVERVIEW',
      onSelect: () => onNavigate('overview'),
    },
    {
      id: 'nav-ledger',
      title: 'Transaction Ledger & Explorer',
      category: 'NAVIGATION',
      subtitle: 'Multi-rail financial transaction explorer (UPI, IMPS, NEFT, RTGS, CARD)',
      badge: 'TXNS',
      onSelect: () => onNavigate('transactions'),
    },
    {
      id: 'nav-alerts',
      title: 'Prioritized Alert Queue',
      category: 'NAVIGATION',
      subtitle: 'Real-time high-risk alert triage with SLA countdown timers',
      badge: 'ALERTS',
      onSelect: () => onNavigate('alerts'),
    },
    {
      id: 'nav-cases',
      title: 'Forensic Case Workspace',
      category: 'NAVIGATION',
      subtitle: 'Case dockets, account freeze latches & statutory compliance notes',
      badge: 'CASES',
      onSelect: () => onNavigate('cases'),
    },
    {
      id: 'nav-graph',
      title: 'Entity Relationship Graph & Mule Rings',
      category: 'NAVIGATION',
      subtitle: 'Interactive 60fps physics force graph of shared hardware clusters',
      badge: 'GRAPH',
      onSelect: () => onNavigate('graph'),
    },
    {
      id: 'nav-rules',
      title: 'Rule Engine Simulator & Backtesting',
      category: 'NAVIGATION',
      subtitle: 'Heuristic threshold calibration against 1,012 historical transactions',
      badge: 'RULES',
      onSelect: () => onNavigate('rules'),
    },
    {
      id: 'nav-customers',
      title: 'Customer 360 & Behavioral Profiling',
      category: 'NAVIGATION',
      subtitle: 'Device binding history, risk tier distribution & KYC records',
      badge: 'CUST-360',
      onSelect: () => onNavigate('customers'),
    },
    {
      id: 'nav-merchants',
      title: 'Merchant Intelligence & Risk Surveillance',
      category: 'NAVIGATION',
      subtitle: 'MCC classification, dispute chargeback volume & velocity',
      badge: 'MERCHANTS',
      onSelect: () => onNavigate('merchants'),
    },
    {
      id: 'nav-analytics',
      title: 'Analytics Reports & Workload Metrics',
      category: 'NAVIGATION',
      subtitle: 'Rail distribution charts, SLA performance & STR statistics',
      badge: 'ANALYTICS',
      onSelect: () => onNavigate('analytics'),
    },
    {
      id: 'nav-audit',
      title: 'Immutable Cryptographic Audit Ledger',
      category: 'NAVIGATION',
      subtitle: 'SHA-256 hash-chained log of every disposition and freeze event',
      badge: 'AUDIT',
      onSelect: () => onNavigate('audit'),
    },
    {
      id: 'nav-db',
      title: 'Database Schema Explorer',
      category: 'NAVIGATION',
      subtitle: 'PostgreSQL 18 relational schema, 8 tables & column definitions (Admin)',
      badge: 'DATABASE',
      onSelect: () => onNavigate('database'),
    },
    {
      id: 'nav-sql',
      title: 'Analytical SQL Query Lab',
      category: 'NAVIGATION',
      subtitle: 'Execute guarded read-only analytical SQL queries on live database (Admin)',
      badge: 'SQL-LAB',
      onSelect: () => onNavigate('sql-lab'),
    },
    {
      id: 'nav-replay',
      title: 'Incident Replay Scenarios',
      category: 'NAVIGATION',
      subtitle: 'Forensic attack vector replays & timeline reconstruction',
      badge: 'REPLAY',
      onSelect: () => onNavigate('scenarios'),
    },

    // 2. SIMULATION
    {
      id: 'sim-open',
      title: '⚡ Launch Live Threat Simulation Console',
      category: 'SIMULATION',
      subtitle: 'Inject synthetic attack packet streams and test automated defenses',
      badge: 'INJECTOR',
      onSelect: () => onOpenAttackSimulator(),
    },
    {
      id: 'sim-mule',
      title: '⚡ Inject Attack: Operation Midnight Mule',
      category: 'SIMULATION',
      subtitle: 'Simulate 4-hop fund splitting (₹4,90,000) through mule accounts at 02:45 AM',
      badge: 'CRITICAL',
      onSelect: () => onOpenAttackSimulator(),
    },
    {
      id: 'sim-geo',
      title: '⚡ Inject Attack: Impossible Geo-Velocity Leap',
      category: 'SIMULATION',
      subtitle: 'Simulate concurrent card operations in Mumbai and London (Mach 4.2)',
      badge: 'CRITICAL',
      onSelect: () => onOpenAttackSimulator(),
    },

    // 3. COMPLIANCE & LEGAL
    {
      id: 'comp-dossier',
      title: '📄 Export Statutory Police / RBI Case FIR Dossier',
      category: 'COMPLIANCE',
      subtitle: 'Generate formal legal FIR & Suspicious Transaction Report (Section 12 PMLA)',
      badge: 'LEGAL FIR',
      onSelect: () => onOpenDossier(),
    },
    {
      id: 'comp-terminal',
      title: '🪪 Open Officer Biometric Clearance Terminal & Holographic Pass',
      category: 'COMPLIANCE',
      subtitle: 'View cryptographic biometric badge, cryptographic thumbprint and role credentials',
      badge: 'ID-PASS',
      onSelect: () => onOpenClearanceTerminal(),
    },

    // 4. ROLES
    {
      id: 'role-admin',
      title: 'Switch Officer Role: Siddharth Varma (Administrator)',
      category: 'ROLES',
      subtitle: 'Full unconstrained administrative privileges & SQL Lab access',
      badge: 'SA-0001',
      onSelect: () => onQuickSwitchUser('admin'),
    },
    {
      id: 'role-analyst',
      title: 'Switch Officer Role: Rahul Sharma (Fraud Operations Analyst)',
      category: 'ROLES',
      subtitle: 'Level 1 fraud triage, queue assignment and emergency freezes',
      badge: 'FA-1092',
      onSelect: () => onQuickSwitchUser('rahul.sharma'),
    },
    {
      id: 'role-manager',
      title: 'Switch Officer Role: Priya Nair (Risk Engineering Manager)',
      category: 'ROLES',
      subtitle: 'Rule threshold adjustments, heuristic calibration and case approval',
      badge: 'RM-0841',
      onSelect: () => onQuickSwitchUser('priya.nair'),
    },
    {
      id: 'role-compliance',
      title: 'Switch Officer Role: Amit Patel (Chief Compliance Officer)',
      category: 'ROLES',
      subtitle: 'RBI statutory filings, FIU-IND submission and audit exports',
      badge: 'CO-0034',
      onSelect: () => onQuickSwitchUser('amit.patel'),
    },

    // 5. SYSTEM
    {
      id: 'sys-sound',
      title: `Audio Synthesizer: ${soundEnabled ? 'MUTE SOUND FX' : 'ENABLE SOUND FX'}`,
      category: 'SYSTEM',
      subtitle: soundEnabled ? 'Disable cybernetic biometric hum & alert audio' : 'Enable native Web Audio API telemetry sounds',
      badge: soundEnabled ? 'AUDIO ON' : 'MUTED',
      onSelect: () => handleToggleSound(),
    },
    {
      id: 'sys-intro',
      title: 'Replay FinGuard AI Holographic Shield Intro Animation',
      category: 'SYSTEM',
      subtitle: 'Trigger full-screen cybernetic SVG particle shield sequence',
      badge: 'INTRO',
      onSelect: () => onReplayIntro(),
    },
  ];

  // Filter commands by query
  const filteredCommands = allCommands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      (cmd.badge && cmd.badge.toLowerCase().includes(q))
    );
  });

  // Keep selection in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          sounds.playClick();
          selected.onSelect();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="bg-[#0b0e14] border border-amber-500/40 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col font-mono text-xs">
        {/* INPUT SEARCH HEADER */}
        <div className="p-3.5 bg-[#0e121b] border-b border-veyra-800 flex items-center gap-3">
          <span className="text-amber-400 font-bold text-sm">⌘</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, threat scenario, or officer role (Ctrl+K)..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 outline-none text-xs"
          />
          <span className="text-3xs text-slate-500 border border-veyra-750 px-1.5 py-0.5 rounded">
            ESC TO CLOSE
          </span>
        </div>

        {/* RESULTS LIST */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-2xs">
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    sounds.playClick();
                    cmd.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/60 text-amber-300'
                      : 'hover:bg-veyra-950 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs truncate">
                        {cmd.title}
                      </span>
                      {cmd.badge && (
                        <span className="text-4xs px-1.5 py-0.2 rounded bg-veyra-850 text-slate-400 border border-veyra-750 uppercase">
                          {cmd.badge}
                        </span>
                      )}
                    </div>
                    {cmd.subtitle && (
                      <p className="text-3xs text-slate-400 mt-0.5 truncate font-sans">
                        {cmd.subtitle}
                      </p>
                    )}
                  </div>

                  <span className="text-3xs text-slate-500 uppercase flex-shrink-0">
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* PALETTE FOOTER */}
        <div className="px-3.5 py-2 bg-[#090b10] border-t border-veyra-800/80 flex items-center justify-between text-3xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ NAVIGATE</span>
            <span>↵ SELECT</span>
            <span>ESC CLOSE</span>
          </div>
          <span>FINGUARD UNIVERSAL COMMAND PALETTE</span>
        </div>
      </div>
    </div>
  );
};