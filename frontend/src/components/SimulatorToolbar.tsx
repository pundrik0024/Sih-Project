import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Flame, Crosshair, RefreshCw, AlertOctagon, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  onScenarioTriggered?: () => void;
}

export const SimulatorToolbar: React.FC<Props> = ({ onScenarioTriggered }) => {
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [lastExecutedTime, setLastExecutedTime] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleScenario = async (scenarioKey: string) => {
    setLoadingScenario(scenarioKey);
    setStatusMsg(`Injecting ${scenarioKey.replace(/_/g, ' ')} scenario...`);
    try {
      await api.triggerScenario(scenarioKey);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastExecutedTime(timeStr);
      setStatusMsg(`Scenario '${scenarioKey.replace(/_/g, ' ')}' injected into mirrored stream at ${timeStr}`);
      if (onScenarioTriggered) onScenarioTriggered();
    } catch (e: any) {
      setStatusMsg(`Error: ${e.message}`);
    } finally {
      setLoadingScenario(null);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const scenarios = [
    {
      id: 'normal',
      name: 'Normal Traffic',
      desc: 'Baseline business',
      icon: Shield,
      accent: 'border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'
    },
    {
      id: 'suspicious',
      name: 'Suspicious Dest.',
      desc: 'External anomaly',
      icon: AlertOctagon,
      accent: 'border-amber-500/30 hover:border-amber-500/60 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10'
    },
    {
      id: 'data_exfiltration',
      name: 'Data Exfiltration',
      desc: 'High risk transfer',
      icon: Flame,
      accent: 'border-red-500/30 hover:border-red-500/60 text-red-400 bg-red-500/5 hover:bg-red-500/10'
    },
    {
      id: 'brute_force',
      name: 'Brute Force SSH',
      desc: 'Auth attack',
      icon: Crosshair,
      accent: 'border-purple-500/30 hover:border-purple-500/60 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10'
    },
    {
      id: 'port_scan',
      name: 'Port Scan',
      desc: 'Reconnaissance',
      icon: RefreshCw,
      accent: 'border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10'
    }
  ];

  return (
    <div className="bg-[#121a2d] border border-[#1e2942] rounded-2xl p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
              Network Traffic Simulator
            </h3>
            <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-[#0d1322] border border-[#1e2942]">
              Read-Only Tap Injection
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Inject synthetic traffic scenarios into mirrored stream to evaluate detection engines
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          {lastExecutedTime && (
            <span className="text-slate-400">
              Last Execution: <span className="text-slate-200">{lastExecutedTime}</span>
            </span>
          )}
          <button
            onClick={() => navigate('/demo')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1322] hover:bg-[#18233c] text-cyan-400 hover:text-cyan-300 font-semibold rounded-lg border border-[#1e2942] transition-colors"
          >
            <span>View Demo Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 Scenario Buttons Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isLoading = loadingScenario === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => handleScenario(sc.id)}
              disabled={loadingScenario !== null}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed ${sc.accent}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{sc.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{sc.desc}</div>
                </div>
              </div>
              <ArrowRight className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </button>
          );
        })}
      </div>

      {statusMsg && (
        <div className="mt-3 py-1.5 px-3 rounded-lg bg-[#0d1322] border border-[#1e2942] text-[11px] font-mono text-cyan-300 flex items-center justify-between">
          <span>{statusMsg}</span>
          <span className="text-[10px] text-slate-500">Live Status Feed</span>
        </div>
      )}
    </div>
  );
};
