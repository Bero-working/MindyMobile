import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStudentScope } from '@/shared/hooks/useStudentScope';
import { toRegion } from '@/shared/utilities/toRegion';
import {
  privateQueryOptions,
  useCancelInactive,
} from '@/modules/my-classes/hooks/useLearningQuery';
import { learningQueryKeys } from '@/modules/my-classes/hooks/learningQueryKeys';
import { localDay, shiftDay, weekDays } from '../calendar';
import { scheduleService } from '../services/schedule.service';
import type { DataRegion } from '@/modules/home/types/home.type';
import type { ScheduleSession } from '../types';

// Convert a business calendar midnight to an ISO instant, including DST zones.
function midnight(day: string, timeZone: string) {
  const desired = Date.parse(`${day}T00:00:00Z`);
  let instant = desired;
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(instant);
    const part = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? '';
    const represented = Date.parse(
      `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}Z`
    );
    const correction = desired - represented;
    instant += correction;
    if (!correction) break;
  }
  return new Date(instant).toISOString();
}
export function scheduleWeekRange(day: string, timeZone: string) {
  const monday = weekDays(day)[0] ?? day;
  return {
    from: midnight(monday, timeZone),
    to: midnight(shiftDay(monday, 7), timeZone),
  };
}
export function useScheduleController(active = true) {
  const scope = useStudentScope();
  const enabled = scope.enabled && active;
  const [zone, setZone] = useState('Asia/Ho_Chi_Minh');
  const [anchorDay, onWeek] = useState(() =>
    localDay(new Date().toISOString(), zone)
  );
  const range = scheduleWeekRange(anchorDay, zone);
  const key = learningQueryKeys.schedule(scope, range.from, range.to);
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => scheduleService.week(range, signal),
    enabled,
    ...privateQueryOptions,
  });
  useCancelInactive(enabled, key);
  useEffect(() => {
    if (query.data?.timeZone) setZone(query.data.timeZone);
  }, [query.data?.timeZone]);
  const timeZone = enabled ? (query.data?.timeZone ?? zone) : zone;
  const sessions: DataRegion<ScheduleSession[]> = {
    ...toRegion(query, enabled),
    data: enabled ? (query.data?.items ?? null) : null,
  };
  return {
    sessions,
    anchorDay,
    today: localDay(new Date().toISOString(), timeZone),
    timeZone,
    onWeek,
    onRefresh: sessions.onRetry,
    refreshing: query.isRefetching,
  };
}
