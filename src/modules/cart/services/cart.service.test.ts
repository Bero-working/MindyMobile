import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import { cartService } from './cart.service';

const id = (n: number) =>
  `33333333-3333-4333-8333-${String(n).padStart(12, '0')}`;
const cartItem = (n: number, extra: object = {}) => ({
  classId: id(n),
  classCode: 'WEB101-' + n,
  className: 'Web lớp ' + n,
  courseId: id(100 + n),
  courseTitle: 'Web cơ bản',
  deliveryMode: 'ONLINE',
  startDate: '2026-10-13',
  endDate: '2026-11-14',
  priceSnapshot: 1500000,
  currentPriceAmount: 1500000,
  isPurchasable: true,
  addedAt: '2026-10-10T03:00:00.000Z',
  ...extra,
});
const order = {
  id: id(500),
  orderCode: 'MD7K3QX9PA2B4C',
  paymentType: 'PAYOS',
  status: 'PENDING',
  totalAmount: 1500000,
  expiresAt: '2026-10-12T10:15:00.000Z',
  paidAt: null,
  mentorId: null,
  createdAt: '2026-10-12T10:00:00.000Z',
  details: [
    {
      id: id(600),
      classId: id(1),
      courseTitle: 'Web cơ bản',
      className: 'Web lớp 1',
      priceAmount: 1500000,
      quantity: 1,
      totalAmount: 1500000,
    },
  ],
};
const conflict = (code: string, status = 409) =>
  HttpResponse.json({ statusCode: status, code, message: code }, { status });
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('reads the cart including price changes and unpurchasable items', async () => {
  const body = {
    items: [
      cartItem(1, { currentPriceAmount: 1200000 }),
      cartItem(2, { isPurchasable: false }),
    ],
    totalAmount: 2700000,
  };
  mockServer.use(
    http.get(TEST_API_URL + '/me/cart', () => HttpResponse.json(body))
  );
  await expect(cartService.get()).resolves.toEqual(body);
});

it('adds a class with only its id and returns the server cart', async () => {
  mockServer.use(
    http.post(TEST_API_URL + '/me/cart/items', async ({ request }) => {
      expect(await request.json()).toEqual({ classId: id(1) });
      return HttpResponse.json(
        { items: [cartItem(1)], totalAmount: 1500000 },
        { status: 201 }
      );
    })
  );
  await expect(cartService.add(id(1))).resolves.toMatchObject({
    totalAmount: 1500000,
  });
});

it.each([
  'CART_ITEM_ALREADY_EXISTS',
  'CART_LIMIT_EXCEEDED',
  'CLASS_NOT_OPEN',
  'CLASS_FULL',
  'CLASS_ALREADY_ENROLLED',
])('surfaces %s by code when adding', async (code) => {
  mockServer.use(
    http.post(TEST_API_URL + '/me/cart/items', () => conflict(code))
  );
  await expect(cartService.add(id(1))).rejects.toMatchObject({
    status: 409,
    code,
  });
});

it('removes a class and surfaces CART_ITEM_NOT_FOUND', async () => {
  mockServer.use(
    http.delete(TEST_API_URL + '/me/cart/items/:classId', ({ params }) =>
      params.classId === id(1)
        ? new HttpResponse(null, { status: 204 })
        : conflict('CART_ITEM_NOT_FOUND', 404)
    )
  );
  await expect(cartService.remove(id(1))).resolves.toBeUndefined();
  await expect(cartService.remove(id(2))).rejects.toMatchObject({
    status: 404,
    code: 'CART_ITEM_NOT_FOUND',
  });
});

it('checks out with PAYOS only and returns the created order', async () => {
  mockServer.use(
    http.post(TEST_API_URL + '/me/cart/checkout', async ({ request }) => {
      expect(await request.json()).toEqual({ paymentType: 'PAYOS' });
      return HttpResponse.json({ orders: [order] }, { status: 201 });
    })
  );
  await expect(cartService.checkout()).resolves.toMatchObject({
    id: order.id,
    orderCode: order.orderCode,
  });
});

it('rejects malformed carts and checkout results', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/cart', () =>
      HttpResponse.json({
        items: [cartItem(1, { priceSnapshot: -1 })],
        totalAmount: 0,
      })
    ),
    http.post(TEST_API_URL + '/me/cart/checkout', () =>
      HttpResponse.json({ orders: [] }, { status: 201 })
    )
  );
  await expect(cartService.get()).rejects.toMatchObject({
    code: 'INVALID_CART_RESPONSE',
  });
  await expect(cartService.checkout()).rejects.toMatchObject({
    code: 'INVALID_CART_RESPONSE',
  });
});
