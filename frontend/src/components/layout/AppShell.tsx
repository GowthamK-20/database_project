import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  ArrowRightLeft,
  Bell,
  Briefcase,
  Share2,
  Sliders,
  Users,
  Store,
  BarChart3,
  FileText,
  History,
  ShieldCheck,
  LogOut,
  Radio,
  ChevronDown,
  Compass,
} from 'lucide-react';

interface AppShellProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenWalkthrough: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onNavigate,
  onOpenWalkthrough,
  children,
}) => {
  const { user, quickSwitchUser, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'overview', label: 'Command Center', icon: Radio, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER'] },
    { id: 'transactions', label: 'Transaction Explorer', icon: ArrowRightLeft, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER'] },
    { id: 'alerts', label: 'Fraud Alerts', icon: Bell, badge: '3', roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST'] },
    { id: 'cases', label: 'Investigation Cases', icon: Briefcase, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST'] },
    { id: 'graph', label: 'Relationship Explorer', icon: Share2, highlight: true, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST'] },
    { id: 'rules', label: 'Rule Engine & Simulator', icon: Sliders, highlight: true, roles: ['ADMIN', 'RISK_MANAGER'] },
    { id: 'customers', label: 'Customer 360', icon: Users, roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST'] },
    { id: 'merchants', label: 'Merchant Intel', icon: Store, roles: ['ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'] },
    { id: 'analytics', label: 'Analytics & STR Reports', icon: BarChart3, roles: ['ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'] },
    { id: 'audit', label: 'Immutable Audit Ledger', icon: History, roles: ['ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'] },
  ];

  const demoPersonas = [
    { username: 'rahul.sharma', label: 'Rahul Sharma (Fraud Analyst)', role: 'FRAUD_ANALYST' },
    { username: 'priya.nair', label: 'Priya Nair (Risk Manager)', role: 'RISK_MANAGER' },
    { username: 'amit.patel', label: 'Amit Patel (Compliance Officer)', role: 'COMPLIANCE_ANALYST' },
    { username: 'admin', label: 'Siddharth Varma (Admin)', role: 'ADMIN' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-veyra-950 text-slate-200">
      {/* LEFT NAVIGATION RAIL */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-veyra-900 border-r border-veyra-800/80">
        {/* BRAND HEADER */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-veyra-800">
          <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-slate-100">
              <span>VEYRA</span>
              <span className="text-slate-500">|</span>
              <span className="text-blue-400">RISK CORE</span>
            </div>
            <span className="text-2xs text-slate-400 uppercase tracking-widest font-mono">
              FINANCIAL INTELLIGENCE
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {/* PROMINENT EVALUATION WALKTHROUGH BUTTON */}
          <button
            onClick={onOpenWalkthrough}
            className="w-full mb-3 flex items-center justify-between px-2.5 py-2 rounded text-xs font-semibold bg-blue-600/20 border border-blue-500/50 text-blue-200 hover:bg-blue-600/30 transition-all text-left shadow-sm group"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400 group-hover:rotate-45 transition-transform" />
              <span>Scenario Walkthrough</span>
            </div>
            <span className="text-3xs font-mono bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">
              5 DEMOS
            </span>
          </button>

          <div className="px-2 pb-1.5 pt-1 text-2xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
            OPERATIONAL MODULES
          </div>

          {navItems.map((item) => {
            const hasAccess = user && item.roles.includes(user.role);
            if (!hasAccess) return null;

            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs transition-colors text-left ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-300 font-medium border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-veyra-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-2xs font-mono font-semibold bg-red-950/60 text-red-400 border border-red-800/60">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
                )}
              </button>
            );
          })}
        </div>

        {/* DEMO PERSONA SWITCHER */}
        <div className="p-3 border-t border-veyra-800 bg-veyra-950/40">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded bg-veyra-850 border border-veyra-750/70 hover:border-slate-600 text-left transition-colors"
            >
              <div className="min-w-0 flex flex-col">
                <span className="text-2xs font-mono text-slate-400 uppercase">ACTIVE PERSONA</span>
                <span className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</span>
                <span className="text-2xs font-mono text-blue-400">{user?.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
            </button>

            {roleMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-veyra-850 border border-veyra-700 rounded shadow-xl py-1 z-50">
                <div className="px-2 py-1 text-2xs font-mono text-slate-400 border-b border-veyra-750">
                  SWITCH DEMO ROLE:
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
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CENTER WORKSPACE & TOP BAR */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP CONTEXT BAR */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-veyra-900 border-b border-veyra-800/80">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-2xs font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CORE LIVE [99.98%]
              </span>
              <span className="text-2xs font-mono text-slate-400 hidden lg:inline">
                REGION: AP-SOUTH-1 (MUMBAI)
              </span>
            </div>

            {/* TOP HEADER PROMINENT WALKTHROUGH LAUNCH BUTTON */}
            <button
              onClick={onOpenWalkthrough}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 font-mono text-xs font-semibold transition-all shadow-sm group"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-45 transition-transform" />
              <span className="hidden sm:inline">DEMO WALKTHROUGH & SCENARIOS</span>
              <span className="sm:hidden">WALKTHROUGH</span>
              <span className="px-1.5 py-0.2 rounded text-3xs bg-blue-500 text-white font-bold">
                5 SCENARIOS
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-veyra-950/60 px-2.5 py-1 rounded border border-veyra-800">
              <span className="text-2xs font-mono text-slate-400">BADGE:</span>
              <span className="text-xs font-mono text-slate-200 font-semibold">{user?.badge_number}</span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded border border-veyra-800 text-slate-400 hover:text-slate-200 hover:bg-veyra-800/60 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* WORKSPACE VIEWPORT */}
        <main className="flex-1 overflow-y-auto bg-veyra-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
