import { ApiError } from '@/shared/utilities/apiError';
import { verifiedResumeOrder } from '@/modules/my-classes/services/resumeOrder.service';
import { canPayOrder } from '../paymentResult';
import {
  PaymentCancelled,
  paymentService,
  waitForPayosLink,
  type OrderPayment,
} from '../services/payment.service';
import type { PaymentDto } from '../schemas/order.schema';

const PAYMENT_WATCH_LIMIT = 120_000;
function paymentDelay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new PaymentCancelled());
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new PaymentCancelled());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}
const timeoutError = () =>
  new ApiError({
    statusCode: 0,
    code: 'PAYMENT_CONFIRMATION_TIMEOUT',
    message: 'Confirmation time limit reached',
  });
const terminal = (order: OrderPayment) =>
  order.status !== 'PENDING' || order.payment?.status === 'REQUIRES_REVIEW';

// One sequential verification session. Only the first verified pending order may create a link.
export async function watchPayment(
  orderId: string,
  options: {
    signal: AbortSignal;
    verifyEnrollment?: boolean;
    cancelled?: () => boolean;
    onOrder: (order: OrderPayment) => void;
    onPayment: (payment: PaymentDto) => void;
  }
) {
  const started = Date.now();
  const local = new AbortController();
  const cancel = () => local.abort();
  options.signal.addEventListener('abort', cancel, { once: true });
  if (options.signal.aborted) local.abort();
  let timedOut = false;
  const deadline = setTimeout(() => {
    timedOut = true;
    local.abort();
  }, PAYMENT_WATCH_LIMIT);
  const remaining = () =>
    Math.max(1, PAYMENT_WATCH_LIMIT - (Date.now() - started));
  const assertActive = () => {
    if (options.cancelled?.()) {
      local.abort();
      throw new PaymentCancelled();
    }
    if (local.signal.aborted)
      throw timedOut ? timeoutError() : new PaymentCancelled();
  };
  const read = async (latestPayment?: PaymentDto) => {
    assertActive();
    let order = await paymentService.order(orderId, local.signal, remaining());
    assertActive();
    if (
      order.status !== 'PAID' &&
      latestPayment?.status === 'REQUIRES_REVIEW'
    ) {
      order = { ...order, payment: latestPayment };
    }
    options.onOrder(order);
    assertActive();
    return order;
  };
  try {
    let order = await read();
    if (terminal(order)) return;
    if (canPayOrder(order)) {
      if (options.verifyEnrollment) {
        // Read the order first so a newly PAID order is never rejected by stale enrollment state.
        try {
          order = await verifiedResumeOrder(orderId, local.signal);
          assertActive();
          options.onOrder(order);
        } catch (error) {
          assertActive();
          const latest = await read();
          if (terminal(latest)) return;
          throw error;
        }
      }
      if (
        order.payment?.status === 'PENDING' &&
        order.payment.qrCode &&
        (!order.payment.expiresAt ||
          Date.parse(order.payment.expiresAt) > Date.now())
      ) {
        options.onPayment(order.payment);
      } else {
        try {
          const payment = await waitForPayosLink(orderId, {
            signal: local.signal,
            cancelled: () => local.signal.aborted || !!options.cancelled?.(),
            sleep: (ms) => paymentDelay(ms, local.signal),
          });
          assertActive();
          if (payment.status === 'REQUIRES_REVIEW')
            options.onOrder({ ...order, payment });
          options.onPayment(payment);
          if (
            payment.status === 'SUCCEEDED' ||
            payment.status === 'REQUIRES_REVIEW'
          ) {
            order = await read(payment);
            if (terminal(order)) return;
          }
        } catch (error) {
          assertActive();
          if (error instanceof ApiError && error.status === 409) {
            order = await read();
            if (terminal(order)) return;
          }
          throw error;
        }
      }
    }
    for (let attempt = 0; ; attempt++) {
      await paymentDelay(
        Math.min([3000, 5000][attempt] ?? 10000, remaining()),
        local.signal
      );
      order = await read();
      if (terminal(order)) return;
    }
  } catch (error) {
    if (timedOut) throw timeoutError();
    if (options.signal.aborted) throw new PaymentCancelled();
    throw error;
  } finally {
    clearTimeout(deadline);
    options.signal.removeEventListener('abort', cancel);
    local.abort();
  }
}
