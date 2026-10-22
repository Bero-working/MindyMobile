import type { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import type { OrderDto } from '@/modules/payment/schemas/order.schema';
import {
  cartSchema,
  checkoutSchema,
  invalidCartResponse,
} from '../schemas/cart.schema';
import type { Cart } from '../types/cart.type';

const parse = <S extends z.ZodTypeAny>(
  schema: S,
  value: object
): z.infer<S> => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw invalidCartResponse();
  return parsed.data;
};
export const cartService = {
  async get(signal?: AbortSignal): Promise<Cart> {
    const response = await apiInstances.service.get<Cart>(
      'me/cart',
      signal ? { signal } : {}
    );
    return parse(cartSchema, response);
  },
  // Prices are never sent; the server computes them.
  async add(classId: string): Promise<Cart> {
    const response = await apiInstances.service.post<Cart, { classId: string }>(
      'me/cart/items',
      { classId }
    );
    return parse(cartSchema, response);
  },
  async remove(classId: string): Promise<void> {
    await apiInstances.service.delete<void>(`me/cart/items/${classId}`);
  },
  async checkout(): Promise<OrderDto> {
    const response = await apiInstances.service.post<
      { orders: OrderDto[] },
      { paymentType: 'PAYOS' }
    >('me/cart/checkout', { paymentType: 'PAYOS' });
    const [order] = parse(checkoutSchema, response).orders;
    if (!order) throw invalidCartResponse();
    return order;
  },
};
