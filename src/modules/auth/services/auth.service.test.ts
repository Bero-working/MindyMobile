import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import { authService } from './auth.service';
import { useStore } from '@/state/store';

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  displayName: 'An',
  email: 'student@example.test',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: '2026-10-01T00:00:00Z',
};
const result = { user, accessTokenExpiresAt: '2026-10-17T15:00:00Z' };
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('sends only login fields, preserves password whitespace and parses the direct auth DTO', async () => {
  mockServer.use(
    http.post(TEST_API_URL + '/auth/login', async ({ request }) => {
      expect(await request.json()).toEqual({
        email: 'student@example.test',
        password: ' secret ',
      });
      return HttpResponse.json(result);
    })
  );
  await expect(
    authService.login({ email: 'student@example.test', password: ' secret ' })
  ).resolves.toEqual(result);
});

it('whitelists registration, omits blank phone and accepts neutral 202 without setting a session', async () => {
  mockServer.use(
    http.post(TEST_API_URL + '/auth/register', async ({ request }) => {
      expect(await request.json()).toEqual({
        displayName: 'An',
        email: 'student@example.test',
        password: ' secret ',
      });
      return HttpResponse.json(
        {
          message:
            'If the address can be registered, a verification email has been sent.',
        },
        { status: 202 }
      );
    })
  );
  await authService.register({
    displayName: 'An',
    email: 'student@example.test',
    password: ' secret ',
    phone: '',
  });
  expect(useStore.getState().isAuthenticated).toBe(false);
});

it('resends only the email and handles logout without parsing an empty 204 body', async () => {
  mockServer.use(
    http.post(TEST_API_URL + '/auth/email/resend', async ({ request }) => {
      expect(await request.json()).toEqual({ email: 'student@example.test' });
      return HttpResponse.json({ message: 'Neutral' }, { status: 202 });
    }),
    http.post(
      TEST_API_URL + '/auth/logout',
      () => new HttpResponse(null, { status: 204 })
    )
  );
  await expect(
    authService.resend('student@example.test')
  ).resolves.toBeUndefined();
  await expect(authService.logout()).resolves.toBeUndefined();
});

it('parses auth/me as UserDto and rejects inactive users and malformed responses', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/auth/me', () => HttpResponse.json(user))
  );
  await expect(authService.me()).resolves.toEqual(user);
  mockServer.use(
    http.get(TEST_API_URL + '/auth/me', () =>
      HttpResponse.json({ ...user, status: 'SUSPENDED' })
    )
  );
  await expect(authService.me()).rejects.toMatchObject({
    code: 'INVALID_AUTH_RESPONSE',
  });
  mockServer.use(
    http.post(TEST_API_URL + '/auth/login', () =>
      HttpResponse.json({ data: result })
    )
  );
  await expect(
    authService.login({ email: 'x@example.test', password: 'a' })
  ).rejects.toMatchObject({ code: 'INVALID_AUTH_RESPONSE' });
});

it.each([401, 422, 429, 503])(
  'preserves backend error codes and request ids (%i)',
  async (status) => {
    mockServer.use(
      http.post(TEST_API_URL + '/auth/login', () =>
        HttpResponse.json(
          {
            statusCode: status,
            code: 'EXPECTED_ERROR',
            message: 'Failure',
            requestId: 'test-request',
          },
          { status }
        )
      )
    );
    await expect(
      authService.login({ email: 'x@example.test', password: 'a' })
    ).rejects.toMatchObject({
      status,
      code: 'EXPECTED_ERROR',
      requestId: 'test-request',
    });
  }
);
