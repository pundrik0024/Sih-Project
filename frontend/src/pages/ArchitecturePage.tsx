import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Network, Shield, Eye, Lock, ArrowDown, CheckCircle, Cpu, Radio, ShieldCheck, AlertCircle } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    async function loadInfo() {
      try {
        const data = await api.getArchitectureInfo();
        setInfo(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadInfo();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl space-y-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase">
            NTRO / SIH Cybersecurity Design
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">
          Unidirectional IP Traffic & Read-Only Monitoring Enclave Architecture
        </h1>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          The core security guarantee is the physical and logical segregation between the monitored production network and the threat detection enclave. The monitoring system possesses <strong>zero write or injection capability</strong> into the monitored traffic. Mitigation commands execute through an isolated out-of-band IAM channel.
        </p>
      </div>

      {/* Visual Flow Architecture Walkthrough */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-center">
          End-to-End Architectural Dataflow
        </h3>

        <div className="flex flex-col items-center space-y-4 max-w-3xl mx-auto">
          {/* Layer 1: Monitored Production Network */}
          <div className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Layer 1: Monitored Production Network</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-[10px] rounded">Live IP Traffic</span>
            </div>
            <p className="text-xs text-slate-400">
              Department users, workstations, and enterprise servers transmit business data (HTTP, SSH, DB, ERP).
            </p>
          </div>

          <ArrowDown className="w-6 h-6 text-cyan-400 animate-bounce" />

          {/* Layer 2: Optical Tap / Hardware Diode */}
          <div className="w-full bg-cyan-950/30 border border-cyan-500/50 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Layer 2: Unidirectional Data Diode / Optical Tap</span>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono text-[10px] rounded">Tx Ingress Only (Physical One-Way)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Splits optical fiber or network stream passively. Return Rx channel is physically unpopulated or blocked, mathematically guaranteeing zero feedback or packet tampering into the monitored network.
            </p>
          </div>

          <ArrowDown className="w-6 h-6 text-cyan-400" />

          {/* Layer 3: Read-Only Monitoring Enclave */}
          <div className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Layer 3: Read-Only Security Monitoring Enclave</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] rounded">Read-Only Processing</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-cyan-300 block mb-1">AI Detection Models</strong>
                <p className="text-slate-400 text-[11px]">Isolation Forest anomaly index + Random Forest threat classification</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-cyan-300 block mb-1">UEBA Baseline Comparator</strong>
                <p className="text-slate-400 text-[11px]">Per-employee normal byte volumes, working hours, and common destinations</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-cyan-300 block mb-1">Explainable Risk Engine</strong>
                <p className="text-slate-400 text-[11px]">7-factor weighted scoring (0-100) with human-readable justifications</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-cyan-300 block mb-1">Department Scoped RBAC</strong>
                <p className="text-slate-400 text-[11px]">Strict isolation: Managers only inspect alerts for their workforce</p>
              </div>
            </div>
          </div>

          <ArrowDown className="w-6 h-6 text-purple-400" />

          {/* Layer 4: Authorized IAM Response Layer */}
          <div className="w-full bg-purple-950/30 border border-purple-500/50 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Layer 4: Authorized Response Layer (Out-of-Band IAM Simulation)</span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 font-mono text-[10px] rounded">Human-in-the-Loop</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Authorized Department Managers and SOC Admins review incident justifications and initiate mitigation commands (Restrict Access, Revoke Token, Restore Access) through simulated enterprise IAM APIs. Every action is signed into the immutable audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
