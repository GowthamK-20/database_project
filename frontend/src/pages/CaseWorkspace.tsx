import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatutoryDossierModal } from '../components/common/StatutoryDossierModal';
import { sounds } from '../utils/soundEffects';
import {
  Briefcase,
  Clock,
  Shield,
  Lock,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export const CaseWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<any>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [activeModalAction, setActiveModalAction] = useState<string | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  const loadCases = async () => {
    try {
      const res = await api.listCases();
      setCases(res.cases);
      if (res.cases.length > 0 && !selectedCaseId) {
        setSelectedCaseId(res.cases[0].id);
      }
    } catch (err) {
      console.error('Failed to load cases:', err);
    }
  };

  const loadCaseDetail = async (id: string) => {
    try {
      const res = await api.getCaseById(id);
      setCaseDetail(res);
    } catch (err) {
      console.error('Failed to load case detail:', err);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadCaseDetail(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !noteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      await api.addCaseNote(selectedCaseId, noteContent);
      setNoteContent('');
      loadCaseDetail(selectedCaseId);
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleExecuteAction = async (actionType: string) => {
    if (!selectedCaseId) return;

    if (actionType === 'FREEZE_ACCOUNT' || actionType === 'BLOCK_DEVICE') {
      sounds.playFreezeAction();
    } else if (actionType === 'CLOSE_CONFIRMED_FRAUD') {
      sounds.playThreatAlert();
    } else if (actionType === 'CLOSE_FALSE_POSITIVE') {
      sounds.playAccessGranted();
    }

    try {
      await api.executeCaseAction(selectedCaseId, {
        actionType,
        reason: actionReason || 'Analyst operational disposition',
        targetAccountId: caseDetail?.transaction?.account_id,
        targetDeviceId: caseDetail?.transaction?.device_id,
      });
      setActiveModalAction(null);
      setActionReason('');
      loadCaseDetail(selectedCaseId);
      loadCases();
    } catch (err) {
      console.error('Failed to execute action:', err);
    }
  };

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-veyra-800 pb-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              CASE INVESTIGATION WORKSPACE
            </h1>
            <span className="text-2xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              {cases.length} DOSSIERS OPEN
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Forensic investigation management with multi-analyst timeline, evidence locker, and account disposition controls.
          </p>
        </div>

        <button
          onClick={loadCases}
          className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-mono rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>REFRESH CASES</span>
        </button>
      </div>

      {/* 3-COLUMN INVESTIGATION WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* LEFT COLUMN: CASE QUEUE (3 COLS) */}
        <div className="lg:col-span-3 bg-veyra-900 border border-veyra-800/80 rounded flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-veyra-800 bg-veyra-850/60 font-mono text-2xs font-bold text-slate-300 uppercase">
            OPEN DOSSIERS ({cases.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-veyra-800/60">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`w-full p-3 text-left transition-colors flex flex-col gap-1.5 ${
                  selectedCaseId === c.id
                    ? 'bg-amber-500/15 border-l-2 border-l-amber-400'
                    : 'hover:bg-veyra-850/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-mono font-bold text-slate-200">{c.case_number}</span>
                  <StatusBadge status={c.status} size="sm" />
                </div>

                <div className="text-xs font-medium text-slate-200 line-clamp-2">
                  {c.title}
                </div>

                <div className="flex items-center justify-between text-2xs font-mono text-slate-400 pt-1">
                  <span>EXPOSURE: <strong className="text-slate-200"><Currency amount={c.estimated_exposure} /></strong></span>
                  <span className="text-amber-400 font-bold">{c.priority.split('_')[1]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: TIMELINE & CASE NOTES (5 COLS) */}
        <div className="lg:col-span-5 bg-veyra-900 border border-veyra-800/80 rounded flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-veyra-800 bg-veyra-850/60 flex items-center justify-between">
            <span className="font-mono text-2xs font-bold text-slate-300 uppercase">
              INVESTIGATION LOG // {selectedCase?.case_number || 'SELECT CASE'}
            </span>
            <span className="text-2xs font-mono text-slate-400">
              LEAD: {caseDetail?.case?.analyst_name || 'UNASSIGNED'}
            </span>
          </div>

          {/* CHRONOLOGICAL NOTES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {caseDetail?.notes?.length === 0 ? (
              <div className="py-8 text-center text-slate-500 font-mono text-xs">
                No investigation notes recorded yet.
              </div>
            ) : (
              caseDetail?.notes?.map((n: any) => (
                <div key={n.id} className="bg-veyra-950 border border-veyra-800 rounded p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-2xs font-mono text-slate-400 border-b border-veyra-850 pb-1">
                    <span className="text-amber-400 font-semibold">{n.author_name} [{n.author_badge}]</span>
                    <span>{new Date(n.created_at).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {n.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* NOTE INPUT BOX */}
          <form onSubmit={handleAddNote} className="p-3 border-t border-veyra-800 bg-veyra-950/40 flex gap-2">
            <input
              type="text"
              placeholder="Record forensic observation, verification remark, or lead notes..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="flex-1 bg-veyra-900 border border-veyra-750/70 focus:border-amber-500 rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
            />
            <button
              type="submit"
              disabled={isSubmittingNote || !noteContent.trim()}
              className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-mono text-xs font-bold flex items-center gap-1 transition-colors shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            >
              <Send className="w-3 h-3" />
              <span>RECORD</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: EVIDENCE LOCKER & DISPOSITION ACTIONS (4 COLS) */}
        <div className="lg:col-span-4 space-y-4 overflow-y-auto min-h-0">
          {/* EVIDENCE LOCKER */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3">
            <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
              EVIDENCE LOCKER
            </span>

            <div className="space-y-2">
              {caseDetail?.evidence?.map((ev: any) => (
                <div key={ev.id} className="bg-veyra-950 border border-veyra-800 rounded p-2.5 font-mono text-2xs">
                  <div className="text-amber-400 font-bold uppercase">{ev.evidence_type}</div>
                  <div className="text-slate-300 mt-0.5">{ev.notes}</div>
                  <div className="text-slate-500 text-3xs mt-1">ID: {ev.reference_id}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DISPOSITION CONTROLS */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3 font-mono text-2xs">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              OPERATIONAL ACTIONS
            </span>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleExecuteAction('FREEZE_ACCOUNT')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 font-semibold transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>FREEZE ORIGIN ACCOUNT</span>
              </button>

              <button
                onClick={() => handleExecuteAction('BLOCK_DEVICE')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-semibold transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>BLOCK DEVICE FINGERPRINT</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsDossierModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-300 font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>EXPORT SECTION 12 PMLA STATUTORY FIR DOSSIER</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-veyra-800">
                <button
                  onClick={() => handleExecuteAction('CLOSE_CONFIRMED_FRAUD')}
                  className="py-2 rounded bg-red-900/50 hover:bg-red-800/60 border border-red-700 text-red-200 font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>CONFIRM FRAUD</span>
                </button>

                <button
                  onClick={() => handleExecuteAction('CLOSE_FALSE_POSITIVE')}
                  className="py-2 rounded bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>FALSE POSITIVE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatutoryDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        caseData={caseDetail?.case}
      />
    </div>
  );
};
