import '../../../tests/mocks/nativeUi';
import {
  act,
  cleanupAsync,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL } from '../../../tests/mocks/constants';
import { queryClient } from '@/config/queryClient';
import { useStore } from '@/state/store';
import { render } from '@testing-library/react-native';
import App from '@/index';
import { apiInstances } from '@/config/http/apiInstance.config';
const defaultQueryOptions = queryClient.getDefaultOptions();
const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'student@example.test',
  displayName: 'API Student',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: '2026-10-01T00:00:00Z',
};
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  // Session invalidation can remove queries while their screens are still mounted.
  // Keep their later unmount from scheduling a production-length GC timer.
  queryClient.setDefaultOptions({
    ...defaultQueryOptions,
    queries: { ...defaultQueryOptions.queries, gcTime: 0 },
  });
  queryClient.clear();
  useStore.setState({
    user: null,
    sessionUser: null,
    isAuthenticated: false,
    bootstrapStatus: 'idle',
    generation: 0,
    hasSessionHistory: false,
  });
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
it('does not flash Home during bootstrap and shows an invalid account message for staff', async () => {
  let finish: () => void = () => {};
  const response = new Promise<void>((resolve) => {
    finish = resolve;
  });
  mockServer.use(
    http.get(TEST_API_URL + '/auth/me', async () => {
      await response;
      return HttpResponse.json({ ...user, role: 'MANAGER' });
    })
  );
  render(<App />);
  expect(
    screen.getByTestId('session-loading', { includeHiddenElements: true })
  ).toBeTruthy();
  expect(screen.queryByTestId('home-screen')).toBeNull();
  await act(async () => finish());
  await waitFor(() =>
    expect(
      screen.queryByTestId('session-loading', { includeHiddenElements: true })
    ).toBeNull()
  );
  expect(screen.queryByTestId('home-screen')).toBeNull();
  expect(screen.queryByTestId('login-submit-button')).toBeNull();
  expect(
    screen.getByText(
      /Sai tài khoản hoặc mật khẩu|Incorrect account or password/
    )
  ).toBeTruthy();
});
it.each(['ADMIN', 'MENTOR', 'MANAGER'])(
  'keeps %s login on the form with a credentials error and ends its backend session',
  async (role) => {
    let logoutCount = 0;
    mockServer.use(
      http.get(TEST_API_URL + '/auth/me', () =>
        HttpResponse.json(
          { statusCode: 401, code: 'NO_SESSION', message: 'Guest' },
          { status: 401 }
        )
      ),
      http.post(TEST_API_URL + '/auth/login', () =>
        HttpResponse.json({
          user: { ...user, role },
          accessTokenExpiresAt: '2026-10-17T16:00:00Z',
        })
      ),
      http.post(TEST_API_URL + '/auth/logout', () => {
        logoutCount++;
        return new HttpResponse(null, { status: 204 });
      })
    );
    render(<App />);
    await waitFor(() =>
      expect(screen.getByTestId('welcome-login-button')).toBeTruthy()
    );
    fireEvent.press(screen.getByTestId('welcome-login-button'));
    fireEvent.changeText(screen.getByTestId('login-email-input'), user.email);
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'secret');
    fireEvent.press(screen.getByTestId('login-submit-button'));
    await waitFor(() =>
      expect(screen.getByTestId('login-form-error')).toBeTruthy()
    );
    expect(screen.getByText('Email hoặc mật khẩu không đúng.')).toBeTruthy();
    expect(screen.getByTestId('login-email-input').props.value).toBe(
      user.email
    );
    expect(screen.getByTestId('login-password-input').props.value).toBe(
      'secret'
    );
    expect(screen.queryByTestId('home-screen')).toBeNull();
    expect(useStore.getState().sessionUser).toBeNull();
    expect(logoutCount).toBe(1);
  }
);
it('logs in through the production form, resets guest history, and returns expired sessions to Login', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/auth/me', () =>
      HttpResponse.json(
        { statusCode: 401, code: 'NO_SESSION', message: 'Guest' },
        { status: 401 }
      )
    ),
    http.post(TEST_API_URL + '/auth/login', () =>
      HttpResponse.json({ user, accessTokenExpiresAt: '2026-10-17T16:00:00Z' })
    ),
    http.get(TEST_API_URL + '/courses', () =>
      HttpResponse.json({ items: [], page: 1, pageSize: 4, total: 0 })
    ),
    http.get(TEST_API_URL + '/me/schedule', ({ request }) => {
      const params = new URL(request.url).searchParams;
      return HttpResponse.json({
        items: [],
        page: 1,
        pageSize: 100,
        total: 0,
        from: params.get('from'),
        to: params.get('to'),
        asOf: '2026-10-17T00:00:00Z',
        timeZone: 'Asia/Ho_Chi_Minh',
      });
    })
  );
  render(<App />);
  await waitFor(() =>
    expect(screen.getByTestId('welcome-login-button')).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('welcome-login-button'));
  await waitFor(() =>
    expect(screen.getByTestId('login-email-input')).toBeTruthy()
  );
  fireEvent.changeText(screen.getByTestId('login-email-input'), user.email);
  fireEvent.changeText(screen.getByTestId('login-password-input'), 'secret');
  fireEvent.press(screen.getByTestId('login-submit-button'));
  await waitFor(() => expect(screen.getByTestId('home-empty')).toBeTruthy());
  expect(screen.queryByTestId('welcome-login-button')).toBeNull();
  expect(screen.queryByTestId('login-submit-button')).toBeNull();
  queryClient.setQueryData(['private-test'], { secret: 'private fixture' });
  mockServer.use(
    http.get(TEST_API_URL + '/session-expiry-test', () =>
      HttpResponse.json(
        {
          statusCode: 401,
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Expired',
        },
        { status: 401 }
      )
    ),
    http.post(TEST_API_URL + '/auth/refresh', () =>
      HttpResponse.json(
        { statusCode: 401, code: 'REFRESH_TOKEN_INVALID', message: 'Expired' },
        { status: 401 }
      )
    )
  );
  await act(async () => {
    await apiInstances.service.get<void>('session-expiry-test').catch(() => {});
  });
  await waitFor(() =>
    expect(screen.getByTestId('login-submit-button')).toBeTruthy()
  );
  expect(screen.queryByTestId('home-screen')).toBeNull();
  expect(queryClient.getQueryData(['private-test'])).toBeUndefined();
});

jest.mock('react-native-qrcode-svg', () => ({
  __esModule: true,
  default: jest.requireActual('react-native').View,
}));
jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: { setString: jest.fn() },
}));
