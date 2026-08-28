import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  Activity,
  Cpu,
  Bell,
  AlertTriangle,
  Users,
  Building2,
  Lock,
  FileText,
  Network,
  Settings,
  LogOut,
  PlayCircle,
  ChevronDown,
  UserCheck,
  Radio
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export const SOCLayout: React.FC<Props> = ({ children }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const demoAccounts = [
    { role: 'SUPER_ADMIN', name: 'Security Admin', email: 'admin@demo.local', pass: 'adminPassword123!', badge: 'Full Org SOC' },
    { role: 'DEPARTMENT_MANAGER', name: 'Finance Manager', email: 'finance.manager@demo.local', pass: 'managerPassword123!', badge: 'Finance Scope Only' },
    { role: 'DEPARTMENT_MANAGER', name: 'HR Manager', email: 'hr.manager@demo.local', pass: 'managerPassword123!', badge: 'HR Scope Only' },
    { role: 'DEPARTMENT_MANAGER', name: 'IT Manager', email: 'it.manager@demo.local', pass: 'managerPassword123!', badge: 'IT Scope Only' },
    { role: 'SECURITY_ANALYST', name: 'Security Analyst', email: 'analyst@demo.local', pass: 'analystPassword123!', badge: 'Investigation / Escalation' },
    { role: 'EMPLOYEE', name: 'Employee (Amit Sharma)', email: 'employee@demo.local', pass: 'employeePassword123!', badge: 'Personal Account View' },
  ];

  const handleRoleSwitch = async (email: string, pass: string) => {
    try {
      await switchDemoRole(email, pass);
      setRoleDropdownOpen(false);
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  // Sidebar navigation items with role gating
  const navItems = [
    { label: 'SOC Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] },
    { label: 'Interactive Demo', path: '/demo', icon: PlayCircle, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST', 'DEPARTMENT_MANAGER'] },
    { label: 'Network Monitor', path: '/network', icon: Activity, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST', 'DEPARTMENT_MANAGER'] },
    { label: 'Threat Detection & AI', path: '/threats', icon: Cpu, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST'] },
    { label: 'Security Alerts', path: '/alerts', icon: Bell, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] },
    { label: 'Incidents Center', path: '/incidents', icon: AlertTriangle, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST', 'DEPARTMENT_MANAGER'] },
    { label: 'Employees & UEBA', path: '/employees', icon: Users, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] },
    { label: 'Departments', path: '/departments', icon: Building2, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST'] },
    { label: 'Response Center', path: '/response', icon: Lock, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST', 'DEPARTMENT_MANAGER'] },
    { label: 'Audit Logs', path: '/audit-logs', icon: FileText, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST', 'DEPARTMENT_MANAGER'] },
    { label: 'NTRO Architecture', path: '/architecture', icon: Network, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] },
    { label: 'Settings & Weights', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col">
      {/* Top SOC Bar */}
      <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="text-base font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                AEGISGUARD SOC
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-tight">AI UNIDIRECTIONAL THREAT DETECTION</div>
            </div>
          </Link>

          {/* Enclave Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-300">ENCLAVE: READ-ONLY MIRRORED TAP</span>
          </div>
        </div>

        {/* User / Demo Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded-xl text-xs font-semibold text-slate-200 transition-all shadow-md"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Role: <strong className="text-cyan-300">{user?.role}</strong></span>
              {user?.department_name && <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">({user.department_name})</span>}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Demo Account (Instant RBAC)
                </div>
                <div className="space-y-1 mt-1">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => handleRoleSwitch(acc.email, acc.pass)}
                      className={`w-full flex flex-col p-2.5 rounded-xl text-left transition-all text-xs ${
                        user?.email === acc.email
                          ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-300'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{acc.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{acc.role}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{acc.badge}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-200">{user?.full_name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-950/60 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              SOC Command Operations
            </div>
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Department Boundary Badge for Managers */}
          {user?.role === 'DEPARTMENT_MANAGER' && (
            <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-300">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                Department Isolation Active
              </div>
              <p className="text-[11px] text-slate-400">
                You are strictly restricted to <strong>{user.department_name}</strong> records.
              </p>
            </div>
          )}

          {/* Architecture Reminder */}
          <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl text-[11px] text-slate-500 font-mono">
            <div>MODE: UNIDIRECTIONAL</div>
            <div>STATUS: ONLINE</div>
            <div>VER: 1.0-NTRO</div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#070a12] via-[#090d18] to-[#0a0f1d]">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
