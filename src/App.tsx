import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CarFront,
  Gauge,
  HardDrive,
  Menu,
  Moon,
  Music2,
  Sun,
  WifiOff,
  Wrench,
  X,
} from 'lucide-react';
import { AnalogCluster } from './components/AnalogCluster';
import { BluetoothAudioPlayer } from './components/BluetoothAudioPlayer';
import { GoogleDriveBackupPanel } from './components/GoogleDriveBackupPanel';
import { MaintenancePanel } from './components/MaintenancePanel';
import { MobileAppStoreCard } from './components/MobileAppStoreCard';
import { OdometerEditModal } from './components/OdometerEditModal';
import { VehicleProfileModal } from './components/VehicleProfileModal';
import { useAnalogDrive } from './hooks/useAnalogDrive';
import { useCarAudio } from './hooks/useCarAudio';
import { useFloatingBubble } from './hooks/useFloatingBubble';
import { useNightTheme } from './hooks/useNightTheme';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import type {
  CarBackupPayload,
  MaintenanceItem,
  NavTab,
  OdometerAuditEntry,
  VehicleProfile,
} from './types/vehicle';

const STORAGE_KEYS = {
  TOTAL_KM: 'festiva93_total_km_v3',
  PARTIAL_KM: 'festiva93_partial_km_v3',
  FUEL_PCT: 'festiva93_fuel_pct_v3',
  VEHICLE: 'festiva93_vehicle_v3',
  AUDIT: 'festiva93_audit_v3',
  MAINTENANCE: 'festiva93_maintenance_v3',
  SOUND_ALERTS: 'festiva93_sound_alerts_v3',
  EMAIL: 'festiva93_email_v3',
};

