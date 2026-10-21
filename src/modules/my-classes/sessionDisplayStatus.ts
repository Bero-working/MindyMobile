import type { ClassSession } from './types';

// Presentation only: elapsed schedule time is not a student's attendance record.
export function sessionDisplayStatus(
  session: Pick<ClassSession, 'status' | 'endsAt'>,
  now = Date.now()
): ClassSession['status'] {
  if (session.status === 'CANCELLED' || session.status === 'COMPLETED')
    return session.status;
  return Date.parse(session.endsAt) <= now ? 'COMPLETED' : session.status;
}
