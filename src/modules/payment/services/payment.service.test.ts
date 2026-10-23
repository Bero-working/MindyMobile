import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import { paymentService, waitForPayosLink } from './payment.service';

const id = (n: number) =>
  `55555555-5555-4555-8555-${String(n).padStart(12, '0')}`;
const order = (n: number, classIds: string[], extra: object = {}) => ({
  id: id(n),
  orderCode: 'MD' + n,
  paymentType: 'PAYOS',
  status: 'PENDING',
  totalAmount: 1500000,
  expiresAt: '2026-10-18T10:15:00.000Z',
  paidAt: null,
  mentorId: null,
  createdAt: '2026-10-18T10:00:00.000Z',
  details: classIds.map((classId) => ({
    id: id(900),
    classId,
    courseTitle: 'Web',
    className: 'A',
    priceAmount: 1500000,
    quantity: 1,
    totalAmount: 1500000,
  })),
  ...extra,
});
const payment = (status: string, qrCode: string | null = null) => ({
  paymentId: id(800),
  orderId: id(1),
  providerOrderCode: 1000000000,
  status,
  checkoutUrl: status === 'PENDING' ? 'https://pay.payos.vn/web/x' : null,
  qrCode,
  expiresAt: '2026-10-18T10:15:00.000Z',
  amount: 1500000,
});
const error = (status: number, code: string) =>
  HttpResponse.json({ statusCode: status, code, message: code }, { status });
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('reads the order with its nullable payment', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders/:id', () =>
      HttpResponse.json({ ...order(1, [id(10)]), payment: null })
    )
  );
  await expect(paymentService.order(id(1))).resolves.toMatchObject({
    orderCode: 'MD1',
    payment: null,
  });
});

it('rejects an order response belonging to a different order id', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders/:id', () =>
      HttpResponse.json({ ...order(2, [id(10)]), payment: null })
    )
  );
  await expect(paymentService.order(id(1))).rejects.toMatchObject({
    code: 'INVALID_PAYMENT_RESPONSE',
  });
});

it('retries a CREATING link with 2s then 4s backoff until the QR is ready', async () => {
  const replies = [
    payment('CREATING'),
    payment('CREATING'),
    payment('PENDING', '000201QR'),
  ];
  mockServer.use(
    http.post(
      TEST_API_URL + '/me/orders/:id/payments/payos',
      async ({ request }) => {
        expect(await request.json()).toEqual({});
        return HttpResponse.json(replies.shift(), { status: 201 });
      }
    )
  );
  const waits: number[] = [];
  const result = await waitForPayosLink(id(1), {
    sleep: async (ms) => {
      waits.push(ms);
    },
    cancelled: () => false,
  });
  expect(waits).toEqual([2000, 4000]);
  expect(result).toMatchObject({ status: 'PENDING', qrCode: '000201QR' });
});

it('stops retrying after about 30 seconds and reports a missing QR', async () => {
  let calls = 0;
  mockServer.use(
    http.post(TEST_API_URL + '/me/orders/:id/payments/payos', () => {
      calls++;
      return HttpResponse.json(payment('CREATING'), { status: 201 });
    })
  );
  const waits: number[] = [];
  const result = await waitForPayosLink(id(1), {
    sleep: async (ms) => {
      waits.push(ms);
    },
    cancelled: () => false,
  });
  expect(waits).toEqual([2000, 4000, 8000, 8000, 8000]);
  expect(calls).toBe(5);
  expect(result).toMatchObject({ status: 'PENDING', qrCode: null });
});

it.each([
  [503, 'PAYMENT_UNAVAILABLE'],
  [409, 'PAYMENT_ORDER_INVALID'],
  [422, 'PAYMENT_AMOUNT_INVALID'],
])('surfaces %s %s without retrying', async (status, code) => {
  let calls = 0;
  mockServer.use(
    http.post(TEST_API_URL + '/me/orders/:id/payments/payos', () => {
      calls++;
      return error(status, code);
    })
  );
  await expect(
    waitForPayosLink(id(1), { sleep: async () => {}, cancelled: () => false })
  ).rejects.toMatchObject({ status, code });
  expect(calls).toBe(1);
});

it('finds the pending PAYOS order holding exactly the checked-out classes', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders', ({ request }) => {
      expect(new URL(request.url).search).toBe(
        '?status=PENDING&page=1&pageSize=5'
      );
      return HttpResponse.json({
        items: [
          order(1, [id(10)]),
          order(2, [id(10), id(11)], { paymentType: 'CASH' }),
          order(3, [id(11), id(10)]),
        ],
        page: 1,
        pageSize: 5,
        total: 3,
      });
    })
  );
  await expect(
    paymentService.findPendingPayosOrder([id(10), id(11)])
  ).resolves.toMatchObject({ id: id(3) });
  await expect(
    paymentService.findPendingPayosOrder([id(12)])
  ).resolves.toBeNull();
});

it('includes slow HTTP responses in the 30-second creation budget', async () => {
  let clock = Date.now(),
    calls = 0;
  const now = jest.spyOn(Date, 'now').mockImplementation(() => clock);
  mockServer.use(
    http.post(TEST_API_URL + '/me/orders/:id/payments/payos', () => {
      calls++;
      clock += 12000;
      return HttpResponse.json(payment('CREATING'), { status: 201 });
    })
  );
  try {
    const result = await waitForPayosLink(id(1), {
      cancelled: () => false,
      sleep: async (ms) => {
        clock += ms;
      },
    });
    expect(calls).toBeLessThanOrEqual(2);
    expect(result.qrCode).toBeNull();
  } finally {
    now.mockRestore();
  }
});
it('does not issue a PayOS request after cancellation', async () => {
  let calls = 0;
  mockServer.use(
    http.post(TEST_API_URL + '/me/orders/:id/payments/payos', () => {
      calls++;
      return HttpResponse.json(payment('PENDING', 'QR'));
    })
  );
  await expect(
    waitForPayosLink(id(1), { cancelled: () => true, sleep: async () => {} })
  ).rejects.toThrow();
  expect(calls).toBe(0);
});
