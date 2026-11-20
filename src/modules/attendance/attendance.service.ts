import { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import { dateTime } from '@/modules/home/schemas/homeResponse.schema';
import { ApiError } from '@/shared/utilities/apiError';

const uuid = z.string().uuid();
const count = z.number().int().nonnegative();
const metadata = {
  classId: uuid,
  asOf: dateTime,
  timeZone: z.string().refine((value) => {
    try {
      const formatter = new Intl.DateTimeFormat('vi-VN', { timeZone: value });
      return !!formatter.resolvedOptions().timeZone;
    } catch {
      return false;
    }
  }),
};
export const attendanceItemSchema = z.object({
  sessionId: uuid,
  enrollmentId: uuid,
  rootSessionId: uuid,
  title: z.string(),
  startsAt: dateTime,
  endsAt: dateTime,
  sessionStatus: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  attendanceStatus: z.enum(['UNMARKED', 'PRESENT', 'ABSENT']).nullable(),
  attendanceApplicability: z.enum([
    'ELIGIBLE',
    'NOT_STARTED',
    'NOT_ELIGIBLE',
    'PAYMENT_PENDING',
    'LEGACY_NO_DATA',
    'MAKEUP_PENDING',
    'MAKEUP_CREDITED',
  ]),
  excluded: z.boolean(),
  effectiveMentor: z
    .object({ id: uuid, displayName: z.string().nullable() })
    .nullable(),
  assignmentType: z.enum(['PRIMARY', 'SUBSTITUTE']),
  makeupForSessionId: uuid.nullable(),
  makeupRootSessionId: uuid.nullable(),
  makeupPlacementId: uuid.nullable(),
  creditSessionId: uuid.nullable(),
  creditedAttendanceStatus: z.enum(['PRESENT', 'ABSENT']).nullable(),
});
const historySchema = z.object({
  ...metadata,
  items: z.array(attendanceItemSchema),
  page: count.min(1),
  pageSize: count.min(1).max(100),
  total: count,
});
const summarySchema = z.object({
  ...metadata,
  present: count,
  absent: count,
  unmarked: count,
  excluded: count,
  makeupPending: count,
  finalizedEligibleCount: count,
  rate: z.number().min(0).max(100).nullable(),
});
export type AttendanceItem = z.infer<typeof attendanceItemSchema>;
export type AttendanceHistory = z.infer<typeof historySchema>;
export type AttendanceSummary = z.infer<typeof summarySchema>;
export type AttendancePeriod = 'ALL' | '30' | '90';
export type AttendanceRange = { from?: string; to?: string };
export function attendanceRange(
  period: AttendancePeriod,
  now = Date.now()
): AttendanceRange {
  return period === 'ALL'
    ? {}
    : {
        from: new Date(now - Number(period) * 86400000).toISOString(),
        to: new Date(now).toISOString(),
      };
}
const invalid = () =>
  new ApiError({
    statusCode: 502,
    code: 'INVALID_ATTENDANCE_RESPONSE',
    message: 'Invalid attendance response',
  });
export const attendanceService = {
  async history(
    classId: string,
    page: number,
    range: AttendanceRange,
    signal?: AbortSignal
  ): Promise<AttendanceHistory> {
    const response = await apiInstances.service.get<object>(
      `me/classes/${classId}/attendance`,
      {
        params: { page, pageSize: 20, ...range },
        ...(signal ? { signal } : {}),
      }
    );
    const parsed = historySchema.safeParse(response);
    if (
      !parsed.success ||
      parsed.data.classId !== classId ||
      parsed.data.page !== page
    )
      throw invalid();
    return parsed.data;
  },
  async summary(
    classId: string,
    range: AttendanceRange,
    signal?: AbortSignal
  ): Promise<AttendanceSummary> {
    const response = await apiInstances.service.get<object>(
      `me/classes/${classId}/attendance-summary`,
      {
        params: range,
        ...(signal ? { signal } : {}),
      }
    );
    const parsed = summarySchema.safeParse(response);
    if (!parsed.success || parsed.data.classId !== classId) throw invalid();
    return parsed.data;
  },
};
