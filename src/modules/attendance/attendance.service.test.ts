import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL } from '../../../tests/mocks/constants';
import {
  attendanceClassId,
  attendanceHistory,
  attendanceSummary,
} from '../../../tests/fixtures/attendance';
import { attendanceRange, attendanceService } from './attendance.service';

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('reads paginated own history and uses the same paired range for the summary', async () => {
  const seen: URL[] = [];
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes/:id/attendance', ({ request }) => {
      seen.push(new URL(request.url));
      return HttpResponse.json(attendanceHistory([], 2));
    }),
    http.get(
      TEST_API_URL + '/me/classes/:id/attendance-summary',
      ({ request }) => {
        seen.push(new URL(request.url));
        return HttpResponse.json(attendanceSummary());
      }
    )
  );
  const range = attendanceRange('90', Date.parse('2026-11-06T00:00:00Z'));
  await attendanceService.history(attendanceClassId, 2, range);
  const summary = await attendanceService.summary(attendanceClassId, range);
  expect(summary.rate).toBe(75);
  expect(seen[0]?.searchParams.get('page')).toBe('2');
  expect(seen[0]?.searchParams.get('pageSize')).toBe('20');
  for (const url of seen) {
    expect(url.searchParams.get('from')).toBe(range.from);
    expect(url.searchParams.get('to')).toBe(range.to);
    expect(url.searchParams.has('studentId')).toBe(false);
  }
  expect(attendanceRange('ALL')).toEqual({});
});

it('accepts no finalized rate and a mentor with a null display name', async () => {
  const history = attendanceHistory();
  const first = history.items[0];
  if (!first?.effectiveMentor) throw new Error('Missing fixture mentor');
  first.effectiveMentor.displayName = null;
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes/:id/attendance', () =>
      HttpResponse.json(history)
    ),
    http.get(TEST_API_URL + '/me/classes/:id/attendance-summary', () =>
      HttpResponse.json({
        ...attendanceSummary(),
        rate: null,
        finalizedEligibleCount: 0,
      })
    )
  );
  expect(
    (await attendanceService.history(attendanceClassId, 1, {})).items[0]
      ?.effectiveMentor?.displayName
  ).toBeNull();
  expect(
    (await attendanceService.summary(attendanceClassId, {})).rate
  ).toBeNull();
});

it('rejects a different class, invalid timezone and malformed counts', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes/:id/attendance', () =>
      HttpResponse.json({ ...attendanceHistory(), timeZone: 'invalid' })
    )
  );
  await expect(
    attendanceService.history(attendanceClassId, 1, {})
  ).rejects.toMatchObject({ code: 'INVALID_ATTENDANCE_RESPONSE' });
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes/:id/attendance-summary', () =>
      HttpResponse.json({ ...attendanceSummary(), present: -1 })
    )
  );
  await expect(
    attendanceService.summary(attendanceClassId, {})
  ).rejects.toMatchObject({ code: 'INVALID_ATTENDANCE_RESPONSE' });
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes/:id/attendance-summary', () =>
      HttpResponse.json(attendanceSummary())
    )
  );
  await expect(
    attendanceService.summary('22222222-2222-4222-8222-000000000999', {})
  ).rejects.toMatchObject({ code: 'INVALID_ATTENDANCE_RESPONSE' });
});

it('preserves an unavailable history error and request ID', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes/:id/attendance', () =>
      HttpResponse.json(
        {
          statusCode: 404,
          code: 'ATTENDANCE_HISTORY_NOT_FOUND',
          message: 'Not found',
          requestId: 'attendance-req',
        },
        { status: 404 }
      )
    )
  );
  await expect(
    attendanceService.history(attendanceClassId, 1, {})
  ).rejects.toMatchObject({
    status: 404,
    code: 'ATTENDANCE_HISTORY_NOT_FOUND',
    requestId: 'attendance-req',
  });
});
