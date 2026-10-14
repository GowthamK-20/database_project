import React from 'react';

interface MetricBoxProps {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  trend?: string;
  trendColor?: 'positive' | 'negative' | 'neutral';
  badge?: string;
  badgeType?: 'safe' | 'warning' | 'critical' | 'info';
}

export const MetricBox: React.FC<MetricBoxProps> = ({
  label,
  value,
  subtitle,
  trend,
  trendColor = 'neutral',
  badge,
  badgeType = 'info',
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'critical': return 'text-red-400 bg-red-950/40 border-red-800/60';
      case 'warning': return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 'safe': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      default: return 'text-blue-400 bg-blue-950/40 border-blue-800/60';
    }
  };

  const getTrendStyle = () => {
    switch (trendColor) {
      case 'negative': return 'text-red-400';
      case 'positive': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-veyra-900 border border-veyra-750/70 rounded p-3 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {badge && (
          <span className={`text-2xs font-mono px-1.5 py-0.5 rounded border ${getBadgeStyle()}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="text-xl font-semibold font-mono tracking-tight text-slate-100 tabular-nums">
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-veyra-800 text-2xs text-slate-400">
          <span>{subtitle}</span>
          {trend && <span className={`font-mono font-medium ${getTrendStyle()}`}>{trend}</span>}
        </div>
      )}
    </div>
  );
};
