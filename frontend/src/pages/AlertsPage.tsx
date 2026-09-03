import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldAlert, CheckCircle, Search, Filter, RefreshCw, ExternalLink, UserCheck } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts(severityFilter || undefined, statusFilter || undefined);
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [severityFilter, statusFilter]);

  const handleAcknowledge = async (e: React.MouseEvent, alertId: number) => {
    e.stopPropagation();
    try {
      await api.acknowledgeAlert(alertId);
      fetchAlerts();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      a.title.toLowerCase().includes(s) ||
      a.employee_name.toLowerCase().includes(s) ||
      a.department_name.toLowerCase().includes(s) ||
      a.threat_type.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
              Department-Scoped Alert Queue
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Security Incident Alerts
          </h1>
          <p className="text-xs text-slate-400">
            Automated threshold routing: High/Critical alerts notify assigned department managers & SOC analysts via strict RBAC.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Queue
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, employee, or department..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Alert Title</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Routed To</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.map((alert) => {
                let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                if (alert.severity === 'CRITICAL') badgeClass = 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse';
                else if (alert.severity === 'HIGH') badgeClass = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
                else if (alert.severity === 'MEDIUM') badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

                return (
                  <tr
                    key={alert.id}
                    onClick={() => {
                      if (alert.incident_id) {
                        navigate(`/incidents/${alert.incident_id}`);
                      }
                    }}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${badgeClass}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      <div>{alert.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(alert.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      {alert.employee_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-bold">
                        {alert.department_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-red-400">
                      {alert.risk_score.toFixed(1)} / 100
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {alert.routed_to}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.status === 'NEW' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {alert.status === 'NEW' && (
                        <button
                          onClick={(e) => handleAcknowledge(e, alert.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.incident_id && (
                        <button
                          onClick={() => navigate(`/incidents/${alert.incident_id}`)}
                          className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          Investigate <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
