import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CameraFeed, 
  SafetyAlert, 
  TrafficHotspot, 
  ThemeMode, 
  NavigationTab,
  AlertSeverity
} from '../types';
import { 
  INITIAL_CAMERAS, 
  INITIAL_SAFETY_ALERTS, 
  CONGESTION_HOTSPOTS 
} from '../data/mockData';

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
  
  // Data
  cameras: CameraFeed[];
  safetyAlerts: SafetyAlert[];
  hotspots: TrafficHotspot[];
  
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

  // Real-time counter
  todayVehiclesCount: number;
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
  
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<SafetyAlert | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('All');
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emergencyBannerOpen, setEmergencyBannerOpen] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [todayVehiclesCount, setTodayVehiclesCount] = useState(18420);

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
    setTheme('dark');
  }, []);

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

  // Subtle live ticker: randomly jitter vehicle detection counter slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayVehiclesCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

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
            dispatchedUnits: [unitType, 'Traffic Division Unit 08'],
            dispatchedAt: timeNow,
            etaMinutes: 4,
          };
          // Also sync selected modal if active
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
      `${unitType} and Rapid Response team deployed to ${alertId}. Estimated arrival: 4 mins.`,
      'critical'
    );
  };

  const rebootCamera = (cameraId: string) => {
    showToast('Camera Reboot Sent', `Sending soft power cycle signal to ${cameraId}...`, 'info');
    setTimeout(() => {
      setCameras((prev) =>
        prev.map((cam) =>
          cam.id === cameraId
            ? { ...cam, status: 'online', latencyMs: 26, incidentType: 'Normal' }
            : cam
        )
      );
      showToast('Camera Online', `${cameraId} RTSP video feed recovered and streaming.`, 'success');
    }, 2000);
  };

  const triggerSimulatedAlert = () => {
    const newAlert: SafetyAlert = {
      id: `ALT-${Math.floor(1100 + Math.random() * 900)}`,
      type: 'Wrong-Way Vehicle',
      severity: 'Critical' as AlertSeverity,
      location: 'South Perimeter Highway Ramp B',
      zone: 'Highway A1',
      cameraId: 'CAM-07',
      cameraName: 'Highway A1 North Express Overpass',
      timestamp: new Date().toLocaleTimeString(),
      timeAgo: 'Just now',
      aiExplanation: 'AI Vision Model detected heavy SUV traveling counter-flow on elevated bypass.',
      confidence: 99.2,
      acknowledged: false,
      vehiclesInvolved: ['Silver SUV (FL-411-ZZ)'],
      snapshotBg: 'wrongway',
      dispatchedStatus: 'none',
    };

    setSafetyAlerts((prev) => [newAlert, ...prev]);
    showToast('⚠️ NEW CRITICAL ALERT', 'Wrong-Way Vehicle flagged by Vision AI on Highway A1!', 'critical');
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
        selectedCamera,
        setSelectedCamera,
        selectedAlertForModal,
        setSelectedAlertForModal,
        acknowledgeAlert,
        dispatchEmergencyTeam,
        rebootCamera,
        triggerSimulatedAlert,
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
