import { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import { ApiError } from '@/shared/utilities/apiError';
import { dateTime } from '@/modules/home/schemas/homeResponse.schema';
import type { Order, OrderFilter } from './types';

const amount = z.number().int().nonnegative().max(1e12);
const courseCoverSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  imgUrl: z
    .string()
    .url()
    .refine((url) => /^https?:\/\//.test(url))
    .nullable(),
});
const courseCoversPageSchema = z.object({
  items: z.array(courseCoverSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
});
export const purchaseSchema = z.object({
  id: z.string().uuid(),
  orderCode: z.string().min(1),
  status: z.enum(['PENDING', 'PAID', 'EXPIRED', 'CANCELLED']),
  paymentType: z.enum(['PAYOS', 'CASH']),
  totalAmount: amount,
  createdAt: dateTime,
  expiresAt: dateTime,
  paidAt: dateTime.nullable(),
  details: z.array(
    z.object({
      id: z.string().uuid(),
      classId: z.string().uuid(),
      courseTitle: z.string(),
      className: z.string(),
      priceAmount: amount,
      quantity: z.number().int().positive(),
      totalAmount: amount,
    })
  ),
});
const pageSchema = z.object({
  items: z.array(purchaseSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
});
const detailSchema = purchaseSchema.extend({
  payment: z
    .object({
      status: z.enum(['CREATING', 'PENDING', 'SUCCEEDED', 'REQUIRES_REVIEW']),
    })
    .nullable(),
});
const invalid = () =>
  new ApiError({
    statusCode: 502,
    code: 'INVALID_ORDER_RESPONSE',
    message: 'Invalid order response',
  });

export const ordersService = {
  // Public class detail excludes closed classes. Use the active catalog as a
  // fallback for those order snapshots; ambiguous titles must not pick an image.
  async courseCovers(
    signal?: AbortSignal
  ): Promise<Map<string, string | null>> {
    const courses = new Map<string, z.infer<typeof courseCoverSchema>>();
    let page = 1;
    for (;;) {
      const response = await apiInstances.service.get<object>('courses', {
        params: { page, pageSize: 100 },
        ...(signal ? { signal } : {}),
      });
      const data = courseCoversPageSchema.parse(response);
      if (
        data.page !== page ||
        (!data.items.length && data.total > (page - 1) * data.pageSize)
      )
        throw invalid();
      data.items.forEach((course) => courses.set(course.id, course));
      if (page * data.pageSize >= data.total) break;
      page++;
    }
    const images = new Map<string, string | null>();
    for (const course of courses.values()) {
      images.set(course.title, images.has(course.title) ? null : course.imgUrl);
    }
    return images;
  },
  async cover(classId: string, signal?: AbortSignal): Promise<string | null> {
    const response = await apiInstances.service.get<object>(
      `classes/${classId}`,
      signal ? { signal } : {}
    );
    const classroom = z
      .object({ id: z.string().uuid(), courseId: z.string().uuid() })
      .parse(response);
    if (classroom.id !== classId) throw invalid();
    const courseResponse = await apiInstances.service.get<object>(
      `courses/${classroom.courseId}`,
      signal ? { signal } : {}
    );
    const course = z
      .object({
        id: z.string().uuid(),
        imgUrl: z
          .string()
          .url()
          .refine((url) => /^https?:\/\//.test(url))
          .nullable(),
      })
      .parse(courseResponse);
    if (course.id !== classroom.courseId) throw invalid();
    return course.imgUrl;
  },
  async list(filter: OrderFilter, page: number, signal?: AbortSignal) {
    const response = await apiInstances.service.get<z.infer<typeof pageSchema>>(
      'me/orders',
      {
        params: {
          page,
          pageSize: 20,
          ...(filter === 'ALL' ? {} : { status: filter }),
        },
        ...(signal ? { signal } : {}),
      }
    );
    const parsed = pageSchema.safeParse(response);
    if (
      !parsed.success ||
      parsed.data.page !== page ||
      (filter !== 'ALL' &&
        parsed.data.items.some((item) => item.status !== filter))
    )
      throw invalid();
    return parsed.data;
  },
  async detail(id: string, signal?: AbortSignal): Promise<Order> {
    const response = await apiInstances.service.get<
      z.infer<typeof detailSchema>
    >(`me/orders/${id}`, signal ? { signal } : {});
    const parsed = detailSchema.safeParse(response);
    if (!parsed.success || parsed.data.id !== id) throw invalid();
    return {
      ...parsed.data,
      paymentReview: parsed.data.payment?.status === 'REQUIRES_REVIEW',
    };
  },
  async cancel(id: string): Promise<Order> {
    const response = await apiInstances.service.post<
      Order,
      Record<string, never>
    >(`me/orders/${id}/cancel`, {});
    const parsed = purchaseSchema.safeParse(response);
    if (
      !parsed.success ||
      parsed.data.id !== id ||
      parsed.data.status !== 'CANCELLED'
    )
      throw invalid();
    return parsed.data;
  },
};
