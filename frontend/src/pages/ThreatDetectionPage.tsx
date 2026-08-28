import React, { useState, useEffect } from 'react';
import { MLStatus } from '../types';
import { api } from '../services/api';
import { Cpu, RefreshCw, CheckCircle2, ShieldAlert, BarChart3, Binary, AlertCircle, Play } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ThreatDetectionPage: React.FC = () => {
  const [mlStatus, setMlStatus] = useState<MLStatus | null>(null);
  const [retraining, setRetraining] = useState<boolean>(false);
  const [testPayload, setTestPayload] = useState({
    bytes_sent: 1420000000,
    bytes_received: 24000,
    packet_count: 1000000,
    connection_duration: 420.0,
    connections_per_minute: 24.0,
    destination_reputation: 0.18,
    is_external: true,
    hour_of_day: 2,
    unusual_destination: true,
    baseline_deviation: 0.95
  });
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predicting, setPredicting] = useState<boolean>(false);

  const fetchMLStatus = async () => {
    try {
      const data = await api.getMLStatus();
      setMlStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMLStatus();
  }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const res = await api.retrainML();
      setMlStatus({ ...mlStatus!, metrics: res.metrics });
      alert('AI Models successfully retrained and reloaded into active memory!');
    } catch (e: any) {
      alert(`Retraining error: ${e.message}`);
    } finally {
      setRetraining(false);
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const res = await api.predictFlow(testPayload);
      setPredictionResult(res.prediction);
    } catch (e: any) {
      alert(`Predict error: ${e.message}`);
    } finally {
      setPredicting(false);
    }
  };

  const featureImportanceData = mlStatus?.metrics.feature_importances
    ? Object.entries(mlStatus.metrics.feature_importances).map(([k, v]) => ({
        feature: k.replace(/_/g, ' '),
        importance: Math.round(v * 1000) / 10,
      })).sort((a, b) => b.importance - a.importance)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase">
              Hybrid AI Inference Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Machine Learning Threat Detection & Model Metrics
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl">
            Dual-model security intelligence: Unsupervised <strong>Isolation Forest</strong> for zero-day behavioral anomalies combined with a Supervised <strong>Random Forest Classifier</strong> for specific attack signatures.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
          {retraining ? 'Retraining Models...' : 'Retrain AI Models'}
        </button>
      </div>

      {/* Synthetic Dataset Notice */}
      <div className="p-4 bg-cyan-950/40 border border-cyan-800/40 rounded-2xl flex items-start gap-3 text-xs text-cyan-200">
        <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-cyan-300 mb-0.5">Prototype Architecture Transparency:</strong>
          {mlStatus?.disclaimer || "Prototype model trained using reproducible synthetic/labeled network-flow dataset."} (Dataset size: {mlStatus?.metrics.total_samples || 7500} flow records, 75/25 Train-Test split).
        </div>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 mb-1">Model Accuracy</div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {mlStatus ? `${(mlStatus.metrics.accuracy * 100).toFixed(1)}%` : '--'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Held-Out Test Set</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 mb-1">Precision (Weighted)</div>
          <div className="text-3xl font-black font-mono text-cyan-400">
            {mlStatus ? `${(mlStatus.metrics.precision * 100).toFixed(1)}%` : '--'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">False Positive Minimization</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 mb-1">Recall Rate</div>
          <div className="text-3xl font-black font-mono text-blue-400">
            {mlStatus ? `${(mlStatus.metrics.recall * 100).toFixed(1)}%` : '--'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Attack Detection Coverage</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 mb-1">F1 Harmonic Score</div>
          <div className="text-3xl font-black font-mono text-indigo-400">
            {mlStatus ? `${(mlStatus.metrics.f1_score * 100).toFixed(1)}%` : '--'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Precision-Recall Balance</div>
        </div>
      </div>

      {/* Visuals: Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Importance Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Random Forest Feature Importances (%)
            </h3>
            <p className="text-xs text-slate-400">Relative contribution of extracted cybersecurity features</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#38bdf8" name="Importance (%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Test Set Confusion Matrix
            </h3>
            <p className="text-xs text-slate-400">Predicted vs. Actual classifications</p>
          </div>

          <div className="overflow-x-auto text-[11px] font-mono">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5 text-left text-slate-500">True \ Pred</th>
                  {mlStatus?.metrics.labels.map((l, i) => (
                    <th key={i} className="p-1.5 text-slate-400 truncate max-w-[60px]" title={l}>
                      {l.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mlStatus?.metrics.confusion_matrix.map((row, rIdx) => (
                  <tr key={rIdx} className="border-t border-slate-800/80">
                    <td className="p-1.5 text-left text-slate-400 font-bold truncate max-w-[90px]" title={mlStatus.metrics.labels[rIdx]}>
                      {mlStatus.metrics.labels[rIdx].split(' ')[0]}
                    </td>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-1.5 font-bold ${
                          rIdx === cIdx && cell > 0
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : cell > 0
                            ? 'bg-red-500/20 text-red-400'
                            : 'text-slate-600'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Model Prediction Sandbox */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Live AI Inference Sandbox
          </h3>
          <p className="text-xs text-slate-400">
            Submit custom flow metadata to test real-time hybrid ML inference and anomaly score generation:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Bytes Sent</label>
            <input
              type="number"
              value={testPayload.bytes_sent}
              onChange={(e) => setTestPayload({ ...testPayload, bytes_sent: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-mono text-slate-100"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Bytes Received</label>
            <input
              type="number"
              value={testPayload.bytes_received}
              onChange={(e) => setTestPayload({ ...testPayload, bytes_received: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-mono text-slate-100"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Destination Reputation (0-1)</label>
            <input
              type="number"
              step="0.05"
              value={testPayload.destination_reputation}
              onChange={(e) => setTestPayload({ ...testPayload, destination_reputation: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-mono text-slate-100"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Hour of Day (0-23)</label>
            <input
              type="number"
              value={testPayload.hour_of_day}
              onChange={(e) => setTestPayload({ ...testPayload, hour_of_day: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-mono text-slate-100"
            />
          </div>
        </div>

        <button
          onClick={handlePredict}
          disabled={predicting}
          className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {predicting ? 'Evaluating Flow...' : 'Evaluate ML Prediction'}
        </button>

        {predictionResult && (
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Predicted Threat Class:</span>
              <strong className="text-red-400 text-sm">{predictionResult.predicted_threat}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Isolation Forest Anomaly Score:</span>
              <strong className="text-cyan-300">{(predictionResult.anomaly_score * 100).toFixed(1)} / 100</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Model Confidence:</span>
              <strong className="text-emerald-400">{(predictionResult.threat_confidence * 100).toFixed(1)}%</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
