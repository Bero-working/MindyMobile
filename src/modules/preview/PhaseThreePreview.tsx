import { useEffect, useState } from 'react';
import { BackHandler, StatusBar, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { AppSheet } from '@/components/common/AppSheet';
import { ApiError } from '@/shared/utilities/apiError';
import { AccountScreen } from '../account/AccountScreen';
import { ScheduleScreen } from '../schedule/ScheduleScreen';
import { MyClassesScreen } from '../my-classes/MyClassesScreen';
import { ClassDetailScreen } from '../my-classes/ClassDetailScreen';
import { enrollmentAction } from '../my-classes/access';
import { localDay, weekDays } from '../schedule/calendar';
import type { DataRegion, HomeTab } from '../home/types/home.type';
import { learningFixtures } from './learningFixtures';
import PreviewPayment from './PreviewPayment';
import { PhaseTwoPreview } from './PhaseTwoPreview';
import { commerceFixtures } from './commerceFixtures';
import { colors } from '@/theme/colors';

type Mode = 'schedule' | 'account' | 'classes' | 'home' | 'courses';
export function PhaseThreePreview({
  initial = 'schedule',
  onExit,
}: {
  initial?: Mode;
  onExit: () => void;
}) {
  return __DEV__ ? (
    <LearningPreview
      initial={initial}
      onExit={onExit}
    />
  ) : null;
}
function LearningPreview({
  initial,
  onExit,
}: {
  initial: Mode;
  onExit: () => void;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>(initial);
  const [origin, setOrigin] = useState<'home' | 'courses' | 'account'>(
    initial === 'classes' ? 'account' : 'home'
  );
  const [today] = useState(() =>
    localDay(new Date().toISOString(), 'Asia/Ho_Chi_Minh')
  );
  const [week, setWeek] = useState(today);
  const [view, setView] = useState<'current' | 'history'>('current');
  const [expanded, setExpanded] = useState(['web']);
  const [state, setState] = useState<'success' | 'empty' | 'error' | 'loading'>(
    'success'
  );
  const [tools, setTools] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const [selection, setSelection] = useState<{
    classId: string;
    sessionId?: string;
  } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const fixtures = learningFixtures(today);
  const back = () => {
    if (tools) setTools(false);
    else if (orderId) setOrderId(null);
    else if (selection) setSelection(null);
    else if (mode === 'classes') setMode(origin);
    else onExit();
  };
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sessionOpen) return false;
      back();
      return true;
    });
    return () => sub.remove();
  }, [mode, origin, selection, tools, orderId, sessionOpen]);
  const tab = (next: HomeTab) => {
    if (next !== 'notifications') {
      setMode(next);
      setSelection(null);
    }
  };
  const classes = (source: 'home' | 'courses' | 'account') => {
    setOrigin(source);
    setMode('classes');
  };
  const region = <T,>(data: T | null): DataRegion<T> => ({
    status: state === 'empty' ? 'success' : state,
    data: state === 'loading' || state === 'error' ? null : data,
    onRetry: () => setState('success'),
    ...(state === 'error'
      ? { error: { code: 'PREVIEW_ERROR', requestId: 'phase3-preview' } }
      : {}),
  });
  const open = (classId: string, sessionId?: string) => {
    const row = fixtures.current.find((r) => r.classId === classId);
    if (!row || !['FULL', 'CASH_PREVIEW'].includes(enrollmentAction(row)))
      return;
    setSelection({ classId, ...(sessionId ? { sessionId } : {}) });
  };
  const detail =
    selection?.classId === 'cash' ? fixtures.cashDetail : fixtures.fullDetail;
  const content = orderId ? (
    <PreviewPayment
      order={{
        id: orderId,
        orderCode: 'PREVIEW-PAYOS',
        totalAmount: 1500000,
        expiresAt: `${today}T23:59:00+07:00`,
        details: [{ courseTitle: fixtures.fullDetail.name }],
      }}
      onLeave={() => setOrderId(null)}
    />
  ) : selection ? (
    <ClassDetailScreen
      detail={region(detail)}
      courseTitle={
        fixtures.current.find((row) => row.classId === selection.classId)
          ?.courseTitle
      }
      sessionId={selection.sessionId}
      onSessionChange={setSessionOpen}
      timeZone="Asia/Ho_Chi_Minh"
      onBack={() => setSelection(null)}
      onJoin={async () => {
        throw new Error('Preview only');
      }}
    />
  ) : null;
  return (
    <View
      className="flex-1 bg-canvas"
      testID="phase-three-preview"
    >
      <View className={selection || orderId ? 'hidden' : 'flex-1'}>
        <View className={mode === 'schedule' ? 'flex-1' : 'hidden'}>
          <ScheduleScreen
            sessions={region(
              state === 'empty'
                ? []
                : fixtures.schedule.filter((s) =>
                    weekDays(week).includes(
                      localDay(s.startsAt, 'Asia/Ho_Chi_Minh')
                    )
                  )
            )}
            anchorDay={week}
            today={today}
            timeZone="Asia/Ho_Chi_Minh"
            onWeek={setWeek}
            onTab={tab}
          />
        </View>
        {mode === 'account' && (
          <AccountScreen
            profile={region(fixtures.user)}
            onTab={tab}
            onMyClasses={() => classes('account')}
            onLogout={async () => {
              if (logoutError)
                throw new ApiError({
                  statusCode: 503,
                  code: 'PREVIEW_ERROR',
                  message: 'Preview',
                });
              onExit();
            }}
          />
        )}
        <View className={mode === 'classes' ? 'flex-1' : 'hidden'}>
          <MyClassesScreen
            enrollments={region(state === 'empty' ? [] : fixtures[view])}
            view={view}
            onView={(next) => {
              setView(next);
              setExpanded([next === 'current' ? 'web' : 'history']);
            }}
            expanded={expanded}
            onToggle={(id) =>
              setExpanded(
                expanded.includes(id)
                  ? expanded.filter((v) => v !== id)
                  : [...expanded, id]
              )
            }
            onOpen={(id) => open(id)}
            onResume={setOrderId}
            onBack={() => setMode(origin)}
            onExplore={() => setMode('courses')}
            onTab={tab}
            origin={origin}
            timeZone="Asia/Ho_Chi_Minh"
          />
        </View>
        {(mode === 'home' || mode === 'courses') && (
          <PhaseTwoPreview
            initialTab={mode}
            onPreviewTab={setMode}
            homeProps={{
              displayName: fixtures.user.displayName,
              courses: region(
                state === 'empty' ? [] : commerceFixtures().courses.slice(0, 4)
              ),
              schedule: region(
                state === 'empty'
                  ? null
                  : {
                      classId: 'full',
                      sessionId: 'full-session',
                      sessionTitle: t('learningPreview.session'),
                      className: t('learningPreview.class'),
                      startsAt: `${today}T18:00:00+07:00`,
                      accessMode: 'FULL' as const,
                    }
              ),
              timeZone: 'Asia/Ho_Chi_Minh',
              asOf: `${today}T12:00:00+07:00`,
            }}
            onLearningSession={(session) =>
              open(session.classId, session.sessionId)
            }
            onLearning={(next) => {
              if (next === 'classes') classes(mode);
              else tab(next);
            }}
          />
        )}
      </View>
      {content}
      {!orderId && !selection && (
        <View className="absolute bottom-[126px] right-[12px]">
          <Button
            testID="learning-preview-tools"
            variant="outline"
            label={t('preview.toolsShort')}
            accessibilityLabel={t('learningPreview.openTools')}
            className="min-h-[44px] px-[12px]"
            onPress={() => setTools(true)}
          />
        </View>
      )}
      {tools && (
        <AppSheet onClose={() => setTools(false)}>
          <View className="gap-[12px]">
            <Text
              accessibilityRole="header"
              className="font-nunito-extrabold text-[20px] text-forest"
            >
              {t('learningPreview.title')}
            </Text>
            <View className="flex-row flex-wrap gap-[8px]">
              {(['success', 'loading', 'empty', 'error'] as const).map((s) => (
                <Button
                  key={s}
                  testID={`learning-preview-${s}`}
                  label={t(`learningPreview.${s}`)}
                  variant={state === s ? 'default' : 'outline'}
                  onPress={() => {
                    setState(s);
                    setTools(false);
                  }}
                />
              ))}
            </View>
            <Button
              testID="learning-preview-logout-error"
              label={t('learningPreview.logoutError')}
              accessibilityState={{ selected: logoutError }}
              variant={logoutError ? 'default' : 'outline'}
              onPress={() => {
                setLogoutError(!logoutError);
                setTools(false);
              }}
            />
            <Button
              testID="learning-preview-exit"
              label={t('learningPreview.exit')}
              variant="outline"
              onPress={onExit}
            />
          </View>
        </AppSheet>
      )}
      <StatusBar
        barStyle={
          sessionOpen || (!selection && (orderId || mode === 'classes'))
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor={
          sessionOpen
            ? colors.coverASoft
            : selection
              ? colors.forestDeep
              : orderId || mode === 'classes'
                ? colors.canvas
                : colors.mint
        }
      />
    </View>
  );
}
