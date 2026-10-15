import React, { useState } from 'react';
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
import { Lock } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, quickSwitchUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [sqlLabInitialQuery, setSqlLabInitialQuery] = useState<string | undefined>(undefined);

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

  return (
    <AppShell
      currentTab={currentTab}
      onNavigate={handleNavigate}
    >
        {currentTab === 'overview' && (
          <CommandCenter
            onSelectTransaction={handleSelectTransaction}
            onNavigateToAlerts={() => handleNavigate('alerts')}
            onNavigateToCases={() => handleNavigate('cases')}
            onNavigateToLedger={() => handleNavigate('transactions')}
            onNavigateToDatabase={() => handleNavigate('database')}
            onNavigateToSqlLab={() => handleNavigate('sql-lab')}
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
                PostgreSQL schema exploration and raw SQL workbench execution are strictly restricted to the <span className="text-blue-400 font-mono font-bold">ADMIN</span> role. Current active session is authenticated as <span className="text-slate-200 font-mono">{user?.full_name || 'Anonymous'} ({user?.role || 'NONE'})</span>.
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
                className="px-4 py-2 rounded text-xs font-mono bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
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
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
