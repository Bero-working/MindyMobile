import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import { catalogService } from './catalog.service';

const id = (n: number) =>
  `22222222-2222-4222-8222-${String(n).padStart(12, '0')}`;
const course = {
  id: id(1),
  code: 'WEB101',
  title: 'Web cơ bản',
  description: null,
  imgUrl: null,
  priceAmount: 1500000,
  category: { id: id(2), name: 'Lập trình', slug: 'lap-trinh' },
};
const cls = (n: number, startDate: string) => ({
  id: id(100 + n),
  courseId: course.id,
  code: 'WEB101-' + n,
  name: 'Web lớp ' + n,
  startDate,
  endDate: '2027-01-20',
  deliveryMode: n % 2 ? 'ONLINE' : 'OFFLINE',
  maxStudents: 20,
  availableSeats: n,
  mentor: { id: id(9), displayName: 'Mentor Demo' },
});
const page = <T>(items: T[], pageSize = 20, total = items.length) => ({
  items,
  page: 1,
  pageSize,
  total,
});
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('lists only active categories', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/course-categories', ({ request }) => {
      expect(new URL(request.url).searchParams.get('pageSize')).toBe('50');
      return HttpResponse.json(
        page(
          [
            {
              id: id(2),
              name: 'Lập trình',
              slug: 'lap-trinh',
              description: null,
              isActive: true,
            },
            {
              id: id(3),
              name: 'Cũ',
              slug: 'cu',
              description: 'x',
              isActive: false,
            },
          ],
          50
        )
      );
    })
  );
  await expect(catalogService.categories()).resolves.toEqual([
    { id: id(2), name: 'Lập trình' },
  ]);
});

it('sends paging and filters, omitting empty keys', async () => {
  const seen: string[] = [];
  mockServer.use(
    http.get(TEST_API_URL + '/courses', ({ request }) => {
      seen.push(new URL(request.url).search);
      return HttpResponse.json({ ...page([course], 6, 13), page: 3 });
    })
  );
  await expect(
    catalogService.courses({ page: 3, pageSize: 6 })
  ).resolves.toEqual({ items: [course], total: 13 });
  await catalogService.courses({
    page: 1,
    pageSize: 6,
    categoryId: id(2),
    deliveryMode: 'OFFLINE',
  });
  expect(seen).toEqual([
    '?page=3&pageSize=6',
    `?page=1&pageSize=6&categoryId=${id(2)}&deliveryMode=OFFLINE`,
  ]);
});

it('rejects malformed course pages with a module error code', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/courses', () =>
      HttpResponse.json(page([{ ...course, priceAmount: '1500000' }], 6))
    )
  );
  await expect(
    catalogService.courses({ page: 1, pageSize: 6 })
  ).rejects.toMatchObject({ status: 502, code: 'INVALID_CATALOG_RESPONSE' });
});

it('propagates server and network errors by status and code', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/course-categories', () =>
      HttpResponse.json(
        {
          statusCode: 503,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'down',
          requestId: 'req-1',
        },
        { status: 503 }
      )
    ),
    http.get(TEST_API_URL + '/courses', () => HttpResponse.error())
  );
  await expect(catalogService.categories()).rejects.toMatchObject({
    status: 503,
    requestId: 'req-1',
  });
  await expect(
    catalogService.courses({ page: 1, pageSize: 6 })
  ).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
});

it('picks the earliest open class as the next class regardless of server order', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/courses/:id/classes', ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('page')).toBe('1');
      expect(params.get('pageSize')).toBe('100');
      return HttpResponse.json(
        page([cls(1, '2026-12-01'), cls(2, '2026-11-16')], 100)
      );
    })
  );
  await expect(catalogService.nextClass(course.id)).resolves.toEqual({
    startDate: '2026-11-16',
    deliveryMode: 'OFFLINE',
  });
  mockServer.use(
    http.get(TEST_API_URL + '/courses/:id/classes', () =>
      HttpResponse.json(page([], 100))
    )
  );
  await expect(catalogService.nextClass(course.id)).resolves.toBeNull();
});

it('caps concurrent next-class lookups at six even across grid and recommendation queries', async () => {
  let active = 0,
    peak = 0;
  const releases: (() => void)[] = [];
  mockServer.use(
    http.get(TEST_API_URL + '/courses/:id/classes', async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise<void>((resolve) => releases.push(resolve));
      active--;
      return HttpResponse.json(page([], 100));
    })
  );
  const calls = Array.from({ length: 9 }, (_, index) =>
    catalogService.nextClass(id(index + 10))
  );
  await new Promise((resolve) => setTimeout(resolve, 50));
  for (const release of releases.splice(0)) release();
  await new Promise((resolve) => setTimeout(resolve, 50));
  for (const release of releases.splice(0)) release();
  await Promise.all(calls);
  expect(peak).toBeLessThanOrEqual(6);
});
