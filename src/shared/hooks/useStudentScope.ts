import { useStore } from '@/state/store';

export type StudentScope = {
  enabled: boolean;
  userId: string | undefined;
  generation: number;
};
// Student data is keyed by user and session generation so a new session never reads the previous user's cache.
export function useStudentScope(): StudentScope {
  const user = useStore((state) => state.sessionUser);
  const generation = useStore((state) => state.generation);
  const status = useStore((state) => state.bootstrapStatus);
  return {
    enabled: status === 'ready' && user?.role === 'STUDENT',
    userId: user?.id,
    generation,
  };
}
export const scopeKey = (scope: StudentScope) =>
  [scope.userId, scope.generation] as const;
