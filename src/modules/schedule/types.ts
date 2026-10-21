import type { DataRegion, HomeTab } from '../home/types/home.type';
export type ScheduleSession = {
  sessionId: string;
  sessionNumber: number;
  sessionTitle: string;
  sessionStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startsAt: string;
  endsAt: string;
  classId: string;
  classCode: string;
  className: string;
  courseTitle: string;
  deliveryMode: 'ONLINE' | 'OFFLINE';
  mentor: { displayName: string } | null;
  roomName: string | null;
  accessMode: 'FULL' | 'CASH_PREVIEW';
};
export type ScheduleProps = {
  sessions: DataRegion<ScheduleSession[]>;
  anchorDay: string;
  today: string;
  timeZone: string;
  onWeek: (day: string) => void;
  onTab: (tab: HomeTab) => void;
  refreshing?: boolean;
  onRefresh?: (() => void) | undefined;
};
