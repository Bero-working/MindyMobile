import '../../../tests/mocks/nativeUi';
import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL } from '../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../tests/utils/renderWithProviders';
import {
  attendanceClassId,
  attendanceHistory,
  attendanceItem,
  attendanceSummary,
} from '../../../tests/fixtures/attendance';
import { enrollmentDto, learningPage } from '../../../tests/fixtures/learning';
import { student } from '../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import { useAttendance, useAttendanceClasses } from './useAttendance';
import { attendanceRange, type AttendanceRange } from './attendance.service';

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() =>
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 1,
  })
);
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('lists all own enrollments including completed classes and deduplicates class IDs', async () => {
  let view = '';
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes', ({ request }) => {
      view = new URL(request.url).searchParams.get('view') ?? '';
      const row = {
        ...enrollmentDto(),
        enrollmentStatus: 'COMPLETED',
        accessMode: 'NONE',
        canViewClass: false,
      };
      return HttpResponse.json(
        learningPage([
          row,
          { ...row, enrollmentId: '22222222-2222-4222-8222-000000000555' },
        ])
      );
    })
  );
  const hook = renderHookWithProviders(() => useAttendanceClasses(true));
  await waitFor(() => expect(hook.result.current.classes.data).toHaveLength(1));
  expect(view).toBe('all');
  expect(hook.result.current.classes.data?.[0]?.enrollmentStatus).toBe(
    'COMPLETED'
  );
});

it('loads subsequent history pages without refetching the summary and separates range/session caches', async () => {
  let summaries = 0;
  let range: AttendanceRange = {};
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes/:id/attendance', ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page'));
      return HttpResponse.json({
        ...attendanceHistory([attendanceItem(page)], page, 2),
        pageSize: 1,
      });
    }),
    http.get(TEST_API_URL + '/me/classes/:id/attendance-summary', () => {
      summaries++;
      return HttpResponse.json(attendanceSummary());
    })
  );
  const hook = renderHookWithProviders(() =>
    useAttendance(attendanceClassId, range, true)
  );
  await waitFor(() => expect(hook.result.current.summary.data?.rate).toBe(75));
  await waitFor(() => expect(hook.result.current.history.data).toHaveLength(1));
  act(() => hook.result.current.onLoadMore());
  await waitFor(() => expect(hook.result.current.history.data).toHaveLength(2));
  expect(hook.result.current.hasMore).toBe(false);
  expect(summaries).toBe(1);
  range = attendanceRange('30');
  hook.rerender({});
  expect(hook.result.current.history.data).toBeNull();
  expect(hook.result.current.summary.data).toBeNull();
  await waitFor(() => expect(hook.result.current.history.data).toHaveLength(1));
  act(() => useStore.setState({ generation: 2 }));
  expect(hook.result.current.history.data).toBeNull();
  expect(hook.result.current.summary.data).toBeNull();
});

it('keeps successful history when summary alone fails', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes/:id/attendance', () =>
      HttpResponse.json(attendanceHistory())
    ),
    http.get(TEST_API_URL + '/me/classes/:id/attendance-summary', () =>
      HttpResponse.json(
        {
          statusCode: 503,
          code: 'UNAVAILABLE',
          message: 'Unavailable',
          requestId: 'summary-failure',
        },
        { status: 503 }
      )
    )
  );
  const hook = renderHookWithProviders(() =>
    useAttendance(attendanceClassId, {}, true)
  );
  await waitFor(() => expect(hook.result.current.history.data).toHaveLength(1));
  await waitFor(() =>
    expect(hook.result.current.summary.error?.requestId).toBe('summary-failure')
  );
  expect(hook.result.current.summary.data).toBeNull();
});

it('clears old history after access is denied on refresh', async () => {
  let denied = false;
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes/:id/attendance', () =>
      denied
        ? HttpResponse.json(
            { statusCode: 403, code: 'FORBIDDEN', message: 'Forbidden' },
            { status: 403 }
          )
        : HttpResponse.json(attendanceHistory())
    ),
    http.get(TEST_API_URL + '/me/classes/:id/attendance-summary', () =>
      HttpResponse.json(attendanceSummary())
    )
  );
  const hook = renderHookWithProviders(() =>
    useAttendance(attendanceClassId, {}, true)
  );
  await waitFor(() => expect(hook.result.current.history.data).toHaveLength(1));
  denied = true;
  act(() => hook.result.current.onRefresh());
  await waitFor(() => expect(hook.result.current.history.status).toBe('error'));
  expect(hook.result.current.history.data).toBeNull();
  expect(hook.result.current.summary.data).toBeNull();
});
