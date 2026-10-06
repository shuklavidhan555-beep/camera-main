import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { 
  HOURLY_TRAFFIC_DATA, 
  ZONE_SPEED_DATA, 
  VEHICLE_DISTRIBUTION, 
  WEEKLY_CONGESTION_TREND 
} from '../../data/mockData';
import { 
  Gauge, 
  TrendingUp, 
  Car, 
  Flame, 
  Activity, 
  Clock, 
  MapPin, 
  Camera, 
  ArrowUpRight,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { cn, formatNumber } from '../../lib/utils';

export const TrafficAnalyticsPage: React.FC = () => {
  const { hotspots, cameras, setSelectedCamera, todayVehiclesCount, showToast } = useCommandCenter();
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('All');

  const filteredHotspots = hotspots.filter(
    (h) => selectedZoneFilter === 'All' || h.zone === selectedZoneFilter
  );

  const handleExportData = () => {
    showToast('Export Generated', 'Traffic telemetry CSV dataset downloaded to local cache.', 'success');
  };

  const handleInspectCamera = (cameraId: string) => {
    const cam = cameras.find((c) => c.id === cameraId);
    if (cam) {
      setSelectedCamera(cam);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner / Actions */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Traffic Management & Mobility Analytics
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              OPTIMIZED
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time urban flow metrics, arterial corridor speeds, and bottleneck forecasting
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Export Telemetry CSV
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Average Speed */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Average Network Speed
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-white">
              42.8 <span className="text-sm font-normal text-slate-400">km/h</span>
            </div>
          </div>
          <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3.4 km/h vs. baseline rush</span>
          </div>
        </div>

        {/* Card 2: Traffic Flow */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Hourly Flow Rate
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-cyan-400">
              2,180 <span className="text-sm font-normal text-slate-400">veh/hr/lane</span>
            </div>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400">
            Level of Service: <span className="text-emerald-300 font-bold">Grade B (Stable)</span>
          </div>
        </div>

        {/* Card 3: Total Vehicles */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Total Vehicles Tracked
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-white">
              {formatNumber(todayVehiclesCount)}
            </div>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400">
            Predicted daily aggregate: <span className="text-blue-300 font-bold">44,500</span>
          </div>
        </div>

        {/* Card 4: Congestion Index */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              City Congestion Index
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-amber-400">
              74 <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="mt-2 text-xs font-mono text-amber-300 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Heavy in Sector 1A Downtown</span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts Grid (Hourly Volume & Weekly Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Hourly Traffic Volume & Avg Speed */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-4 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Hourly Traffic Volume & Speed Profile
              </h3>
              <p className="text-[11px] text-slate-400">Correlation between volume surge and arterial slowdown</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Volume
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Speed (km/h)
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_TRAFFIC_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="volume" name="Vehicles" stroke="#06b6d4" strokeWidth={2} fill="url(#volGrad)" />
                <Line yAxisId="right" type="monotone" dataKey="averageSpeed" name="Avg Speed (km/h)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weekly Congestion Trend & Incident Count */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-4 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Weekly Congestion Index & Incident Rate
              </h3>
              <p className="text-[11px] text-slate-400">Peak vs average congestion over 7-day rolling window</p>
            </div>
            <span className="text-[10px] font-mono text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
              FRI HIGHEST (94%)
            </span>
          </div>

          <div className="h-[260px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_CONGESTION_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="peakCongestion" name="Peak Congestion %" stroke="#ef4444" strokeWidth={2} fill="url(#peakGrad)" />
                <Area type="monotone" dataKey="avgCongestion" name="Avg Congestion %" stroke="#3b82f6" strokeWidth={2} fill="url(#avgGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Average Speed by Zone & Vehicle Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Speed by Zone Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0d1424] p-4 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Average Speed by Urban Zone (km/h)
              </h3>
              <p className="text-[11px] text-slate-400">Highway corridors vs central downtown gridlock</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              6 ZONES
            </span>
          </div>

          <div className="h-[220px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ZONE_SPEED_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="zone" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="avgSpeed" name="Avg Speed (km/h)" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                  {ZONE_SPEED_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.avgSpeed < 25 ? '#ef4444' : entry.avgSpeed < 45 ? '#f59e0b' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Classification Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-4 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Vehicle Categories
              </h3>
              <p className="text-[11px] text-slate-400">Class composition</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">100% TOTAL</span>
          </div>

          <div className="h-[220px] w-full flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Pie
                  data={VEHICLE_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {VEHICLE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
              {VEHICLE_DISTRIBUTION.map((v) => (
                <div key={v.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
                  <span className="text-slate-300 truncate">{v.name.split('/')[0]}</span>
                  <span className="text-white font-bold ml-auto">{v.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Table of Traffic Hotspots */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1424] overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Active Traffic Congestion Hotspots</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                {filteredHotspots.length} BOTTLENECKS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Identified through optical density tracking & queue delay telemetry</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-mono">Zone:</span>
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Zones</option>
              <option value="Downtown Core">Downtown Core</option>
              <option value="North Sector">North Sector</option>
              <option value="Highway A1">Highway A1</option>
              <option value="Waterfront Bay">Waterfront Bay</option>
              <option value="Harbour District">Harbour District</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Hotspot ID</th>
                <th className="p-3">Location & Zone</th>
                <th className="p-3">Congestion Status</th>
                <th className="p-3">Density Score</th>
                <th className="p-3">Average Speed</th>
                <th className="p-3">Camera ID</th>
                <th className="p-3">Last Updated</th>
                <th className="p-3 text-right">Live Feed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredHotspots.map((hotspot) => {
                const isCritical = hotspot.congestionStatus === 'Critical';
                const isHigh = hotspot.congestionStatus === 'High';

                return (
                  <tr key={hotspot.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-bold text-amber-400">{hotspot.id}</td>
                    <td className="p-3">
                      <div className="text-white font-sans font-medium">{hotspot.location}</div>
                      <div className="text-slate-400 text-[11px]">{hotspot.zone}</div>
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                        isCritical ? "bg-red-950 text-red-300 border border-red-800 animate-pulse" :
                        isHigh ? "bg-amber-950 text-amber-300 border border-amber-800" :
                        "bg-blue-950 text-blue-300 border border-blue-800"
                      )}>
                        {hotspot.congestionStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              hotspot.congestionScore > 80 ? "bg-red-500" : hotspot.congestionScore > 60 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${hotspot.congestionScore}%` }}
                          />
                        </div>
                        <span className="text-white font-bold">{hotspot.congestionScore}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-cyan-300 font-bold">{hotspot.averageSpeed} km/h</td>
                    <td className="p-3 text-slate-300">{hotspot.cameraId}</td>
                    <td className="p-3 text-slate-400">{hotspot.lastUpdated}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleInspectCamera(hotspot.cameraId)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 text-[11px] transition-colors"
                      >
                        Inspect Camera
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
