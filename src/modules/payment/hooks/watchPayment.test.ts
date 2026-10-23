import { http, HttpResponse, delay } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL as base } from '../../../../tests/mocks/constants';
import {
  apiOrder,
  apiPayment,
  commerceId as id,
} from '../../../../tests/fixtures/commerce';
import { watchPayment } from './watchPayment';

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  mockServer.resetHandlers();
  jest.useRealTimers();
});
afterAll(() => mockServer.close());
const callbacks = () => ({ onOrder: jest.fn(), onPayment: jest.fn() });
it('reads before creating a link, polls GET only and stops when PAID', async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  const events: string[] = [];
  mockServer.use(
    http.get(base + '/me/orders/:id', () => {
      events.push('GET');
      return HttpResponse.json({
        ...apiOrder(),
        status: events.length > 2 ? 'PAID' : 'PENDING',
        payment: null,
      });
    }),
    http.post(base + '/me/orders/:id/payments/payos', () => {
      events.push('POST');
      return HttpResponse.json(apiPayment(), { status: 201 });
    })
  );
  const cb = callbacks();
  const task = watchPayment(id(500), {
    signal: new AbortController().signal,
    ...cb,
  });
  await jest.advanceTimersByTimeAsync(4000);
  await task;
  expect(events).toEqual(['GET', 'POST', 'GET']);
  expect(cb.onOrder).toHaveBeenLastCalledWith(
    expect.objectContaining({ status: 'PAID' })
  );
  await jest.advanceTimersByTimeAsync(20000);
  expect(events).toHaveLength(3);
});
it.each(['PAID', 'CANCELLED', 'EXPIRED', 'REQUIRES_REVIEW'])(
  'never creates a link for %s',
  async (state) => {
    let writes = 0;
    mockServer.use(
      http.get(base + '/me/orders/:id', () =>
        HttpResponse.json({
          ...apiOrder(),
          status: state === 'REQUIRES_REVIEW' ? 'PENDING' : state,
          payment: state === 'REQUIRES_REVIEW' ? apiPayment(state) : null,
        })
      ),
      http.post(base + '/me/orders/:id/payments/payos', () => {
        writes++;
        return HttpResponse.json(apiPayment());
      })
    );
    await watchPayment(id(500), {
      signal: new AbortController().signal,
      ...callbacks(),
    });
    expect(writes).toBe(0);
  }
);
it('rechecks GET after link conflict and preserves a late PAID result', async () => {
  let reads = 0;
  mockServer.use(
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({
        ...apiOrder(),
        status: ++reads === 1 ? 'PENDING' : 'PAID',
        payment: null,
      })
    ),
    http.post(base + '/me/orders/:id/payments/payos', () =>
      HttpResponse.json(
        { statusCode: 409, code: 'PAYMENT_ORDER_INVALID', message: 'Conflict' },
        { status: 409 }
      )
    )
  );
  const cb = callbacks();
  await watchPayment(id(500), { signal: new AbortController().signal, ...cb });
  expect(cb.onOrder).toHaveBeenLastCalledWith(
    expect.objectContaining({ status: 'PAID' })
  );
});
it('bounds pending polling to 120 seconds and aborts further reads', async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  const times: number[] = [];
  const start = Date.now();
  mockServer.use(
    http.get(base + '/me/orders/:id', () => {
      times.push(Date.now() - start);
      return HttpResponse.json({ ...apiOrder(), payment: apiPayment() });
    })
  );
  const task = watchPayment(id(500), {
    signal: new AbortController().signal,
    ...callbacks(),
  });
  const rejected = task.catch((error: Error) => error);
  await jest.advanceTimersByTimeAsync(121000);
  await expect(rejected).resolves.toMatchObject({
    code: 'PAYMENT_CONFIRMATION_TIMEOUT',
  });
  expect(times.slice(0, 4)).toEqual([0, 3000, 8000, 18000]);
  const count = times.length;
  await jest.advanceTimersByTimeAsync(30000);
  expect(times).toHaveLength(count);
});
it('cancels during backoff without another request', async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  let reads = 0;
  mockServer.use(
    http.get(base + '/me/orders/:id', () => {
      reads++;
      return HttpResponse.json({ ...apiOrder(), payment: apiPayment() });
    })
  );
  const controller = new AbortController();
  const task = watchPayment(id(500), {
    signal: controller.signal,
    ...callbacks(),
  });
  const rejected = task.catch((error: Error) => error);
  await jest.advanceTimersByTimeAsync(1000);
  controller.abort();
  await jest.advanceTimersByTimeAsync(20000);
  await expect(rejected).resolves.toMatchObject({
    name: 'PaymentCancelled',
  });
  expect(reads).toBe(1);
});

