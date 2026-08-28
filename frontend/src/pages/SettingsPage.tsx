import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings, Save, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [weights, setWeights] = useState({
    ml_anomaly: 0.30,
    data_exfiltration: 0.20,
    destination_anomaly: 0.15,
    behavior_deviation: 0.15,
    time_anomaly: 0.05,
    device_anomaly: 0.05,
    historical_risk: 0.10,
  });
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await api.getSystemSettings();
        if (config.weights) setWeights(config.weights);
      } catch (e) {
        console.error(e);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateRiskWeights(weights);
      setSavedMsg('Risk scoring weights updated successfully!');
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (e: any) {
      alert(`Error saving weights: ${e.message}`);
    }
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl space-y-1">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase">
            Risk Engine Tuning
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">
          Risk Factor Weights Configuration
        </h1>
        <p className="text-xs text-slate-400">
          Adjust the relative weighting for the 7 cybersecurity risk factors. Weights are normalized to compute the transparent 0–100 risk score.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {savedMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Risk Scoring Coefficients
          </h3>
          <span className={`font-mono text-xs font-bold px-3 py-1 rounded-xl ${
            Math.abs(totalWeight - 1.0) < 0.01 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
          }`}>
            Sum of Weights: {(totalWeight * 100).toFixed(0)}% (Expected 100%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {[
            { key: 'ml_anomaly', label: 'ML Anomaly Detection Weight', desc: 'Weight given to Isolation Forest model' },
            { key: 'data_exfiltration', label: 'Data Exfiltration Volume Weight', desc: 'Weight given to outbound payload size' },
            { key: 'destination_anomaly', label: 'Destination Reputation Weight', desc: 'Weight given to unobserved external IPs' },
            { key: 'behavior_deviation', label: 'UEBA Baseline Deviation Weight', desc: 'Weight given to user behavioral delta' },
            { key: 'time_anomaly', label: 'Off-Hours Activity Weight', desc: 'Weight given to off-hours connections' },
            { key: 'device_anomaly', label: 'Device ID Mismatch Weight', desc: 'Weight given to unregistered MAC/devices' },
            { key: 'historical_risk', label: 'Historical Incidents Penalty', desc: 'Weight given to repeat security incidents' },
          ].map((item) => (
            <div key={item.key} className="space-y-2 p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200">{item.label}</label>
                <span className="font-mono text-cyan-400 font-bold">
                  {(weights[item.key as keyof typeof weights] * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights[item.key as keyof typeof weights]}
                onChange={(e) => setWeights({ ...weights, [item.key]: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Weight Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
