import { scopeKey, type StudentScope } from '@/shared/hooks/useStudentScope';
export const learningQueryKeys = {
  root: (scope: StudentScope) =>
    ['student-learning', ...scopeKey(scope)] as const,
  classes: (scope: StudentScope, view: string) =>
    [...learningQueryKeys.root(scope), 'classes', view] as const,
  detail: (scope: StudentScope, classId: string) =>
    [...learningQueryKeys.root(scope), 'detail', classId] as const,
  schedule: (scope: StudentScope, from: string, to: string) =>
    [...learningQueryKeys.root(scope), 'schedule', from, to] as const,
  profile: (scope: StudentScope) =>
    [...learningQueryKeys.root(scope), 'profile'] as const,
};
