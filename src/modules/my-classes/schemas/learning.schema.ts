import { z } from 'zod';
import {
  dateTime,
  scheduleSchema,
} from '@/modules/home/schemas/homeResponse.schema';
import { ApiError } from '@/shared/utilities/apiError';

const id = z.string().uuid();
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (value) =>
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value
  );
export const delivery = z.enum(['ONLINE', 'OFFLINE']);
export const classStatus = z.enum([
  'DRAFT',
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);
export const sessionStatus = z.enum([
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);
const mentor = z.object({ id, displayName: z.string().min(1) }).nullable();
const pagination = {
  page: z.number().int().positive(),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
};
export const enrollmentSchema = z.object({
  enrollmentId: id,
  enrollmentStatus: z.enum([
    'PENDING_PAYMENT',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
  ]),
  enrolledAt: dateTime.nullable(),
  createdAt: dateTime,
  isHoldExpired: z.boolean(),
  courseId: id,
  courseCode: z.string(),
  courseTitle: z.string(),
  courseImageUrl: z.string().url().nullable(),
  classId: id,
  classCode: z.string(),
  className: z.string(),
  classStatus,
  startDate: day,
  endDate: day,
  deliveryMode: delivery,
  mentor,
  accessMode: z.enum(['FULL', 'CASH_PREVIEW', 'NONE']),
  accessReason: z.enum([
    'ACTIVE_ENROLLMENT',
    'PENDING_CASH',
    'PENDING_PAYOS',
    'HOLD_EXPIRED',
    'ENROLLMENT_CANCELLED',
    'ENROLLMENT_COMPLETED',
    'CLASS_CANCELLED',
    'STATE_MISMATCH',
  ]),
  canViewClass: z.boolean(),
  canViewSchedule: z.boolean(),
  order: z
    .object({
      orderId: id,
      orderCode: z.string(),
      orderStatus: z.enum(['PENDING', 'PAID', 'EXPIRED', 'CANCELLED']),
      paymentType: z.enum(['CASH', 'PAYOS']),
      expiresAt: dateTime.nullable(),
      paidAt: dateTime.nullable(),
      requiresReview: z.boolean(),
    })
    .nullable(),
});
export const enrollmentsSchema = z.object({
  ...pagination,
  items: z.array(enrollmentSchema),
  asOf: dateTime,
});
const session = z.object({
  id,
  sessionNumber: z.number().int().positive(),
  title: z.string(),
  startsAt: dateTime,
  endsAt: dateTime,
  roomName: z.string().nullable(),
  status: sessionStatus,
});
const sessionRange = (s: { startsAt: string; endsAt: string }) =>
  Date.parse(s.endsAt) > Date.parse(s.startsAt);
const baseDetail = {
  id,
  courseId: id,
  code: z.string(),
  name: z.string(),
  startDate: day,
  endDate: day,
  deliveryMode: delivery,
  classStatus,
  mentor,
  enrollmentId: id,
};
export const fullDetailSchema = z.object({
  ...baseDetail,
  accessMode: z.literal('FULL'),
  enrollmentStatus: z.literal('ACTIVE'),
  enrolledAt: dateTime.nullable(),
  meetingUrl: z.string().nullable(),
  units: z.array(
    z.object({
      id,
      position: z.number().int(),
      title: z.string(),
      sessions: z.array(
        session
          .extend({ meetingUrl: z.string().nullable() })
          .refine(sessionRange)
      ),
    })
  ),
});
// Unknown fields are stripped at both levels, including accidentally supplied meeting URLs.
export const previewDetailSchema = z.object({
  ...baseDetail,
  accessMode: z.literal('CASH_PREVIEW'),
  enrollmentStatus: z.literal('PENDING_PAYMENT'),
  orderId: id,
  orderCode: z.string(),
  expiresAt: dateTime.nullable(),
  units: z.array(
    z.object({
      id,
      position: z.number().int(),
      title: z.string(),
      sessions: z.array(session.refine(sessionRange)),
    })
  ),
});
export const learningScheduleSchema = scheduleSchema.extend({
  items: z.array(
    z
      .object({
        sessionId: id,
        sessionNumber: z.number().int().positive(),
        sessionTitle: z.string(),
        sessionStatus,
        startsAt: dateTime,
        endsAt: dateTime,
        roomName: z.string().nullable(),
        classId: id,
        classCode: z.string(),
        className: z.string(),
        classStatus,
        courseId: id,
        courseTitle: z.string(),
        classUnitId: id,
        unitTitle: z.string(),
        deliveryMode: delivery,
        mentor,
        enrollmentId: id,
        accessMode: z.enum(['FULL', 'CASH_PREVIEW', 'SESSION_MAKEUP']),
      })
      .refine(sessionRange)
  ),
});
export const invalidLearningResponse = () =>
  new ApiError({
    statusCode: 502,
    code: 'INVALID_LEARNING_RESPONSE',
    message: 'Invalid learning response',
  });
export function parseLearning<S extends z.ZodTypeAny>(
  schema: S,
  value: object
): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) throw invalidLearningResponse();
  return result.data;
}
export function checkLearningPage(
  page: {
    page: number;
    pageSize: number;
    total: number;
    items: readonly object[];
  },
  expected: number,
  count: number
) {
  if (
    page.page !== expected ||
    page.items.length > page.pageSize ||
    count > page.total ||
    (!page.items.length && count < page.total)
  )
    throw invalidLearningResponse();
}
export type EnrollmentDto = z.infer<typeof enrollmentSchema>;
