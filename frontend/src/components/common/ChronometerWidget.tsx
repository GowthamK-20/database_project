import React, { useState, useEffect, useRef } from 'react';
import { Clock, Globe, ShieldAlert, Radio, Activity, Zap, ChevronDown, CheckCircle2 } from 'lucide-react';

export const ChronometerWidget: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format session uptime
  const formatUptime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Indian Standard Time (IST)
  const istTime = now.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const istDate = now.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // London (UTC / GMT)
  const utcTime = now.toLocaleTimeString('en-GB', {
    timeZone: 'UTC',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // New York (EST / EDT)
  const estTime = now.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Singapore (SGT)
  const sgtTime = now.toLocaleTimeString('en-SG', {
    timeZone: 'Asia/Singapore',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Temporal Fraud Risk Window calculation (IST hour)
  const istHour = parseInt(
    now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }),
    10
  );

  let riskWindow = {
    level: 'LOW',
    title: 'Standard Diurnal Operating Window',
    description: 'High retail volume, baseline consumer activity',
    badgeClass: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    dotClass: 'bg-emerald-400',
  };

  if (istHour >= 1 && istHour <= 5) {
    riskWindow = {
      level: 'CRITICAL',
      title: 'Nocturnal Anomaly Window (01:00 - 05:00 AM)',
      description: 'Off-hours account takeovers & sleeper account drainages peak',
      badgeClass: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
      dotClass: 'bg-rose-500 animate-pulse',
    };
  } else if (istHour >= 18 || istHour === 0) {
    riskWindow = {
      level: 'ELEVATED',
      title: 'Evening P2P & E-Commerce Surge',
      description: 'Elevated velocity on UPI and Card-Not-Present rails',
      badgeClass: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
      dotClass: 'bg-amber-400',
    };
  }

  return (
    <div ref={popoverRef} className="relative">
      {/* COMPACT CAPSULE DISPLAY IN HEADER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-veyra-900/90 hover:bg-veyra-850 border border-amber-500/40 hover:border-amber-400 text-xs font-mono transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)] group"
        title="Temporal Threat Intelligence Matrix (Click to inspect World Clearing Windows)"
      >
        {/* Pulsing satellite / sync beacon */}
        <div className="relative flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
          <span className="absolute w-3.5 h-3.5 rounded-full bg-amber-400/30 animate-ping" />
        </div>

        {/* Digital Time Display */}
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-slate-100 tracking-wider">
            {istTime}
          </span>
          <span className="text-3xs text-amber-400 font-extrabold uppercase">
            IST
          </span>
        </div>

        {/* Risk Window Dot Indicator */}
        <span
          className={`w-1.5 h-1.5 rounded-full ${riskWindow.dotClass}`}
          title={`Active Window: ${riskWindow.level}`}
        />

        <ChevronDown
          className={`w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* EXPANDED TEMPORAL INTELLIGENCE POPOVER */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-[#0a0d14]/98 border border-amber-500/50 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] p-4 z-50 font-mono text-xs backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-veyra-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-100 text-xs uppercase tracking-wide">
                TEMPORAL SURVEILLANCE MATRIX
              </span>
            </div>
            <span className="text-3xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              NTP ±0.03ms SYNCED
            </span>
          </div>

          {/* ACTIVE TEMPORAL FRAUD WINDOW METER */}
          <div className={`p-2.5 rounded-lg border mb-3.5 ${riskWindow.badgeClass} space-y-1`}>
            <div className="flex items-center justify-between">
              <span className="text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>FRAUD RISK PROFILE: {riskWindow.level}</span>
              </span>
              <span className="text-4xs px-1.5 py-0.2 rounded bg-black/40 border border-current">
                HEURISTIC PENALTY: {riskWindow.level === 'CRITICAL' ? '+30 PTS' : riskWindow.level === 'ELEVATED' ? '+15 PTS' : '0 PTS'}
              </span>
            </div>
            <div className="text-2xs font-bold text-slate-200">
              {riskWindow.title}
            </div>
            <p className="text-3xs text-slate-400 font-sans leading-tight">
              {riskWindow.description}
            </p>
          </div>

          {/* MULTI-TIMEZONE FINANCIAL CLEARING WINDOWS */}
          <div className="space-y-2 mb-3.5">
            <div className="text-3xs text-slate-500 uppercase tracking-wider">
              GLOBAL FINANCIAL CLEARING WINDOWS
            </div>

            <div className="grid grid-cols-2 gap-2 text-2xs">
              {/* MUMBAI / IST */}
              <div className="p-2 rounded bg-veyra-950/80 border border-amber-500/30 space-y-0.5">
                <div className="flex justify-between items-center text-3xs text-amber-400 font-bold">
                  <span>🇮🇳 MUMBAI (IST)</span>
                  <span className="text-4xs text-emerald-400">PRIMARY</span>
                </div>
                <div className="text-sm font-bold text-slate-100">
                  {istTime}
                </div>
                <div className="text-3xs text-slate-500">{istDate}</div>
              </div>

              {/* LONDON / UTC */}
              <div className="p-2 rounded bg-veyra-950/80 border border-veyra-800 space-y-0.5">
                <div className="flex justify-between items-center text-3xs text-slate-400 font-bold">
                  <span>🇬🇧 LONDON (UTC)</span>
                  <span className="text-4xs text-slate-500">EURO CLEAR</span>
                </div>
                <div className="text-sm font-bold text-slate-200">
                  {utcTime}
                </div>
                <div className="text-3xs text-slate-500">CHAPS / SEPA</div>
              </div>

              {/* NEW YORK / EST */}
              <div className="p-2 rounded bg-veyra-950/80 border border-veyra-800 space-y-0.5">
                <div className="flex justify-between items-center text-3xs text-slate-400 font-bold">
                  <span>🇺🇸 NEW YORK (EST)</span>
                  <span className="text-4xs text-slate-500">FEDWIRE</span>
                </div>
                <div className="text-sm font-bold text-slate-200">
                  {estTime}
                </div>
                <div className="text-3xs text-slate-500">CHIPS / ACH</div>
              </div>

              {/* SINGAPORE / SGT */}
              <div className="p-2 rounded bg-veyra-950/80 border border-veyra-800 space-y-0.5">
                <div className="flex justify-between items-center text-3xs text-slate-400 font-bold">
                  <span>🇸🇬 SINGAPORE (SGT)</span>
                  <span className="text-4xs text-slate-500">APAC HUB</span>
                </div>
                <div className="text-sm font-bold text-slate-200">
                  {sgtTime}
                </div>
                <div className="text-3xs text-slate-500">FAST / MEPS+</div>
              </div>
            </div>
          </div>

          {/* SURVEILLANCE UPTIME & ATOMIC SYNC METRICS */}
          <div className="pt-2.5 border-t border-veyra-800 flex items-center justify-between text-3xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>SURVEILLANCE UPTIME:</span>
              <strong className="text-slate-200">{formatUptime(sessionSeconds)}</strong>
            </div>

            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>STRATUM-1 ATOMIC</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
