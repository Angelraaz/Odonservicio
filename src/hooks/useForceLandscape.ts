import { useCallback, useEffect, useRef, useState } from 'react';

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
};

type DeviceMotionWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

const AUTO_TILT_KEY = 'festiva93_auto_tilt_v1';

export type RotationDirection = 'ccw' | 'cw';

export function useForceLandscape() {
  const [manualLandscape, setManualLandscape] = useState(false);
  const [autoTiltEnabled, setAutoTiltEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTO_TILT_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [sensorLandscape, setSensorLandscape] = useState(false);
  const [rotationDirection, setRotationDirection] = useState<RotationDirection>('ccw');
  const [isPortraitViewport, setIsPortraitViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );

  const pendingStateRef = useRef<{ landscape: boolean; dir: RotationDirection; since: number } | null>(
    null
  );

  useEffect(() => {
    try {
      localStorage.setItem(AUTO_TILT_KEY, String(autoTiltEnabled));
    } catch {
      // Ignore storage error
    }
  }, [autoTiltEnabled]);

  useEffect(() => {
    const updateOrientation = () => {
      setIsPortraitViewport(window.innerHeight > window.innerWidth);
    };
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  // Automatic physical tilt detection (works even when OS auto-rotate is turned off)
  useEffect(() => {
    if (!autoTiltEnabled || typeof window === 'undefined') {
      setSensorLandscape(false);
      return;
    }

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const ag = event.accelerationIncludingGravity;
      if (!ag || ag.x === null || ag.y === null) return;

      const rawX = ag.x;
      const ax = Math.abs(rawX);
      const ay = Math.abs(ag.y);
      const az = Math.abs(ag.z ?? 0);

      // Ignore if phone is lying nearly flat face-up/down
      if (ax + ay < 4.5 || az > 8.8) return;

      let targetLandscape: boolean | null = null;
      let targetDir: RotationDirection = rotationDirection;

      if (ax > ay + 2.6) {
        targetLandscape = true;
        targetDir = rawX >= 0 ? 'ccw' : 'cw';
      } else if (ay > ax + 2.6) {
        targetLandscape = false;
      }

      if (targetLandscape === null) {
        pendingStateRef.current = null;
        return;
      }

      const now = Date.now();
      if (
        !pendingStateRef.current ||
        pendingStateRef.current.landscape !== targetLandscape ||
        pendingStateRef.current.dir !== targetDir
      ) {
        pendingStateRef.current = { landscape: targetLandscape, dir: targetDir, since: now };
        return;
      }

      // Require 450ms steady tilt so road bumps don't flicker orientation
      if (now - pendingStateRef.current.since >= 450) {
        setSensorLandscape(targetLandscape);
        if (targetLandscape) {
          setRotationDirection(targetDir);
        }
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => window.removeEventListener('devicemotion', handleDeviceMotion);
  }, [autoTiltEnabled, rotationDirection]);

  const requestSensorAccess = useCallback(async () => {
    try {
      const dm = window.DeviceMotionEvent as DeviceMotionWithPermission | undefined;
      if (dm && typeof dm.requestPermission === 'function') {
        await dm.requestPermission().catch(() => {});
      }
    } catch {
      // Ignore on browsers that don't require explicit permission (Android/Desktop)
    }
  }, []);

  const enableLandscape = useCallback(async () => {
    setManualLandscape(true);
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen && !document.fullscreenElement) {
        await docEl.requestFullscreen().catch(() => {});
      }
      const orientation = window.screen.orientation as LockableOrientation | undefined;
      if (orientation?.lock) {
        await orientation.lock('landscape').catch(() => {});
      }
    } catch {
      // Fallback CSS 90deg horizontal rotation handles devices/browsers that block native lock
    }
  }, []);

  const disableLandscape = useCallback(() => {
    setManualLandscape(false);
    setSensorLandscape(false);
    try {
      const orientation = window.screen.orientation as LockableOrientation | undefined;
      if (orientation?.unlock) {
        orientation.unlock();
      }
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Ignore cleanup errors
    }
  }, []);

  const toggleForceLandscape = useCallback(() => {
    if (manualLandscape) {
      disableLandscape();
    } else {
      void enableLandscape();
    }
  }, [disableLandscape, enableLandscape, manualLandscape]);

  const forceLandscape = manualLandscape || (autoTiltEnabled && sensorLandscape);
  const needsCssRotation = forceLandscape && isPortraitViewport;

  return {
    forceLandscape,
    manualLandscape,
    autoTiltEnabled,
    setAutoTiltEnabled,
    needsCssRotation,
    rotationDirection,
    toggleForceLandscape,
    requestSensorAccess,
  };
}
