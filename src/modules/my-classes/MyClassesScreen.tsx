import { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import { colors } from '@/theme/colors';
import type { DataRegion, HomeTab } from '../home/types/home.type';
import { displayDay, displayInstant } from '../schedule/calendar';
import { LearningLayout, LearningState } from './components/LearningLayout';
import { enrollmentAction, groupEnrollments } from './access';
import type { Enrollment } from './types';

export type MyClassesProps = {
  enrollments: DataRegion<Enrollment[]>;
  view: 'current' | 'history';
  onView: (view: 'current' | 'history') => void;
  expanded: string[];
  onToggle: (courseId: string) => void;
  onOpen: (classId: string) => void;
  onResume: (orderId: string) => void;
  onBack: () => void;
  onExplore: () => void;
  onTab: (tab: HomeTab) => void;
  origin: 'home' | 'courses' | 'account';
  timeZone: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  loadMoreError?: boolean;
  onLoadMore?: (() => void) | undefined;
  refreshing?: boolean;
  onRefresh?: (() => void) | undefined;
};

function EnrollmentRow({
  row,
  props,
}: {
  row: Enrollment;
  props: MyClassesProps;
}) {
  const { t, i18n } = useTranslation();
  const action = enrollmentAction(row);
  const canOpen = action === 'FULL' || action === 'CASH_PREVIEW';
  const mismatch =
    (action === 'NONE' && row.accessMode !== 'NONE') ||
    ((row.accessReason === 'PENDING_CASH' ||
      row.accessReason === 'PENDING_PAYOS') &&
      !row.order);
  const description = `${t(`schedule.delivery.${row.deliveryMode}`)} · ${displayDay(row.startDate)} – ${displayDay(row.endDate)}`;
  const summary = (
    <View className="min-h-[52px] flex-row items-center gap-[8px] px-[10px] py-[8px]">
      <View className="min-w-[0px] flex-1 gap-[2px]">
        <Text className="font-nunito-semibold text-[14px] text-black">
          {row.classCode}
        </Text>
        <Text className="font-nunito text-[11.5px] leading-[16px] text-muted">
          {description}
        </Text>
      </View>
      {action === 'CASH_PREVIEW' && (
        <Text className="max-w-[72px] shrink text-right font-nunito text-[11px] text-muted">
          {t('myClasses.preview')}
        </Text>
      )}
      {canOpen && (
        <Text
          accessible={false}
          className="font-nunito-bold text-[17px] text-mint"
        >
          {t('schedule.next')}
        </Text>
      )}
    </View>
  );
  return (
    <View
      testID={`my-classes-enrollment-${row.enrollmentId}`}
      className="overflow-hidden rounded-[12px] bg-canvas"
    >
      {canOpen ? (
        <PressableScale
          testID={`my-classes-open-${row.enrollmentId}`}
          accessibilityRole="button"
          accessibilityLabel={[
            row.classCode,
            row.className,
            description,
            row.mentor?.displayName,
            t(`myClasses.access.${row.accessReason}`),
          ]
            .filter(Boolean)
            .join(', ')}
          onPress={() => props.onOpen(row.classId)}
        >
          {summary}
        </PressableScale>
      ) : (
        summary
      )}
      {(!canOpen || row.order?.requiresReview || action === 'CASH_PREVIEW') && (
        <View className="gap-[6px] px-[10px] pb-[10px]">
          {!canOpen && (
            <Text className="font-nunito text-[11.5px] text-muted">
              {t(
                `myClasses.access.${mismatch ? 'STATE_MISMATCH' : row.accessReason}`
              )}
            </Text>
          )}
          {row.order?.requiresReview && (
            <Text className="font-nunito-semibold text-[11.5px] text-headsup">
              {t('myClasses.review')}
            </Text>
          )}
          {row.order?.expiresAt && (
            <Text className="font-nunito text-[11px] text-muted">
              {t('myClasses.expires', {
                date: displayInstant(
                  row.order.expiresAt,
                  props.timeZone,
                  i18n.language
                ),
              })}
            </Text>
          )}
          {action === 'PAYMENT' && row.order && (
            <Button
              testID={`my-classes-resume-${row.enrollmentId}`}
              variant="action"
              className="min-h-[44px] px-[12px] py-[8px]"
              label={t('myClasses.resume')}
              onPress={() => {
                if (row.order) props.onResume(row.order.orderId);
              }}
            />
          )}
          {mismatch && (
            <Button
              variant="outline"
              className="min-h-[44px] px-[12px] py-[8px]"
              label={t('common.retry')}
              onPress={props.onRefresh}
              disabled={!props.onRefresh}
            />
          )}
        </View>
      )}
    </View>
  );
}

export function MyClassesScreen(props: MyClassesProps) {
  const { t } = useTranslation();
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [props.view]);
  const groups = groupEnrollments(props.enrollments.data ?? []);
  const destination = props.view === 'current' ? 'history' : 'current';
  const header = (
    <View className="flex-row items-center gap-[8px] px-[16px] pb-[14px] pt-[10px]">
      <PressableScale
        testID="my-classes-back"
        accessibilityRole="button"
        accessibilityLabel={t('learning.back')}
        onPress={props.onBack}
        className="h-[44px] w-[44px] items-center justify-center rounded-full border border-line"
      >
        <Icon
          name="back"
          size={18}
        />
      </PressableScale>
      <Text
        accessibilityRole="header"
        className="flex-1 text-center font-nunito-extrabold text-[18px] leading-[24px] text-black"
      >
        {props.view === 'history'
          ? t('myClasses.historyTitle')
          : t('myClasses.title')}
      </Text>
      {props.view === 'history' ? (
        <PressableScale
          testID={`my-classes-view-${destination}`}
          accessibilityRole="button"
          accessibilityLabel={t(`myClasses.view.${destination}`)}
          accessibilityHint={t('myClasses.switchView')}
          onPress={() => props.onView(destination)}
          className="h-[44px] w-[44px] items-center justify-center rounded-full"
        >
          <Icon
            name="book"
            size={18}
          />
        </PressableScale>
      ) : (
        <View className="w-[44px]" />
      )}
    </View>
  );
  return (
    <LearningLayout
      prefix="my-classes"
      title={t('myClasses.title')}
      onBack={props.onBack}
      showTitle={false}
      header={header}
      tab={props.origin}
      onTab={props.onTab}
      refreshing={props.refreshing ?? false}
      onRefresh={props.onRefresh}
      scrollRef={scroll}
    >
      <LearningState
        region={props.enrollments}
        prefix="my-classes"
        empty={!groups.length}
      >
        <View className="overflow-hidden rounded-[18px] bg-soft">
          {groups.map((group, index) => {
            const expanded = props.expanded.includes(group.courseId);
            return (
              <View
                key={group.courseId}
                className={
                  index < groups.length - 1 ? 'border-b border-line' : ''
                }
              >
                <PressableScale
                  testID={`my-classes-course-${group.courseId}`}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  onPress={() => props.onToggle(group.courseId)}
                  className="min-h-[64px] flex-row items-center gap-[12px] px-[14px] py-[12px]"
                >
                  <View
                    className={
                      expanded
                        ? 'h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-mint'
                        : 'h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-canvas'
                    }
                  >
                    <Icon
                      name={expanded ? 'folder-open' : 'folder'}
                      size={19}
                      color={expanded ? colors.canvas : colors.muted}
                    />
                  </View>
                  <View className="min-w-[0px] flex-1 gap-[3px]">
                    <Text className="font-nunito-bold text-[14.5px] text-black">
                      {group.title}
                    </Text>
                    <Text className="font-nunito text-[12px] text-muted">
                      {group.code}
                      {' · '}
                      {t(
                        props.hasMore ||
                          props.loadingMore ||
                          props.loadMoreError
                          ? 'myClasses.loaded'
                          : 'myClasses.count',
                        { count: group.items.length }
                      )}
                    </Text>
                  </View>
                  <Text
                    accessible={false}
                    className="font-nunito-semibold text-[16px] text-muted"
                  >
                    {expanded
                      ? t('myClasses.collapseSymbol')
                      : t('schedule.next')}
                  </Text>
                </PressableScale>
                {expanded && (
                  <View className="mb-[8px] ml-[30px] gap-[6px] border-l-2 border-line pl-[8px] pr-[10px]">
                    {group.items.map((row) => (
                      <EnrollmentRow
                        key={row.enrollmentId}
                        row={row}
                        props={props}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </LearningState>
      {!groups.length && (
        <>
          <Text className="font-nunito text-[14px] text-muted">
            {t(`myClasses.empty.${props.view}`)}
          </Text>
          <Button
            label={t('myClasses.explore')}
            onPress={props.onExplore}
          />
        </>
      )}
      {(props.hasMore || props.loadMoreError) && (
        <Button
          testID="my-classes-load-more"
          loading={props.loadingMore ?? false}
          variant="outline"
          label={t(props.loadMoreError ? 'common.retry' : 'myClasses.loadMore')}
          onPress={props.onLoadMore}
        />
      )}
      {props.loadMoreError && (
        <Text
          accessibilityRole="alert"
          className="font-nunito text-[14px] text-headsup"
        >
          {t('myClasses.moreError')}
        </Text>
      )}
    </LearningLayout>
  );
}
