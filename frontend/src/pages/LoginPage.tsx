import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = [
    { role: 'Security Admin', email: 'admin@demo.local', pass: 'adminPassword123!', desc: 'Full organization-wide access, all departments, threat analytics & IAM response', color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/40 text-cyan-300' },
    { role: 'Finance Manager', email: 'finance.manager@demo.local', pass: 'managerPassword123!', desc: 'Strictly restricted to Finance department alerts & employee response', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300' },
    { role: 'HR Manager', email: 'hr.manager@demo.local', pass: 'managerPassword123!', desc: 'Isolated HR department scope (cannot view Finance records)', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300' },
    { role: 'IT Manager', email: 'it.manager@demo.local', pass: 'managerPassword123!', desc: 'IT infrastructure scope & server alert investigation', color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-300' },
    { role: 'Security Analyst', email: 'analyst@demo.local', pass: 'analystPassword123!', desc: 'SOC investigation, threat intelligence review, and escalation', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300' },
    { role: 'Employee (Amit Sharma)', email: 'employee@demo.local', pass: 'employeePassword123!', desc: 'Personal employee profile and security status notifications', color: 'from-slate-500/20 to-zinc-500/20 border-slate-500/40 text-slate-300' },
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
    <div className="min-h-screen bg-[#060911] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-2xl shadow-cyan-500/30">
          <div className="w-full h-full bg-[#090d18] rounded-[14px] flex items-center justify-center">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
          AEGISGUARD SOC
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          AI-Based Detection of Cyber Threats in Unidirectional IP Traffic with Risk-Based Insider Threat Detection and Authorized Response
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        {/* Quick Demo Login Grid (Left 7 Cols) */}
        <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Instant Demo Logins (Role-Based Access)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select any role below to immediately test RBAC enforcement, department isolation, and response permissions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickDemoLogin(acc.email, acc.pass)}
                  disabled={loading}
                  className={`p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] bg-gradient-to-br ${acc.color} hover:shadow-lg disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{acc.role}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">{acc.email}</div>
                  <div className="text-[10px] text-slate-400/90 mt-1.5 leading-tight">{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>UNIDIRECTIONAL MIRRORED MONITORING</span>
            <span>NTRO/SIH DEMO SPEC</span>
          </div>
        </div>

        {/* Manual Credentials Form (Right 5 Cols) */}
        <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            Manual Credentials Login
          </h3>

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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to SOC Portal'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400">
            <strong>Default Demo Passwords:</strong>
            <ul className="list-disc list-inside mt-1 font-mono text-[10px] text-slate-500 space-y-0.5">
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
