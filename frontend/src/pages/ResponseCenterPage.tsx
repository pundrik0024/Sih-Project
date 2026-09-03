import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { api } from '../services/api';
import { Lock, Unlock, ShieldAlert, RefreshCw, AlertTriangle, UserCheck, ShieldCheck } from 'lucide-react';
import { IAMResponseModal } from '../components/IAMResponseModal';

export const ResponseCenterPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const fetchRestricted = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestricted();
  }, []);

  const restrictedEmployees = employees.filter(e => e.account_status !== 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          <span className="text-[11px] font-mono font-bold text-purple-300 uppercase">
            Isolated IAM Response Control Plane
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">
          Quarantined & Restricted Accounts Management
        </h1>
        <p className="text-xs text-slate-400 max-w-3xl">
          Authorized response actions operate outside the read-only monitoring enclave. Access restrictions, revocations, and restorations are executed via IAM simulation and logged to the immutable audit trail.
        </p>
      </div>

      {/* Restricted Accounts Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Currently Quarantined Entities ({restrictedEmployees.length})
          </h3>
          <button
            onClick={fetchRestricted}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {restrictedEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Entity Code</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Live Status</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Assigned Device</th>
                  <th className="py-3 px-4 text-right">IAM Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {restrictedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">{emp.employee_code}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">{emp.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-bold">
                        {emp.department_name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        emp.account_status === 'RESTRICTED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {emp.account_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-red-400">
                      {emp.risk_score.toFixed(1)} / 100
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{emp.device_id || 'WS-PRIMARY'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => { setSelectedEmp(emp); setModalOpen(true); }}
                        className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold transition-all"
                      >
                        Modify Access Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-200">No Entities Currently Quarantined</div>
            <p className="text-xs text-slate-500">All workforce accounts operate in ACTIVE state.</p>
          </div>
        )}
      </div>

      {selectedEmp && (
        <IAMResponseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          employeeId={selectedEmp.id}
          employeeName={selectedEmp.name}
          currentStatus={selectedEmp.account_status}
          riskScore={selectedEmp.risk_score}
          onActionSuccess={fetchRestricted}
        />
      )}
    </div>
  );
};
