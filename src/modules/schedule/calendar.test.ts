import { localDay, shiftDay, weekDays } from './calendar';

it('uses the business timezone across year boundaries', () => {
  expect(localDay('2026-12-31T18:00:00Z', 'Asia/Ho_Chi_Minh')).toBe(
    '2027-01-01'
  );
  expect(weekDays('2027-01-01')).toEqual([
    '2026-12-28',
    '2026-12-29',
    '2026-12-30',
    '2026-12-31',
    '2027-01-01',
    '2027-01-02',
    '2027-01-03',
  ]);
  expect(shiftDay('2028-02-28', 1)).toBe('2028-02-29');
});
