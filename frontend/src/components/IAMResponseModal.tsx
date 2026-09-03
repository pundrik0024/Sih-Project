import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Lock, Unlock, XCircle, FileSearch, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName: string;
  currentStatus: string;
  riskScore: number;
  incidentId?: number;
  onActionSuccess: () => void;
}

export const IAMResponseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  currentStatus,
  riskScore,
  incidentId,
  onActionSuccess,
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('RESTRICT');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const actions = [
    { id: 'RESTRICT', label: 'Restrict Access', icon: Lock, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10', desc: 'Temporarily limit user network sessions and external data transfers.' },
    { id: 'REVOKE', label: 'Revoke Access', icon: XCircle, color: 'text-red-400 border-red-500/40 bg-red-500/10', desc: 'Immediate security quarantine: Terminate active tokens and disable access.' },
    { id: 'RESTORE', label: 'Restore Access', icon: Unlock, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', desc: 'Restore account to ACTIVE status after investigation confirms safety.' },
    { id: 'INVESTIGATE', label: 'Mark Under Investigation', icon: FileSearch, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10', desc: 'Add investigation case notes without immediately modifying account status.' },
    { id: 'ESCALATE', label: 'Escalate to SOC Admin', icon: ArrowUpRight, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10', desc: 'Escalate incident priority to Super Admin & Lead Cybersecurity Incident Command.' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A valid reason is required for compliance and audit logging.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.executeIAMAction(employeeId, selectedAction, reason, incidentId);
      setSuccessMsg(res.message || 'Action executed successfully in simulated IAM layer.');
      setTimeout(() => {
        onActionSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to execute IAM response action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Authorized Response Center</h3>
              <p className="text-xs text-slate-400">Isolated IAM Mitigation Control Plane (Human-in-the-Loop)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm font-mono">✕</button>
        </div>

        {/* Target Context */}
        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Target Employee:</span>{' '}
            <strong className="text-slate-100 font-semibold">{employeeName}</strong>
          </div>
          <div>
            <span className="text-slate-400">Current Status:</span>{' '}
            <span className="px-2 py-0.5 rounded bg-slate-700 text-cyan-300 font-mono font-bold">{currentStatus}</span>
          </div>
          <div>
            <span className="text-slate-400">Live Risk:</span>{' '}
            <strong className="text-red-400 font-mono font-bold">{riskScore}/100</strong>
          </div>
        </div>

        {/* Architectural Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>Architectural Guarantee:</strong> Traffic monitoring is strictly read-only. This action executes via an out-of-band IAM command and will be recorded in the tamper-evident audit log.
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Response Action
            </label>
            <div className="grid grid-cols-1 gap-2">
              {actions.map((act) => {
                const Icon = act.icon;
                const isSelected = selectedAction === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setSelectedAction(act.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${act.color} ring-1 ring-cyan-500/50 shadow-md`
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="text-xs font-bold">{act.label}</div>
                        <div className="text-[11px] text-slate-400 leading-tight">{act.desc}</div>
                      </div>
                    </div>
                    {isSelected && <span className="text-xs font-bold text-cyan-400 font-mono">SELECTED</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Reason / Justification <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide explicit operational rationale for this mitigation (required for Audit Trail)..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Executing IAM Dispatch...' : 'Confirm & Execute Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
