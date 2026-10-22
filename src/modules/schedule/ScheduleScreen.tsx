import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';
import { PressableScale } from '@/components/common/PressableScale';
import {
  LearningLayout,
  LearningState,
} from '../my-classes/components/LearningLayout';
import {
  displayDay,
  displayInstant,
  displayTime,
  localDay,
  shiftDay,
  weekDays,
} from './calendar';
import type { ScheduleProps, ScheduleSession } from './types';

export function ScheduleScreen(props: ScheduleProps) {
  const { t, i18n } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const days = weekDays(props.anchorDay);
  const first = days[0] ?? props.anchorDay;
  const last = days[6] ?? props.anchorDay;
  const [selection, setSelection] = useState<{
    week: string;
    day: string;
  } | null>(() =>
    days.includes(props.today) ? { week: first, day: props.today } : null
  );
  const selected = selection?.week === first ? selection.day : null;
  const content = useRef<ScrollView>(null);
  const strip = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});
  const reduced = useReducedMotion();
  const compact = width <= 360 || fontScale >= 1.3;
  const dayStyle = useMemo(
    () => ({ width: Math.max(44, (width - 32) / 7) }),
    [width]
  );
  const choose = (day: string) => {
    setSelection({ week: weekDays(day)[0] ?? day, day });
    strip.current?.scrollTo({
      x: Math.max(0, days.indexOf(day) - 3) * dayStyle.width,
      animated: !reduced,
    });
    const y = positions.current[day];
    if (y !== undefined) content.current?.scrollTo({ y, animated: !reduced });
  };
  useEffect(() => {
    strip.current?.scrollTo({
      x: Math.max(0, days.indexOf(selected ?? '') - 3) * dayStyle.width,
      animated: false,
    });
  }, [first, dayStyle.width]);
  const items = props.sessions.data ?? [];
  const groups = days.map((day, index) => ({
    day,
    index,
    sessions: items
      .filter((s) => localDay(s.startsAt, props.timeZone) === day)
      .sort(
        (a, b) =>
          Date.parse(a.startsAt) - Date.parse(b.startsAt) ||
          a.sessionId.localeCompare(b.sessionId)
      ),
  }));
  const label = (session: ScheduleSession) =>
    [
      session.courseTitle,
      session.classCode,
      session.className,
      session.sessionTitle,
      displayInstant(session.startsAt, props.timeZone, i18n.language),
      displayInstant(session.endsAt, props.timeZone, i18n.language),
      t(`learning.sessionStatus.${session.sessionStatus}`),
      t(`learning.delivery.${session.deliveryMode}`),
      session.accessMode === 'CASH_PREVIEW' ? t('myClasses.preview') : '',
    ]
      .filter(Boolean)
      .join(', ');
  const month = t('schedule.month', {
    month:
      i18n.language === 'vi-VN'
        ? Number(props.anchorDay.slice(5, 7))
        : new Intl.DateTimeFormat('en-GB', {
            month: 'long',
            timeZone: 'UTC',
          }).format(new Date(`${props.anchorDay}T12:00:00Z`)),
    year: props.anchorDay.slice(0, 4),
  });
  const calendarHeader = (
    <View className="bg-canvas px-[16px]">
      <View className="flex-row items-center justify-between py-[10px]">
        <PressableScale
          testID="schedule-prev-week"
          accessibilityRole="button"
          accessibilityLabel={t('schedule.previousWeek')}
          onPress={() => props.onWeek(shiftDay(first, -7))}
          className="h-[44px] w-[44px] items-center justify-center rounded-full border border-line"
        >
          <Text className="font-nunito-extrabold text-[22px] text-mint">
            {t('schedule.previous')}
          </Text>
        </PressableScale>
        <PressableScale
          testID="schedule-today"
          accessibilityRole="button"
          accessibilityLabel={`${month}, ${t('schedule.week', { from: displayDay(first), to: displayDay(last) })}`}
          accessibilityHint={t('schedule.goToday')}
          onPress={() => {
            props.onWeek(props.today);
            choose(props.today);
          }}
          className="min-h-[44px] flex-1 items-center justify-center px-[8px]"
        >
          <Text className="text-center font-nunito-extrabold text-[16px] text-black">
            {month}
          </Text>
        </PressableScale>
        <PressableScale
          testID="schedule-next-week"
          accessibilityRole="button"
          accessibilityLabel={t('schedule.nextWeek')}
          onPress={() => props.onWeek(shiftDay(first, 7))}
          className="h-[44px] w-[44px] items-center justify-center rounded-full border border-line"
        >
          <Text className="font-nunito-extrabold text-[22px] text-mint">
            {t('schedule.next')}
          </Text>
        </PressableScale>
      </View>
      <ScrollView
        ref={strip}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="pb-[10px]"
        className="border-b border-line"
      >
        {groups.map(({ day, index, sessions }) => (
          <PressableScale
            key={day}
            testID={`schedule-day-${day}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === day }}
            accessibilityLabel={t('schedule.dayLabel', {
              day: displayDay(day),
              count: sessions.length,
              today: day === props.today ? t('schedule.today') : '',
            })}
            onPress={() => choose(day)}
            style={dayStyle}
            className="min-h-[84px] items-center justify-center gap-[4px]"
          >
            <Text className="font-nunito-bold text-[11px] text-muted">
              {t(`schedule.days.${index}`)}
            </Text>
            <View
              className={
                selected === day
                  ? 'h-[38px] w-[38px] items-center justify-center rounded-full bg-forest'
                  : 'h-[38px] w-[38px] items-center justify-center rounded-full'
              }
            >
              <Text
                className={
                  selected === day
                    ? 'font-nunito-extrabold text-[16px] text-canvas'
                    : 'font-nunito-extrabold text-[16px] text-black'
                }
              >
                {Number(day.slice(-2))}
              </Text>
            </View>
            <View
              accessible={false}
              className={
                sessions.length
                  ? sessions.some((s) => s.sessionStatus === 'CANCELLED')
                    ? 'h-[5px] w-[5px] rounded-full bg-coral'
                    : 'h-[5px] w-[5px] rounded-full bg-mint'
                  : 'h-[5px] w-[5px]'
              }
            />
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
  return (
    <LearningLayout
      title={t('schedule.title')}
      prefix="schedule"
      showTitle={false}
      tintedStatusBar
      header={calendarHeader}
      contentClassName="gap-[0px] px-[0px] pb-[20px]"
      tab="schedule"
      onTab={props.onTab}
      refreshing={props.refreshing ?? false}
      onRefresh={props.onRefresh}
      scrollRef={content}
    >
      {selected && !groups.find((g) => g.day === selected)?.sessions.length && (
        <Text
          testID="schedule-empty-day"
          accessibilityLiveRegion="polite"
          className="p-[16px] font-nunito text-[14px] text-muted"
        >
          {t('schedule.noSessionsOnDay', { day: displayDay(selected) })}
        </Text>
      )}
      <LearningState
        region={props.sessions}
        prefix="schedule"
        empty={!items.length}
      >
        {groups
          .filter((g) => g.sessions.length)
          .map(({ day, index, sessions }, groupIndex) => (
            <View
              key={day}
              onLayout={(event) => {
                positions.current[day] = event.nativeEvent.layout.y;
              }}
              className="flex-row"
            >
              <View
                className={
                  groupIndex % 2
                    ? compact
                      ? 'w-[56px] items-center gap-[4px] bg-peach px-[4px] pt-[16px]'
                      : 'w-[72px] items-center gap-[4px] bg-peach px-[4px] pt-[16px]'
                    : compact
                      ? 'w-[56px] items-center gap-[4px] bg-soft px-[4px] pt-[16px]'
                      : 'w-[72px] items-center gap-[4px] bg-soft px-[4px] pt-[16px]'
                }
              >
                <Text
                  accessibilityRole="header"
                  accessibilityLabel={displayDay(day)}
                  className={
                    compact
                      ? 'text-center font-nunito-extrabold text-[17px] text-black'
                      : 'text-center font-nunito-extrabold text-[21px] text-black'
                  }
                >
                  {day.slice(-2)}
                  {compact ? '\n/' : '/'}
                  {day.slice(5, 7)}
                </Text>
                <Text className="text-center font-nunito text-[12px] text-black">
                  {t(`schedule.weekdays.${index}`)}
                </Text>
              </View>
              <View className="min-w-[0px] flex-1 pl-[10px] pr-[16px]">
                {sessions.map((session) => (
                  <View
                    key={session.sessionId}
                    testID={`schedule-session-${session.sessionId}`}
                    accessible
                    accessibilityLabel={label(session)}
                    className="min-h-[64px] border-b border-line py-[14px]"
                  >
                    <View
                      className={
                        session.sessionStatus === 'CANCELLED'
                          ? 'border-l-4 border-coral pl-[10px]'
                          : 'border-l-4 border-mint pl-[10px]'
                      }
                    >
                      <View
                        className={
                          compact
                            ? 'gap-[8px]'
                            : 'flex-row items-start gap-[10px]'
                        }
                      >
                        <View
                          className={
                            compact
                              ? 'flex-row flex-wrap items-center gap-[6px]'
                              : 'w-[44px] items-center gap-[6px]'
                          }
                        >
                          <View
                            className={
                              session.sessionStatus === 'CANCELLED'
                                ? 'rounded-[9px] bg-peach px-[5px] py-[3px]'
                                : 'rounded-[9px] bg-line px-[5px] py-[3px]'
                            }
                          >
                            <Text className="text-center font-nunito-bold text-[10px] text-muted">
                              {t('classDetail.sessionNumber', {
                                number: session.sessionNumber,
                              })}
                            </Text>
                          </View>
                          <Text className="font-nunito-bold text-[12px] text-muted">
                            {displayTime(session.startsAt, props.timeZone)}
                          </Text>
                          <Text className="font-nunito text-[11px] text-muted">
                            {t('schedule.timeSeparator')}
                          </Text>
                          <Text className="font-nunito-bold text-[12px] text-muted">
                            {displayTime(session.endsAt, props.timeZone)}
                          </Text>
                        </View>
                        <View
                          className={
                            compact
                              ? 'min-w-[0px] gap-[6px]'
                              : 'min-w-[0px] flex-1 gap-[6px]'
                          }
                        >
                          <View className="gap-[2px] rounded-[14px] bg-soft px-[12px] py-[8px]">
                            <Text className="font-nunito text-[10px] text-muted">
                              {t('schedule.classCode')}
                            </Text>
                            <Text className="font-nunito-extrabold text-[14px] text-black">
                              {session.classCode}
                            </Text>
                          </View>
                          <Text className="font-nunito-bold text-[14px] text-black">
                            {session.sessionTitle}
                          </Text>
                          <View className="gap-[2px]">
                            <Text className="font-nunito text-[11.5px] text-muted">
                              {t('schedule.room', {
                                room:
                                  session.deliveryMode === 'ONLINE'
                                    ? ''
                                    : (session.roomName ??
                                      t('classDetail.noRoom')),
                              })}
                            </Text>
                            <Text className="font-nunito text-[11.5px] text-muted">
                              {t('schedule.mentor', {
                                name:
                                  session.mentor?.displayName ??
                                  t('classDetail.noMentor'),
                              })}
                            </Text>
                            {localDay(session.endsAt, props.timeZone) !==
                              day && (
                              <Text className="font-nunito text-[11.5px] text-muted">
                                {displayInstant(
                                  session.endsAt,
                                  props.timeZone,
                                  i18n.language
                                )}
                              </Text>
                            )}
                          </View>
                          <View className="flex-row flex-wrap gap-[6px] pt-[2px]">
                            <View
                              className={
                                session.sessionStatus === 'CANCELLED'
                                  ? 'rounded-full bg-peach px-[9px] py-[4px]'
                                  : 'rounded-full bg-line px-[9px] py-[4px]'
                              }
                            >
                              <Text
                                className={
                                  session.sessionStatus === 'CANCELLED'
                                    ? 'font-nunito-bold text-[10px] text-headsup'
                                    : 'font-nunito-bold text-[10px] text-muted'
                                }
                              >
                                {t(
                                  `learning.sessionStatus.${session.sessionStatus}`
                                )}
                              </Text>
                            </View>
                            <View
                              className={
                                session.deliveryMode === 'ONLINE'
                                  ? 'rounded-full border border-line px-[9px] py-[4px]'
                                  : 'rounded-full border border-coral px-[9px] py-[4px]'
                              }
                            >
                              <Text
                                className={
                                  session.deliveryMode === 'ONLINE'
                                    ? 'font-nunito-bold text-[10px] text-mint'
                                    : 'font-nunito-bold text-[10px] text-headsup'
                                }
                              >
                                {t(`schedule.delivery.${session.deliveryMode}`)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
      </LearningState>
    </LearningLayout>
  );
}
