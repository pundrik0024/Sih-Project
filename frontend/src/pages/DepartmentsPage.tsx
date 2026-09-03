import React, { useState, useEffect } from 'react';
import { Department } from '../types';
import { api } from '../services/api';
import { Building2, Users, ShieldAlert, TrendingUp, Mail } from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDepts() {
      try {
        const data = await api.getDepartments();
        setDepartments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDepts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl space-y-1">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase">
            Organizational Structure & RBAC Boundaries
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">
          Department Governance & Managers
        </h1>
        <p className="text-xs text-slate-400">
          Departmental scopes enforce data segregation. Managers possess autonomous investigation and IAM mitigation authority exclusively for their department personnel.
        </p>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((d) => (
          <div
            key={d.id}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 font-mono font-extrabold text-xs">
                    {d.code}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{d.name}</h3>
                    <div className="text-[11px] text-slate-500">{d.description}</div>
                  </div>
                </div>

                <RiskGauge score={d.average_risk_score} size="sm" showLabel={false} />
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Authorized Manager:</span>
                <strong className="text-slate-200">{d.manager_name || 'Assigned Manager'}</strong>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Manager Email:</span>
                <span className="font-mono text-cyan-300">{d.manager_email}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Workforce Size:</span>
                <span className="font-mono text-slate-200">{d.employee_count} Monitored Users</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Active Threat Alerts:</span>
                <span className={`font-mono font-bold ${d.active_threats_count > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {d.active_threats_count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
