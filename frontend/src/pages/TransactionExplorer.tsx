import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Eye } from 'lucide-react';

interface TransactionExplorerProps {
  onSelectTransaction: (txnId: string) => void;
}

export const TransactionExplorer: React.FC<TransactionExplorerProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('');
  const [riskTier, setRiskTier] = useState('');
  const [status, setStatus] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [page, setPage] = useState(1);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await api.listTransactions({
        page,
        limit: 15,
        search,
        channel,
        riskTier,
        status,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
      });
      setTransactions(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, channel, riskTier, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
            TRANSACTION EXPLORER // INVESTIGATION LEDGER
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query across historical and real-time transaction traffic with multi-parameter fraud filters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPage(1); fetchTransactions(); }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-mono rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>SYNC DATA</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <form onSubmit={handleSearchSubmit} className="bg-veyra-900 border border-veyra-800/80 rounded p-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {/* SEARCH INPUT */}
          <div className="md:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search reference, customer name, recipient VPA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-veyra-950 border border-veyra-750/70 focus:border-blue-500 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none font-mono"
            />
          </div>

          {/* CHANNEL SELECT */}
          <div>
            <select
              value={channel}
              onChange={(e) => { setChannel(e.target.value); setPage(1); }}
              className="w-full bg-veyra-950 border border-veyra-750/70 focus:border-blue-500 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
            >
              <option value="">RAIL: ALL CHANNELS</option>
              <option value="UPI">UPI</option>
              <option value="IMPS">IMPS</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="CARD_POS">CARD POS</option>
              <option value="CARD_ECOM">CARD E-COMMERCE</option>
            </select>
          </div>

          {/* RISK TIER SELECT */}
          <div>
            <select
              value={riskTier}
              onChange={(e) => { setRiskTier(e.target.value); setPage(1); }}
              className="w-full bg-veyra-950 border border-veyra-750/70 focus:border-blue-500 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
            >
              <option value="">RISK: ALL TIERS</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
              <option value="SAFE">SAFE</option>
            </select>
          </div>

          {/* STATUS SELECT */}
          <div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-veyra-950 border border-veyra-750/70 focus:border-blue-500 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
            >
              <option value="">STATUS: ALL</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING_REVIEW">PENDING REVIEW</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>
      </form>

      {/* COMPACT DATA TABLE */}
      <div className="bg-veyra-900 border border-veyra-800/80 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-veyra-850/80 border-b border-veyra-800 text-slate-400 font-mono text-2xs uppercase">
                <th className="py-2.5 px-3 font-semibold">REFERENCE</th>
                <th className="py-2.5 px-3 font-semibold">TIMESTAMP (IST)</th>
                <th className="py-2.5 px-3 font-semibold">CUSTOMER</th>
                <th className="py-2.5 px-3 font-semibold text-right">AMOUNT</th>
                <th className="py-2.5 px-3 font-semibold">RAIL</th>
                <th className="py-2.5 px-3 font-semibold">RECIPIENT / VPA</th>
                <th className="py-2.5 px-3 font-semibold">LOCATION</th>
                <th className="py-2.5 px-3 font-semibold">RISK SCORE</th>
                <th className="py-2.5 px-3 font-semibold">STATUS</th>
                <th className="py-2.5 px-2 font-semibold text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-veyra-800/60 font-sans">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No transactions matched search criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const date = new Date(t.transaction_timestamp);
                  const timeFormatted = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  const dateFormatted = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

                  return (
                    <tr
                      key={t.transaction_id}
                      onClick={() => onSelectTransaction(t.transaction_id)}
                      className="hover:bg-veyra-850/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-2 px-3 font-mono font-medium text-slate-200">
                        {t.txn_reference}
                      </td>
                      <td className="py-2 px-3 font-mono text-2xs text-slate-400">
                        {dateFormatted} {timeFormatted}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-200 truncate max-w-[130px]">{t.customer_name}</div>
                        <div className="text-2xs font-mono text-slate-500">{t.account_number_masked}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-100">
                        <Currency amount={t.amount} />
                      </td>
                      <td className="py-2 px-3 font-mono text-2xs text-slate-300">
                        <span className="bg-veyra-800 px-1.5 py-0.5 rounded border border-veyra-750">
                          {t.channel}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-2xs text-slate-300 truncate max-w-[160px]">
                        {t.recipient_identifier}
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-2xs">
                        {t.location_city || '—'}
                      </td>
                      <td className="py-2 px-3">
                        <RiskBadge level={t.risk_level} score={t.risk_score} showScore size="sm" />
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={t.transaction_status} size="sm" />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTransaction(t.transaction_id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-veyra-800 transition-colors"
                          title="Open Full Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="flex items-center justify-between px-3 py-2 bg-veyra-850/40 border-t border-veyra-800 text-2xs font-mono text-slate-400">
          <div>
            Showing {transactions.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0} to{' '}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
              className="p-1 rounded border border-veyra-750 text-slate-300 disabled:opacity-40 hover:bg-veyra-800 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>
              Page {meta.page} of {meta.totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page >= meta.totalPages}
              className="p-1 rounded border border-veyra-750 text-slate-300 disabled:opacity-40 hover:bg-veyra-800 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
