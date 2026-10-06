import React, { useState, useEffect, useRef } from 'react';
import { CameraFeed, DetectedObject } from '../../types';
import { 
  Maximize2, 
  Eye, 
  Scan, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Camera, 
  Layers,
  ZoomIn,
  Moon,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCommandCenter } from '../../context/CommandCenterContext';

interface CCTVFeedPlayerProps {
  camera: CameraFeed;
  isDetailed?: boolean;
  showAiOverlayDefault?: boolean;
  onSelect?: () => void;
  className?: string;
}

export const CCTVFeedPlayer: React.FC<CCTVFeedPlayerProps> = ({
  camera,
  isDetailed = false,
  showAiOverlayDefault = true,
  onSelect,
  className
}) => {
  const { setSelectedCamera, showToast } = useCommandCenter();
  const [showAiOverlay, setShowAiOverlay] = useState(showAiOverlayDefault);
  const [isNightVision, setIsNightVision] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTimecode, setCurrentTimecode] = useState('');
  const [objects, setObjects] = useState<DetectedObject[]>(camera.objects);
  const animFrameRef = useRef<number | null>(null);

  // Dynamic timecode updating millisecond precision
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10);
      const timePart = now.toTimeString().slice(0, 8);
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      setCurrentTimecode(`${datePart} ${timePart}.${ms}`);
    };
    const timer = setInterval(updateTime, 40);
    return () => clearInterval(timer);
  }, []);

  // Subtle vehicle / pedestrian motion simulation
  useEffect(() => {
    if (camera.status === 'offline') return;

    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      setObjects((prev) =>
        prev.map((obj, i) => {
          if (obj.speed === 0) return obj; // Stationary/crashed
          const deltaX = Math.sin((tick + i * 2) * 0.1) * 0.4;
          const deltaY = Math.cos((tick + i * 1.5) * 0.08) * 0.3;
          return {
            ...obj,
            box: {
              ...obj.box,
              x: Math.max(5, Math.min(85, obj.box.x + deltaX)),
              y: Math.max(15, Math.min(75, obj.box.y + deltaY)),
            }
          };
        })
      );
    }, 150);

    return () => clearInterval(interval);
  }, [camera.status]);

  const handleCaptureSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast('Snapshot Captured', `Frame from ${camera.id} saved to incident evidence vault.`, 'info');
  };

  const isOffline = camera.status === 'offline';
  const isWarning = camera.status === 'warning';

  return (
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden border transition-all duration-200 select-none group bg-slate-950",
        isOffline ? "border-slate-800" : isWarning ? "border-amber-500/50" : "border-slate-800/80 hover:border-cyan-500/60",
        className
      )}
      onClick={onSelect || (() => setSelectedCamera(camera))}
    >
      {/* CCTV Screen Viewport */}
      <div 
        className={cn(
          "relative w-full aspect-video overflow-hidden transition-all duration-300",
          isNightVision && "filter contrast-150 brightness-110 hue-rotate-90 saturate-200"
        )}
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Synthetic Realistic Urban Surveillance Scene */}
        {isOffline ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-500 gap-2">
            <WifiOff className="w-10 h-10 text-slate-600 animate-pulse" />
            <span className="font-mono text-xs tracking-widest uppercase">SIGNAL LOST // NO CARRIER</span>
            <span className="font-mono text-[10px] text-slate-600">IP: {camera.ip} (Timeout 4000ms)</span>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-[#0d131f]">
            {/* Simulated Road / Urban Scene Canvas Vector */}
            <svg className="w-full h-full object-cover" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`road-grad-${camera.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#131b2c" />
                  <stop offset="100%" stopColor="#0a0f1a" />
                </linearGradient>
                <pattern id={`asphalt-${camera.id}`} width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill="#111726" />
                  <circle cx="2" cy="2" r="0.5" fill="#1b253b" />
                  <circle cx="6" cy="6" r="0.5" fill="#172033" />
                </pattern>
              </defs>

              {/* Road Geometry based on camera theme */}
              <rect width="100" height="100" fill={`url(#asphalt-${camera.id})`} />
              
              {camera.videoTheme === 'highway' ? (
                <>
                  <polygon points="10,0 30,0 0,100 0,100" fill="#0f172a" />
                  <polygon points="70,0 90,0 100,100 100,100" fill="#0f172a" />
                  {/* Lane dividers */}
                  <line x1="38" y1="0" x2="25" y2="100" stroke="#f1f5f9" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.4" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.6" />
                  <line x1="62" y1="0" x2="75" y2="100" stroke="#f1f5f9" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.4" />
                </>
              ) : camera.videoTheme === 'intersection' ? (
                <>
                  {/* Crossroad layout */}
                  <rect x="25" y="0" width="50" height="100" fill="#141c2e" />
                  <rect x="0" y="25" width="100" height="50" fill="#141c2e" />
                  <rect x="25" y="25" width="50" height="50" fill="#18233a" />
                  {/* Crosswalk striping */}
                  <line x1="26" y1="23" x2="74" y2="23" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.5" />
                  <line x1="26" y1="77" x2="74" y2="77" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.5" />
                  <line x1="23" y1="26" x2="23" y2="74" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.5" />
                  <line x1="77" y1="26" x2="77" y2="74" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.5" />
                </>
              ) : camera.videoTheme === 'bridge' ? (
                <>
                  {/* Bridge structure */}
                  <rect x="15" y="0" width="70" height="100" fill="#151e33" />
                  <rect x="0" y="0" width="15" height="100" fill="#0b1b2d" opacity="0.8" />
                  <rect x="85" y="0" width="15" height="100" fill="#0b1b2d" opacity="0.8" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="3 3" strokeOpacity="0.5" />
                  {/* Bridge suspension cables */}
                  <line x1="15" y1="0" x2="35" y2="100" stroke="#475569" strokeWidth="0.6" strokeOpacity="0.5" />
                  <line x1="85" y1="0" x2="65" y2="100" stroke="#475569" strokeWidth="0.6" strokeOpacity="0.5" />
                </>
              ) : (
                <>
                  {/* Urban crosswalk / corridor */}
                  <rect x="15" y="10" width="70" height="80" fill="#121a2c" />
                  <line x1="15" y1="50" x2="85" y2="50" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 2" strokeOpacity="0.5" />
                  <line x1="40" y1="10" x2="40" y2="90" stroke="#334155" strokeWidth="0.8" strokeDasharray="2 2" />
                  <line x1="60" y1="10" x2="60" y2="90" stroke="#334155" strokeWidth="0.8" strokeDasharray="2 2" />
                </>
              )}

              {/* Watermark Grid Coordinates */}
              <text x="3" y="97" fill="#475569" fontSize="3" fontFamily="monospace">GRID: {camera.coordinates.x}.00, {camera.coordinates.y}.00</text>
            </svg>

            {/* AI Bounding Boxes Overlay */}
            {showAiOverlay && (
              <div className="absolute inset-0 pointer-events-none">
                {objects.map((obj) => {
                  const isCar = obj.type === 'car';
                  const isBus = obj.type === 'bus';
                  const isTruck = obj.type === 'truck';
                  const isPed = obj.type === 'pedestrian';

                  const boxBorderColor = obj.isViolation 
                    ? 'border-red-500 bg-red-500/10 text-red-400' 
                    : isPed 
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300' 
                    : isBus || isTruck
                    ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                    : 'border-cyan-400 bg-cyan-400/10 text-cyan-300';

                  const tagBg = obj.isViolation ? 'bg-red-500 text-white' : 'bg-slate-900/90 text-cyan-300 border border-cyan-500/40';

                  return (
                    <div
                      key={obj.id}
                      className={cn(
                        "absolute border transition-all duration-150 flex flex-col justify-between p-0.5",
                        boxBorderColor
                      )}
                      style={{
                        left: `${obj.box.x}%`,
                        top: `${obj.box.y}%`,
                        width: `${obj.box.w}%`,
                        height: `${obj.box.h}%`,
                      }}
                    >
                      {/* Top Label Tag */}
                      <div className="flex items-center gap-1 -translate-y-4">
                        <span className={cn(
                          "px-1 py-0.5 text-[9px] font-mono font-bold uppercase rounded leading-none whitespace-nowrap shadow-sm",
                          tagBg
                        )}>
                          {obj.type} {obj.confidence.toFixed(0)}%
                        </span>
                        {obj.speed !== undefined && obj.speed > 0 && (
                          <span className="bg-slate-900/80 text-[8px] font-mono px-1 py-0.2 rounded text-slate-300 border border-slate-700">
                            {obj.speed} km/h
                          </span>
                        )}
                      </div>

                      {/* Corner Target Markers */}
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-current" />
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-current" />
                      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-current" />
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-current" />

                      {/* License plate if detected */}
                      {obj.licensePlate && (
                        <div className="text-[7px] font-mono bg-black/80 text-amber-300 px-0.5 py-0.2 self-center rounded tracking-tighter">
                          [{obj.licensePlate}]
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Scanline CRT Texture */}
        <div className="absolute inset-0 cctv-scanline pointer-events-none opacity-40" />

        {/* Vignette border */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.85)]" />

        {/* HUD Top Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-white/90 pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2">
            {!isOffline ? (
              <span className="flex items-center gap-1 text-red-500 font-bold bg-black/60 px-1.5 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-blink inline-block" />
                REC
              </span>
            ) : (
              <span className="text-red-400 font-bold bg-black/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> NO SYNC
              </span>
            )}
            <span className="bg-black/60 px-1.5 py-0.5 rounded text-cyan-400 font-bold tracking-wider">
              {camera.id}
            </span>
            <span className="bg-black/50 px-1.5 py-0.5 rounded text-slate-300 hidden sm:inline">
              {camera.resolution}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-black/60 px-1.5 py-0.5 rounded text-emerald-400">
              {camera.fps} FPS
            </span>
            <span className="bg-black/60 px-1.5 py-0.5 rounded text-slate-200 hidden md:inline">
              {currentTimecode}
            </span>
          </div>
        </div>

        {/* HUD Bottom Status Bar */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-semibold text-white tracking-wide bg-black/60 px-1.5 py-0.5 rounded">
              {camera.name}
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
              <span className="bg-black/50 px-1 py-0.5 rounded flex items-center gap-1 text-cyan-300">
                🚘 {camera.vehicleCount} Veh
              </span>
              <span className="bg-black/50 px-1 py-0.5 rounded flex items-center gap-1 text-amber-300">
                🚶 {camera.pedestrianCount} Ped
              </span>
              {camera.incidentType !== 'Normal' && (
                <span className="bg-red-950/80 text-red-400 border border-red-500/50 px-1 py-0.5 rounded font-bold">
                  ⚠️ {camera.incidentType}
                </span>
              )}
            </div>
          </div>

          {/* Quick HUD controls overlay */}
          <div className="flex items-center gap-1 pointer-events-auto">
            <button
              type="button"
              title="Toggle AI Overlays"
              onClick={(e) => {
                e.stopPropagation();
                setShowAiOverlay(!showAiOverlay);
              }}
              className={cn(
                "p-1.5 rounded bg-black/70 backdrop-blur text-xs transition-colors hover:text-white",
                showAiOverlay ? "text-cyan-400 border border-cyan-500/40" : "text-slate-400"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Toggle Night Vision"
              onClick={(e) => {
                e.stopPropagation();
                setIsNightVision(!isNightVision);
              }}
              className={cn(
                "p-1.5 rounded bg-black/70 backdrop-blur text-xs transition-colors hover:text-white",
                isNightVision ? "text-emerald-400 border border-emerald-500/40" : "text-slate-400"
              )}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Save Snapshot"
              onClick={handleCaptureSnapshot}
              className="p-1.5 rounded bg-black/70 backdrop-blur text-slate-300 hover:text-cyan-300 text-xs transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Inspect Live Feed"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCamera(camera);
              }}
              className="p-1.5 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Footer (Shown in feed grids) */}
      {!isDetailed && (
        <div className="p-2.5 bg-slate-900/90 flex items-center justify-between border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              isOffline ? "bg-slate-500" : isWarning ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
            )} />
            <span className="font-mono text-slate-400 text-[11px] truncate max-w-[140px]">
              {camera.location}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {camera.activeAiModels.slice(0, 1).map((m, idx) => (
              <span key={idx} className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
                {m}
              </span>
            ))}
            <span className="text-slate-400 hover:text-cyan-400 cursor-pointer">
              <Eye className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
