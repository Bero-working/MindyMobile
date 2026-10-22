import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import {
  detailDto,
  enrollmentDto,
  learningId,
  learningPage,
  sessionDto,
} from '../../../../tests/fixtures/learning';
import { learningService } from './learning.service';
import { scheduleService } from '../../schedule/services/schedule.service';

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
it('loads a week with more than one hundred sessions', async () => {
  const range = {
    from: '2026-10-19T00:00:00+07:00',
    to: '2026-10-26T00:00:00+07:00',
  };
  mockServer.use(
    http.get(TEST_API_URL + '/me/schedule', ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page'));
      const rows =
        page === 1
          ? Array.from({ length: 100 }, (_, i) => sessionDto(i + 1))
          : [sessionDto(101)];
      return HttpResponse.json({
        ...learningPage(rows, page, 101),
        ...range,
        timeZone: 'Asia/Ho_Chi_Minh',
      });
    })
  );
  expect((await scheduleService.week(range)).items).toHaveLength(101);
});
it('paginates enrollments by enrollmentId and selects FULL ahead of historical NONE', async () => {
  const seen: string[] = [];
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes', ({ request }) => {
      const q = new URL(request.url).searchParams;
      seen.push(q.toString());
      const page = Number(q.get('page'));
      return HttpResponse.json(
        learningPage(
          [
            page === 1
              ? {
                  ...enrollmentDto(2),
                  accessMode: 'NONE',
                  accessReason: 'ENROLLMENT_COMPLETED',
                  enrollmentStatus: 'COMPLETED',
                  canViewClass: false,
                  canViewSchedule: false,
                }
              : enrollmentDto(),
          ],
          page,
          2,
          1
        )
      );
    }),
    http.get(TEST_API_URL + '/me/classes/:id', () =>
      HttpResponse.json(detailDto())
    )
  );
  const result = await learningService.verifiedDetail(learningId(200));
  expect(result.detail.accessMode).toBe('FULL');
  expect(result.enrollment?.enrollmentId).toBe(learningId(1));
  expect(seen).toHaveLength(2);
  expect(
    seen.every((s) => s.includes('view=all') && !s.includes('studentId'))
  ).toBe(true);
});
it('switches endpoint once after denial and strips all preview meeting URLs', async () => {
  let lists = 0,
    full = 0,
    preview = 0;
  const cash = {
    ...enrollmentDto(),
    enrollmentStatus: 'PENDING_PAYMENT',
    accessMode: 'CASH_PREVIEW',
    accessReason: 'PENDING_CASH',
    order: {
      orderId: learningId(600),
      orderCode: 'CASH',
      orderStatus: 'PENDING',
      paymentType: 'CASH',
      requiresReview: false,
      expiresAt: '2026-11-01T00:00:00Z',
      paidAt: null,
    },
  };
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes', () =>
      HttpResponse.json(learningPage([++lists === 1 ? enrollmentDto() : cash]))
    ),
    http.get(TEST_API_URL + '/me/classes/:id', () => {
      full++;
      return HttpResponse.json(
        { statusCode: 403, code: 'CLASS_ACCESS_DENIED', message: 'Denied' },
        { status: 403 }
      );
    }),
    http.get(TEST_API_URL + '/me/classes/:id/preview', () => {
      preview++;
      return HttpResponse.json({
        ...detailDto(),
        accessMode: 'CASH_PREVIEW',
        enrollmentStatus: 'PENDING_PAYMENT',
        orderId: learningId(600),
        orderCode: 'CASH',
        expiresAt: '2026-11-01T00:00:00Z',
      });
    })
  );
  const result = await learningService.verifiedDetail(learningId(200));
  expect(result.detail.accessMode).toBe('CASH_PREVIEW');
  expect(JSON.stringify(result.detail)).not.toContain('meetingUrl');
  expect([lists, full, preview]).toEqual([2, 1, 1]);
});
it('stops repeated denial without looping and does not use the public detail', async () => {
  let count = 0;
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes', () =>
      HttpResponse.json(learningPage([enrollmentDto()]))
    ),
    http.get(TEST_API_URL + '/me/classes/:id', () => {
      count++;
      return HttpResponse.json(
        { statusCode: 403, code: 'CLASS_ACCESS_DENIED', message: 'Denied' },
        { status: 403 }
      );
    })
  );
  await expect(
    learningService.verifiedDetail(learningId(200))
  ).rejects.toMatchObject({ status: 403, code: 'CLASS_ACCESS_DENIED' });
  expect(count).toBe(1);
});
it('loads every schedule page, deduplicates and orders by instant then ID', async () => {
  const range = {
    from: '2026-10-19T00:00:00+07:00',
    to: '2026-10-26T00:00:00+07:00',
  };
  mockServer.use(
    http.get(TEST_API_URL + '/me/schedule', ({ request }) => {
      const q = new URL(request.url).searchParams;
      expect(q.get('includeCancelled')).toBe('true');
      expect(q.get('pageSize')).toBe('100');
      expect(q.get('from')).toBe(range.from);
      const page = Number(q.get('page'));
      return HttpResponse.json({
        ...learningPage(
          page === 1 ? [sessionDto(2)] : [sessionDto(1), sessionDto(2)],
          page,
          3,
          100
        ),
        ...range,
        timeZone: 'Asia/Ho_Chi_Minh',
      });
    })
  );
  const result = await scheduleService.week(range);
  expect(result.items.map((s) => s.sessionId)).toEqual([
    learningId(301),
    learningId(302),
  ]);
});
it('fails an incomplete second page rather than returning a partial successful week', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/schedule', ({ request }) => {
      const q = new URL(request.url).searchParams;
      return q.get('page') === '1'
        ? HttpResponse.json({
            ...learningPage([sessionDto()], 1, 2),
            from: q.get('from'),
            to: q.get('to'),
            timeZone: 'Asia/Ho_Chi_Minh',
          })
        : HttpResponse.json(
            { statusCode: 503, code: 'UNAVAILABLE', message: 'Unavailable' },
            { status: 503 }
          );
    })
  );
  await expect(
    scheduleService.week({
      from: '2026-10-19T00:00:00+07:00',
      to: '2026-10-26T00:00:00+07:00',
    })
  ).rejects.toMatchObject({ code: 'UNAVAILABLE' });
});
