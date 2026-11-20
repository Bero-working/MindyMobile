import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL } from '../../../tests/mocks/constants';
import { boardSync, boardSessionId } from '../../../tests/fixtures/whiteboard';
import { whiteboardService } from './service';
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
const context = () => ({
  ...boardSync(),
  context: {
    sessionId: boardSessionId,
    sessionTitle: 'Session',
    classId: boardSessionId,
    className: 'Class',
    sessionStatus: 'IN_PROGRESS',
  },
});
it('reads the student context without creating a board and accepts no board yet', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/class-sessions/:id/whiteboard`, () =>
      HttpResponse.json({ ...context(), board: null })
    )
  );
  expect((await whiteboardService.context(boardSessionId)).board).toBeNull();
});
it('rejects a board returned for another session', async () => {
  const data = context();
  mockServer.use(
    http.get(`${TEST_API_URL}/class-sessions/:id/whiteboard`, () =>
      HttpResponse.json({
        ...data,
        board: {
          ...data.board,
          sessionId: '44444444-4444-4444-8444-444444444444',
        },
      })
    )
  );
  await expect(whiteboardService.context(boardSessionId)).rejects.toThrow(
    'session mismatch'
  );
});
it('gets a fresh memory-only ticket using the configured Origin and whiteboards channel', async () => {
  let count = 0;
  mockServer.use(
    http.post(`${TEST_API_URL}/auth/realtime-ticket`, async ({ request }) => {
      expect(request.headers.get('origin')).toBe('https://mobile.mindy.test');
      expect(await request.json()).toEqual({ channel: 'whiteboards' });
      return HttpResponse.json({
        ticket: `ticket-${++count}`,
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      });
    })
  );
  expect(await whiteboardService.ticket()).toBe('ticket-1');
  expect(await whiteboardService.ticket()).toBe('ticket-2');
});
it('propagates denied access instead of treating it as an empty board', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/class-sessions/:id/whiteboard`, () =>
      HttpResponse.json(
        {
          statusCode: 403,
          code: 'BOARD_FULL_ACCESS_REQUIRED',
          message: 'Denied',
        },
        { status: 403 }
      )
    )
  );
  await expect(whiteboardService.context(boardSessionId)).rejects.toMatchObject(
    { status: 403 }
  );
});
