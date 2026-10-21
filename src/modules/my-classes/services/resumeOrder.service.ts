import { paymentService } from '@/modules/payment/services/payment.service';
import { ApiError } from '@/shared/utilities/apiError';
import { enrollmentAction } from '../access';
import { learningService } from './learning.service';

export async function verifiedResumeOrder(
  orderId: string,
  signal?: AbortSignal
) {
  const rows = await learningService.allClasses('all', signal);
  const candidates = rows.items.filter((row) => row.order?.orderId === orderId);
  if (
    !candidates.length ||
    candidates.some((row) => enrollmentAction(row) !== 'PAYMENT')
  )
    throw new ApiError({
      statusCode: 409,
      code: 'PAYMENT_ORDER_INVALID',
      message: 'Order cannot be resumed',
    });
  const order = await paymentService.order(orderId, signal);
  if (
    order.status !== 'PENDING' ||
    order.paymentType !== 'PAYOS' ||
    order.payment?.status === 'REQUIRES_REVIEW' ||
    order.payment?.status === 'SUCCEEDED' ||
    Date.parse(order.expiresAt) <= Date.parse(rows.asOf)
  )
    throw new ApiError({
      statusCode: 409,
      code: 'PAYMENT_ORDER_INVALID',
      message: 'Order cannot be resumed',
    });
  return order;
}
