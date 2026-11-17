import { useEffect, useState } from 'react';

export type ThemePreference = 'auto' | 'night' | 'day';

const THEME_STORAGE_KEY = 'festiva93_theme_pref_v1';

function isLocalNightHour(date = new Date()): boolean {
  const hour = date.getHours();
  // Night driving window: 19:00 (7 PM) through 06:59 (6:59 AM)
  return hour >= 19 || hour < 7;
}

export function useNightTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'auto' || saved === 'night' || saved === 'day') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'auto';
  });

  const [autoNight, setAutoNight] = useState<boolean>(() => isLocalNightHour());

  useEffect(() => {
    const checkClock = () => {
      setAutoNight(isLocalNightHour());
    };
    checkClock();
    const timer = window.setInterval(checkClock, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // ignore storage errors
    }
  }, [preference]);

  const isNightMode =
    preference === 'night' ? true : preference === 'day' ? false : autoNight;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-drive-theme', isNightMode ? 'night' : 'day');

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isNightMode ? '#050505' : '#000000');
    }
  }, [isNightMode]);

  return {
    preference,
    setPreference,
    isNightMode,
    autoNight,
  };
}
