import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  UserCheck,
  SlidersHorizontal,
  FileCheck2,
  Database,
  QrCode,
  Zap,
  Activity,
  Cpu,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export interface ClearancePersona {
  username: string;
  name: string;
  role: 'ADMIN' | 'FRAUD_ANALYST' | 'RISK_MANAGER' | 'COMPLIANCE_ANALYST';
  roleLabel: string;
  badge: string;
  clearanceLevel: string;
  department: string;
  scopeDescription: string;
  accentColor: string; // 'amber' | 'emerald' | 'rose' | 'purple'
  avatarSeed: string;
  biometricId: string;
}

export const CLEARANCE_PERSONAS: ClearancePersona[] = [
  {
    username: 'admin',
    name: 'Siddharth Varma',
    role: 'ADMIN',
    roleLabel: 'Surveillance Administrator',
    badge: 'SA-0001',
    clearanceLevel: 'LEVEL 5 — OMNI-CLEARANCE',
    department: 'Core Architecture & PostgreSQL 18 Engine',
    scopeDescription: 'Full database schema access, analytical SQL lab, master security policies & global infrastructure.',
    accentColor: 'rose',
    avatarSeed: 'SV',
    biometricId: 'BIO-NODE-901-ALPHA',
  },
  {
    username: 'rahul.sharma',
    name: 'Rahul Sharma',
    role: 'FRAUD_ANALYST',
    roleLabel: 'Senior Fraud Operations Analyst',
    badge: 'FA-1092',
    clearanceLevel: 'LEVEL 3 — TACTICAL OPS',
    department: 'Real-Time Threat Triage & Enforcement',
    scopeDescription: 'Live payment rail monitoring, critical fraud alert triage, suspect entity linking & case freezes.',
    accentColor: 'amber',
    avatarSeed: 'RS',
    biometricId: 'BIO-NODE-404-BETA',
  },
  {
    username: 'priya.nair',
    name: 'Priya Nair',
    role: 'RISK_MANAGER',
    roleLabel: 'Risk Engineering Manager',
    badge: 'RM-0841',
    clearanceLevel: 'LEVEL 4 — HEURISTIC POLICY',
    department: 'Detection Rule Modeling & Simulation',
    scopeDescription: 'Threshold calibration, historical backtesting simulation, counterparty merchant intelligence & MCC tracking.',
    accentColor: 'purple',
    avatarSeed: 'PN',
    biometricId: 'BIO-NODE-712-GAMMA',
  },
  {
    username: 'amit.patel',
    name: 'Amit Patel',
    role: 'COMPLIANCE_ANALYST',
    roleLabel: 'Chief Compliance Officer',
    badge: 'CO-0034',
    clearanceLevel: 'LEVEL 4 — STATUTORY AUDIT',
    department: 'Regulatory Compliance & AML Governance',
    scopeDescription: 'RBI & FIU-IND Suspicious Transaction Reporting (STR), PMLA statutory files & immutable audit journals.',
    accentColor: 'emerald',
    avatarSeed: 'AP',
    biometricId: 'BIO-NODE-308-DELTA',
  },
];

interface OfficerClearanceTerminalProps {
  onClearanceGranted: (username: string) => void;
  onSkip?: () => void;
  initialPersona?: string;
}

