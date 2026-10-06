import React, { useState } from 'react';
import { CameraFeed } from '../../types';
import { CCTVFeedPlayer } from '../common/CCTVFeedPlayer';
import { 
  X, 
  Car, 
  Users, 
  Activity, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  RotateCw, 
  Sparkles, 
  Sliders, 
  ZoomIn, 
  Maximize2,
  HardDrive,
  Cpu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCommandCenter } from '../../context/CommandCenterContext';

interface CameraDetailModalProps {
  camera: CameraFeed | null;
  onClose: () => void;
}

export const CameraDetailModal: React.FC<CameraDetailModalProps> = ({ camera, onClose }) => {
  const { rebootCamera, showToast } = useCommandCenter();
  const [activeTab, setActiveTab] = useState<'detections' | 'telemetry' | 'events'>('detections');

  if (!camera) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b101c] border border-cyan-500/40 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cn(
              "w-3 h-3 rounded-full",
              camera.status === 'online' ? "bg-emerald-400" : camera.status === 'warning' ? "bg-amber-400 animate-pulse" : "bg-red-500"
            )} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono tracking-tight">
                  [{camera.id}] {camera.name}
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  {camera.resolution} @ {camera.fps} FPS
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  IP: {camera.ip}
                </span>
              </div>
              <p className="text-xs text-slate-400">{camera.location} • Zone: {camera.zone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => rebootCamera(camera.id)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Soft reboot camera RTSP buffer"
            >
              <RotateCw className="w-3.5 h-3.5" /> Reboot Stream
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 hover:text-red-300 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split 2/3 Feed, 1/3 Analytics Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-y-auto">
          {/* Main Video Section */}
          <div className="lg:col-span-2 p-4 bg-black/40 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <CCTVFeedPlayer camera={camera} isDetailed={true} showAiOverlayDefault={true} />
            </div>

            {/* AI Model Architecture & Telemetry Bar below player */}
            <div className="mt-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px]">INFERENCE LATENCY</span>
                <span className="text-cyan-400 font-bold text-sm">{camera.latencyMs} ms</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px]">VIDEO BITRATE</span>
                <span className="text-emerald-400 font-bold text-sm">4.85 Mbps CBR</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px]">CONGESTION SCORE</span>
                <span className={cn(
                  "font-bold text-sm",
                  camera.congestionScore > 75 ? "text-red-400" : camera.congestionScore > 50 ? "text-amber-400" : "text-emerald-400"
                )}>
                  {camera.congestionScore} / 100
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px]">ENCRYPTION / RTSP</span>
                <span className="text-slate-200 font-bold text-sm">TLS 1.3 / H.265</span>
              </div>
            </div>
          </div>

          {/* Right Detailed Monitoring Panel */}
          <div className="p-4 flex flex-col bg-[#0b101c] gap-4">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-mono">
                  <Car className="w-3.5 h-3.5" /> Vehicles In Frame
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {camera.vehicleCount}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-mono">
                  <Users className="w-3.5 h-3.5" /> Pedestrians
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {camera.pedestrianCount}
                </div>
              </div>
            </div>

            {/* Tabs for Panel */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs font-mono">
              <button
                onClick={() => setActiveTab('detections')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors",
                  activeTab === 'detections' ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Objects ({camera.objects.length})
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors",
                  activeTab === 'events' ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Events ({camera.recentEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('telemetry')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors",
                  activeTab === 'telemetry' ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                )}
              >
                AI Pipeline
              </button>
            </div>

            {/* Tab 1: Detected Objects List */}
            {activeTab === 'detections' && (
              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                <div className="text-[11px] text-slate-400 font-mono mb-1">
                  Active Bounding Boxes (YOLOv11 Detection Head):
                </div>
                {camera.objects.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 font-mono text-xs">
                    No active targets in camera sensor field.
                  </div>
                ) : (
                  camera.objects.map((obj) => (
                    <div
                      key={obj.id}
                      className={cn(
                        "p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between",
                        obj.isViolation 
                          ? "bg-red-950/30 border-red-500/50 text-red-200"
                          : "bg-slate-900/60 border-slate-800 text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          obj.isViolation ? "bg-red-500 animate-ping" : "bg-cyan-400"
                        )} />
                        <div>
                          <span className="font-bold uppercase text-white">{obj.type}</span>
                          {obj.licensePlate && (
                            <span className="ml-2 text-amber-300 bg-black/60 px-1 py-0.2 rounded text-[10px]">
                              {obj.licensePlate}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {obj.speed !== undefined && (
                          <span className="text-slate-400 text-[11px]">{obj.speed} km/h</span>
                        )}
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-bold",
                          obj.confidence > 95 ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-slate-800 text-slate-300"
                        )}>
                          {obj.confidence.toFixed(1)}% conf
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Recent Events Timeline */}
            {activeTab === 'events' && (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                <div className="text-[11px] text-slate-400 font-mono mb-1">
                  Temporal Event Audit Trail:
                </div>
                {camera.recentEvents.map((event, idx) => (
                  <div key={idx} className="relative pl-5 border-l-2 border-slate-800 pb-3 last:pb-0">
                    <span className={cn(
                      "absolute -left-[5px] top-0 w-2 h-2 rounded-full",
                      event.severity === 'Critical' ? "bg-red-500" : event.severity === 'High' ? "bg-amber-400" : "bg-cyan-400"
                    )} />
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                      <span>{event.time}</span>
                      <span className={cn(
                        "px-1 py-0.2 rounded font-bold uppercase",
                        event.severity === 'Critical' ? "text-red-400 bg-red-950" : event.severity === 'High' ? "text-amber-400 bg-amber-950" : "text-cyan-400 bg-cyan-950"
                      )}>
                        {event.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-snug">
                      {event.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: AI Pipeline Architecture */}
            {activeTab === 'telemetry' && (
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 text-xs font-mono">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> Edge Inference Pipeline
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Local TensorRT execution on SmartEdge Node TX-420. Video frames decoded via NVDEC hardware accelerator.
                  </p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <div className="text-slate-300 font-bold mb-1">Active Neural Networks:</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {camera.activeAiModels.map((model) => (
                      <span key={model} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                        {model}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <div className="text-slate-300 font-bold mb-1">Calibration Matrix:</div>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>Focal Length: 12.0 mm f/1.8</div>
                    <div>Sensor: Sony IMX485 Starvis II</div>
                    <div>Field of View: 104° H / 58° V</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
