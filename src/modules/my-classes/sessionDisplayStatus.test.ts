import { sessionDisplayStatus } from './sessionDisplayStatus';

const now = Date.parse('2026-10-20T12:30:00Z');
it('marks a past scheduled session without mutating its server status', () => {
  const session = {
    status: 'SCHEDULED' as const,
    endsAt: '2026-10-16T14:00:00Z',
  };
  expect(sessionDisplayStatus(session, now)).toBe('COMPLETED');
  expect(session.status).toBe('SCHEDULED');
});
it('marks a session at its end time but leaves an ongoing or future session unchanged', () => {
  expect(
    sessionDisplayStatus(
      { status: 'IN_PROGRESS', endsAt: '2026-10-20T12:30:00Z' },
      now
    )
  ).toBe('COMPLETED');
  expect(
    sessionDisplayStatus(
      { status: 'IN_PROGRESS', endsAt: '2026-10-20T14:00:00Z' },
      now
    )
  ).toBe('IN_PROGRESS');
  expect(
    sessionDisplayStatus(
      { status: 'SCHEDULED', endsAt: '2026-10-23T14:00:00Z' },
      now
    )
  ).toBe('SCHEDULED');
});
it('keeps cancellations and explicit server completion authoritative', () => {
  expect(
    sessionDisplayStatus(
      { status: 'CANCELLED', endsAt: '2026-10-16T14:00:00Z' },
      now
    )
  ).toBe('CANCELLED');
  expect(
    sessionDisplayStatus(
      { status: 'COMPLETED', endsAt: '2026-10-23T14:00:00Z' },
      now
    )
  ).toBe('COMPLETED');
});
