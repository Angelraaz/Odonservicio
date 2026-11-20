import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CarFront,
  FolderSync,
  Gauge,
  Menu,
  Moon,
  Music2,
  Settings,
  Sun,
  WifiOff,
  Wrench,
  X,
} from 'lucide-react';
import { AnalogCluster } from './components/AnalogCluster';
import { BluetoothAudioPlayer } from './components/BluetoothAudioPlayer';
import { BrandEmblem, StartupSplash } from './components/BrandEmblems';
import { DataSyncPanel } from './components/DataSyncPanel';
import { InstallGateModal } from './components/InstallGateModal';
import { MaintenancePanel } from './components/MaintenancePanel';
import { MobileAppStoreCard } from './components/MobileAppStoreCard';
import { OdometerEditModal } from './components/OdometerEditModal';
import { SettingsPanel } from './components/SettingsPanel';
import { VehicleProfileModal } from './components/VehicleProfileModal';
import { getBrandDefinition, isValidBrandId } from './data/vehicleCatalog';
import { useAnalogDrive } from './hooks/useAnalogDrive';
import { useCarAudio } from './hooks/useCarAudio';
import { useFloatingBubble } from './hooks/useFloatingBubble';
import { useForceLandscape } from './hooks/useForceLandscape';
import { useNightTheme } from './hooks/useNightTheme';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  hasAnyLocalStorageData,
  LEGACY_KEY_CHAINS,
  loadVaultSnapshot,
  loadWithMigration,
  mergeMaintenanceLists,
  requestPersistentBrowserStorage,
  saveVaultSnapshot,
} from './lib/persistentStore';
import type {
  MaintenanceItem,
  NavTab,
  OdometerAuditEntry,
  OdoSyncBackupFile,
  VehicleProfile,
  WorkshopNote,
} from './types/vehicle';

const STORAGE_KEYS = {
  TOTAL_KM: LEGACY_KEY_CHAINS.TOTAL_KM[0],
  PARTIAL_KM: LEGACY_KEY_CHAINS.PARTIAL_KM[0],
  FUEL_PCT: LEGACY_KEY_CHAINS.FUEL_PCT[0],
  VEHICLE: LEGACY_KEY_CHAINS.VEHICLE[0],
  AUDIT: LEGACY_KEY_CHAINS.AUDIT[0],
  MAINTENANCE: LEGACY_KEY_CHAINS.MAINTENANCE[0],
  NOTES: LEGACY_KEY_CHAINS.NOTES[0],
  SOUND_ALERTS: LEGACY_KEY_CHAINS.SOUND_ALERTS[0],
};

const DEFAULT_VEHICLE: VehicleProfile = {
  vehicleType: 'car',
  brand: 'ford',
  name: 'Ford Festiva',
  plate: '',
  year: 1993,
  tankCapacityLiters: 38,
  kmPerLiter: 13.5,
  pinEnabled: false,
  securityPin: '1234',
};

