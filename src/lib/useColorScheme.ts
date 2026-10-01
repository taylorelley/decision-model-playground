import { useSyncExternalStore } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
const storageKey = 'decision-model-theme';
const query = '(prefers-color-scheme: dark)';
const listeners = new Set<() => void>();
let preference: ThemePreference = 'system';
let scheme: 'light' | 'dark' = 'light';

function validPreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}

function updateTheme() {
  scheme =
    preference === 'system' ? (window.matchMedia?.(query).matches ? 'dark' : 'light') : preference;
  document.documentElement.dataset.theme = scheme;
  listeners.forEach((listener) => listener());
}

export function initializeTheme() {
  try {
    preference = validPreference(localStorage.getItem(storageKey));
  } catch {
    // The toggle still works when browser storage is unavailable.
  }
  updateTheme();
  window.matchMedia?.(query).addEventListener('change', updateTheme);
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) {
      preference = validPreference(event.newValue);
      updateTheme();
    }
  });
}

export function setThemePreference(value: ThemePreference) {
  preference = value;
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    // Keep the preference for this session if storage is unavailable.
  }
  updateTheme();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useThemePreference() {
  return useSyncExternalStore(subscribe, () => preference);
}

export function useColorScheme(): 'light' | 'dark' {
  return useSyncExternalStore(subscribe, () => scheme);
}
