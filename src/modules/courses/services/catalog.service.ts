import type { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import {
  categoriesSchema,
  classDetailSchema,
  classesPageSchema,
  courseDetailSchema,
  coursesPageSchema,
  invalidCatalogResponse,
} from '../schemas/catalog.schema';
import type {
  Category,
  Course,
  CourseClass,
  DeliveryMode,
} from '../types/courses.type';

export type CourseQuery = {
  page: number;
  pageSize: number;
  categoryId?: string | null | undefined;
  deliveryMode?: DeliveryMode | undefined;
};
async function read<S extends z.ZodTypeAny>(
  schema: S,
  path: string,
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal
): Promise<z.infer<S>> {
  const response = await apiInstances.service.get<z.infer<S>>(path, {
    params,
    ...(signal ? { signal } : {}),
  });
  const parsed = schema.safeParse(response);
  if (!parsed.success) throw invalidCatalogResponse();
  return parsed.data;
}
let nextClassActive = 0;
const nextClassQueue: (() => void)[] = [];
function acquireNextClassSlot(): Promise<() => void> {
  return new Promise((resolve) => {
    const start = () => {
      nextClassActive++;
      resolve(() => {
        nextClassActive--;
        nextClassQueue.shift()?.();
      });
    };
    if (nextClassActive < 6) start();
    else nextClassQueue.push(start);
  });
}
export const catalogService = {
  async categories(signal?: AbortSignal): Promise<Category[]> {
    const data = await read(
      categoriesSchema,
      'course-categories',
      { page: 1, pageSize: 50 },
      signal
    );
    return data.items
      .filter((item) => item.isActive)
      .map(({ id, name }) => ({ id, name }));
  },
  async courses(
    query: CourseQuery,
    signal?: AbortSignal
  ): Promise<{ items: Course[]; total: number }> {
    const data = await read(
      coursesPageSchema,
      'courses',
      {
        page: query.page,
        pageSize: query.pageSize,
        categoryId: query.categoryId || undefined,
        deliveryMode: query.deliveryMode,
      },
      signal
    );
    return { items: data.items, total: data.total };
  },
  async nextClass(
    courseId: string,
    signal?: AbortSignal
  ): Promise<NonNullable<Course['openClass']> | null> {
    const release = await acquireNextClassSlot();
    try {
      // The contract does not guarantee sort order, so choose the earliest start locally.
      const data = await read(
        classesPageSchema,
        `courses/${courseId}/classes`,
        { page: 1, pageSize: 100 },
        signal
      );
      const earliest = data.items.reduce<(typeof data.items)[number] | null>(
        (best, item) =>
          !best || item.startDate < best.startDate ? item : best,
        null
      );
      return earliest
        ? { startDate: earliest.startDate, deliveryMode: earliest.deliveryMode }
        : null;
    } finally {
      release();
    }
  },
  async course(courseId: string, signal?: AbortSignal): Promise<Course> {
    return read(courseDetailSchema, `courses/${courseId}`, {}, signal);
  },
  async classes(
    courseId: string,
    signal?: AbortSignal
  ): Promise<CourseClass[]> {
    const data = await read(
      classesPageSchema,
      `courses/${courseId}/classes`,
      { page: 1, pageSize: 20 },
      signal
    );
    return data.items.map((item) => ({
      ...item,
      mentor: { displayName: item.mentor.displayName },
    }));
  },
  async classSessions(
    classId: string,
    signal?: AbortSignal
  ): Promise<{ startsAt: string }[]> {
    const data = await read(
      classDetailSchema,
      `classes/${classId}`,
      {},
      signal
    );
    return data.units.flatMap((unit) =>
      unit.sessions.map(({ startsAt }) => ({ startsAt }))
    );
  },
};
