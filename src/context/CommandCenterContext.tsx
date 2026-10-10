import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  CameraFeed, 
  SafetyAlert, 
  TrafficHotspot, 
  ThemeMode, 
  NavigationTab,
  AlertSeverity,
  HourlyTrafficData,
  VehicleDistribution,
  ZoneSpeedData,
  WeeklyTrendPoint,
  KinematicInteraction
} from '../types';
import { 
  REAL_CAMERAS as INITIAL_CAMERAS, 
  REAL_SAFETY_ALERTS as INITIAL_SAFETY_ALERTS, 
  REAL_CONGESTION_HOTSPOTS as CONGESTION_HOTSPOTS, 
  REAL_HOURLY_TRAFFIC_DATA as HOURLY_TRAFFIC_DATA, 
  REAL_VEHICLE_DISTRIBUTION as VEHICLE_DISTRIBUTION, 
  REAL_ZONE_SPEED_DATA as ZONE_SPEED_DATA, 
  REAL_WEEKLY_CONGESTION_TREND as WEEKLY_CONGESTION_TREND, 
  REAL_TOTAL_VEHICLES_TODAY, 
  DATASET_METADATA 
} from '../data/realDataset';
import { dataService, DashboardKpis, DatasetMetadata } from '../services/dataService';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'critical';
}

interface CommandCenterContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  
  // Data backed by real datasets
  cameras: CameraFeed[];
  safetyAlerts: SafetyAlert[];
  hotspots: TrafficHotspot[];
  hourlyData: HourlyTrafficData[];
  vehicleDistribution: VehicleDistribution[];
  zoneSpeedData: ZoneSpeedData[];
  weeklyTrend: WeeklyTrendPoint[];
  metadata: DatasetMetadata;
  
  // Calculated KPIs
  kpis: DashboardKpis;
  
  // Modals & Selection
  selectedCamera: CameraFeed | null;
  setSelectedCamera: (camera: CameraFeed | null) => void;
  selectedAlertForModal: SafetyAlert | null;
  setSelectedAlertForModal: (alert: SafetyAlert | null) => void;

  // Actions
  acknowledgeAlert: (alertId: string) => void;
  dispatchEmergencyTeam: (alertId: string, unitType: string) => void;
  rebootCamera: (cameraId: string) => void;
  triggerSimulatedAlert: () => void;
  createDynamicSafetyAlert: (
    camera: CameraFeed,
    interaction: KinematicInteraction,
    snapshotImage?: string
  ) => SafetyAlert;
  triggerSimulatedCollisionAlert: (
    collisionType?: 'Vehicle-Vehicle' | 'Vehicle-Pedestrian' | 'Vehicle-Animal'
  ) => SafetyAlert;
  
  // Filters & Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedZoneFilter: string;
  setSelectedZoneFilter: (zone: string) => void;
  
  // UI State
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  emergencyBannerOpen: boolean;
  setEmergencyBannerOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;

  // Real-time vehicle counter (initialized from 23,801 detections)
  todayVehiclesCount: number;

  // Export functions
  generateTelemetryCsv: () => string;
  generateVehicleDetectionsCsv: () => string;
}

const CommandCenterContext = createContext<CommandCenterContextType | undefined>(undefined);

// Web Audio API beep synthesizer for realistic control room sound effects
const playControlRoomBeep = (freq = 880, type: OscillatorType = 'sine', duration = 0.12) => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio context autoplay restriction gracefully
  }
};

