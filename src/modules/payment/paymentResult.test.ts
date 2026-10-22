import { apiOrder, apiPayment } from '../../../tests/fixtures/commerce';
import { orderPaymentSchema } from './schemas/order.schema';
import { paymentResult, canPayOrder } from './paymentResult';

it.each(['PAID', 'CANCELLED', 'EXPIRED'] as const)(
  'maps verified %s to its ticket',
  (status) => {
    const order = orderPaymentSchema.parse({
      ...apiOrder(),
      status,
      payment: null,
    });
    expect(paymentResult(order)?.state).toBe(status);
    expect(canPayOrder(order)).toBe(false);
  }
);
it('does not turn succeeded payment or expired countdown into a successful/expired order', () => {
  const order = orderPaymentSchema.parse({
    ...apiOrder(),
    expiresAt: '2000-01-01T00:00:00Z',
    payment: apiPayment('SUCCEEDED'),
  });
  expect(paymentResult(order)).toBeUndefined();
  expect(canPayOrder(order)).toBe(false);
});
it.each(['PENDING', 'EXPIRED', 'CANCELLED'] as const)(
  'never invites repayment of review order %s',
  (status) => {
    const order = orderPaymentSchema.parse({
      ...apiOrder(),
      status,
      payment: apiPayment('REQUIRES_REVIEW'),
    });
    expect(paymentResult(order)).toBeUndefined();
    expect(canPayOrder(order)).toBe(false);
  }
);
it('gives verified PAID priority over a stale review payment', () => {
  const order = orderPaymentSchema.parse({
    ...apiOrder(),
    status: 'PAID',
    payment: apiPayment('REQUIRES_REVIEW'),
  });
  expect(paymentResult(order)?.state).toBe('PAID');
});
