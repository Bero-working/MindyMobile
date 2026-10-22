import { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import { ApiError } from '@/shared/utilities/apiError';
import {
  classesSchema,
  coursesSchema,
  invalidHomeResponse,
  rangeSchema,
  scheduleSchema,
  type scheduleEventSchema,
} from '../schemas/homeResponse.schema';
import type { HomeCourse, HomeSession } from '../types/home.type';

export type HomeSchedule = {
  session: HomeSession | null;
  timeZone: string;
  asOf: string;
};
function checkPage(
  page: {
    page: number;
    items: readonly object[];
    total: number;
    pageSize: number;
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
    throw invalidHomeResponse();
}
async function openClass(
  id: string,
  signal?: AbortSignal
): Promise<HomeCourse['openClass']> {
  let current = 1,
    count = 0;
  let earliest: HomeCourse['openClass'];
  const ids = new Set<string>();
  for (;;) {
    const response = await apiInstances.service.get<
      z.infer<typeof classesSchema>
    >(`courses/${id}/classes`, {
      params: { page: current, pageSize: 100 },
      ...(signal ? { signal } : {}),
    });
    const parsed = classesSchema.safeParse(response);
    if (!parsed.success) throw invalidHomeResponse();
    count += parsed.data.items.length;
    checkPage(parsed.data, current, count);
    for (const item of parsed.data.items) {
      if (ids.has(item.id)) throw invalidHomeResponse();
      ids.add(item.id);
      if (!earliest || item.startDate < earliest.startDate)
        earliest = {
          startDate: item.startDate,
          deliveryMode: item.deliveryMode,
        };
    }
    if (count >= parsed.data.total) return earliest;
    current++;
  }
}
export const homeService = {
  async courses(signal?: AbortSignal): Promise<HomeCourse[]> {
    const response = await apiInstances.service.get<
      z.infer<typeof coursesSchema>
    >('courses', {
      params: { page: 1, pageSize: 4 },
      ...(signal ? { signal } : {}),
    });
    const parsed = coursesSchema.safeParse(response);
    if (!parsed.success || parsed.data.items.length > 4)
      throw invalidHomeResponse();
    checkPage(parsed.data, 1, parsed.data.items.length);
    return Promise.all(
      parsed.data.items.map(async (course) => {
        try {
          const metadata = await openClass(course.id, signal);
          return metadata ? { ...course, openClass: metadata } : course;
        } catch (error) {
          if (signal?.aborted) throw error;
          return course;
        }
      })
    );
  },
  async schedule(
    range: { from: string; to: string },
    signal?: AbortSignal
  ): Promise<HomeSchedule> {
    if (!rangeSchema.safeParse(range).success)
      throw new ApiError({
        statusCode: 0,
        code: 'INVALID_SCHEDULE_RANGE',
        message: 'Invalid schedule range',
      });
    let current = 1,
      count = 0;
    let clock: { asOf: string; timeZone: string } | undefined;
    const events: z.infer<typeof scheduleEventSchema>[] = [];
    const ids = new Set<string>();
    for (;;) {
      const response = await apiInstances.service.get<
        z.infer<typeof scheduleSchema>
      >('me/schedule', {
        params: {
          ...range,
          page: current,
          pageSize: 100,
          includeCancelled: false,
        },
        ...(signal ? { signal } : {}),
      });
      const parsed = scheduleSchema.safeParse(response);
      if (!parsed.success) throw invalidHomeResponse();
      const page = parsed.data;
      count += page.items.length;
      checkPage(page, current, count);
      if (
        Date.parse(page.from) !== Date.parse(range.from) ||
        Date.parse(page.to) !== Date.parse(range.to) ||
        (clock && clock.timeZone !== page.timeZone)
      )
        throw invalidHomeResponse();
      clock = {
        asOf:
          clock && Date.parse(clock.asOf) > Date.parse(page.asOf)
            ? clock.asOf
            : page.asOf,
        timeZone: page.timeZone,
      };
      for (const event of page.items) {
        if (ids.has(event.sessionId)) throw invalidHomeResponse();
        ids.add(event.sessionId);
        events.push(event);
      }
      if (count >= page.total) break;
      current++;
    }
    const next = events
      .filter(
        (event) =>
          event.sessionStatus === 'SCHEDULED' &&
          event.classStatus !== 'CANCELLED' &&
          event.accessMode !== 'SESSION_MAKEUP' &&
          Date.parse(event.startsAt) >= Date.parse(clock.asOf)
      )
      .sort(
        (a, b) =>
          Date.parse(a.startsAt) - Date.parse(b.startsAt) ||
          a.sessionId.localeCompare(b.sessionId)
      )[0];
    return {
      ...clock,
      session:
        next && next.accessMode !== 'SESSION_MAKEUP'
          ? {
              classId: next.classId,
              sessionId: next.sessionId,
              sessionTitle: next.sessionTitle,
              className: next.classCode,
              startsAt: next.startsAt,
              accessMode: next.accessMode,
            }
          : null,
    };
  },
};
