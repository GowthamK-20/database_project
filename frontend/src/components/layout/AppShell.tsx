import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShieldCheck,
  ChevronDown,
  LogOut,
  Menu,
  X,
  User,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Activity,
  Fingerprint,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppIcon, IconName } from '../common/Icon';
import { ChronometerWidget } from '../common/ChronometerWidget';
import { sounds } from '../../utils/soundEffects';

interface AppShellProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onReplayIntro?: () => void;
  onOpenClearanceTerminal?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenAttackSimulator?: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  description: string;
  iconName: IconName;
  roles: string[];
  badgeKey?: 'alerts' | 'cases';
}

interface NavGroup {
  id: string;
  label: string;
  shortLabel: string;
  items: NavItem[];
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onNavigate,
  onReplayIntro,
  onOpenClearanceTerminal,
  onOpenCommandPalette,
  onOpenAttackSimulator,
  children,
}) => {
  const { user, quickSwitchUser, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState<number>(0);
  const [caseCount, setCaseCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.getSoundEnabled());

  const dropdownRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live metrics for notification badges
  useEffect(() => {
    const fetchBadgeData = async () => {
      try {
        const metrics = await api.getOverviewMetrics();
        if (metrics) {
          setAlertCount(metrics.criticalAlertsCount ?? 0);
          setCaseCount(metrics.openCasesCount ?? 0);
        }
      } catch (err) {
        // Silently handle if unauthenticated or network failure
      }
    };
    fetchBadgeData();
    const interval = setInterval(fetchBadgeData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Neat, Streamlined FinGuard AI Navigation Hierarchy
  const navGroups: NavGroup[] = [
    {
      id: 'overview',
      label: 'OVERVIEW',
      shortLabel: 'Overview',
      items: [
        {
          id: 'overview',
          label: 'Command Center',
          description: 'Institutional threat radar & executive surveillance metrics',
          iconName: 'overview',
          roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER'],
        },
      ],
    },
    {
      id: 'monitoring',
      label: 'TRANSACTION MONITORING',
      shortLabel: 'Monitoring',
      items: [
        {
          id: 'transactions',
          label: 'Transaction Ledger',
          shortLabel: 'Ledger',
          description: 'Multi-rail financial transaction explorer & ledger',
          iconName: 'transactions',
          roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER'],
        },
        {
          id: 'alerts',
          label: 'Alert Queue',
          shortLabel: 'Alerts',
          description: 'Prioritized high-risk alert triage with SLA timers',
          iconName: 'alerts',
          badgeKey: 'alerts',
          roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST'],
        },
      ],
    },
    {
      id: 'investigations',
      label: 'INVESTIGATIONS',
      shortLabel: 'Investigations',
      items: [
        {
          id: 'cases',
          label: 'Case Workspace',
          shortLabel: 'Cases',
          description: 'Forensic dossier management, freeze actions & evidence',
          iconName: 'cases',
          badgeKey: 'cases',
          roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST'],
        },
        {
          id: 'graph',
          label: 'Entity Relationship Graph',
          shortLabel: 'Mule Graph',
          description: 'Mule ring cluster discovery & hardware fingerprint sharing',
          iconName: 'graph',
          roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST'],
        },
        {
          id: 'scenarios',
          label: 'Incident Replay',
          shortLabel: 'Incident Replay',
          description: 'Forensic attack vector scenario replays & simulations',
          iconName: 'scenarios',
          roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST', 'VIEWER'],
        },
      ],
    },
    {
      id: 'risk-intelligence',
      label: 'RISK INTELLIGENCE',
      shortLabel: 'Risk Engine',
      items: [
        {
          id: 'rules',
          label: 'Rule Engine & Simulator',
          shortLabel: 'Rule Simulator',
          description: 'Threshold calibration & historical corpus backtesting',
          iconName: 'rules',
          roles: ['ADMIN', 'RISK_MANAGER'],
        },
        {
          id: 'customers',
          label: 'Customer 360',
          shortLabel: 'Customer 360',
          description: 'Behavioral profiling & hardware binding history',
          iconName: 'customers',
          roles: ['ADMIN', 'RISK_MANAGER', 'FRAUD_ANALYST', 'COMPLIANCE_ANALYST'],
        },
        {
          id: 'merchants',
          label: 'Merchant Intelligence',
          shortLabel: 'Merchant Intel',
          description: 'Counterparty surveillance, chargeback ratios & MCC',
          iconName: 'merchants',
          roles: ['ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'],
        },
      ],
    },
    {
      id: 'analytics-compliance',
      label: 'ANALYTICS & COMPLIANCE',
      shortLabel: 'Compliance',
      items: [
        {
          id: 'analytics',
          label: 'Analytics & Reports',
          shortLabel: 'Reports',
          description: 'Rail allocations, workload & RBI STR export',
          iconName: 'analytics',
          roles: ['ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'],
        },
        {
          id: 'audit',
          label: 'Immutable Audit Ledger',
          shortLabel: 'Audit Ledger',
          description: 'Cryptographically sealed journal of system mutations',
          iconName: 'audit',
          roles: ['ADMIN', 'RISK_MANAGER', 'COMPLIANCE_ANALYST'],
        },
      ],
    },
    {
      id: 'database-admin',
      label: 'DATABASE & ADMINISTRATION',
      shortLabel: 'Database',
      items: [
        {
          id: 'database',
          label: 'Database Explorer',
          shortLabel: 'DB Explorer',
          description: 'PostgreSQL 18 schema catalog & relation viewer',
          iconName: 'database',
          roles: ['ADMIN'],
        },
        {
          id: 'sql-lab',
          label: 'Analytical SQL Lab',
          shortLabel: 'SQL Lab',
          description: 'Guarded read-only analytical query sandbox',
          iconName: 'sql-lab',
          roles: ['ADMIN'],
        },
      ],
    },
  ];

  const demoPersonas = [
    { username: 'rahul.sharma', label: 'Rahul Sharma (Fraud Operations Analyst)', role: 'FRAUD_ANALYST', badge: 'FA-1092' },
    { username: 'priya.nair', label: 'Priya Nair (Risk Engineering Manager)', role: 'RISK_MANAGER', badge: 'RM-0841' },
    { username: 'amit.patel', label: 'Amit Patel (Chief Compliance Officer)', role: 'COMPLIANCE_ANALYST', badge: 'CO-0034' },
    { username: 'admin', label: 'Siddharth Varma (Surveillance Administrator)', role: 'ADMIN', badge: 'SA-0001' },
  ];

  // Resolve current active section and page details
  const getActiveGroupAndItem = () => {
    for (const grp of navGroups) {
      const match = grp.items.find((item) => item.id === currentTab);
      if (match) {
        return { group: grp, item: match };
      }
    }
    return { group: navGroups[0], item: navGroups[0].items[0] };
  };

  const { group: activeGroup, item: activeItem } = getActiveGroupAndItem();

  const handleNavigateItem = (itemId: string) => {
    onNavigate(itemId);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const isGroupActive = (grp: NavGroup) => {
    return grp.items.some((i) => i.id === currentTab);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#060709] text-slate-200 selection:bg-amber-400 selection:text-black">
      {/* ========================================================= */}
      {/* TOP NAVIGATION HEADER (STREAMLINED & ULTRA-CLEAN)         */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#080b11]/98 backdrop-blur-md border-b border-veyra-800 shadow-xl flex-shrink-0">
        {/* ROW 1: BRAND + PRIMARY CATEGORIES + TIME CHRONOMETER + USER */}
        <div className="w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* LEFT: BRAND MARK */}
          <div
            onClick={() => {
              if (currentTab === 'overview' && onReplayIntro) {
                onReplayIntro();
              } else {
                handleNavigateItem('overview');
              }
            }}
            className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
            title="FinGuard AI (Click to return to Command Center or Replay Intro Animation)"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] group-hover:border-amber-400 transition-all">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-black tracking-wider text-slate-100">
              <span>FINGUARD</span>
              <span className="text-amber-400 bg-amber-500/15 px-1 py-0.2 rounded border border-amber-500/30 text-3xs font-extrabold">
                AI
              </span>
            </div>
          </div>

          {/* CENTER: STREAMLINED CATEGORY NAVIGATION (DESKTOP) */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1 flex-shrink-0">
            {navGroups.map((grp) => {
              const visibleItems = grp.items.filter(
                (item) => user && item.roles.includes(user.role)
              );
              if (visibleItems.length === 0) return null;

              const isDirect = grp.items.length === 1;
              const hasActiveChild = isGroupActive(grp);
              const isDropdownOpen = activeDropdown === grp.id;

              const groupBadgeCount = grp.items.reduce((acc, item) => {
                if (item.badgeKey === 'alerts') return acc + alertCount;
                if (item.badgeKey === 'cases') return acc + caseCount;
                return acc;
              }, 0);

              if (isDirect) {
                const singleItem = grp.items[0];
                const isActive = currentTab === singleItem.id;

                return (
                  <button
                    key={grp.id}
                    onClick={() => handleNavigateItem(singleItem.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'text-slate-300 hover:text-amber-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{grp.shortLabel}</span>
                  </button>
                );
              }

              return (
                <div key={grp.id} className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(isDropdownOpen ? null : grp.id)
                    }
                    onMouseEnter={() => setActiveDropdown(grp.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                      hasActiveChild
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : 'text-slate-300 hover:text-amber-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{grp.shortLabel}</span>
                    {groupBadgeCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-3xs font-mono bg-amber-500 text-black font-extrabold animate-pulse">
                        {groupBadgeCount}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                        isDropdownOpen ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  {/* FLOATING DROPDOWN MENU */}
                  {isDropdownOpen && (
                    <div
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-0 mt-1 w-72 bg-[#0a0d14]/98 border border-amber-500/40 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="px-3 py-1 border-b border-veyra-800/80 mb-1 flex items-center justify-between text-3xs font-mono text-slate-400 uppercase tracking-wider">
                        <span>{grp.label}</span>
                        {grp.id === 'database-admin' && (
                          <span className="text-4xs px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800">
                            ADMIN ONLY
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {visibleItems.map((subItem) => {
                          const isSubActive = currentTab === subItem.id;
                          let badgeVal: number | null = null;
                          if (subItem.badgeKey === 'alerts' && alertCount > 0) {
                            badgeVal = alertCount;
                          } else if (subItem.badgeKey === 'cases' && caseCount > 0) {
                            badgeVal = caseCount;
                          }

                          return (
                            <button
                              key={subItem.id}
                              onClick={() => handleNavigateItem(subItem.id)}
                              className={`w-full p-2 rounded-lg text-left transition-all flex items-start gap-2.5 group ${
                                isSubActive
                                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                                  : 'hover:bg-veyra-850/90 text-slate-200 border border-transparent hover:border-amber-500/30'
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSubActive
                                    ? 'bg-black/20 text-black'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-black'
                                }`}
                              >
                                <AppIcon name={subItem.iconName} size={15} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-xs font-semibold truncate ${
                                      isSubActive ? 'text-black' : 'text-slate-100 group-hover:text-amber-300'
                                    }`}
                                  >
                                    {subItem.label}
                                  </span>
                                  {badgeVal !== null && (
                                    <span
                                      className={`text-3xs font-mono font-bold px-1.5 py-0.2 rounded-full ${
                                        isSubActive
                                          ? 'bg-black text-amber-400'
                                          : 'bg-amber-500 text-black'
                                      }`}
                                    >
                                      {badgeVal}
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-3xs line-clamp-1 ${
                                    isSubActive ? 'text-black/80' : 'text-slate-400'
                                  }`}
                                >
                                  {subItem.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* RIGHT: COMPACT CONTROLS (FITS ANY SCREEN WITHOUT HORIZONTAL OVERFLOW) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 font-mono">
            {/* 1. UNIVERSAL COMMAND PALETTE SHORTCUT */}
            {onOpenCommandPalette && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenCommandPalette();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-veyra-900 hover:bg-veyra-850 border border-veyra-750 text-slate-300 text-xs transition-colors"
                title="Universal Command Palette (Ctrl+K)"
              >
                <span className="text-amber-400 font-bold">⌘</span>
                <span className="text-slate-400 text-3xs hidden xl:inline">SEARCH</span>
                <span className="text-4xs bg-veyra-800 px-1 py-0.2 rounded border border-veyra-700 text-slate-400 hidden sm:inline">^K</span>
              </button>
            )}

            {/* 2. CYBERNETIC SOUND DESIGN TOGGLE */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                sounds.setSoundEnabled(next);
                setSoundEnabled(next);
                sounds.playClick();
              }}
              className={`p-1.5 rounded-md border transition-colors ${
                soundEnabled
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-veyra-900 border-veyra-800 text-slate-500 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Web Audio FX: ON (Click to Mute)' : 'Web Audio FX: MUTED (Click to Enable)'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            {/* 3. UNIQUE TEMPORAL SURVEILLANCE CHRONOMETER */}
            <ChronometerWidget />

            {/* 4. PERSONA SWITCHER PILL */}
            <div ref={roleMenuRef} className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-veyra-900 hover:bg-veyra-850 border border-amber-500/30 text-xs font-mono text-slate-200 transition-all"
              >
                <div className="w-4.5 h-4.5 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-3xs">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline font-bold text-slate-200 text-2xs truncate max-w-[80px]">
                  {user?.full_name?.split(' ')[0] || 'User'}
                </span>
                <span className="text-3xs text-amber-400 font-mono hidden md:inline">
                  [{user?.role === 'FRAUD_ANALYST' ? 'ANALYST' : user?.role || 'USER'}]
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* PERSONA SELECTION POPUP */}
              {roleMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-76 bg-[#0a0d14]/98 border border-amber-500/40 rounded-xl shadow-2xl p-3 z-50 font-mono text-xs backdrop-blur-xl animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between border-b border-veyra-800 pb-2 mb-2">
                    <span className="text-2xs font-bold text-amber-400 uppercase">
                      OPERATIONAL CLEARANCE
                    </span>
                    <div className="flex items-center gap-1">
                      {onOpenClearanceTerminal && (
                        <button
                          onClick={() => {
                            setRoleMenuOpen(false);
                            onOpenClearanceTerminal();
                          }}
                          className="text-4xs px-1.5 py-0.5 rounded bg-amber-500 text-black font-extrabold hover:bg-amber-400"
                        >
                          ID PASS
                        </button>
                      )}
                      {onOpenAttackSimulator && (
                        <button
                          onClick={() => {
                            setRoleMenuOpen(false);
                            onOpenAttackSimulator();
                          }}
                          className="text-4xs px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-extrabold hover:bg-red-900 border border-red-800"
                        >
                          ATTACK SIM
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {demoPersonas.map((p) => {
                      const isCurrent = user?.username === p.username;
                      return (
                        <button
                          key={p.username}
                          onClick={() => {
                            quickSwitchUser(p.username);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full p-2 rounded-lg text-left transition-all border ${
                            isCurrent
                              ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                              : 'bg-veyra-950/80 hover:bg-veyra-850 border-veyra-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-100 text-2xs truncate">
                              {p.label.split('(')[0].trim()}
                            </span>
                            <span className="text-3xs px-1.5 py-0.2 rounded bg-veyra-850 text-amber-400 font-mono">
                              {p.badge}
                            </span>
                          </div>
                          <div className="text-3xs text-slate-400 mt-0.5">
                            Role: <strong className="text-amber-400">{p.role}</strong>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2 border-t border-veyra-800 flex justify-between items-center text-2xs text-slate-400">
                    <span>Active: {user?.badge_number || 'FA-1092'}</span>
                    <button
                      onClick={logout}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-veyra-900 border border-veyra-800 text-slate-300 hover:text-amber-400 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: CONTEXTUAL SUB-NAV (SHOWN ONLY IN SPECIFIC MODULES) */}
        {/* ========================================================= */}
        {activeGroup.id !== 'overview' && (
          <div className="bg-[#090c12] border-t border-veyra-800/60 py-1.5 px-3 sm:px-6">
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* LEFT: CONTEXTUAL MODULE BREADCRUMB */}
              <div className="flex items-center gap-2 text-2xs font-mono text-slate-400 flex-shrink-0">
                <span className="text-slate-500 uppercase tracking-wider">
                  ACTIVE:
                </span>
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {activeGroup.label}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-slate-200 font-medium truncate max-w-[200px]">
                  {activeItem.label}
                </span>
              </div>

              {/* RIGHT: CONTEXTUAL SUB-NAV PILLS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none font-mono">
                {activeGroup.items
                  .filter((sub) => user && sub.roles.includes(user.role))
                  .map((sub) => {
                    const isActive = currentTab === sub.id;
                    let badgeValue: number | null = null;
                    if (sub.badgeKey === 'alerts' && alertCount > 0) {
                      badgeValue = alertCount;
                    } else if (sub.badgeKey === 'cases' && caseCount > 0) {
                      badgeValue = caseCount;
                    }

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleNavigateItem(sub.id)}
                        className={`px-3 py-1 rounded-md text-xs font-mono font-bold whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'bg-veyra-900/80 hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 border border-veyra-800 hover:border-amber-500/40'
                        }`}
                      >
                        <span>{sub.label}</span>
                        {badgeValue !== null && (
                          <span
                            className={`ml-1.5 px-1.5 py-0.2 rounded-full text-3xs font-mono font-extrabold ${
                              isActive
                                ? 'bg-black text-amber-400'
                                : 'bg-amber-500 text-black'
                            }`}
                          >
                            {badgeValue}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MOBILE SLIDE-DOWN DRAWER MENU                             */}
        {/* ========================================================= */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0d14] border-t border-veyra-800 px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top duration-200">
            {navGroups.map((grp) => {
              const visibleItems = grp.items.filter(
                (item) => user && item.roles.includes(user.role)
              );
              if (visibleItems.length === 0) return null;

              return (
                <div key={grp.id} className="space-y-1.5">
                  <div className="text-3xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    {grp.label}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {visibleItems.map((item) => {
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigateItem(item.id)}
                          className={`p-2 rounded-lg flex items-center gap-2 text-xs font-mono transition-all ${
                            isActive
                              ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                              : 'bg-veyra-900 text-slate-200 hover:bg-veyra-850 border border-veyra-800'
                          }`}
                        >
                          <AppIcon
                            name={item.iconName}
                            size={15}
                            className={isActive ? 'text-black' : 'text-amber-400'}
                          />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full">
        {children}
      </main>
    </div>
  );
};
