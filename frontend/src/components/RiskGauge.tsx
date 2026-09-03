import React from 'react';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 'md', showLabel = true }) => {
  const boundedScore = Math.min(100, Math.max(0, Math.round(score)));

  let colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  let level = 'LOW';

  if (boundedScore > 80) {
    colorClass = 'text-red-400 border-red-500/40 bg-red-500/10 animate-pulse';
    badgeBg = 'bg-red-500/20 text-red-300 border-red-500/40';
    level = 'CRITICAL';
  } else if (boundedScore > 60) {
    colorClass = 'text-orange-400 border-orange-500/40 bg-orange-500/10';
    badgeBg = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    level = 'HIGH';
  } else if (boundedScore > 30) {
    colorClass = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    level = 'MEDIUM';
  }

  const dimensions = {
    sm: 'w-10 h-10 text-xs border',
    md: 'w-16 h-16 text-lg font-bold border-2',
    lg: 'w-24 h-24 text-3xl font-extrabold border-4',
    xl: 'w-32 h-32 text-4xl font-extrabold border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      <div className={`rounded-full flex items-center justify-center font-mono ${dimensions} ${colorClass} shadow-lg shadow-black/40 backdrop-blur-sm`}>
        {boundedScore}
      </div>
      {showLabel && (
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badgeBg}`}>
          {level} RISK
        </span>
      )}
    </div>
  );
};
