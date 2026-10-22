import { useEffect, useRef, useState } from 'react';
import type { HomeProps } from '../types/home.type';
export function useHomeController(props: HomeProps) {
  const [pending, setPending] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const refresh = async () => {
    if (lock.current || props.refreshing || !props.onRefresh) return;
    lock.current = true;
    setPending(true);
    setRefreshError(false);
    try {
      await props.onRefresh();
    } catch {
      if (mounted.current) setRefreshError(true);
    } finally {
      lock.current = false;
      if (mounted.current) setPending(false);
    }
  };
  const session = props.schedule.data;
  const upcoming =
    session &&
    new Date(session.startsAt).getTime() >= new Date(props.asOf).getTime()
      ? session
      : null;
  return {
    refresh,
    refreshing: pending || !!props.refreshing,
    refreshError,
    courses: props.courses.data?.slice(0, 4) ?? [],
    upcoming,
  };
}
