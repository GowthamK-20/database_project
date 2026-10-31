import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  AlertCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Network,
  Terminal,
  ArrowLeftRight,
  Briefcase,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { GlobalSurveillanceSimulation } from '../components/simulation/GlobalSurveillanceSimulation';

interface CommandCenterProps {
  onSelectTransaction: (txnId: string) => void;
  onNavigateToAlerts: () => void;
  onNavigateToCases: () => void;
  onNavigateToLedger?: () => void;
  onNavigateToDatabase?: () => void;
  onNavigateToSqlLab?: () => void;
  onNavigateToRules?: () => void;
  onNavigateToGraph?: () => void;
  onOpenAttackSimulator?: () => void;
  onOpenCommandPalette?: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onSelectTransaction,
  onNavigateToAlerts,
  onNavigateToCases,
  onNavigateToLedger,
  onNavigateToDatabase,
  onNavigateToSqlLab,
  onNavigateToRules,
  onNavigateToGraph,
  onOpenAttackSimulator,
  onOpenCommandPalette,
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [attentionItems, setAttentionItems] = useState<any[]>([]);
  const [riskDist, setRiskDist] = useState<any[]>([]);
  const [criticalTxns, setCriticalTxns] = useState<any[]>([]);
  const [activeCases, setActiveCases] = useState<any[]>([]);
  const [muleClusters, setMuleClusters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mRes, aRes, rRes, tRes, cRes, gRes] = await Promise.all([
        api.getOverviewMetrics(),
        api.getAttentionQueue(),
        api.getRiskDistribution(),
        api.listTransactions({ riskTier: 'CRITICAL', limit: 5 }).catch(() => ({ data: [] })),
        api.listCases('OPEN').catch(() => ({ cases: [] })),
        api.getMuleClusters().catch(() => ({ clusters: [] })),
      ]);
      setMetrics(mRes);
      setAttentionItems(aRes.items || []);
      setRiskDist(rRes.distribution || []);
      setCriticalTxns(tRes.data || []);
      setActiveCases((cRes.cases || []).slice(0, 4));
      setMuleClusters((gRes.clusters || []).slice(0, 3));
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Critical count
  const criticalCount = riskDist.find((r) => r.risk_tier === 'CRITICAL')?.count || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. EXECUTIVE THREAT INTELLIGENCE HERO & HEURISTIC ENGINE */}
      <GlobalSurveillanceSimulation
        onNavigateToLedger={onNavigateToLedger || onNavigateToAlerts}
        onNavigateToDatabase={onNavigateToDatabase}
        onNavigateToSqlLab={onNavigateToSqlLab}
        onNavigateToAlerts={onNavigateToAlerts}
        onNavigateToCases={onNavigateToCases}
      />

      {/* 2. SECTION HEADER & ACTION CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider">
              OPERATIONAL COMMAND CENTER
            </h2>
            <span className="text-3xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SURVEILLANCE ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Real-time prioritized triage queue, critical risk indicators, and investigative operational workflows.
          </p>
        </div>

        {/* NEAT ACTION BUTTONS (NO ICON CLUTTER) */}
        <div className="flex items-center gap-2 font-mono text-2xs flex-wrap">
          {onOpenAttackSimulator && (
            <button
              onClick={onOpenAttackSimulator}
              className="px-3 py-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-700/60 font-bold transition-all shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            >
              ⚡ SIMULATE THREAT
            </button>
          )}

          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="px-3 py-1.5 rounded bg-veyra-900 hover:bg-veyra-850 text-slate-300 border border-veyra-750 transition-colors hidden sm:block"
            >
              ⌘ COMMANDS (CTRL+K)
            </button>
          )}

          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition-colors"
          >
            {isLoading ? 'SYNCING...' : 'SYNC'}
          </button>
        </div>
      </div>

      {/* 3. CORE KEY METRICS STRIP (CLEAN TYPOGRAPHY, ZERO ICON NOISE) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono">
        <div className="bg-veyra-900/90 border border-veyra-800 rounded-lg p-3.5 space-y-1 relative overflow-hidden">
          <div className="text-3xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>MONITORED TXNS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            {metrics?.totalTransactionCount?.toLocaleString() ?? '1,012'}
          </div>
          <div className="text-3xs text-slate-500">
            Across 5 payment rails
          </div>
        </div>

        <div className="bg-veyra-900/90 border border-veyra-800 rounded-lg p-3.5 space-y-1 relative overflow-hidden">
          <div className="text-3xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>FLAGGED EXPOSURE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">
            <Currency amount={metrics?.estimatedExposure ?? 0} />
          </div>
          <div className="text-3xs text-slate-500">
            High / Critical risk value
          </div>
        </div>

        <div className="bg-veyra-900/90 border border-veyra-800 rounded-lg p-3.5 space-y-1 relative overflow-hidden">
          <div className="text-3xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>OPEN ALERTS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          </div>
          <div className="text-xl font-bold text-red-400">
            {metrics?.criticalAlertsCount ?? '3'}
          </div>
          <div className="text-3xs text-slate-500">
            P1 SLA breach risk
          </div>
        </div>

        <div className="bg-veyra-900/90 border border-veyra-800 rounded-lg p-3.5 space-y-1 relative overflow-hidden">
          <div className="text-3xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>ACTIVE CASES</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
          </div>
          <div className="text-xl font-bold text-amber-300">
            {metrics?.openCasesCount ?? '4'}
          </div>
          <div className="text-3xs text-slate-500">
            Forensic dockets open
          </div>
        </div>

        <div className="bg-veyra-900/90 border border-veyra-800 rounded-lg p-3.5 space-y-1 col-span-2 md:col-span-1 relative overflow-hidden">
          <div className="text-3xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>CRITICAL OUTLIERS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400">
            {criticalCount || '8'}
          </div>
          <div className="text-3xs text-slate-500">
            Score ≥ 80 / 100
          </div>
        </div>
      </div>

      {/* 4. ANALYST ACTION SHORTCUTS BAR (CLEAN TEXT PILLS, MINIMALIST LAYOUT) */}
      <div className="bg-veyra-900/40 border border-veyra-800 rounded-lg p-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-2xs font-mono">
          <button
            onClick={onNavigateToAlerts}
            className="p-2 rounded bg-veyra-950 border border-veyra-800 hover:border-amber-500/60 hover:text-amber-300 text-slate-300 transition-colors text-center font-bold"
          >
            TRIAGE ALERTS ({metrics?.criticalAlertsCount ?? 3})
          </button>

          {onNavigateToLedger && (
            <button
              onClick={onNavigateToLedger}
              className="p-2 rounded bg-veyra-950 border border-veyra-800 hover:border-amber-500/60 hover:text-amber-300 text-slate-300 transition-colors text-center font-bold"
            >
              TRANSACTION LEDGER
            </button>
          )}

          <button
            onClick={onNavigateToCases}
            className="p-2 rounded bg-veyra-950 border border-veyra-800 hover:border-amber-500/60 hover:text-amber-300 text-slate-300 transition-colors text-center font-bold"
          >
            CASE WORKSPACE
          </button>

          {onNavigateToGraph && (
            <button
              onClick={onNavigateToGraph}
              className="p-2 rounded bg-veyra-950 border border-veyra-800 hover:border-amber-500/60 hover:text-amber-300 text-slate-300 transition-colors text-center font-bold"
            >
              MULE RING GRAPH
            </button>
          )}

          {onNavigateToRules && (
            <button
              onClick={onNavigateToRules}
              className="p-2 rounded bg-veyra-950 border border-veyra-800 hover:border-amber-500/60 hover:text-amber-300 text-slate-300 transition-colors text-center font-bold"
            >
              RULE SIMULATOR
            </button>
          )}

          {onNavigateToSqlLab && (
            <button
              onClick={onNavigateToSqlLab}
              className="p-2 rounded bg-veyra-950 border border-veyra-800 hover:border-amber-500/60 hover:text-amber-300 text-slate-300 transition-colors text-center font-bold"
            >
              SQL QUERY LAB
            </button>
          )}
        </div>
      </div>

      {/* 5. MAIN WORKSPACE INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER COLUMN (8 COLS): ATTENTION QUEUE & HIGH-RISK TRANSACTIONS */}
        <div className="lg:col-span-8 space-y-6">
          {/* PRIORITY ALERTS REQUIRING IMMEDIATE REVIEW */}
          <div className="bg-veyra-900 border border-veyra-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-veyra-800 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                  PRIORITY ALERTS // IMMEDIATE DISPOSITION
                </h3>
              </div>
              <button
                onClick={onNavigateToAlerts}
                className="text-2xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>OPEN ALERT QUEUE</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {attentionItems.length === 0 ? (
                <div className="p-8 text-center bg-veyra-950 border border-veyra-800 rounded text-slate-500 text-xs font-mono">
                  No critical alerts requiring immediate triage.
                </div>
              ) : (
                attentionItems.map((item) => (
                  <div
                    key={item.alert_id}
                    onClick={() => onSelectTransaction(item.transaction_id)}
                    className="bg-veyra-950 hover:bg-veyra-850/80 border border-veyra-800 hover:border-slate-700 rounded-lg p-3 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <RiskBadge level={item.severity} score={item.risk_score} showScore size="sm" />
                        <span className="text-xs font-mono font-bold text-slate-100">
                          <Currency amount={item.amount} />
                        </span>
                        <span className="text-2xs font-mono text-slate-400 bg-veyra-850 px-1.5 py-0.5 rounded border border-veyra-750">
                          {item.channel}
                        </span>
                        <span className="text-2xs font-mono text-slate-500">
                          {item.alert_code}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        Customer: <span className="font-medium text-slate-100">{item.customer_name}</span> ({item.phone_masked})
                      </div>

                      <div className="text-2xs text-slate-400 font-mono">
                        Target Counterparty: <span className="text-slate-300">{item.recipient_identifier}</span>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1 text-2xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        <Clock className="w-3 h-3" />
                        <span>SLA: {item.sla_remaining_minutes}m left</span>
                      </div>
                      <span className="text-2xs text-slate-500 font-mono">
                        Assigned: {item.analyst_name || 'UNASSIGNED'}
                      </span>
                      <span className="text-2xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-mono">
                        Investigate <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECENT CRITICAL-RISK TRANSACTIONS TABLE */}
          <div className="bg-veyra-900 border border-veyra-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-veyra-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                  RECENT HIGH-RISK TRANSACTIONS
                </h3>
              </div>
              {onNavigateToLedger && (
                <button
                  onClick={onNavigateToLedger}
                  className="text-2xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>ALL TRANSACTIONS</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="border border-veyra-800 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-veyra-850/80 border-b border-veyra-800 text-slate-400 font-mono text-2xs uppercase">
                    <th className="py-2 px-3">TXN REFERENCE</th>
                    <th className="py-2 px-3">CUSTOMER</th>
                    <th className="py-2 px-3">RAIL</th>
                    <th className="py-2 px-3 text-right">AMOUNT</th>
                    <th className="py-2 px-3">RISK SCORE</th>
                    <th className="py-2 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-veyra-800/60 font-mono text-2xs">
                  {criticalTxns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No critical transactions recorded.
                      </td>
                    </tr>
                  ) : (
                    criticalTxns.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-veyra-850/50 text-slate-300 transition-colors"
                      >
                        <td
                          onClick={() => onSelectTransaction(t.id)}
                          className="py-2 px-3 text-amber-400 hover:underline cursor-pointer font-bold"
                        >
                          {t.txn_reference}
                        </td>
                        <td className="py-2 px-3">
                          {t.customer_name || 'Customer'}
                        </td>
                        <td className="py-2 px-3 text-slate-400">
                          {t.channel}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-100">
                          <Currency amount={t.amount} />
                        </td>
                        <td className="py-2 px-3">
                          <RiskBadge level={t.risk_level} score={t.risk_score} showScore size="sm" />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => onSelectTransaction(t.id)}
                            className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-0.5"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS): RISK DISTRIBUTION, MULE RINGS & ACTIVE CASES */}
        <div className="lg:col-span-4 space-y-6">
          {/* RISK TIER DISTRIBUTION */}
          <div className="bg-veyra-900 border border-veyra-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
              <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                TRANSACTION RISK BREAKDOWN
              </span>
              <span className="text-3xs font-mono text-slate-400">ACTIVE CORPUS</span>
            </div>

            <div className="space-y-2">
              {riskDist.map((rd) => (
                <div key={rd.risk_tier} className="flex items-center justify-between text-xs py-1.5 border-b border-veyra-800/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <RiskBadge level={rd.risk_tier} size="sm" />
                    <span className="text-2xs font-mono text-slate-400">({rd.count} txns)</span>
                  </div>
                  <div className="font-mono text-slate-200 font-semibold text-2xs">
                    <Currency amount={rd.total_amount} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUSPICIOUS NETWORK & MULE RING CLUSTERS */}
          <div className="bg-veyra-900 border border-veyra-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                  MULE RING CLUSTERS
                </span>
              </div>
              {onNavigateToGraph && (
                <button
                  onClick={onNavigateToGraph}
                  className="text-3xs font-mono text-amber-400 hover:text-amber-300"
                >
                  GRAPH ⟶
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {muleClusters.length === 0 ? (
                <div className="text-2xs font-mono text-slate-500 py-3 text-center">
                  Zero active shared-hardware clusters detected.
                </div>
              ) : (
                muleClusters.map((cluster, i) => (
                  <div
                    key={cluster.device_id || i}
                    className="p-2.5 rounded bg-veyra-950 border border-veyra-800 space-y-1 font-mono text-2xs"
                  >
                    <div className="flex items-center justify-between text-3xs">
                      <span className="text-red-400 font-bold uppercase">CLUSTER #{i + 1}</span>
                      <span className="text-slate-400">{cluster.distinct_customer_count} ACCOUNTS LINKED</span>
                    </div>
                    <div className="text-slate-300 text-3xs truncate">
                      Fingerprint: {cluster.device_fingerprint}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ACTIVE INVESTIGATION DOCKETS */}
          <div className="bg-veyra-900 border border-veyra-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                  ACTIVE CASE DOCKETS
                </span>
              </div>
              <button
                onClick={onNavigateToCases}
                className="text-3xs font-mono text-amber-400 hover:text-amber-300"
              >
                CASES ⟶
              </button>
            </div>

            <div className="space-y-2">
              {activeCases.length === 0 ? (
                <div className="text-2xs font-mono text-slate-500 py-3 text-center">
                  No open forensic cases.
                </div>
              ) : (
                activeCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={onNavigateToCases}
                    className="p-2.5 rounded bg-veyra-950 border border-veyra-800 hover:border-slate-700 cursor-pointer space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between text-2xs font-mono">
                      <span className="font-bold text-slate-200">{c.case_number}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <div className="text-xs text-slate-300 font-medium truncate">
                      {c.title}
                    </div>
                    <div className="flex items-center justify-between text-3xs font-mono text-slate-500">
                      <span>Lead: {c.analyst_name || 'Unassigned'}</span>
                      <span className="text-amber-400 font-semibold">{c.priority}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
