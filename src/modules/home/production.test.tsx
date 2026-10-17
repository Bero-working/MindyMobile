import '../../../tests/mocks/nativeUi';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL } from '../../../tests/mocks/constants';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import '@/config/i18n.config';
import { StudentHomeRoute } from '@/modules/auth/AuthRoutes';
import { useStore } from '@/state/store';
import type { SessionUser } from '@/modules/auth/schemas/authResponse.schema';
const user: SessionUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'student@example.test',
  displayName: 'API Student',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: '2026-10-01T00:00:00Z',
};
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({}),
}));
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
it('renders verified production data, keeps unavailable CTAs disabled and logs out without fixtures', async () => {
  let finish: () => void = () => {};
  const delayed = new Promise<void>((resolve) => {
    finish = resolve;
  });
  mockServer.use(
    http.get(TEST_API_URL + '/courses', async () => {
      await delayed;
      return HttpResponse.json({ items: [], page: 1, pageSize: 4, total: 0 });
    }),
    http.get(TEST_API_URL + '/me/schedule', ({ request }) => {
      const params = new URL(request.url).searchParams;
      return HttpResponse.json({
        items: [],
        page: 1,
        pageSize: 100,
        total: 0,
        from: params.get('from'),
        to: params.get('to'),
        timeZone: 'Asia/Ho_Chi_Minh',
        asOf: '2026-10-17T00:00:00Z',
      });
    }),
    http.post(
      TEST_API_URL + '/auth/logout',
      () => new HttpResponse(null, { status: 204 })
    )
  );
  renderWithProviders(<StudentHomeRoute />);
  expect(screen.getByTestId('home-loading')).toBeTruthy();
  expect(screen.getByText(/API Student/)).toBeTruthy();
  expect(screen.getByTestId('home-explore-courses-button')).toBeDisabled();
  expect(screen.getByTestId('home-tab-account')).toBeDisabled();
  await act(async () => finish());
  await waitFor(() => expect(screen.getByTestId('home-empty')).toBeTruthy());
  expect(screen.queryByTestId('home-next-session')).toBeNull();
  fireEvent.press(screen.getByTestId('session-logout'));
  await waitFor(() => expect(useStore.getState().sessionUser).toBeNull());
  expect(screen.queryByTestId('home-screen')).toBeNull();
});
it('removes Home immediately when the session expires', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/courses', () =>
      HttpResponse.json({ items: [], page: 1, pageSize: 4, total: 0 })
    ),
    http.get(TEST_API_URL + '/me/schedule', () =>
      HttpResponse.json(
        {
          code: 'AUTHENTICATION_REQUIRED',
          statusCode: 401,
          message: 'Expired',
        },
        { status: 401 }
      )
    ),
    http.post(TEST_API_URL + '/auth/refresh', () =>
      HttpResponse.json(
        { code: 'REFRESH_TOKEN_INVALID', statusCode: 401, message: 'Expired' },
        { status: 401 }
      )
    )
  );
  renderWithProviders(<StudentHomeRoute />);
  await waitFor(() => expect(useStore.getState().sessionUser).toBeNull());
  expect(screen.queryByTestId('home-screen')).toBeNull();
});
it('blocks Student Home for staff even when a legacy authenticated flag is true', () => {
  useStore.setState({
    sessionUser: { ...user, role: 'MENTOR' },
    isAuthenticated: true,
  });
  renderWithProviders(<StudentHomeRoute />);
  expect(screen.queryByTestId('home-screen')).toBeNull();
});
