import type { OrderPayment } from './services/payment.service';
import type { PaymentResult } from './resultModel';

export function paymentResult(order: OrderPayment): PaymentResult | undefined {
  if (order.status !== 'PAID' && order.payment?.status === 'REQUIRES_REVIEW')
    return undefined;
  if (order.status === 'PENDING') return undefined;
  return {
    state: order.status,
    orderCode: order.orderCode,
    amount: order.totalAmount,
  };
}
export function canPayOrder(order: OrderPayment) {
  return (
    order.status === 'PENDING' &&
    order.paymentType === 'PAYOS' &&
    order.payment?.status !== 'REQUIRES_REVIEW' &&
    order.payment?.status !== 'SUCCEEDED' &&
    Date.parse(order.expiresAt) > Date.now()
  );
}
