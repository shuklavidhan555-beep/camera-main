import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  FileSpreadsheet, 
  Share2, 
  Check, 
  Printer,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { cn } from '../../lib/utils';

export const ReportsPage: React.FC = () => {
  const { showToast } = useCommandCenter();
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'month'>('7days');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const reportPreviewData = [
    { day: 'Mon', incidents: 14, trafficFlow: 94.2, systemUptime: 99.98 },
    { day: 'Tue', incidents: 18, trafficFlow: 91.5, systemUptime: 99.94 },
    { day: 'Wed', incidents: 21, trafficFlow: 89.1, systemUptime: 99.95 },
    { day: 'Thu', incidents: 16, trafficFlow: 93.4, systemUptime: 99.99 },
    { day: 'Fri', incidents: 28, trafficFlow: 86.8, systemUptime: 99.90 },
    { day: 'Sat', incidents: 9, trafficFlow: 97.2, systemUptime: 100 },
    { day: 'Sun', incidents: 6, trafficFlow: 98.4, systemUptime: 100 },
  ];

  const handleExport = (format: string) => {
    setIsExporting(format);
    setTimeout(() => {
      setIsExporting(null);
      showToast(
        'Audit Report Exported',
        `Smart City Surveillance & Traffic Audit Report (${format}) downloaded successfully.`,
        'success'
      );
    }, 1000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner & Date Selector */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Surveillance & Operational Compliance Reports
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              AUDIT READY
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Automated intelligence reports for municipal safety, traffic efficiency, and AI accuracy
          </p>
        </div>

        {/* Date Range Selector & Exports */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setDateRange('today')}
              className={cn(
                "px-2.5 py-1 rounded transition-colors",
                dateRange === 'today' ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"
              )}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('7days')}
              className={cn(
                "px-2.5 py-1 rounded transition-colors",
                dateRange === '7days' ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"
              )}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30days')}
              className={cn(
                "px-2.5 py-1 rounded transition-colors",
                dateRange === '30days' ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"
              )}
            >
              Last 30 Days
            </button>
          </div>

          <button
            onClick={() => handleExport('PDF')}
            disabled={isExporting !== null}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            {isExporting === 'PDF' ? 'Compiling PDF...' : 'Export PDF'}
          </button>

          <button
            onClick={() => handleExport('CSV')}
            disabled={isExporting !== null}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {isExporting === 'CSV' ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Daily Incidents */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Safety Incidents Logged
            </span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-white">
              112 <span className="text-sm font-normal text-slate-400">this week</span>
            </div>
          </div>
          <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-18.4% incident rate vs. previous week</span>
          </div>
        </div>

        {/* Card 2: Traffic Flow Efficiency */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Corridor Flow Efficiency
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-cyan-400">
              92.3% <span className="text-sm font-normal text-slate-400">index</span>
            </div>
          </div>
          <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% smoother traffic progression</span>
          </div>
        </div>

        {/* Card 3: System Performance & AI Inference */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              System Uptime & Latency
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-emerald-400">
              99.94% <span className="text-sm font-normal text-slate-400">/ 38ms</span>
            </div>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-300">
            Vision pipeline zero packet drop guarantee
          </div>
        </div>
      </div>

      {/* Report Preview Chart Section */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] shadow-lg flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Report Data Preview: Weekly Operational Metrics
            </h3>
            <p className="text-[11px] text-slate-400">
              Correlated safety incidents vs city-wide traffic throughput efficiency
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-red-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Incidents Count
            </span>
            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Flow Efficiency %
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportPreviewData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[80, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Bar yAxisId="left" dataKey="incidents" name="Incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="trafficFlow" name="Flow Efficiency %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generated Report Summary Sheet Preview */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-mono space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-white font-bold flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-400" /> MUNICIPAL EXECUTIVE SUMMARY // AUDIT DISCLOSURE
          </span>
          <span className="text-slate-400">GENERATED BY AETHER-CITY VISION AI ENGINE</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">
          During the current reporting cycle, average urban vehicular flow maintained a 92.3% throughput index with 
          112 flagged safety infractions. Automated license plate optical character recognition (OCR) achieved 
          98.9% readability across all 4K high-speed corridors. Emergency dispatch latency averaged 4.2 minutes 
          from algorithmic anomaly confirmation to first responder deployment.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] border-t border-slate-800">
          <div><span className="text-slate-500">Signatures:</span> <span className="text-white">Chief Traffic Operator</span></div>
          <div><span className="text-slate-500">Compliance:</span> <span className="text-emerald-400">ISO 37120 Smart City</span></div>
          <div><span className="text-slate-500">Cryptographic Hash:</span> <span className="text-cyan-400">sha256-a94f...21</span></div>
          <div><span className="text-slate-500">Status:</span> <span className="text-emerald-400">Verified & Sealed</span></div>
        </div>
      </div>
    </div>
  );
};
