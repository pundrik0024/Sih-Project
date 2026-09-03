import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Employee } from '../types';
import { api } from '../services/api';
import {
  User,
  ArrowLeft,
  Activity,
  HardDriveDownload,
  Lock,
  Calendar,
  Laptop,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RiskGauge } from '../components/RiskGauge';
import { IAMResponseModal } from '../components/IAMResponseModal';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchDetail = async () => {
    if (!id) return;
    try {
      const data = await api.getEmployeeDetail(Number(id));
      setEmployee(data);
    } catch (e: any) {
      alert(`Access Restricted: ${e.message}`);
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading || !employee) {
    return <div className="p-8 text-center text-slate-400 text-xs font-mono">Loading employee profile...</div>;
  }

  const baseline = employee.baseline;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/employees')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
      </button>

      {/* Main Employee Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <User className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400">{employee.employee_code}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">{employee.department_name}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-0.5">{employee.name}</h1>
            <p className="text-xs text-slate-400">{employee.role_title} • {employee.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-l border-slate-800 pl-6">
          <RiskGauge score={employee.risk_score} size="lg" />

          <button
            onClick={() => setIsResponseModalOpen(true)}
            className="px-6 py-3 bg-red-500 hover:bg-red-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-red-500/20 transition-all flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Mitigation / IAM Response
          </button>
        </div>
      </div>

      {/* Baseline Parameters & 7-Day Risk Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Risk Score History (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                7-Day UEBA Risk Score Trend
              </h3>
              <p className="text-xs text-slate-400">Chronological risk score progression</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-lg">
              Historical Timeline
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={employee.risk_history_7d || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="risk_score" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} name="Risk Score (0-100)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* UEBA Baseline Profile (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Entity Behavioral Baseline
            </h3>
            <p className="text-xs text-slate-400">Standard operating parameters</p>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Avg Daily Outbound:</span>
              <strong className="text-slate-100 font-mono">
                {baseline ? `${(baseline.avg_daily_bytes_sent / 1000000).toFixed(1)} MB` : '25.0 MB'}
              </strong>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Normal Working Hours:</span>
              <strong className="text-slate-100 font-mono">
                {baseline?.normal_work_hours || '09:00 - 18:00'}
              </strong>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Typical Connection Rate:</span>
              <strong className="text-slate-100 font-mono">
                {baseline?.avg_connections_per_min || 12} conn / min
              </strong>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Assigned Primary Device:</span>
              <strong className="text-cyan-300 font-mono">
                {employee.device_id || 'WS-PRIMARY'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* IAM Response Modal */}
      <IAMResponseModal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        employeeId={employee.id}
        employeeName={employee.name}
        currentStatus={employee.account_status}
        riskScore={employee.risk_score}
        onActionSuccess={fetchDetail}
      />
    </div>
  );
};
