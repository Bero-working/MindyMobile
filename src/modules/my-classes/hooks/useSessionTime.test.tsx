import '../../../../tests/mocks/nativeUi';
import { act, renderHook } from '@testing-library/react-native';
import { useSessionTime } from './useSessionTime';
it('updates at the end boundary without an API polling interval', () => {
  jest.useFakeTimers();
  const start = Date.parse('2026-10-20T12:00:00Z');
  jest.setSystemTime(start);
  try {
    const view = renderHook(() =>
      useSessionTime([
        {
          id: 's',
          sessionNumber: 1,
          title: 'Session',
          startsAt: new Date(start).toISOString(),
          endsAt: new Date(start + 1000).toISOString(),
          status: 'SCHEDULED',
          roomName: null,
        },
      ])
    );
    expect(view.result.current).toBe(start);
    act(() => jest.advanceTimersByTime(1000));
    expect(view.result.current).toBe(start + 1000);
    view.unmount();
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    jest.useRealTimers();
  }
});
