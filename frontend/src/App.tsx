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

const MainApp: React.FC = () => {
  const { quickSwitchUser } = useAuth();
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

        {currentTab === 'database' && (
          <DatabaseExplorer
            onNavigateToSqlLab={(initialSql) => {
              if (initialSql) {
                setSqlLabInitialQuery(initialSql);
              }
              setCurrentTab('sql-lab');
            }}
          />
        )}

        {currentTab === 'sql-lab' && (
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
