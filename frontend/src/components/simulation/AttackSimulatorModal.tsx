import React, { useState } from 'react';
import { sounds } from '../../utils/soundEffects';

export interface AttackPreset {
  id: string;
  code: string;
  title: string;
  targetRail: 'UPI' | 'IMPS' | 'NEFT' | 'CARD_ECOM';
  amount: number;
  counterparty: string;
  riskScore: number;
  severity: 'CRITICAL' | 'HIGH';
  heuristicTriggers: string[];
  description: string;
}

const PRESETS: AttackPreset[] = [
  {
    id: 'midnight-mule',
    code: 'ATK-MULE-401',
    title: 'Operation Midnight Mule (Layering Attack)',
    targetRail: 'UPI',
    amount: 490000,
    counterparty: 'karan.mule99@okaxis',
    riskScore: 96,
    severity: 'CRITICAL',
    heuristicTriggers: [
      'Temporal Anomaly: 02:45 AM nocturnal window',
      'Velocity Spike: 4 split transfers in 180 seconds',
      'Known Shared Hardware: HW-MULE-ANDROID-09',
      'Rapid Off-Ramping into Newly Minted VPA',
    ],
    description: 'Coordinated syndicate funneling funds from 3 mule accounts to a central aggregator VPA within 3 minutes.',
  },
  {
    id: 'geo-leap',
    code: 'ATK-GEO-882',
    title: 'Impossible Geo-Velocity Leap (Mach 4.2)',
    targetRail: 'CARD_ECOM',
    amount: 175000,
    counterparty: 'luxury-jewels.london.uk',
    riskScore: 94,
    severity: 'CRITICAL',
    heuristicTriggers: [
      'Physical ATM swipe in Mumbai at 03:10 AM',
      'Card-present 3DS authorization in London at 03:17 AM',
      'Velocity Anomaly: 7,192 km in 7 minutes (Mach 4.2 flight speed required)',
      'Suspicious Foreign Merchant Category Code (MCC 5094)',
    ],
    description: 'Simultaneous card-present operations across international borders exceeding theoretical supersonic speed.',
  },
  {
    id: 'rooted-drainage',
    code: 'ATK-ROOT-109',
    title: 'Rooted Kernel Firmware Liquidation',
    targetRail: 'IMPS',
    amount: 850000,
    counterparty: 'crypto-escrow.global.vpa@axis',
    riskScore: 92,
    severity: 'CRITICAL',
    heuristicTriggers: [
      'Magisk / KernelSU Root Integrity Violation',
      'Dormant HNW Account Liquidation (194 days silent)',
      'Device Fingerprint Alteration & Spoofed IMEI',
      'Beneficiary Whitelist Bypassed via API Injection',
    ],
    description: 'Compromised Android kernel attempting high-value transfer immediately following device fingerprint tampering.',
  },
];

interface AttackSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttackInjected?: (preset: AttackPreset) => void;
  onNavigateToAlerts?: () => void;
  onNavigateToCases?: () => void;
}

