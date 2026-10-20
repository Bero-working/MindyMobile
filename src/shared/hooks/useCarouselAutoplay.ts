import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

type ScrollEvent = {
  nativeEvent: {
    contentOffset: { x: number };
    layoutMeasurement: { width: number };
  };
};
type Options = {
  count: number;
  width: number;
  onScrollTo: (options: { x: number; animated: boolean }) => void;
};

/** All carousels advance in ascending page order, every three seconds. */
export function useCarouselAutoplay({ count, width, onScrollTo }: Options) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const current = useRef(0);
  const scrollTo = useRef(onScrollTo);
  scrollTo.current = onScrollTo;
  const [dragging, setDragging] = useState(false);
  const manual = useRef(false);
  const [active, setActive] = useState(
    AppState.currentState !== 'background' &&
      AppState.currentState !== 'inactive'
  );
  const [revision, restart] = useReducer((value: number) => value + 1, 0);
  const clamp = useCallback(
    (page: number) => Math.max(0, Math.min(Math.max(0, count - 1), page)),
    [count]
  );
  const move = useCallback(
    (page: number, animated: boolean) => {
      const next = clamp(page);
      current.current = next;
      setIndex(next);
      if (width > 0)
        scrollTo.current({ x: next * width, animated: animated && !reduced });
    },
    [clamp, width, reduced]
  );
  useEffect(() => {
    move(current.current, false);
  }, [count, width, move]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) =>
      setActive(state === 'active')
    );
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (count <= 1 || width <= 0 || !active || dragging) return;
    const timer = setInterval(() => {
      const next = (current.current + 1) % count;
      move(next, next !== 0);
    }, 3000);
    return () => clearInterval(timer);
  }, [count, width, active, dragging, revision, move]);
  const settle = (event: ScrollEvent) => {
    const pageWidth = event.nativeEvent.layoutMeasurement.width || width;
    if (pageWidth > 0) {
      const page = clamp(
        Math.round(event.nativeEvent.contentOffset.x / pageWidth)
      );
      current.current = page;
      setIndex(page);
    }
  };
  return {
    index,
    select: (page: number) => {
      manual.current = false;
      move(page, true);
      restart();
    },
    onScrollBeginDrag: () => {
      manual.current = true;
      setDragging(true);
    },
    onScrollEndDrag: (event: ScrollEvent) => {
      settle(event);
      setDragging(false);
      restart();
    },
    onMomentumScrollEnd: (event: ScrollEvent) => {
      settle(event);
      if (manual.current) {
        manual.current = false;
        restart();
      }
    },
  };
}