const DEFAULT_MAINTENANCE: MaintenanceItem[] = [
  {
    id: 'm-aceite',
    title: 'Estado del Aceite',
    kind: 'aceite',
    intervalKm: 5000,
    lastServiceKm: null,
    lastServiceDate: '',
    warnBeforeKm: 500,
    enabled: true,
    notes: '',
    oilCondition: 'sin_revisar',
  },
  {
    id: 'm-filtro-aceite',
    title: 'Filtro de Aceite',
    kind: 'filtro_aceite',
    intervalKm: 5000,
    lastServiceKm: null,
    lastServiceDate: '',
    warnBeforeKm: 500,
    enabled: true,
    notes: '',
  },
  {
    id: 'm-filtro-gasolina',
    title: 'Filtro de Gasolina',
    kind: 'filtro_gasolina',
    intervalKm: 10000,
    lastServiceKm: null,
    lastServiceDate: '',
    warnBeforeKm: 500,
    enabled: true,
    notes: '',
  },
  {
    id: 'm-bujias',
    title: 'Cambio de Bujías',
    kind: 'bujias',
    intervalKm: 20000,
    lastServiceKm: null,
    lastServiceDate: '',
    warnBeforeKm: 1000,
    enabled: true,
    notes: '',
    sparkPlugBrand: '',
    sparkPlugCount: null,
  },
  {
    id: 'm-correa',
    title: 'Correa de Alternador',
    kind: 'correa_alternador',
    intervalKm: 30000,
    lastServiceKm: null,
    lastServiceDate: '',
    warnBeforeKm: 1500,
    enabled: true,
    notes: '',
  },
  {
    id: 'm-cauchos',
    title: 'Cauchos',
    kind: 'cauchos',
    intervalKm: 40000,
    lastServiceKm: null,
    lastServiceDate: '',
    warnBeforeKm: 2000,
    enabled: true,
    notes: '',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('cluster');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [totalKm, setTotalKm] = useState<number>(() =>
    loadWithMigration(LEGACY_KEY_CHAINS.TOTAL_KM, 0)
  );
  const [partialKm, setPartialKm] = useState<number>(() =>
    loadWithMigration(LEGACY_KEY_CHAINS.PARTIAL_KM, 0)
  );
  const [fuelPct, setFuelPct] = useState<number>(() =>
    loadWithMigration(LEGACY_KEY_CHAINS.FUEL_PCT, 100)
  );
  const [vehicle, setVehicle] = useState<VehicleProfile>(() => {
    const loaded = loadWithMigration(LEGACY_KEY_CHAINS.VEHICLE, DEFAULT_VEHICLE);
    const safeBrand = isValidBrandId(loaded.brand) ? loaded.brand : 'ford';
    return {
      ...DEFAULT_VEHICLE,
      ...loaded,
      brand: safeBrand,
      vehicleType: loaded.vehicleType || getBrandDefinition(safeBrand).type,
    };
  });
  const [auditLog, setAuditLog] = useState<OdometerAuditEntry[]>(() =>
    loadWithMigration(LEGACY_KEY_CHAINS.AUDIT, [])
  );
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(() =>
    mergeMaintenanceLists(
      loadWithMigration(LEGACY_KEY_CHAINS.MAINTENANCE, DEFAULT_MAINTENANCE),
      DEFAULT_MAINTENANCE
    )
  );
  const [workshopNotes, setWorkshopNotes] = useState<WorkshopNote[]>(() =>
    loadWithMigration(LEGACY_KEY_CHAINS.NOTES, [])
  );
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() =>
    loadWithMigration(LEGACY_KEY_CHAINS.SOUND_ALERTS, true)
  );

  const [isEditOdoOpen, setIsEditOdoOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const alertedIdsRef = useRef<Set<string>>(new Set());
  const vaultReadyRef = useRef(false);

  const isOnline = useOnlineStatus();
  const pwa = usePWAInstall();
  const { forceLandscape, needsCssRotation, toggleForceLandscape } = useForceLandscape();
  const { preference, setPreference, isNightMode } = useNightTheme();
  const vehicleRef = useRef(vehicle);
  vehicleRef.current = vehicle;

  // Startup brand insignia splash screen
  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  const handleDistanceDeltaKm = useCallback((deltaKm: number) => {
    setTotalKm((prev) => Number((prev + deltaKm).toFixed(3)));
    setPartialKm((prev) => Number((prev + deltaKm).toFixed(3)));

    const v = vehicleRef.current;
    const litersBurned = deltaKm / Math.max(1, v.kmPerLiter);
    const pctDrop = (litersBurned / Math.max(1, v.tankCapacityLiters)) * 100;
    setFuelPct((prev) => Math.max(0, Number((prev - pctDrop).toFixed(3))));
  }, []);

  const drive = useAnalogDrive(handleDistanceDeltaKm);
  const audio = useCarAudio();
  const bubble = useFloatingBubble({
    speedKmh: drive.speedStats.currentKmh,
    totalKm,
    partialKm,
    fuelPct,
    isNightMode,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOTAL_KM, JSON.stringify(totalKm));
  }, [totalKm]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTIAL_KM, JSON.stringify(partialKm));
  }, [partialKm]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FUEL_PCT, JSON.stringify(fuelPct));
  }, [fuelPct]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLE, JSON.stringify(vehicle));
  }, [vehicle]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLog));
  }, [auditLog]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(workshopNotes));
  }, [workshopNotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ALERTS, JSON.stringify(soundAlertsEnabled));
  }, [soundAlertsEnabled]);

  // Request durable browser storage and auto-recover from IndexedDB vault if localStorage was wiped
  useEffect(() => {
    let active = true;
    void requestPersistentBrowserStorage();

    if (!hasAnyLocalStorageData()) {
      loadVaultSnapshot().then((snapshot) => {
        if (!active) return;
        if (snapshot) {
          if (typeof snapshot.totalKm === 'number') setTotalKm(snapshot.totalKm);
          if (typeof snapshot.partialKm === 'number') setPartialKm(snapshot.partialKm);
          if (typeof snapshot.fuelPct === 'number') setFuelPct(snapshot.fuelPct);
          if (snapshot.vehicle) {
            const safeBrand = isValidBrandId(snapshot.vehicle.brand)
              ? snapshot.vehicle.brand
              : 'ford';
            setVehicle({
              ...DEFAULT_VEHICLE,
              ...snapshot.vehicle,
              brand: safeBrand,
              vehicleType:
                snapshot.vehicle.vehicleType || getBrandDefinition(safeBrand).type,
            });
          }
          if (Array.isArray(snapshot.auditLog)) setAuditLog(snapshot.auditLog);
          if (Array.isArray(snapshot.maintenance)) {
            setMaintenance(mergeMaintenanceLists(snapshot.maintenance, DEFAULT_MAINTENANCE));
          }
          if (Array.isArray(snapshot.workshopNotes)) setWorkshopNotes(snapshot.workshopNotes);
          if (typeof snapshot.soundAlertsEnabled === 'boolean') {
            setSoundAlertsEnabled(snapshot.soundAlertsEnabled);
          }
        }
        vaultReadyRef.current = true;
      });
    } else {
      vaultReadyRef.current = true;
    }

    return () => {
      active = false;
    };
  }, []);

  // Mirror current state into IndexedDB vault after hydration
  useEffect(() => {
    if (!vaultReadyRef.current) return;
    void saveVaultSnapshot({
      totalKm,
      partialKm,
      fuelPct,
      vehicle,
      auditLog,
      maintenance,
      workshopNotes,
      soundAlertsEnabled,
      updatedAt: new Date().toISOString(),
    });
  }, [
    totalKm,
    partialKm,
    fuelPct,
    vehicle,
    auditLog,
    maintenance,
    workshopNotes,
    soundAlertsEnabled,
  ]);

  const dueMaintenance = maintenance.filter((item) => {
    if (!item.enabled || item.lastServiceKm === null) return false;
    return item.lastServiceKm + item.intervalKm - totalKm <= item.warnBeforeKm;
  });

  useEffect(() => {
    if (!soundAlertsEnabled) return;
    const newlyDue = dueMaintenance.find((m) => !alertedIdsRef.current.has(m.id));
    if (!newlyDue) return;
    alertedIdsRef.current.add(newlyDue.id);
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } catch {
      // Ignore Web Audio restriction before interaction
    }
  }, [dueMaintenance, soundAlertsEnabled]);

  const handleConfirmOdometerEdit = (newKm: number, reason: string) => {
    const entry: OdometerAuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      previousKm: Number(totalKm.toFixed(1)),
      newKm,
      reason,
    };
    setTotalKm(newKm);
    setAuditLog((prev) => [entry, ...prev]);
  };

  const handleTogglePinProtection = (enabled: boolean, newPin: string) => {
    setVehicle((prev) => ({
      ...prev,
      pinEnabled: enabled,
      securityPin: newPin,
    }));
  };

  const handleMarkDoneToday = (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setMaintenance((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              lastServiceKm: Math.round(totalKm),
              lastServiceDate: today,
              ...(item.kind === 'aceite' ? { oilCondition: 'optimo' } : {}),
            }
          : item
      )
    );
    alertedIdsRef.current.delete(id);
  };

  const handleUpdateItemDetails = (id: string, patch: Partial<MaintenanceItem>) => {
    setMaintenance((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
    alertedIdsRef.current.delete(id);
  };

  const handleAddMaintenance = (newItem: Omit<MaintenanceItem, 'id'>) => {
    setMaintenance((prev) => [
      ...prev,
      {
        ...newItem,
        id: `m-${Date.now()}`,
      },
    ]);
  };

  const handleDeleteMaintenance = (id: string) => {
    setMaintenance((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddWorkshopNote = (text: string) => {
    const entry: WorkshopNote = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      km: totalKm,
      text,
    };
    setWorkshopNotes((prev) => [entry, ...prev]);
  };

  const handleDeleteWorkshopNote = (id: string) => {
    setWorkshopNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const buildBackup = useCallback((): OdoSyncBackupFile => {
    return {
      app: 'OdoSync',
      version: 4,
      exportedAt: new Date().toISOString(),
      vehicle,
      totalKm: Number(totalKm.toFixed(2)),
      partialKm: Number(partialKm.toFixed(2)),
      fuelPct: Number(fuelPct.toFixed(2)),
      speedStats: drive.speedStats,
      maintenance,
      workshopNotes,
      auditLog,
      soundAlertsEnabled,
    };
  }, [
    auditLog,
    drive.speedStats,
    fuelPct,
    maintenance,
    partialKm,
    soundAlertsEnabled,
    totalKm,
    vehicle,
    workshopNotes,
  ]);

  const handleImportBackup = useCallback(
    (backup: OdoSyncBackupFile) => {
      if (typeof backup.totalKm === 'number' && !Number.isNaN(backup.totalKm)) {
        setTotalKm(Math.max(0, backup.totalKm));
      }
      if (typeof backup.partialKm === 'number' && !Number.isNaN(backup.partialKm)) {
        setPartialKm(Math.max(0, backup.partialKm));
      }
      if (typeof backup.fuelPct === 'number' && !Number.isNaN(backup.fuelPct)) {
        setFuelPct(Math.min(100, Math.max(0, backup.fuelPct)));
      }
      if (backup.vehicle && typeof backup.vehicle === 'object') {
        setVehicle((prev) => {
          const candidateBrand = backup.vehicle.brand || prev.brand || 'ford';
          const safeBrand = isValidBrandId(candidateBrand) ? candidateBrand : 'ford';
          return {
            ...DEFAULT_VEHICLE,
            ...prev,
            ...backup.vehicle,
            brand: safeBrand,
            vehicleType:
              backup.vehicle.vehicleType || getBrandDefinition(safeBrand).type,
          };
        });
      }
      if (Array.isArray(backup.maintenance) && backup.maintenance.length > 0) {
        setMaintenance(mergeMaintenanceLists(backup.maintenance, DEFAULT_MAINTENANCE));
      }
      if (Array.isArray(backup.workshopNotes)) {
        setWorkshopNotes(backup.workshopNotes);
      }
      if (Array.isArray(backup.auditLog)) {
        setAuditLog(backup.auditLog);
      }
      if (backup.speedStats) {
        drive.restoreSpeedStats(backup.speedStats);
      }
      if (typeof backup.soundAlertsEnabled === 'boolean') {
        setSoundAlertsEnabled(backup.soundAlertsEnabled);
      }
      alertedIdsRef.current.clear();
    },
    [drive]
  );

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'cluster', label: 'Velocímetro', icon: Gauge },
    { id: 'pulso', label: 'Pulso Mecánico', icon: Wrench },
    { id: 'audio', label: 'Música', icon: Music2 },
    { id: 'sync', label: 'Actualizar Info', icon: FolderSync },
    { id: 'config', label: 'Configuración', icon: Settings },
  ];

  const selectMobileTab = (tab: NavTab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const cycleThemePreference = () => {
    setPreference((prev) => (prev === 'auto' ? 'night' : prev === 'night' ? 'day' : 'auto'));
  };

  const themeLabel =
    preference === 'auto'
      ? isNightMode
        ? 'Auto · Noche'
        : 'Auto · Día'
      : preference === 'night'
        ? 'Noche'
        : 'Día';

  // Enforce standalone app installation on direct mobile browsers (no Chrome browsing),
  // while keeping embedded preview frames and desktop browsers open for inspection.
  const isPreviewFrame = typeof window !== 'undefined' && window.self !== window.top;
  if (pwa.isMobileDevice && !pwa.isInstalled && !isPreviewFrame) {
    return (
      <InstallGateModal
        vehicle={vehicle}
        isIOS={pwa.isIOS}
        isInstallable={pwa.isInstallable}
        onInstall={pwa.install}
      />
    );
  }

  return (
    <div
      className={
        needsCssRotation
          ? 'fixed top-0 left-full w-[100dvh] h-[100dvw] origin-top-left rotate-90 overflow-y-auto overflow-x-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)] pb-6 transition-colors duration-300 flex flex-col z-40'
          : 'min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pb-10 transition-colors duration-300 flex flex-col'
      }
    >
      {showSplash && (
        <StartupSplash
          vehicle={vehicle}
          isNightMode={isNightMode}
          onDismiss={() => setShowSplash(false)}
        />
      )}

      {/* Clean Top Bar with Signature Blue-Ringed Circular Menu Button */}
      <header className="sticky top-0 z-30 h-16 bg-[var(--bg-canvas)]/95 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden h-12 w-12 rounded-full border-2 border-[#3B82F6] bg-[var(--bg-canvas)] hover:bg-[#0B1220] flex items-center justify-center text-[#3B82F6] cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cluster')}
              className="hidden lg:flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap cursor-pointer"
            >
              <BrandEmblem brand={vehicle.brand} className="w-9 h-6" />
              <span>OdoSync</span>
            </button>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === item.id
                    ? 'text-[var(--text-primary)] border-red-500'
                    : 'border-transparent hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="py-1 border-b-2 border-transparent hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mi Vehículo
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={cycleThemePreference}
              title="Cambiar modo nocturno automático según la hora"
              className="min-h-[40px] px-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#1B1F27] border border-white/10 text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              {isNightMode ? (
                <Moon className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{themeLabel}</span>
            </button>
            <MobileAppStoreCard compactTrigger />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-2 space-y-5 flex-1">
        {!isOnline && (
          <div className="rounded-xl bg-[var(--bg-elevated)] border border-white/10 px-4 py-2.5 flex items-center gap-2.5 text-xs text-[#D1D5DB]">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Sin conexión: tablero, pulso mecánico y música local funcionan en tu celular.</span>
          </div>
        )}

        {dueMaintenance.length > 0 && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                Testigo activo:{' '}
                <strong>{dueMaintenance.map((d) => d.title).join(', ')}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('pulso')}
              className="text-xs font-semibold text-red-300 underline whitespace-nowrap cursor-pointer"
            >
              Ver Pulso
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Analog Gauge + Telltale Lamps + 2x2 Readouts + Fuel */}
          <div className={`lg:col-span-6 ${activeTab === 'cluster' ? 'block' : 'hidden lg:block'}`}>
            <AnalogCluster
              vehicle={vehicle}
              totalKm={totalKm}
              partialKm={partialKm}
              fuelPct={fuelPct}
              speedStats={drive.speedStats}
              mode={drive.mode}
              isNightMode={isNightMode}
              gpsError={drive.gpsError}
              forceLandscape={forceLandscape}
              dueMaintenance={dueMaintenance}
              onClickTelltale={() => setActiveTab('pulso')}
              onStartGPS={drive.startGPS}
              onStopTracking={drive.stopTracking}
              onResetPartial={() => setPartialKm(0)}
              onResetMinMax={drive.resetMinMax}
              onOpenEditTotal={() => setIsEditOdoOpen(true)}
              onSetFuelFull={() => setFuelPct(100)}
              onChangeFuelPct={setFuelPct}
            />
          </div>

          {/* Right Column: Pulso Mecánico + Music */}
          <div className="lg:col-span-6 space-y-5">
            <div className={activeTab === 'pulso' ? 'block' : 'hidden lg:block'}>
              <MaintenancePanel
                currentKm={totalKm}
                items={maintenance}
                workshopNotes={workshopNotes}
                soundAlertsEnabled={soundAlertsEnabled}
                onToggleSoundAlerts={() => setSoundAlertsEnabled((s) => !s)}
                onMarkDoneToday={handleMarkDoneToday}
                onUpdateItemDetails={handleUpdateItemDetails}
                onAddItem={handleAddMaintenance}
                onDeleteItem={handleDeleteMaintenance}
                onAddNote={handleAddWorkshopNote}
                onDeleteNote={handleDeleteWorkshopNote}
              />
            </div>

            <div className={activeTab === 'audio' ? 'block' : 'hidden lg:block'}>
              <BluetoothAudioPlayer
                tracks={audio.tracks}
                currentTrack={audio.currentTrack}
                currentIndex={audio.currentIndex}
                isPlaying={audio.isPlaying}
                currentTime={audio.currentTime}
                durationSec={audio.durationSec}
                volume={audio.volume}
                bluetoothConnected={audio.bluetoothConnected}
                carStereoName={audio.carStereoName}
                outputDevices={audio.outputDevices}
                selectedSinkId={audio.selectedSinkId}
                onToggleBluetooth={() => audio.setBluetoothConnected((b) => !b)}
                onRefreshOutputs={audio.refreshAudioOutputs}
                onChangeOutput={audio.changeAudioOutput}
                onTogglePlay={audio.togglePlay}
                onNext={audio.nextTrack}
                onPrev={audio.prevTrack}
                onSelectTrack={audio.selectTrack}
                onRemoveTrack={audio.removeTrack}
                onSeek={audio.seekTo}
                onChangeVolume={audio.setVolume}
                onAddFiles={audio.addLocalFiles}
              />
            </div>

            <div className={activeTab === 'sync' ? 'block' : 'hidden lg:block'}>
              <DataSyncPanel
                totalKm={totalKm}
                partialKm={partialKm}
                fuelPct={fuelPct}
                maintenanceCount={maintenance.length}
                notesCount={workshopNotes.length}
                buildBackup={buildBackup}
                onImportBackup={handleImportBackup}
              />
            </div>

            <div className={activeTab === 'config' ? 'block' : 'hidden lg:block'}>
              <SettingsPanel
                forceLandscape={forceLandscape}
                onToggleForceLandscape={toggleForceLandscape}
                isBubbleActive={bubble.isBubbleActive}
                bubbleError={bubble.bubbleError}
                onToggleBubble={bubble.isBubbleActive ? bubble.closeBubble : bubble.openBubble}
                themePreference={preference}
                isNightMode={isNightMode}
                onChangeThemePreference={setPreference}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Slide-out Mobile Navigation Drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-black/75 backdrop-blur-sm lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
        >
          <div className="w-72 max-w-[85vw] h-full bg-[#0A0B0E] border-r border-white/[0.1] p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrandEmblem brand={vehicle.brand} className="w-8 h-5" />
                  <span className="font-display text-2xl font-bold text-white">OdoSync</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#9CA3AF] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectMobileTab(item.id)}
                      className={`w-full min-h-[48px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'text-[#D1D5DB] hover:bg-[#111318]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsProfileOpen(true);
                  }}
                  className="w-full min-h-[48px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-medium text-[#D1D5DB] hover:bg-[#111318] cursor-pointer"
                >
                  <CarFront className="w-4 h-4 shrink-0" />
                  <span>Mi Vehículo</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <MobileAppStoreCard />
              <div className="text-center text-xs text-[var(--text-secondary)]">
                by AjrcServicios ·{' '}
                <a
                  href="https://ajrcs.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B82F6] hover:underline"
                >
                  ajrcs.vercel.app
                </a>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="flex-1 h-full cursor-default"
          />
        </div>
      )}

      {/* In-App Floating Digital Bubble when browsing other mobile tabs */}
      {activeTab !== 'cluster' && (
        <button
          type="button"
          onClick={() => setActiveTab('cluster')}
          aria-label="Volver al velocímetro"
          className="lg:hidden fixed bottom-5 right-4 z-40 h-20 w-20 rounded-full bg-[var(--bg-canvas)] border-2 border-[#3B82F6] shadow-2xl flex flex-col items-center justify-center cursor-pointer"
        >
          <span className="font-mono-tabular text-xl font-bold leading-none text-[var(--text-primary)]">
            {Math.round(drive.speedStats.currentKmh)}
          </span>
          <span className="text-[9px] text-[var(--text-secondary)]">km/h</span>
          <span className="font-mono-tabular text-[10px] font-semibold text-amber-400 mt-0.5">
            {Math.round(totalKm)} km
          </span>
        </button>
      )}

      {/* Quiet Footer */}
      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-8 pb-2 text-center text-xs text-[var(--text-secondary)]">
        <span>by AjrcServicios</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <a
          href="https://ajrcs.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3B82F6] hover:underline"
        >
          ajrcs.vercel.app
        </a>
      </footer>

      <OdometerEditModal
        isOpen={isEditOdoOpen}
        currentKm={totalKm}
        speedKmh={drive.speedStats.currentKmh}
        vehicle={vehicle}
        auditLog={auditLog}
        onClose={() => setIsEditOdoOpen(false)}
        onConfirmUpdate={handleConfirmOdometerEdit}
        onTogglePinProtection={handleTogglePinProtection}
      />

      <VehicleProfileModal
        isOpen={isProfileOpen}
        vehicle={vehicle}
        onClose={() => setIsProfileOpen(false)}
        onSave={setVehicle}
      />
    </div>
  );
}
