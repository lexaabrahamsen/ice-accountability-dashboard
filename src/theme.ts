import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

/**
 * Chakra's semantic colours point at the CSS custom properties in styles.css, which hold both
 * the dark and light palettes (switched by data-theme on <html>). One source of truth, so the
 * parts of the app outside Chakra (tables, charts, map) and Chakra's own components stay in step.
 */
const SPACE = `'Space Grotesk', 'Helvetica Neue', Arial, sans-serif`;
const COURIER = `'Courier Prime', 'Courier New', Courier, monospace`;

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: SPACE },
        body: { value: COURIER },
        mono: { value: COURIER },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: 'var(--surface-0)' },
        bgSubtle: { value: 'var(--surface-1)' },
        border: { value: 'var(--border)' },
        fg: { value: 'var(--text-primary)' },
        fgMuted: { value: 'var(--text-secondary)' },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
