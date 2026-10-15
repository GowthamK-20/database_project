import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  ArrowRightLeft,
  Bell,
  Briefcase,
  Share2,
  Sliders,
  Users,
  Store,
  FileText,
  History,
  LogOut,
  ChevronDown,
  Database,
  Code2,
  Terminal,
  Activity,
  Search,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

interface AppShellProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onNavigate,
  children,
}) => {
  const { user, quickSwitchUser, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navGroups = [
    {
      group: 'SURVEILLANCE & TRIAGE',
      items: [
        { id: 'overview', label: 'Surveillance Stream & Triage', icon: Activity, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER'] },
        { id: 'transactions', label: 'Transaction Ledger', icon: ArrowRightLeft, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER'] },
        { id: 'alerts', label: 'Alert Dispatch & SLA Queue', icon: Bell, badge: '3', badgeColor: 'red', roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST'] },
      ],
    },
    {
      group: 'FORENSIC INVESTIGATIONS',
      items: [
        { id: 'cases', label: 'Case Dockets & Evidence', icon: Briefcase, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST'] },
        { id: 'graph', label: 'Entity Link Graph & Mule Ring', icon: Share2, highlight: true, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST'] },
        { id: 'rules', label: 'Rule Engine & Simulator', icon: Sliders, roles: ['ADMIN', 'RISK_MANAGER'] },
        { id: 'scenarios', label: 'Incident Replay & Backtest', icon: Terminal, badge: '5 DOSSIERS', badgeColor: 'rose', highlight: true, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER'] },
      ],
    },
    {
      group: 'ENTITY INTELLIGENCE',
      items: [
        { id: 'customers', label: 'Customer 360 & KYC Registry', icon: Users, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST'] },
        { id: 'merchants', label: 'Counterparty Risk Intel', icon: Store, roles: ['ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'] },
      ],
    },
    {
      group: 'DATABASE & SYSTEM ADMIN (ROOT)',
      items: [
        { id: 'database', label: 'PostgreSQL Schema Explorer', icon: Database, badge: 'ADMIN', badgeColor: 'blue', roles: ['ADMIN'] },
        { id: 'sql-lab', label: 'Analytical SQL Workbench', icon: Code2, highlight: true, roles: ['ADMIN'] },
      ],
    },
    {
      group: 'REGULATORY & COMPLIANCE',
      items: [
        { id: 'analytics', label: 'Regulatory STR / CTR Filing', icon: FileText, roles: ['ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'] },
        { id: 'audit', label: 'Immutable Audit Ledger', icon: History, roles: ['ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'] },
      ],
    },
  ];

  const demoPersonas = [
    { username: 'rahul.sharma', label: 'Rahul Sharma (Fraud Operations Analyst)', role: 'FRAUD_ANALYST', badge: 'FA-1092' },
    { username: 'priya.nair', label: 'Priya Nair (Risk Engineering Manager)', role: 'RISK_MANAGER', badge: 'RM-0841' },
    { username: 'amit.patel', label: 'Amit Patel (Chief Compliance Officer)', role: 'COMPLIANCE_ANALYST', badge: 'CO-0034' },
    { username: 'admin', label: 'Siddharth Varma (Surveillance Administrator)', role: 'ADMIN', badge: 'SA-0001' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-veyra-950 text-slate-200">
      {/* LEFT NAVIGATION RAIL */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-veyra-900 border-r border-veyra-800">
        {/* INSTITUTIONAL BRAND HEADER */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-veyra-800 bg-veyra-950/60">
          <div className="w-7 h-7 rounded-sm bg-blue-600/10 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-slate-100">
              <span>FINGUARD</span>
              <span className="text-slate-600">/</span>
              <span className="text-blue-400">SENTINEL</span>
            </div>
            <span className="text-3xs text-slate-400 uppercase tracking-widest font-mono truncate">
              SURVEILLANCE & AML GATEWAY
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 py-2 px-2 space-y-4 overflow-y-auto">
          {navGroups.map((grp) => {
            const visibleItems = grp.items.filter(
              (item) => user && item.roles.includes(user.role)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={grp.group} className="space-y-0.5">
                <div className="px-2 pb-1 text-3xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  {grp.group}
                </div>

                {visibleItems.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;

                  let badgeStyle = 'bg-blue-950/60 text-blue-300 border-blue-800/60';
                  if (item.badgeColor === 'red') {
                    badgeStyle = 'bg-red-950/60 text-red-400 border-red-800/60';
                  } else if (item.badgeColor === 'rose') {
                    badgeStyle = 'bg-rose-950/60 text-rose-300 border-rose-800/60';
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs transition-colors text-left border ${
                        isActive
                          ? 'bg-blue-600/15 text-blue-200 font-medium border-blue-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-veyra-850/80 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isActive ? 'text-blue-400' : 'text-slate-500'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded text-3xs font-mono font-semibold border ${badgeStyle}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* SHIFT & DUTY PERSONA SWITCHER */}
        <div className="p-2.5 border-t border-veyra-800 bg-veyra-950/60">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-sm bg-veyra-850 border border-veyra-750 hover:border-slate-600 text-left transition-colors"
            >
              <div className="min-w-0 flex flex-col">
                <span className="text-3xs font-mono text-slate-500 uppercase">ACTIVE DUTY OFFICER</span>
                <span className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</span>
                <span className="text-3xs font-mono text-blue-400">{user?.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
            </button>

            {roleMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-veyra-850 border border-veyra-700 rounded-sm shadow-xl py-1 z-50">
                <div className="px-2 py-1 text-3xs font-mono text-slate-400 border-b border-veyra-750">
                  HANDOVER SHIFT PERSONA:
                </div>
                {demoPersonas.map((p) => (
                  <button
                    key={p.username}
                    onClick={() => {
                      quickSwitchUser(p.username);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-veyra-750 transition-colors flex flex-col ${
                      user?.username === p.username ? 'bg-blue-600/15 text-blue-300' : 'text-slate-300'
                    }`}
                  >
                    <span className="font-medium text-2xs truncate">{p.label}</span>
                    <span className="text-3xs font-mono text-slate-500">BADGE: {p.badge}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CENTER WORKSPACE & TOP BAR */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP INSTITUTIONAL CONTEXT BAR */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 bg-veyra-900 border-b border-veyra-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-2xs font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                SURVEILLANCE NODE: PROD-MUMBAI-01
              </span>
              <span className="text-2xs font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded-sm border border-blue-800/40 hidden md:inline">
                POSTGRESQL 18 [NATIVE_PG // 0.53ms]
              </span>
            </div>

            <div className="text-2xs font-mono text-slate-400 hidden xl:inline">
              GATEWAY: NPCI-UPI-IMPS-GW-04
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* LIVE DIGITAL CLOCK */}
            <div className="hidden sm:flex items-center gap-1.5 text-2xs font-mono text-slate-400 bg-veyra-950 px-2.5 py-1 rounded-sm border border-veyra-800">
              <span className="text-slate-500">TIME:</span>
              <span className="text-slate-200 font-bold">{timeString}</span>
            </div>

            {/* BADGE NUMBER */}
            <div className="flex items-center gap-2 bg-veyra-950 px-2.5 py-1 rounded-sm border border-veyra-800">
              <span className="text-2xs font-mono text-slate-500">OFFICER:</span>
              <span className="text-xs font-mono text-slate-200 font-semibold">{user?.badge_number}</span>
            </div>

            {/* LOGOUT BUTTON */}
            <button
              onClick={logout}
              title="Sign Out of Session"
              className="p-1.5 rounded-sm border border-veyra-800 text-slate-400 hover:text-slate-200 hover:bg-veyra-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* WORKSPACE VIEWPORT */}
        <main className="flex-1 overflow-y-auto bg-veyra-950 p-5">
          {children}
        </main>
      </div>
    </div>
  );
};
