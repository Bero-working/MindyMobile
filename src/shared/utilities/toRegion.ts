import type { UseQueryResult } from '@tanstack/react-query';
import type { DataRegion } from '@/modules/home/types/home.type';
import type { ApiError } from './apiError';

export function toRegion<T>(
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
      if (enabled) query.refetch().catch(() => {});
    },
  };
}
