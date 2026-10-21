import '../../../../tests/mocks/nativeUi';
import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import {
  detailDto,
  enrollmentDto,
  learningId,
  learningPage,
} from '../../../../tests/fixtures/learning';
import { renderHookWithProviders } from '../../../../tests/utils/renderWithProviders';
import { student } from '../../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import { useClassDetailQuery, useMyClassesQuery } from './useLearningQuery';

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
it('never renders a previous FULL detail while refocusing and removes it after denial', async () => {
  let deny = false;
  let finish: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    finish = resolve;
  });
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes', async () => {
      if (deny) await gate;
      return HttpResponse.json(learningPage(deny ? [] : [enrollmentDto()]));
    }),
    http.get(TEST_API_URL + '/me/classes/:id', () =>
      HttpResponse.json(detailDto())
    )
  );
  let active = true;
  const view = renderHookWithProviders(() =>
    useClassDetailQuery(learningId(200), active)
  );
  await waitFor(() =>
    expect(view.result.current.detail.data?.accessMode).toBe('FULL')
  );
  active = false;
  view.rerender({});
  expect(view.result.current.detail.data).toBeNull();
  deny = true;
  active = true;
  view.rerender({});
  expect(view.result.current.detail.data).toBeNull();
  await act(async () => finish());
  await waitFor(() =>
    expect(view.result.current.detail.error?.code).toBe('CLASS_ACCESS_DENIED')
  );
  expect(view.result.current.detail.data).toBeNull();
});
it('uses a separate query for a new generation and a new list view', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/classes', ({ request }) =>
      HttpResponse.json(
        learningPage(
          new URL(request.url).searchParams.get('view') === 'history'
            ? []
            : [enrollmentDto()]
        )
      )
    )
  );
  let history = false;
  const view = renderHookWithProviders(() =>
    useMyClassesQuery(history ? 'history' : 'current')
  );
  await waitFor(() => expect(view.result.current.rows).toHaveLength(1));
  history = true;
  view.rerender({});
  expect(view.result.current.rows).toHaveLength(0);
  await waitFor(() =>
    expect(view.result.current.region.status).toBe('success')
  );
  act(() => useStore.setState({ generation: 2 }));
  expect(view.result.current.region.data).toBeNull();
});
