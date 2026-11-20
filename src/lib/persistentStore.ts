import type {
  MaintenanceItem,
  OdometerAuditEntry,
  VehicleProfile,
  WorkshopNote,
} from '../types/vehicle';

export const LEGACY_KEY_CHAINS = {
  TOTAL_KM: [
    'festiva93_total_km_v4',
    'festiva93_total_km_v3',
    'festiva93_total_km_v2',
    'festiva93_total_km_v1',
    'odosync_total_km',
  ],
  PARTIAL_KM: [
    'festiva93_partial_km_v4',
    'festiva93_partial_km_v3',
    'festiva93_partial_km_v2',
    'festiva93_partial_km_v1',
    'odosync_partial_km',
  ],
  FUEL_PCT: [
    'festiva93_fuel_pct_v4',
    'festiva93_fuel_pct_v3',
    'festiva93_fuel_pct_v2',
    'festiva93_fuel_pct_v1',
    'odosync_fuel_pct',
  ],
  VEHICLE: [
    'festiva93_vehicle_v4',
    'festiva93_vehicle_v3',
    'festiva93_vehicle_v2',
    'festiva93_vehicle_v1',
    'odosync_vehicle',
  ],
  AUDIT: [
    'festiva93_audit_v4',
    'festiva93_audit_v3',
    'festiva93_audit_v2',
    'festiva93_audit_v1',
    'odosync_audit',
  ],
  MAINTENANCE: [
    'festiva93_maintenance_v4',
    'festiva93_maintenance_v3',
    'festiva93_maintenance_v2',
    'festiva93_maintenance_v1',
    'odosync_maintenance',
  ],
  NOTES: ['festiva93_notes_v4', 'festiva93_notes_v3', 'odosync_notes'],
  SOUND_ALERTS: [
    'festiva93_sound_alerts_v4',
    'festiva93_sound_alerts_v3',
    'festiva93_sound_alerts_v2',
    'festiva93_sound_alerts_v1',
  ],
} as const;

export interface VaultSnapshot {
  totalKm: number;
  partialKm: number;
  fuelPct: number;
  vehicle: VehicleProfile;
  auditLog: OdometerAuditEntry[];
  maintenance: MaintenanceItem[];
  workshopNotes: WorkshopNote[];
  soundAlertsEnabled: boolean;
  updatedAt: string;
}

/**
 * Loads from the primary localStorage key, or migrates seamlessly from any older
 * v3 / v2 / v1 key so updating the app via GitHub/Vercel never wipes existing data.
 */
export function loadWithMigration<T>(keys: readonly string[], fallback: T): T {
  try {
    for (let i = 0; i < keys.length; i++) {
      const raw = localStorage.getItem(keys[i]);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T;
        // Promote migrated value into the canonical primary key immediately
        if (i > 0) {
          localStorage.setItem(keys[0], JSON.stringify(parsed));
        }
        return parsed;
      }
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Merges older maintenance lists (e.g. v3 which only had aceite + filtro_gasolina)
 * with any newly added default checklist items without losing dates or mileages.
 */
export function mergeMaintenanceLists(
  loaded: MaintenanceItem[],
  defaults: MaintenanceItem[]
): MaintenanceItem[] {
  if (!Array.isArray(loaded) || loaded.length === 0) return defaults;

  const byId = new Map<string, MaintenanceItem>();
  const byKind = new Map<string, MaintenanceItem>();
  for (const item of loaded) {
    byId.set(item.id, item);
    if (item.kind !== 'otro') {
      byKind.set(item.kind, item);
    }
  }

  const merged: MaintenanceItem[] = [];
  const usedIds = new Set<string>();

  for (const def of defaults) {
    const match = byId.get(def.id) || byKind.get(def.kind);
    if (match) {
      merged.push({ ...def, ...match });
      usedIds.add(match.id);
    } else {
      merged.push(def);
    }
  }

  // Keep any custom user-added items
  for (const item of loaded) {
    if (!usedIds.has(item.id)) {
      merged.push(item);
    }
  }

  return merged;
}

export function hasAnyLocalStorageData(): boolean {
  try {
    return Object.values(LEGACY_KEY_CHAINS).some((chain) =>
      chain.some((key) => localStorage.getItem(key) !== null)
    );
  } catch {
    return false;
  }
}

// IndexedDB secondary vault for extra resilience across PWA / browser updates
const DB_NAME = 'odosync_vault_db';
const STORE_NAME = 'snapshots';
const SNAPSHOT_KEY = 'latest';

function openVaultDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVaultSnapshot(snapshot: VaultSnapshot): Promise<void> {
  try {
    const db = await openVaultDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(snapshot, SNAPSHOT_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore IndexedDB quota/privacy restrictions
  }
}

export async function loadVaultSnapshot(): Promise<VaultSnapshot | null> {
  try {
    const db = await openVaultDb();
    const result = await new Promise<VaultSnapshot | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(SNAPSHOT_KEY);
      req.onsuccess = () => resolve((req.result as VaultSnapshot) || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return null;
  }
}

export async function requestPersistentBrowserStorage(): Promise<void> {
  try {
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist();
    }
  } catch {
    // Ignore unsupported
  }
}
