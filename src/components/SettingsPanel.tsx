import React from 'react';
import {
  Fuel,
  Gauge,
  Minimize2,
  Moon,
  PictureInPicture2,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Smartphone,
  Sun,
} from 'lucide-react';
import type { ThemePreference } from '../hooks/useNightTheme';
import type { SpeedStats, VehicleProfile } from '../types/vehicle';

interface SettingsPanelProps {
  vehicle: VehicleProfile;
  totalKm: number;
  partialKm: number;
  fuelPct: number;
  speedStats: SpeedStats;
  onResetPartial: () => void;
  onResetMinMax: () => void;
  onOpenEditTotal: () => void;
  onSetFuelFull: () => void;
  onChangeFuelPct: (pct: number) => void;
  forceLandscape: boolean;
  manualLandscape: boolean;
  autoTiltEnabled: boolean;
  onToggleAutoTilt: () => void;
  onToggleForceLandscape: () => void;
  isBubbleActive: boolean;
  bubbleError: string | null;
  onToggleBubble: () => void;
  themePreference: ThemePreference;
  isNightMode: boolean;
  onChangeThemePreference: (pref: ThemePreference) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  vehicle,
  totalKm,
  partialKm,
  fuelPct,
  speedStats,
  onResetPartial,
  onResetMinMax,
  onOpenEditTotal,
  onSetFuelFull,
  onChangeFuelPct,
  forceLandscape,
  manualLandscape,
  autoTiltEnabled,
  onToggleAutoTilt,
  onToggleForceLandscape,
  isBubbleActive,
  bubbleError,
  onToggleBubble,
  themePreference,
  isNightMode,
  onChangeThemePreference,
}) => {
  const clampedFuel = Math.min(100, Math.max(0, fuelPct));
  const litersRemaining = ((clampedFuel / 100) * vehicle.tankCapacityLiters).toFixed(1);

  return (
    <section
      aria-label="Configuración"
      className="rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] p-5 space-y-4 transition-colors duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#F3F4F6]">
            Configuración
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Ajustes de odómetro, combustible, pantalla de lado y burbuja flotante.
          </p>
        </div>
        <Settings className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
      </div>

      {/* Odómetro Parcial, Total y Velocidades */}
      <div className="rounded-xl bg-[#000000] border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-[#F3F4F6]">
            Odómetro y Velocidades
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onResetPartial}
            className="min-h-[44px] px-3.5 rounded-xl bg-[#111318] hover:bg-[#1B1F27] border border-white/10 text-xs font-semibold text-[#F3F4F6] flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              Poner parcial a cero
            </span>
            <span className="font-mono-tabular text-[#9CA3AF]">
              {partialKm.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenEditTotal}
            className="min-h-[44px] px-3.5 rounded-xl bg-[#111318] hover:bg-[#1B1F27] border border-white/10 text-xs font-semibold text-[#F3F4F6] flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              Editar odómetro total
            </span>
            <span className="font-mono-tabular text-[#9CA3AF]">
              {totalKm.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km
            </span>
          </button>
        </div>

        {(speedStats.maxKmh > 0 || speedStats.minMovingKmh !== null) && (
          <button
            type="button"
            onClick={onResetMinMax}
            className="w-full min-h-[40px] px-3.5 rounded-xl bg-[#111318] hover:bg-[#1B1F27] border border-white/10 text-xs font-medium text-[#D1D5DB] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>Reiniciar velocidad máx / mín</span>
          </button>
        )}
      </div>

      {/* Control de Combustible (Tanque FULL y Deslizador) */}
      <div className="rounded-xl bg-[#000000] border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-[#F3F4F6]">
              Nivel de Combustible
            </h3>
          </div>
          <span className="font-mono-tabular text-xs font-semibold text-[#D1D5DB]">
            {Math.round(clampedFuel)}% · {litersRemaining} L
          </span>
        </div>

        <input
          type="range"
          aria-label="Nivel manual de combustible"
          min={0}
          max={100}
          step={1}
          value={Math.round(clampedFuel)}
          onChange={(e) => onChangeFuelPct(Number(e.target.value))}
          className="w-full accent-red-500 cursor-pointer h-6"
        />

        <button
          type="button"
          onClick={onSetFuelFull}
          className="w-full min-h-[44px] rounded-xl bg-white hover:bg-gray-200 text-[#000000] text-xs font-bold cursor-pointer transition-colors"
        >
          Tanque FULL (100%)
        </button>
      </div>

      {/* Modo Celular de Lado (Automático por sensor + Manual) */}
      <div className="rounded-xl bg-[#000000] border border-white/[0.08] p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[#F3F4F6]">
            Pantalla de lado (Horizontal)
          </h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Gira automáticamente cuando inclinas el teléfono de lado usando el sensor, o actívalo manualmente.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleAutoTilt}
          className={`w-full min-h-[44px] px-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors ${
            autoTiltEnabled
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
              : 'bg-[#111318] border-white/10 text-[#9CA3AF]'
          }`}
        >
          <span>Giro automático al colocar de lado</span>
          <span>{autoTiltEnabled ? 'Activado' : 'Desactivado'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleForceLandscape}
          className={`w-full min-h-[46px] px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            manualLandscape || forceLandscape
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-[#111318] hover:bg-[#1B1F27] border-white/10 text-[#F3F4F6]'
          }`}
        >
          <Smartphone
            className={`w-4 h-4 transition-transform ${
              forceLandscape ? 'rotate-0 text-amber-300' : 'rotate-90 text-blue-400'
            }`}
          />
          <span>
            {manualLandscape ? 'Volver a pantalla vertical' : 'Forzar celular de lado ahora'}
          </span>
        </button>
      </div>

      {/* Burbuja Flotante al Minimizar */}
      <div className="rounded-xl bg-[#000000] border border-white/[0.08] p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[#F3F4F6]">
            Burbuja flotante al minimizar
          </h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Muestra velocidad, odómetro y combustible en una burbuja compacta mientras usas otras apps.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleBubble}
          className={`w-full min-h-[46px] px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            isBubbleActive
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-[#111318] hover:bg-[#1B1F27] border-white/10 text-[#F3F4F6]'
          }`}
        >
          {isBubbleActive ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span>Cerrar burbuja flotante</span>
            </>
          ) : (
            <>
              <PictureInPicture2 className="w-4 h-4 text-blue-400" />
              <span>Activar burbuja flotante</span>
            </>
          )}
        </button>

        {bubbleError && (
          <div
            role="status"
            className="rounded-xl bg-blue-500/10 border border-blue-500/25 px-3.5 py-2.5 text-xs text-blue-200"
          >
            {bubbleError}
          </div>
        )}
      </div>

      {/* Tema Nocturno Automático (#050505) */}
      <div className="rounded-xl bg-[#000000] border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#F3F4F6]">
              Modo nocturno de conducción
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Oscurece la pantalla automáticamente de 19:00 a 06:59 según la hora local.
            </p>
          </div>
          {isNightMode ? (
            <Moon className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#111318] border border-white/10">
          {(
            [
              { id: 'auto', label: 'Automático' },
              { id: 'day', label: 'Día' },
              { id: 'night', label: 'Noche' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeThemePreference(opt.id)}
              className={`min-h-[40px] px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                themePreference === opt.id
                  ? 'bg-blue-600 text-white'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