const DEFAULT_VEHICLE: VehicleProfile = {
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
    title: 'Cambio de Aceite',
    kind: 'aceite',
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
];

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('cluster');
  const [menuOpen, setMenuOpen] = useState(false);

  const [totalKm, setTotalKm] = useState<number>(() => loadJson(STORAGE_KEYS.TOTAL_KM, 0));
  const [partialKm, setPartialKm] = useState<number>(() => loadJson(STORAGE_KEYS.PARTIAL_KM, 0));
  const [fuelPct, setFuelPct] = useState<number>(() => loadJson(STORAGE_KEYS.FUEL_PCT, 100));
  const [vehicle, setVehicle] = useState<VehicleProfile>(() =>
    loadJson(STORAGE_KEYS.VEHICLE, DEFAULT_VEHICLE)
  );
  const [auditLog, setAuditLog] = useState<OdometerAuditEntry[]>(() =>
    loadJson(STORAGE_KEYS.AUDIT, [])
  );
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(() =>
    loadJson(STORAGE_KEYS.MAINTENANCE, DEFAULT_MAINTENANCE)
  );
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() =>
    loadJson(STORAGE_KEYS.SOUND_ALERTS, true)
  );
  const [userEmail, setUserEmail] = useState<string>(() =>
    loadJson(STORAGE_KEYS.EMAIL, '')
  );

  const [isEditOdoOpen, setIsEditOdoOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const alertedIdsRef = useRef<Set<string>>(new Set());

  const isOnline = useOnlineStatus();
  const { preference, setPreference, isNightMode } = useNightTheme();
  const vehicleRef = useRef(vehicle);
  vehicleRef.current = vehicle;

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
    localStorage.setItem(STORAGE_KEYS.SOUND_ALERTS, JSON.stringify(soundAlertsEnabled));
  }, [soundAlertsEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMAIL, JSON.stringify(userEmail));
  }, [userEmail]);

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
            }
          : item
      )
    );
    alertedIdsRef.current.delete(id);
  };

  const handleUpdateLastService = (
    id: string,
    km: number,
    date: string,
    intervalKm: number
  ) => {
    setMaintenance((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, lastServiceKm: km, lastServiceDate: date, intervalKm }
          : item
      )
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

  const buildBackupPayload = (email: string): CarBackupPayload => ({
    version: 1,
    savedAt: new Date().toISOString(),
    email,
    vehicle,
    totalKm: Number(totalKm.toFixed(1)),
    partialKm: Number(partialKm.toFixed(2)),
    fuelPct: Number(fuelPct.toFixed(1)),
    speedStats: drive.speedStats,
    maintenance,
    auditLog,
  });

  const handleRestoreBackup = (payload: CarBackupPayload) => {
    if (typeof payload.totalKm === 'number') setTotalKm(payload.totalKm);
    if (typeof payload.partialKm === 'number') setPartialKm(payload.partialKm);
    if (typeof payload.fuelPct === 'number') setFuelPct(payload.fuelPct);
    if (payload.vehicle) setVehicle(payload.vehicle);
    if (Array.isArray(payload.maintenance)) setMaintenance(payload.maintenance);
    if (Array.isArray(payload.auditLog)) setAuditLog(payload.auditLog);
    if (payload.speedStats) drive.restoreSpeedStats(payload.speedStats);
    if (payload.email) setUserEmail(payload.email);
  };

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'cluster', label: 'Velocímetro', icon: Gauge },
    { id: 'maintenance', label: 'Aceite y Filtro', icon: Wrench },
    { id: 'audio', label: 'Música', icon: Music2 },
    { id: 'drive', label: 'Google Drive', icon: HardDrive },
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

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pb-10 transition-colors duration-300 flex flex-col">
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
              className="hidden lg:inline-block font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap cursor-pointer"
            >
              OdoSync
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
            <span>Sin conexión: el tablero y música local siguen funcionando.</span>
          </div>
        )}

        {dueMaintenance.length > 0 && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                Aviso: <strong>{dueMaintenance.map((d) => d.title).join(' y ')}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('maintenance')}
              className="text-xs font-semibold text-red-300 underline whitespace-nowrap cursor-pointer"
            >
              Ver
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Analog Gauge + 2x2 Readouts + Fuel */}
          <div className={`lg:col-span-6 ${activeTab === 'cluster' ? 'block' : 'hidden lg:block'}`}>
            <AnalogCluster
              vehicle={vehicle}
              totalKm={totalKm}
              partialKm={partialKm}
              fuelPct={fuelPct}
              speedStats={drive.speedStats}
              mode={drive.mode}
              isNightMode={isNightMode}
              isBubbleActive={bubble.isBubbleActive}
              bubbleError={bubble.bubbleError}
              gpsError={drive.gpsError}
              onStartGPS={drive.startGPS}
              onStopTracking={drive.stopTracking}
              onToggleBubble={bubble.isBubbleActive ? bubble.closeBubble : bubble.openBubble}
              onResetPartial={() => setPartialKm(0)}
              onResetMinMax={drive.resetMinMax}
              onOpenEditTotal={() => setIsEditOdoOpen(true)}
              onSetFuelFull={() => setFuelPct(100)}
              onChangeFuelPct={setFuelPct}
            />
          </div>

          {/* Right Column: Oil & Filter, Music, Google Drive, App Install */}
          <div className="lg:col-span-6 space-y-5">
            <div className={activeTab === 'maintenance' ? 'block' : 'hidden lg:block'}>
              <MaintenancePanel
                currentKm={totalKm}
                items={maintenance}
                soundAlertsEnabled={soundAlertsEnabled}
                onToggleSoundAlerts={() => setSoundAlertsEnabled((s) => !s)}
                onMarkDoneToday={handleMarkDoneToday}
                onUpdateLastService={handleUpdateLastService}
                onAddItem={handleAddMaintenance}
                onDeleteItem={handleDeleteMaintenance}
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

            <div className={activeTab === 'drive' ? 'block' : 'hidden lg:block'}>
              <GoogleDriveBackupPanel
                userEmail={userEmail}
                onChangeEmail={setUserEmail}
                buildBackupPayload={buildBackupPayload}
                onRestoreBackup={handleRestoreBackup}
              />
            </div>

            <div className={activeTab === 'drive' ? 'block' : 'hidden lg:block'}>
              <MobileAppStoreCard />
            </div>
          </div>
        </div>
      </main>

      {/* Slide-out Mobile Navigation Drawer (from the blue circular ☰ button) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-black/75 backdrop-blur-sm lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
        >
          <div className="w-72 max-w-[85vw] h-full bg-[#0A0B0E] border-r border-white/[0.1] p-5 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold text-white">OdoSync</span>
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
