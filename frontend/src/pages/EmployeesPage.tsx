import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee } from '../types';
import { api } from '../services/api';
import { Users, Shield, Search, Filter, RefreshCw, Lock, ExternalLink, Activity } from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees(undefined, statusFilter || undefined, searchTerm || undefined);
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase">
              User & Entity Behavior Analytics (UEBA)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Monitored Employee Profiles & Baselines
          </h1>
          <p className="text-xs text-slate-400">
            Per-entity historical behavioral baselines, live risk scoring, device assignments, and access control status.
          </p>
        </div>

        <button
          onClick={fetchEmployees}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
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
              placeholder="Search by employee name, code, or email..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Account Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RESTRICTED">Restricted</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => navigate(`/employees/${emp.id}`)}
            className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 rounded-3xl p-5 shadow-xl hover:shadow-2xl cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{emp.employee_code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{emp.department_name}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mt-1">
                  {emp.name}
                </h3>
                <div className="text-xs text-slate-400">{emp.role_title}</div>
              </div>

              <RiskGauge score={emp.risk_score} size="sm" showLabel={false} />
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Account Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  emp.account_status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : emp.account_status === 'RESTRICTED'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {emp.account_status}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Assigned Device:</span>
                <span className="font-mono text-slate-300">{emp.device_id || 'WS-PRIMARY'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Working Hours:</span>
                <span className="font-mono text-slate-300">
                  {String(emp.work_start_hour).padStart(2, '0')}:00 - {String(emp.work_end_hour).padStart(2, '0')}:00
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
