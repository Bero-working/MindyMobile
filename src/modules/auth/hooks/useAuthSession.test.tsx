import '../../../../tests/mocks/nativeUi';
import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../../tests/utils/renderWithProviders';
import type { AuthResult } from '../types/auth.type';
import { useStore } from '@/state/store';
import { useAuthActions, useAuthSession } from './useAuthSession';

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'student@example.test',
  displayName: 'An',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: '2026-10-01T00:00:00Z',
};
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() =>
  useStore.setState({
    user: null,
    isAuthenticated: false,
    sessionUser: null,
    bootstrapStatus: 'idle',
    generation: 0,
    hasSessionHistory: false,
  })
);
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('bootstraps only once, keeps the user unverified until me completes and accepts all staff roles', async () => {
  let finish: () => void = () => {};
  const response = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let count = 0;
  mockServer.use(
    http.get(TEST_API_URL + '/auth/me', async () => {
      count++;
      await response;
      return HttpResponse.json({ ...user, role: 'MANAGER' });
    })
  );
  const view = renderHookWithProviders(() => useAuthSession());
  expect(view.result.current.pending).toBe(true);
  expect(useStore.getState().sessionUser).toBeNull();
  await act(async () => finish());
  await waitFor(() => expect(view.result.current.pending).toBe(false));
  expect(useStore.getState().sessionUser?.role).toBe('MANAGER');
  expect(count).toBe(1);
});

it('treats me 401 as guest without an endless bootstrap or a fake user', async () => {
  let count = 0;
  mockServer.use(
    http.get(TEST_API_URL + '/auth/me', () => {
      count++;
      return HttpResponse.json(
        { statusCode: 401, code: 'NO_SESSION', message: 'Unauthenticated' },
        { status: 401 }
      );
    })
  );
  const view = renderHookWithProviders(() => useAuthSession());
  await waitFor(() => expect(view.result.current.pending).toBe(false));
  expect(view.result.current.error).toBeNull();
  expect(useStore.getState().sessionUser).toBeNull();
  expect(count).toBe(1);
});

it('keeps network bootstrap failure separate from guest and supports a deliberate retry', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/auth/me', () =>
      HttpResponse.json(
        { statusCode: 503, code: 'TEMPORARY', message: 'Try later' },
        { status: 503 }
      )
    )
  );
  const view = renderHookWithProviders(() => useAuthSession());
  await waitFor(() =>
    expect(view.result.current.error?.code).toBe('TEMPORARY')
  );
  expect(useStore.getState().bootstrapStatus).toBe('idle');
  mockServer.use(
    http.get(TEST_API_URL + '/auth/me', () => HttpResponse.json(user))
  );
  await act(async () => {
    await view.result.current.retry();
  });
  await waitFor(() =>
    expect(useStore.getState().sessionUser?.id).toBe(user.id)
  );
});

it('does not restore a session if login completes after logout', async () => {
  let finish: () => void = () => {};
  const delayed = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let started = false;
  mockServer.use(
    http.post(TEST_API_URL + '/auth/login', async () => {
      started = true;
      await delayed;
      return HttpResponse.json({
        user,
        accessTokenExpiresAt: '2026-10-17T16:00:00Z',
      });
    })
  );
  const view = renderHookWithProviders(() => useAuthActions());
  let request: Promise<AuthResult | null> = Promise.resolve(null);
  act(() => {
    request = view.result.current
      .login({ email: user.email, password: 'secret' })
      .catch(() => null);
  });
  await waitFor(() => expect(started).toBe(true));
  act(() => useStore.getState().logout());
  await act(async () => {
    finish();
    await request;
  });
  expect(useStore.getState().sessionUser).toBeNull();
  expect(useStore.getState().isAuthenticated).toBe(false);
});

it('register/resend do not authenticate, login sets a verified session, and logout clears it', async () => {
  mockServer.use(
    http.post(TEST_API_URL + '/auth/register', () =>
      HttpResponse.json({ message: 'Neutral' }, { status: 202 })
    ),
    http.post(TEST_API_URL + '/auth/email/resend', () =>
      HttpResponse.json({ message: 'Neutral' }, { status: 202 })
    ),
    http.post(TEST_API_URL + '/auth/login', () =>
      HttpResponse.json({ user, accessTokenExpiresAt: '2026-10-17T16:00:00Z' })
    ),
    http.post(
      TEST_API_URL + '/auth/logout',
      () => new HttpResponse(null, { status: 204 })
    )
  );
  const view = renderHookWithProviders(() => useAuthActions());
  await act(async () => {
    await view.result.current.register({
      displayName: 'An',
      email: user.email,
      password: 'secret',
    });
    await view.result.current.resend(user.email);
  });
  expect(useStore.getState().sessionUser).toBeNull();
  await act(async () => {
    await view.result.current.login({ email: user.email, password: 'secret' });
  });
  expect(useStore.getState().sessionUser?.displayName).toBe('An');
  await act(async () => {
    await view.result.current.signOut();
  });
  expect(useStore.getState().sessionUser).toBeNull();
});

it('does not restore a session when bootstrap me completes after logout', async () => {
  let finish: () => void = () => {};
  let started = false;
  const delayed = new Promise<void>((resolve) => {
    finish = resolve;
  });
  mockServer.use(
    http.get(TEST_API_URL + '/auth/me', async () => {
      started = true;
      await delayed;
      return HttpResponse.json(user);
    })
  );
  const view = renderHookWithProviders(() => useAuthSession());
  await waitFor(() => expect(started).toBe(true));
  act(() => useStore.getState().logout());
  await act(async () => finish());
  expect(view.result.current.pending).toBe(false);
  expect(useStore.getState().sessionUser).toBeNull();
});

it('keeps the session after logout failure and allows a deliberate retry', async () => {
  mockServer.use(
    http.post(TEST_API_URL + '/auth/login', () =>
      HttpResponse.json({ user, accessTokenExpiresAt: '2026-10-17T16:00:00Z' })
    ),
    http.post(TEST_API_URL + '/auth/logout', () =>
      HttpResponse.json(
        { statusCode: 503, code: 'TEMPORARY', message: 'Unavailable' },
        { status: 503 }
      )
    )
  );
  const view = renderHookWithProviders(() => useAuthActions());
  await act(async () => {
    await view.result.current.login({ email: user.email, password: 'secret' });
  });
  await act(async () => {
    await expect(view.result.current.signOut()).rejects.toMatchObject({
      code: 'TEMPORARY',
    });
  });
  expect(useStore.getState().sessionUser?.id).toBe(user.id);
  await waitFor(() =>
    expect(view.result.current.logoutError?.code).toBe('TEMPORARY')
  );
  mockServer.use(
    http.post(
      TEST_API_URL + '/auth/logout',
      () => new HttpResponse(null, { status: 204 })
    )
  );
  await act(async () => {
    await view.result.current.signOut();
  });
  expect(useStore.getState().sessionUser).toBeNull();
});
