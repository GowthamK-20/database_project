import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { MetricBox } from '../components/common/MetricBox';
import { Download, FileText, CheckCircle2, Shield, BarChart3, Users } from 'lucide-react';

export const AnalyticsReports: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [strReport, setStrReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'STR_REPORT'>('ANALYTICS');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getAnalyticsMetrics(),
      api.getComplianceSTRReport().catch(() => null),
    ])
      .then(([aRes, sRes]) => {
        setAnalytics(aRes);
        setStrReport(sRes);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!strReport?.records) return;
    const headers = Object.keys(strReport.records[0] || {}).join(',');
    const rows = strReport.records.map((r: any) => Object.values(r).map(v => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FINGUARD_RBI_STR_REPORT_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              ANALYTICS & COMPLIANCE REPORTS
            </h1>
            <span className="text-2xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              REGULATORY INTELLIGENCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Macro fraud trends, analyst operational performance, and RBI/PMLA Suspicious Transaction Reporting (STR).
          </p>
        </div>

        {/* TAB TOGGLE */}
        <div className="flex items-center gap-1 bg-veyra-900 border border-veyra-750 p-1 rounded font-mono text-2xs">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'ANALYTICS' ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            METRICS & WORKLOAD
          </button>
          <button
            onClick={() => setActiveTab('STR_REPORT')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'STR_REPORT' ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RBI STR COMPLIANCE EXTRACT
          </button>
        </div>
      </div>

      {activeTab === 'ANALYTICS' ? (
        <div className="space-y-6">
          {/* TOP METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <MetricBox
              label="TOTAL CORPUS VOLUME"
              value={<Currency amount={analytics?.overall?.totalVolume ?? 0} />}
              subtitle={`${analytics?.overall?.totalTransactions ?? 0} transactions recorded`}
              badge="LEDGER"
              badgeType="info"
            />
            <MetricBox
              label="FLAGGED FRAUD VOLUME"
              value={<Currency amount={analytics?.overall?.flaggedVolume ?? 0} />}
              subtitle={`${analytics?.overall?.flaggedTransactions ?? 0} flagged transactions`}
              badge="HIGH / CRITICAL"
              badgeType="critical"
            />
            <MetricBox
              label="AGGREGATE FRAUD RATIO"
              value={`${analytics?.overall?.fraudRatioPct ?? 0}%`}
              subtitle="Industry benchmark: < 1.50%"
              badge="STABLE"
              badgeType="safe"
            />
            <MetricBox
              label="AVG TRIAGE TIME"
              value="14.2 mins"
              subtitle="P90 SLA Compliance: 97.4%"
              badge="SLA NORMAL"
              badgeType="safe"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PAYMENT RAIL BREAKDOWN */}
            <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3">
              <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                PAYMENT RAIL VOLUME ALLOCATION
              </span>

              <div className="space-y-2">
                {analytics?.channelDistribution?.map((ch: any) => (
                  <div key={ch.channel} className="p-3 rounded bg-veyra-950 border border-veyra-800 flex justify-between items-center font-mono text-xs">
                    <div>
                      <span className="font-bold text-slate-100">{ch.channel}</span>
                      <span className="text-2xs text-slate-500 ml-2">({ch.count} transactions)</span>
                    </div>
                    <div className="font-bold text-slate-200">
                      <Currency amount={ch.total_amount} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ANALYST OPERATIONAL WORKLOAD */}
            <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3">
              <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                OPERATIONAL ANALYST WORKLOAD
              </span>

              <div className="space-y-2 font-mono text-2xs">
                {analytics?.analystWorkload?.map((w: any) => (
                  <div key={w.analyst_id} className="p-3 rounded bg-veyra-950 border border-veyra-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-100">{w.full_name}</span>
                      <span className="text-slate-400">[{w.badge_number}]</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-slate-400 pt-1 border-t border-veyra-850">
                      <div>
                        <span>ACTIVE CASES:</span>
                        <strong className="text-amber-400 block">{w.active_cases}</strong>
                      </div>
                      <div>
                        <span>ACTIVE ALERTS:</span>
                        <strong className="text-amber-300 block">{w.active_alerts}</strong>
                      </div>
                      <div>
                        <span>CONFIRMED FRAUD:</span>
                        <strong className="text-red-400 block">{w.fraud_confirmed_count}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* RBI STR REPORT VIEW */
        <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
            <div>
              <div className="text-xs font-bold font-mono text-slate-100">
                REGULATORY STANDARD: {strReport?.reportHeader?.regulatoryStandard}
              </div>
              <div className="text-2xs font-mono text-slate-400 mt-0.5">
                GENERATED: {new Date(strReport?.reportHeader?.generatedAt || '').toLocaleString('en-IN')} · RECORDS: {strReport?.records?.length || 0}
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs transition-colors font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT COMPLIANT CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-veyra-850 border-b border-veyra-800 text-slate-400 font-mono text-2xs uppercase">
                  <th className="py-2.5 px-3">TXN REFERENCE</th>
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3 text-right">AMOUNT (INR)</th>
                  <th className="py-2.5 px-3">RAIL</th>
                  <th className="py-2.5 px-3">ACCOUNT HOLDER</th>
                  <th className="py-2.5 px-3">PAN</th>
                  <th className="py-2.5 px-3">SEVERITY</th>
                  <th className="py-2.5 px-3">SUSPICION GROUNDS</th>
                  <th className="py-2.5 px-3">OFFICER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-veyra-800/60 font-mono text-2xs">
                {strReport?.records?.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-veyra-850/60 text-slate-300">
                    <td className="py-2.5 px-3 font-bold text-slate-100">{r.transaction_ref}</td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(r.transaction_timestamp).toLocaleDateString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                      <Currency amount={r.amount_inr} />
                    </td>
                    <td className="py-2.5 px-3">{r.payment_rail}</td>
                    <td className="py-2.5 px-3 text-slate-100">{r.account_holder_name}</td>
                    <td className="py-2.5 px-3">{r.pan_number}</td>
                    <td className="py-2.5 px-3">
                      <RiskBadge level={r.severity} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[200px]">{r.suspicion_grounds}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.reporting_officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
