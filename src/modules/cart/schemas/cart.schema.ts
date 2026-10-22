import { z } from 'zod';
import { ApiError } from '@/shared/utilities/apiError';
import { dateTime } from '@/modules/home/schemas/homeResponse.schema';
import { orderSchema } from '@/modules/payment/schemas/order.schema';

const amount = z.number().int().min(0).max(1e12);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const cartSchema = z.object({
  items: z
    .array(
      z.object({
        classId: z.string().uuid(),
        classCode: z.string(),
        className: z.string(),
        courseId: z.string().uuid(),
        courseTitle: z.string(),
        deliveryMode: z.enum(['ONLINE', 'OFFLINE']),
        startDate: date,
        endDate: date,
        priceSnapshot: amount,
        currentPriceAmount: amount,
        isPurchasable: z.boolean(),
        addedAt: dateTime,
      })
    )
    .max(20),
  totalAmount: amount,
});
export const checkoutSchema = z.object({
  orders: z.array(orderSchema).min(1),
});
export const invalidCartResponse = () =>
  new ApiError({
    statusCode: 502,
    code: 'INVALID_CART_RESPONSE',
    message: 'Invalid cart response',
  });
