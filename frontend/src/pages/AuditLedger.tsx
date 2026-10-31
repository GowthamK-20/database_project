import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { History, Shield, RefreshCw } from 'lucide-react';

export const AuditLedger: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [entityFilter, setEntityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.listAuditLogs(entityFilter ? { entity: entityFilter } : {});
      setLogs(res.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              IMMUTABLE AUDIT LEDGER
            </h1>
            <span className="text-2xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              TAMPER-EVIDENT JOURNAL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed operational audit log capturing every state mutation, freeze action, and triage decision.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-mono rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH LOGS</span>
        </button>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center gap-2 bg-veyra-900 border border-veyra-800/80 rounded p-2.5 font-mono text-2xs">
        <span className="text-slate-500 uppercase px-1">FILTER ENTITY:</span>
        {['', 'fraud_cases', 'fraud_alerts', 'accounts', 'devices', 'risk_rules', 'users'].map((ent) => (
          <button
            key={ent}
            onClick={() => setEntityFilter(ent)}
            className={`px-2 py-1 rounded transition-colors ${
              entityFilter === ent
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {ent === '' ? 'ALL ENTITIES' : ent}
          </button>
        ))}
      </div>

      {/* AUDIT TABLE */}
      <div className="bg-veyra-900 border border-veyra-800/80 rounded overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-veyra-850 border-b border-veyra-800 text-slate-400 font-mono text-2xs uppercase">
              <th className="py-2.5 px-3">RECORD ID</th>
              <th className="py-2.5 px-3">TIMESTAMP (IST)</th>
              <th className="py-2.5 px-3">OPERATOR / BADGE</th>
              <th className="py-2.5 px-3">ACTION EVENT</th>
              <th className="py-2.5 px-3">TARGET ENTITY</th>
              <th className="py-2.5 px-3">ENTITY ID</th>
              <th className="py-2.5 px-3">STATE MUTATION (DIFF)</th>
              <th className="py-2.5 px-3 text-right">ORIGIN IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-veyra-800/60 font-mono text-2xs">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No audit events found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-veyra-850/60 text-slate-300">
                  <td className="py-2 px-3 text-slate-500 font-bold">#{log.id}</td>
                  <td className="py-2 px-3 text-slate-400">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-slate-200 font-bold">{log.user_full_name || 'SYSTEM'}</span>{' '}
                    <span className="text-slate-500">[{log.user_badge || 'OP'}]</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40 font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{log.entity_name}</td>
                  <td className="py-2 px-3 text-slate-300 truncate max-w-[120px]">{log.entity_id}</td>
                  <td className="py-2 px-3 max-w-[280px]">
                    <div className="truncate text-3xs text-slate-400 bg-veyra-950 p-1 rounded border border-veyra-850">
                      {log.new_state ? JSON.stringify(log.new_state) : '—'}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">{log.ip_address}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
