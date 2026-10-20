import { Icon } from '@/components/common/Icon';
import { useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BrandBar } from '@/components/common/BrandBar';
import { AppTabBar } from '@/components/common/AppTabBar';
import { CourseTile } from '@/components/common/CourseTile';
import { PressableScale } from '@/components/common/PressableScale';
import { ScreenState } from '@/components/common/ScreenState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors } from '@/theme/colors';
import { Recommendations } from './components/Recommendations';
import type { CatalogProps } from './types/courses.type';

export function CoursesScreen(props: CatalogProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [categoryY, setCategoryY] = useState(0);
  const layout = useMemo(
    () => ({
      top: { paddingTop: insets.top },
      tabs: { bottom: Math.max(insets.bottom - 12, 0) },
      content: { paddingBottom: 100 + insets.bottom },
    }),
    [insets.top, insets.bottom]
  );
  const pages = Math.ceil(props.total / 6);
  const pageItems = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => pages <= 5 || n === 1 || n === pages || Math.abs(n - props.page) <= 1
  );
  const goto = (n: number) => {
    props.onPage(n);
    scroll.current?.scrollTo({ y: categoryY, animated: false });
  };
  return (
    <View
      testID="courses-screen"
      className="flex-1 bg-canvas"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.mint}
      />
      <View
        testID="courses-header"
        style={layout.top}
        className="bg-mint pb-[8px] shadow-lg shadow-forest-deep/20"
      >
        <BrandBar
          prefix="courses"
          onTop={props.onHome}
          onCart={props.onCart}
          cartCount={props.cartCount}
        />
      </View>
      <ScrollView
        ref={scroll}
        contentContainerStyle={layout.content}
        refreshControl={
          <RefreshControl
            refreshing={props.refreshing ?? false}
            onRefresh={props.onRefresh}
            colors={[colors.mint]}
            tintColor={colors.mint}
          />
        }
      >
        <View className="gap-[22px] pt-[20px]">
          {props.recommendations.status === 'loading' ? (
            <Skeleton className="mx-[16px] h-[206px] rounded-[24px]" />
          ) : props.recommendations.status === 'error' ? (
            <ScreenState
              title={t('home.errorTitle')}
              description={t('errors.generic')}
              onRetry={props.recommendations.onRetry}
              retryTestID="courses-recommend-retry"
            />
          ) : (
            <Recommendations
              courses={props.recommendations.data ?? []}
              onOpen={props.onOpenCourse}
            />
          )}
          <View
            testID="courses-categories"
            onLayout={(e) => setCategoryY(e.nativeEvent.layout.y)}
          >
            <View className="mx-[16px] flex-row items-center justify-between">
              <Text className="font-nunito-extrabold text-[20px] text-black">
                {t('courses.categories.title')}
              </Text>
              <PressableScale
                testID="courses-filter-button"
                onPress={() => props.onPreviewFilter?.(props.deliveryMode)}
                accessibilityRole="button"
                accessibilityLabel={t('courses.filter.title')}
                hitSlop={2}
                className="h-[42px] w-[42px] items-center justify-center rounded-full border border-line"
              >
                <Icon
                  name="filter"
                  size={19}
                  color={colors.black}
                />
                {props.deliveryMode && (
                  <View
                    testID="courses-filter-dot"
                    className="absolute right-[7px] top-[6px] h-[9px] w-[9px] rounded-full border-2 border-canvas bg-coral"
                  />
                )}
              </PressableScale>
            </View>
            {props.categories.status === 'error' ? (
              <ScreenState
                title={t('courses.categories.title')}
                description={t('errors.generic')}
                onRetry={props.categories.onRetry}
                retryTestID="courses-categories-retry"
              />
            ) : props.categories.status === 'loading' ? (
              <View className="flex-row gap-[8px] p-[16px]">
                {[0, 1, 2, 3].map((n) => (
                  <Skeleton
                    key={n}
                    className="h-[38px] w-[76px] rounded-[12px]"
                  />
                ))}
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-[8px] px-[16px] pb-[2px] pt-[12px]"
              >
                {[
                  { id: 'all', name: t('courses.categories.all') },
                  ...(props.categories.data ?? []),
                ].map((c) => (
                  <PressableScale
                    key={c.id}
                    testID={'courses-category-' + c.id}
                    accessibilityRole="tab"
                    accessibilityState={{
                      selected: (props.categoryId ?? 'all') === c.id,
                    }}
                    hitSlop={3}
                    onPress={() =>
                      props.onCategory(c.id === 'all' ? null : c.id)
                    }
                    className={
                      (props.categoryId ?? 'all') === c.id
                        ? 'h-[38px] justify-center rounded-[12px] bg-forest px-[16px]'
                        : 'h-[38px] justify-center rounded-[12px] bg-soft px-[16px]'
                    }
                  >
                    <Text
                      className={
                        (props.categoryId ?? 'all') === c.id
                          ? 'font-nunito-extrabold text-[14px] text-canvas'
                          : 'font-nunito-extrabold text-[14px] text-forest'
                      }
                    >
                      {c.name}
                    </Text>
                  </PressableScale>
                ))}
              </ScrollView>
            )}
          </View>
          <View className="px-[16px]">
            {props.courses.status === 'loading' ? (
              <View
                testID="courses-loading"
                accessible
                accessibilityLabel={t('common.loading')}
                className="-mx-[6px] flex-row flex-wrap"
              >
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <View
                    key={n}
                    className="mb-[12px] w-1/2 px-[6px]"
                  >
                    <Skeleton className="aspect-[3/4] h-auto w-full rounded-[20px]" />
                  </View>
                ))}
              </View>
            ) : props.courses.status === 'error' ? (
              <ScreenState
                testID="courses-error"
                title={t('home.errorTitle')}
                description={t('errors.generic')}
                onRetry={props.courses.onRetry}
                retryTestID="courses-retry"
              />
            ) : props.courses.data?.length ? (
              <View
                testID="courses-grid"
                className="-mx-[6px] flex-row flex-wrap"
              >
                {props.courses.data.slice(0, 6).map((course, index) => (
                  <CourseTile
                    key={course.id}
                    course={course}
                    index={index}
                    actions={{}}
                    onOpen={props.onOpenCourse}
                    prefix="courses"
                  />
                ))}
              </View>
            ) : (
              <View
                testID="courses-empty"
                className="rounded-[16px] bg-soft p-[24px]"
              >
                <Text className="text-center font-nunito-bold text-[14px] text-muted">
                  {t('courses.grid.empty')}
                </Text>
                {(props.categoryId || props.deliveryMode) && (
                  <PressableScale
                    onPress={() => {
                      props.onCategory(null);
                      props.onFilter({});
                    }}
                    accessibilityRole="button"
                    className="min-h-[44px] justify-center"
                  >
                    <Text className="text-center font-nunito-extrabold text-[14px] text-mint">
                      {t('courses.grid.clearFilter')}
                    </Text>
                  </PressableScale>
                )}
              </View>
            )}
          </View>
          {pages > 1 && (
            <View className="flex-row justify-center gap-[8px] px-[16px]">
              <Page
                label="‹"
                id="prev"
                disabled={props.page === 1}
                onPress={() => goto(props.page - 1)}
              />
              {pageItems.map((n, i) => (
                <View
                  key={n}
                  className="flex-row items-center gap-[8px]"
                >
                  {i > 0 && n > (pageItems[i - 1] ?? 0) + 1 && (
                    <Text className="text-forest">
                      {t('courses.pagination.ellipsis')}
                    </Text>
                  )}
                  <Page
                    label={String(n)}
                    id={String(n)}
                    selected={n === props.page}
                    onPress={() => goto(n)}
                  />
                </View>
              ))}
              <Page
                label="›"
                id="next"
                disabled={props.page === pages}
                onPress={() => goto(props.page + 1)}
              />
            </View>
          )}
        </View>
      </ScrollView>
      <View
        style={layout.tabs}
        className="absolute inset-x-[12px]"
      >
        <AppTabBar
          prefix="courses"
          selected="courses"
          onTop={props.onHome}
          onTab={() => {}}
        />
      </View>
    </View>
  );
}
function Page({
  label,
  id,
  disabled = false,
  selected = false,
  onPress,
}: {
  label: string;
  id: string;
  disabled?: boolean;
  selected?: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <PressableScale
      testID={'courses-page-' + id}
      accessibilityRole="button"
      accessibilityLabel={t(
        'courses.pagination.' +
          (id === 'prev' ? 'previous' : id === 'next' ? 'next' : 'page'),
        { page: label }
      )}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      hitSlop={2}
      onPress={onPress}
      className={
        selected
          ? 'h-[40px] w-[40px] items-center justify-center rounded-full bg-mint'
          : disabled
            ? 'h-[40px] w-[40px] items-center justify-center rounded-full border border-line opacity-40'
            : 'h-[40px] w-[40px] items-center justify-center rounded-full bg-soft'
      }
    >
      <Text
        className={
          selected
            ? 'font-nunito-extrabold text-[14px] text-canvas'
            : 'font-nunito-extrabold text-[14px] text-forest'
        }
      >
        {label}
      </Text>
    </PressableScale>
  );
}
