export type DriveMode = 'idle' | 'gps' | 'road_test';

export type NavTab = 'cluster' | 'maintenance' | 'audio' | 'drive';

export interface VehicleProfile {
  name: string;
  plate: string;
  year: number;
  tankCapacityLiters: number;
  kmPerLiter: number;
  pinEnabled: boolean;
  securityPin: string;
}

export interface SpeedStats {
  currentKmh: number;
  maxKmh: number;
  minMovingKmh: number | null;
}

export interface OdometerAuditEntry {
  id: string;
  timestamp: string;
  previousKm: number;
  newKm: number;
  reason: string;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  kind: 'aceite' | 'filtro_gasolina' | 'otro';
  intervalKm: number;
  lastServiceKm: number | null;
  lastServiceDate: string;
  warnBeforeKm: number;
  enabled: boolean;
  notes: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  url: string;
}

export interface AudioOutputDevice {
  deviceId: string;
  label: string;
}

export interface CarBackupPayload {
  version: number;
  savedAt: string;
  email: string;
  vehicle: VehicleProfile;
  totalKm: number;
  partialKm: number;
  fuelPct: number;
  speedStats: SpeedStats;
  maintenance: MaintenanceItem[];
  auditLog: OdometerAuditEntry[];
}
