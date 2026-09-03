import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = [
    {
      role: 'Security Admin',
      email: 'admin@demo.local',
      pass: 'adminPassword123!',
      badge: 'Full Org SOC',
      desc: 'Organization-wide access, all departments, threat analytics & IAM response',
      accent: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10'
    },
    {
      role: 'Finance Manager',
      email: 'finance.manager@demo.local',
      pass: 'managerPassword123!',
      badge: 'Finance Scope Only',
      desc: 'Strictly restricted to Finance department alerts & employee response',
      accent: 'border-amber-500/40 text-amber-300 bg-amber-500/5 hover:bg-amber-500/10'
    },
    {
      role: 'HR Manager',
      email: 'hr.manager@demo.local',
      pass: 'managerPassword123!',
      badge: 'HR Scope Only',
      desc: 'Isolated HR department scope (cannot view Finance records)',
      accent: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10'
    },
    {
      role: 'IT Manager',
      email: 'it.manager@demo.local',
      pass: 'managerPassword123!',
      badge: 'IT Scope Only',
      desc: 'IT infrastructure scope & server alert investigation',
      accent: 'border-purple-500/40 text-purple-300 bg-purple-500/5 hover:bg-purple-500/10'
    },
    {
      role: 'Security Analyst',
      email: 'analyst@demo.local',
      pass: 'analystPassword123!',
      badge: 'SOC Investigation',
      desc: 'Incident investigation, threat intelligence review, and escalation',
      accent: 'border-blue-500/40 text-blue-300 bg-blue-500/5 hover:bg-blue-500/10'
    },
    {
      role: 'Employee (Amit Sharma)',
      email: 'employee@demo.local',
      pass: 'employeePassword123!',
      badge: 'Personal View',
      desc: 'Personal employee profile and security status notifications',
      accent: 'border-slate-500/40 text-slate-300 bg-slate-500/5 hover:bg-slate-500/10'
    },
  ];

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed demo login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c16] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-xl shadow-cyan-950">
          <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center">
            <Shield className="w-7 h-7 text-cyan-400" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-wider text-slate-100 font-sans">
              UniShield
            </h1>
            <span className="text-xs font-bold text-cyan-400 font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
              SOC
            </span>
          </div>
          <div className="text-xs font-bold text-cyan-400 tracking-widest font-mono uppercase mt-1">
            Security Operations Center
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          AI-Driven Insider Threat Detection in Unidirectional IP Traffic with Risk-Based Scoring & Authorized IAM Response
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Instant Demo Role Logins (7 Cols) */}
        <div className="md:col-span-7 bg-[#121a2d] border border-[#1e2942] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Instant Demo Logins (Role-Based Access)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select any role to immediately test RBAC enforcement, department isolation, and response permissions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickDemoLogin(acc.email, acc.pass)}
                  disabled={loading}
                  className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] ${acc.accent} disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{acc.role}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">{acc.email}</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#1e2942] text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>UNIDIRECTIONAL OPTICAL TAP MONITORING</span>
            <span>NTRO / SIH DEMO SPEC</span>
          </div>
        </div>

        {/* Manual Credentials Form (5 Cols) */}
        <div className="md:col-span-5 bg-[#121a2d] border border-[#1e2942] rounded-2xl p-6 shadow-xl flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Manual Credentials Login
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@demo.local"
                  required
                  className="w-full bg-[#0d1322] border border-[#1e2942] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#0d1322] border border-[#1e2942] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl shadow-md shadow-cyan-950 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to SOC Portal'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-5 p-3 bg-[#0d1322] border border-[#1e2942] rounded-xl text-[11px] text-slate-400">
            <strong className="text-slate-300">Default Demo Credentials:</strong>
            <ul className="list-disc list-inside mt-1 font-mono text-[10px] text-slate-400 space-y-0.5">
              <li>Admin: adminPassword123!</li>
              <li>Managers: managerPassword123!</li>
              <li>Analyst: analystPassword123!</li>
              <li>Employee: employeePassword123!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
