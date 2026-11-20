export type OrderStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
export type OrderFilter = OrderStatus | 'ALL';
export const orderFilters: OrderFilter[] = [
  'ALL',
  'PENDING',
  'PAID',
  'EXPIRED',
  'CANCELLED',
];

/** UI model matching the backend order snapshot, independent of payment polling. */
export type Order = {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentType: 'PAYOS' | 'CASH';
  totalAmount: number;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
  paymentReview?: boolean;
  details: {
    id: string;
    classId: string;
    imgUrl?: string | null;
    courseTitle: string;
    className: string;
    priceAmount: number;
    quantity: number;
    totalAmount: number;
  }[];
};

export function formatOrderDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language === 'vi-VN' ? 'vi-VN' : 'en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

/** Client-side search over already loaded orders (the list API has no query param). */
export function matchesOrderQuery(order: Order, query: string) {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return true;
  return [
    order.orderCode,
    ...order.details.flatMap((d) => [d.courseTitle, d.className]),
  ].some((value) => value.toLocaleLowerCase().includes(q));
}
