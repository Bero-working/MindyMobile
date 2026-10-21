import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import type { ClassSession } from '../types';

export function useSessionTime(sessions: ClassSession[]) {
  const [now, setNow] = useState(Date.now);
  const nextEnd = sessions.reduce((earliest, session) => {
    const end = Date.parse(session.endsAt);
    return session.status !== 'CANCELLED' &&
      session.status !== 'COMPLETED' &&
      end > now
      ? Math.min(earliest, end)
      : earliest;
  }, Infinity);
  useEffect(() => {
    if (!Number.isFinite(nextEnd)) return;
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.min(2147483647, Math.max(0, nextEnd - Date.now()))
    );
    return () => clearTimeout(timer);
  }, [nextEnd, now]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => subscription.remove();
  }, []);
  return now;
}
