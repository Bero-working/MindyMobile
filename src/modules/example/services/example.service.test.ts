import { http, HttpResponse } from 'msw';
import { exampleService } from './example.service';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('checks the Mindy health endpoint without fetching a demo user', async () => {
  const health = { status: 'ok', timestamp: '2026-10-17T07:00:00.000Z' };
  mockServer.use(
    http.get(`${TEST_API_URL}/health/live`, () => HttpResponse.json(health))
  );
  await expect(exampleService.checkHealth()).resolves.toEqual(health);
});

it('rejects a failed backend health check', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/health/live`, () =>
      HttpResponse.json(
        { statusCode: 503, code: 'UNAVAILABLE', message: 'Unavailable' },
        { status: 503 }
      )
    )
  );
  await expect(exampleService.checkHealth()).rejects.toMatchObject({
    status: 503,
    code: 'UNAVAILABLE',
  });
});

it('does not report success for an invalid health response', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/health/live`, () =>
      HttpResponse.json({ users: [] })
    )
  );
  await expect(exampleService.checkHealth()).rejects.toMatchObject({
    code: 'INVALID_HEALTH_RESPONSE',
  });
});
