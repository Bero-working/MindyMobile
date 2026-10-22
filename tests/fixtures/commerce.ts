import type { SessionUser } from '@/modules/auth/schemas/authResponse.schema';
export const commerceId = (n: number) =>
  '22222222-2222-4222-8222-' + String(n).padStart(12, '0');
export const student: SessionUser = {
  id: commerceId(999),
  email: 'student@example.test',
  displayName: 'An',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: '2026-10-01T00:00:00Z',
};
export const apiCourse = {
  id: commerceId(1),
  code: 'WEB',
  title: 'Web',
  description: 'Build a web app',
  imgUrl: null,
  priceAmount: 1500000,
  category: { id: commerceId(50), name: 'Coding', slug: 'coding' },
};
export const apiClass = (n: number) => ({
  id: commerceId(n),
  courseId: apiCourse.id,
  code: 'WEB-' + n,
  name: 'Class ' + n,
  startDate: '2026-11-02',
  endDate: '2027-01-20',
  deliveryMode: 'ONLINE',
  availableSeats: 5,
  mentor: { displayName: 'An' },
});
export const apiCartItem = (n: number) => ({
  classId: commerceId(n),
  classCode: 'WEB-' + n,
  className: 'Class ' + n,
  courseId: apiCourse.id,
  courseTitle: 'Web',
  deliveryMode: 'ONLINE',
  startDate: '2026-11-02',
  endDate: '2027-01-20',
  priceSnapshot: 1500000,
  currentPriceAmount: 1500000,
  isPurchasable: true,
  addedAt: '2026-10-18T10:00:00Z',
});
export const apiOrder = (classIds = [commerceId(10)]) => ({
  id: commerceId(500),
  orderCode: 'ORDER500',
  paymentType: 'PAYOS',
  status: 'PENDING',
  totalAmount: 1500000,
  expiresAt: new Date(Date.now() + 900000).toISOString(),
  details: classIds.map((classId) => ({ classId, courseTitle: 'Web' })),
});
export const apiPayment = (
  status = 'PENDING',
  qrCode: string | null = '000201SAMPLE'
) => ({
  status,
  qrCode,
  amount: 1500000,
  expiresAt: new Date(Date.now() + 900000).toISOString(),
});
export const apiPage = <T>(items: T[], pageSize = 20) => ({
  items,
  page: 1,
  pageSize,
  total: items.length,
});
export function deferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
