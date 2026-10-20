import { act, renderHook } from '@testing-library/react-native';
import { useCountdown } from './hooks/useCountdown';
import { AppState } from 'react-native';
it('recalculates expiry from wall clock and stops at zero', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-18T00:00:00Z'));
  const { result, unmount } = renderHook(() =>
    useCountdown('2026-10-18T00:00:02Z')
  );
  expect(result.current.seconds).toBe(2);
  act(() => {
    jest.advanceTimersByTime(3000);
  });
  expect(result.current.seconds).toBe(0);
  expect(result.current.expired).toBe(true);
  unmount();
  expect(jest.getTimerCount()).toBe(0);
  jest.useRealTimers();
});

it('recalculates on foreground even when no interval fired while suspended', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-18T00:00:00Z'));
  const listener = jest.spyOn(AppState, 'addEventListener');
  const { result, unmount } = renderHook(() =>
    useCountdown('2026-10-18T00:15:00Z')
  );
  act(() => {
    jest.setSystemTime(new Date('2026-10-18T01:00:00Z'));
    listener.mock.calls[listener.mock.calls.length - 1]?.[1]('active');
  });
  expect(result.current.expired).toBe(true);
  expect(result.current.time).toBe('00:00');
  unmount();
  listener.mockRestore();
  jest.useRealTimers();
});