it.each([403, 404, 503])(
  'stops after HTTP %s without creating a link or repeating GET',
  async (status) => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    let reads = 0;
    mockServer.use(
      http.get(base + '/me/orders/:id', () => {
        reads++;
        return HttpResponse.json(
          { statusCode: status, code: 'ORDER_ERROR', message: 'Unavailable' },
          { status }
        );
      })
    );
    const task = watchPayment(id(500), {
      signal: new AbortController().signal,
      ...callbacks(),
    });
    const rejected = task.catch((error: Error) => error);
    await jest.advanceTimersByTimeAsync(1000);
    await expect(rejected).resolves.toMatchObject({ status });
    await jest.advanceTimersByTimeAsync(20000);
    expect(reads).toBe(1);
  }
);
it('includes slow network requests in the 120 second wall-clock limit', async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  const cb = callbacks();
  mockServer.use(
    http.get(base + '/me/orders/:id', async () => {
      await delay(130000);
      return HttpResponse.json({
        ...apiOrder(),
        status: 'PAID',
        payment: null,
      });
    })
  );
  const task = watchPayment(id(500), {
    signal: new AbortController().signal,
    ...cb,
  });
  const rejected = task.catch((error: Error) => error);
  await jest.advanceTimersByTimeAsync(121000);
  await expect(rejected).resolves.toMatchObject({
    code: 'PAYMENT_CONFIRMATION_TIMEOUT',
  });
  await jest.advanceTimersByTimeAsync(20000);
  expect(cb.onOrder).not.toHaveBeenCalled();
});
it('waits for backend PAID when the link endpoint reports SUCCEEDED', async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  let reads = 0;
  mockServer.use(
    http.get(base + '/me/orders/:id', () => {
      reads++;
      return HttpResponse.json({
        ...apiOrder(),
        status: reads >= 3 ? 'PAID' : 'PENDING',
        payment: reads > 1 ? apiPayment('SUCCEEDED') : null,
      });
    }),
    http.post(base + '/me/orders/:id/payments/payos', () =>
      HttpResponse.json(apiPayment('SUCCEEDED'), { status: 201 })
    )
  );
  const cb = callbacks();
  const task = watchPayment(id(500), {
    signal: new AbortController().signal,
    ...cb,
  });
  await jest.advanceTimersByTimeAsync(1000);
  expect(cb.onOrder).toHaveBeenLastCalledWith(
    expect.objectContaining({ status: 'PENDING' })
  );
  await jest.advanceTimersByTimeAsync(4000);
  await task;
  expect(cb.onOrder).toHaveBeenLastCalledWith(
    expect.objectContaining({ status: 'PAID' })
  );
});

it('stops on link review and suppresses a closed-order retry even if GET payment is temporarily missing', async () => {
  let reads = 0;
  mockServer.use(
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({
        ...apiOrder(),
        status: ++reads === 1 ? 'PENDING' : 'EXPIRED',
        payment: null,
      })
    ),
    http.post(base + '/me/orders/:id/payments/payos', () =>
      HttpResponse.json(apiPayment('REQUIRES_REVIEW'), { status: 201 })
    )
  );
  const cb = callbacks();
  await watchPayment(id(500), { signal: new AbortController().signal, ...cb });
  expect(cb.onOrder).toHaveBeenLastCalledWith(
    expect.objectContaining({
      payment: expect.objectContaining({ status: 'REQUIRES_REVIEW' }),
    })
  );
  expect(reads).toBe(2);
});

it('stops when authentication refresh fails and never creates a payment', async () => {
  let reads = 0,
    refreshes = 0;
  mockServer.use(
    http.get(base + '/me/orders/:id', () => {
      reads++;
      return HttpResponse.json(
        {
          statusCode: 401,
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Session expired',
        },
        { status: 401 }
      );
    }),
    http.post(base + '/auth/refresh', () => {
      refreshes++;
      return HttpResponse.json(
        {
          statusCode: 401,
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Session expired',
        },
        { status: 401 }
      );
    })
  );
  await expect(
    watchPayment(id(500), {
      signal: new AbortController().signal,
      ...callbacks(),
    })
  ).rejects.toMatchObject({ status: 401 });
  expect(reads).toBe(1);
  expect(refreshes).toBe(1);
});

it('does not POST when session ownership changes as the GET result is published', async () => {
  let cancelled = false,
    writes = 0;
  const controller = new AbortController();
  mockServer.use(
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({ ...apiOrder(), payment: null })
    ),
    http.post(base + '/me/orders/:id/payments/payos', () => {
      writes++;
      controller.abort();
      return HttpResponse.json(apiPayment());
    })
  );
  await expect(
    watchPayment(id(500), {
      signal: controller.signal,
      cancelled: () => cancelled,
      onOrder: () => {
        cancelled = true;
      },
      onPayment: jest.fn(),
    })
  ).rejects.toMatchObject({ name: 'PaymentCancelled' });
  expect(writes).toBe(0);
});
