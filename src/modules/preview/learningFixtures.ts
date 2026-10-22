import i18n from '@/config/i18n.config';
import type {
  Enrollment,
  ClassDetail,
  ClassSession,
} from '../my-classes/types';
import type { ScheduleSession } from '../schedule/types';
import { weekDays } from '../schedule/calendar';
export function learningFixtures(today: string) {
  const t = (
    key:
      | 'course'
      | 'nextCourse'
      | 'class'
      | 'mentor'
      | 'unit'
      | 'session'
      | 'name'
  ) => i18n.t(`learningPreview.${key}`);
  const base: Enrollment = {
    enrollmentId: 'full',
    courseId: 'web',
    courseCode: 'WEB101',
    courseTitle: t('course'),
    courseImageUrl: null,
    classId: 'full',
    classCode: 'WEB101-A',
    className: t('class'),
    startDate: today,
    endDate: '2027-01-31',
    deliveryMode: 'ONLINE',
    mentor: { displayName: t('mentor') },
    accessMode: 'FULL',
    accessReason: 'ACTIVE_ENROLLMENT',
    canViewClass: true,
    canViewSchedule: true,
    order: null,
  };
  const cash: Enrollment = {
    ...base,
    courseId: 'web-next',
    courseCode: 'WEB201',
    courseTitle: t('nextCourse'),
    enrollmentId: 'cash',
    classId: 'cash',
    classCode: 'WEB201-B',
    accessMode: 'CASH_PREVIEW',
    accessReason: 'PENDING_CASH',
    order: {
      orderId: 'cash-order',
      orderCode: 'PREVIEW-CASH',
      orderStatus: 'PENDING',
      paymentType: 'CASH',
      requiresReview: false,
      expiresAt: `${today}T23:59:00+07:00`,
    },
  };
  const pending: Enrollment = {
    ...base,
    courseId: 'web-next',
    courseCode: 'WEB201',
    courseTitle: t('nextCourse'),
    enrollmentId: 'pending',
    classId: 'pending',
    classCode: 'WEB201-C',
    accessMode: 'NONE',
    accessReason: 'PENDING_PAYOS',
    canViewClass: false,
    canViewSchedule: false,
    order: {
      orderId: 'preview-existing-order',
      orderCode: 'PREVIEW-PAYOS',
      orderStatus: 'PENDING',
      paymentType: 'PAYOS',
      requiresReview: false,
      expiresAt: `${today}T23:59:00+07:00`,
    },
  };
  const review: Enrollment = {
    ...pending,
    enrollmentId: 'review',
    classId: 'review',
    classCode: 'WEB201-D',
    order: pending.order ? { ...pending.order, requiresReview: true } : null,
  };
  const history = (
    [
      'HOLD_EXPIRED',
      'ENROLLMENT_CANCELLED',
      'ENROLLMENT_COMPLETED',
      'CLASS_CANCELLED',
      'STATE_MISMATCH',
    ] as const
  ).map((accessReason, index) => ({
    ...base,
    enrollmentId: `history-${index}`,
    classId: `history-${index}`,
    courseId: 'history',
    courseCode: 'WEB100',
    classCode: `WEB100-${index}`,
    accessMode: 'NONE' as const,
    canViewClass: false,
    canViewSchedule: false,
    accessReason,
  }));
  const days = weekDays(today);
  const session = (id: string, day: string): ClassSession => ({
    id,
    sessionNumber: 1,
    title: t('session'),
    startsAt: `${day}T18:00:00+07:00`,
    endsAt: `${day}T20:00:00+07:00`,
    roomName: null,
    status: 'SCHEDULED',
  });
  const fullSessions = [
    session('full-session', today),
    {
      ...session('cancelled-session', days[5] ?? today),
      sessionNumber: 2,
      status: 'CANCELLED' as const,
    },
  ];
  const cashSession = session('cash-session', days[3] ?? today);
  const detailBase = {
    id: base.classId,
    code: base.classCode,
    name: base.className,
    startDate: base.startDate,
    endDate: base.endDate,
    deliveryMode: base.deliveryMode,
    classStatus: 'OPEN' as const,
    mentor: base.mentor,
  };
  const fullDetail: ClassDetail = {
    ...detailBase,
    accessMode: 'FULL',
    meetingUrl: 'https://example.test/preview-class',
    units: [
      {
        id: 'unit-full',
        title: t('unit'),
        sessions: fullSessions.map((s) => ({ ...s, meetingUrl: null })),
      },
    ],
  };
  const cashDetail: ClassDetail = {
    ...detailBase,
    id: cash.classId,
    code: cash.classCode,
    accessMode: 'CASH_PREVIEW',
    expiresAt: cash.order?.expiresAt ?? null,
    units: [{ id: 'unit-cash', title: t('unit'), sessions: [cashSession] }],
  };
  const schedule: ScheduleSession[] = [
    ...fullSessions.map((s) => ({ s, row: base })),
    { s: cashSession, row: cash },
  ].map(({ s, row }) => ({
    sessionId: s.id,
    sessionNumber: s.sessionNumber,
    sessionTitle: s.title,
    sessionStatus: s.status,
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    classId: row.classId,
    classCode: row.classCode,
    className: row.className,
    courseTitle: row.courseTitle,
    deliveryMode: row.deliveryMode,
    mentor: row.mentor,
    roomName: s.roomName,
    accessMode: row.accessMode === 'FULL' ? 'FULL' : 'CASH_PREVIEW',
  }));
  return {
    current: [base, cash, pending, review],
    history,
    fullDetail,
    cashDetail,
    schedule,
    user: {
      id: 'preview-student',
      displayName: t('name'),
      email: 'student@example.test',
      phone: null,
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
      lastLoginAt: null,
      createdAt: '2026-10-01T00:00:00Z',
    },
  };
}
