import { useState, useEffect } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

export function useDarkMode(siteDefault?: ThemePreference) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem('theme-pref') as ThemePreference | null;
    // If user has never chosen, fall back to site default (once it's loaded)
    return stored ?? siteDefault ?? 'system';
  });

  // When the site default arrives from settings (async), apply it if user hasn't set their own pref
  useEffect(() => {
    if (!siteDefault) return;
    const stored = localStorage.getItem('theme-pref');
    if (!stored) {
      setPreferenceState(siteDefault);
    }
  }, [siteDefault]);

  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute('data-theme', resolveTheme(preference));
    };

    apply();
    localStorage.setItem('theme-pref', preference);

    if (preference === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [preference]);

  const setPreference = (pref: ThemePreference) => {
    localStorage.setItem('theme-pref', pref);
    setPreferenceState(pref);
  };

  return { preference, setPreference };
}
