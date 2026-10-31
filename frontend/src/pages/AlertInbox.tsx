import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Bell, Clock, Check, ArrowUpRight, UserCheck, RefreshCw, Eye } from 'lucide-react';

interface AlertInboxProps {
  onSelectTransaction: (txnId: string) => void;
  onNavigateToCase?: (caseId: string) => void;
}

export const AlertInbox: React.FC<AlertInboxProps> = ({ onSelectTransaction }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await api.listAlerts(statusFilter || undefined, severityFilter || undefined);
      setAlerts(res.alerts);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    try {
      await api.updateAlertStatus(alertId, newStatus, user?.id);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to update alert status:', err);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              FRAUD ALERT QUEUE
            </h1>
            <span className="text-2xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              {alerts.length} PENDING ALERTS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Prioritized fraud alerts with active SLA timers, risk severity indicators, and analyst claim controls.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-mono rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH ALERTS</span>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-veyra-900 border border-veyra-800/80 rounded p-2.5">
        <span className="text-2xs font-mono text-slate-500 uppercase px-1">STATUS:</span>
        {['', 'NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'ESCALATED', 'RESOLVED_FRAUD'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-2 py-1 rounded text-2xs font-mono transition-colors ${
              statusFilter === st
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {st === '' ? 'ALL' : st.replace('_', ' ')}
          </button>
        ))}

        <div className="h-4 w-px bg-veyra-800 mx-2 hidden md:block" />

        <span className="text-2xs font-mono text-slate-500 uppercase px-1">SEVERITY:</span>
        {['', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-2 py-1 rounded text-2xs font-mono transition-colors ${
              severityFilter === sev
                ? 'bg-slate-700 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {sev === '' ? 'ALL' : sev}
          </button>
        ))}
      </div>

      {/* ALERT TABLE */}
      <div className="bg-veyra-900 border border-veyra-800/80 rounded overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-veyra-850/80 border-b border-veyra-800 text-slate-400 font-mono text-2xs uppercase">
              <th className="py-2.5 px-3 font-semibold">SEVERITY</th>
              <th className="py-2.5 px-3 font-semibold">ALERT CODE</th>
              <th className="py-2.5 px-3 font-semibold">TRANSACTION</th>
              <th className="py-2.5 px-3 font-semibold">CUSTOMER</th>
              <th className="py-2.5 px-3 font-semibold text-right">EXPOSURE</th>
              <th className="py-2.5 px-3 font-semibold">SCORE</th>
              <th className="py-2.5 px-3 font-semibold">SLA REMAINING</th>
              <th className="py-2.5 px-3 font-semibold">ANALYST</th>
              <th className="py-2.5 px-3 font-semibold">STATUS</th>
              <th className="py-2.5 px-3 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-veyra-800/60 font-sans">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 font-mono text-xs">
                  No alerts in this triage bucket.
                </td>
              </tr>
            ) : (
              alerts.map((a) => (
                <tr key={a.alert_id} className="hover:bg-veyra-850/60 transition-colors">
                  <td className="py-2.5 px-3">
                    <RiskBadge level={a.severity} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                    {a.alert_code}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-2xs text-amber-400 hover:underline cursor-pointer" onClick={() => onSelectTransaction(a.transaction_id)}>
                    {a.txn_reference}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-200">{a.customer_name}</div>
                    <div className="text-2xs font-mono text-slate-500">{a.phone_masked}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-100">
                    <Currency amount={a.amount} />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                    {a.risk_score}/100
                  </td>
                  <td className="py-2.5 px-3 font-mono text-2xs">
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/40 w-fit">
                      <Clock className="w-3 h-3" />
                      {a.sla_remaining_minutes}m
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-2xs text-slate-400">
                    {a.analyst_name || <span className="text-slate-600">UNASSIGNED</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={a.alert_status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1">
                    {a.alert_status === 'NEW' && (
                      <button
                        onClick={() => handleUpdateStatus(a.alert_id, 'INVESTIGATING')}
                        className="px-2 py-0.5 rounded text-2xs font-mono bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-colors"
                      >
                        CLAIM
                      </button>
                    )}
                    {a.alert_status === 'INVESTIGATING' && (
                      <button
                        onClick={() => handleUpdateStatus(a.alert_id, 'ESCALATED')}
                        className="px-2 py-0.5 rounded text-2xs font-mono bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 transition-colors"
                      >
                        ESCALATE
                      </button>
                    )}
                    <button
                      onClick={() => onSelectTransaction(a.transaction_id)}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors inline-flex align-middle"
                      title="Inspect Transaction"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
