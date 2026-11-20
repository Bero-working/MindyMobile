import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/common/Icon';
import { ScreenState } from '@/components/common/ScreenState';
import { PressableScale } from '@/components/common/PressableScale';
import { SubPageHeader } from '@/components/common/SubPageHeader';
import { cn } from '@/shared/utilities/cn';
import {
  LearningLayout,
  LearningState,
} from '../my-classes/components/LearningLayout';
import type { DataRegion } from '../home/types/home.type';
import type { Enrollment } from '../my-classes/types';
import type {
  AttendanceItem,
  AttendancePeriod,
  AttendanceSummary,
} from './attendance.service';

type Paging = {
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreError: boolean;
  onLoadMore: () => void;
  refreshing: boolean;
  onRefresh: () => void;
};

function More({ hasMore, loadingMore, loadMoreError, onLoadMore }: Paging) {
  const { t } = useTranslation();
  return (
    <>
      {loadMoreError && (
        <Text
          accessibilityRole="alert"
          className="font-nunito text-[14px] text-headsup"
        >
          {t('attendance.loadMoreError')}
        </Text>
      )}
      {hasMore && (
        <Button
          testID="attendance-load-more"
          variant="outline"
          loading={loadingMore}
          label={t('attendance.loadMore')}
          onPress={onLoadMore}
        />
      )}
    </>
  );
}

export function AttendanceClassesScreen({
  classes,
  onOpen,
  onBack,
  onExplore,
  ...paging
}: Paging & {
  classes: DataRegion<Enrollment[]>;
  onOpen: (item: Enrollment) => void;
  onBack: () => void;
  onExplore: () => void;
}) {
  const { t } = useTranslation();
  return (
    <LearningLayout
      title={t('attendance.title')}
      prefix="attendance-classes"
      showTitle={false}
      onBack={onBack}
      refreshing={paging.refreshing}
      onRefresh={paging.onRefresh}
      header={
        <SubPageHeader
          title={t('attendance.title')}
          prefix="attendance-classes"
          onBack={onBack}
        />
      }
    >
      <Text className="font-nunito-bold text-[16px] leading-[22px] text-black">
        {t('attendance.chooseClass')}
      </Text>
      <LearningState
        region={classes}
        prefix="attendance"
        empty={false}
      >
        {classes.data?.length === 0 && (
          <View className="gap-[12px]">
            <ScreenState
              testID="attendance-classes-empty"
              title={t('attendance.noClasses')}
              description={t('attendance.noClassesDescription')}
            />
            <Button
              label={t('attendance.explore')}
              onPress={onExplore}
            />
          </View>
        )}
        {classes.data?.map((item) => (
          <View
            key={item.classId}
            className="gap-[8px] rounded-[18px] bg-canvas p-[14px] shadow-md shadow-forest/10"
          >
            <View className="flex-row flex-wrap gap-[6px]">
              <View className="rounded-full bg-soft px-[10px] py-[4px]">
                <Text className="font-nunito-bold text-[11.5px] text-forest">
                  {item.classCode}
                </Text>
              </View>
              {item.enrollmentStatus && (
                <View className="rounded-full bg-soft px-[10px] py-[4px]">
                  <Text className="font-nunito-bold text-[11.5px] text-muted">
                    {t(`attendance.enrollment.${item.enrollmentStatus}`)}
                  </Text>
                </View>
              )}
            </View>
            <Text className="font-nunito-extrabold text-[16px] leading-[21px] text-black">
              {item.courseTitle}
            </Text>
            <Text className="font-nunito text-[13px] leading-[18px] text-muted">
              {item.className}
            </Text>
            {item.mentor && (
              <View className="flex-row items-center gap-[6px]">
                <Icon
                  name="user"
                  size={14}
                />
                <Text className="flex-1 font-nunito text-[12.5px] text-muted">
                  {t('attendance.mentor', { name: item.mentor.displayName })}
                </Text>
              </View>
            )}
            <PressableScale
              testID={`attendance-class-${item.classId}`}
              accessibilityRole="button"
              accessibilityLabel={t('attendance.openClass', {
                name: item.className,
              })}
              onPress={() => onOpen(item)}
              className="mt-[4px] h-[40px] items-center justify-center rounded-full bg-forest"
            >
              <Text className="font-nunito-bold text-[13px] text-canvas">
                {t('attendance.viewHistory')}
              </Text>
            </PressableScale>
          </View>
        ))}
        <More {...paging} />
      </LearningState>
    </LearningLayout>
  );
}

