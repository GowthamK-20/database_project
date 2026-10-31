import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { CommandCenter } from './pages/CommandCenter';
import { TransactionExplorer } from './pages/TransactionExplorer';
import { TransactionDetail } from './pages/TransactionDetail';
import { AlertInbox } from './pages/AlertInbox';
import { CaseWorkspace } from './pages/CaseWorkspace';
import { RelationshipExplorer } from './pages/RelationshipExplorer';
import { RuleSimulator } from './pages/RuleSimulator';
import { Customer360 } from './pages/Customer360';
import { MerchantIntel } from './pages/MerchantIntel';
import { AnalyticsReports } from './pages/AnalyticsReports';
import { AuditLedger } from './pages/AuditLedger';
import { DatabaseExplorer } from './pages/DatabaseExplorer';
import { SqlQueryLab } from './pages/SqlQueryLab';
import { IncidentReplay } from './pages/IncidentReplay';
import { FinGuardSplashIntro } from './components/common/FinGuardSplashIntro';
import { OfficerClearanceTerminal } from './components/auth/OfficerClearanceTerminal';
import { AttackSimulatorModal, AttackPreset } from './components/simulation/AttackSimulatorModal';
import { CommandPalette } from './components/common/CommandPalette';
import { StatutoryDossierModal } from './components/common/StatutoryDossierModal';
import { sounds } from './utils/soundEffects';
import { Lock, AlertTriangle, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, quickSwitchUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [sqlLabInitialQuery, setSqlLabInitialQuery] = useState<string | undefined>(undefined);
  const [appStage, setAppStage] = useState<'INTRO' | 'CLEARANCE' | 'DASHBOARD'>('INTRO');

  // Modals & simulation states
  const [isAttackSimulatorOpen, setIsAttackSimulatorOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [attackToast, setAttackToast] = useState<AttackPreset | null>(null);

  // Global Ctrl + K / Cmd + K command palette listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTransaction = (txnId: string) => {
    setSelectedTransactionId(txnId);
    setCurrentTab('transactions');
  };

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    if (tab !== 'transactions') {
      setSelectedTransactionId(null);
    }
  };

  const handleClearanceGranted = async (username: string) => {
    await quickSwitchUser(username);
    setAppStage('DASHBOARD');
  };

  const handleAttackInjected = (preset: AttackPreset) => {
    setAttackToast(preset);
    setTimeout(() => {
      setAttackToast(null);
    }, 9000);
  };

  return (
    <>
      {appStage === 'INTRO' && (
        <FinGuardSplashIntro onComplete={() => setAppStage('CLEARANCE')} />
      )}

      {appStage === 'CLEARANCE' && (
        <OfficerClearanceTerminal
          initialPersona={user?.username || 'admin'}
          onClearanceGranted={handleClearanceGranted}
          onSkip={() => setAppStage('DASHBOARD')}
        />
      )}

      <AppShell
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onReplayIntro={() => setAppStage('INTRO')}
        onOpenClearanceTerminal={() => setAppStage('CLEARANCE')}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAttackSimulator={() => setIsAttackSimulatorOpen(true)}
      >
        {currentTab === 'overview' && (
          <CommandCenter
            onSelectTransaction={handleSelectTransaction}
            onNavigateToAlerts={() => handleNavigate('alerts')}
            onNavigateToCases={() => handleNavigate('cases')}
            onNavigateToLedger={() => handleNavigate('transactions')}
            onNavigateToDatabase={() => handleNavigate('database')}
            onNavigateToSqlLab={() => handleNavigate('sql-lab')}
            onNavigateToRules={() => handleNavigate('rules')}
            onNavigateToGraph={() => handleNavigate('graph')}
            onOpenAttackSimulator={() => setIsAttackSimulatorOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
        )}

        {currentTab === 'transactions' && (
          selectedTransactionId ? (
            <TransactionDetail
              transactionId={selectedTransactionId}
              onBack={() => setSelectedTransactionId(null)}
              onNavigateToCase={() => handleNavigate('cases')}
            />
          ) : (
            <TransactionExplorer onSelectTransaction={handleSelectTransaction} />
          )
        )}

        {currentTab === 'alerts' && (
          <AlertInbox onSelectTransaction={handleSelectTransaction} />
        )}

        {currentTab === 'cases' && <CaseWorkspace />}

        {currentTab === 'graph' && <RelationshipExplorer />}

        {currentTab === 'rules' && <RuleSimulator />}

        {currentTab === 'customers' && (
          <Customer360 onSelectTransaction={handleSelectTransaction} />
        )}

        {currentTab === 'merchants' && <MerchantIntel />}

        {currentTab === 'analytics' && <AnalyticsReports />}

        {currentTab === 'audit' && <AuditLedger />}

        {(currentTab === 'database' || currentTab === 'sql-lab') && user?.role !== 'ADMIN' && (
          <div className="max-w-xl mx-auto my-16 p-8 bg-veyra-900 border border-red-500/30 rounded-xl text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                403 FORBIDDEN // ADMINISTRATIVE CLEARANCE REQUIRED
              </h2>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                PostgreSQL schema exploration and raw SQL workbench execution are strictly restricted to the <span className="text-amber-400 font-mono font-bold">ADMIN</span> role. Current active session is authenticated as <span className="text-slate-200 font-mono">{user?.full_name || 'Anonymous'} ({user?.role || 'NONE'})</span>.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => handleNavigate('overview')}
                className="px-4 py-2 rounded text-xs font-mono bg-veyra-800 hover:bg-veyra-750 text-slate-200 border border-veyra-700 transition-colors"
              >
                Return to Overview
              </button>
              <button
                onClick={() => quickSwitchUser('admin')}
                className="px-4 py-2 rounded text-xs font-mono bg-amber-500 hover:bg-amber-400 text-black font-extrabold transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              >
                Switch to Siddharth Varma (ADMIN)
              </button>
            </div>
          </div>
        )}

        {currentTab === 'database' && user?.role === 'ADMIN' && (
          <DatabaseExplorer
            onNavigateToSqlLab={(initialSql) => {
              if (initialSql) {
                setSqlLabInitialQuery(initialSql);
              }
              setCurrentTab('sql-lab');
            }}
          />
        )}

        {currentTab === 'sql-lab' && user?.role === 'ADMIN' && (
          <SqlQueryLab
            initialSql={sqlLabInitialQuery}
            onNavigateToExplorer={() => setCurrentTab('database')}
          />
        )}

        {currentTab === 'scenarios' && (
          <IncidentReplay
            onNavigate={handleNavigate}
            onSelectTransaction={handleSelectTransaction}
            onQuickSwitchUser={quickSwitchUser}
          />
        )}
      </AppShell>

      {/* TACTICAL THREAT ATTACK TOAST BANNER */}
      {attackToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0e121a] border border-red-500/80 rounded-xl p-4 shadow-[0_0_25px_rgba(239,68,68,0.4)] max-w-md animate-in slide-in-from-bottom-5 font-mono text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-red-400 uppercase tracking-wider">
                THREAT ATTACK INJECTED
              </span>
            </div>
            <button
              onClick={() => setAttackToast(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-2 text-slate-100 font-bold">{attackToast.title}</div>
          <p className="text-3xs text-slate-300 font-sans mt-0.5">
            Synthetic packet detected on <strong className="text-amber-400">{attackToast.targetRail}</strong> rail. Heuristic rule score: <strong className="text-red-400">{attackToast.riskScore}/100</strong>. Auto-blocked by defense latch.
          </p>
          <div className="mt-3 flex items-center gap-2 text-2xs">
            <button
              onClick={() => {
                setAttackToast(null);
                handleNavigate('alerts');
              }}
              className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 font-bold"
            >
              INVESTIGATE ALERT
            </button>
            <button
              onClick={() => {
                setAttackToast(null);
                setIsDossierOpen(true);
              }}
              className="px-2.5 py-1 rounded bg-veyra-900 hover:bg-veyra-800 border border-veyra-750 text-slate-300"
            >
              LEGAL DOSSIER
            </button>
          </div>
        </div>
      )}

      {/* LIVE ATTACK INJECTOR SIMULATOR MODAL */}
      <AttackSimulatorModal
        isOpen={isAttackSimulatorOpen}
        onClose={() => setIsAttackSimulatorOpen(false)}
        onAttackInjected={handleAttackInjected}
        onNavigateToAlerts={() => handleNavigate('alerts')}
        onNavigateToCases={() => handleNavigate('cases')}
      />

      {/* GLOBAL COMMAND PALETTE (CTRL + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onOpenAttackSimulator={() => setIsAttackSimulatorOpen(true)}
        onOpenDossier={() => setIsDossierOpen(true)}
        onOpenClearanceTerminal={() => setAppStage('CLEARANCE')}
        onReplayIntro={() => setAppStage('INTRO')}
        onQuickSwitchUser={quickSwitchUser}
      />

      {/* STATUTORY POLICE & RBI CYBER-CELL CASE FIR DOSSIER */}
      <StatutoryDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
