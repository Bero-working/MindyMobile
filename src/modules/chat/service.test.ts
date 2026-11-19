import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL } from '../../../tests/mocks/constants';
import {
  chatId,
  chatMessage,
  chatConversation,
  chatPage,
  clientMessageId,
} from '../../../tests/fixtures/chat';
import { chatService } from './service';
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
it('loads student conversations and validates each history message belongs to that room', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/chat/conversations`, () =>
      HttpResponse.json(chatPage([chatConversation]))
    ),
    http.get(`${TEST_API_URL}/chat/conversations/:id/messages`, () =>
      HttpResponse.json(
        chatPage([{ ...chatMessage, conversationId: clientMessageId }])
      )
    )
  );
  expect((await chatService.conversations()).data[0]?.id).toBe(chatId);
  await expect(chatService.history(chatId)).rejects.toThrow(
    'Conversation mismatch'
  );
});
it('requests a fresh Origin-bound chat ticket, and preserves the message ID on HTTP retry', async () => {
  const ids: string[] = [];
  mockServer.use(
    http.post(`${TEST_API_URL}/auth/realtime-ticket`, async ({ request }) => {
      expect(await request.json()).toEqual({ channel: 'chat' });
      expect(request.headers.get('Origin')).toBe('https://mobile.mindy.test');
      return HttpResponse.json({
        ticket: 'chat-ticket',
        expiresAt: '2026-11-06T04:00:00Z',
      });
    }),
    http.post(
      `${TEST_API_URL}/chat/conversations/:id/messages`,
      async ({ request }) => {
        const body = (await request.json()) as { clientMessageId: string };
        ids.push(body.clientMessageId);
        expect(request.headers.get('Origin')).toBe('https://mobile.mindy.test');
        return HttpResponse.json({
          message: chatMessage,
          replayed: ids.length > 1,
        });
      }
    )
  );
  expect(await chatService.ticket()).toBe('chat-ticket');
  await chatService.send(chatId, clientMessageId, 'Chào thầy');
  await chatService.send(chatId, clientMessageId, 'Chào thầy');
  expect(ids).toEqual([clientMessageId, clientMessageId]);
});
it('catches up every event page before advancing its checkpoint', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/chat/conversations/:id/events`, ({ request }) => {
      const cursor = new URL(request.url).searchParams.get('cursor');
      return HttpResponse.json({
        data: [
          {
            eventId: clientMessageId,
            sequence: cursor ? '3' : '2',
            type: 'message:updated',
            message: { ...chatMessage, version: cursor ? 3 : 2 },
          },
        ],
        meta: {
          nextCursor: cursor ? null : 'next',
          hasMore: !cursor,
          ...(cursor ? { throughSequence: '3' } : {}),
        },
      });
    })
  );
  const result = await chatService.catchUp(chatId, '1');
  expect(result.messages).toHaveLength(2);
  expect(result.through).toBe('3');
});
