import { useCallback, useEffect, useRef, useState } from 'react';
import type { DriveMode, SpeedStats } from '../types/vehicle';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useAnalogDrive(
  onDistanceDeltaKm: (deltaKm: number) => void,
  initialSpeedStats?: SpeedStats
) {
  const [mode, setMode] = useState<DriveMode>('idle');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [speedStats, setSpeedStats] = useState<SpeedStats>(
    initialSpeedStats || {
      currentKmh: 0,
      maxKmh: 0,
      minMovingKmh: null,
    }
  );

  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ lat: number; lon: number; time: number } | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  const onDistanceRef = useRef(onDistanceDeltaKm);
  onDistanceRef.current = onDistanceDeltaKm;

  const updateSpeedRecord = useCallback((kmh: number) => {
    const clean = Math.max(0, Math.min(240, Math.round(kmh * 10) / 10));
    setSpeedStats((prev) => ({
      currentKmh: clean,
      maxKmh: clean > prev.maxKmh ? clean : prev.maxKmh,
      minMovingKmh:
        clean >= 1
          ? prev.minMovingKmh === null
            ? clean
            : Math.min(prev.minMovingKmh, clean)
          : prev.minMovingKmh,
    }));
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    try {
      const nav = navigator as unknown as {
        wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
      };
      if (nav.wakeLock) {
        wakeLockRef.current = await nav.wakeLock.request('screen');
      }
    } catch {
      // Ignore if wakeLock is unsupported or blocked
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    lastPosRef.current = null;
    releaseWakeLock();
    setMode('idle');
    setGpsError(null);
    setSpeedStats((prev) => ({ ...prev, currentKmh: 0 }));
  }, [releaseWakeLock]);

  const startGPS = useCallback(() => {
    setGpsError(null);
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGpsError('Este teléfono no tiene GPS disponible en el navegador.');
      return;
    }
    stopTracking();
    setMode('gps');
    requestWakeLock();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = pos.timestamp || Date.now();
        const { latitude, longitude, speed } = pos.coords;

        let kmh = typeof speed === 'number' && !Number.isNaN(speed) ? speed * 3.6 : 0;

        if (lastPosRef.current) {
          const distKm = haversineKm(
            lastPosRef.current.lat,
            lastPosRef.current.lon,
            latitude,
            longitude
          );
          const dtHours = Math.max((now - lastPosRef.current.time) / 3600000, 0.0001);

          if (distKm >= 0.004 && distKm < 2) {
            onDistanceRef.current(distKm);
            if (kmh === 0) {
              kmh = distKm / dtHours;
            }
            lastPosRef.current = { lat: latitude, lon: longitude, time: now };
          }
        } else {
          lastPosRef.current = { lat: latitude, lon: longitude, time: now };
        }

        updateSpeedRecord(kmh);
      },
      (err) => {
        setGpsError(
          err.code === 1
            ? 'Permiso de ubicación denegado. Activa el GPS para medir velocidad y kilómetros.'
            : 'Buscando señal GPS...'
        );
        if (err.code === 1) {
          releaseWakeLock();
          setMode('idle');
        }
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  }, [releaseWakeLock, requestWakeLock, stopTracking, updateSpeedRecord]);

  // Re-acquire WakeLock when returning to foreground while GPS is active
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && mode === 'gps') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [mode, requestWakeLock]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  const resetMinMax = useCallback(() => {
    setSpeedStats((prev) => ({
      currentKmh: prev.currentKmh,
      maxKmh: 0,
      minMovingKmh: null,
    }));
  }, []);

  const restoreSpeedStats = useCallback((stats: SpeedStats) => {
    setSpeedStats({
      currentKmh: 0,
      maxKmh: stats.maxKmh || 0,
      minMovingKmh: stats.minMovingKmh ?? null,
    });
  }, []);

  return {
    mode,
    gpsError,
    speedStats,
    startGPS,
    stopTracking,
    resetMinMax,
    restoreSpeedStats,
  };
}
