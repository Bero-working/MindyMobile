/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useState } from 'react';
import { deferComponent } from '@/components/common/deferComponent';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import { MeetingButton } from './components/MeetingButton';
import { MaterialsButton } from './components/MaterialsButton';
import { colors } from '@/theme/colors';
import {
  displayDay,
  displayInstant,
  displayTime,
  localDay,
} from '../schedule/calendar';
import type { ClassSession } from './types';
import { sessionDisplayStatus } from './sessionDisplayStatus';

const SessionAssignments = deferComponent(
  () =>
    (
      require('../assignments/SessionAssignments') as typeof import('../assignments/SessionAssignments')
    ).SessionAssignments
);

export function SessionDetailScreen({
  session,
  classCode,
  totalSessions,
  unitTitle,
  mentorName,
  deliveryMode,
  timeZone,
  onClose,
  onJoin,
  joining,
  joinError,
  onWhiteboard,
  onMaterials,
  assignmentsClassId,
  focused = true,
}: {
  session: ClassSession;
  classCode: string;
  totalSessions: number;
  unitTitle: string;
  mentorName: string;
  deliveryMode: 'ONLINE' | 'OFFLINE';
  timeZone: string;
  onClose: () => void;
  onJoin?: (() => void) | undefined;
  joining: boolean;
  joinError: boolean;
  onWhiteboard?: (() => void) | undefined;
  onMaterials?: (() => void) | undefined;
  assignmentsClassId?: string | undefined;
  focused?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<'content' | 'assignments'>('content');
  useEffect(() => {
    setTab('content');
  }, [session.id, assignmentsClassId]);
  const { width, fontScale } = useWindowDimensions();
  const compact = width <= 360 || fontScale >= 1.3;
  useEffect(() => {
    if (!focused) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      }
    );
    return () => subscription.remove();
  }, [onClose, focused]);
  const day = localDay(session.startsAt, timeZone);
  const dayIndex = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;
  const facts = [
    {
      label: t('classDetail.session.date'),
      value: `${t(`schedule.days.${dayIndex}`)} ${displayDay(day)}`,
    },
    {
      label: t('classDetail.session.time'),
      value: `${displayTime(session.startsAt, timeZone)} – ${displayTime(session.endsAt, timeZone)}`,
    },
    { label: t('classDetail.mentorLabel'), value: mentorName },
    {
      label: t('classDetail.deliveryLabel'),
      value: t(`schedule.delivery.${deliveryMode}`),
    },
    ...(deliveryMode === 'OFFLINE'
      ? [
          {
            label: t('classDetail.session.room'),
            value: session.roomName ?? t('classDetail.noRoom'),
          },
        ]
      : []),
  ];
  return (
    <View className="flex-1 bg-cover-a-soft">
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.coverASoft}
      />
      <SafeAreaView
        edges={['top']}
        testID="class-session-screen"
        accessibilityViewIsModal
        className="flex-1 bg-cover-a-soft"
      >
        <View
          className={
            assignmentsClassId
              ? 'gap-[12px] px-[16px] pt-[12px]'
              : 'gap-[12px] px-[16px] pb-[24px] pt-[12px]'
          }
        >
          <View className="mb-[4px] flex-row items-center gap-[8px]">
            <PressableScale
              testID="class-session-close"
              accessibilityRole="button"
              accessibilityLabel={t('learning.back')}
              onPress={onClose}
              className="h-[44px] w-[44px] items-center justify-center rounded-full bg-canvas"
            >
              <Icon
                name="back"
                size={compact ? 17 : 18}
              />
            </PressableScale>
            <Text className="flex-1 text-center font-nunito-semibold text-[13px] text-forest">
              {t('classDetail.session.heading', {
                code: classCode,
                number: session.sessionNumber,
                total: totalSessions,
              })}
            </Text>
            {onWhiteboard ? (
              <PressableScale
                testID="class-session-whiteboard"
                accessibilityRole="button"
                accessibilityLabel={t('whiteboard.open')}
                onPress={onWhiteboard}
                className="h-[44px] w-[44px] items-center justify-center rounded-full bg-canvas"
              >
                <Icon
                  name="board"
                  size={compact ? 18 : 20}
                  color={colors.forest}
                />
              </PressableScale>
            ) : (
              <View className="w-[44px]" />
            )}
          </View>
          <View className="items-start">
            <View className="rounded-full bg-canvas px-[10px] py-[5px]">
              <Text
                className={
                  session.status === 'CANCELLED'
                    ? 'font-nunito-bold text-[11px] text-headsup'
                    : 'font-nunito-bold text-[11px] text-mint'
                }
              >
                {t(`learning.sessionStatus.${sessionDisplayStatus(session)}`)}
              </Text>
            </View>
          </View>
          <Text
            accessibilityRole="header"
            className="font-nunito-extrabold text-[22px] leading-[28px] text-black"
          >
            {session.title}
          </Text>
          <Text className="font-nunito text-[13px] text-muted">
            {t('classDetail.session.unit', { title: unitTitle })}
          </Text>
          {assignmentsClassId && (
            <View
              accessibilityRole="tablist"
              className="flex-row items-end gap-[4px] pt-[8px]"
            >
              {(['content', 'assignments'] as const).map((value) => (
                <Pressable
                  key={value}
                  testID={`class-session-tab-${value}`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: tab === value }}
                  hitSlop={{ top: 4, bottom: 4 }}
                  onPress={() => setTab(value)}
                  className={
                    tab === value
                      ? 'h-[48px] justify-center rounded-t-[18px] bg-canvas px-[22px]'
                      : 'h-[40px] justify-center rounded-t-[18px] bg-canvas/50 px-[22px]'
                  }
                >
                  <Text
                    maxFontSizeMultiplier={1.3}
                    className={
                      tab === value
                        ? 'font-nunito-extrabold text-[14px] text-black'
                        : 'font-nunito-bold text-[14px] text-forest'
                    }
                  >
                    {t(`assignments.tabs.${value}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <View
          className={
            assignmentsClassId
              ? 'flex-1 rounded-tr-[28px] bg-canvas pt-[20px]'
              : 'flex-1 rounded-t-[28px] bg-canvas pt-[20px]'
          }
        >
          <ScrollView
            key={tab}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-[20px] px-[16px] pb-[24px]"
          >
            {tab === 'assignments' && assignmentsClassId ? (
              <SessionAssignments
                key={`${assignmentsClassId}:${session.id}`}
                classId={assignmentsClassId}
                sessionId={session.id}
                timeZone={timeZone}
              />
            ) : (
              <>
                <View className="-mx-[5px] flex-row flex-wrap">
                  {facts.map((fact) => (
                    <View
                      key={fact.label}
                      className="w-1/2 px-[5px] pb-[10px]"
                    >
                      <View className="min-h-[64px] gap-[5px] rounded-[14px] bg-soft p-[12px]">
                        <Text className="font-nunito-semibold text-[11.5px] text-muted">
                          {fact.label}
                        </Text>
                        <Text className="font-nunito-bold text-[14px] leading-[20px] text-black">
                          {fact.value}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                {localDay(session.endsAt, timeZone) !== day && (
                  <Text className="font-nunito text-[13px] text-muted">
                    {displayInstant(session.endsAt, timeZone, i18n.language)}
                  </Text>
                )}
                {joinError && (
                  <Text
                    accessibilityRole="alert"
                    className="font-nunito text-[14px] text-headsup"
                  >
                    {t('classDetail.linkError')}
                  </Text>
                )}
                <View className="gap-[10px]">
                  <Text
                    accessibilityRole="header"
                    className="font-nunito-extrabold text-[17px] text-black"
                  >
                    {t('classDetail.session.content')}
                  </Text>
                  <Text className="font-nunito text-[14px] leading-[24px] text-muted">
                    {t('classDetail.session.noContent')}
                  </Text>
                </View>
                <View className="gap-[10px]">
                  <Text
                    accessibilityRole="header"
                    className="font-nunito-extrabold text-[17px] text-black"
                  >
                    {t('classDetail.session.objectives')}
                  </Text>
                  <Text className="font-nunito text-[14px] leading-[24px] text-muted">
                    {t('classDetail.session.noObjectives')}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
          <SafeAreaView
            edges={['bottom']}
            className="bg-canvas px-[16px] pb-[20px] pt-[8px]"
          >
            <View className="flex-row items-center justify-between gap-[8px]">
              <View className="shrink">
                <MaterialsButton
                  testID="class-session-materials"
                  compact={compact}
                  onPress={onMaterials}
                />
              </View>
              {onJoin && (
                <MeetingButton
                  testID="class-session-join"
                  joining={joining}
                  onPress={onJoin}
                />
              )}
            </View>
          </SafeAreaView>
        </View>
      </SafeAreaView>
    </View>
  );
}
