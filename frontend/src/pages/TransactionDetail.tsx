import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ArrowLeft,
  ShieldAlert,
  Smartphone,
  MapPin,
  User,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface TransactionDetailProps {
  transactionId: string;
  onBack: () => void;
  onNavigateToCase?: (caseId: string) => void;
}

export const TransactionDetail: React.FC<TransactionDetailProps> = ({
  transactionId,
  onBack,
  onNavigateToCase,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getTransactionById(transactionId)
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load transaction detail:', err))
      .finally(() => setIsLoading(false));
  }, [transactionId]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        Loading forensic dossier for transaction [{transactionId}]...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-red-400 font-mono text-xs">
        Transaction not found.
      </div>
    );
  }

  const { transaction: t, riskFactors, transactionStory, relatedTransactions, associatedAlert } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* BACK NAVIGATION & ACTIONS */}
      <div className="flex items-center justify-between border-b border-veyra-800 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO TRANSACTION EXPLORER</span>
        </button>

        {associatedAlert && (
          <div className="flex items-center gap-2">
            <span className="text-2xs font-mono text-slate-400">LINKED ALERT:</span>
            <span className="text-xs font-mono font-bold text-amber-400">{associatedAlert.alert_code}</span>
            {associatedAlert.case_id && onNavigateToCase && (
              <button
                onClick={() => onNavigateToCase(associatedAlert.case_id)}
                className="flex items-center gap-1 px-2.5 py-1 text-2xs font-mono rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 transition-colors"
              >
                <span>OPEN CASE [{associatedAlert.case_number}]</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* TOP FORENSIC HEADER */}
      <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-mono font-bold text-slate-100 tracking-tight">
              {t.txn_reference}
            </h1>
            <RiskBadge level={t.risk_level} score={t.risk_score} showScore size="md" />
            <StatusBadge status={t.transaction_status} size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-2xs font-mono text-slate-400 pt-0.5">
            <span>RAIL: <strong className="text-slate-200">{t.channel}</strong></span>
            <span>·</span>
            <span>TIME: <strong className="text-slate-200">{new Date(t.transaction_timestamp).toLocaleString('en-IN')}</strong></span>
            <span>·</span>
            <span>RECIPIENT: <strong className="text-slate-200">{t.recipient_identifier}</strong></span>
          </div>
        </div>

        <div className="text-left md:text-right">
          <div className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
            TRANSACTION VALUE
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            <Currency amount={t.amount} />
          </div>
        </div>
      </div>

      {/* UNIQUE FEATURE: FORENSIC TRANSACTION STORY */}
      <div className="bg-veyra-900 border border-blue-900/40 rounded p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold font-mono text-blue-400 uppercase tracking-wide">
          <FileText className="w-4 h-4" />
          <span>SYNTHESIZED FORENSIC TRANSACTION STORY</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-sans bg-veyra-950/60 p-3 rounded border border-veyra-800/80">
          {transactionStory}
        </p>
      </div>

      {/* GRID: RISK EXPLAINABILITY + ENTITY CONTEXT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT (2 COLS): RISK EXPLAINABILITY MATRIX */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wide">
                  RISK EXPLAINABILITY BREAKDOWN
                </span>
              </div>
              <span className="text-2xs font-mono text-slate-400">
                SCORE: {t.risk_score} / 100
              </span>
            </div>

            {riskFactors.length === 0 ? (
              <div className="py-4 text-center text-slate-500 font-mono text-xs">
                Zero anomalous risk vectors triggered. Clean transaction.
              </div>
            ) : (
              <div className="space-y-2">
                {riskFactors.map((f: any) => (
                  <div
                    key={f.id}
                    className="bg-veyra-950 border border-veyra-800 rounded p-3 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {f.factor_name}
                        </span>
                        <RiskBadge level={f.severity} size="sm" />
                      </div>
                      <div className="text-2xs font-mono text-slate-400">
                        {f.rule_name ? `Rule: ${f.rule_name}` : 'Heuristic Engine Evaluation'}
                      </div>
                      {f.details && (
                        <div className="text-2xs font-mono text-slate-500 bg-veyra-900/60 p-1.5 rounded mt-1">
                          {JSON.stringify(f.details)}
                        </div>
                      )}
                    </div>

                    <div className="font-mono text-sm font-bold text-amber-400 flex-shrink-0">
                      +{f.score_contribution} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORICAL RECENT TRANSACTIONS FROM SAME ACCOUNT */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3">
            <span className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wide">
              HISTORICAL BASELINE TRANSACTIONS (SAME ACCOUNT)
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-veyra-800 text-slate-500 font-mono text-2xs uppercase">
                    <th className="py-1.5 px-2">REFERENCE</th>
                    <th className="py-1.5 px-2">TIME</th>
                    <th className="py-1.5 px-2">RAIL</th>
                    <th className="py-1.5 px-2 text-right">AMOUNT</th>
                    <th className="py-1.5 px-2">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-veyra-800/40 font-mono text-2xs">
                  {relatedTransactions.map((rt: any) => (
                    <tr key={rt.transaction_id} className="text-slate-300">
                      <td className="py-1.5 px-2">{rt.txn_reference}</td>
                      <td className="py-1.5 px-2 text-slate-500">{new Date(rt.timestamp).toLocaleTimeString('en-IN')}</td>
                      <td className="py-1.5 px-2">{rt.channel}</td>
                      <td className="py-1.5 px-2 text-right font-medium text-slate-100">
                        <Currency amount={rt.amount} />
                      </td>
                      <td className="py-1.5 px-2">
                        <StatusBadge status={rt.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT (1 COL): CUSTOMER, ACCOUNT & DEVICE DOSSIERS */}
        <div className="space-y-4">
          {/* CUSTOMER & ACCOUNT DOSSIER */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3 font-mono text-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100 uppercase border-b border-veyra-800 pb-2">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>CUSTOMER & ACCOUNT DOSSIER</span>
            </div>

            <div className="space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>NAME:</span>
                <span className="text-slate-200 font-bold">{t.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER CODE:</span>
                <span className="text-slate-200">{t.customer_code}</span>
              </div>
              <div className="flex justify-between">
                <span>PAN (MASKED):</span>
                <span className="text-slate-200">{t.customer_pan}</span>
              </div>
              <div className="flex justify-between">
                <span>PHONE:</span>
                <span className="text-slate-200">{t.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span>KYC STATUS:</span>
                <span className="text-emerald-400 font-bold">{t.kyc_status}</span>
              </div>
              <div className="flex justify-between border-t border-veyra-800 pt-1.5">
                <span>ACCOUNT NUMBER:</span>
                <span className="text-slate-200">{t.account_number_masked}</span>
              </div>
              <div className="flex justify-between">
                <span>ACCOUNT TYPE:</span>
                <span className="text-slate-200">{t.account_type}</span>
              </div>
              <div className="flex justify-between">
                <span>LEDGER BALANCE:</span>
                <span className="text-slate-200 font-bold"><Currency amount={t.current_balance} /></span>
              </div>
            </div>
          </div>

          {/* DEVICE & NETWORK INTELLIGENCE */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3 font-mono text-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100 uppercase border-b border-veyra-800 pb-2">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>DEVICE & TELEMETRY</span>
            </div>

            <div className="space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>HARDWARE TYPE:</span>
                <span className="text-slate-200 font-bold">{t.device_type || 'UNKNOWN'}</span>
              </div>
              <div className="flex justify-between">
                <span>FINGERPRINT:</span>
                <span className="text-slate-400 truncate max-w-[140px]">{t.device_fingerprint || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>ROOTED / COMPROMISED:</span>
                <span className={t.is_rooted_or_jailbroken ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                  {t.is_rooted_or_jailbroken ? 'YES (FLAGGED)' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>DEVICE TRUST SCORE:</span>
                <span className={t.device_trust_score < 50 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {t.device_trust_score ?? '—'} / 100
                </span>
              </div>
              <div className="flex justify-between border-t border-veyra-800 pt-1.5">
                <span>IP ADDRESS:</span>
                <span className="text-slate-200">{t.ip_address || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>GEOLOCATION:</span>
                <span className="text-slate-200">{t.location_city ? `${t.location_city}, ${t.location_state}` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>VPN / TOR RELAY:</span>
                <span className={t.is_vpn_or_tor ? 'text-red-400 font-bold' : 'text-slate-400'}>
                  {t.is_vpn_or_tor ? 'DETECTED' : 'CLEAN'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
