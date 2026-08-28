import React, { useState } from 'react';
import { Play, Pause, Zap, Shield, Flame, Crosshair, RefreshCw, AlertOctagon } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  onScenarioTriggered?: () => void;
}

export const SimulatorToolbar: React.FC<Props> = ({ onScenarioTriggered }) => {
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleScenario = async (scenarioKey: string) => {
    setLoadingScenario(scenarioKey);
    setStatusMsg(`Simulating ${scenarioKey}...`);
    try {
      await api.triggerScenario(scenarioKey);
      setStatusMsg(`Scenario '${scenarioKey}' injected successfully!`);
      if (onScenarioTriggered) onScenarioTriggered();
    } catch (e: any) {
      setStatusMsg(`Error: ${e.message}`);
    } finally {
      setLoadingScenario(null);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleTick = async () => {
    try {
      await api.triggerSimulatorTick();
      if (onScenarioTriggered) onScenarioTriggered();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Network Traffic Simulator</h4>
            <p className="text-[11px] text-slate-400">Simulate mirrored packets across monitored IP channels</p>
          </div>
        </div>

        {/* Action Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleScenario('normal')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            Normal Traffic
          </button>

          <button
            onClick={() => handleScenario('suspicious')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg transition-all"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Suspicious Destination
          </button>

          <button
            onClick={() => handleScenario('data_exfiltration')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all shadow-md shadow-red-950"
          >
            <Flame className="w-3.5 h-3.5 animate-pulse text-red-400" />
            Data Exfiltration (1.4GB)
          </button>

          <button
            onClick={() => handleScenario('brute_force')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 text-xs font-medium rounded-lg transition-all"
          >
            <Crosshair className="w-3.5 h-3.5" />
            Brute Force SSH
          </button>

          <button
            onClick={() => handleScenario('port_scan')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 text-xs font-medium rounded-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Port Scan
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="mt-2.5 text-center text-xs font-mono text-cyan-300 bg-cyan-950/40 py-1 rounded border border-cyan-800/40">
          {statusMsg}
        </div>
      )}
    </div>
  );
};
