import type { ImageSourcePropType } from 'react-native';
import type { ReactNode } from 'react';
export type HomeCourse = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  imgUrl: string | null;
  priceAmount: number;
  category: { id: string; name: string; slug: string };
  openClass?: { deliveryMode: 'ONLINE' | 'OFFLINE'; startDate: string };
};
export type HomeSession = {
  classId: string;
  sessionId: string;
  sessionTitle: string;
  className: string;
  startsAt: string;
  accessMode: 'FULL' | 'CASH_PREVIEW';
};
export type DataRegion<T> = {
  status: 'loading' | 'success' | 'error';
  data: T | null;
  error?: { code: string; requestId?: string };
  onRetry?: () => void;
};
export type HomeTab =
  | 'courses'
  | 'schedule'
  | 'home'
  | 'notifications'
  | 'account';
export type HomeActions = {
  onCourse?: (id: string) => void;
  onSelectCourse?: (id: string) => void;
  onSession?: (
    session: Pick<HomeSession, 'classId' | 'sessionId' | 'accessMode'>
  ) => void;
  onExplore?: () => void;
  onCart?: () => void;
  onIntro?: (index: number) => void;
  onCompiler?: () => void;
  onTab?: (tab: HomeTab) => void;
  onMyClasses?: () => void;
};
export type HomeProps = {
  learningEnabled?: boolean;
  cartCount?: number;
  sessionControls?: ReactNode;
  displayName: string;
  mascot?: ImageSourcePropType;
  courses: DataRegion<HomeCourse[]>;
  schedule: DataRegion<HomeSession>;
  timeZone: string;
  asOf: string;
  actions?: HomeActions;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
};
