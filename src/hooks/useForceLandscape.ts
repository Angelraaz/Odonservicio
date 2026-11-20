import { useCallback, useEffect, useState } from 'react';

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
};

export function useForceLandscape() {
  const [forceLandscape, setForceLandscape] = useState(false);
  const [isPortraitViewport, setIsPortraitViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );

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

  const enableLandscape = useCallback(async () => {
    setForceLandscape(true);
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
    setForceLandscape(false);
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
    if (forceLandscape) {
      disableLandscape();
    } else {
      void enableLandscape();
    }
  }, [disableLandscape, enableLandscape, forceLandscape]);

  // If user is on a portrait-locked device/browser, rotate container 90deg so placing the phone sideways reads naturally
  const needsCssRotation = forceLandscape && isPortraitViewport;

  return {
    forceLandscape,
    needsCssRotation,
    toggleForceLandscape,
  };
}
