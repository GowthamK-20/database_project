import React from 'react';
import { ShieldCheck, Printer, Download, X, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { Currency } from './Currency';
import { RiskBadge } from './RiskBadge';

interface StatutoryDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: any;
  transactionData?: any;
}

export const StatutoryDossierModal: React.FC<StatutoryDossierModalProps> = ({
  isOpen,
  onClose,
  caseData,
  transactionData,
}) => {
  if (!isOpen) return null;

  const docketId = caseData?.case_code || transactionData?.txn_reference || 'FIR-CYBER-MUM-2026-9041';
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-4xl bg-[#0b0e14] border border-amber-500/40 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* NON-PRINT HEADER ACTIONS BAR */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#07090e] border-b border-veyra-800 print:hidden flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
            <FileText className="w-4 h-4" />
            <span>STATUTORY POLICE & RBI CYBER-CELL EVIDENTIARY DOSSIER</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT / SAVE AS PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-veyra-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOSSIER BODY */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 font-mono text-xs text-slate-200 print:text-black print:p-6 print:overflow-visible">
          {/* STATUTORY HEADER WITH WATERMARK */}
          <div className="border-b-2 border-amber-500/80 pb-5 text-center space-y-1.5 print:border-black">
            <div className="text-3xs uppercase tracking-widest text-slate-400 print:text-slate-700">
              GOVERNMENT OF INDIA // FINANCIAL INTELLIGENCE UNIT (FIU-IND) & CYBER CRIME CELL
            </div>
            <div className="text-base sm:text-lg font-black tracking-wider text-slate-100 print:text-black uppercase">
              STATUTORY SUSPICIOUS TRANSACTION REPORT & EVIDENCE DOSSIER
            </div>
            <div className="text-3xs text-amber-400 print:text-slate-800 font-bold">
              FILED UNDER SECTION 12 OF PMLA ACT 2002 · COMPLIANCE WITH RBI MASTER DIRECTIONS ON FRAUD
            </div>
            <div className="flex justify-between items-center text-3xs text-slate-400 pt-2 print:text-slate-700">
              <span>DOCKET REF: <strong>{docketId}</strong></span>
              <span>GENERATED: <strong>{currentDate} {currentTime} IST</strong></span>
              <span>CLASSIFICATION: <strong className="text-red-400 print:text-red-700">CONFIDENTIAL / RESTRICTED</strong></span>
            </div>
          </div>

          {/* 1. SUSPECT & ACCOUNT ENTITY PROFILE */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-400 print:text-black uppercase border-b border-veyra-800 pb-1 flex items-center gap-1.5">
              <span>1. PRIMARY SUBJECT & ACCOUNT PROFILE</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-veyra-950/80 p-3.5 rounded-lg border border-veyra-800 print:bg-slate-100 print:border-slate-300 print:text-black">
              <div>
                <span className="text-3xs text-slate-400 print:text-slate-600 block">ACCOUNT HOLDER:</span>
                <strong className="text-slate-100 print:text-black">{caseData?.customer_name || transactionData?.customer_name || 'Sunita Rao'}</strong>
              </div>
              <div>
                <span className="text-3xs text-slate-400 print:text-slate-600 block">ACCOUNT NUMBER:</span>
                <strong className="text-slate-100 print:text-black">{caseData?.account_number_masked || transactionData?.account_number_masked || '•••• •••• •••• 3290'}</strong>
              </div>
              <div>
                <span className="text-3xs text-slate-400 print:text-slate-600 block">PAN IDENTIFIER:</span>
                <strong className="text-slate-100 print:text-black">{caseData?.pan_masked || transactionData?.pan_masked || 'ABCDE••••F'}</strong>
              </div>
              <div>
                <span className="text-3xs text-slate-400 print:text-slate-600 block">KYC STATUS:</span>
                <strong className="text-emerald-400 print:text-emerald-700">VERIFIED (AADHAAR E-KYC)</strong>
              </div>
            </div>
          </div>

          {/* 2. TRANSACTION EXHIBIT & MONETARY FLOW */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-400 print:text-black uppercase border-b border-veyra-800 pb-1 flex items-center gap-1.5">
              <span>2. TRANSACTION FORENSIC EXHIBIT</span>
            </div>

            <div className="overflow-x-auto border border-veyra-800 rounded-lg print:border-slate-300">
              <table className="w-full text-left border-collapse text-2xs print:text-black">
                <thead className="bg-veyra-900 border-b border-veyra-800 text-slate-400 print:bg-slate-200 print:text-black">
                  <tr>
                    <th className="p-2">TXN REFERENCE</th>
                    <th className="p-2">TIMESTAMP (IST)</th>
                    <th className="p-2 text-right">AMOUNT (INR)</th>
                    <th className="p-2">PAYMENT RAIL</th>
                    <th className="p-2">RECIPIENT / VPA</th>
                    <th className="p-2">RISK SCORE</th>
                    <th className="p-2">DECISION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-veyra-800/80 font-mono text-3xs print:divide-slate-300">
                  <tr className="hover:bg-veyra-900/40">
                    <td className="p-2 font-bold text-slate-100 print:text-black">{transactionData?.txn_reference || 'TXN-2026-9001'}</td>
                    <td className="p-2 text-slate-400 print:text-slate-800">{transactionData?.timestamp || '2026-10-14 02:45:18 IST'}</td>
                    <td className="p-2 text-right font-bold text-slate-100 print:text-black">
                      <Currency amount={transactionData?.amount || 380000} />
                    </td>
                    <td className="p-2">{transactionData?.channel || 'UPI // IMPS'}</td>
                    <td className="p-2 text-red-400 print:text-red-700 font-bold">{transactionData?.recipient_identifier || 'karan.mule99@okaxis'}</td>
                    <td className="p-2 font-bold text-rose-400 print:text-rose-700">87 / 100 (CRITICAL)</td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800 print:bg-rose-100 print:text-rose-800 print:border-rose-400">
                        EMERGENCY FREEZE
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. HARDWARE & NETWORK TELEMETRY EVIDENCE */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-400 print:text-black uppercase border-b border-veyra-800 pb-1">
              3. CYBERNETIC HARDWARE & TELEMETRY EVIDENCE
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-veyra-950 border border-veyra-800 print:bg-slate-100 print:border-slate-300">
                <span className="text-3xs text-slate-400 print:text-slate-600 block">DEVICE SIGNATURE:</span>
                <strong className="text-slate-200 print:text-black">Xiaomi Redmi Note 10 (Android 12)</strong>
                <span className="text-4xs text-red-400 print:text-red-700 block mt-1">is_rooted_or_jailbroken = TRUE</span>
                <span className="text-4xs text-slate-500">Hardware Trust Score: 15 / 100</span>
              </div>

              <div className="p-3 rounded-lg bg-veyra-950 border border-veyra-800 print:bg-slate-100 print:border-slate-300">
                <span className="text-3xs text-slate-400 print:text-slate-600 block">NETWORK TELEMETRY:</span>
                <strong className="text-slate-200 print:text-black">103.212.45.18 (Jaipur, RJ)</strong>
                <span className="text-4xs text-amber-400 print:text-amber-700 block mt-1">Datacenter / Proxy ASN Detected</span>
                <span className="text-4xs text-slate-500">VPN / Tor Relay Node = TRUE</span>
              </div>

              <div className="p-3 rounded-lg bg-veyra-950 border border-veyra-800 print:bg-slate-100 print:border-slate-300">
                <span className="text-3xs text-slate-400 print:text-slate-600 block">TEMPORAL OUTLIER:</span>
                <strong className="text-slate-200 print:text-black">02:45:18 AM IST</strong>
                <span className="text-4xs text-rose-400 print:text-rose-700 block mt-1">Nocturnal Anomaly (+30 pts penalty)</span>
                <span className="text-4xs text-slate-500">Dormancy Reactivation: 180 Days</span>
              </div>
            </div>
          </div>

          {/* 4. EVITENARY SUMMARY / XAI NARRATIVE */}
          <div className="space-y-1.5 bg-veyra-950 p-4 rounded-lg border border-amber-500/30 print:bg-slate-100 print:border-slate-300 print:text-black">
            <div className="text-3xs text-amber-400 print:text-slate-800 font-bold uppercase">
              4. FORENSIC NARRATIVE & GROUNDS FOR LAW ENFORCEMENT ESCALATION:
            </div>
            <p className="text-2xs text-slate-300 print:text-black leading-relaxed font-sans">
              "Account #••••3290 maintained zero debit velocity for 180 consecutive calendar days. At 02:45:18 AM IST (outside normal diurnal customer activity baseline), a ₹3,80,000 liquidation transfer was attempted toward suspected mule consolidation VPA (karan.mule99@okaxis). The authentication packet exhibited root-compromised Android kernel signatures routed through an anonymizing proxy node. FinGuard AI multi-vector risk engine scored the attempt at 87/100 (CRITICAL). Operational soft-freeze executed under Section 12 PMLA."
            </p>
          </div>

          {/* 5. STATUTORY SIGNATURE & ATTESTATION BLOCK */}
          <div className="pt-6 border-t border-veyra-800 print:border-black grid grid-cols-2 gap-6 text-3xs">
            <div>
              <span className="text-slate-500 print:text-slate-600 block">INVESTIGATING OFFICER:</span>
              <strong className="text-slate-200 print:text-black text-xs block mt-0.5">Rahul Sharma</strong>
              <span className="text-slate-400 print:text-slate-700">Senior Fraud Operations Analyst · Badge: FA-1092</span>
              <span className="text-4xs text-emerald-400 print:text-emerald-700 block mt-1">Cryptographically Signed via Smart ID Pass Token</span>
            </div>

            <div className="text-right">
              <span className="text-slate-500 print:text-slate-600 block">COMPLIANCE ATTESTATION:</span>
              <strong className="text-slate-200 print:text-black text-xs block mt-0.5">Amit Patel</strong>
              <span className="text-slate-400 print:text-slate-700">Chief Compliance Officer · Badge: CO-0034</span>
              <span className="text-4xs text-slate-400 print:text-slate-700 block mt-1">FIU-IND Reporting Gateway Status: ACKNOWLEDGED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
