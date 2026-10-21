export type Enrollment = {
  enrollmentId: string;
  isHoldExpired?: boolean;
  enrollmentStatus?: 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  classStatus?: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  courseId: string;
  courseCode: string;
  courseTitle: string;
  courseImageUrl: string | null;
  classId: string;
  classCode: string;
  className: string;
  startDate: string;
  endDate: string;
  deliveryMode: 'ONLINE' | 'OFFLINE';
  mentor: { displayName: string } | null;
  accessMode: 'FULL' | 'CASH_PREVIEW' | 'NONE';
  accessReason:
    | 'ACTIVE_ENROLLMENT'
    | 'PENDING_CASH'
    | 'PENDING_PAYOS'
    | 'HOLD_EXPIRED'
    | 'ENROLLMENT_CANCELLED'
    | 'ENROLLMENT_COMPLETED'
    | 'CLASS_CANCELLED'
    | 'STATE_MISMATCH';
  canViewClass: boolean;
  canViewSchedule: boolean;
  order: {
    orderId: string;
    orderCode: string;
    orderStatus: string;
    paymentType: 'CASH' | 'PAYOS';
    requiresReview: boolean;
    expiresAt: string | null;
  } | null;
};
export type ClassSession = {
  id: string;
  sessionNumber: number;
  title: string;
  startsAt: string;
  endsAt: string;
  roomName: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
};
type DetailBase = {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  deliveryMode: 'ONLINE' | 'OFFLINE';
  classStatus: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  mentor: { displayName: string } | null;
};
// Preview cannot carry a meeting URL, even through its session type.
export type ClassDetail = DetailBase &
  (
    | {
        accessMode: 'FULL';
        meetingUrl: string | null;
        units: {
          id: string;
          title: string;
          sessions: (ClassSession & { meetingUrl: string | null })[];
        }[];
      }
    | {
        accessMode: 'CASH_PREVIEW';
        expiresAt: string | null;
        units: { id: string; title: string; sessions: ClassSession[] }[];
      }
  );
