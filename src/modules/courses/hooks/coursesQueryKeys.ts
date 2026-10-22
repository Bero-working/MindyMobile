import { scopeKey, type StudentScope } from '@/shared/hooks/useStudentScope';
import type { CourseQuery } from '../services/catalog.service';

export const coursesQueryKeys = {
  all: (scope: StudentScope) => ['courses', ...scopeKey(scope)] as const,
  categories: (scope: StudentScope) =>
    [...coursesQueryKeys.all(scope), 'categories'] as const,
  list: (scope: StudentScope, query: CourseQuery) =>
    [
      ...coursesQueryKeys.all(scope),
      'list',
      query.page,
      query.pageSize,
      query.categoryId ?? null,
      query.deliveryMode ?? null,
    ] as const,
  nextClass: (scope: StudentScope, courseId: string) =>
    [...coursesQueryKeys.all(scope), 'nextClass', courseId] as const,
  detail: (scope: StudentScope, courseId: string) =>
    [...coursesQueryKeys.all(scope), 'detail', courseId] as const,
  classes: (scope: StudentScope, courseId: string) =>
    [...coursesQueryKeys.all(scope), 'classes', courseId] as const,
  sessions: (scope: StudentScope, courseId: string) =>
    [...coursesQueryKeys.all(scope), 'sessions', courseId] as const,
};
