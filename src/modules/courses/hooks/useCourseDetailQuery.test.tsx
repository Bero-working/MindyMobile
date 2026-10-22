import '../../../../tests/mocks/nativeUi';
import { waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL as base } from '../../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../../tests/utils/renderWithProviders';
import {
  apiClass,
  apiCourse,
  apiPage,
  commerceId as id,
  deferred,
  student,
} from '../../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import { useCourseDetailQuery } from './useCourseDetailQuery';
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 10,
  });
  mockServer.use(
    http.get(base + '/courses/:id', () => HttpResponse.json(apiCourse)),
    http.get(base + '/courses/:id/classes', () =>
      HttpResponse.json(apiPage([apiClass(10), apiClass(11)]))
    ),
    http.get(base + '/classes/:id', ({ params }) =>
      params.id === id(10)
        ? HttpResponse.json({
            id: id(10),
            units: [{ sessions: [{ startsAt: '2026-11-02T12:00:00Z' }] }],
          })
        : new HttpResponse(null, { status: 503 })
    )
  );
});
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
it('loads detail independently and enriches rows with optional session times', async () => {
  const { result } = renderHookWithProviders(() =>
    useCourseDetailQuery(apiCourse.id)
  );
  await waitFor(() => expect(result.current.status).toBe('success'));
  await waitFor(() =>
    expect(result.current.classes[0]?.sessions).toEqual([
      { startsAt: '2026-11-02T12:00:00Z' },
    ])
  );
  expect(result.current.classes[1]?.sessions).toBeUndefined();
  expect(result.current.course).toEqual(apiCourse);
});
it('limits session detail requests to three concurrent calls', async () => {
  const gate = deferred();
  let active = 0,
    peak = 0,
    calls = 0;
  mockServer.use(
    http.get(base + '/courses/:id/classes', () =>
      HttpResponse.json(apiPage([10, 11, 12, 13, 14].map(apiClass)))
    ),
    http.get(base + '/classes/:id', async ({ params }) => {
      calls++;
      peak = Math.max(peak, ++active);
      await gate.promise;
      active--;
      return HttpResponse.json({ id: params.id, units: [] });
    })
  );
  const view = renderHookWithProviders(() =>
    useCourseDetailQuery(apiCourse.id)
  );
  await waitFor(() => expect(calls).toBe(3));
  expect(peak).toBe(3);
  gate.resolve();
  await waitFor(() => expect(calls).toBe(5));
  expect(peak).toBe(3);
  view.unmount();
});
it('shows a course-not-found error and can retry without using card data', async () => {
  mockServer.use(
    http.get(base + '/courses/:id', () =>
      HttpResponse.json(
        { statusCode: 404, code: 'COURSE_NOT_FOUND', message: 'missing' },
        { status: 404 }
      )
    )
  );
  const { result } = renderHookWithProviders(() =>
    useCourseDetailQuery(apiCourse.id)
  );
  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.course).toBeUndefined();
});
