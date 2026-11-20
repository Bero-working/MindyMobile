import { z } from 'zod';
import type { Shape } from './schema';

/**
 * Server event `board:viewport` (Mindy-BE dev): world top-left x/y, the mentor
 * canvas size in CSS pixels and its zoom. connectionId/identity are set by BE.
 */
export const presenterSchema = z.object({
  connectionId: z.string(),
  identity: z.object({ id: z.string().uuid(), name: z.string() }),
  epoch: z.string().uuid(),
  x: z.number().finite().min(-100000).max(100000),
  y: z.number().finite().min(-100000).max(100000),
  width: z.number().finite().min(1).max(16384),
  height: z.number().finite().min(1).max(16384),
  scale: z.number().finite().min(0.1).max(4),
});
export type Presenter = z.infer<typeof presenterSchema>;
/** Server event `board:awareness`: a peer's live world position, identity set by BE. */
export const cursorSchema = z.object({
  connectionId: z.string(),
  identity: z.object({ id: z.string().uuid(), name: z.string() }),
  x: z.number().finite().min(-100000).max(100000),
  y: z.number().finite().min(-100000).max(100000),
});
export type Cursor = z.infer<typeof cursorSchema>;
// Fit the mentor's entire field of view (world units) centred, without distortion.
export function fitPresenter(
  view: Pick<Presenter, 'x' | 'y' | 'width' | 'height' | 'scale'>,
  size: { width: number; height: number }
) {
  const worldWidth = view.width / view.scale;
  const worldHeight = view.height / view.scale;
  const zoom = Math.min(size.width / worldWidth, size.height / worldHeight);
  return {
    x: view.x + (worldWidth - size.width / zoom) / 2,
    y: view.y + (worldHeight - size.height / zoom) / 2,
    zoom,
  };
}

/** World-space bounds; strokes use their points (web stores x/y=0, width/height=1). */
export function shapeBounds(shapes: Shape[]) {
  let left = Infinity,
    top = Infinity,
    right = -Infinity,
    bottom = -Infinity;
  for (const s of shapes) {
    const points = s.type === 'stroke' ? (s.points ?? []) : [];
    const xs = points.length
      ? points.filter((_, i) => i % 2 === 0)
      : [0, s.width];
    const ys = points.length
      ? points.filter((_, i) => i % 2 === 1)
      : [0, s.height];
    left = Math.min(left, s.x + Math.min(...xs));
    top = Math.min(top, s.y + Math.min(...ys));
    right = Math.max(right, s.x + Math.max(...xs));
    bottom = Math.max(bottom, s.y + Math.max(...ys));
  }
  return Number.isFinite(left) ? { left, top, right, bottom } : undefined;
}

// Same idea as the web "fit content": show every shape with some padding.
export function fitShapes(
  shapes: Shape[],
  size: { width: number; height: number },
  padding = 24
) {
  const box = shapeBounds(shapes);
  if (!box) return undefined;
  const zoom = Math.min(
    2,
    Math.max(
      0.05,
      Math.min(
        Math.max(size.width - padding * 2, 1) /
          Math.max(box.right - box.left, 1),
        Math.max(size.height - padding * 2, 1) /
          Math.max(box.bottom - box.top, 1)
      )
    )
  );
  return {
    x: (box.left + box.right) / 2 - size.width / (2 * zoom),
    y: (box.top + box.bottom) / 2 - size.height / (2 * zoom),
    zoom,
  };
}
