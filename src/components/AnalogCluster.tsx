import React from 'react';
import { Fuel, Navigation, Square } from 'lucide-react';
import type {
  DriveMode,
  MaintenanceItem,
  MaintenanceKind,
  SpeedStats,
  VehicleProfile,
} from '../types/vehicle';
import { BrandEmblem } from './BrandEmblems';
import { TelltaleIcon } from './TelltaleIcons';

interface AnalogClusterProps {
  vehicle: VehicleProfile;
  totalKm: number;
  partialKm: number;
  fuelPct: number;
  speedStats: SpeedStats;
  mode: DriveMode;
  isNightMode: boolean;
  gpsError: string | null;
  forceLandscape: boolean;
  dueMaintenance: MaintenanceItem[];
  onClickTelltale: () => void;
  onStartGPS: () => void;
  onStopTracking: () => void;
}

function formatEs(val: number, decimals: number): string {
  return val.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function shortTelltaleLabel(kind: MaintenanceKind, title: string): string {
  switch (kind) {
    case 'aceite':
      return 'Aceite';
    case 'filtro_aceite':
      return 'F. Aceite';
    case 'bujias':
      return 'Bujías';
    case 'correa_alternador':
      return 'Correa';
    case 'cauchos':
      return 'Cauchos';
    case 'filtro_gasolina':
      return 'Gasolina';
    default:
      return title.slice(0, 10);
  }
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
  forceLandscape,
  dueMaintenance,
  onClickTelltale,
  onStartGPS,
  onStopTracking,
}) => {
  // 0 to 240 km/h sweep: -135 deg to +135 deg
  const clampedSpeed = Math.min(240, Math.max(0, speedStats.currentKmh));
  const speedAngle = -135 + (clampedSpeed / 240) * 270;

  // Fuel gauge sweep: -52 deg (E) to +52 deg (F)
  const clampedFuel = Math.min(100, Math.max(0, fuelPct));
  const fuelAngle = -52 + (clampedFuel / 100) * 104;
  const isLowFuel = clampedFuel <= 15;
  const litersRemaining = ((clampedFuel / 100) * vehicle.tankCapacityLiters).toFixed(1);

  const majorSpeedTicks = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240];

  // Classic 6-digit center mechanical/digital window inside the speedometer face
  const centerDigits = Math.floor(Math.max(0, totalKm))
    .toString()
    .padStart(6, '0')
    .slice(-6)
    .split('');

  const dialBg = isNightMode ? '#050505' : '#000000';
  const dialRing = isNightMode ? '#1B1D24' : '#2A2E37';
  const dialMajorTick = isNightMode ? '#B8BEC8' : '#FFFFFF';
  const dialText = isNightMode ? '#C7CCD4' : '#F3F4F6';
  const needleColor = isNightMode ? '#D92626' : '#FF1E1E';
  const drumBg = isNightMode ? '#0B0C0F' : '#101217';
  const drumBorder = isNightMode ? '#22252D' : '#323743';

  return (
    <section
      aria-label="Tablero análogo principal"
      className="bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-300"
    >
      {/* Responsive Vertical (Portrait) & Horizontal (Landscape) Smartphone Grid */}
      <div
        className={
          forceLandscape
            ? 'grid grid-cols-12 gap-3 items-start'
            : 'grid grid-cols-1 landscape:grid-cols-12 lg:landscape:grid-cols-1 gap-4 landscape:gap-3 items-start'
        }
      >
        {/* Dial Column — anchored cleanly at the top in landscape */}
        <div
          className={
            forceLandscape
              ? 'col-span-6 flex flex-col items-center justify-start'
              : 'landscape:col-span-6 lg:landscape:col-span-1 flex flex-col items-center justify-start'
          }
        >
          <div
            className={
              forceLandscape
                ? 'relative w-[272px] h-[272px] sm:w-72 sm:h-72'
                : 'relative w-72 h-72 sm:w-80 sm:h-80 landscape:w-[272px] landscape:h-[272px] lg:landscape:w-80 lg:landscape:h-80'
            }
          >
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

              {/* Fine, medium, and major ticks (0 to 240 every 2 km/h) */}
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

              {/* Classic 90s Center Digital/Mechanical Drum Window above Pivot */}
              <g>
                <rect
                  x="86"
                  y="98"
                  width="108"
                  height="22"
                  rx="3"
                  fill={drumBg}
                  stroke={drumBorder}
                  strokeWidth="1.2"
                />
                {centerDigits.map((digit, idx) => {
                  const boxX = 88 + idx * 17.3;
                  return (
                    <g key={idx}>
                      <rect
                        x={boxX}
                        y="100"
                        width="16"
                        height="18"
                        rx="1.5"
                        fill="#050608"
                        stroke="#232732"
                        strokeWidth="0.7"
                      />
                      <text
                        x={boxX + 8}
                        y="113"
                        textAnchor="middle"
                        fill={dialText}
                        fontSize="12"
                        fontWeight="700"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {digit}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Subtle classic mounting screws below pivot like vintage dials */}
              <circle cx="114" cy="166" r="2.2" fill="#2A2E37" />
              <circle cx="166" cy="166" r="2.2" fill="#2A2E37" />

              <text
                x="140"
                y="176"
                textAnchor="middle"
                fill={dialText}
                fontSize="11.5"
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

            {/* Automotive Telltale Warning Lamps inside the dial */}
            {dueMaintenance.length > 0 && (
              <button
                type="button"
                onClick={onClickTelltale}
                title="Testigo encendido: toca para ver en Pulso Mecánico"
                aria-label="Testigos de mantenimiento encendidos en el tablero"
                className="absolute bottom-[22%] left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/80 border border-white/10 hover:border-amber-400/50 cursor-pointer"
              >
                {dueMaintenance.slice(0, 4).map((item) => {
                  const isOverdue =
                    item.lastServiceKm !== null &&
                    item.lastServiceKm + item.intervalKm - totalKm <= 0;
                  return (
                    <span
                      key={item.id}
                      className={`flex flex-col items-center ${
                        isOverdue ? 'text-red-500 animate-pulse' : 'text-amber-400'
                      }`}
                    >
                      <TelltaleIcon kind={item.kind} className="w-4 h-4" />
                      <span className="text-[7px] font-semibold leading-none tracking-tight">
                        {shortTelltaleLabel(item.kind, item.title)}
                      </span>
                    </span>
                  );
                })}
              </button>
            )}

            {/* Compact Iniciar / Detener GPS Button nested inside the bottom arc of the analog dial */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 ${
                dueMaintenance.length > 0 ? 'bottom-[5.5%]' : 'bottom-[10%]'
              }`}
            >
              {mode === 'idle' ? (
                <button
                  type="button"
                  onClick={onStartGPS}
                  className="h-7 sm:h-8 landscape:h-7 px-3.5 rounded-full bg-blue-600/95 hover:bg-blue-500 border border-blue-400/40 text-white text-[11px] font-semibold tracking-wide flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md transition-all active:scale-95"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Iniciar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onStopTracking}
                  className="h-7 sm:h-8 landscape:h-7 px-3.5 rounded-full bg-[#12151C]/95 hover:bg-red-500/25 border border-red-500/40 text-red-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md transition-all active:scale-95"
                >
                  <Square className="w-2.5 h-2.5 fill-red-400 text-red-400" />
                  <span>Detener</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-[var(--text-secondary)] -mt-1 flex items-center gap-2">
            <BrandEmblem brand={vehicle.brand} className="w-6 h-4 shrink-0" />
            {mode === 'gps' ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {formatEs(speedStats.currentKmh, 1)} km/h
              </span>
            ) : (
              <span>
                {vehicle.name} {vehicle.year}
                {vehicle.plate ? ` · ${vehicle.plate}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Right Column in Landscape / Below Dial in Portrait */}
        <div
          className={
            forceLandscape
              ? 'col-span-6 space-y-3 pt-1'
              : 'landscape:col-span-6 lg:landscape:col-span-1 space-y-4 landscape:space-y-3 landscape:pt-1 lg:landscape:pt-0'
          }
        >
          {/* Clean 2x2 Readout Grid (only numbers, calibration moved to Configuración) */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 max-w-md mx-auto text-center">
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Velocidad mínima</div>
              <div className="font-mono-tabular text-2xl sm:text-3xl landscape:text-xl lg:landscape:text-3xl font-bold text-[var(--text-primary)]">
                {speedStats.minMovingKmh !== null ? formatEs(speedStats.minMovingKmh, 1) : '0,0'}
                <span className="text-sm font-normal text-[var(--text-secondary)] ml-1">km/h</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Velocidad máxima</div>
              <div className="font-mono-tabular text-2xl sm:text-3xl landscape:text-xl lg:landscape:text-3xl font-bold text-[var(--text-primary)]">
                {formatEs(speedStats.maxKmh, 1)}
                <span className="text-sm font-normal text-[var(--text-secondary)] ml-1">km/h</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Odómetro parcial</div>
              <div className="font-mono-tabular text-2xl sm:text-3xl landscape:text-xl lg:landscape:text-3xl font-bold text-[var(--text-primary)]">
                {formatEs(partialKm, 2)}
                <span className="text-sm font-normal text-[var(--text-secondary)] ml-1">km</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Odómetro total</div>
              <div className="font-mono-tabular text-2xl sm:text-3xl landscape:text-xl lg:landscape:text-3xl font-bold text-[var(--text-primary)]">
                {formatEs(totalKm, 1)}
                <span className="text-sm font-normal text-[var(--text-secondary)] ml-1">km</span>
              </div>
            </div>
          </div>

          {/* Pure Analog Fuel Display (FULL button & slider moved to Configuración) */}
          <div className="max-w-md mx-auto rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] px-4 py-3 transition-colors duration-300">
            <div className="flex items-center justify-between gap-4">
              <svg viewBox="0 0 160 95" className="w-28 h-16 shrink-0">
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

              <div className="flex-1 text-right space-y-1">
                <div className="flex items-center justify-end gap-1.5">
                  <Fuel className={`w-4 h-4 ${isLowFuel ? 'text-red-500' : 'text-[var(--text-primary)]'}`} />
                  <span className="text-xs font-semibold text-[var(--text-primary)]">Combustible</span>
                </div>
                <div
                  className={`font-mono-tabular text-lg font-bold ${
                    isLowFuel ? 'text-red-400' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {Math.round(clampedFuel)}% · {litersRemaining} L
                </div>
                <div
                  className={`text-[11px] font-mono-tabular ${
                    isLowFuel ? 'text-red-400 font-medium' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {isLowFuel
                    ? 'Reserva baja · Llena en Configuración'
                    : `${vehicle.kmPerLiter} km/L · ~${Math.round(
                        (clampedFuel / 100) * vehicle.tankCapacityLiters * vehicle.kmPerLiter
                      )} km rest.`}
                </div>
              </div>
            </div>
          </div>

          {gpsError && (
            <div
              role="alert"
              className="max-w-md mx-auto rounded-xl bg-red-500/10 border border-red-500/25 px-3.5 py-2 text-xs text-red-300 text-center"
            >
              {gpsError}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
