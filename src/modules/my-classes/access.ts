import type { Enrollment } from './types';
export function enrollmentAction(
  row: Enrollment
): 'FULL' | 'CASH_PREVIEW' | 'PAYMENT' | 'NONE' {
  if (row.isHoldExpired || row.classStatus === 'CANCELLED') return 'NONE';
  if (
    row.canViewClass &&
    (!row.enrollmentStatus || row.enrollmentStatus === 'ACTIVE') &&
    row.accessMode === 'FULL' &&
    row.accessReason === 'ACTIVE_ENROLLMENT'
  )
    return 'FULL';
  if (
    row.canViewClass &&
    (!row.enrollmentStatus || row.enrollmentStatus === 'PENDING_PAYMENT') &&
    row.accessMode === 'CASH_PREVIEW' &&
    row.accessReason === 'PENDING_CASH' &&
    row.order?.paymentType === 'CASH' &&
    row.order.orderStatus === 'PENDING'
  )
    return 'CASH_PREVIEW';
  if (
    row.accessMode === 'NONE' &&
    (!row.enrollmentStatus || row.enrollmentStatus === 'PENDING_PAYMENT') &&
    !row.canViewClass &&
    !row.canViewSchedule &&
    row.accessReason === 'PENDING_PAYOS' &&
    row.order?.paymentType === 'PAYOS' &&
    row.order.orderStatus === 'PENDING' &&
    !row.order.requiresReview
  )
    return 'PAYMENT';
  return 'NONE';
}
export function groupEnrollments(
  rows: Enrollment[]
): { courseId: string; title: string; code: string; items: Enrollment[] }[] {
  const groups = new Map<
    string,
    { courseId: string; title: string; code: string; items: Enrollment[] }
  >();
  const seen = new Set<string>();
  rows.forEach((row) => {
    if (seen.has(row.enrollmentId)) return;
    seen.add(row.enrollmentId);
    const group = groups.get(row.courseId) ?? {
      courseId: row.courseId,
      title: row.courseTitle,
      code: row.courseCode,
      items: [],
    };
    group.items.push(row);
    groups.set(row.courseId, group);
  });
  return [...groups.values()];
}
