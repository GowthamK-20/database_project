import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const RuleSimulator: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [minAmount, setMinAmount] = useState('75000');
  const [channel, setChannel] = useState('ALL');
  const [isRootedOnly, setIsRootedOnly] = useState(false);
  const [nightWindowOnly, setNightWindowOnly] = useState(false);
  const [isVpnOnly, setIsVpnOnly] = useState(false);

  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadRules = async () => {
    try {
      const res = await api.listRules();
      setRules(res.rules);
    } catch (err) {
      console.error('Failed to load rules:', err);
    }
  };

  useEffect(() => {
    loadRules();
    // Auto-run baseline simulation
    handleRunSimulation();
  }, []);

  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSimulating(true);
    try {
      const res = await api.simulateRule({
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        channel,
        isRootedOnly,
        nightWindowOnly,
        isVpnOnly,
      });
      setSimulationResult(res.simulation);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleToggleRule = async (ruleId: string, currentActive: boolean) => {
    try {
      await api.updateRule(ruleId, { isActive: !currentActive });
      loadRules();
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              RULE ENGINE & SIMULATOR
            </h1>
            <span className="text-2xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              HISTORICAL BACKTESTING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate detection thresholds and evaluate false-positive impact against historical transactions before production deployment.
          </p>
        </div>
      </div>

      {/* TOP SECTION: SIMULATOR WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: SIMULATION PARAMETERS (5 COLS) */}
        <div className="lg:col-span-5 bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
            <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
              RULE SPECIFICATION BUILDER
            </span>
            <span className="text-2xs font-mono text-slate-400">TEST CORPUS: 100% LEDGER</span>
          </div>

          <form onSubmit={handleRunSimulation} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-2xs text-slate-400 block mb-1">MINIMUM TRANSACTION VALUE (₹):</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full bg-veyra-950 border border-veyra-750 focus:border-amber-500 rounded px-3 py-1.5 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-2xs text-slate-400 block mb-1">PAYMENT RAIL CHANNEL:</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-veyra-950 border border-veyra-750 focus:border-amber-500 rounded px-2.5 py-1.5 text-slate-100 outline-none"
              >
                <option value="ALL">ALL CHANNELS</option>
                <option value="UPI">UPI</option>
                <option value="IMPS">IMPS</option>
                <option value="CARD_ECOM">CARD E-COMMERCE</option>
                <option value="NEFT">NEFT</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-veyra-800 text-2xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nightWindowOnly}
                  onChange={(e) => setNightWindowOnly(e.target.checked)}
                  className="rounded bg-veyra-950 border-veyra-700 text-amber-500 focus:ring-amber-500/50"
                />
                <span>Night-time window constraint (01:00 AM – 05:00 AM IST)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRootedOnly}
                  onChange={(e) => setIsRootedOnly(e.target.checked)}
                  className="rounded bg-veyra-950 border-veyra-700 text-amber-500 focus:ring-amber-500/50"
                />
                <span>Compromised/Rooted OS signature verified</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVpnOnly}
                  onChange={(e) => setIsVpnOnly(e.target.checked)}
                  className="rounded bg-veyra-950 border-veyra-700 text-amber-500 focus:ring-amber-500/50"
                />
                <span>Anonymized VPN or Tor exit gateway</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>RUN HISTORICAL REPLAY SIMULATION</span>
            </button>
          </form>
        </div>

        {/* RIGHT: CONFUSION MATRIX & SIMULATION METRICS (7 COLS) */}
        <div className="lg:col-span-7 bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
            <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
              BACKTEST PERFORMANCE & CONFUSION MATRIX
            </span>
            <span className="text-2xs font-mono text-emerald-400">STATUS: REPLAY COMPLETE</span>
          </div>

          {simulationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="bg-veyra-950 border border-veyra-800 rounded p-3">
                  <div className="text-2xs font-mono text-slate-400">MATCHED TRANSACTIONS</div>
                  <div className="text-xl font-mono font-bold text-slate-100 mt-1">
                    {simulationResult.totalMatchedCount}
                  </div>
                </div>

                <div className="bg-veyra-950 border border-veyra-800 rounded p-3">
                  <div className="text-2xs font-mono text-slate-400">TRUE FRAUD CAPTURED</div>
                  <div className="text-xl font-mono font-bold text-red-400 mt-1">
                    {simulationResult.confirmedFraudMatches}
                  </div>
                </div>

                <div className="bg-veyra-950 border border-veyra-800 rounded p-3">
                  <div className="text-2xs font-mono text-slate-400">FALSE ALARM RISK</div>
                  <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                    {simulationResult.falsePositiveMatches}
                  </div>
                </div>

                <div className="bg-veyra-950 border border-veyra-800 rounded p-3">
                  <div className="text-2xs font-mono text-slate-400">PRECISION ACCURACY</div>
                  <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                    {simulationResult.precisionPct}%
                  </div>
                </div>
              </div>

              {/* IMPACT SUMMARY */}
              <div className="bg-veyra-950 border border-veyra-800/80 rounded p-3 font-mono text-2xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>HISTORICAL VOLUME CAPTURED:</span>
                  <span className="text-slate-100 font-bold"><Currency amount={simulationResult.totalVolume} /></span>
                </div>
                <div className="flex justify-between">
                  <span>PROJECTED ANALYST WORKLOAD DELTA:</span>
                  <span className="text-amber-400 font-bold">+{simulationResult.projectedAlertsPerDay} alerts/day</span>
                </div>
                <div className="flex justify-between border-t border-veyra-850 pt-1">
                  <span>GOVERNANCE RECOMMENDATION:</span>
                  <span className="text-emerald-400 font-bold">
                    {simulationResult.precisionPct >= 80 ? 'VIABLE FOR PRODUCTION PROMOTION' : 'HIGH FALSE ALARMS — ADJUST THRESHOLD'}
                  </span>
                </div>
              </div>

              {/* MATCHED SAMPLE PREVIEW */}
              <div>
                <span className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  MATCHED TRANSACTION SAMPLES ({simulationResult.matchedSample?.length || 0}):
                </span>
                <div className="space-y-1">
                  {simulationResult.matchedSample?.map((sm: any) => (
                    <div
                      key={sm.transaction_id}
                      className="p-2 rounded bg-veyra-950/60 border border-veyra-850 flex items-center justify-between text-2xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200">{sm.txn_reference}</span>
                        <span className="text-slate-500">({sm.channel})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Currency amount={sm.amount} />
                        <RiskBadge level={sm.risk_level} score={sm.risk_score} showScore size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: PRODUCTION RULE REGISTRY */}
      <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
          <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
            ACTIVE PRODUCTION RULE REGISTRY ({rules.length})
          </span>
          <span className="text-2xs font-mono text-slate-500">VERSION: v2.4.0</span>
        </div>

        <div className="space-y-2">
          {rules.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded bg-veyra-950 border border-veyra-800/80 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-200">{r.rule_code}</span>
                  <RiskBadge level={r.severity} size="sm" />
                  <span className="text-2xs font-mono text-slate-500">Weight: +{r.weight_score} pts</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">{r.name}</div>
                <p className="text-2xs text-slate-400">{r.description}</p>
              </div>

              <button
                onClick={() => handleToggleRule(r.id, r.is_active)}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-2xs font-mono border transition-colors flex-shrink-0"
              >
                {r.is_active ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-500">DISABLED</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
