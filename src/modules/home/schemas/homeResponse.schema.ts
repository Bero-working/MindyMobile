import { z } from 'zod';
import { ApiError } from '@/shared/utilities/apiError';

export const dateTime = z.string().datetime({ offset: true });
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(value);
    return (
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  });
export const courseSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  imgUrl: z
    .string()
    .url()
    .refine((value) => /^https?:\/\//.test(value))
    .nullable(),
  priceAmount: z.number().int().min(0).max(1e12),
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  }),
});
const pagination = {
  page: z.number().int().positive(),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
};
export const coursesSchema = z.object({
  ...pagination,
  items: z.array(courseSchema),
});
export const classesSchema = z.object({
  ...pagination,
  items: z.array(
    z.object({
      id: z.string().uuid(),
      startDate: date,
      deliveryMode: z.enum(['ONLINE', 'OFFLINE']),
    })
  ),
});
export const scheduleEventSchema = z
  .object({
    sessionId: z.string().uuid(),
    classId: z.string().uuid(),
    classCode: z.string().min(1),
    sessionTitle: z.string(),
    sessionStatus: z.enum([
      'SCHEDULED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ]),
    classStatus: z.enum([
      'DRAFT',
      'OPEN',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ]),
    startsAt: dateTime,
    endsAt: dateTime,
    // Swagger already exposes makeup sessions; this phase only presents FULL/CASH_PREVIEW.
    accessMode: z.enum(['FULL', 'CASH_PREVIEW', 'SESSION_MAKEUP']),
  })
  .refine((value) => Date.parse(value.endsAt) > Date.parse(value.startsAt));
export const scheduleSchema = z.object({
  ...pagination,
  items: z.array(scheduleEventSchema),
  from: dateTime,
  to: dateTime,
  asOf: dateTime,
  timeZone: z.string().refine((value) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: value }).format(0);
      return true;
    } catch {
      return false;
    }
  }),
});
export const rangeSchema = z
  .object({ from: dateTime, to: dateTime })
  .refine(({ from, to }) => {
    const duration = Date.parse(to) - Date.parse(from);
    return duration > 0 && duration <= 31 * 86400000;
  });
export const invalidHomeResponse = () =>
  new ApiError({
    statusCode: 502,
    code: 'INVALID_HOME_RESPONSE',
    message: 'Invalid home response',
  });
