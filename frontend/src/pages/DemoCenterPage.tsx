import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  ShieldAlert,
  Flame,
  Crosshair,
  RefreshCw,
  AlertTriangle,
  Lock,
  CheckCircle,
  ArrowRight,
  UserCheck,
  Building2,
  FileSearch,
  Activity,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ExplainableRiskBreakdown } from '../components/ExplainableRiskBreakdown';
import { IAMResponseModal } from '../components/IAMResponseModal';

export const DemoCenterPage: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<string>('data_exfiltration');
  const [running, setRunning] = useState<boolean>(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { user, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const scenarios = [
    {
      id: 'data_exfiltration',
      title: 'Scenario C — Critical Data Exfiltration Attack (Finance)',
      target: 'Amit Sharma (Senior Financial Analyst, Finance)',
      desc: 'Employee attempts 1.42 GB off-hours upload at 02:30 AM to an unobserved overseas server. Triggers Isolation Forest Anomaly (95/100) -> 91+ Critical Risk -> Routes Alert to Finance Manager -> Manager executes access restriction.',
      expectedRisk: '90–95 / 100 (CRITICAL)',
      icon: Flame,
      color: 'border-red-500/40 bg-red-500/10 text-red-400'
    },
    {
      id: 'brute_force',
      title: 'Scenario D — Brute Force Authentication Attack (IT)',
      target: 'Vikram Singh / IT Workstation',
      desc: 'Simulates 280 failed SSH authentication attempts within 60 seconds against a core database server. Triggers supervised threat classifier -> High Risk Alert (80+/100) -> Routed to IT Manager & SOC.',
      expectedRisk: '80–85 / 100 (HIGH)',
      icon: Crosshair,
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-400'
    },
    {
      id: 'suspicious',
      title: 'Scenario B — Suspicious External Destination (Operations)',
      target: 'Anand Verma (Operations)',
      desc: 'Mild behavioral divergence: Connection initiated to a newly registered external destination with moderate reputation. Triggers Medium Risk Alert (55/100) -> Routed to Operations Manager for review.',
      expectedRisk: '50–60 / 100 (MEDIUM)',
      icon: AlertTriangle,
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-400'
    },
    {
      id: 'normal',
      title: 'Scenario A — Normal Baseline Business Traffic',
      target: 'Sneha Mehta (Finance Payroll)',
      desc: 'Employee transfers standard 15–35 KB encrypted HTTPS packets within normal business hours to internal ERP gateway. Risk score remains safe (15/100) -> Logged only.',
      expectedRisk: '10–25 / 100 (LOW)',
      icon: CheckCircle,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
    }
  ];

  const handleRunDemo = async () => {
    setRunning(true);
    setDemoResult(null);
    setCurrentStageIndex(0);

    try {
      // Simulate live stage animations
      for (let i = 1; i <= 6; i++) {
        setCurrentStageIndex(i);
        await new Promise(r => setTimeout(r, 450));
      }

      const res = await api.runDemoScenario(activeScenario);
      setDemoResult(res);
      setCurrentStageIndex(7);
    } catch (e: any) {
      console.error(e);
      alert(`Demo error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleSwitchToManager = async () => {
    if (activeScenario === 'data_exfiltration') {
      await switchDemoRole('finance.manager@demo.local', 'managerPassword123!');
      navigate('/alerts');
    } else {
      await switchDemoRole('it.manager@demo.local', 'managerPassword123!');
      navigate('/alerts');
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] font-bold tracking-wider">
            1-CLICK EVALUATION SUITE
          </span>
          <span className="text-xs font-mono text-slate-400">NTRO / SIH PRESENTATION MODE</span>
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">
          Interactive End-to-End Cyber Threat Demo Center
        </h1>
        <p className="text-xs text-slate-400 max-w-3xl">
          Execute end-to-end attack scenarios across the 7-stage pipeline: Read-Only Optical Tap Ingestion → AI Anomaly Detection → UEBA Baseline Deviation → Explainable Risk Scoring → Department-Level Alert Routing → Authorized IAM Access Restriction → Tamper-Evident Audit Logging.
        </p>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = activeScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => { setActiveScenario(sc.id); setDemoResult(null); }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? `${sc.color} ring-1 ring-cyan-400 shadow-xl scale-[1.01]`
                  : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <Icon className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-100">{sc.title}</h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950/60 border border-slate-700">
                  {sc.expectedRisk}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{sc.desc}</p>
              <div className="text-[11px] font-mono text-slate-500">Target Entity: <strong className="text-slate-300">{sc.target}</strong></div>
            </div>
          );
        })}
      </div>

      {/* Run Demo Button Action Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Selected Scenario: <span className="text-cyan-300">{scenarios.find(s => s.id === activeScenario)?.title}</span>
            </h3>
            <p className="text-xs text-slate-400">Clicking will trigger the live pipeline trace in real time</p>
          </div>
        </div>

        <button
          onClick={handleRunDemo}
          disabled={running}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              Simulating Pipeline Trace...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 text-black" />
              Execute Complete Scenario
            </>
          )}
        </button>
      </div>

      {/* 7-Stage Interactive Pipeline Visualizer */}
      {(running || demoResult) && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Unidirectional Detection & Response Pipeline Execution
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {currentStageIndex === 7 ? 'PIPELINE COMPLETE' : `STAGE ${currentStageIndex} / 7 ACTIVE`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {[
              { num: 1, title: 'Mirrored Ingress', sub: 'Read-only optical tap' },
              { num: 2, title: 'Feature Preprocessing', sub: '14 cybersecurity vectors' },
              { num: 3, title: 'AI Anomaly Model', sub: 'Isolation Forest' },
              { num: 4, title: 'UEBA Baseline Diff', sub: 'Historical user pattern' },
              { num: 5, title: 'Explainable Risk', sub: '0-100 Multi-factor score' },
              { num: 6, title: 'Dept Alert Routing', sub: 'Scoped Manager Notify' },
              { num: 7, title: 'IAM Mitigation', sub: 'Human-in-the-Loop' },
            ].map((st) => {
              const isDone = currentStageIndex >= st.num;
              const isCurrent = currentStageIndex === st.num;

              return (
                <div
                  key={st.num}
                  className={`p-3.5 rounded-2xl border transition-all text-left ${
                    isCurrent
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/40 animate-pulse'
                      : isDone
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs mb-1">
                    <span>#{st.num}</span>
                    {isDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold leading-tight">{st.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{st.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Deep Results Inspector */}
          {demoResult && (
            <div className="space-y-6 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Explainable Factor Breakdown (7 cols) */}
                <div className="lg:col-span-7">
                  <ExplainableRiskBreakdown
                    factors={demoResult.result.risk_evaluation.factors}
                    reasons={demoResult.result.risk_evaluation.reasons}
                    recommendedAction={demoResult.result.risk_evaluation.recommended_action}
                    totalScore={demoResult.result.risk_evaluation.total_score}
                  />
                </div>

                {/* Response Action & Department Workflow (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Alert Context Card */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Routing Status:</span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold font-mono">
                        {demoResult.result.risk_evaluation.severity}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-300">
                      <div><strong>Affected Entity:</strong> {scenarios.find(s => s.id === activeScenario)?.target}</div>
                      <div><strong>Generated Flow ID:</strong> #{demoResult.result.flow.id} ({demoResult.result.flow.protocol})</div>
                      <div><strong>Bytes Sent:</strong> {(demoResult.result.flow.bytes_sent / 1000000).toFixed(1)} MB</div>
                    </div>

                    <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-300">
                      <strong className="block mb-1">Human-in-the-Loop Safeguard:</strong>
                      Mitigation commands are NOT automated inside the read-only tap. Authorized personnel must inspect and execute mitigation.
                    </div>
                  </div>

                  {/* Immediate Response Trigger */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Authorized IAM Response Simulation
                    </h4>
                    <p className="text-xs text-slate-400">
                      Initiate simulated access restriction or switch roles to test department manager isolation:
                    </p>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Execute Access Restriction (IAM)
                      </button>

                      <button
                        onClick={handleSwitchToManager}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-cyan-400" />
                        Switch to Department Manager Portal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* IAM Response Modal */}
      {demoResult && (
        <IAMResponseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employeeId={1} // Amit Sharma ID
          employeeName="Amit Sharma"
          currentStatus="ACTIVE"
          riskScore={demoResult.result.risk_evaluation.total_score}
          onActionSuccess={() => navigate('/audit-logs')}
        />
      )}
    </div>
  );
};
