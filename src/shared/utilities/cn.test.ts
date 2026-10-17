import { cn } from './cn';
it('merges conflicting utilities and ignores falsy values', () => {
  expect(cn('px-2', false, null, undefined, 'px-4')).toBe('px-4');
});
