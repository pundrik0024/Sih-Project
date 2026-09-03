import React, { useState, useEffect } from 'react';
import { NetworkFlow } from '../types';
import { api } from '../services/api';
import { Activity, ShieldAlert, Filter, Search, RefreshCw, Radio, Globe, Layers } from 'lucide-react';

export const NetworkMonitorPage: React.FC = () => {
  const [flows, setFlows] = useState<NetworkFlow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [threatOnly, setThreatOnly] = useState<boolean>(false);
  const [protocolFilter, setProtocolFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFlow, setSelectedFlow] = useState<NetworkFlow | null>(null);

  const fetchFlows = async () => {
    try {
      const data = await api.getNetworkFlows(100, threatOnly, protocolFilter || undefined);
      setFlows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
    const interval = setInterval(fetchFlows, 4000);
    return () => clearInterval(interval);
  }, [threatOnly, protocolFilter]);

  const filteredFlows = flows.filter(f => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      f.src_ip.toLowerCase().includes(s) ||
      f.dst_ip.toLowerCase().includes(s) ||
      (f.employee_name && f.employee_name.toLowerCase().includes(s)) ||
      f.threat_type.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase">
              Passive Read-Only Tap Monitor
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Live IP Flow Telemetry Stream
          </h1>
          <p className="text-xs text-slate-400">
            Real-time inspection of unidirectional IP packet flows, payload distributions, destination reputations, and ML anomaly classifications.
          </p>
        </div>

        <button
          onClick={fetchFlows}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Poll Latest Flows
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by IP, employee name, or threat type..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
          </select>

          <button
            onClick={() => setThreatOnly(!threatOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
              threatOnly
                ? 'bg-red-500/20 border-red-500/50 text-red-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Anomalies Only
          </button>
        </div>
      </div>

      {/* Flows Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Source Entity</th>
                <th className="py-3.5 px-4">Source IP : Port</th>
                <th className="py-3.5 px-4">Destination IP : Port</th>
                <th className="py-3.5 px-4">Protocol</th>
                <th className="py-3.5 px-4">Outbound Bytes</th>
                <th className="py-3.5 px-4">Reputation</th>
                <th className="py-3.5 px-4">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredFlows.map((flow) => {
                const isAnomaly = flow.is_anomaly;
                const sizeSentStr = flow.bytes_sent > 1000000000
                  ? `${(flow.bytes_sent / 1000000000).toFixed(2)} GB`
                  : flow.bytes_sent > 1000000
                  ? `${(flow.bytes_sent / 1000000).toFixed(1)} MB`
                  : `${(flow.bytes_sent / 1000).toFixed(0)} KB`;

                return (
                  <tr
                    key={flow.id}
                    onClick={() => setSelectedFlow(flow)}
                    className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      isAnomaly ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(flow.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-sans font-bold text-slate-200">{flow.employee_name || 'System / Unassigned'}</div>
                      <div className="text-[10px] text-slate-500">{flow.department_name || 'Infrastructure'}</div>
                    </td>
                    <td className="py-3 px-4 text-cyan-300">
                      {flow.src_ip}:{flow.src_port}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {flow.dst_ip}:{flow.dst_port}
                      {flow.is_external && <span className="ml-1 text-[10px] text-slate-500">(EXT)</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                        {flow.protocol}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-bold ${flow.bytes_sent > 50000000 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                      {sizeSentStr}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        flow.destination_reputation < 0.5 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {(flow.destination_reputation * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-sans ${
                        isAnomaly
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {flow.threat_type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Flow Inspector Modal */}
      {selectedFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Flow Metadata Inspector</h3>
              </div>
              <button onClick={() => setSelectedFlow(null)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto text-slate-300">
              <div><strong className="text-cyan-400">Flow ID:</strong> #{selectedFlow.id}</div>
              <div><strong className="text-cyan-400">Source:</strong> {selectedFlow.src_ip}:{selectedFlow.src_port}</div>
              <div><strong className="text-cyan-400">Destination:</strong> {selectedFlow.dst_ip}:{selectedFlow.dst_port}</div>
              <div><strong className="text-cyan-400">Protocol:</strong> {selectedFlow.protocol}</div>
              <div><strong className="text-cyan-400">Bytes Sent:</strong> {selectedFlow.bytes_sent.toLocaleString()} bytes</div>
              <div><strong className="text-cyan-400">Bytes Received:</strong> {selectedFlow.bytes_received.toLocaleString()} bytes</div>
              <div><strong className="text-cyan-400">Connection Duration:</strong> {selectedFlow.connection_duration}s</div>
              <div><strong className="text-cyan-400">Connections/Min:</strong> {selectedFlow.connections_per_min}</div>
              <div><strong className="text-cyan-400">Upload/Download Ratio:</strong> {selectedFlow.upload_download_ratio}</div>
              <div><strong className="text-cyan-400">Reputation Score:</strong> {selectedFlow.destination_reputation}</div>
              <div><strong className="text-cyan-400">AI Threat Classification:</strong> {selectedFlow.threat_type}</div>
              <div><strong className="text-cyan-400">Anomaly Flag:</strong> {selectedFlow.is_anomaly ? 'TRUE' : 'FALSE'}</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFlow(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
