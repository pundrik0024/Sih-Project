import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { api } from '../services/api';
import { FileText, Shield, Search, RefreshCw, Lock, CheckCircle2 } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchLogs = async () => {
    try {
      const data = await api.getAuditLogs(searchTerm || undefined);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase">
              Compliance & Accountability
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Immutable Security Audit Trail
          </h1>
          <p className="text-xs text-slate-400">
            Tamper-evident audit records documenting all IAM access modifications, investigations, authorizations, and incident resolutions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Trail
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor name, target employee, action, or justification reason..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Authorized Actor</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Executed Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Status Shift</th>
                <th className="py-3.5 px-4">Operational Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/60 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">
                    {log.actor_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-mono font-bold">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-purple-300 font-bold text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-sans font-bold text-slate-200">{log.target_employee_name || 'System'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{log.target_employee_code} ({log.department_name})</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {log.previous_status && log.new_status ? (
                      <span>
                        <span className="text-slate-500">{log.previous_status}</span> → <strong className="text-cyan-300">{log.new_status}</strong>
                      </span>
                    ) : (
                      <span className="text-slate-600">--</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-xs max-w-xs leading-relaxed">
                    {log.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