export const AttackSimulatorModal: React.FC<AttackSimulatorModalProps> = ({
  isOpen,
  onClose,
  onAttackInjected,
  onNavigateToAlerts,
  onNavigateToCases,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('midnight-mule');
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [injectionSuccess, setInjectionSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const handleLaunchSimulation = () => {
    setIsInjecting(true);
    setTelemetryLogs([]);
    setInjectionSuccess(false);

    // Play initial alert sound
    sounds.playThreatAlert();

    const steps = [
      `[00.08s] [INIT] Packaging synthetic malicious packet payload for rail: ${currentPreset.targetRail}...`,
      `[00.22s] [TRANSMIT] Emitting ₹${currentPreset.amount.toLocaleString('en-IN')} payload targeting [${currentPreset.counterparty}]...`,
      `[00.48s] [HEURISTICS] Postgres Rules Engine backtest: Evaluating 4 rule constraints...`,
      `[00.72s] [BREACH] ⚠️ RULE TRIGGERED: ${currentPreset.heuristicTriggers[0]}`,
      `[00.95s] [BREACH] ⚠️ RULE TRIGGERED: ${currentPreset.heuristicTriggers[1]}`,
      `[01.20s] [COMPOSITE SCORE] FinGuard Risk Model computed score: ${currentPreset.riskScore} / 100 (${currentPreset.severity})`,
      `[01.42s] [DEFENSE LATCH] 🛑 RAIL AUTO-FROZEN. Outbound settlement halted. Section 12 PMLA dossier initialized.`,
    ];

    steps.forEach((log, index) => {
      setTimeout(() => {
        setTelemetryLogs((prev) => [...prev, log]);

        if (index === steps.length - 1) {
          setIsInjecting(false);
          setInjectionSuccess(true);
          sounds.playFreezeAction();
          if (onAttackInjected) {
            onAttackInjected(currentPreset);
          }
        }
      }, (index + 1) * 260);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-[#0b0e14] border border-amber-500/40 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 bg-[#0e121b] border-b border-veyra-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
              LIVE ATTACK SIMULATOR & THREAT INJECTION MATRIX
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 font-mono text-xs px-2 py-1 rounded bg-veyra-900 border border-veyra-750"
          >
            ESC / CLOSE
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
          {/* PRESET SELECTOR BUTTONS */}
          <div className="space-y-1.5">
            <span className="text-3xs text-slate-400 uppercase tracking-wider">
              SELECT THREAT SCENARIO VECTOR:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => {
                const isSelected = p.id === currentPreset.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPresetId(p.id);
                      setTelemetryLogs([]);
                      setInjectionSuccess(false);
                      sounds.playClick();
                    }}
                    className={`p-2.5 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-veyra-950/80 hover:bg-veyra-850 border-veyra-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-3xs font-bold text-slate-400">{p.code}</span>
                      <span className="text-4xs px-1.5 py-0.2 rounded bg-red-950/80 text-red-400 border border-red-800 font-extrabold">
                        RISK {p.riskScore}
                      </span>
                    </div>
                    <div className="font-bold text-slate-100 text-2xs truncate">{p.title}</div>
                    <div className="text-3xs text-slate-400 mt-1">₹{p.amount.toLocaleString('en-IN')} · {p.targetRail}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ATTACK VECTOR BRIEFING */}
          <div className="p-3 rounded-lg bg-veyra-950 border border-veyra-800 space-y-2">
            <div className="flex items-center justify-between border-b border-veyra-850 pb-1.5 text-2xs">
              <span className="text-slate-400">TARGET CORRIDOR:</span>
              <span className="text-slate-200 font-bold">{currentPreset.targetRail} → {currentPreset.counterparty}</span>
            </div>
            <p className="text-2xs text-slate-300 font-sans leading-relaxed">
              {currentPreset.description}
            </p>
            <div className="space-y-1 pt-1">
              <span className="text-3xs text-slate-500 uppercase">SYNTHETIC BREACH TRIGGERS:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-3xs text-slate-300">
                {currentPreset.heuristicTriggers.map((trig, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded border border-white/5">
                    <span className="text-red-400">•</span>
                    <span className="truncate">{trig}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TELEMETRY PACKET CONSOLE */}
          <div className="bg-black/90 border border-slate-800 rounded-lg p-3 space-y-1.5 min-h-[140px] max-h-[190px] overflow-y-auto">
            <div className="flex items-center justify-between text-3xs text-slate-500 border-b border-slate-800 pb-1 uppercase">
              <span>REAL-TIME PACKET TRANSMISSION TERMINAL</span>
              <span>{isInjecting ? 'STREAMING...' : injectionSuccess ? 'INJECTION COMPLETED' : 'IDLE'}</span>
            </div>
            {telemetryLogs.length === 0 ? (
              <div className="text-slate-600 text-3xs py-6 text-center">
                Click "INJECT THREAT PACKET STREAM" to broadcast synthetic attack traffic through FinGuard heuristics.
              </div>
            ) : (
              telemetryLogs.map((log, i) => (
                <div
                  key={i}
                  className={`text-3xs leading-relaxed ${
                    log.includes('DEFENSE LATCH')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('BREACH')
                      ? 'text-red-400 font-bold'
                      : log.includes('COMPOSITE')
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODAL ACTIONS BAR */}
        <div className="px-5 py-3 bg-[#0e121b] border-t border-veyra-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchSimulation}
              disabled={isInjecting}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                isInjecting
                  ? 'bg-amber-600/50 text-black cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              }`}
            >
              {isInjecting ? 'STREAMING PACKETS...' : '⚡ INJECT THREAT PACKET STREAM'}
            </button>

            {injectionSuccess && (
              <span className="text-3xs font-mono text-emerald-400 px-2 py-1 rounded bg-emerald-950/40 border border-emerald-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                DEFENSE TRIGGERED & BLOCKED
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-2xs">
            {onNavigateToAlerts && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToAlerts();
                }}
                className="px-3 py-1.5 rounded bg-veyra-900 hover:bg-veyra-800 text-amber-400 border border-amber-500/30 transition-colors"
              >
                VIEW ALERTS ⟶
              </button>
            )}
            {onNavigateToCases && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCases();
                }}
                className="px-3 py-1.5 rounded bg-veyra-900 hover:bg-veyra-800 text-slate-200 border border-veyra-750 transition-colors"
              >
                VIEW CASES ⟶
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};