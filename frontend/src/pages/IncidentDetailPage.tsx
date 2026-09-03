import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Incident } from '../types';
import { api } from '../services/api';
import {
  AlertTriangle,
  Shield,
  Lock,
  ArrowLeft,
  Activity,
  HardDriveDownload,
  Clock,
  User,
  Building2,
  Laptop,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { ExplainableRiskBreakdown } from '../components/ExplainableRiskBreakdown';
import { IAMResponseModal } from '../components/IAMResponseModal';
import { RiskGauge } from '../components/RiskGauge';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchDetail = async () => {
    if (!id) return;
    try {
      const data = await api.getIncidentDetail(Number(id));
      setIncident(data);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
      navigate('/incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading || !incident) {
    return <div className="p-8 text-center text-slate-400 text-xs font-mono">Loading incident telemetry...</div>;
  }

  const defaultFactors = {
    ml_anomaly_score: 95.0,
    data_exfil_score: 100.0,
    dst_anomaly_score: 85.0,
    behavior_deviation_score: 100.0,
    time_anomaly_score: 90.0,
    device_anomaly_score: 10.0,
    historical_risk_score: 25.0
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/incidents')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Incidents
        </button>

        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-xl">
          INCIDENT CODE: {incident.incident_code}
        </span>
      </div>

      {/* Main Incident Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
              incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
            }`}>
              {incident.severity} SEVERITY
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Reported: {new Date(incident.created_at).toLocaleString()}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            {incident.title}
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* Risk Score Gauge & Trigger Mitigation */}
        <div className="flex items-center gap-6 border-l border-slate-800 pl-6">
          <RiskGauge score={incident.risk_score} size="lg" />

          <button
            onClick={() => setIsResponseModalOpen(true)}
            className="px-6 py-3 bg-red-500 hover:bg-red-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-red-500/20 transition-all flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Authorized Response Action
          </button>
        </div>
      </div>

      {/* Entity Context & Network Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Employee Profile */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4" /> Affected Employee Profile
          </div>
          <div className="text-xs space-y-2 text-slate-300 font-sans">
            <div><strong>Name:</strong> {incident.employee?.name}</div>
            <div><strong>Role:</strong> {incident.employee?.role_title}</div>
            <div><strong>Department:</strong> {incident.department?.name}</div>
            <div><strong>Account Status:</strong> <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-cyan-300">{incident.employee?.account_status}</span></div>
            <div><strong>Normal Hours:</strong> {incident.employee?.working_hours}</div>
          </div>
        </div>

        {/* Network Flow Telemetry */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" /> Mirrored Packet Telemetry
          </div>
          <div className="text-xs space-y-2 text-slate-300 font-mono">
            <div>Source: <span className="text-cyan-300">{incident.flow?.src_ip}:{incident.flow?.src_port}</span></div>
            <div>Target: <span className="text-red-300">{incident.flow?.dst_ip}:{incident.flow?.dst_port}</span></div>
            <div>Protocol: {incident.flow?.protocol}</div>
            <div>Payload Out: <strong className="text-red-400">{((incident.flow?.bytes_sent || 0) / 1000000).toFixed(1)} MB</strong></div>
            <div>Reputation: {((incident.flow?.destination_reputation || 0) * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Response Action History */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" /> Mitigation History
          </div>
          <div className="text-xs space-y-2">
            {incident.response_actions && incident.response_actions.length > 0 ? (
              incident.response_actions.map((act) => (
                <div key={act.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-300">
                    <span>{act.action_type}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(act.executed_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-400">{act.reason}</div>
                  <div className="text-[10px] text-slate-500">By: {act.executed_by_name} ({act.executed_by_role})</div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-[11px]">No response actions executed yet. Human approval required.</div>
            )}
          </div>
        </div>
      </div>

      {/* Explainable Factor Breakdown Component */}
      <ExplainableRiskBreakdown
        factors={incident.risk_breakdown || defaultFactors}
        reasons={incident.reasons}
        recommendedAction={incident.recommended_action}
        totalScore={incident.risk_score}
      />

      {/* IAM Response Modal */}
      {incident.employee?.id && (
        <IAMResponseModal
          isOpen={isResponseModalOpen}
          onClose={() => setIsResponseModalOpen(false)}
          employeeId={incident.employee.id}
          employeeName={incident.employee.name || 'Employee'}
          currentStatus={incident.employee.account_status || 'ACTIVE'}
          riskScore={incident.risk_score}
          incidentId={incident.id}
          onActionSuccess={() => {
            fetchDetail();
          }}
        />
      )}
    </div>
  );
};
