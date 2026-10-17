/* eslint-disable @typescript-eslint/no-require-imports */

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.js', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        mint: token('mint'),
        forest: token('forest'),
        coral: token('coral'),
        headsup: token('headsup'),
        sunshine: token('sunshine'),
        'logo-soft': token('logo-soft'),
        black: token('black'),
        soft: token('soft'),
        line: token('line'),
        muted: {
          DEFAULT: token('muted'),
          foreground: token('muted-foreground'),
        },
        peach: token('peach'),
        action: {
          DEFAULT: token('action'),
          hover: token('action-hover'),
        },
        banner: token('banner'),
        'catalog-ink': token('catalog-ink'),
        status: {
          green: token('status-green'),
          yellow: token('status-yellow'),
          red: token('status-red'),
        },
        'pastel-red': token('pastel-red'),
        'ink-soft': token('ink-soft'),
        'ink-gray': token('ink-gray'),

        background: token('background'),
        foreground: token('foreground'),
        card: {
          DEFAULT: token('card'),
          foreground: token('card-foreground'),
        },
        popover: {
          DEFAULT: token('popover'),
          foreground: token('popover-foreground'),
        },
        primary: {
          DEFAULT: token('primary'),
          foreground: token('primary-foreground'),
        },
        secondary: {
          DEFAULT: token('secondary'),
          foreground: token('secondary-foreground'),
        },
        accent: {
          DEFAULT: token('accent'),
          foreground: token('accent-foreground'),
        },
        destructive: {
          DEFAULT: token('destructive'),
          foreground: token('destructive-foreground'),
        },
        border: token('border'),
        input: token('input'),
        ring: token('ring'),
        hero: {
          DEFAULT: token('hero'),
          ink: token('hero-ink'),
          copy: token('hero-copy'),
        },
        feature: token('feature'),
      },
      fontFamily: {
        nunito: ['Nunito-Regular'],
        'nunito-semibold': ['Nunito-SemiBold'],
        'nunito-bold': ['Nunito-Bold'],
        'nunito-extrabold': ['Nunito-ExtraBold'],
      },
    },
  },
  plugins: [],
};
