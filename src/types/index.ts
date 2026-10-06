export type ZoneId = 'Downtown Core' | 'North Sector' | 'Waterfront Bay' | 'Highway A1' | 'Tech Corridor' | 'Harbour District';

export type CameraStatus = 'online' | 'warning' | 'offline';

export type IncidentCategory = 
  | 'Traffic Accident' 
  | 'Wrong-Way Vehicle' 
  | 'Overspeeding' 
  | 'Pedestrian in Restricted Area' 
  | 'Illegal Parking'
  | 'Traffic Congestion';

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface DetectedObject {
  id: string;
  type: 'car' | 'bus' | 'truck' | 'pedestrian' | 'bicycle' | 'motorcycle';
  confidence: number;
  box: { x: number; y: number; w: number; h: number }; // percentages 0-100
  speed?: number; // km/h
  licensePlate?: string;
  isViolation?: boolean;
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  zone: ZoneId;
  status: CameraStatus;
  resolution: '4K UltraHD' | '1080p FHD';
  fps: number;
  ip: string;
  vehicleCount: number;
  pedestrianCount: number;
  congestionScore: number; // 0-100
  incidentType: IncidentCategory | 'Normal';
  latencyMs: number;
  activeAiModels: string[];
  objects: DetectedObject[];
  coordinates: { x: number; y: number }; // Map coordinates (0-100%)
  videoTheme: 'highway' | 'intersection' | 'bridge' | 'crosswalk' | 'tunnel' | 'roundabout';
  recentEvents: { time: string; text: string; severity: AlertSeverity }[];
  imageUrl?: string;
}

export interface SafetyAlert {
  id: string;
  type: IncidentCategory;
  severity: AlertSeverity;
  location: string;
  zone: ZoneId;
  cameraId: string;
  cameraName: string;
  timestamp: string;
  timeAgo: string;
  aiExplanation: string;
  confidence: number;
  acknowledged: boolean;
  vehiclesInvolved: string[];
  snapshotBg: string;
  imageUrl?: string;
  dispatchedStatus?: 'none' | 'dispatching' | 'dispatched';
  dispatchedUnits?: string[];
  dispatchedAt?: string;
  etaMinutes?: number;
}

export interface TrafficHotspot {
  id: string;
  location: string;
  zone: ZoneId;
  congestionStatus: 'Critical' | 'High' | 'Moderate' | 'Normal';
  congestionScore: number; // 0 - 100
  averageSpeed: number; // km/h
  cameraId: string;
  cameraName: string;
  lastUpdated: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  historicalVolume: number[];
}

export interface HourlyTrafficData {
  hour: string;
  volume: number;
  baseline: number;
  averageSpeed: number;
}

export interface ZoneSpeedData {
  zone: ZoneId;
  avgSpeed: number;
  congestionScore: number;
  vehicleCount: number;
}

export interface VehicleDistribution {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface WeeklyTrendPoint {
  day: string;
  peakCongestion: number;
  avgCongestion: number;
  incidents: number;
}

export type ThemeMode = 'dark' | 'monochrome' | 'light';
export type NavigationTab = 'overview' | 'surveillance' | 'traffic' | 'alerts' | 'cameras' | 'reports' | 'settings';
