import '../../../tests/mocks/nativeUi';
import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useCarouselAutoplay } from './useCarouselAutoplay';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());
it('advances left to right every 3 seconds and loops without sweeping backwards', () => {
  const onScrollTo = jest.fn();
  const { result, unmount } = renderHook(() =>
    useCarouselAutoplay({ count: 3, width: 320, onScrollTo })
  );
  act(() => jest.advanceTimersByTime(2999));
  expect(result.current.index).toBe(0);
  act(() => jest.advanceTimersByTime(1));
  expect(result.current.index).toBe(1);
  expect(onScrollTo).toHaveBeenLastCalledWith({ x: 320, animated: true });
  act(() => jest.advanceTimersByTime(3000));
  expect(result.current.index).toBe(2);
  act(() => jest.advanceTimersByTime(3000));
  expect(result.current.index).toBe(0);
  expect(onScrollTo).toHaveBeenLastCalledWith({ x: 0, animated: false });
  unmount();
  expect(jest.getTimerCount()).toBe(0);
});
it('restarts the 3 second delay after choosing a dot and pauses during dragging', () => {
  const { result } = renderHook(() =>
    useCarouselAutoplay({ count: 3, width: 320, onScrollTo: jest.fn() })
  );
  act(() => jest.advanceTimersByTime(2000));
  act(() => result.current.select(1));
  act(() => jest.advanceTimersByTime(2999));
  expect(result.current.index).toBe(1);
  act(() => result.current.onScrollBeginDrag());
  act(() => jest.advanceTimersByTime(9000));
  expect(result.current.index).toBe(1);
  act(() =>
    result.current.onScrollEndDrag({
      nativeEvent: {
        contentOffset: { x: 640 },
        layoutMeasurement: { width: 320 },
      },
    })
  );
  act(() => jest.advanceTimersByTime(3000));
  expect(result.current.index).toBe(0);
});
it('pauses in the background, resumes in foreground and handles shrinking data', () => {
  const listener = jest.mocked(AppState.addEventListener);
  const { result, rerender } = renderHook(
    ({ count }: { count: number }) =>
      useCarouselAutoplay({ count, width: 320, onScrollTo: jest.fn() }),
    { initialProps: { count: 3 } }
  );
  act(() => result.current.select(2));
  rerender({ count: 1 });
  expect(result.current.index).toBe(0);
  expect(jest.getTimerCount()).toBe(0);
  rerender({ count: 3 });
  const change = listener.mock.calls[listener.mock.calls.length - 1]?.[1];
  act(() => change?.('background'));
  act(() => jest.advanceTimersByTime(9000));
  expect(result.current.index).toBe(0);
  act(() => change?.('active'));
  act(() => jest.advanceTimersByTime(3000));
  expect(result.current.index).toBe(1);
});
it('still advances every 3 seconds with Reduce Motion, using instant transitions', () => {
  jest.mocked(useReducedMotion).mockReturnValue(true);
  const onScrollTo = jest.fn();
  const { result } = renderHook(() =>
    useCarouselAutoplay({ count: 3, width: 320, onScrollTo })
  );
  act(() => jest.advanceTimersByTime(3000));
  expect(result.current.index).toBe(1);
  expect(onScrollTo).toHaveBeenLastCalledWith({ x: 320, animated: false });
  jest.mocked(useReducedMotion).mockReturnValue(false);
});
