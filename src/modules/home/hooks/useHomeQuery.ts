import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useStore } from '@/state/store';
import type { ApiError } from '@/shared/utilities/apiError';
import { homeService } from '../services/home.service';
import type { DataRegion, HomeCourse, HomeSession } from '../types/home.type';

function region<T>(
  query: UseQueryResult<T, ApiError>,
  enabled: boolean
): DataRegion<T> {
  return {
    status:
      !enabled || query.isPending
        ? 'loading'
        : query.isError
          ? 'error'
          : 'success',
    data: enabled ? (query.data ?? null) : null,
    ...(query.error
      ? {
          error: {
            code: query.error.code,
            ...(query.error.requestId
              ? { requestId: query.error.requestId }
              : {}),
          },
        }
      : {}),
    onRetry: () => {
      if (enabled) query.refetch();
    },
  };
}
export function useHomeQuery() {
  const user = useStore((state) => state.sessionUser);
  const generation = useStore((state) => state.generation);
  const status = useStore((state) => state.bootstrapStatus);
  const enabled = status === 'ready' && user?.role === 'STUDENT';
  const courses = useQuery({
    queryKey: ['home', user?.id, generation, 'courses'],
    queryFn: ({ signal }) => homeService.courses(signal),
    enabled,
    retry: false,
    gcTime: 0,
  });
  const schedule = useQuery({
    queryKey: ['home', user?.id, generation, 'schedule'],
    queryFn: ({ signal }) => {
      const now = Date.now();
      return homeService.schedule(
        {
          from: new Date(now).toISOString(),
          to: new Date(now + 7 * 86400000).toISOString(),
        },
        signal
      );
    },
    enabled,
    retry: false,
    gcTime: 0,
  });
  const scheduleRegion: DataRegion<HomeSession> = {
    ...region(schedule, enabled),
    data: enabled ? (schedule.data?.session ?? null) : null,
  };
  return {
    courses: region<HomeCourse[]>(courses, enabled),
    schedule: scheduleRegion,
    timeZone: enabled ? (schedule.data?.timeZone ?? 'UTC') : 'UTC',
    asOf: enabled ? (schedule.data?.asOf ?? '') : '',
    refreshing: courses.isRefetching || schedule.isRefetching,
    onRefresh: async () => {
      if (!enabled) return;
      const results = await Promise.allSettled([
        courses.refetch({ throwOnError: true }),
        schedule.refetch({ throwOnError: true }),
      ]);
      const failed = results.find((result) => result.status === 'rejected');
      if (failed?.status === 'rejected') throw failed.reason;
    },
  };
}
