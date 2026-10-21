import '../../../tests/mocks/nativeUi';
import {
  cleanupAsync,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL } from '../../../tests/mocks/constants';
import {
  detailDto,
  enrollmentDto,
  learningId,
  learningPage,
  sessionDto,
} from '../../../tests/fixtures/learning';
import { queryClient } from '@/config/queryClient';
import { useStore } from '@/state/store';
import App from '@/index';

const defaultQueryOptions = queryClient.getDefaultOptions();
const user = {
  id: learningId(999),
  email: 'student@example.test',
  displayName: 'API Student',
  phone: null,
  role: 'STUDENT' as const,
  status: 'ACTIVE' as const,
  lastLoginAt: null,
  createdAt: '2026-10-01T00:00:00Z',
};
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  // Logout removes queries before every observer has unmounted.
  queryClient.setDefaultOptions({
    ...defaultQueryOptions,
    queries: { ...defaultQueryOptions.queries, gcTime: 0 },
  });
  queryClient.clear();
  useStore.setState({
    sessionUser: user,
    bootstrapStatus: 'ready',
    generation: 1,
    hasSessionHistory: true,
  });
  mockServer.use(
    http.get(TEST_API_URL + '/courses', ({ request }) =>
      HttpResponse.json({
        items: [],
        page: 1,
        pageSize: Number(new URL(request.url).searchParams.get('pageSize')),
        total: 0,
      })
    ),
    http.get(TEST_API_URL + '/me/schedule', ({ request }) => {
      const q = new URL(request.url).searchParams;
      const from = q.get('from') ?? '';
      const to = q.get('to') ?? '';
      return HttpResponse.json({
        ...learningPage(
          q.get('includeCancelled') === 'true'
            ? [
                {
                  ...sessionDto(),
                  startsAt: new Date(Date.parse(from) + 86400000).toISOString(),
                  endsAt: new Date(Date.parse(from) + 90000000).toISOString(),
                },
              ]
            : []
        ),
        from,
        to,
        timeZone: 'Asia/Ho_Chi_Minh',
      });
    }),
    http.get(TEST_API_URL + '/auth/me', () => HttpResponse.json(user)),
    http.get(TEST_API_URL + '/me/classes', () =>
      HttpResponse.json(learningPage([enrollmentDto()]))
    ),
    http.get(TEST_API_URL + '/me/classes/:id', () =>
      HttpResponse.json(detailDto())
    ),
    http.post(
      TEST_API_URL + '/auth/logout',
      () => new HttpResponse(null, { status: 204 })
    )
  );
});
afterEach(async () => {
  await cleanupAsync();
  queryClient.clear();
  mockServer.resetHandlers();
});
afterAll(() => {
  queryClient.setDefaultOptions(defaultQueryOptions);
  mockServer.close();
});
it('uses guarded production routes, read-only schedule, verified detail and clears learning data on logout', async () => {
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('home-screen')).toBeTruthy());
  fireEvent.press(screen.getByTestId('home-tab-schedule'));
  await waitFor(() =>
    expect(
      screen.getByTestId(`schedule-session-${learningId(301)}`)
    ).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId(`schedule-session-${learningId(301)}`));
  expect(screen.queryByTestId('class-session-screen')).toBeNull();
  fireEvent.press(screen.getByTestId('schedule-tab-account'));
  await waitFor(() => expect(screen.getByText('API Student')).toBeTruthy());
  fireEvent.press(screen.getByTestId('account-my-classes'));
  await waitFor(() =>
    expect(
      screen.getByTestId(`my-classes-course-${learningId(100)}`)
    ).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId(`my-classes-course-${learningId(100)}`));
  fireEvent.press(screen.getByTestId(`my-classes-open-${learningId(1)}`));
  await waitFor(() =>
    expect(
      screen.getByTestId(`class-detail-session-${learningId(301)}`)
    ).toBeTruthy()
  );
  fireEvent.press(
    screen.getByTestId(`class-detail-session-${learningId(301)}`)
  );
  expect(screen.getByTestId('class-session-join')).toBeTruthy();
  fireEvent.press(screen.getByTestId('class-session-close'));
  fireEvent.press(screen.getByTestId('class-detail-back'));
  await waitFor(() =>
    expect(screen.getByTestId('my-classes-screen')).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('my-classes-tab-account'));
  await waitFor(() =>
    expect(screen.getByTestId('account-screen')).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('account-logout'));
  fireEvent.press(screen.getByTestId('account-logout-confirm'));
  await waitFor(() => expect(screen.getByTestId('login-screen')).toBeTruthy());
  expect(
    queryClient.getQueryCache().findAll({ queryKey: ['student-learning'] })
  ).toHaveLength(0);
});

jest.mock('react-native-qrcode-svg', () => ({
  __esModule: true,
  default: jest.requireActual('react-native').View,
}));
jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: { setString: jest.fn() },
}));
jest.mock('@/components/common/AppSheet', () => ({
  AppSheet: jest.requireActual('react-native').View,
}));
