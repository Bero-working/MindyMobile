import { useRef } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useStudentScope } from '@/shared/hooks/useStudentScope';
import { toRegion } from '@/shared/utilities/toRegion';
import type { DataRegion } from '@/modules/home/types/home.type';
import { catalogService, type CourseQuery } from '../services/catalog.service';
import type { Course, DeliveryMode } from '../types/courses.type';
import { coursesQueryKeys } from './coursesQueryKeys';

export type CatalogFilter = {
  page: number;
  categoryId: string | null;
  deliveryMode?: DeliveryMode | undefined;
  // Present while the filter sheet is open, to count matches for the draft choice.
  filterDraft?: { deliveryMode?: DeliveryMode | undefined } | undefined;
};
const PAGE_SIZE = 6;
export function useCatalogQuery(filter: CatalogFilter) {
  const scope = useStudentScope();
  const { enabled } = scope;
  const listQuery: CourseQuery = {
    page: filter.page,
    pageSize: PAGE_SIZE,
    categoryId: filter.categoryId,
    deliveryMode: filter.deliveryMode,
  };
  const firstPage: CourseQuery = { page: 1, pageSize: PAGE_SIZE };
  const categories = useQuery({
    queryKey: coursesQueryKeys.categories(scope),
    queryFn: ({ signal }) => catalogService.categories(signal),
    enabled,
  });
  const list = useQuery({
    queryKey: coursesQueryKeys.list(scope, listQuery),
    queryFn: ({ signal }) => catalogService.courses(listQuery, signal),
    enabled,
  });
  // Recommendations are the first three courses in server order (no ranking API).
  const recommended = useQuery({
    queryKey: coursesQueryKeys.list(scope, firstPage),
    queryFn: ({ signal }) => catalogService.courses(firstPage, signal),
    enabled,
  });
  const draft: CourseQuery | null = filter.filterDraft
    ? {
        page: 1,
        pageSize: 1,
        categoryId: filter.categoryId,
        deliveryMode: filter.filterDraft.deliveryMode,
      }
    : null;
  const draftCount = useQuery({
    queryKey: coursesQueryKeys.list(scope, draft ?? firstPage),
    queryFn: ({ signal }) => catalogService.courses(draft ?? firstPage, signal),
    enabled: enabled && !!draft,
  });
  const ids = [
    ...new Set(
      [...(list.data?.items ?? []), ...(recommended.data?.items ?? [])]
        .slice(0, PAGE_SIZE + 3)
        .map((course) => course.id)
    ),
  ];
  const nextClasses = useQueries({
    queries: ids.map((courseId) => ({
      queryKey: coursesQueryKeys.nextClass(scope, courseId),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        catalogService.nextClass(courseId, signal),
      enabled,
      retry: false,
      staleTime: 5 * 60_000,
    })),
  });
  const withNext = (courses: Course[]): Course[] =>
    courses.map((course) => {
      const next = nextClasses[ids.indexOf(course.id)]?.data;
      return next ? { ...course, openClass: next } : course;
    });
  const lastTotal = useRef(0);
  if (list.data) lastTotal.current = list.data.total;
  const listRegion = toRegion(list, enabled);
  const recommendRegion = toRegion(recommended, enabled);
  const courses: DataRegion<Course[]> = {
    ...listRegion,
    data: list.data && enabled ? withNext(list.data.items) : null,
  };
  const recommendations: DataRegion<Course[]> = {
    ...recommendRegion,
    data:
      recommended.data && enabled
        ? withNext(recommended.data.items.slice(0, 3))
        : null,
  };
  return {
    courses,
    recommendations,
    categories: toRegion(categories, enabled),
    total: enabled ? lastTotal.current : 0,
    filterTotal: draft && draftCount.data ? draftCount.data.total : undefined,
    refreshing: list.isRefetching || categories.isRefetching,
    refetchAll: () =>
      Promise.allSettled([
        list.refetch(),
        recommended.refetch(),
        categories.refetch(),
      ]),
  };
}
