import { useRef } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueries,
  useQueryClient,
} from '@tanstack/react-query';
import {
  scopeKey,
  useStudentScope,
  type StudentScope,
} from '@/shared/hooks/useStudentScope';
import { useStore } from '@/state/store';
import { toRegion } from '@/shared/utilities/toRegion';
import { ApiError } from '@/shared/utilities/apiError';
import {
  privateQueryOptions,
  useCancelInactive,
} from '../my-classes/hooks/useLearningQuery';
import { learningQueryKeys } from '../my-classes/hooks/learningQueryKeys';
import { orderQueryKeys } from '../payment/hooks/usePaymentQuery';
import { cartQueryKeys } from '../cart/hooks/useCartQuery';
import type { DataRegion } from '../home/types/home.type';
import { ordersService } from './orders.service';
import type { Order, OrderFilter } from './types';

export const purchaseKeys = {
  root: (scope: StudentScope) => ['purchases', ...scopeKey(scope)] as const,
  lists: (scope: StudentScope) =>
    [...purchaseKeys.root(scope), 'list'] as const,
  list: (scope: StudentScope, filter: OrderFilter) =>
    [...purchaseKeys.lists(scope), filter] as const,
  detail: (scope: StudentScope, id: string) =>
    [...purchaseKeys.root(scope), 'detail', id] as const,
};

export function useOrders(filter: OrderFilter, active: boolean) {
  const scope = useStudentScope();
  const enabled = scope.enabled && active;
  const key = purchaseKeys.list(scope, filter);
  const query = useInfiniteQuery({
    queryKey: key,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      ordersService.list(filter, pageParam, signal),
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
        .map((order) => [order.id, order]) ?? []
    ).values(),
  ];
  const coverClassIds = [
    ...new Set(
      rows.flatMap((order) =>
        order.details[0] ? [order.details[0].classId] : []
      )
    ),
  ];
  const covers = useQueries({
    queries: coverClassIds.map((classId) => ({
      queryKey: [...purchaseKeys.root(scope), 'cover', classId],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        ordersService.cover(classId, signal),
      enabled,
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  });
  const images = new Map(
    coverClassIds.map((id, index) => [id, covers[index]?.data])
  );
  const fallbackCovers = useQuery({
    queryKey: [...purchaseKeys.root(scope), 'course-covers'],
    queryFn: ({ signal }) => ordersService.courseCovers(signal),
    enabled:
      enabled && covers.some((cover) => cover.isError || cover.data === null),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const region: DataRegion<Order[]> = {
    status:
      !scope.enabled || query.isPending
        ? 'loading'
        : query.isError && !query.isFetchNextPageError
          ? 'error'
          : 'success',
    data:
      scope.enabled && query.data
        ? rows.map((order) => ({
            ...order,
            details: order.details.map((detail) => ({
              ...detail,
              imgUrl:
                images.get(detail.classId) ??
                fallbackCovers.data?.get(detail.courseTitle) ??
                null,
            })),
          }))
        : null,
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
    orders: region,
    hasMore: !!query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    loadMoreError: query.isFetchNextPageError,
    refreshing: query.isRefetching && !query.isFetchingNextPage,
    onRefresh: region.onRetry,
    onLoadMore: () => {
      if (enabled && !query.isFetching) query.fetchNextPage().catch(() => {});
    },
  };
}

export function useOrderDetail(id: string, active: boolean) {
  const scope = useStudentScope();
  const enabled = scope.enabled && active;
  const client = useQueryClient();
  const key = purchaseKeys.detail(scope, id);
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => ordersService.detail(id, signal),
    enabled,
    ...privateQueryOptions,
  });
  useCancelInactive(enabled, key);
  const mutation = useMutation({
    mutationFn: ordersService.cancel,
    retry: false,
    gcTime: 0,
  });
  const busy = useRef(false);
  const valid = () => {
    const session = useStore.getState();
    return (
      session.bootstrapStatus === 'ready' &&
      session.sessionUser?.role === 'STUDENT' &&
      session.sessionUser.id === scope.userId &&
      session.generation === scope.generation
    );
  };
  const invalidate = () => {
    for (const queryKey of [
      purchaseKeys.lists(scope),
      learningQueryKeys.root(scope),
      orderQueryKeys.detail(scope, id),
      cartQueryKeys.cart(scope),
      ['home', ...scopeKey(scope)],
    ]) {
      client.invalidateQueries({ queryKey }).catch(() => {});
    }
  };
  const cancel = async (orderId: string) => {
    if (busy.current || !enabled || !valid() || orderId !== id)
      throw new ApiError({
        statusCode: 409,
        code: 'ORDER_NOT_CANCELLABLE',
        message: 'Order unavailable',
      });
    busy.current = true;
    try {
      const cancelled = await mutation.mutateAsync(id);
      if (valid()) {
        await client.cancelQueries({ queryKey: key, exact: true });
        if (valid()) {
          client.setQueryData(key, cancelled);
          invalidate();
        }
      }
    } catch (e) {
      if (valid()) {
        invalidate();
        client
          .invalidateQueries({ queryKey: key, exact: true })
          .catch(() => {});
      }
      throw e;
    } finally {
      busy.current = false;
    }
  };
  const region = toRegion(query, enabled);
  if (query.error?.status === 403 || query.error?.status === 404)
    region.data = null;
  return { order: region, onCancel: cancel };
}