export const CommandCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [cameras, setCameras] = useState<CameraFeed[]>(INITIAL_CAMERAS);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>(INITIAL_SAFETY_ALERTS);
  const [hotspots] = useState<TrafficHotspot[]>(CONGESTION_HOTSPOTS);
  const [hourlyData] = useState<HourlyTrafficData[]>(HOURLY_TRAFFIC_DATA);
  const [vehicleDistribution] = useState<VehicleDistribution[]>(VEHICLE_DISTRIBUTION);
  const [zoneSpeedData] = useState<ZoneSpeedData[]>(ZONE_SPEED_DATA);
  const [weeklyTrend] = useState<WeeklyTrendPoint[]>(WEEKLY_CONGESTION_TREND);
  
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<SafetyAlert | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('All');
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emergencyBannerOpen, setEmergencyBannerOpen] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [todayVehiclesCount] = useState(REAL_TOTAL_VEHICLES_TODAY || 23801);

  // Sync theme to document body
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    document.documentElement.classList.remove('dark', 'theme-monochrome', 'theme-light');
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'monochrome') {
      document.documentElement.classList.add('dark', 'theme-monochrome');
    } else {
      document.documentElement.classList.add('theme-light');
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Compute dynamic KPIs based on current real records
  const kpis = useMemo(() => {
    return dataService.calculateKpis(cameras, safetyAlerts, hotspots, todayVehiclesCount);
  }, [cameras, safetyAlerts, hotspots, todayVehiclesCount]);

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    if (soundEnabled) {
      if (type === 'critical') playControlRoomBeep(440, 'sawtooth', 0.25);
      else if (type === 'success') playControlRoomBeep(1040, 'sine', 0.15);
      else playControlRoomBeep(780, 'sine', 0.1);
    }
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };


  const acknowledgeAlert = (alertId: string) => {
    setSafetyAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
    showToast('Alert Acknowledged', `Incident ${alertId} logged as reviewed by Operator.`, 'success');
  };

  const dispatchEmergencyTeam = (alertId: string, unitType: string) => {
    const timeNow = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date());

    setSafetyAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id === alertId) {
          const updated: SafetyAlert = {
            ...alert,
            acknowledged: true,
            dispatchedStatus: 'dispatched',
            dispatchedUnits: [unitType, 'Sentinel Unit PAT-01'],
            dispatchedAt: timeNow,
            etaMinutes: 3,
          };
          if (selectedAlertForModal?.id === alertId) {
            setSelectedAlertForModal(updated);
          }
          return updated;
        }
        return alert;
      })
    );
    showToast(
      '🚨 Emergency Dispatched',
      `${unitType} and Rapid Response team deployed to ${alertId}. Estimated arrival: 3 mins.`,
      'critical'
    );
  };

  const rebootCamera = (cameraId: string) => {
    showToast('Camera Reboot Sent', `Sending soft power cycle signal to ${cameraId}...`, 'info');
    setTimeout(() => {
      setCameras((prev) =>
        prev.map((cam) =>
          cam.id === cameraId
            ? { ...cam, status: 'online', latencyMs: 24, incidentType: 'Normal' }
            : cam
        )
      );
      showToast('Camera Online', `${cameraId} RTSP video feed recovered and streaming.`, 'success');
    }, 2000);
  };

  const triggerSimulatedAlert = () => {
    const targetCam = cameras[0] || INITIAL_CAMERAS[0];
    const newAlert: SafetyAlert = {
      id: `ALT-${Math.floor(2100 + Math.random() * 900)}`,
      type: 'Wrong-Way Vehicle',
      severity: 'Critical' as AlertSeverity,
      location: targetCam.location,
      zone: targetCam.zone,
      cameraId: targetCam.id,
      cameraName: targetCam.name,
      timestamp: new Date().toLocaleTimeString(),
      timeAgo: 'Just now',
      aiExplanation: 'ByteTrack Optical Flow: Real-time velocity reversal flagged on northbound lane.',
      confidence: 99.4,
      acknowledged: false,
      vehiclesInvolved: ['Vehicle (CA-512-AB)'],
      snapshotBg: 'wrongway',
      imageUrl: '/incidents/testing1.jpg',
      videoUrl: '/videos/cam_highway_collision.mp4',
      dispatchedStatus: 'none',
    };

    setSafetyAlerts((prev) => [newAlert, ...prev]);
    showToast('⚠️ NEW CRITICAL ALERT', `Wrong-Way Vehicle flagged by Vision AI on ${targetCam.zone}!`, 'critical');
  };

  const createDynamicSafetyAlert = (
    camera: CameraFeed,
    interaction: KinematicInteraction,
    snapshotImage?: string
  ): SafetyAlert => {
    const alertId = `ALT-KIN-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeNow = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date());

    const colType: SafetyAlert['collisionType'] =
      interaction.interactionType === 'vehicle-vehicle' ? 'Vehicle-Vehicle' :
      interaction.interactionType === 'vehicle-pedestrian' ? 'Vehicle-Pedestrian' :
      'Vehicle-Animal';

    const severity: AlertSeverity =
      interaction.status === 'Critical: Active Collision' ? 'Critical' :
      interaction.status === 'Warning: Accident-Prone Near-Miss' ? 'High' : 'Medium';

    const aiExplanation = `Kinematic Radar Vision AI: Detected acute ${interaction.scenario} conflict between ${interaction.entityAType} (${interaction.entityAId}) and ${interaction.entityBType} (${interaction.entityBId}). Spatial proximity: ${interaction.proximityMeters}m, closure velocity: ${interaction.relativeVelocityKmH} km/h${interaction.timeToCollisionSec !== null ? `, Time-To-Collision: ${interaction.timeToCollisionSec}s` : ''}. Autonomous trajectory conflict alert issued.`;

    const newAlert: SafetyAlert = {
      id: alertId,
      type: 'Traffic Accident',
      severity,
      location: camera.location,
      zone: camera.zone,
      cameraId: camera.id,
      cameraName: camera.name,
      timestamp: timeNow,
      timeAgo: 'Just now',
      aiExplanation,
      confidence: Number((Math.min(99.4, interaction.riskScore + (Math.random() * 3.5))).toFixed(1)),
      acknowledged: false,
      vehiclesInvolved: [
        `${interaction.entityAType.toUpperCase()} (${interaction.entityAId})`,
        `${interaction.entityBType.toUpperCase()} (${interaction.entityBId})`
      ],
      snapshotBg: 'accident',
      imageUrl: snapshotImage || camera.imageUrl || '/incidents/accident_detection.jpg',
      videoUrl: camera.videoUrl || '/videos/cam_highway_collision.mp4',
      dispatchedStatus: 'none',
      collisionType: colType,
      timeToCollisionSec: interaction.timeToCollisionSec ?? undefined,
      proximityMeters: interaction.proximityMeters,
      relativeClosureSpeedKmH: interaction.relativeVelocityKmH,
      hazardStatus: interaction.status,
      interactingObjectIds: [interaction.entityAId, interaction.entityBId]
    };

    setSafetyAlerts((prev) => [newAlert, ...prev]);
    showToast(
      `🚨 ${interaction.status.toUpperCase()}`,
      `${colType} (${interaction.scenario}) flagged on ${camera.name}. Proximity: ${interaction.proximityMeters}m.`,
      severity === 'Critical' ? 'critical' : 'warning'
    );

    return newAlert;
  };

  const triggerSimulatedCollisionAlert = (
    collisionType: 'Vehicle-Vehicle' | 'Vehicle-Pedestrian' | 'Vehicle-Animal' = 'Vehicle-Vehicle'
  ): SafetyAlert => {
    const targetCam = cameras[0] || INITIAL_CAMERAS[0];
    const alertId = `ALT-SIM-${Math.floor(3000 + Math.random() * 6900)}`;
    const timeNow = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date());

    let scenario = 'Head-On';
    let hazardStatus: SafetyAlert['hazardStatus'] = 'Critical: Active Collision';
    let proximityMeters = 1.4;
    let ttcSec = 0.42;
    let relativeSpeed = 74.2;
    let vehiclesInvolved = ['Vehicle (CAD-781)', 'Vehicle (TRK-904)'];
    let interactingObjectIds = ['veh-01', 'veh-02'];
    let aiExplanation = 'CrashSense Kinematic Classifier: Acute opposing trajectory vector conflict detected. Imminent head-on impact at closure rate of 74.2 km/h.';

    if (collisionType === 'Vehicle-Pedestrian') {
      scenario = 'Trajectory Conflict';
      hazardStatus = 'Warning: Accident-Prone Near-Miss';
      proximityMeters = 3.6;
      ttcSec = 0.95;
      relativeSpeed = 46.5;
      vehiclesInvolved = ['Vehicle (SUV-309)', 'Pedestrian (PED-41)'];
      interactingObjectIds = ['veh-rush', 'ped-cross'];
      aiExplanation = 'CrashSense Kinematic Classifier: Sudden crosswalk conflict detected. Vehicle closing rapidly on crossing pedestrian at 46.5 km/h (TTC: 0.95s).';
    } else if (collisionType === 'Vehicle-Animal') {
      scenario = 'Roadway Intrusion';
      hazardStatus = 'Caution: Hazard Ahead';
      proximityMeters = 6.2;
      ttcSec = 1.25;
      relativeSpeed = 38.0;
      vehiclesInvolved = ['Vehicle (SED-114)', 'Animal Obstacle (WILD-07)'];
      interactingObjectIds = ['veh-main', 'animal-intruder'];
      aiExplanation = 'CrashSense Kinematic Classifier: Wildlife roadway intrusion detected on active travel lane. High collision risk ahead.';
    }

    const newAlert: SafetyAlert = {
      id: alertId,
      type: 'Traffic Accident',
      severity: hazardStatus.includes('Critical') ? 'Critical' : hazardStatus.includes('Warning') ? 'High' : 'Medium',
      location: targetCam.location,
      zone: targetCam.zone,
      cameraId: targetCam.id,
      cameraName: targetCam.name,
      timestamp: timeNow,
      timeAgo: 'Just now',
      aiExplanation,
      confidence: 97.8,
      acknowledged: false,
      vehiclesInvolved,
      snapshotBg: 'accident',
      imageUrl: '/incidents/accident_detection.jpg',
      videoUrl: targetCam.videoUrl || '/videos/cam_highway_collision.mp4',
      dispatchedStatus: 'none',
      collisionType,
      timeToCollisionSec: ttcSec,
      proximityMeters,
      relativeClosureSpeedKmH: relativeSpeed,
      hazardStatus,
      interactingObjectIds
    };

    setSafetyAlerts((prev) => [newAlert, ...prev]);
    showToast(
      `🚨 ${hazardStatus.toUpperCase()}`,
      `Simulated ${collisionType} (${scenario}) generated on ${targetCam.zone}.`,
      hazardStatus.includes('Critical') ? 'critical' : 'warning'
    );

    return newAlert;
  };

  return (
    <CommandCenterContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        cameras,
        safetyAlerts,
        hotspots,
        hourlyData,
        vehicleDistribution,
        zoneSpeedData,
        weeklyTrend,
        metadata: DATASET_METADATA,
        kpis,
        selectedCamera,
        setSelectedCamera,
        selectedAlertForModal,
        setSelectedAlertForModal,
        acknowledgeAlert,
        dispatchEmergencyTeam,
        rebootCamera,
        triggerSimulatedAlert,
        createDynamicSafetyAlert,
        triggerSimulatedCollisionAlert,
        searchQuery,
        setSearchQuery,
        selectedZoneFilter,
        setSelectedZoneFilter,
        soundEnabled,
        setSoundEnabled,
        emergencyBannerOpen,
        setEmergencyBannerOpen,
        toasts,
        dismissToast,
        showToast,
        todayVehiclesCount,
        generateTelemetryCsv: () => dataService.generateTelemetryCsv(),
        generateVehicleDetectionsCsv: () => dataService.generateVehicleDetectionsCsv()
      }}
    >
      {children}
    </CommandCenterContext.Provider>
  );
};

export const useCommandCenter = () => {
  const context = useContext(CommandCenterContext);
  if (!context) {
    throw new Error('useCommandCenter must be used within a CommandCenterProvider');
  }
  return context;
};
