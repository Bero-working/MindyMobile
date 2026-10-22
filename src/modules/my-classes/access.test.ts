import { enrollmentAction, groupEnrollments } from './access';
import type { Enrollment } from './types';
const row: Enrollment = {
  enrollmentId: 'e',
  courseId: 'c',
  courseCode: 'WEB',
  courseTitle: 'Web',
  courseImageUrl: null,
  classId: 'a',
  classCode: 'A',
  className: 'Class A',
  startDate: '2026-10-20',
  endDate: '2026-12-20',
  deliveryMode: 'ONLINE',
  mentor: null,
  accessMode: 'FULL',
  accessReason: 'ACTIVE_ENROLLMENT',
  canViewClass: true,
  canViewSchedule: true,
  order: null,
};
it('groups enrollments by course without collapsing repurchases', () => {
  expect(
    groupEnrollments([row, { ...row, enrollmentId: 'e2' }, row])[0]?.items
  ).toHaveLength(2);
});
it('fails closed for conflicting flags, missing orders and mismatched reasons', () => {
  expect(enrollmentAction(row)).toBe('FULL');
  expect(enrollmentAction({ ...row, canViewClass: false })).toBe('NONE');
  expect(
    enrollmentAction({
      ...row,
      accessMode: 'CASH_PREVIEW',
      accessReason: 'PENDING_CASH',
    })
  ).toBe('NONE');
  expect(enrollmentAction({ ...row, accessReason: 'CLASS_CANCELLED' })).toBe(
    'NONE'
  );
});
it('resumes only pending PAYOS without review', () => {
  const pending: Enrollment = {
    ...row,
    accessMode: 'NONE',
    accessReason: 'PENDING_PAYOS',
    canViewClass: false,
    canViewSchedule: false,
    order: {
      orderId: 'o',
      orderCode: 'O',
      orderStatus: 'PENDING',
      paymentType: 'PAYOS',
      requiresReview: false,
      expiresAt: null,
    },
  };
  expect(enrollmentAction(pending)).toBe('PAYMENT');
  if (!pending.order) throw new Error('Missing test order');
  expect(
    enrollmentAction({
      ...pending,
      order: { ...pending.order, requiresReview: true },
    })
  ).toBe('NONE');
  expect(enrollmentAction({ ...pending, order: null })).toBe('NONE');
});
