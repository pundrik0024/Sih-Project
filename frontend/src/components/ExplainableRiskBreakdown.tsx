import React from 'react';
import { RiskFactorBreakdown } from '../types';
import { ShieldAlert, Cpu, HardDriveDownload, Globe, Activity, Clock, Laptop, History, CheckCircle2 } from 'lucide-react';

interface Props {
  factors: RiskFactorBreakdown;
  reasons: string[];
  recommendedAction?: string;
  totalScore: number;
}

export const ExplainableRiskBreakdown: React.FC<Props> = ({
  factors,
  reasons,
  recommendedAction,
  totalScore,
}) => {
  const factorItems = [
    { key: 'ml_anomaly_score', label: 'ML Anomaly Detection', weight: '30%', val: factors.ml_anomaly_score, icon: Cpu, desc: 'Isolation Forest statistical anomaly index' },
    { key: 'data_exfil_score', label: 'Data Exfiltration Volume', weight: '20%', val: factors.data_exfil_score, icon: HardDriveDownload, desc: 'Burst payload & upload/download ratio' },
    { key: 'dst_anomaly_score', label: 'Destination Reputation', weight: '15%', val: factors.dst_anomaly_score, icon: Globe, desc: 'Unobserved external IP & threat intel' },
    { key: 'behavior_deviation_score', label: 'UEBA Baseline Deviation', weight: '15%', val: factors.behavior_deviation_score, icon: Activity, desc: 'Divergence from user historical pattern' },
    { key: 'time_anomaly_score', label: 'Off-Hours Anomaly', weight: '5%', val: factors.time_anomaly_score, icon: Clock, desc: 'Activity outside normal working hours' },
    { key: 'device_anomaly_score', label: 'Device ID Anomaly', weight: '5%', val: factors.device_anomaly_score, icon: Laptop, desc: 'Unregistered or mismatched hardware ID' },
    { key: 'historical_risk_score', label: 'Historical Incident Risk', weight: '10%', val: factors.historical_risk_score, icon: History, desc: 'Prior security violation penalties' },
  ];

  return (
    <div className="space-y-6">
      {/* Explainability Reasoning Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2.5 mb-3 text-cyan-400 font-semibold text-sm uppercase tracking-wider">
          <ShieldAlert className="w-5 h-5" />
          <span>Explainable Threat Analysis ("Why was this detected?")</span>
        </div>
        <ul className="space-y-2.5">
          {reasons && reasons.length > 0 ? (
            reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-200 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-cyan-400 font-mono font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Traffic parameters comply with normal employee behavioral baseline.
            </li>
          )}
        </ul>

        {recommendedAction && (
          <div className="mt-4 p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-lg flex items-start gap-2.5">
            <span className="text-cyan-400 font-bold text-xs uppercase px-2 py-0.5 bg-cyan-900/60 rounded">Recommendation</span>
            <p className="text-xs text-cyan-200 font-medium leading-relaxed">{recommendedAction}</p>
          </div>
        )}
      </div>

      {/* 7-Factor Weighted Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
            Multi-Factor Risk Score Composition
          </h4>
          <span className="text-xs text-slate-400 font-mono">Total Risk Score: <strong className="text-cyan-300 font-bold">{totalScore}/100</strong></span>
        </div>

        <div className="space-y-4">
          {factorItems.map((item) => {
            const Icon = item.icon;
            const pct = Math.min(100, Math.max(0, item.val));
            let barColor = 'bg-emerald-500';
            if (pct > 75) barColor = 'bg-red-500';
            else if (pct > 50) barColor = 'bg-orange-500';
            else if (pct > 25) barColor = 'bg-amber-500';

            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.label}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-mono">Weight: {item.weight}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-200">{item.val.toFixed(1)} / 100</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-500 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