export const OfficerClearanceTerminal: React.FC<OfficerClearanceTerminalProps> = ({
  onClearanceGranted,
  onSkip,
  initialPersona = 'admin',
}) => {
  const [selectedPersona, setSelectedPersona] = useState<ClearancePersona>(
    CLEARANCE_PERSONAS.find((p) => p.username === initialPersona) || CLEARANCE_PERSONAS[0]
  );
  const [stage, setStage] = useState<'SELECT_ROLE' | 'ID_PASS' | 'AUTHENTICATING' | 'ACCESS_GRANTED'>('SELECT_ROLE');
  const [scanProgress, setScanProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hashTimestamp, setHashTimestamp] = useState(Date.now());

  // Mouse tilt effect for 3D holographic ID pass card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleSelectRole = (persona: ClearancePersona) => {
    setSelectedPersona(persona);
    setHashTimestamp(Date.now());
    setStage('ID_PASS');
  };

  const handleTriggerAuthentication = () => {
    setStage('AUTHENTICATING');
    setScanProgress(0);
    sounds.playBiometricScan();

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStage('ACCESS_GRANTED');
          sounds.playAccessGranted();

          // After granting access, wait 1.5s for the celebratory entrance animation, then transition
          setTimeout(() => {
            onClearanceGranted(selectedPersona.username);
          }, 1600);
          return 100;
        }
        return prev + 5;
      });
    }, 45);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#040608]/98 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto selection:bg-amber-400 selection:text-black">
      {/* Background Cybernetic Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* TOP STATUS BAR */}
      <div className="absolute top-4 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between text-2xs font-mono text-slate-400 border-b border-veyra-800/80 pb-3 z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">FINGUARD AI // IDENTITY CLEARANCE GATEWAY</span>
          <span className="text-3xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 hidden sm:inline">
            ZERO-TRUST ENFORCED
          </span>
        </div>

        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-veyra-900 hover:bg-veyra-850 border border-veyra-750 text-slate-300 hover:text-amber-400 transition-colors text-3xs"
          >
            <span>QUICK ENTER (DEFAULT)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* STAGE 1: ASKING THE ROLES DIFFERENTLY                                    */}
      {/* ========================================================================= */}
      {stage === 'SELECT_ROLE' && (
        <div className="w-full max-w-4xl pt-12 pb-6 space-y-6 z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-3xs font-bold tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>STEP 1: SELECT YOUR OPERATIONAL CLEARANCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-black text-slate-100 tracking-wider">
              IDENTIFY YOUR SURVEILLANCE PROFILE
            </h1>
            <p className="text-xs text-slate-400 font-mono max-w-lg mx-auto">
              Select your accredited institutional persona to generate your holographic digital ID pass and unlock the respective analytical intelligence layers.
            </p>
          </div>

          {/* 4 DISTINCT ROLE DOSSIER CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLEARANCE_PERSONAS.map((persona) => {
              const isSelected = selectedPersona.username === persona.username;

              return (
                <div
                  key={persona.username}
                  onClick={() => handleSelectRole(persona)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-500/15 via-veyra-900 to-veyra-950 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] scale-[1.01]'
                      : 'bg-veyra-900/80 hover:bg-veyra-850 border-veyra-800 hover:border-amber-500/40'
                  }`}
                >
                  {/* Subtle top indicator stripe */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                      persona.role === 'ADMIN'
                        ? 'bg-rose-500'
                        : persona.role === 'FRAUD_ANALYST'
                        ? 'bg-amber-500'
                        : persona.role === 'RISK_MANAGER'
                        ? 'bg-purple-500'
                        : 'bg-emerald-500'
                    }`}
                  />

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-base border shadow-sm ${
                          persona.role === 'ADMIN'
                            ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                            : persona.role === 'FRAUD_ANALYST'
                            ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                            : persona.role === 'RISK_MANAGER'
                            ? 'bg-purple-950/60 border-purple-800/80 text-purple-300'
                            : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                        }`}
                      >
                        {persona.avatarSeed}
                      </div>

                      <div>
                        <div className="text-sm font-bold font-mono text-slate-100 group-hover:text-amber-300 transition-colors">
                          {persona.name}
                        </div>
                        <div className="text-2xs font-mono text-slate-400">
                          {persona.roleLabel}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-3xs px-2 py-0.5 rounded bg-veyra-950 text-slate-300 border border-veyra-750 font-bold">
                        {persona.badge}
                      </span>
                      <div className="text-4xs text-amber-400/80 mt-1 uppercase font-semibold">
                        {persona.clearanceLevel.split('—')[0].trim()}
                      </div>
                    </div>
                  </div>

                  <p className="text-2xs text-slate-400 leading-relaxed font-sans mb-3 line-clamp-2">
                    {persona.scopeDescription}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-veyra-800/80 text-3xs font-mono">
                    <span className="text-slate-500 truncate max-w-[200px]">
                      {persona.department}
                    </span>
                    <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>ISSUE ID PASS</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2 & 3: THE HOLOGRAPHIC DIGITAL ID PASS WITH UNIQUE FEATURES        */}
      {/* ========================================================================= */}
      {(stage === 'ID_PASS' || stage === 'AUTHENTICATING' || stage === 'ACCESS_GRANTED') && (
        <div className="w-full max-w-xl pt-10 pb-6 flex flex-col items-center z-10 animate-in fade-in zoom-in-95 duration-300">
          {/* Header guidance */}
          <div className="text-center space-y-1 mb-5">
            <button
              onClick={() => setStage('SELECT_ROLE')}
              className="text-3xs font-mono text-slate-400 hover:text-amber-400 mb-1 inline-flex items-center gap-1 transition-colors"
            >
              <span>← Switch Officer Persona</span>
            </button>
            <h2 className="text-xl sm:text-2xl font-mono font-black text-slate-100 uppercase tracking-wider">
              CRYPTOGRAPHIC ID PASS VERIFICATION
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Hold thumbprint to initiate biometric laser verification and sign operational session.
            </p>
          </div>

          {/* ============================================================= */}
          {/* 3D HOLOGRAPHIC SMART ID PASS CARD                             */}
          {/* ============================================================= */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
            className="w-full max-w-md bg-gradient-to-b from-[#111622] via-[#0b0e14] to-[#080a0f] border-2 border-amber-500/50 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.2)] relative overflow-hidden"
          >
            {/* Holographic Iridescent Sheen Layer */}
            <div
              style={{
                background: `linear-gradient(${120 + mousePos.x * 60}deg, rgba(245, 158, 11, 0.15) 0%, rgba(52, 211, 153, 0.1) 40%, rgba(168, 85, 247, 0.15) 80%, transparent 100%)`,
              }}
              className="absolute inset-0 pointer-events-none opacity-80 mix-blend-screen"
            />

            {/* LASER SCANNING BEAM (ACTIVE DURING AUTHENTICATION) */}
            {stage === 'AUTHENTICATING' && (
              <div
                style={{ top: `${scanProgress}%` }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)] z-30 transition-all pointer-events-none"
              >
                <div className="absolute right-4 -top-3 text-4xs font-mono font-extrabold text-emerald-300 bg-black/80 px-1 rounded">
                  SCANNING {scanProgress}%
                </div>
              </div>
            )}

            {/* "ACCESS GRANTED" STAMP OVERLAY */}
            {stage === 'ACCESS_GRANTED' && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center z-40 animate-in zoom-in-75 duration-300 p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_30px_rgba(52,211,153,0.6)] animate-bounce">
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                </div>
                <div className="text-xs font-mono font-extrabold text-emerald-400 tracking-widest uppercase mb-1">
                  CLEARANCE VERIFIED // ACCESS GRANTED
                </div>
                <div className="text-base font-mono font-black text-slate-100 tracking-wider">
                  WELCOME, {selectedPersona.name.toUpperCase()}
                </div>
                <div className="text-3xs font-mono text-amber-400 mt-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>INITIALIZING ROLE WORKSPACE...</span>
                </div>
              </div>
            )}

            {/* CARD HEADER */}
            <div className="flex items-center justify-between border-b border-veyra-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-mono text-xs font-extrabold text-slate-100 tracking-wider">
                    FINGUARD <span className="text-amber-400">AI</span>
                  </div>
                  <div className="text-4xs font-mono text-slate-400 tracking-widest uppercase">
                    SMART SECURITY PASS
                  </div>
                </div>
              </div>

              {/* Holographic Security Microchip */}
              <div className="flex items-center gap-1.5">
                <div className="w-9 h-7 rounded bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-200/60 p-1 flex items-center justify-center shadow-xs">
                  <Cpu className="w-4 h-4 text-black opacity-80" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-4xs font-mono text-emerald-400 font-bold">RFID // ACTIVE</span>
                  <span className="text-4xs font-mono text-slate-500">{selectedPersona.badge}</span>
                </div>
              </div>
            </div>

            {/* OFFICER PHOTO & BIOMETRIC DETAILS */}
            <div className="flex gap-4 items-center mb-4">
              {/* Photo Frame with Clearance Halo */}
              <div className="relative flex-shrink-0">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-veyra-950 border-2 border-amber-500/60 p-1 flex items-center justify-center shadow-md overflow-hidden relative group">
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-veyra-850 to-veyra-900 flex flex-col items-center justify-center text-amber-400 font-mono font-black text-xl">
                    {selectedPersona.avatarSeed}
                    <span className="text-4xs text-slate-400 font-normal">SEC-ID</span>
                  </div>
                </div>
                {/* Active LED Beacon */}
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>

              {/* Metadata */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-sm sm:text-base font-bold font-mono text-slate-100 truncate">
                  {selectedPersona.name}
                </div>
                <div className="text-2xs font-mono text-amber-400 font-semibold truncate">
                  {selectedPersona.roleLabel}
                </div>
                <div className="text-3xs font-mono text-slate-400">
                  DEPT: <span className="text-slate-300">{selectedPersona.department}</span>
                </div>
                <div className="text-3xs font-mono text-emerald-400 font-extrabold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 w-fit">
                  {selectedPersona.clearanceLevel}
                </div>
              </div>
            </div>

            {/* CRYPTOGRAPHIC HASH & SECURITY QR CODE */}
            <div className="bg-veyra-950/90 border border-veyra-800 rounded-lg p-2.5 font-mono text-3xs space-y-1.5 mb-4">
              <div className="flex justify-between items-center text-slate-400 border-b border-veyra-800 pb-1">
                <span>BIOMETRIC HASH TOKEN:</span>
                <span className="text-amber-400 font-bold">{selectedPersona.biometricId}</span>
              </div>
              <div className="text-slate-500 truncate font-mono text-4xs">
                SHA-256: e8f9{hashTimestamp.toString(16)}a341098b671c42df...VERIFIED
              </div>
            </div>

            {/* ============================================================= */}
            {/* UNIQUE FEATURE: BIOMETRIC THUMBPRINT SENSOR & TAP BUTTON      */}
            {/* ============================================================= */}
            <div className="space-y-3">
              <button
                disabled={stage === 'AUTHENTICATING' || stage === 'ACCESS_GRANTED'}
                onClick={handleTriggerAuthentication}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-mono font-extrabold text-xs transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-[1.02] flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {/* Glowing scanline inside button */}
                <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700" />

                <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-black">
                  <Fingerprint className="w-4 h-4 animate-pulse" />
                </div>
                <span>
                  {stage === 'AUTHENTICATING'
                    ? `BIOMETRIC VERIFICATION IN PROGRESS (${scanProgress}%)...`
                    : 'TAP TO CRYPTOGRAPHICALLY SIGN & ENTER'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-3xs font-mono text-slate-500 px-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>256-Bit Hardware Keystore</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStage('SELECT_ROLE')}
                  className="text-amber-400 hover:underline"
                >
                  Change Clearance Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
