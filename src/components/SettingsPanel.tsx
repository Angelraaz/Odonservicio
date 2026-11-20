import React from 'react';
import {
  Minimize2,
  Moon,
  PictureInPicture2,
  Settings,
  Smartphone,
  Sun,
} from 'lucide-react';
import type { ThemePreference } from '../hooks/useNightTheme';

interface SettingsPanelProps {
  forceLandscape: boolean;
  onToggleForceLandscape: () => void;
  isBubbleActive: boolean;
  bubbleError: string | null;
  onToggleBubble: () => void;
  themePreference: ThemePreference;
  isNightMode: boolean;
  onChangeThemePreference: (pref: ThemePreference) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  forceLandscape,
  onToggleForceLandscape,
  isBubbleActive,
  bubbleError,
  onToggleBubble,
  themePreference,
  isNightMode,
  onChangeThemePreference,
}) => {
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
            Ajusta la orientación horizontal, burbuja flotante y brillo nocturno.
          </p>
        </div>
        <Settings className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
      </div>

      {/* Modo Celular de Lado (Horizontal) */}
      <div className="rounded-xl bg-[#000000] border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#F3F4F6]">
              Pantalla de lado (Horizontal)
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Fuerza la aplicación a girar horizontalmente para colocar el celular acostado en el tablero, aunque tengas bloqueada la rotación del teléfono.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleForceLandscape}
          className={`w-full min-h-[48px] px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            forceLandscape
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
            {forceLandscape ? 'Volver a pantalla vertical' : 'Activar celular de lado'}
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
            Convierte el contador en una ventana flotante compacta con velocidad, odómetro y combustible mientras usas otras apps como mapas.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleBubble}
          className={`w-full min-h-[48px] px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
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
              Oscurece el fondo (#050505) automáticamente de 19:00 a 06:59 según la hora local.
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
              { id: 'day', label: 'Día (#000)' },
              { id: 'night', label: 'Noche (#050505)' },
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
