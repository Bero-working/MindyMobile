import { useQuery } from '@tanstack/react-query';
import { useStudentScope } from '@/shared/hooks/useStudentScope';
import { catalogService } from '../services/catalog.service';
import type { CourseClass } from '../types/courses.type';
import { coursesQueryKeys } from './coursesQueryKeys';

const SCHEDULE_CONCURRENCY = 3;
async function loadSchedules(
  classIds: string[],
  signal: AbortSignal
): Promise<Record<string, { startsAt: string }[]>> {
  const result: Record<string, { startsAt: string }[]> = {};
  let next = 0;
  const worker = async () => {
    while (next < classIds.length) {
      const classId = classIds[next++];
      if (!classId) continue;
      try {
        result[classId] = await catalogService.classSessions(classId, signal);
      } catch {
        // Schedule is optional; the row falls back to its date range.
      }
    }
  };
  await Promise.all(
    Array.from(
      { length: Math.min(SCHEDULE_CONCURRENCY, classIds.length) },
      worker
    )
  );
  return result;
}
export function useCourseDetailQuery(courseId: string) {
  const scope = useStudentScope();
  const enabled = scope.enabled && !!courseId;
  const detail = useQuery({
    queryKey: coursesQueryKeys.detail(scope, courseId),
    queryFn: ({ signal }) => catalogService.course(courseId, signal),
    enabled,
  });
  const classes = useQuery({
    queryKey: coursesQueryKeys.classes(scope, courseId),
    queryFn: ({ signal }) => catalogService.classes(courseId, signal),
    enabled,
  });
  const classIds = (classes.data ?? []).map((item) => item.id);
  const schedules = useQuery({
    queryKey: [...coursesQueryKeys.sessions(scope, courseId), classIds],
    queryFn: ({ signal }) => loadSchedules(classIds, signal),
    enabled: enabled && classIds.length > 0,
    retry: false,
  });
  const merged: CourseClass[] = (classes.data ?? []).map((item) => {
    const sessions = schedules.data?.[item.id];
    return sessions?.length ? { ...item, sessions } : item;
  });
  const status: 'loading' | 'error' | 'success' =
    detail.isError || classes.isError
      ? 'error'
      : !enabled || detail.isPending || classes.isPending
        ? 'loading'
        : 'success';
  return {
    status,
    course: detail.data,
    classes: merged,
    onRetry: () => {
      detail.refetch().catch(() => {});
      classes.refetch().catch(() => {});
    },
  };
}
