import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import routes from '@/navigation/routes';
import type { NavigationProp } from '@/navigation/types';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/common/PressableScale';
import { ScreenState } from '@/components/common/ScreenState';
import { scopeKey, useStudentScope } from '@/shared/hooks/useStudentScope';
import {
  privateQueryOptions,
  useCancelInactive,
} from '@/modules/my-classes/hooks/useLearningQuery';
import { displayInstant } from '@/modules/schedule/calendar';
import { assignmentsService, type Assignment } from './assignments.service';

type AssignmentTab = Assignment['type'];
// Code and Quiz are always offered; ZIP appears only when the session has one.
const baseTabs: AssignmentTab[] = ['CODE', 'QUIZ'];

export function SessionAssignments({
  classId,
  sessionId,
  timeZone,
}: {
  classId: string;
  sessionId: string;
  timeZone: string;
}) {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const scope = useStudentScope();
  const active = useIsFocused();
  const enabled = scope.enabled && active;
  const key = ['student-assignments', ...scopeKey(scope), classId, sessionId];
  const query = useInfiniteQuery({
    queryKey: key,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      assignmentsService.list(classId, sessionId, pageParam, signal),
    getNextPageParam: (last, pages) =>
      pages.reduce((count, page) => count + page.items.length, 0) < last.total
        ? last.page + 1
        : undefined,
    enabled,
    ...privateQueryOptions,
  });
  useCancelInactive(enabled, key);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [chosenTab, setChosenTab] = useState<AssignmentTab | null>(null);
  if (!scope.enabled)
    return (
      <ScreenState
        title={t('assignments.title')}
        description={t('home.authRequired')}
      />
    );
  if (query.isPending || !active)
    return (
      <View className="items-center gap-[10px] py-[32px]">
        <ActivityIndicator />
        <Text
          accessibilityLiveRegion="polite"
          className="font-nunito text-[14px] text-muted"
        >
          {t('assignments.loading')}
        </Text>
      </View>
    );
  if (query.isError && !query.isFetchNextPageError)
    return (
      <ScreenState
        title={t('assignments.error')}
        description={t('assignments.errorDescription')}
        onRetry={() => {
          query.refetch().catch(() => {});
        }}
      />
    );
  const items = [
    ...new Map(
      query.data?.pages
        .flatMap((page) => page.items)
        .map((item) => [item.id, item]) ?? []
    ).values(),
  ];
  if (!items.length)
    return (
      <ScreenState
        title={t('assignments.empty')}
        description={t('assignments.emptyDescription')}
      />
    );
  const tabs = items.some((item) => item.type === 'ZIP')
    ? [...baseTabs, 'ZIP' as const]
    : baseTabs;
  const counts = (type: AssignmentTab) =>
    items.filter((item) => item.type === type).length;
  const tab = chosenTab ?? tabs.find((type) => counts(type) > 0) ?? baseTabs[0];
  const visible = items.filter((item) => item.type === tab);
  return (
    <View
      testID="session-assignments"
      className="gap-[14px]"
    >
      <Text
        accessibilityRole="header"
        className="font-nunito-extrabold text-[17px] text-black"
      >
        {t('assignments.count', {
          count: query.data?.pages[0]?.total ?? items.length,
        })}
      </Text>
      <View
        accessibilityRole="tablist"
        className="flex-row gap-[4px] rounded-full bg-soft p-[4px]"
      >
        {tabs.map((type) => {
          const selected = type === tab;
          return (
            <PressableScale
              key={type}
              testID={`assignment-tab-${type}`}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => {
                setChosenTab(type);
                setExpanded(null);
              }}
              className={
                selected
                  ? 'min-h-[40px] flex-1 flex-row items-center justify-center gap-[6px] rounded-full bg-forest px-[12px]'
                  : 'min-h-[40px] flex-1 flex-row items-center justify-center gap-[6px] rounded-full px-[12px]'
              }
            >
              <Text
                maxFontSizeMultiplier={1.3}
                className={
                  selected
                    ? 'font-nunito-extrabold text-[14px] text-primary-foreground'
                    : 'font-nunito-bold text-[14px] text-forest'
                }
              >
                {t(`assignments.tab.${type}`)}
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                className={
                  selected
                    ? 'font-nunito-bold text-[12px] text-primary-foreground'
                    : 'font-nunito-bold text-[12px] text-muted'
                }
              >
                {counts(type)}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      {!visible.length && (
        <View
          testID="assignment-tab-empty"
          className="items-center gap-[6px] rounded-[20px] bg-soft px-[16px] py-[28px]"
        >
          <Text className="font-nunito-bold text-[15px] text-black">
            {t('assignments.tabEmpty', {
              type: t(`assignments.tab.${tab}`),
            })}
          </Text>
          {query.hasNextPage && (
            <Text className="text-center font-nunito text-[13px] text-muted">
              {t('assignments.tabEmptyMore')}
            </Text>
          )}
        </View>
      )}
      {visible.map((item) => {
        const open = expanded === item.id;
        return (
          <View
            key={item.id}
            className="gap-[12px] rounded-[20px] border border-line bg-soft p-[16px]"
          >
            <View className="flex-row flex-wrap gap-[8px]">
              <Text className="rounded-full bg-cover-a-soft px-[10px] py-[5px] font-nunito-bold text-[11px] text-forest">
                {t(`assignments.type.${item.type}`)}
              </Text>
              <Text className="rounded-full bg-canvas px-[10px] py-[5px] font-nunito-bold text-[11px] text-muted">
                {t(`assignments.purpose.${item.purpose}`)}
              </Text>
            </View>
            <Text
              accessibilityRole="header"
              className="font-nunito-extrabold text-[16px] leading-[23px] text-black"
            >
              {item.title}
            </Text>
            <Text className="font-nunito text-[13px] leading-[21px] text-muted">
              {item.dueAt
                ? t('assignments.dueAt', {
                    date: displayInstant(item.dueAt, timeZone, i18n.language),
                  })
                : t('assignments.noDeadline')}
            </Text>
            <Text className="font-nunito-semibold text-[13px] text-forest">
              {t('assignments.score', { score: item.maxScore })}
              {item.timeLimitMinutes
                ? ` · ${t('assignments.minutes', { count: item.timeLimitMinutes })}`
                : ''}
            </Text>
            <PressableScale
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => setExpanded(open ? null : item.id)}
              className="min-h-[44px] justify-center"
            >
              <Text className="font-nunito-bold text-[14px] text-forest">
                {t(
                  open
                    ? 'assignments.hideInstructions'
                    : 'assignments.instructions'
                )}
              </Text>
            </PressableScale>
            {open && (
              <View className="gap-[8px]">
                <Text
                  selectable
                  className="font-nunito text-[14px] leading-[24px] text-black"
                >
                  {item.description || t('assignments.noInstructions')}
                </Text>
                <Text className="font-nunito text-[13px] text-muted">
                  {t('assignments.attempts', { count: item.maxAttempts })}
                </Text>
              </View>
            )}
            <Button
              label={t('assignments.doAssignment')}
              variant="solid"
              testID={`assignment-open-${item.id}`}
              disabled={!enabled}
              onPress={() =>
                navigation.navigate(routes.studentAssignment, {
                  assignmentId: item.id,
                })
              }
            />
          </View>
        );
      })}
      {query.isFetchNextPageError && (
        <Text
          accessibilityRole="alert"
          className="font-nunito text-[13px] text-headsup"
        >
          {t('assignments.moreError')}
        </Text>
      )}
      {query.hasNextPage && (
        <Button
          label={t(
            query.isFetchNextPageError ? 'common.retry' : 'assignments.loadMore'
          )}
          variant="outline"
          loading={query.isFetchingNextPage}
          onPress={() => {
            if (!query.isFetching) query.fetchNextPage().catch(() => {});
          }}
        />
      )}
    </View>
  );
}
