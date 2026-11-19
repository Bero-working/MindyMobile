import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL } from '../../../tests/mocks/constants';
import { commerceId } from '../../../tests/fixtures/commerce';
import { ordersService } from './orders.service';
import type { Order } from './types';

export const purchaseFixture = (
  status: Order['status'] = 'PENDING'
): Order => ({
  id: commerceId(500),
  orderCode: 'MD500',
  status,
  paymentType: 'PAYOS',
  totalAmount: 1500000,
  createdAt: '2026-11-01T01:00:00Z',
  paidAt: null,
  expiresAt: new Date(Date.now() + 900000).toISOString(),
  details: [
    {
      id: commerceId(501),
      classId: commerceId(10),
      courseTitle: 'Web',
      className: 'WEB-01',
      quantity: 1,
      priceAmount: 1500000,
      totalAmount: 1500000,
    },
  ],
});

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('sends pagination and optional status without a student ID', async () => {
  const seen: string[] = [];
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders', ({ request }) => {
      const params = new URL(request.url).searchParams;
      seen.push(params.toString());
      return HttpResponse.json({
        items: [purchaseFixture('PAID')],
        page: Number(params.get('page')),
        pageSize: 20,
        total: 21,
      });
    })
  );
  const page = await ordersService.list('PAID', 2);
  expect(page.items[0]?.details[0]?.className).toBe('WEB-01');
  await ordersService.list('ALL', 1);
  expect(seen[0]).toContain('status=PAID');
  expect(seen[0]).toContain('page=2');
  expect(seen[1]).not.toContain('status=');
  expect(seen.join()).not.toContain('studentId');
});

it('reads detail and preserves payment review state', async () => {
  const order = purchaseFixture();
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders/:id', () =>
      HttpResponse.json({ ...order, payment: { status: 'REQUIRES_REVIEW' } })
    )
  );
  expect((await ordersService.detail(order.id)).paymentReview).toBe(true);
});

it('rejects mismatched detail IDs and malformed snapshots', async () => {
  const order = purchaseFixture();
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders/:id', () =>
      HttpResponse.json({ ...order, id: commerceId(999), payment: null })
    )
  );
  await expect(ordersService.detail(order.id)).rejects.toMatchObject({
    code: 'INVALID_ORDER_RESPONSE',
  });
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders/:id', () =>
      HttpResponse.json({ ...order, totalAmount: -1, payment: null })
    )
  );
  await expect(ordersService.detail(order.id)).rejects.toMatchObject({
    code: 'INVALID_ORDER_RESPONSE',
  });
});

it('posts only an empty body and accepts confirmed cancellation', async () => {
  const order = purchaseFixture('CANCELLED');
  let body: object | undefined;
  mockServer.use(
    http.post(TEST_API_URL + '/me/orders/:id/cancel', async ({ request }) => {
      body = (await request.json()) as object;
      return HttpResponse.json(order);
    })
  );
  expect((await ordersService.cancel(order.id)).status).toBe('CANCELLED');
  expect(body).toEqual({});
});

it('never reports success when the cancellation response is still pending', async () => {
  const order = purchaseFixture();
  mockServer.use(
    http.post(TEST_API_URL + '/me/orders/:id/cancel', () =>
      HttpResponse.json(order)
    )
  );
  await expect(ordersService.cancel(order.id)).rejects.toMatchObject({
    code: 'INVALID_ORDER_RESPONSE',
  });
});

it('propagates conflict details and does not retry cancellation', async () => {
  let calls = 0;
  mockServer.use(
    http.post(TEST_API_URL + '/me/orders/:id/cancel', () => {
      calls++;
      return HttpResponse.json(
        {
          statusCode: 409,
          code: 'ORDER_NOT_CANCELLABLE',
          message: 'Conflict',
          requestId: 'req-cancel',
        },
        { status: 409 }
      );
    })
  );
  await expect(ordersService.cancel(commerceId(500))).rejects.toMatchObject({
    status: 409,
    code: 'ORDER_NOT_CANCELLABLE',
    requestId: 'req-cancel',
  });
  expect(calls).toBe(1);
});
