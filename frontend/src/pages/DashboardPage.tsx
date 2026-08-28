import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  Users,
  AlertTriangle,
  Lock,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Radio,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { api } from '../services/api';
import { SimulatorToolbar } from '../components/SimulatorToolbar';
import { RiskGauge } from '../components/RiskGauge';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 6000);
    return () => clearInterval(interval);
  }, []);

  // Demo live traffic trend mockup for Recharts Area
  const trafficTrendData = [
    { time: '00:00', normalVolume: 120, anomalyVolume: 2 },
    { time: '02:00', normalVolume: 85, anomalyVolume: 18 },
    { time: '04:00', normalVolume: 40, anomalyVolume: 5 },
    { time: '06:00', normalVolume: 90, anomalyVolume: 4 },
    { time: '08:00', normalVolume: 450, anomalyVolume: 12 },
    { time: '10:00', normalVolume: 780, anomalyVolume: 15 },
    { time: '12:00', normalVolume: 620, anomalyVolume: 8 },
    { time: '14:00', normalVolume: 890, anomalyVolume: 22 },
    { time: '16:00', normalVolume: 740, anomalyVolume: 14 },
    { time: '18:00', normalVolume: 320, anomalyVolume: 9 },
    { time: '20:00', normalVolume: 190, anomalyVolume: 6 },
    { time: '22:00', normalVolume: 140, anomalyVolume: 4 },
  ];

  const riskPieData = summary?.risk_overview ? [
    { name: 'Low Risk (0-30)', value: summary.risk_overview.low, color: '#10b981' },
    { name: 'Medium Risk (31-60)', value: summary.risk_overview.medium, color: '#f59e0b' },
    { name: 'High Risk (61-80)', value: summary.risk_overview.high, color: '#f97316' },
    { name: 'Critical Risk (81-100)', value: summary.risk_overview.critical, color: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] font-bold tracking-wider">
              REAL-TIME SOC TELEMETRY
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Cyber Threat Detection & Risk Response Command
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Unidirectional IP traffic is mirrored through a read-only optical tap. Threats are scored via Isolation Forest & UEBA baselines, and routed to authorized department managers for mitigation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSummary}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Link
            to="/demo"
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Flame className="w-4 h-4 text-black" />
            Launch Demo Attack
          </Link>
        </div>
      </div>

      {/* Simulator Toolbar */}
      <SimulatorToolbar onScenarioTriggered={fetchSummary} />

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Flows</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100">
            {summary?.total_network_flows || 0}
          </div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">Mirrored Packets</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Monitored Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100">
            {summary?.active_employees || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Active UEBA Baselines</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Threats Detected</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {summary?.threats_detected || 0}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1 font-mono">AI Flagged Anomalies</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Critical Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black font-mono text-red-400 animate-pulse">
            {summary?.critical_alerts || 0}
          </div>
          <div className="text-[10px] text-red-400/80 mt-1 font-mono">Risk &gt; 80 (Routed)</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">High Risk Users</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black font-mono text-orange-400">
            {summary?.high_risk_users || 0}
          </div>
          <div className="text-[10px] text-orange-400/80 mt-1 font-mono">Divergent Behavior</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Restricted Users</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            {summary?.currently_restricted_users || 0}
          </div>
          <div className="text-[10px] text-purple-400/80 mt-1 font-mono">IAM Quarantined</div>
        </div>
      </div>

      {/* Main SOC Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Traffic Volume vs Anomalies (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Unidirectional Ingress Volume vs. AI Anomalies
              </h3>
              <p className="text-xs text-slate-400">Mirrored MB/s telemetry with statistical anomaly correlation</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-lg">
              24-Hour Horizon
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficTrendData}>
                <defs>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" textAnchor="end" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="normalVolume" stroke="#38bdf8" fillOpacity={1} fill="url(#colorNormal)" name="Normal Volume (MB/s)" />
                <Area type="monotone" dataKey="anomalyVolume" stroke="#ef4444" fillOpacity={1} fill="url(#colorAnomaly)" name="Anomaly Burst (MB/s)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Entity Risk Distribution
            </h3>
            <p className="text-xs text-slate-400">UEBA 0–100 scored workforce breakdown</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {riskPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/40">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate">{item.name.split(' ')[0]}:</span>
                <span className="font-mono font-bold text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Threats by Department & Recent Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Threats by Department (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Threat Incidents by Department
              </h3>
              <p className="text-xs text-slate-400">Alert routing targets & critical incident density</p>
            </div>
            <Link to="/departments" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.threats_by_department || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="department_code" type="category" stroke="#64748b" fontSize={11} width={40} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="total_alerts" fill="#38bdf8" name="Total Alerts" radius={[0, 4, 4, 0]} />
                <Bar dataKey="critical_alerts" fill="#ef4444" name="Critical Alerts" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Recent Alerts Ticker (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Live Alert Feed & Routing Queue
              </h3>
              <p className="text-xs text-slate-400">Automatic escalation to assigned department managers</p>
            </div>
            <Link to="/alerts" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
              View All Alerts <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {summary?.recent_alerts && summary.recent_alerts.length > 0 ? (
              summary.recent_alerts.map((alert: any) => {
                let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                if (alert.severity === 'CRITICAL') badgeClass = 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse';
                else if (alert.severity === 'HIGH') badgeClass = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
                else if (alert.severity === 'MEDIUM') badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

                return (
                  <div
                    key={alert.id}
                    onClick={() => navigate(`/alerts/${alert.id}`)}
                    className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeClass}`}>
                        {alert.severity}
                      </span>
                      <div>
                        <div className="font-bold text-slate-200">{alert.threat_type}</div>
                        <div className="text-[11px] text-slate-400">
                          {alert.employee_name} • <span className="text-cyan-300 font-semibold">{alert.department_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block">
                        <div className="text-[11px] font-mono font-bold text-red-400">Score: {alert.risk_score}/100</div>
                        <div className="text-[10px] text-slate-500">{alert.routed_to}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 hover:text-cyan-400" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No active threats detected. All traffic matches baseline.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
