import { z } from 'zod';
import { ApiError } from '@/shared/utilities/apiError';
import {
  courseSchema,
  dateTime,
} from '@/modules/home/schemas/homeResponse.schema';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const pagination = {
  page: z.number().int().positive(),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
};
const paged = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ ...pagination, items: z.array(item) });

export const categoriesSchema = paged(
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    isActive: z.boolean(),
  })
);
export const coursesPageSchema = paged(courseSchema);
export const classSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  startDate: date,
  endDate: date,
  deliveryMode: z.enum(['ONLINE', 'OFFLINE']),
  availableSeats: z.number().int().nonnegative(),
  mentor: z.object({ displayName: z.string() }),
});
export const classesPageSchema = paged(classSchema);
export const courseDetailSchema = courseSchema;
export const classDetailSchema = z.object({
  id: z.string().uuid(),
  units: z.array(
    z.object({
      sessions: z.array(z.object({ startsAt: dateTime })),
    })
  ),
});
export const invalidCatalogResponse = () =>
  new ApiError({
    statusCode: 502,
    code: 'INVALID_CATALOG_RESPONSE',
    message: 'Invalid catalog response',
  });
