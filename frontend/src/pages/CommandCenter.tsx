import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MetricBox } from '../components/common/MetricBox';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { AlertCircle, Clock, ShieldCheck, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface CommandCenterProps {
  onSelectTransaction: (txnId: string) => void;
  onNavigateToAlerts: () => void;
  onNavigateToCases: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onSelectTransaction,
  onNavigateToAlerts,
  onNavigateToCases,
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [attentionItems, setAttentionItems] = useState<any[]>([]);
  const [riskDist, setRiskDist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mRes, aRes, rRes] = await Promise.all([
        api.getOverviewMetrics(),
        api.getAttentionQueue(),
        api.getRiskDistribution(),
      ]);
      setMetrics(mRes);
      setAttentionItems(aRes.items);
      setRiskDist(rRes.distribution);
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              OPERATIONAL COMMAND CENTER
            </h1>
            <span className="text-2xs font-mono text-slate-400">
              · REAL-TIME TRIAGE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Prioritized operational queue answering: What requires immediate risk analyst intervention?
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-mono rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH QUEUE</span>
        </button>
      </div>

      {/* TOP OPERATIONAL ATTENTION BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <MetricBox
          label="CRITICAL ALERTS"
          value={metrics?.criticalAlertsCount ?? '—'}
          subtitle="SLA breaches pending"
          badge="ACTION REQUIRED"
          badgeType="critical"
        />
        <MetricBox
          label="TRANSACTIONS IN REVIEW"
          value={metrics?.transactionsUnderReviewCount ?? '—'}
          subtitle="Pending analyst disposition"
          badge="IN-FLIGHT"
          badgeType="warning"
        />
        <MetricBox
          label="ESTIMATED EXPOSURE"
          value={<Currency amount={metrics?.estimatedExposure ?? 0} />}
          subtitle="Flagged high/critical amounts"
          badge="HELD / AT RISK"
          badgeType="info"
        />
        <MetricBox
          label="ACTIVE FRAUD CASES"
          value={metrics?.openCasesCount ?? '—'}
          subtitle="Open forensic dossiers"
          badge="INVESTIGATION"
          badgeType="info"
        />
      </div>

      {/* CENTER WORKFLOW SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATTENTION REQUIRED QUEUE (2 COLUMNS) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold font-mono text-slate-200 tracking-wide uppercase">
                ATTENTION REQUIRED // HIGH & CRITICAL ALERTS
              </span>
            </div>
            <button
              onClick={onNavigateToAlerts}
              className="text-2xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>VIEW FULL INBOX</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {attentionItems.length === 0 ? (
              <div className="p-8 text-center bg-veyra-900 border border-veyra-800 rounded text-slate-500 text-xs">
                No critical alerts requiring immediate triage.
              </div>
            ) : (
              attentionItems.map((item) => (
                <div
                  key={item.alert_id}
                  onClick={() => onSelectTransaction(item.transaction_id)}
                  className="bg-veyra-900 hover:bg-veyra-850 border border-veyra-800/80 hover:border-slate-700 rounded p-3 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <RiskBadge level={item.severity} score={item.risk_score} showScore size="sm" />
                      <span className="text-xs font-mono font-bold text-slate-100">
                        <Currency amount={item.amount} />
                      </span>
                      <span className="text-2xs font-mono text-slate-400 bg-veyra-800/60 px-1.5 py-0.5 rounded">
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
                      Recipient: <span className="text-slate-300">{item.recipient_identifier}</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1 text-2xs font-mono text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40">
                      <Clock className="w-3 h-3" />
                      <span>SLA: {item.sla_remaining_minutes}m remaining</span>
                    </div>
                    <span className="text-2xs text-slate-500 font-mono">
                      Analyst: {item.analyst_name || 'UNASSIGNED'}
                    </span>
                    <span className="text-2xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-mono">
                      Investigate <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RISK DISTRIBUTION & SYSTEM TELEMETRY */}
        <div className="space-y-6">
          {/* RISK DISTRIBUTION TABLE */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
              <span className="text-xs font-bold font-mono text-slate-200 tracking-wide uppercase">
                RISK DISTRIBUTION (24H)
              </span>
              <span className="text-2xs font-mono text-slate-500">ACTIVE CORPUS</span>
            </div>

            <div className="space-y-2">
              {riskDist.map((rd) => (
                <div key={rd.risk_tier} className="flex items-center justify-between text-xs py-1 border-b border-veyra-800/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <RiskBadge level={rd.risk_tier} size="sm" />
                    <span className="text-2xs font-mono text-slate-400">({rd.count} txns)</span>
                  </div>
                  <div className="font-mono text-slate-200 font-medium">
                    <Currency amount={rd.total_amount} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TELEMETRY & ENGINE HEALTH */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3 font-mono text-2xs">
            <div className="flex items-center gap-2 text-slate-200 font-bold uppercase border-b border-veyra-800 pb-2">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>CORE ENGINE TELEMETRY</span>
            </div>

            <div className="space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>DATABASE DIALECT:</span>
                <span className="text-slate-200 font-bold">PostgreSQL ({metrics?.systemStatus?.mode})</span>
              </div>
              <div className="flex justify-between">
                <span>RULE ENGINE:</span>
                <span className="text-slate-200">{metrics?.systemStatus?.activeRuleEngineVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>EVALUATION LATENCY:</span>
                <span className="text-emerald-400 font-bold">4.2 ms (p99: 8.1 ms)</span>
              </div>
              <div className="flex justify-between">
                <span>AVAILABILITY SLA:</span>
                <span className="text-emerald-400 font-bold">99.98% Guaranteed</span>
              </div>
              <div className="flex justify-between">
                <span>COMPLIANCE REGIME:</span>
                <span className="text-slate-200">RBI-FMR / PMLA 2002</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
