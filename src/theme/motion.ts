// src/theme/motion.ts
import { Easing } from 'react-native-reanimated';

export const motion = {
  duration: { fast: 150, base: 250, slow: 350 },
  easing: Easing.out(Easing.cubic),
  pressScale: 0.97,
  staggerMs: 40,
  staggerLimit: 8,
} as const;
