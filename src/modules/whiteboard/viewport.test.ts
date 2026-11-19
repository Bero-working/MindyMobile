import { fitShapes, shapeBounds } from './viewport';
import type { Shape } from './schema';

const webStroke: Shape = {
  id: '00000000-0000-4000-8000-000000000001',
  type: 'stroke',
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  color: '#1f3a33',
  points: [800, 200, 1500, 600],
};

it('uses stroke points (web strokes keep a 1x1 box at the origin)', () => {
  expect(shapeBounds([webStroke])).toEqual({
    left: 800,
    top: 200,
    right: 1500,
    bottom: 600,
  });
  expect(shapeBounds([])).toBeUndefined();
});

it('fits every shape into a phone-sized canvas', () => {
  const size = { width: 400, height: 600 };
  const view = fitShapes([webStroke], size, 0);
  expect(view).toBeDefined();
  if (!view) return;
  const right = view.x + size.width / view.zoom;
  const bottom = view.y + size.height / view.zoom;
  expect(view.x).toBeLessThanOrEqual(800);
  expect(view.y).toBeLessThanOrEqual(200);
  expect(right).toBeGreaterThanOrEqual(1500 - 1e-6);
  expect(bottom).toBeGreaterThanOrEqual(600 - 1e-6);
  expect(fitShapes([], size)).toBeUndefined();
});
