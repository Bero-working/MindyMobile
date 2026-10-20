export function summarizeSchedule(
  sessions: { startsAt: string }[],
  timeZone: string
): { weekdays: string[]; time: string } | null {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const weekdays = new Set<string>();
  const times = new Map<string, number>();
  for (const session of sessions) {
    const date = new Date(session.startsAt);
    if (!Number.isFinite(date.getTime())) continue;
    const parts = formatter.formatToParts(date);
    const part = (name: string) =>
      parts.find((p) => p.type === name)?.value ?? '';
    const day = part('weekday');
    const time = part('hour') + ':' + part('minute');
    weekdays.add(day);
    times.set(time, (times.get(time) ?? 0) + 1);
  }
  const time = [...times].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  )[0]?.[0];
  if (!time) return null;
  return {
    weekdays: days.flatMap((day, i) =>
      weekdays.has(day) ? [labels[i] ?? day] : []
    ),
    time,
  };
}
export function formatSchedule(
  sessions: { startsAt: string }[],
  timeZone: string
): string {
  const summary = summarizeSchedule(sessions, timeZone);
  return summary ? summary.weekdays.join(' · ') + ', ' + summary.time : '';
}
