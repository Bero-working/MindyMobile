import '../../../../tests/mocks/nativeUi';
import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../../tests/utils/renderWithProviders';
import { useStore } from '@/state/store';
import type { SessionUser } from '@/modules/auth/schemas/authResponse.schema';
import { useCatalogQuery, type CatalogFilter } from './useCatalogQuery';

const id = (n: number) =>
  `22222222-2222-4222-8222-${String(n).padStart(12, '0')}`;
const user: SessionUser = {
  id: id(999),
  email: 'student@example.test',
  displayName: 'An',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: '2026-10-01T00:00:00Z',
};
const course = (n: number) => ({
  id: id(n),
  code: 'C' + n,
  title: 'Course ' + n,
  description: null,
  imgUrl: null,
  priceAmount: 1000000,
  category: { id: id(500), name: 'Web', slug: 'web' },
});
const requests: string[] = [];
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  requests.length = 0;
  useStore.setState({
    sessionUser: user,
    bootstrapStatus: 'ready',
    generation: 1,
    hasSessionHistory: true,
  });
  mockServer.use(
    http.get(TEST_API_URL + '/course-categories', () =>
      HttpResponse.json({
        items: [{ id: id(500), name: 'Web', isActive: true }],
        page: 1,
        pageSize: 50,
        total: 1,
      })
    ),
    http.get(TEST_API_URL + '/courses', ({ request }) => {
      const params = new URL(request.url).searchParams;
      requests.push(params.toString());
      const pageSize = Number(params.get('pageSize'));
      const current = Number(params.get('page'));
      const items = Array.from({ length: Math.min(pageSize, 6) }, (_, i) =>
        course(current * 10 + i)
      );
      return HttpResponse.json({
        items: params.get('categoryId') ? items.slice(0, 2) : items,
        page: current,
        pageSize,
        total: params.get('deliveryMode') ? 4 : 13,
      });
    }),
    http.get(TEST_API_URL + '/courses/:id/classes', ({ params }) =>
      params.id === id(10)
        ? HttpResponse.json({
            items: [
              {
                id: id(700),
                courseId: id(10),
                code: 'A',
                name: 'A',
                startDate: '2026-11-02',
                endDate: '2027-01-20',
                deliveryMode: 'ONLINE',
                maxStudents: 20,
                availableSeats: 3,
                mentor: { id: id(800), displayName: 'M' },
              },
            ],
            page: 1,
            pageSize: 100,
            total: 1,
          })
        : new HttpResponse(null, { status: 503 })
    )
  );
});
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

const render = (initial: CatalogFilter) => {
  let filter = initial;
  const view = renderHookWithProviders(() => useCatalogQuery(filter));
  return {
    view,
    set: (next: CatalogFilter) => {
      filter = next;
      view.rerender({});
    },
  };
};

it('loads categories, a page of courses, recommendations and next-class metadata', async () => {
  const { view } = render({ page: 1, categoryId: null });
  await waitFor(() =>
    expect(view.result.current.courses.status).toBe('success')
  );
  expect(view.result.current.categories.data).toEqual([
    { id: id(500), name: 'Web' },
  ]);
  expect(view.result.current.total).toBe(13);
  expect(view.result.current.recommendations.data?.map((c) => c.id)).toEqual([
    id(10),
    id(11),
    id(12),
  ]);
  await waitFor(() =>
    expect(view.result.current.courses.data?.[0]?.openClass).toEqual({
      startDate: '2026-11-02',
      deliveryMode: 'ONLINE',
    })
  );
  // A failed class lookup keeps the card without a date.
  expect(view.result.current.courses.data?.[1]?.openClass).toBeUndefined();
  expect(requests).toEqual(['page=1&pageSize=6']);
});

it('refetches with category, delivery mode and page and keeps the last total while loading', async () => {
  const { view, set } = render({ page: 1, categoryId: null });
  await waitFor(() => expect(view.result.current.total).toBe(13));
  act(() => set({ page: 3, categoryId: null }));
  expect(view.result.current.courses.status).toBe('loading');
  expect(view.result.current.total).toBe(13);
  await waitFor(() =>
    expect(view.result.current.courses.status).toBe('success')
  );
  act(() => set({ page: 1, categoryId: id(500), deliveryMode: 'OFFLINE' }));
  await waitFor(() => expect(view.result.current.total).toBe(4));
  expect(requests).toContain('page=3&pageSize=6');
  expect(requests).toContain(
    `page=1&pageSize=6&categoryId=${id(500)}&deliveryMode=OFFLINE`
  );
});

it('counts matches for the draft filter only when asked', async () => {
  const { view, set } = render({ page: 1, categoryId: null });
  await waitFor(() =>
    expect(view.result.current.courses.status).toBe('success')
  );
  expect(view.result.current.filterTotal).toBeUndefined();
  act(() =>
    set({ page: 1, categoryId: null, filterDraft: { deliveryMode: 'ONLINE' } })
  );
  await waitFor(() => expect(view.result.current.filterTotal).toBe(4));
  expect(requests).toContain('page=1&pageSize=1&deliveryMode=ONLINE');
});

it('does not request catalog data without a student session', () => {
  useStore.setState({ sessionUser: { ...user, role: 'MENTOR' } });
  const { view } = render({ page: 1, categoryId: null });
  expect(view.result.current.courses.status).toBe('loading');
  expect(requests).toEqual([]);
});
