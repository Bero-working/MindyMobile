import { motion } from './motion';
it('uses the shared motion values', () => {
  expect(motion).toMatchObject({
    duration: { fast: 150, base: 250, slow: 350 },
    pressScale: 0.97,
    staggerMs: 40,
    staggerLimit: 8,
  });
  expect(typeof motion.easing).toBe('function');
});
