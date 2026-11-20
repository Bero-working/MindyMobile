import { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import { env } from '@/config/env';
import { ApiError } from '@/shared/utilities/apiError';
import {
  conversation,
  message,
  messageEvent,
  pageOf,
  fileAccess,
  type ChatMessage,
} from './schema';
import { messageProblem } from './model';

const path = (id: string) =>
  `chat/conversations/${z.string().uuid().parse(id)}`;
const api = apiInstances.service;
const headers = () => {
  if (!env.APP_ORIGIN)
    throw new ApiError({
      statusCode: 0,
      code: 'APP_ORIGIN_REQUIRED',
      message: 'APP_ORIGIN is required for chat',
    });
  return { Origin: env.APP_ORIGIN };
};
export const chatService = {
  async conversations(cursor?: string, signal?: AbortSignal) {
    return pageOf(conversation).parse(
      await api.get<object>('chat/conversations', {
        params: { limit: 20, ...(cursor ? { cursor } : {}) },
        ...(signal ? { signal } : {}),
      })
    );
  },
  async conversation(id: string, signal?: AbortSignal) {
    const result = conversation.parse(
      await api.get<object>(path(id), signal ? { signal } : {})
    );
    if (result.id !== id) throw new Error('Conversation mismatch');
    return result;
  },
  async history(id: string, cursor?: string, signal?: AbortSignal) {
    const result = pageOf(message).parse(
      await api.get<object>(`${path(id)}/messages`, {
        params: { limit: 50, ...(cursor ? { cursor } : {}) },
        ...(signal ? { signal } : {}),
      })
    );
    if (result.data.some((row) => row.conversationId !== id))
      throw new Error('Conversation mismatch');
    return result;
  },
  async catchUp(id: string, afterSequence: string, signal?: AbortSignal) {
    const messages: ChatMessage[] = [];
    let cursor: string | null = null;
    const seen = new Set<string>();
    for (;;) {
      const result = pageOf(messageEvent).parse(
        await api.get<object>(`${path(id)}/events`, {
          params: cursor
            ? { limit: 100, cursor }
            : { limit: 100, afterSequence },
          ...(signal ? { signal } : {}),
        })
      );
      for (const event of result.data) {
        if (
          (event.conversationId && event.conversationId !== id) ||
          (event.message && event.message.conversationId !== id)
        )
          throw new Error('Conversation mismatch');
        if (event.message) messages.push(event.message);
      }
      if (!result.meta.hasMore)
        return {
          messages,
          through: result.meta.throughSequence ?? afterSequence,
        };
      cursor = result.meta.nextCursor;
      if (!cursor || seen.has(cursor))
        throw new Error('Invalid chat pagination');
      seen.add(cursor);
    }
  },
  async ticket() {
    const result = await api.post<object, { channel: 'chat' }>(
      'auth/realtime-ticket',
      { channel: 'chat' },
      { headers: headers() }
    );
    return z
      .object({ ticket: z.string().min(1), expiresAt: z.string().datetime() })
      .parse(result).ticket;
  },
  async send(id: string, clientMessageId: string, body: string) {
    if (messageProblem(body)) throw new Error('Invalid message');
    const result = z
      .object({ message, replayed: z.boolean() })
      .parse(
        await api.post<object, object>(
          `${path(id)}/messages`,
          { clientMessageId, type: 'TEXT', body },
          { headers: headers() }
        )
      );
    if (
      result.message.conversationId !== id ||
      result.message.clientMessageId !== clientMessageId
    )
      throw new Error('Message mismatch');
    return result.message;
  },
  async markRead(id: string, throughSequence: string) {
    await api.put<object, object>(
      `${path(id)}/read`,
      { throughSequence },
      { headers: headers() }
    );
  },
  async fileUrl(conversationId: string, messageId: string) {
    const result = fileAccess.parse(
      await api.post<object, object>(
        `${path(conversationId)}/messages/${z.string().uuid().parse(messageId)}/file-access`,
        {},
        { headers: headers() }
      )
    );
    if (!/^https?:$/.test(new URL(result.url).protocol))
      throw new Error('Invalid file URL');
    return result.url;
  },
};
