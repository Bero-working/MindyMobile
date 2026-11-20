import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  scopeKey,
  useStudentScope,
  type StudentScope,
} from '@/shared/hooks/useStudentScope';
import type { DataRegion } from '../home/types/home.type';
import { toRegion } from '@/shared/utilities/toRegion';
import {
  privateQueryOptions,
  useCancelInactive,
} from '../my-classes/hooks/useLearningQuery';
import { learningService } from '../my-classes/services/learning.service';
import {
  attendanceService,
  type AttendanceRange,
  type AttendanceItem,
} from './attendance.service';

export const attendanceKeys = {
  classes: (scope: StudentScope) =>
    ['attendance', ...scopeKey(scope), 'classes'] as const,
  history: (scope: StudentScope, classId: string, range: AttendanceRange) =>
    ['attendance', ...scopeKey(scope), classId, 'history', range] as const,
  summary: (scope: StudentScope, classId: string, range: AttendanceRange) =>
    ['attendance', ...scopeKey(scope), classId, 'summary', range] as const,
};

export function useAttendanceClasses(active: boolean) {
  const scope = useStudentScope();
  const enabled = scope.enabled && active;
  const key = attendanceKeys.classes(scope);
  const query = useInfiniteQuery({
    queryKey: key,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      learningService.classesPage({ view: 'all', page: pageParam }, signal),
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
    enabled,
    ...privateQueryOptions,
  });
  useCancelInactive(enabled, key);
  const rows = [
    ...new Map(
      query.data?.pages
        .flatMap((page) => page.items)
        .map((item) => [item.classId, item]) ?? []
    ).values(),
  ];
  return {
    classes: {
      ...toRegion(query, scope.enabled),
      data: scope.enabled && query.data ? rows : null,
      status: query.isFetchNextPageError
        ? ('success' as const)
        : toRegion(query, scope.enabled).status,
    },
    hasMore: !!query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    loadMoreError: query.isFetchNextPageError,
    refreshing: query.isRefetching && !query.isFetchingNextPage,
    onRefresh: () => {
      if (enabled && !query.isFetching) query.refetch().catch(() => {});
    },
    onLoadMore: () => {
      if (enabled && !query.isFetching) query.fetchNextPage().catch(() => {});
    },
  };
}

export function useAttendance(
  classId: string,
  range: AttendanceRange,
  active: boolean
) {
  const scope = useStudentScope();
  const enabled = scope.enabled && active;
  const historyKey = attendanceKeys.history(scope, classId, range);
  const summaryKey = attendanceKeys.summary(scope, classId, range);
  const history = useInfiniteQuery({
    queryKey: historyKey,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      attendanceService.history(classId, pageParam, range, signal),
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
    enabled,
    ...privateQueryOptions,
  });
  const summary = useQuery({
    queryKey: summaryKey,
    queryFn: ({ signal }) => attendanceService.summary(classId, range, signal),
    enabled,
    ...privateQueryOptions,
  });
  useCancelInactive(enabled, historyKey);
  useCancelInactive(enabled, summaryKey);
  const denied = history.error?.status === 403 || history.error?.status === 404;
  const items = [
    ...new Map(
      history.data?.pages
        .flatMap((page) => page.items)
        .map((item) => [`${item.sessionId}:${item.enrollmentId}`, item]) ?? []
    ).values(),
  ];
  const region: DataRegion<AttendanceItem[]> = {
    ...toRegion(history, enabled),
    status: history.isFetchNextPageError
      ? 'success'
      : toRegion(history, enabled).status,
    data: enabled && !denied && history.data ? items : null,
  };
  const summaryRegion = toRegion(summary, enabled);
  if (denied || summary.error?.status === 403 || summary.error?.status === 404)
    summaryRegion.data = null;
  return {
    history: region,
    summary: summaryRegion,
    timeZone: enabled
      ? (history.data?.pages[0]?.timeZone ??
        summary.data?.timeZone ??
        'Asia/Ho_Chi_Minh')
      : 'Asia/Ho_Chi_Minh',
    hasMore: !!history.hasNextPage,
    loadingMore: history.isFetchingNextPage,
    loadMoreError: history.isFetchNextPageError,
    refreshing:
      (history.isRefetching && !history.isFetchingNextPage) ||
      summary.isRefetching,
    onRefresh: () => {
      if (enabled) {
        history.refetch().catch(() => {});
        summary.refetch().catch(() => {});
      }
    },
    onLoadMore: () => {
      if (enabled && !history.isFetching)
        history.fetchNextPage().catch(() => {});
    },
  };
}
