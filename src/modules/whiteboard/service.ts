import { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import { env } from '@/config/env';
import { ApiError } from '@/shared/utilities/apiError';
import { contextSchema } from './schema';

const segment = (value: string) => z.string().uuid().parse(value);
export const whiteboardService = {
  async context(sessionId: string, signal?: AbortSignal) {
    const data = await apiInstances.service.get<object>(
      `class-sessions/${segment(sessionId)}/whiteboard`,
      signal ? { signal } : {}
    );
    const parsed = contextSchema.parse(data);
    if (
      parsed.context.sessionId !== sessionId ||
      (parsed.board && parsed.board.sessionId !== sessionId)
    )
      throw new Error('Whiteboard session mismatch');
    return parsed;
  },
  async ticket() {
    if (!env.APP_ORIGIN)
      throw new ApiError({
        statusCode: 0,
        code: 'APP_ORIGIN_REQUIRED',
        message: 'APP_ORIGIN is required for whiteboards',
      });
    const data = await apiInstances.service.post<
      object,
      { channel: 'whiteboards' }
    >(
      'auth/realtime-ticket',
      { channel: 'whiteboards' },
      { headers: { Origin: env.APP_ORIGIN } }
    );
    return z
      .object({ ticket: z.string().min(1), expiresAt: z.string().datetime() })
      .parse(data).ticket;
  },
  async asset(boardId: string, assetId: string) {
    const data = await apiInstances.service.post<object, object>(
      `whiteboards/${segment(boardId)}/assets/${segment(assetId)}/access`,
      {},
      { headers: { Origin: env.APP_ORIGIN } }
    );
    const parsed = z
      .object({ url: z.string().url(), expiresAt: z.string().datetime() })
      .parse(data);
    if (!/^https?:$/.test(new URL(parsed.url).protocol))
      throw new Error('Invalid asset URL');
    return parsed;
  },
};
