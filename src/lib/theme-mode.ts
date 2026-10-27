import { useCallback, useSyncExternalStore } from 'react';

export type Mode = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function read(): Mode {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/**
 * The initial mode is applied by the inline script in index.html (saved choice, else the OS
 * preference) so the page never flashes the wrong palette. This hook only reads and flips it.
 */
export function useThemeMode() {
  const mode = useSyncExternalStore(subscribe, read, () => 'dark' as Mode);

  const toggle = useCallback(() => {
    const next: Mode = read() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private windows); the choice just won't persist.
    }
  }, []);

  return { mode, toggle };
}
