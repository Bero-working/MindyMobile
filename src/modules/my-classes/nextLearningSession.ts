import type { ClassSession } from './types';
import { sessionDisplayStatus } from './sessionDisplayStatus';

export function nextLearningSession(sessions: ClassSession[], now: number) {
  return sessions
    .filter((session) => {
      const status = sessionDisplayStatus(session, now);
      return status !== 'CANCELLED' && status !== 'COMPLETED';
    })
    .sort(
      (a, b) =>
        Date.parse(a.startsAt) - Date.parse(b.startsAt) ||
        a.id.localeCompare(b.id)
    )[0];
}
