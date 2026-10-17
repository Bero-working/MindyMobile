import { http, HttpResponse, delay } from 'msw';
import { apiInstances } from './apiInstance.config';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL } from '../../../tests/mocks/constants';
import { queryClient } from '../queryClient';
import { useStore } from '@/state/store';
import { ApiError } from '@/shared/utilities/apiError';
import { createIdempotencyKey } from '@/shared/utilities/idempotencyKey';
import { env } from '@/config/env';
import { Http } from './http.config';

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  mockServer.resetHandlers();
  queryClient.clear();
});
afterAll(() => mockServer.close());

it('preserves the idempotency key and body when retrying after refresh', async () => {
  const key = createIdempotencyKey();
  const attempts: { key: string | null; body: string }[] = [];
  mockServer.use(
    http.post(
      `${TEST_API_URL}/test/idempotent-mutation`,
      async ({ request }) => {
        attempts.push({
          key: request.headers.get('Idempotency-Key'),
          body: await request.text(),
        });
        if (attempts.length === 1)
          return HttpResponse.json(
            {
              statusCode: 401,
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Expired',
            },
            { status: 401 }
          );
        return HttpResponse.json({ ok: true });
      }
    ),
    http.post(
      `${TEST_API_URL}/auth/refresh`,
      () => new HttpResponse(null, { status: 200 })
    )
  );
  await expect(
    apiInstances.service.post(
      'test/idempotent-mutation',
      { expectedRevision: 1 },
      { headers: { 'Idempotency-Key': key } }
    )
  ).resolves.toEqual({ ok: true });
  expect(attempts).toEqual([
    { key, body: '{"expectedRevision":1}' },
    { key, body: '{"expectedRevision":1}' },
  ]);
});

it('intercepts Axios requests and returns the DTO without Bearer', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/health/live`, ({ request }) => {
      expect(request.headers.get('authorization')).toBeNull();
      return HttpResponse.json({ status: 'ok' });
    })
  );
  await expect(apiInstances.service.get('health/live')).resolves.toEqual({
    status: 'ok',
  });
});

it('normalizes backend errors', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/missing`, () =>
      HttpResponse.json(
        {
          statusCode: 404,
          code: 'NOT_FOUND',
          message: ['Missing'],
          requestId: 'r1',
        },
        { status: 404 }
      )
    )
  );
  await expect(apiInstances.service.get('missing')).rejects.toMatchObject({
    status: 404,
    code: 'NOT_FOUND',
    message: 'Missing',
    requestId: 'r1',
  });
});

it('normalizes network failures', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/offline`, () => HttpResponse.error())
  );
  await expect(apiInstances.service.get('offline')).rejects.toMatchObject({
    status: 0,
    code: 'NETWORK_ERROR',
  });
});

it('refreshes once for concurrent requests and retries each once', async () => {
  let refreshed = false;
  let refreshCount = 0;
  mockServer.use(
    http.get(`${TEST_API_URL}/private`, () =>
      refreshed
        ? HttpResponse.json({ ok: true })
        : HttpResponse.json(
            {
              statusCode: 401,
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Expired',
            },
            { status: 401 }
          )
    ),
    http.post(`${TEST_API_URL}/auth/refresh`, async () => {
      refreshCount++;
      await delay(40);
      refreshed = true;
      return new HttpResponse(null, { status: 200 });
    })
  );
  const responses = await Promise.all(
    Array.from({ length: 3 }, () => apiInstances.service.get('private'))
  );
  expect(responses).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
  expect(refreshCount).toBe(1);
});

it('clears cache and auth when refresh fails without a loop', async () => {
  let refreshCount = 0;
  queryClient.setQueryData(['private'], { secret: true });
  useStore
    .getState()
    .setUser({ id: '1', name: 'Test', email: 'test@example.test' });
  mockServer.use(
    http.get(`${TEST_API_URL}/private`, () =>
      HttpResponse.json(
        {
          statusCode: 401,
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Expired',
        },
        { status: 401 }
      )
    ),
    http.post(`${TEST_API_URL}/auth/refresh`, () => {
      refreshCount++;
      return HttpResponse.json(
        { statusCode: 401, code: 'REFRESH_TOKEN_INVALID', message: 'Expired' },
        { status: 401 }
      );
    })
  );
  await expect(apiInstances.service.get('private')).rejects.toBeInstanceOf(
    ApiError
  );
  expect(refreshCount).toBe(1);
  expect(queryClient.getQueryData(['private'])).toBeUndefined();
  expect(useStore.getState().isAuthenticated).toBe(false);
});

it('stops after a retried request is still unauthorized', async () => {
  let calls = 0;
  mockServer.use(
    http.get(`${TEST_API_URL}/private`, () => {
      calls++;
      return HttpResponse.json(
        {
          statusCode: 401,
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Expired',
        },
        { status: 401 }
      );
    }),
    http.post(
      `${TEST_API_URL}/auth/refresh`,
      () => new HttpResponse(null, { status: 200 })
    )
  );
  await expect(apiInstances.service.get('private')).rejects.toMatchObject({
    status: 401,
  });
  expect(calls).toBe(2);
});

it('sends Origin for protected mutations', async () => {
  mockServer.use(
    http.post(`${TEST_API_URL}/manager/classes/c1/materials`, ({ request }) => {
      expect(request.headers.get('origin')).toBe('https://mobile.mindy.test');
      return HttpResponse.json({ id: 'm1' });
    })
  );
  await expect(
    apiInstances.service.post('manager/classes/c1/materials', {})
  ).resolves.toEqual({ id: 'm1' });
});

it('shares a failed refresh even when another concurrent 401 arrives later', async () => {
  let requests = 0;
  let refreshes = 0;
  mockServer.use(
    http.get(`${TEST_API_URL}/private-delayed`, async () => {
      requests++;
      if (requests > 1) await delay(80);
      return HttpResponse.json(
        {
          statusCode: 401,
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Expired',
        },
        { status: 401 }
      );
    }),
    http.post(`${TEST_API_URL}/auth/refresh`, () => {
      refreshes++;
      return HttpResponse.json(
        { statusCode: 401, code: 'REFRESH_TOKEN_INVALID', message: 'Expired' },
        { status: 401 }
      );
    })
  );
  const results = await Promise.allSettled([
    apiInstances.service.get('private-delayed'),
    apiInstances.service.get('private-delayed'),
  ]);
  expect(results.every((result) => result.status === 'rejected')).toBe(true);
  expect(refreshes).toBe(1);
});

it('does not try to refresh a direct refresh request or other 401 codes', async () => {
  let refreshes = 0;
  mockServer.use(
    http.post(`${TEST_API_URL}/auth/refresh`, () => {
      refreshes++;
      return HttpResponse.json(
        {
          statusCode: 401,
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Expired',
        },
        { status: 401 }
      );
    }),
    http.get(`${TEST_API_URL}/denied`, () =>
      HttpResponse.json(
        { statusCode: 401, code: 'ACCOUNT_DISABLED', message: 'Denied' },
        { status: 401 }
      )
    )
  );
  await expect(
    apiInstances.service.post('auth/refresh', {})
  ).rejects.toMatchObject({ status: 401 });
  await expect(apiInstances.service.get('denied')).rejects.toMatchObject({
    code: 'ACCOUNT_DISABLED',
  });
  expect(refreshes).toBe(1);
});

it('normalizes a malformed backend envelope using its HTTP status', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/invalid-envelope`, () =>
      HttpResponse.text('Bad gateway', { status: 502 })
    )
  );
  await expect(
    apiInstances.service.get('invalid-envelope')
  ).rejects.toMatchObject({ status: 502, code: 'HTTP_ERROR' });
});