const RING = 84;
const RING_STROKE = 9;
function RateRing({ rate, label }: { rate: number | null; label: string }) {
  const radius = (RING - RING_STROKE) / 2;
  const length = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, rate ?? 0)) / 100;
  return (
    <View
      testID={rate === null ? undefined : 'attendance-rate-bar'}
      className="h-[84px] w-[84px] items-center justify-center"
    >
      <View
        pointerEvents="none"
        className="absolute inset-[0px]"
      >
        <Svg
          width={RING}
          height={RING}
        >
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={radius}
            stroke={colors.soft}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          {rate !== null && (
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={radius}
              stroke={colors.mint}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={`${length * progress} ${length}`}
              fill="none"
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          )}
        </Svg>
      </View>
      <Text className="font-nunito-extrabold text-[18px] text-forest">
        {label}
      </Text>
    </View>
  );
}

const mainCounts = [
  ['present', 'bg-status-green'],
  ['absent', 'bg-status-red'],
  ['unmarked', 'bg-status-yellow'],
] as const;

function Summary({ region }: { region: DataRegion<AttendanceSummary> }) {
  const { t, i18n } = useTranslation();
  const value = region.data;
  return (
    <LearningState
      region={region}
      prefix="attendance-summary"
      empty={false}
    >
      {value && (
        <View
          testID="attendance-summary"
          className="gap-[16px] rounded-[22px] border border-line bg-canvas p-[16px] shadow-md shadow-forest/10"
        >
          <View className="flex-row items-center gap-[16px]">
            <RateRing
              rate={value.rate}
              label={
                value.rate === null
                  ? '—'
                  : t('attendance.rateValue', {
                      value: new Intl.NumberFormat(
                        i18n.language === 'vi-VN' ? 'vi-VN' : 'en-GB',
                        { maximumFractionDigits: 1 }
                      ).format(value.rate),
                    })
              }
            />
            <View className="min-w-[0px] flex-1 gap-[4px]">
              <Text className="font-nunito-bold text-[12.5px] text-muted">
                {t('attendance.rate')}
              </Text>
              {value.rate === null && (
                <Text className="font-nunito-extrabold text-[17px] leading-[22px] text-black">
                  {t('attendance.noRate')}
                </Text>
              )}
              <Text className="font-nunito text-[12px] leading-[17px] text-muted">
                {t('attendance.rateExplanation', {
                  count: value.finalizedEligibleCount,
                })}
              </Text>
            </View>
          </View>
          <View className="flex-row rounded-[16px] bg-soft py-[10px]">
            {mainCounts.map(([key, dot], index) => (
              <View
                key={key}
                className={cn(
                  'flex-1 items-center gap-[2px]',
                  index > 0 && 'border-l border-line'
                )}
              >
                <Text
                  testID={`attendance-count-${key}`}
                  className="font-nunito-extrabold text-[20px] leading-[24px] text-black"
                >
                  {String(value[key])}
                </Text>
                <View className="flex-row items-center gap-[5px]">
                  <View className={cn('h-[7px] w-[7px] rounded-full', dot)} />
                  <Text
                    numberOfLines={1}
                    className="font-nunito-bold text-[11.5px] text-muted"
                  >
                    {t(`attendance.counts.${key}`)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <View className="flex-row flex-wrap gap-[8px]">
            {(['makeupPending', 'excluded'] as const).map((key) => (
              <View
                key={key}
                className="flex-row items-center gap-[6px] rounded-full border border-line px-[10px] py-[5px]"
              >
                <Text
                  testID={`attendance-count-${key}`}
                  className="font-nunito-extrabold text-[12.5px] text-forest"
                >
                  {String(value[key])}
                </Text>
                <Text className="font-nunito text-[12px] text-muted">
                  {t(`attendance.counts.${key}`)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </LearningState>
  );
}

const defaultTone = ['bg-soft', 'text-muted'] as const;
const statusTone: Partial<Record<string, readonly [string, string]>> = {
  PRESENT: ['bg-mint/15', 'text-mint'],
  ABSENT: ['bg-headsup/10', 'text-headsup'],
  UNMARKED: ['bg-sunshine/50', 'text-ember'],
  CANCELLED: ['bg-soft', 'text-ink-gray'],
};

export function attendanceStatusKey(item: AttendanceItem) {
  if (item.sessionStatus === 'CANCELLED') return 'CANCELLED' as const;
  if (item.attendanceStatus === 'PRESENT' || item.attendanceStatus === 'ABSENT')
    return item.attendanceStatus;
  if (item.attendanceApplicability !== 'ELIGIBLE')
    return item.attendanceApplicability;
  return 'UNMARKED' as const;
}

function Session({
  item,
  timeZone,
  last,
}: {
  item: AttendanceItem;
  timeZone: string;
  last: boolean;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'vi-VN' ? 'vi-VN' : 'en-GB';
  const start = new Date(item.startsAt);
  const date = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(start);
  const day = new Intl.DateTimeFormat(locale, {
    timeZone,
    day: '2-digit',
  }).format(start);
  const month = new Intl.DateTimeFormat(locale, {
    timeZone,
    month: 'short',
  }).format(start);
  const weekday = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
  }).format(start);
  const time = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(value));
  const status = attendanceStatusKey(item);
  const tone = statusTone[status] ?? defaultTone;
  const note =
    item.attendanceApplicability === 'MAKEUP_PENDING' ||
    item.attendanceApplicability === 'MAKEUP_CREDITED'
      ? t(`attendance.applicability.${item.attendanceApplicability}`)
      : null;
  return (
    <View
      testID={`attendance-session-${item.sessionId}-${item.enrollmentId}`}
      className="flex-row gap-[12px]"
    >
      <View className="w-[48px] items-center">
        <View
          testID={`attendance-session-date-${item.sessionId}-${item.enrollmentId}`}
          accessible
          accessibilityLabel={date}
          className="w-[48px] items-center rounded-[14px] bg-soft py-[8px]"
        >
          <Text className="font-nunito-bold text-[10.5px] uppercase text-muted">
            {weekday}
          </Text>
          <Text className="font-nunito-extrabold text-[19px] leading-[23px] text-forest">
            {day}
          </Text>
          <Text className="font-nunito-bold text-[10.5px] text-muted">
            {month}
          </Text>
        </View>
        {!last && (
          <View className="mt-[6px] w-[2px] flex-1 rounded-full bg-line" />
        )}
      </View>
      <View className="mb-[14px] min-w-[0px] flex-1 gap-[8px] rounded-[18px] border border-line bg-canvas p-[14px]">
        <View className="flex-row items-start gap-[8px]">
          <Text className="min-w-[0px] flex-1 font-nunito-extrabold text-[15px] leading-[20px] text-black">
            {item.title}
          </Text>
          <View className={cn('rounded-full px-[9px] py-[3px]', tone[0])}>
            <Text className={cn('font-nunito-bold text-[11px]', tone[1])}>
              {t(`attendance.status.${status}`)}
            </Text>
          </View>
        </View>
        <View className="flex-row flex-wrap items-center gap-x-[12px] gap-y-[4px]">
          <View className="flex-row items-center gap-[5px]">
            <Icon
              name="clock"
              size={13}
            />
            <Text className="font-nunito-bold text-[12.5px] text-forest">
              {t('attendance.timeRange', {
                from: time(item.startsAt),
                to: time(item.endsAt),
              })}
            </Text>
          </View>
          {item.effectiveMentor?.displayName && (
            <View className="min-w-[0px] shrink flex-row items-center gap-[5px]">
              <Icon
                name="user"
                size={13}
              />
              <Text
                numberOfLines={1}
                className="shrink font-nunito text-[12.5px] text-muted"
              >
                {t(
                  item.assignmentType === 'SUBSTITUTE'
                    ? 'attendance.substitute'
                    : 'attendance.mentor',
                  { name: item.effectiveMentor.displayName }
                )}
              </Text>
            </View>
          )}
        </View>
        {(item.makeupForSessionId ||
          item.makeupRootSessionId ||
          note ||
          item.creditedAttendanceStatus ||
          item.excluded) && (
          <View className="gap-[4px] border-t border-line pt-[8px]">
            {(item.makeupForSessionId || item.makeupRootSessionId) && (
              <Text className="font-nunito-bold text-[12px] text-forest">
                {t('attendance.makeupSession')}
              </Text>
            )}
            {note && (
              <Text className="font-nunito text-[12.5px] text-muted">
                {note}
              </Text>
            )}
            {item.creditedAttendanceStatus ? (
              <Text className="font-nunito-bold text-[12.5px] text-forest">
                {t('attendance.credit', {
                  status: t(
                    `attendance.status.${item.creditedAttendanceStatus}`
                  ),
                })}
              </Text>
            ) : (
              item.excluded && (
                <Text className="font-nunito text-[12px] leading-[17px] text-muted">
                  {t('attendance.excludedNote')}
                </Text>
              )
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// NativeWind shadow utilities introduce CSS variables when a segment becomes
// selected. Keep the shadow native so switching periods doesn't upgrade/remount
// a Pressable and invoke NativeWind's navigation-context warning serializer.
const periodStyles = StyleSheet.create({
  selected: {
    backgroundColor: colors.canvas,
    elevation: 1,
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
});

export function AttendanceHistoryScreen({
  className,
  courseTitle,
  history,
  summary,
  timeZone,
  period,
  onPeriod,
  onBack,
  ...paging
}: Paging & {
  className: string;
  courseTitle: string;
  history: DataRegion<AttendanceItem[]>;
  summary: DataRegion<AttendanceSummary>;
  timeZone: string;
  period: AttendancePeriod;
  onPeriod: (period: AttendancePeriod) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  return (
    <LearningLayout
      title={t('attendance.title')}
      prefix="attendance-history"
      showTitle={false}
      onBack={onBack}
      refreshing={paging.refreshing}
      onRefresh={paging.onRefresh}
      header={
        <SubPageHeader
          title={t('attendance.title')}
          prefix="attendance-history"
          onBack={onBack}
        />
      }
    >
      <View className="gap-[4px]">
        <Text className="font-nunito-extrabold text-[18px] leading-[24px] text-black">
          {courseTitle}
        </Text>
        <Text className="font-nunito text-[13px] leading-[18px] text-muted">
          {className}
        </Text>
      </View>
      <View className="flex-row rounded-full bg-soft p-[4px]">
        {(['ALL', '30', '90'] as const).map((key) => (
          <View
            key={key}
            className="flex-1"
          >
            <PressableScale
              testID={`attendance-period-${key}`}
              accessibilityRole="button"
              accessibilityLabel={t(`attendance.period.${key}`)}
              accessibilityState={{ selected: key === period }}
              onPress={() => onPeriod(key)}
              className="min-h-[40px] items-center justify-center rounded-full px-[8px]"
              style={key === period ? periodStyles.selected : undefined}
            >
              <Text
                numberOfLines={1}
                className={cn(
                  'font-nunito-bold text-[13px]',
                  key === period ? 'text-forest' : 'text-muted'
                )}
              >
                {t(`attendance.period.${key}`)}
              </Text>
            </PressableScale>
          </View>
        ))}
      </View>
      <Summary region={summary} />
      <Text
        accessibilityRole="header"
        className="mt-[4px] font-nunito-extrabold text-[17px] text-black"
      >
        {t('attendance.sessions')}
      </Text>
      <LearningState
        region={history}
        prefix="attendance"
        empty={false}
      >
        {history.data?.length === 0 && (
          <ScreenState
            testID="attendance-history-empty"
            title={t('attendance.noHistory')}
            description={t('attendance.noHistoryDescription')}
          />
        )}
        <View>
          {history.data?.map((item, index, list) => (
            <Session
              key={`${item.sessionId}:${item.enrollmentId}`}
              item={item}
              timeZone={timeZone}
              last={index === list.length - 1}
            />
          ))}
        </View>
        <More {...paging} />
      </LearningState>
    </LearningLayout>
  );
}
