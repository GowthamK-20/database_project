import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { Store, AlertTriangle, ShieldCheck, BarChart2 } from 'lucide-react';

export const MerchantIntel: React.FC = () => {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api.listMerchants()
      .then((res) => setMerchants(res.merchants))
      .catch((err) => console.error('Failed to load merchants:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              MERCHANT INTELLIGENCE
            </h1>
            <span className="text-2xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              COUNTERPARTY SURVEILLANCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor merchant chargeback ratios, MCC classifications, and aggregate flagged fraud exposure.
          </p>
        </div>
      </div>

      {/* MERCHANTS TABLE */}
      <div className="bg-veyra-900 border border-veyra-800/80 rounded overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-veyra-850/80 border-b border-veyra-800 text-slate-400 font-mono text-2xs uppercase">
              <th className="py-2.5 px-3 font-semibold">MERCHANT NAME</th>
              <th className="py-2.5 px-3 font-semibold">MCC CATEGORY</th>
              <th className="py-2.5 px-3 font-semibold">VPA ROUTE</th>
              <th className="py-2.5 px-3 font-semibold text-right">CHARGEBACK %</th>
              <th className="py-2.5 px-3 font-semibold text-right">TOTAL VOLUME</th>
              <th className="py-2.5 px-3 font-semibold text-center">FLAGGED TXNS</th>
              <th className="py-2.5 px-3 font-semibold">RISK LEVEL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-veyra-800/60 font-sans">
            {merchants.map((m) => (
              <tr key={m.id} className="hover:bg-veyra-850/60 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-200">{m.name}</div>
                  <div className="text-2xs font-mono text-slate-500">{m.merchant_code}</div>
                </td>
                <td className="py-2.5 px-3 font-mono text-2xs text-slate-300">
                  <span className="bg-veyra-800 px-1.5 py-0.5 rounded border border-veyra-750">
                    {m.category_code}
                  </span>{' '}
                  {m.category_name}
                </td>
                <td className="py-2.5 px-3 font-mono text-2xs text-slate-400">
                  {m.vpa_handle || '—'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-2xs">
                  <span className={parseFloat(m.chargeback_ratio) > 0.03 ? 'text-red-400' : 'text-slate-300'}>
                    {(parseFloat(m.chargeback_ratio) * 100).toFixed(2)}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-100">
                  <Currency amount={m.total_volume} />
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-bold">
                  {parseInt(m.flagged_count) > 0 ? (
                    <span className="text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800">
                      {m.flagged_count}
                    </span>
                  ) : (
                    <span className="text-slate-500">0</span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <RiskBadge level={m.risk_level} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
