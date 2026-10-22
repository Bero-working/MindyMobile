import { scheduleWeekRange } from './useScheduleController';
it('builds a complete business week across years with the correct UTC offset', () => {
  expect(scheduleWeekRange('2027-01-01', 'Asia/Ho_Chi_Minh')).toEqual({
    from: '2026-12-27T17:00:00.000Z',
    to: '2027-01-03T17:00:00.000Z',
  });
});
it('honors daylight-saving boundaries in the response time zone', () => {
  const range = scheduleWeekRange('2026-03-08', 'America/New_York');
  expect(range).toEqual({
    from: '2026-03-02T05:00:00.000Z',
    to: '2026-03-09T04:00:00.000Z',
  });
});
