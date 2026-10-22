import { useRef, useState } from 'react';
import { Linking } from 'react-native';
import {
  useIsFocused,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useStudentScope } from '@/shared/hooks/useStudentScope';
import { toRegion } from '@/shared/utilities/toRegion';
import type { NavigationProp, RootStackParamList } from '@/navigation/types';
import routes from '@/navigation/routes';
import type { HomeTab } from '@/modules/home/types/home.type';
import { authService } from '@/modules/auth/services/auth.service';
import { useAuthActions } from '@/modules/auth/hooks/useAuthSession';
import { AccountScreen } from '@/modules/account/AccountScreen';
import { ScheduleScreen } from '@/modules/schedule/ScheduleScreen';
import { useScheduleController } from '@/modules/schedule/hooks/useScheduleController';
import { MyClassesScreen } from './MyClassesScreen';
import { ClassDetailScreen } from './ClassDetailScreen';
import {
  privateQueryOptions,
  useClassDetailQuery,
  useMyClassesQuery,
} from './hooks/useLearningQuery';
import { learningQueryKeys } from './hooks/learningQueryKeys';
import { ScreenState } from '@/components/common/ScreenState';
import { LearningLayout } from './components/LearningLayout';

export function navigateLearningTab(navigation: NavigationProp, tab: HomeTab) {
  if (tab === 'home')
    navigation.navigate(routes.studentHome, undefined, { pop: true });
  else if (tab === 'courses')
    navigation.navigate(routes.courses, undefined, { pop: true });
  else if (tab === 'schedule')
    navigation.navigate(routes.studentSchedule, undefined, { pop: true });
  else if (tab === 'account')
    navigation.navigate(routes.studentAccount, undefined, { pop: true });
}
export function StudentScheduleRoute() {
  const active = useIsFocused();
  const navigation = useNavigation<NavigationProp>();
  const data = useScheduleController(active);
  return (
    <ScheduleScreen
      {...data}
      onTab={(tab) => navigateLearningTab(navigation, tab)}
    />
  );
}
export function StudentAccountRoute() {
  const active = useIsFocused();
  const scope = useStudentScope();
  const navigation = useNavigation<NavigationProp>();
  const profile = useQuery({
    queryKey: learningQueryKeys.profile(scope),
    queryFn: ({ signal }) => authService.me(signal),
    enabled: scope.enabled && active,
    ...privateQueryOptions,
  });
  const { signOut } = useAuthActions();
  return (
    <AccountScreen
      profile={toRegion(profile, scope.enabled && active)}
      onLogout={signOut}
      onTab={(tab) => navigateLearningTab(navigation, tab)}
      onMyClasses={() =>
        navigation.navigate(routes.myClasses, { origin: 'account' })
      }
    />
  );
}
export function MyClassesRoute() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, routes.myClasses>>();
  const active = useIsFocused();
  const [view, setView] = useState<'current' | 'history'>('current');
  const [expanded, setExpanded] = useState<string[]>([]);
  const data = useMyClassesQuery(view, active);
  return (
    <MyClassesScreen
      enrollments={data.region}
      view={view}
      onView={setView}
      expanded={expanded}
      onToggle={(id) =>
        setExpanded((previous) =>
          previous.includes(id)
            ? previous.filter((value) => value !== id)
            : [...previous, id]
        )
      }
      onOpen={(classId) =>
        navigation.navigate(routes.studentClassDetail, { classId })
      }
      onResume={(orderId) =>
        navigation.navigate(routes.payment, { orderId, origin: 'learning' })
      }
      onBack={() => navigation.goBack()}
      onExplore={() => navigation.navigate(routes.courses)}
      onTab={(tab) => navigateLearningTab(navigation, tab)}
      origin={route.params.origin}
      timeZone="Asia/Ho_Chi_Minh"
      hasMore={data.hasMore}
      loadingMore={data.loadingMore}
      loadMoreError={data.loadMoreError}
      onLoadMore={data.onLoadMore}
      refreshing={data.refreshing}
      onRefresh={data.onRefresh}
    />
  );
}
export function StudentClassDetailRoute() {
  const navigation = useNavigation<NavigationProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, routes.studentClassDetail>>();
  const active = useIsFocused();
  const scope = useStudentScope();
  const { t } = useTranslation();
  const data = useClassDetailQuery(route.params.classId, active);
  const current = useRef(data.detail);
  current.current = data.detail;
  if (!scope.enabled)
    return (
      <LearningLayout
        prefix="class-detail"
        title={t('classDetail.title')}
        onBack={() => navigation.goBack()}
      >
        <ScreenState
          title={t('classDetail.title')}
          description={t('home.authRequired')}
        />
      </LearningLayout>
    );
  return (
    <ClassDetailScreen
      detail={data.detail}
      sessionId={route.params.sessionId}
      courseTitle={data.enrollment?.courseTitle}
      courseImageUrl={data.enrollment?.courseImageUrl}
      timeZone="Asia/Ho_Chi_Minh"
      onBack={() => navigation.goBack()}
      onJoin={async (url) => {
        if (
          !active ||
          current.current.status !== 'success' ||
          current.current.data?.accessMode !== 'FULL'
        )
          throw new Error('Class access not verified');
        await Linking.openURL(url);
      }}
    />
  );
}
