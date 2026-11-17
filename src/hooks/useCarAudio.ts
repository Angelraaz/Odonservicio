import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioOutputDevice, AudioTrack } from '../types/vehicle';

export function useCarAudio() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [bluetoothConnected, setBluetoothConnected] = useState<boolean>(true);
  const [carStereoName, setCarStereoName] = useState<string>('Bluetooth del Vehículo');
  const [outputDevices, setOutputDevices] = useState<AudioOutputDevice[]>([]);
  const [selectedSinkId, setSelectedSinkId] = useState<string>('default');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = tracks[currentIndex] || null;

  const refreshAudioOutputs = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outputs = devices
        .filter((d) => d.kind === 'audiooutput')
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || (idx === 0 ? 'Salida Bluetooth / Altavoces' : `Salida Audio ${idx + 1}`),
        }));
      setOutputDevices(outputs);
    } catch {
      // Ignore permission constraints silently
    }
  }, []);

  useEffect(() => {
    refreshAudioOutputs();
  }, [refreshAudioOutputs]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(Math.floor(audio.currentTime));
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDurationSec(Math.floor(audio.duration));
      }
    };
    const handleEnded = () => {
      setTracks((prev) => {
        if (prev.length === 0) return prev;
        setCurrentIndex((idx) => (idx + 1) % prev.length);
        return prev;
      });
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      if (audio) audio.pause();
      return;
    }

    if (audio.src !== currentTrack.url) {
      audio.src = currentTrack.url;
    }

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album,
    });
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (tracks.length === 0) return;
      setCurrentTime(0);
      setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (tracks.length === 0) return;
      setCurrentTime(0);
      setCurrentIndex((prev) => (prev + 1) % tracks.length);
    });
  }, [currentTrack, isPlaying, tracks.length]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((p) => !p);
  }, [currentTrack]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTime(0);
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  }, [tracks.length]);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTime(0);
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  const selectTrack = useCallback((index: number) => {
    setCurrentIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  }, []);

  const addLocalFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const added: AudioTrack[] = Array.from(fileList).map((file, i) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      return {
        id: `local-${Date.now()}-${i}`,
        title: cleanName,
        artist: 'Teléfono',
        album: 'Bluetooth Audio',
        durationSec: 0,
        url: URL.createObjectURL(file),
      };
    });

    setTracks((prev) => [...prev, ...added]);
    setCurrentIndex((prevIdx) => (tracks.length === 0 ? 0 : prevIdx));
    setCurrentTime(0);
    setIsPlaying(true);
  }, [tracks.length]);

  const removeTrack = useCallback((id: string) => {
    setTracks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        setIsPlaying(false);
        setCurrentIndex(0);
        setCurrentTime(0);
        setDurationSec(0);
      } else {
        setCurrentIndex((idx) => Math.min(idx, next.length - 1));
      }
      return next;
    });
  }, []);

  const changeAudioOutput = useCallback(async (deviceId: string, label: string) => {
    setSelectedSinkId(deviceId);
    setCarStereoName(label);
    const audio = audioRef.current as (HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> }) | null;
    if (audio && typeof audio.setSinkId === 'function') {
      try {
        await audio.setSinkId(deviceId);
      } catch {
        // Fallback gracefully
      }
    }
  }, []);

  return {
    tracks,
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    durationSec,
    volume,
    setVolume,
    bluetoothConnected,
    setBluetoothConnected,
    carStereoName,
    outputDevices,
    selectedSinkId,
    refreshAudioOutputs,
    changeAudioOutput,
    togglePlay,
    nextTrack,
    prevTrack,
    selectTrack,
    seekTo,
    addLocalFiles,
    removeTrack,
  };
}