it.each([
  ['POST', 'mentor/classes/c1/units/u1/materials'],
  ['PATCH', 'manager/classes/c1/units/u1/release'],
  ['POST', 'me/classes/c1/materials/m1/files/f1/access'],
  ['DELETE', 'manager/materials/m1'],
] as const)('adds Origin on %s %s', async (method, path) => {
  mockServer.use(
    http.all(`${TEST_API_URL}/${path}`, ({ request }) => {
      expect(request.headers.get('origin')).toBe('https://mobile.mindy.test');
      return HttpResponse.json({ ok: true });
    })
  );
  if (method === 'POST') await apiInstances.service.post(path, {});
  else if (method === 'PATCH') await apiInstances.service.patch(path, {});
  else await apiInstances.service.delete(path);
});

it('blocks protected mutations before sending when APP_ORIGIN is missing', async () => {
  const origin = env.APP_ORIGIN;
  const handler = jest.fn(() => HttpResponse.json({ ok: true }));
  mockServer.use(
    http.post(`${TEST_API_URL}/manager/materials/m1/approve`, handler)
  );
  try {
    env.APP_ORIGIN = '';
    await expect(
      apiInstances.service.post('manager/materials/m1/approve', {
        expectedRevision: 1,
      })
    ).rejects.toMatchObject({ code: 'APP_ORIGIN_REQUIRED' });
    expect(handler).not.toHaveBeenCalled();
  } finally {
    env.APP_ORIGIN = origin;
  }
});

it('encodes timezone offsets and query values without losing zero or false', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/test/query`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('from')).toBe('2026-10-17T09:00:00+07:00');
      expect(params.get('page')).toBe('0');
      expect(params.get('active')).toBe('false');
      expect(params.getAll('role')).toEqual(['STUDENT', 'MENTOR']);
      expect(params.has('missing')).toBe(false);
      expect(params.has('empty')).toBe(false);
      return HttpResponse.json({ ok: true });
    })
  );
  await expect(
    apiInstances.service.get('test/query', {
      params: {
        from: '2026-10-17T09:00:00+07:00',
        page: 0,
        active: false,
        role: ['STUDENT', 'MENTOR'],
        missing: undefined,
        empty: null,
      },
    })
  ).resolves.toEqual({ ok: true });
});

it('shares one refresh across HTTP instances using the same backend', async () => {
  const otherClient = new Http(TEST_API_URL);
  let refreshed = false;
  let refreshes = 0;
  mockServer.use(
    http.get(`${TEST_API_URL}/test/shared-session`, () =>
      refreshed
        ? HttpResponse.json({ ok: true })
        : HttpResponse.json(
            {
              statusCode: 401,
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Expired',
            },
            { status: 401 }
          )
    ),
    http.post(`${TEST_API_URL}/auth/refresh`, async () => {
      refreshes++;
      await delay(40);
      refreshed = true;
      return new HttpResponse(null, { status: 200 });
    })
  );
  await expect(
    Promise.all([
      apiInstances.service.get('test/shared-session'),
      otherClient.get('test/shared-session'),
    ])
  ).resolves.toEqual([{ ok: true }, { ok: true }]);
  expect(refreshes).toBe(1);
});

it('does not retry mutations after a transport failure', async () => {
  const handler = jest.fn(() => HttpResponse.error());
  mockServer.use(http.post(`${TEST_API_URL}/test/no-retry`, handler));
  await expect(
    apiInstances.service.post('test/no-retry', { expectedVersion: 1 })
  ).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  expect(handler).toHaveBeenCalledTimes(1);
});
