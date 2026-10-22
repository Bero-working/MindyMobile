import { formatVnd, formatDateOnly } from './formatVnd';

it('formats zero and whole VND amounts consistently', () => {
  expect(formatVnd(1500000)).toBe('1.500.000 VND');
  expect(formatVnd(0)).toBe('0 VND');
});

it('formats date-only values without timezone conversion', () => {
  expect(formatDateOnly('2026-10-01')).toBe('01/10');
});
