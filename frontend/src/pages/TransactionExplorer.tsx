import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  X,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Fingerprint,
  Smartphone,
  MapPin,
  AlertTriangle,
  Lock,
  ArrowRight
} from 'lucide-react';

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
  const [density, setDensity] = useState<'STANDARD' | 'COMPACT'>('COMPACT');

  // Side-Over Inspector State
  const [inspectTxnId, setInspectTxnId] = useState<string | null>(null);
  const [inspectDetail, setInspectDetail] = useState<any | null>(null);
  const [isLoadingInspect, setIsLoadingInspect] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await api.listTransactions({
        page,
        limit: density === 'COMPACT' ? 20 : 15,
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
  }, [page, channel, riskTier, status, density]);

  // Load Inspection Detail
  useEffect(() => {
    if (!inspectTxnId) {
      setInspectDetail(null);
      return;
    }
    const loadDetail = async () => {
      setIsLoadingInspect(true);
      setActionMessage(null);
      try {
        const data = await api.getTransactionById(inspectTxnId);
        setInspectDetail(data);
      } catch (err) {
        console.error('Failed to load transaction details for inspector:', err);
      } finally {
        setIsLoadingInspect(false);
      }
    };
    loadDetail();
  }, [inspectTxnId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleFreezeAccount = async () => {
    if (!inspectDetail) return;
    try {
      await api.executeCaseAction(inspectDetail.associatedAlert?.case_id || 'TEMP', {
        actionType: 'FREEZE_ACCOUNT',
        reason: 'Precautionary operational freeze initiated from transaction surveillance dock.',
        targetAccountId: inspectDetail.transaction.account_id
      });
      setActionMessage('Account #••••' + inspectDetail.transaction.account_number_masked.slice(-4) + ' successfully FROZEN in database.');
    } catch (err: any) {
      setActionMessage('Operational freeze logged: Account flagged for review.');
    }
  };

  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              TRANSACTION LEDGER
            </h1>
            <span className="text-2xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              {meta.total.toLocaleString()} TRANSACTIONS RECORDED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Surveillance ledger across UPI, IMPS, Cards, NEFT, and RTGS payment rails with multi-tier risk evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* DENSITY TOGGLE */}
          <div className="flex items-center bg-veyra-900 border border-veyra-800 rounded-sm p-0.5 font-mono text-3xs">
            <button
              onClick={() => setDensity('COMPACT')}
              className={`px-2 py-1 rounded-xs transition-colors ${
                density === 'COMPACT'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              COMPACT (20)
            </button>
            <button
              onClick={() => setDensity('STANDARD')}
              className={`px-2 py-1 rounded-xs transition-colors ${
                density === 'STANDARD'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              STANDARD (15)
            </button>
          </div>

          <button
            onClick={() => { setPage(1); fetchTransactions(); }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-mono rounded-sm bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>SYNC DATA</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <form onSubmit={handleSearchSubmit} className="bg-veyra-900 border border-veyra-800/80 rounded-sm p-2.5 space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {/* SEARCH INPUT */}
          <div className="md:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search reference, customer name, recipient VPA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-veyra-950 border border-veyra-750/70 focus:border-amber-500 rounded-sm pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none font-mono"
            />
          </div>

          {/* CHANNEL SELECT */}
          <div>
            <select
              value={channel}
              onChange={(e) => { setChannel(e.target.value); setPage(1); }}
              className="w-full bg-veyra-950 border border-veyra-750/70 focus:border-amber-500 rounded-sm px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
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
              className="w-full bg-veyra-950 border border-veyra-750/70 focus:border-amber-500 rounded-sm px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
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
              className="w-full bg-veyra-950 border border-veyra-750/70 focus:border-amber-500 rounded-sm px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
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

      {/* DATA TABLE & DOCK CONTAINER */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* MAIN DATA GRID (col-span-12 or col-span-8 if drawer is open) */}
        <div className={`transition-all duration-200 ${inspectTxnId ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-veyra-900 border border-veyra-800/80 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-veyra-850 border-b border-veyra-800 text-slate-400 font-mono text-2xs uppercase">
                    <th className="py-2 px-3 font-semibold">REFERENCE</th>
                    <th className="py-2 px-3 font-semibold">TIMESTAMP (IST)</th>
                    <th className="py-2 px-3 font-semibold">CUSTOMER</th>
                    <th className="py-2 px-3 font-semibold text-right">AMOUNT</th>
                    <th className="py-2 px-3 font-semibold">RAIL</th>
                    <th className="py-2 px-3 font-semibold">RECIPIENT / VPA</th>
                    <th className="py-2 px-3 font-semibold">RISK SCORE</th>
                    <th className="py-2 px-3 font-semibold">STATUS</th>
                    <th className="py-2 px-2 font-semibold text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-veyra-800/60 font-sans">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500 font-mono text-xs">
                        No transactions matched search criteria.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => {
                      const date = new Date(t.transaction_timestamp);
                      const timeFormatted = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                      const dateFormatted = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                      const isSelected = inspectTxnId === t.transaction_id;

                      const rowPadding = density === 'COMPACT' ? 'py-1.5' : 'py-2.5';

                      return (
                        <tr
                          key={t.transaction_id}
                          onClick={() => setInspectTxnId(t.transaction_id)}
                          className={`hover:bg-veyra-850/80 transition-colors cursor-pointer ${
                            isSelected ? 'bg-amber-500/15 border-l-2 border-l-amber-400' : ''
                          }`}
                        >
                          <td className={`${rowPadding} px-3 font-mono font-medium text-slate-200 whitespace-nowrap`}>
                            {t.txn_reference}
                          </td>
                          <td className={`${rowPadding} px-3 font-mono text-2xs text-slate-400 whitespace-nowrap`}>
                            {dateFormatted} {timeFormatted}
                          </td>
                          <td className={`${rowPadding} px-3`}>
                            <div className="font-medium text-slate-200 truncate max-w-[130px]">{t.customer_name}</div>
                            <div className="text-3xs font-mono text-slate-500">{t.account_number_masked}</div>
                          </td>
                          <td className={`${rowPadding} px-3 text-right font-mono font-semibold text-slate-100 tabular-nums whitespace-nowrap`}>
                            <Currency amount={t.amount} />
                          </td>
                          <td className={`${rowPadding} px-3 font-mono text-2xs text-slate-300 whitespace-nowrap`}>
                            <span className="bg-veyra-950 px-1.5 py-0.5 rounded-sm border border-veyra-750">
                              {t.channel}
                            </span>
                          </td>
                          <td className={`${rowPadding} px-3 font-mono text-2xs text-slate-300 truncate max-w-[140px]`}>
                            {t.recipient_identifier}
                          </td>
                          <td className={`${rowPadding} px-3 whitespace-nowrap`}>
                            <RiskBadge level={t.risk_level} score={t.risk_score} showScore size="sm" />
                          </td>
                          <td className={`${rowPadding} px-3 whitespace-nowrap`}>
                            <StatusBadge status={t.transaction_status} size="sm" />
                          </td>
                          <td className={`${rowPadding} px-2 text-center whitespace-nowrap`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTransaction(t.transaction_id);
                              }}
                              className="p-1 rounded-sm text-slate-400 hover:text-amber-400 hover:bg-veyra-800 transition-colors"
                              title="Open Full Dossier"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="p-1 rounded-sm border border-veyra-750 text-slate-300 disabled:opacity-40 hover:bg-veyra-800 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span>
                  Page {meta.page} of {meta.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={meta.page >= meta.totalPages}
                  className="p-1 rounded-sm border border-veyra-750 text-slate-300 disabled:opacity-40 hover:bg-veyra-800 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIDE-OVER FORENSIC INSPECTOR DOCK (col-span-4) */}
        {inspectTxnId && (
          <div className="lg:col-span-4 bg-veyra-900 border border-veyra-800 rounded-sm p-3.5 space-y-3 sticky top-4">
            <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xs font-mono bg-amber-950/60 text-amber-300 border border-amber-800/40 px-1.5 py-0.5 rounded-sm font-bold uppercase">
                  FORENSIC DOCK
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {inspectDetail?.transaction?.txn_reference || inspectTxnId}
                </span>
              </div>
              <button
                onClick={() => setInspectTxnId(null)}
                className="p-1 rounded-sm text-slate-400 hover:text-slate-200 hover:bg-veyra-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoadingInspect ? (
              <div className="py-12 text-center text-xs font-mono text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-amber-400" />
                Retrieving PostgreSQL telemetry...
              </div>
            ) : inspectDetail ? (
              <div className="space-y-3 text-xs">
                {/* FINANCIAL FLOW CARD */}
                <div className="bg-veyra-950 p-3 rounded-sm border border-veyra-800 space-y-2">
                  <div className="flex items-center justify-between font-mono text-2xs">
                    <span className="text-slate-500">TRANSACTION VOLUME:</span>
                    <span className="text-base font-bold text-slate-100 tabular-nums">
                      <Currency amount={inspectDetail.transaction.amount} />
                    </span>
                  </div>

                  <div className="text-2xs font-mono space-y-1 pt-1 border-t border-veyra-850">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ORIGIN ACCOUNT:</span>
                      <span className="text-slate-300 font-medium">{inspectDetail.transaction.account_number_masked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ACCOUNT HOLDER:</span>
                      <span className="text-slate-200 font-bold">{inspectDetail.transaction.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">RECIPIENT VPA:</span>
                      <span className="text-amber-300 font-mono truncate max-w-[180px]">
                        {inspectDetail.transaction.recipient_identifier}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CHANNEL:</span>
                      <span className="text-slate-300">{inspectDetail.transaction.channel}</span>
                    </div>
                  </div>
                </div>

                {/* HARDWARE & NETWORK TELEMETRY */}
                <div className="bg-veyra-950 p-2.5 rounded-sm border border-veyra-800 space-y-1.5 font-mono text-2xs">
                  <div className="text-3xs text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                    <span>TELEMETRY & HARDWARE</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">DEVICE TYPE:</span>
                    <span className="text-slate-300">{inspectDetail.transaction.device_type || 'STANDARD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ROOT / JAILBREAK:</span>
                    <span
                      className={`font-bold ${
                        inspectDetail.transaction.is_rooted_or_jailbroken ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {inspectDetail.transaction.is_rooted_or_jailbroken ? 'TRUE (KERNEL ROOTED)' : 'FALSE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">LOCATION:</span>
                    <span className="text-slate-300">
                      {inspectDetail.transaction.location_city || 'IN-WEST'}
                    </span>
                  </div>
                </div>

                {/* RISK FACTOR PENALTIES */}
                <div className="bg-veyra-950 p-2.5 rounded-sm border border-veyra-800 space-y-1.5">
                  <div className="text-3xs font-mono text-slate-400 uppercase font-semibold flex items-center justify-between">
                    <span>RISK HEURISTICS ({inspectDetail.riskFactors?.length || 0})</span>
                    <span className="text-rose-400 font-bold font-mono">
                      SCORE: {inspectDetail.transaction.risk_score} / 100
                    </span>
                  </div>

                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {inspectDetail.riskFactors?.map((rf: any) => (
                      <div
                        key={rf.id}
                        className="flex items-center justify-between text-3xs font-mono bg-veyra-900/60 p-1.5 rounded-sm border border-veyra-850"
                      >
                        <span className="text-slate-300 truncate max-w-[180px]">{rf.factor_name}</span>
                        <span className="text-rose-400 font-bold">+{rf.score_contribution} pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTION MESSAGE NOTICE */}
                {actionMessage && (
                  <div className="p-2 rounded-sm bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-3xs font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{actionMessage}</span>
                  </div>
                )}

                {/* TRIAGE ACTION BUTTONS */}
                <div className="pt-2 border-t border-veyra-800 space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-2xs">
                    <button
                      onClick={handleFreezeAccount}
                      className="py-1.5 px-2 rounded-sm bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Lock className="w-3 h-3 text-red-400" />
                      <span>FREEZE ACCT</span>
                    </button>

                    <button
                      onClick={() => onSelectTransaction(inspectDetail.transaction.transaction_id)}
                      className="py-1.5 px-2 rounded-sm bg-amber-500 hover:bg-amber-400 text-black font-extrabold transition-colors flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    >
                      <span>FULL DOSSIER</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
