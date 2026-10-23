import type { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import {
  invalidPaymentResponse,
  orderPaymentSchema,
  ordersPageSchema,
  paymentSchema,
  type OrderDto,
  type PaymentDto,
} from '../schemas/order.schema';

const parse = <S extends z.ZodTypeAny>(
  schema: S,
  value: object
): z.infer<S> => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw invalidPaymentResponse();
  return parsed.data;
};
export type OrderPayment = z.infer<typeof orderPaymentSchema>;
export const paymentService = {
  async order(
    orderId: string,
    signal?: AbortSignal,
    timeout?: number
  ): Promise<OrderPayment> {
    const response = await apiInstances.service.get<OrderPayment>(
      `me/orders/${orderId}`,
      {
        ...(signal ? { signal } : {}),
        ...(timeout === undefined ? {} : { timeout }),
      }
    );
    const order = parse(orderPaymentSchema, response);
    if (order.id !== orderId) throw invalidPaymentResponse();
    return order;
  },
  // Creates or reuses the PayOS link; safe to call repeatedly.
  async createPayos(
    orderId: string,
    config: { signal?: AbortSignal; timeout?: number } = {}
  ): Promise<PaymentDto> {
    const response = await apiInstances.service.post<
      PaymentDto,
      Record<string, never>
    >(`me/orders/${orderId}/payments/payos`, {}, config);
    return parse(paymentSchema, response);
  },
  // Used only after a lost checkout response: find the PAYOS order holding exactly these classes.
  async findPendingPayosOrder(classIds: string[]): Promise<OrderDto | null> {
    const response = await apiInstances.service.get<{ items: OrderDto[] }>(
      'me/orders',
      { params: { status: 'PENDING', page: 1, pageSize: 5 } }
    );
    const wanted = [...new Set(classIds)].sort().join(',');
    return (
      parse(ordersPageSchema, response).items.find(
        (order) =>
          order.paymentType === 'PAYOS' &&
          order.status === 'PENDING' &&
          [...new Set(order.details.map((d) => d.classId))].sort().join(',') ===
            wanted
      ) ?? null
    );
  },
};
const BACKOFF_MS = [2000, 4000, 8000];
const WAIT_LIMIT_MS = 30_000;
export class PaymentCancelled extends Error {
  constructor() {
    super('Payment request cancelled');
    this.name = 'PaymentCancelled';
  }
}
// CREATING means PayOS is still preparing the link: retry with backoff, then give up with qrCode null.
export async function waitForPayosLink(
  orderId: string,
  options: {
    sleep: (ms: number) => Promise<void>;
    cancelled: () => boolean;
    signal?: AbortSignal;
  }
): Promise<PaymentDto> {
  let waited = 0;
  const started = Date.now();
  let last: PaymentDto | null = null;
  const elapsed = () => Math.max(waited, Date.now() - started);
  const missing = (value: PaymentDto): PaymentDto => ({
    ...value,
    status: 'PENDING',
    qrCode: null,
  });
  for (let attempt = 0; ; attempt++) {
    if (options.cancelled() || options.signal?.aborted)
      throw new PaymentCancelled();
    const remaining = WAIT_LIMIT_MS - elapsed();
    if (remaining <= 0 && last) return missing(last);
    let payment: PaymentDto;
    try {
      payment = await paymentService.createPayos(orderId, {
        timeout: Math.max(1, remaining),
        ...(options.signal ? { signal: options.signal } : {}),
      });
    } catch (cause) {
      if (options.cancelled() || options.signal?.aborted)
        throw new PaymentCancelled();
      if (elapsed() >= WAIT_LIMIT_MS && last) return missing(last);
      throw cause;
    }
    if (options.cancelled() || options.signal?.aborted)
      throw new PaymentCancelled();
    if (payment.status !== 'CREATING') return payment;
    last = payment;
    const delay = BACKOFF_MS[attempt] ?? 8000;
    if (elapsed() + delay > WAIT_LIMIT_MS) return missing(payment);
    await options.sleep(delay);
    waited += delay;
  }
}
