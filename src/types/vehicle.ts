export type DriveMode = 'idle' | 'gps';

export type NavTab = 'cluster' | 'pulso' | 'audio' | 'sync';

export type VehicleType = 'car' | 'moto';

export type VehicleBrandId =
  | 'ford'
  | 'fiat'
  | 'lada'
  | 'chrysler'
  | 'volkswagen'
  | 'chevrolet'
  | 'honda'
  | 'yamaha'
  | 'suzuki'
  | 'kawasaki'
  | 'bera'
  | 'bajaj';

export type CarBrandId = VehicleBrandId;

export interface VehicleProfile {
  vehicleType?: VehicleType;
  brand: VehicleBrandId;
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

export type MaintenanceKind =
  | 'aceite'
  | 'filtro_aceite'
  | 'bujias'
  | 'correa_alternador'
  | 'cauchos'
  | 'filtro_gasolina'
  | 'otro';

export type OilCondition = 'sin_revisar' | 'optimo' | 'medio' | 'oscuro' | 'bajo';

export interface MaintenanceItem {
  id: string;
  title: string;
  kind: MaintenanceKind;
  intervalKm: number;
  lastServiceKm: number | null;
  lastServiceDate: string;
  warnBeforeKm: number;
  enabled: boolean;
  notes: string;
  oilCondition?: OilCondition;
  sparkPlugBrand?: string;
  sparkPlugCount?: number | null;
}

export interface WorkshopNote {
  id: string;
  date: string;
  km: number;
  text: string;
}

export interface OdoSyncBackupFile {
  app?: string;
  version: number;
  exportedAt: string;
  vehicle: Partial<VehicleProfile>;
  totalKm: number;
  partialKm: number;
  fuelPct: number;
  speedStats?: SpeedStats;
  maintenance?: MaintenanceItem[];
  workshopNotes?: WorkshopNote[];
  auditLog?: OdometerAuditEntry[];
  soundAlertsEnabled?: boolean;
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
