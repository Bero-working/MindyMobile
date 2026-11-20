import type { DeliveryMode } from '@/modules/courses/types/courses.type';
export type CheckoutPaymentType = 'PAYOS' | 'CASH';
export type CartItem = {
  classId: string;
  classCode: string;
  className: string;
  courseId: string;
  courseTitle: string;
  deliveryMode: DeliveryMode;
  startDate: string;
  endDate: string;
  priceSnapshot: number;
  currentPriceAmount: number;
  isPurchasable: boolean;
  addedAt: string;
  imgUrl?: string | null | undefined;
};
export type Cart = { items: CartItem[]; totalAmount: number };
