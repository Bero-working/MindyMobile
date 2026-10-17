import '../../../../tests/mocks/nativeUi';
import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../../tests/utils/renderWithProviders';
import { useStore } from '@/state/store';
import { useHomeQuery } from './useHomeQuery';
import type { SessionUser } from '@/modules/auth/schemas/authResponse.schema';
const user: SessionUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'student@example.test',
  displayName: 'An',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: '2026-10-01T00:00:00Z',
};
const course = {
  id: user.id,
  code: 'WEB',
  title: 'Web',
  description: null,
  imgUrl: null,
  priceAmount: 0,
  category: { id: user.id, name: 'Coding', slug: 'coding' },
};
const catalog = (items = [course]) =>
  HttpResponse.json({ items, page: 1, pageSize: 4, total: items.length });
const schedule = (request: Request) => {
  const query = new URL(request.url).searchParams;
  const from = query.get('from');
  const to = query.get('to');
  expect(Date.parse(to ?? '') - Date.parse(from ?? '')).toBe(7 * 86400000);
  return HttpResponse.json({
    items: [],
    page: 1,
    pageSize: 100,
    total: 0,
    from,
    to,
    asOf: '2026-10-17T08:00:00Z',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() =>
  useStore.setState({
    sessionUser: user,
    bootstrapStatus: 'ready',
    generation: 1,
    hasSessionHistory: true,
  })
);
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
it('keeps region errors independent and retries only the requested region', async () => {
  let scheduleCount = 0;
  mockServer.use(
    http.get(
      TEST_API_URL + '/courses',
      () => new HttpResponse(null, { status: 503 })
    ),
    http.get(TEST_API_URL + '/courses/:id/classes', () =>
      HttpResponse.json({ items: [], page: 1, pageSize: 100, total: 0 })
    ),
    http.get(TEST_API_URL + '/me/schedule', ({ request }) => {
      scheduleCount++;
      return schedule(request);
    })
  );
  const view = renderHookWithProviders(() => useHomeQuery());
  await waitFor(() => expect(view.result.current.courses.status).toBe('error'));
  expect(view.result.current.schedule.status).toBe('success');
  expect(view.result.current.schedule.data).toBeNull();
  mockServer.use(http.get(TEST_API_URL + '/courses', () => catalog()));
  await act(async () => {
    view.result.current.courses.onRetry?.();
  });
  await waitFor(() =>
    expect(view.result.current.courses.data?.[0]?.priceAmount).toBe(0)
  );
  expect(scheduleCount).toBe(1);
});
it('does not fetch Student data for staff or unverified users', async () => {
  useStore.setState({ sessionUser: { ...user, role: 'MANAGER' } });
  const view = renderHookWithProviders(() => useHomeQuery());
  expect(view.result.current.courses.data).toBeNull();
  expect(view.result.current.schedule.data).toBeNull();
  act(() => useStore.setState({ sessionUser: null }));
  expect(view.result.current.schedule.data).toBeNull();
});
it('never presents the prior user cache while a new user request is pending', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/courses', () => catalog()),
    http.get(TEST_API_URL + '/courses/:id/classes', () =>
      HttpResponse.json({ items: [], page: 1, pageSize: 100, total: 0 })
    ),
    http.get(TEST_API_URL + '/me/schedule', ({ request }) => schedule(request))
  );
  const view = renderHookWithProviders(() => useHomeQuery());
  await waitFor(() =>
    expect(view.result.current.courses.status).toBe('success')
  );
  act(() =>
    useStore.setState({
      sessionUser: { ...user, id: '22222222-2222-4222-8222-222222222222' },
      generation: 2,
    })
  );
  expect(view.result.current.courses.status).toBe('loading');
  expect(view.result.current.courses.data).toBeNull();
  await waitFor(() =>
    expect(view.result.current.courses.status).toBe('success')
  );
});
