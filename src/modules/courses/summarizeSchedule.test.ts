import { summarizeSchedule } from './summarizeSchedule';
it('summarizes weekdays in the supplied timezone, using the most common time', () => {
  expect(
    summarizeSchedule(
      [
        { startsAt: '2026-10-19T12:00:00Z' },
        { startsAt: '2026-10-21T12:00:00Z' },
        { startsAt: '2026-10-23T13:00:00Z' },
      ],
      'Asia/Ho_Chi_Minh'
    )
  ).toEqual({ weekdays: ['T2', 'T4', 'T6'], time: '19:00' });
  expect(
    summarizeSchedule(
      [{ startsAt: '2026-10-17T18:00:00Z' }],
      'Asia/Ho_Chi_Minh'
    )
  ).toEqual({ weekdays: ['CN'], time: '01:00' });
  expect(summarizeSchedule([], 'Asia/Ho_Chi_Minh')).toBeNull();
});
