import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
export function useCountdown(expiresAt: string | null) {
  const deadline = expiresAt ? Date.parse(expiresAt) : NaN;
  const remaining = () =>
    Number.isFinite(deadline)
      ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      : null;
  const [seconds, setSeconds] = useState<number | null>(remaining);
  useEffect(() => {
    setSeconds(remaining());
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      const value = remaining();
      setSeconds(value);
      if (value === 0 && timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };
    if (remaining() !== null && remaining() !== 0)
      timer = setInterval(update, 1000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') update();
    });
    return () => {
      if (timer) clearInterval(timer);
      sub.remove();
    };
  }, [expiresAt]);
  return {
    seconds,
    expired: seconds === 0,
    time:
      seconds === null
        ? ''
        : String(Math.floor(seconds / 60)).padStart(2, '0') +
          ':' +
          String(seconds % 60).padStart(2, '0'),
  };
}
