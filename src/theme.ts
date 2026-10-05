import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

/**
 * Values here are duplicated (not derived from) the CSS custom properties in styles.css,
 * which theme the parts of the app (tables, charts, map) that stay outside Chakra.
 * Keep the two in sync when changing the palette.
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
      colors: {
        surface: {
          0: { value: '#0a0a13' },
          1: { value: '#14141f' },
          2: { value: '#1b1b29' },
        },
        accent: {
          purple: { value: '#8951ff' },
          cyan: { value: '#21c3fc' },
          blue: { value: '#0e43fb' },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: '{colors.surface.0}' },
        bgSubtle: { value: '{colors.surface.1}' },
        border: { value: '#262637' },
        fg: { value: '#f5f5fa' },
        fgMuted: { value: '#a7a6be' },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
