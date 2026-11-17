import React, { useRef } from 'react';
import {
  Bluetooth,
  FolderPlus,
  Music2,
  Pause,
  Play,
  Radio,
  RefreshCw,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
} from 'lucide-react';
import type { AudioOutputDevice, AudioTrack } from '../types/vehicle';

interface BluetoothAudioPlayerProps {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  durationSec: number;
  volume: number;
  bluetoothConnected: boolean;
  carStereoName: string;
  outputDevices: AudioOutputDevice[];
  selectedSinkId: string;
  onToggleBluetooth: () => void;
  onRefreshOutputs: () => void;
  onChangeOutput: (deviceId: string, label: string) => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectTrack: (idx: number) => void;
  onRemoveTrack: (id: string) => void;
  onSeek: (sec: number) => void;
  onChangeVolume: (vol: number) => void;
  onAddFiles: (files: FileList | null) => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const BluetoothAudioPlayer: React.FC<BluetoothAudioPlayerProps> = ({
  tracks,
  currentTrack,
  currentIndex,
  isPlaying,
  currentTime,
  durationSec,
  volume,
  bluetoothConnected,
  carStereoName,
  outputDevices,
  selectedSinkId,
  onToggleBluetooth,
  onRefreshOutputs,
  onChangeOutput,
  onTogglePlay,
  onNext,
  onPrev,
  onSelectTrack,
  onRemoveTrack,
  onSeek,
  onChangeVolume,
  onAddFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const maxDuration = Math.max(durationSec, 1);

  return (
    <section
      aria-label="Música Bluetooth para el carro"
      className="rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] p-5 space-y-4 transition-colors duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#F3F4F6]">Música</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Carga tu música y envíala por Bluetooth al estéreo del carro
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleBluetooth}
          className={`min-h-[40px] px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            bluetoothConnected
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-[#111318] border-white/10 text-[#9CA3AF] hover:text-white'
          }`}
        >
          <Bluetooth className="w-4 h-4" />
          {bluetoothConnected ? 'Bluetooth Activo' : 'Conectar Audio'}
        </button>
      </div>

      {/* Stereo Output Bar */}
      <div className="rounded-xl bg-[#000000] border border-white/[0.07] p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Radio className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-[#F3F4F6] font-medium truncate">{carStereoName}</span>
          </div>
          <button
            type="button"
            onClick={onRefreshOutputs}
            aria-label="Actualizar salidas Bluetooth"
            className="min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {outputDevices.length > 0 && (
          <select
            aria-label="Salida de audio"
            value={selectedSinkId}
            onChange={(e) => {
              const found = outputDevices.find((d) => d.deviceId === e.target.value);
              onChangeOutput(e.target.value, found?.label || 'Radio Bluetooth');
            }}
            className="w-full min-h-[40px] px-3 rounded-xl bg-[#111318] border border-white/10 text-xs text-[#F3F4F6]"
          >
            {outputDevices.map((dev) => (
              <option key={dev.deviceId} value={dev.deviceId}>
                {dev.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {!currentTrack ? (
        <div className="rounded-xl bg-[#000000] border border-white/[0.07] p-6 text-center space-y-3">
          <Music2 className="w-8 h-8 text-[#9CA3AF] mx-auto" />
          <p className="text-xs text-[#9CA3AF]">
            Aún no hay canciones cargadas. Selecciona archivos MP3 o audio desde tu teléfono.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-4 rounded-xl bg-white text-[#000000] hover:bg-gray-200 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            Cargar música del teléfono
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#000000] border border-white/[0.07] p-3.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isPlaying && (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                )}
                <h3 className="text-sm font-semibold text-[#F3F4F6] truncate">
                  {currentTrack.title}
                </h3>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">{currentTrack.artist}</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[40px] px-3 rounded-xl bg-[#111318] hover:bg-[#1B1F27] border border-white/10 text-xs text-[#F3F4F6] flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              Añadir
            </button>
          </div>

          {/* Progress Scrubber */}
          <div className="space-y-1">
            <input
              type="range"
              aria-label="Progreso de canción"
              min={0}
              max={maxDuration}
              value={Math.min(currentTime, maxDuration)}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer h-5"
            />
            <div className="flex justify-between text-[11px] font-mono-tabular text-[#9CA3AF]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(durationSec)}</span>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Canción anterior"
              className="min-h-[46px] min-w-[46px] rounded-2xl bg-[#111318] hover:bg-[#1B1F27] flex items-center justify-center text-white cursor-pointer"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
              className="min-h-[52px] min-w-[52px] rounded-2xl bg-white hover:bg-gray-200 flex items-center justify-center text-[#000000] cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              aria-label="Siguiente canción"
              className="min-h-[46px] min-w-[46px] rounded-2xl bg-[#111318] hover:bg-[#1B1F27] flex items-center justify-center text-white cursor-pointer"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            <input
              type="range"
              aria-label="Volumen"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => onChangeVolume(Number(e.target.value))}
              className="flex-1 accent-red-500 cursor-pointer h-5"
            />
            <span className="font-mono-tabular text-xs text-[#9CA3AF] w-9 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* User Track Queue */}
          <div className="max-h-40 overflow-y-auto divide-y divide-white/[0.06] rounded-xl bg-[#000000] border border-white/[0.06]">
            {tracks.map((track, idx) => {
              const active = idx === currentIndex;
              return (
                <div
                  key={track.id}
                  className={`px-3 py-2 flex items-center justify-between gap-2 ${
                    active ? 'bg-white/[0.06]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectTrack(idx)}
                    className="flex-1 min-w-0 text-left min-h-[36px] cursor-pointer"
                  >
                    <div
                      className={`text-xs font-medium truncate ${
                        active ? 'text-red-400' : 'text-[#F3F4F6]'
                      }`}
                    >
                      {track.title}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveTrack(track.id)}
                    aria-label={`Quitar ${track.title}`}
                    className="min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => onAddFiles(e.target.files)}
      />
    </section>
  );
};
