import { z } from 'zod';
import { ApiError } from '@/shared/utilities/apiError';
import { dateTime } from '@/modules/home/schemas/homeResponse.schema';

const amount = z.number().int().min(0).max(1e12);
export const orderSchema = z.object({
  id: z.string().uuid(),
  orderCode: z.string().min(1),
  paymentType: z.enum(['PAYOS', 'CASH']),
  status: z.enum(['PENDING', 'PAID', 'EXPIRED', 'CANCELLED']),
  totalAmount: amount,
  expiresAt: dateTime,
  details: z.array(
    z.object({ classId: z.string().uuid(), courseTitle: z.string() })
  ),
});
export const paymentSchema = z.object({
  status: z.enum(['CREATING', 'PENDING', 'SUCCEEDED', 'REQUIRES_REVIEW']),
  qrCode: z.string().min(1).nullable(),
  expiresAt: dateTime.nullable(),
  amount,
});
export const orderPaymentSchema = orderSchema.extend({
  payment: paymentSchema.nullable(),
});
export const ordersPageSchema = z.object({
  items: z.array(orderSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type OrderDto = z.infer<typeof orderSchema>;
export type PaymentDto = z.infer<typeof paymentSchema>;
export const invalidPaymentResponse = () =>
  new ApiError({
    statusCode: 502,
    code: 'INVALID_PAYMENT_RESPONSE',
    message: 'Invalid payment response',
  });
