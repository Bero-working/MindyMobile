import { useEffect } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useStudentScope } from '@/shared/hooks/useStudentScope';
import { toRegion } from '@/shared/utilities/toRegion';
import type { DataRegion } from '@/modules/home/types/home.type';
import type { ClassDetail, Enrollment } from '../types';
import { learningService } from '../services/learning.service';
import { learningQueryKeys } from './learningQueryKeys';

export const privateQueryOptions = {
  gcTime: 0,
  staleTime: 0,
  retry: false,
  refetchOnWindowFocus: 'always' as const,
  refetchOnMount: 'always' as const,
};
export function useCancelInactive(enabled: boolean, key: QueryKey) {
  const client = useQueryClient();
  const serialized = JSON.stringify(key);
  useEffect(() => {
    if (!enabled)
      client
        .cancelQueries({
          queryKey: JSON.parse(serialized) as QueryKey,
          exact: true,
        })
        .catch(() => {});
  }, [client, enabled, serialized]);
}
export function useMyClassesQuery(view: 'current' | 'history', active = true) {
  const scope = useStudentScope();
  const enabled = scope.enabled && active;
  const key = learningQueryKeys.classes(scope, view);
  const query = useInfiniteQuery({
    queryKey: key,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      learningService.classesPage({ view, page: pageParam }, signal),
    getNextPageParam: (last, pages) =>
      pages.reduce((n, page) => n + page.items.length, 0) < last.total
        ? last.page + 1
        : undefined,
    enabled,
    ...privateQueryOptions,
  });
  useCancelInactive(enabled, key);
  const rows = scope.enabled
    ? [
        ...new Map(
          query.data?.pages
            .flatMap((page) => page.items)
            .map((item) => [item.enrollmentId, item]) ?? []
        ).values(),
      ]
    : [];
  const region: DataRegion<Enrollment[]> = {
    status:
      !scope.enabled || query.isPending
        ? 'loading'
        : query.isError && !query.isFetchNextPageError
          ? 'error'
          : 'success',
    data: scope.enabled && query.data ? rows : null,
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
      if (enabled) query.refetch().catch(() => {});
    },
  };
  return {
    region,
    rows,
    hasMore: !!query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    loadMoreError: query.isFetchNextPageError,
    onLoadMore: () => {
      if (enabled && !query.isFetching) query.fetchNextPage().catch(() => {});
    },
    refreshing: query.isRefetching,
    onRefresh: region.onRetry,
  };
}
export function useClassDetailQuery(classId: string, active = true) {
  const scope = useStudentScope();
  const client = useQueryClient();
  const enabled = scope.enabled && active;
  const key = learningQueryKeys.detail(scope, classId);
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => learningService.verifiedDetail(classId, signal),
    enabled,
    ...privateQueryOptions,
  });
  useCancelInactive(enabled, key);
  useEffect(() => {
    if (query.isSuccess || query.error?.status === 403) {
      client
        .invalidateQueries({
          queryKey: [...learningQueryKeys.root(scope), 'classes'],
        })
        .catch(() => {});
    }
  }, [
    client,
    scope.userId,
    scope.generation,
    query.dataUpdatedAt,
    query.errorUpdatedAt,
    query.isSuccess,
    query.error?.status,
  ]);
  // Never expose an old FULL response while a new rights check is running or failed.
  const verified = enabled && query.isSuccess && !query.isFetching;
  const detail: DataRegion<ClassDetail> = {
    ...toRegion(query, enabled),
    status:
      enabled && query.isFetching ? 'loading' : toRegion(query, enabled).status,
    data: verified ? query.data.detail : null,
  };
  return { detail, enrollment: verified ? query.data.enrollment : null };
}
