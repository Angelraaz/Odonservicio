import React from 'react';
import {
  Fuel,
  Navigation,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Square,
} from 'lucide-react';
import type { DriveMode, SpeedStats, VehicleProfile } from '../types/vehicle';

interface AnalogClusterProps {
  vehicle: VehicleProfile;
  totalKm: number;
  partialKm: number;
  fuelPct: number;
  speedStats: SpeedStats;
  mode: DriveMode;
  isNightMode: boolean;
  gpsError: string | null;
  testTargetKmh: number;
  onChangeTestTarget: (kmh: number) => void;
  onStartGPS: () => void;
  onStartRoadTest: () => void;
  onStopTracking: () => void;
  onResetPartial: () => void;
  onResetMinMax: () => void;
  onOpenEditTotal: () => void;
  onSetFuelFull: () => void;
  onChangeFuelPct: (pct: number) => void;
}

function formatEs(val: number, decimals: number): string {
  return val.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export const AnalogCluster: React.FC<AnalogClusterProps> = ({
  vehicle,
  totalKm,
  partialKm,
  fuelPct,
  speedStats,
  mode,
  isNightMode,
  gpsError,
  testTargetKmh,
  onChangeTestTarget,
  onStartGPS,
  onStartRoadTest,
  onStopTracking,
  onResetPartial,
  onResetMinMax,
  onOpenEditTotal,
  onSetFuelFull,
  onChangeFuelPct,
}) => {
  // 0 to 240 km/h sweep: -135 deg to +135 deg (matches classic round analog cluster)
  const clampedSpeed = Math.min(240, Math.max(0, speedStats.currentKmh));
  const speedAngle = -135 + (clampedSpeed / 240) * 270;

  // Fuel gauge sweep: -52 deg (E) to +52 deg (F)
  const clampedFuel = Math.min(100, Math.max(0, fuelPct));
  const fuelAngle = -52 + (clampedFuel / 100) * 104;
  const isLowFuel = clampedFuel <= 15;
  const litersRemaining = ((clampedFuel / 100) * vehicle.tankCapacityLiters).toFixed(1);

  const majorSpeedTicks = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240];

  const dialBg = isNightMode ? '#050505' : '#000000';
  const dialRing = isNightMode ? '#1B1D24' : '#2A2E37';
  const dialMajorTick = isNightMode ? '#B8BEC8' : '#FFFFFF';
  const dialText = isNightMode ? '#C7CCD4' : '#F3F4F6';
  const needleColor = isNightMode ? '#D92626' : '#FF1E1E';

  return (
    <section
      aria-label="Tablero análogo principal"
      className="bg-[var(--bg-canvas)] text-[var(--text-primary)] space-y-6 transition-colors duration-300"
    >
      {/* Classic Pure-Black Analog Speedometer Dial */}
      <div className="flex flex-col items-center justify-center pt-1">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          <svg viewBox="0 0 280 280" className="w-full h-full">
            {/* Outer subtle bezel ring */}
            <circle
              cx="140"
              cy="140"
              r="130"
              fill={dialBg}
              stroke={dialRing}
              strokeWidth="1.5"
            />

            {/* Fine, medium, and major ticks (0 to 240 every 2 km/h = 121 ticks) */}
            {Array.from({ length: 121 }).map((_, idx) => {
              const val = idx * 2;
              const deg = -135 + (val / 240) * 270;
              const rad = ((deg - 90) * Math.PI) / 180;
              const isMajor = val % 20 === 0;
              const isMedium = !isMajor && val % 10 === 0;

              const rOuter = 126;
              const rInner = isMajor ? 111 : isMedium ? 115 : 119;

              const x1 = 140 + rInner * Math.cos(rad);
              const y1 = 140 + rInner * Math.sin(rad);
              const x2 = 140 + rOuter * Math.cos(rad);
              const y2 = 140 + rOuter * Math.sin(rad);

              return (
                <line
                  key={val}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? dialMajorTick : isMedium ? '#9CA3AF' : '#525866'}
                  strokeWidth={isMajor ? 2.6 : isMedium ? 1.5 : 0.9}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Numbers 0 .. 240 */}
            {majorSpeedTicks.map((val) => {
              const deg = -135 + (val / 240) * 270;
              const rad = ((deg - 90) * Math.PI) / 180;
              const rText = 91;
              const x = 140 + rText * Math.cos(rad);
              const y = 140 + rText * Math.sin(rad) + 5;
              return (
                <text
                  key={val}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill={dialText}
                  fontSize="14.5"
                  fontWeight="500"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {val}
                </text>
              );
            })}

            <text
              x="140"
              y="186"
              textAnchor="middle"
              fill={dialText}
              fontSize="13"
              fontWeight="500"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              km/h
            </text>

            {/* Bold Red Analog Needle */}
            <g
              transform={`rotate(${speedAngle} 140 140)`}
              style={{ transition: 'transform 160ms ease-out' }}
            >
              <polygon points="136.5,146 143.5,146 141.5,24 138.5,24" fill={needleColor} />
              <circle cx="140" cy="140" r="12" fill={needleColor} />
            </g>
          </svg>
        </div>

        {/* Live GPS / Test Status Line */}
        <div className="text-xs text-[var(--text-secondary)] -mt-2 flex items-center gap-2">
          {mode === 'gps' && (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              GPS Activo · {formatEs(speedStats.currentKmh, 1)} km/h
            </span>
          )}
          {mode === 'road_test' && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Prueba · {formatEs(speedStats.currentKmh, 1)} km/h
            </span>
          )}
          {mode === 'idle' && (
            <span>
              {vehicle.name} {vehicle.year}
              {vehicle.plate ? ` · ${vehicle.plate}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* 2x2 Readout Grid Matching Reference Layout */}
      <div className="grid grid-cols-2 gap-y-6 gap-x-4 max-w-md mx-auto pt-2 text-center">
        {/* Top-Left: Velocidad mínima */}
        <div className="space-y-1">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Velocidad mínima</div>
          <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {speedStats.minMovingKmh !== null ? formatEs(speedStats.minMovingKmh, 1) : '0,0'}
            <span className="text-sm font-normal text-[var(--text-secondary)] ml-1">km/h</span>
          </div>
        </div>

        {/* Top-Right: Velocidad máxima */}
        <div className="space-y-1">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Velocidad máxima</div>
          <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {formatEs(speedStats.maxKmh, 1)}
            <span className="text-sm font-normal text-[var(--text-secondary)] ml-1">km/h</span>
          </div>
          {(speedStats.maxKmh > 0 || speedStats.minMovingKmh !== null) && (
            <button
              type="button"
              onClick={onResetMinMax}
              className="text-[11px] text-[var(--text-secondary)] hover:text-white underline cursor-pointer"
            >
              Reiniciar máx/mín
            </button>
          )}
        </div>

        {/* Bottom-Left: Odómetro parcial */}
        <div className="space-y-1.5">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Odómetro parcial</div>
          <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {formatEs(partialKm, 2)}
            <span className="text-sm font-normal text-[var(--text-secondary)] ml-1">km</span>
          </div>
          <button
            type="button"
            onClick={onResetPartial}
            className="inline-flex items-center gap-1 min-h-[36px] px-3 rounded-lg bg-[var(--bg-elevated)] hover:bg-[#1B1F27] border border-white/10 text-xs text-[#D1D5DB] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Poner a cero
          </button>
        </div>

        {/* Bottom-Right: Odómetro total */}
        <div className="space-y-1.5">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Odómetro total</div>
          <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {formatEs(totalKm, 1)}
            <span className="text-sm font-normal text-[var(--text-secondary)] ml-1">km</span>
          </div>
          <button
            type="button"
            onClick={onOpenEditTotal}
            className="inline-flex items-center gap-1 min-h-[36px] px-3 rounded-lg bg-[var(--bg-elevated)] hover:bg-[#1B1F27] border border-white/10 text-xs text-[#D1D5DB] cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            Modificar total
          </button>
        </div>
      </div>

      {/* Analog Fuel Gauge + FULL Control */}
      <div className="max-w-md mx-auto rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] p-4 space-y-3 transition-colors duration-300">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Fuel className={`w-4 h-4 ${isLowFuel ? 'text-red-500' : 'text-[var(--text-primary)]'}`} />
            <span className="text-xs font-semibold text-[var(--text-primary)]">Combustible</span>
          </div>
          <span
            className={`font-mono-tabular text-xs font-semibold ${
              isLowFuel ? 'text-red-400' : 'text-[var(--text-secondary)]'
            }`}
          >
            {Math.round(clampedFuel)}% · {litersRemaining} L
          </span>
        </div>

        <div className="flex items-center gap-4">
          <svg viewBox="0 0 160 95" className="w-36 h-20 shrink-0">
            <path
              d="M 20 80 A 60 60 0 0 1 140 80"
              fill="none"
              stroke={dialRing}
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 20 80 A 60 60 0 0 1 38 40"
              fill="none"
              stroke={needleColor}
              strokeWidth="7"
              strokeLinecap="round"
            />
            <text x="14" y="92" fill="#FCA5A5" fontSize="11" fontWeight="700">
              E
            </text>
            <text x="72" y="16" fill="#9CA3AF" fontSize="10" fontWeight="600">
              1/2
            </text>
            <text x="139" y="92" fill={dialText} fontSize="11" fontWeight="700">
              F
            </text>

            <g
              transform={`rotate(${fuelAngle} 80 82)`}
              style={{ transition: 'transform 200ms ease-out' }}
            >
              <polygon points="78.5,82 81.5,82 80.5,24 79.5,24" fill={needleColor} />
              <circle cx="80" cy="82" r="6.5" fill={needleColor} />
            </g>
          </svg>

          <div className="flex-1 space-y-2">
            <button
              type="button"
              onClick={onSetFuelFull}
              className={`w-full min-h-[40px] rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                isNightMode
                  ? 'bg-[#D1D5DB] text-[#050505] hover:bg-white'
                  : 'bg-white text-[#000000] hover:bg-gray-200'
              }`}
            >
              Tanque FULL (100%)
            </button>
            <input
              type="range"
              aria-label="Nivel manual de combustible"
              min={0}
              max={100}
              step={1}
              value={Math.round(clampedFuel)}
              onChange={(e) => onChangeFuelPct(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer h-5"
            />
          </div>
        </div>

        {isLowFuel && (
          <div className="text-xs font-medium text-red-400">
            Reserva baja · Toca llenar gasolina
          </div>
        )}
      </div>

      {/* GPS & Test Controls */}
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center gap-2.5">
          {mode === 'idle' ? (
            <>
              <button
                type="button"
                onClick={onStartGPS}
                className="flex-1 min-h-[46px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                Activar GPS
              </button>
              <button
                type="button"
                onClick={onStartRoadTest}
                className="min-h-[46px] px-4 rounded-xl bg-[#111318] hover:bg-[#1B1F27] border border-white/10 text-[#E5E7EB] text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 text-red-500" />
                Probar aguja
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStopTracking}
              className="w-full min-h-[46px] px-4 rounded-xl bg-[#111318] hover:bg-red-500/20 border border-white/15 hover:border-red-500/40 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              Detener medición
            </button>
          )}
        </div>

        {mode === 'road_test' && (
          <div className="rounded-xl bg-[#0A0B0E] border border-white/[0.08] px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9CA3AF]">Velocidad de prueba</span>
              <span className="font-mono-tabular font-semibold text-white">
                {testTargetKmh} km/h
              </span>
            </div>
            <input
              type="range"
              aria-label="Velocidad de prueba"
              min={0}
              max={200}
              step={2}
              value={testTargetKmh}
              onChange={(e) => onChangeTestTarget(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer h-5"
            />
          </div>
        )}

        {gpsError && (
          <div
            role="alert"
            className="rounded-xl bg-red-500/10 border border-red-500/25 px-3.5 py-2.5 text-xs text-red-300"
          >
            {gpsError}
          </div>
        )}
      </div>
    </section>
  );
};
