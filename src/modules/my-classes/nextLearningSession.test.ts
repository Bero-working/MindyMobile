import type { ClassSession } from './types';
import { nextLearningSession } from './nextLearningSession';
const now = Date.parse('2026-10-20T12:00:00Z');
const session = (
  id: string,
  start: string,
  end: string,
  status: ClassSession['status'] = 'SCHEDULED'
): ClassSession => ({
  id,
  sessionNumber: 1,
  title: id,
  startsAt: start,
  endsAt: end,
  status,
  roomName: null,
});
const past = session('past', '2026-10-16T12:00:00Z', '2026-10-16T14:00:00Z');
const next = session(
  'week2-first',
  '2026-10-20T12:00:00Z',
  '2026-10-20T14:00:00Z'
);
const future = session(
  'week2-second',
  '2026-10-23T12:00:00Z',
  '2026-10-23T14:00:00Z'
);
it('selects the closest remaining session by time across units and duplicate session numbers', () => {
  expect(nextLearningSession([future, past, next], now)?.id).toBe(
    'week2-first'
  );
});
it('moves to the next session exactly when the current session ends', () => {
  expect(nextLearningSession([next, future], Date.parse(next.endsAt))?.id).toBe(
    'week2-second'
  );
});
it('skips cancelled, completed and elapsed sessions and leaves no active row at the end', () => {
  expect(
    nextLearningSession(
      [
        past,
        { ...next, status: 'CANCELLED' },
        { ...future, status: 'COMPLETED' },
      ],
      now
    )
  ).toBeUndefined();
});
