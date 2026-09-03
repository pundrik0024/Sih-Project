import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Incident } from '../types';
import { api } from '../services/api';
import { AlertTriangle, ShieldAlert, ArrowUpRight, Search, RefreshCw, Lock } from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  const fetchIncidents = async () => {
    try {
      const data = await api.getIncidents(statusFilter || undefined);
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 6000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const filteredIncidents = incidents.filter(i => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      i.title.toLowerCase().includes(s) ||
      i.incident_code.toLowerCase().includes(s) ||
      i.employee_name.toLowerCase().includes(s) ||
      i.department_name.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-[11px] font-mono font-bold text-red-300 uppercase">
              Incident Response Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Active Security Incidents
          </h1>
          <p className="text-xs text-slate-400">
            High-severity threats requiring authorized human-in-the-loop investigation and out-of-band IAM mitigation.
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIncidents.map((inc) => {
          let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
          if (inc.severity === 'CRITICAL') badgeClass = 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse';
          else if (inc.severity === 'HIGH') badgeClass = 'bg-orange-500/20 text-orange-300 border-orange-500/40';

          return (
            <div
              key={inc.id}
              onClick={() => navigate(`/incidents/${inc.id}`)}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 rounded-3xl p-5 shadow-xl hover:shadow-2xl cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {inc.incident_code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeClass}`}>
                    {inc.severity}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug mb-2">
                  {inc.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {inc.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Entity: <strong className="text-slate-200">{inc.employee_name}</strong></span>
                  <span className="text-cyan-300 font-semibold">{inc.department_name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-red-400 font-bold">
                    Risk: {inc.risk_score.toFixed(0)}/100
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    inc.status === 'MITIGATED' ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {inc.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
