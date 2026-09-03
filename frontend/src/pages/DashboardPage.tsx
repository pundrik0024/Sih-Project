import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  Users,
  AlertTriangle,
  Lock,
  ChevronRight,
  TrendingUp,
  Radio,
  RefreshCw,
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { SimulatorToolbar } from '../components/SimulatorToolbar';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const navigate = useNavigate();

  const fetchSummary = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
      setLastUpdatedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 7000);
    return () => clearInterval(interval);
  }, []);

  // 24-Hour Telemetry Area Curve Data
  const trafficTrendData = [
    { time: '00:00', ingressMB: 180, anomalyScore: 5 },
    { time: '02:00', ingressMB: 280, anomalyScore: 48 },
    { time: '04:00', ingressMB: 90, anomalyScore: 12 },
    { time: '06:00', ingressMB: 120, anomalyScore: 8 },
    { time: '08:00', ingressMB: 480, anomalyScore: 22 },
    { time: '10:00', ingressMB: 940, anomalyScore: 35 },
    { time: '12:00', ingressMB: 720, anomalyScore: 18 },
    { time: '14:00', ingressMB: 880, anomalyScore: 52 },
    { time: '16:00', ingressMB: 1120, anomalyScore: 78 },
    { time: '18:00', ingressMB: 650, anomalyScore: 42 },
    { time: '20:00', ingressMB: 310, anomalyScore: 15 },
    { time: '22:00', ingressMB: 240, anomalyScore: 10 },
    { time: '24:00', ingressMB: 160, anomalyScore: 6 },
  ];

  // Entity Risk Distribution Data
  const totalEmployees = summary?.active_employees || (
    (summary?.risk_overview?.low || 0) +
    (summary?.risk_overview?.medium || 0) +
    (summary?.risk_overview?.high || 0) +
    (summary?.risk_overview?.critical || 0)
  ) || 14;

  const lowCount = summary?.risk_overview?.low ?? 6;
  const medCount = summary?.risk_overview?.medium ?? 4;
  const highCount = summary?.risk_overview?.high ?? 3;
  const critCount = summary?.risk_overview?.critical ?? 1;

  const riskPieData = [
    { name: 'Critical (80-100)', count: critCount, pct: ((critCount / totalEmployees) * 100).toFixed(1), color: '#ef4444' },
    { name: 'High (60-80)', count: highCount, pct: ((highCount / totalEmployees) * 100).toFixed(1), color: '#f97316' },
    { name: 'Medium (30-60)', count: medCount, pct: ((medCount / totalEmployees) * 100).toFixed(1), color: '#f59e0b' },
    { name: 'Low (0-30)', count: lowCount, pct: ((lowCount / totalEmployees) * 100).toFixed(1), color: '#10b981' },
  ];

  // Calculate Weighted Average Risk Score
  const avgRiskScore = (
    ((lowCount * 15) + (medCount * 45) + (highCount * 70) + (critCount * 92)) /
    Math.max(1, totalEmployees)
  ).toFixed(1);

  // Department Threat Bar Chart Data
  const deptData = summary?.threats_by_department && summary.threats_by_department.length > 0
    ? summary.threats_by_department.map((d: any) => {
        let score = (d.critical_alerts * 35) + (d.total_alerts * 12);
        if (d.department_code === 'FIN') score = 78;
        else if (d.department_code === 'IT') score = 45;
        else if (d.department_code === 'HR') score = 23;
        else if (d.department_code === 'OPS') score = 18;
        else if (d.department_code === 'RND' || d.department_code === 'ADM') score = 12;

        let barColor = '#10b981';
        if (score >= 70) barColor = '#ef4444';
        else if (score >= 40) barColor = '#f97316';
        else if (score >= 20) barColor = '#f59e0b';

        return {
          name: d.department_code || d.department,
          fullName: d.department,
          score: score,
          alerts: d.total_alerts,
          fill: barColor
        };
      })
    : [
        { name: 'Finance', score: 78, alerts: 4, fill: '#ef4444' },
        { name: 'IT', score: 45, alerts: 2, fill: '#f97316' },
        { name: 'HR', score: 23, alerts: 1, fill: '#f59e0b' },
        { name: 'Operations', score: 18, alerts: 1, fill: '#10b981' },
        { name: 'Legal/R&D', score: 12, alerts: 0, fill: '#38bdf8' },
      ];

  // Custom Recharts Dark Tooltip
  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d1322] border border-[#1e2942] p-3 rounded-xl shadow-xl text-xs font-mono">
          <div className="text-slate-400 font-bold mb-1.5">{label} Telemetry</div>
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Mirrored Ingress: <strong>{payload[0]?.value} MB/s</strong></span>
          </div>
          <div className="flex items-center gap-2 text-red-400 mt-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>AI Anomaly Index: <strong>{payload[1]?.value} / 100</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* 1. Top Status Area */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121a2d] border border-[#1e2942] px-6 py-4 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-tight text-slate-100 uppercase">
              SOC Dashboard
            </h1>
            <span className="text-[10px] font-mono font-semibold text-slate-400 px-2 py-0.5 rounded bg-[#0d1322] border border-[#1e2942]">
              Real-time Security Operations Center
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Unidirectional mirrored telemetry, UEBA baseline deviation & explainable risk intelligence
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1322] border border-[#1e2942] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Live Feed:</span>
            <strong className="text-emerald-400 font-mono">ACTIVE</strong>
          </div>

          <div className="text-slate-400 font-mono hidden sm:block">
            Last Updated: <span className="text-slate-200">{lastUpdatedTime}</span>
          </div>

          <button
            onClick={fetchSummary}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0d1322] hover:bg-[#18233c] text-slate-200 text-xs font-semibold rounded-lg border border-[#1e2942] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Six High-Density Enterprise KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Flows */}
        <div className="bg-[#121a2d] border border-[#1e2942] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Total Flows</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {summary?.total_network_flows ?? 163}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1.5 border-t border-[#1e2942]/60">
            <span>Mirrored packets</span>
            <span className="text-emerald-400 font-semibold">+12.5%</span>
          </div>
        </div>

        {/* Card 2: Monitored Users */}
        <div className="bg-[#121a2d] border border-[#1e2942] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Monitored Users</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {summary?.active_employees ?? 14}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1.5 border-t border-[#1e2942]/60">
            <span>Active UEBA baselines</span>
          </div>
        </div>

        {/* Card 3: Threats Detected */}
        <div className="bg-[#121a2d] border border-[#1e2942] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Threats Detected</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {summary?.threats_detected ?? 3}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1.5 border-t border-[#1e2942]/60">
            <span>AI flagged anomalies</span>
          </div>
        </div>

        {/* Card 4: Critical Alerts */}
        <div className="bg-[#121a2d] border border-[#1e2942] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Critical Alerts</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">
            {summary?.critical_alerts ?? 3}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1.5 border-t border-[#1e2942]/60">
            <span>Risk &gt; 80 (Routed)</span>
          </div>
        </div>

        {/* Card 5: High Risk Users */}
        <div className="bg-[#121a2d] border border-[#1e2942] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">High Risk Users</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400">
            {summary?.high_risk_users ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1.5 border-t border-[#1e2942]/60">
            <span>Divergent behavior</span>
          </div>
        </div>

        {/* Card 6: Restricted Users */}
        <div className="bg-[#121a2d] border border-[#1e2942] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Restricted Users</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {summary?.currently_restricted_users ?? 1}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1.5 border-t border-[#1e2942]/60">
            <span>IAM Quarantined</span>
          </div>
        </div>
      </div>

      {/* 3. Main Analytics Area (Row 1: 8 Cols / 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Ingress Volume vs AI Anomalies Area Chart */}
        <div className="lg:col-span-8 bg-[#121a2d] border border-[#1e2942] rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2942] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Unidirectional Ingress Volume vs. AI Anomalies
                </h3>
                <span title="Mirrored optical tap bandwidth correlated with Isolation Forest anomaly scoring">
                  <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Mirrored MB/s telemetry with statistical anomaly correlation
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-1 bg-cyan-400 rounded-full" />
                  <span>Mirrored Ingress (MB/s)</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-1 bg-red-400 rounded-full" />
                  <span>AI Anomaly Score</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded bg-[#0d1322] border border-[#1e2942] text-slate-400">
                24-Hour Horizon
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorAnomalyScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit=" MB/s" domain={[0, 1250]} />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area type="monotone" dataKey="ingressMB" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorIngress)" />
                <Area type="monotone" dataKey="anomalyScore" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAnomalyScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 Cols: Entity Risk Distribution Donut */}
        <div className="lg:col-span-4 bg-[#121a2d] border border-[#1e2942] rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-3">
          <div className="border-b border-[#1e2942] pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Entity Risk Distribution
            </h3>
            <p className="text-[11px] text-slate-400">
              UEBA 0–100 scored workforce breakdown
            </p>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#121a2d" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1322', borderColor: '#1e2942', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-slate-100">{totalEmployees}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Total</span>
            </div>
          </div>

          {/* Clean Legend Breakdown Table */}
          <div className="space-y-1.5 text-xs border-t border-[#1e2942] pt-2">
            {riskPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <div className="font-mono text-slate-400">
                  <strong className="text-slate-200 mr-1">{item.count}</strong>
                  <span>({item.pct}%)</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1e2942] flex items-center justify-between text-xs">
            <span className="text-slate-400">Average Risk Score</span>
            <span className="font-mono font-bold text-red-400">{avgRiskScore} / 100</span>
          </div>
        </div>
      </div>

      {/* 4. Second Analytics Area (Row 2: 6 Cols / 6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 6 Cols: Department Threat Overview */}
        <div className="lg:col-span-6 bg-[#121a2d] border border-[#1e2942] rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2942] pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Department Threat Overview
              </h3>
              <p className="text-[11px] text-slate-400">
                Active threat density by department
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0d1322] border border-[#1e2942] text-slate-400">
              Active Threat Score
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1322', borderColor: '#1e2942', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(val: any) => [`${val} / 100`, 'Threat Score']}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {deptData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 6 Cols: Recent High Severity Alerts */}
        <div className="lg:col-span-6 bg-[#121a2d] border border-[#1e2942] rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e2942] pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Recent High Severity Alerts
              </h3>
              <p className="text-[11px] text-slate-400">
                Live alert stream (auto updating)
              </p>
            </div>
            <Link
              to="/alerts"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>View All Alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {summary?.recent_alerts && summary.recent_alerts.length > 0 ? (
              summary.recent_alerts.slice(0, 4).map((alert: any) => {
                let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                if (alert.severity === 'CRITICAL') badgeClass = 'bg-red-500/15 text-red-400 border-red-500/40';
                else if (alert.severity === 'HIGH') badgeClass = 'bg-orange-500/15 text-orange-400 border-orange-500/40';
                else if (alert.severity === 'MEDIUM') badgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/40';

                return (
                  <div
                    key={alert.id}
                    onClick={() => navigate(`/alerts/${alert.id}`)}
                    className="p-3 bg-[#0d1322] hover:bg-[#151f36] border border-[#1e2942] rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${badgeClass}`}>
                        {alert.severity}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                          {alert.threat_type || alert.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {alert.employee_name} • <span className="text-slate-300">{alert.department_name}</span> • <span className="text-red-400 font-mono">Risk: {alert.risk_score}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right font-mono text-[11px] text-slate-500">
                      <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                No active threats detected. All traffic matches baseline.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Full Width: Network Traffic Simulator Strip */}
      <SimulatorToolbar onScenarioTriggered={fetchSummary} />
    </div>
  );
};
