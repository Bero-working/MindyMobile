import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import { homeService } from './home.service';

const id = (n: number) =>
  `11111111-1111-4111-8111-${String(n).padStart(12, '0')}`;
const course = {
  id: id(1),
  code: 'WEB',
  title: 'Web',
  description: null,
  imgUrl: null,
  priceAmount: 0,
  category: { id: id(2), name: 'Coding', slug: 'coding' },
};
const page = <T>(items: T[], current = 1, total = items.length) => ({
  items,
  page: current,
  pageSize: 100,
  total,
});
const event = {
  sessionId: id(4),
  classId: id(3),
  classCode: 'WEB-A',
  className: 'Web',
  sessionTitle: 'HTML',
  sessionStatus: 'SCHEDULED',
  classStatus: 'OPEN',
  startsAt: '2026-10-18T08:00:00+07:00',
  endsAt: '2026-10-18T09:00:00+07:00',
  accessMode: 'CASH_PREVIEW',
};
const range = { from: '2026-10-17T00:00:00Z', to: '2026-10-24T00:00:00Z' };
const schedulePage = (items = [event], current = 1, total = items.length) => ({
  ...page(items, current, total),
  ...range,
  asOf: '2026-10-17T08:00:00+07:00',
  timeZone: 'Asia/Ho_Chi_Minh',
});
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('requests four catalog courses, preserves null covers and zero price, and tolerates failed class metadata', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/courses', ({ request }) => {
      expect(new URL(request.url).searchParams.get('pageSize')).toBe('4');
      return HttpResponse.json({ ...page([course]), pageSize: 4 });
    }),
    http.get(
      TEST_API_URL + '/courses/:id/classes',
      () => new HttpResponse(null, { status: 503 })
    )
  );
  await expect(homeService.courses()).resolves.toEqual([course]);
});
it('reads every class page and chooses the earliest OPEN class metadata', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/courses', () =>
      HttpResponse.json({ ...page([course]), pageSize: 4 })
    ),
    http.get(TEST_API_URL + '/courses/:id/classes', ({ request }) => {
      const p = Number(new URL(request.url).searchParams.get('page'));
      return HttpResponse.json({
        ...page(
          [
            {
              id: id(p),
              startDate: p === 1 ? '2026-12-01' : '2026-11-01',
              deliveryMode: 'ONLINE',
            },
          ],
          p,
          2
        ),
        pageSize: 1,
      });
    })
  );
  expect((await homeService.courses())[0]?.openClass?.startDate).toBe(
    '2026-11-01'
  );
});
it('reads all schedule pages, excludes canceled/past/in-progress/makeup events and breaks ties by session id using server asOf', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/schedule', ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('includeCancelled')).toBe('false');
      const p = Number(params.get('page'));
      return HttpResponse.json(
        schedulePage(
          p === 1
            ? [
                { ...event, sessionId: id(10), sessionStatus: 'CANCELLED' },
                { ...event, sessionId: id(11), classStatus: 'CANCELLED' },
                { ...event, sessionId: id(12), sessionStatus: 'IN_PROGRESS' },
                {
                  ...event,
                  sessionId: id(13),
                  startsAt: '2026-10-17T00:00:00Z',
                },
                { ...event, sessionId: id(14), accessMode: 'SESSION_MAKEUP' },
                { ...event, sessionId: id(9) },
              ]
            : [event],
          p,
          7
        )
      );
    })
  );
  const result = await homeService.schedule(range);
  expect(result.session).toMatchObject({
    sessionId: event.sessionId,
    className: 'WEB-A',
    accessMode: 'CASH_PREVIEW',
  });
  expect(result.timeZone).toBe('Asia/Ho_Chi_Minh');
});
it('returns a genuine empty schedule and rejects invalid timezones and malformed DTOs', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/schedule', () =>
      HttpResponse.json(schedulePage([]))
    )
  );
  expect((await homeService.schedule(range)).session).toBeNull();
  mockServer.use(
    http.get(TEST_API_URL + '/me/schedule', () =>
      HttpResponse.json({ ...schedulePage(), timeZone: 'Invalid/Zone' })
    )
  );
  await expect(homeService.schedule(range)).rejects.toMatchObject({
    code: 'INVALID_HOME_RESPONSE',
  });
  mockServer.use(
    http.get(TEST_API_URL + '/courses', () =>
      HttpResponse.json({
        ...page([{ ...course, priceAmount: -1 }]),
        pageSize: 4,
      })
    )
  );
  await expect(homeService.courses()).rejects.toMatchObject({
    code: 'INVALID_HOME_RESPONSE',
  });
});
it('rejects ranges over 31 days and dates without timezone offsets before any request', async () => {
  await expect(
    homeService.schedule({ ...range, to: '2026-12-24T00:00:00Z' })
  ).rejects.toMatchObject({ code: 'INVALID_SCHEDULE_RANGE' });
  await expect(
    homeService.schedule({ ...range, from: '2026-10-17T00:00:00' })
  ).rejects.toMatchObject({ code: 'INVALID_SCHEDULE_RANGE' });
});
it('rejects a truncated pagination response rather than declaring no upcoming session', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/schedule', () =>
      HttpResponse.json(schedulePage([], 1, 1))
    )
  );
  await expect(homeService.schedule(range)).rejects.toMatchObject({
    code: 'INVALID_HOME_RESPONSE',
  });
});
