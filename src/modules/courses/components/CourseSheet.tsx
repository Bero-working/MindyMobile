import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import { colors } from '@/theme/colors';
import { formatSchedule } from '../summarizeSchedule';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  ActivityIndicator,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppSheet } from '@/components/common/AppSheet';
import { CoverImage } from '@/components/common/CoverImage';
import { CourseCover } from '@/components/common/CourseCover';
import { ScreenState } from '@/components/common/ScreenState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatVnd, formatDateOnly } from '@/shared/utilities/formatVnd';
import type { Course, CourseClass } from '../types/courses.type';

export type CourseSheetProps = {
  course: Course;
  classes: CourseClass[];
  selectedClassId: string | null;
  onAddToCart: () => void;
  pendingClassId?: string | null | undefined;
  buying?: boolean;
  status?: 'loading' | 'error' | 'success';
  error?: string | null | undefined;
  toast?: string | null | undefined;
  onRetry?: (() => void) | undefined;
  onPick: (id: string) => void;
  onUnpick: (id: string) => void;
  onBuy: () => void;
  onClose: () => void;
};
export function CourseSheet({
  course,
  classes,
  selectedClassId,
  onAddToCart,
  pendingClassId,
  buying = false,
  status = 'success',
  error,
  toast,
  onRetry,
  onPick,
  onUnpick,
  onBuy,
  onClose,
}: CourseSheetProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [descriptionLines, setDescriptionLines] = useState(0);
  const { fontScale, width } = useWindowDimensions();
  const fullWidthStyle = useMemo(() => ({ width }), [width]);
  const heroStyle = useMemo(
    () => ({ width, height: (width * 5) / 8 + 22 }),
    [width]
  );
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const firstHeight = rowHeights[classes[0]?.id ?? ''];
  const secondHeight = rowHeights[classes[1]?.id ?? ''];
  const thirdHeight = rowHeights[classes[2]?.id ?? ''];
  const scrollClasses = classes.length > 2;
  const classViewportStyle = useMemo(
    () =>
      scrollClasses && firstHeight && secondHeight && thirdHeight
        ? {
            height: firstHeight + secondHeight + 20 + thirdHeight / 2,
            flexShrink: 1,
          }
        : undefined,
    [scrollClasses, firstHeight, secondHeight, thirdHeight]
  );
  const pending = !!pendingClassId || buying;
  const canSubmit = classes.some(
    (item) => item.id === selectedClassId && item.availableSeats > 0
  );
  return (
    <AppSheet
      onClose={onClose}
      locked={pending}
      scrollable={false}
    >
      <View
        testID="course-sheet"
        className="relative shrink"
      >
        {status === 'loading' ? (
          <View
            testID="course-sheet-loading"
            className="gap-[12px]"
          >
            <Skeleton className="aspect-video h-auto w-full rounded-[18px]" />
            <Skeleton className="h-[24px]" />
            <Skeleton className="h-[72px] rounded-[16px]" />
            <Skeleton className="h-[72px] rounded-[16px]" />
          </View>
        ) : status === 'error' ? (
          <ScreenState
            testID="course-sheet-error"
            title={t('home.errorTitle')}
            description={t('errors.generic')}
            onRetry={onRetry}
            retryTestID="course-sheet-retry"
          />
        ) : (
          <>
            <View
              testID="course-sheet-hero"
              style={heroStyle}
              className="relative -ml-[18px] overflow-hidden bg-soft"
            >
              <CoverImage
                uri={course.imgUrl}
                hideLabel
                label={course.title}
                fallback={<CourseCover index={0} />}
                className="absolute inset-[0px] aspect-auto h-full w-full rounded-[0px]"
              />
              <View
                className="absolute inset-[0px]"
                pointerEvents="none"
                accessible={false}
              >
                <Svg
                  width="100%"
                  height="100%"
                >
                  <Defs>
                    <LinearGradient
                      id="course-detail-shade"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <Stop
                        offset="0.2"
                        stopColor={colors.forestDeep}
                        stopOpacity={0}
                      />
                      <Stop
                        offset="0.7"
                        stopColor={colors.forestDeep}
                        stopOpacity={0.65}
                      />
                      <Stop
                        offset="1"
                        stopColor={colors.forestDeep}
                        stopOpacity={0.98}
                      />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    width="100%"
                    height="100%"
                    fill="url(#course-detail-shade)"
                  />
                </Svg>
              </View>
              <View className="absolute inset-x-[0px] bottom-[0px] px-[18px] pb-[40px] pt-[12px]">
                <Text className="font-nunito-extrabold text-[12px] tracking-[0.5px] text-sunshine">
                  {course.code + ' · ' + course.category.name}
                </Text>
                <Text
                  testID="course-sheet-title"
                  accessibilityRole="header"
                  numberOfLines={fontScale > 1.2 ? 3 : 2}
                  className="mt-[4px] font-nunito-extrabold text-[22px] leading-[27px] tracking-[-0.44px] text-canvas"
                >
                  {course.title}
                </Text>
              </View>
            </View>
            <View
              testID="course-sheet-body"
              style={fullWidthStyle}
              className="-ml-[18px] -mt-[22px] shrink rounded-t-[22px] bg-canvas px-[18px] pt-[22px]"
            >
              {course.description && (
                <View className="relative mb-[14px] shrink-0 overflow-hidden">
                  <View
                    pointerEvents="none"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    className="absolute inset-x-[0px] top-[0px] opacity-0"
                  >
                    <Text
                      testID="course-sheet-description-measure"
                      onTextLayout={(event) =>
                        setDescriptionLines(event.nativeEvent.lines.length)
                      }
                      className="font-nunito text-[14px] leading-[22px] text-muted"
                    >
                      {course.description}
                    </Text>
                  </View>
                  <Text
                    testID="course-sheet-description"
                    numberOfLines={expanded ? undefined : 4}
                    className="font-nunito text-[14px] leading-[22px] text-muted"
                  >
                    {course.description}
                  </Text>
                  {!expanded && descriptionLines > 4 && (
                    <Button
                      testID="course-sheet-more"
                      label={t('courseSheet.more')}
                      variant="ghost"
                      onPress={() => setExpanded(true)}
                      className="self-start px-[0px]"
                    />
                  )}
                </View>
              )}
              <View className="mb-[10px] mt-[2px] flex-row items-baseline justify-between">
                <Text className="font-nunito-extrabold text-[15px] text-black">
                  {t('courseSheet.openClasses')}
                </Text>
                {classes.length > 0 && (
                  <Text className="font-nunito-bold text-[12.5px] text-muted">
                    {t('courseSheet.classCount', { count: classes.length })}
                  </Text>
                )}
              </View>
              <View
                testID="course-sheet-classes-card"
                className="mb-[18px] shrink"
              >
                {classes.length === 0 ? (
                  <Text
                    testID="course-sheet-empty"
                    className="font-nunito-semibold text-[14px] text-muted"
                  >
                    {t('courseSheet.empty')}
                  </Text>
                ) : (
                  <ScrollView
                    testID="course-sheet-classes-scroll"
                    style={classViewportStyle}
                    scrollEnabled={scrollClasses}
                    nestedScrollEnabled
                    disallowInterruption
                    showsVerticalScrollIndicator={scrollClasses}
                    bounces={false}
                  >
                    <View className="gap-[10px]">
                      {classes.map((item, rowIndex) => {
                        const selected = selectedClassId === item.id;
                        const full = item.availableSeats === 0;
                        return (
                          <View
                            key={item.id}
                            testID={'course-sheet-class-' + item.id}
                            onLayout={
                              rowIndex < 3
                                ? (event) => {
                                    const height =
                                      event.nativeEvent.layout.height;
                                    setRowHeights((previous) =>
                                      previous[item.id] === height
                                        ? previous
                                        : { ...previous, [item.id]: height }
                                    );
                                  }
                                : undefined
                            }
                            className={
                              (selected
                                ? 'rounded-[16px] border border-mint bg-soft px-[14px] py-[12px]'
                                : 'rounded-[16px] border border-line bg-canvas px-[14px] py-[12px]') +
                              (full ? ' opacity-55' : '')
                            }
                          >
                            <View className="flex-row flex-wrap items-center gap-[8px]">
                              <Text className="font-nunito-extrabold text-[15px] text-black">
                                {item.name}
                              </Text>
                              <Text className="rounded-full bg-line px-[8px] py-[2px] font-nunito-extrabold text-[9px] text-forest">
                                {item.deliveryMode}
                              </Text>
                            </View>
                            <View
                              className={
                                fontScale > 1.2
                                  ? 'gap-[12px]'
                                  : 'flex-row items-center gap-[12px]'
                              }
                            >
                              <View className="flex-1">
                                <Text className="mt-[4px] font-nunito text-[12px] leading-[18px] text-muted">
                                  {formatDateOnly(item.startDate) +
                                    ' – ' +
                                    formatDateOnly(item.endDate)}
                                  {item.sessions?.length
                                    ? ' · ' +
                                      formatSchedule(
                                        item.sessions,
                                        'Asia/Ho_Chi_Minh'
                                      )
                                    : ''}
                                </Text>
                                <Text className="mt-[4px] font-nunito text-[12px] leading-[18px] text-muted">
                                  {t('courseSheet.mentor', {
                                    name: item.mentor.displayName,
                                  }) + ' · '}
                                  <Text
                                    testID={'course-sheet-seats-' + item.id}
                                    className={
                                      full
                                        ? 'font-nunito-bold text-status-red'
                                        : item.availableSeats <= 5
                                          ? 'font-nunito-bold text-status-red'
                                          : 'font-nunito-bold text-muted'
                                    }
                                  >
                                    {full
                                      ? t('courseSheet.full')
                                      : t('courseSheet.seats', {
                                          count: item.availableSeats,
                                        })}
                                  </Text>
                                </Text>
                              </View>
                              <PressableScale
                                testID={'course-sheet-pick-' + item.id}
                                disabled={pending || full}
                                accessibilityRole="button"
                                accessibilityState={{
                                  selected,
                                  disabled: pending || full,
                                  busy: pendingClassId === item.id,
                                }}
                                accessibilityHint={
                                  selected
                                    ? t('courseSheet.unpickHint')
                                    : undefined
                                }
                                hitSlop={4}
                                onPress={() =>
                                  selected ? onUnpick(item.id) : onPick(item.id)
                                }
                                className={
                                  (fontScale > 1.2 ? 'w-full ' : 'w-[104px] ') +
                                  'shrink-0 ' +
                                  (selected || full
                                    ? 'min-h-[36px] items-center justify-center rounded-full bg-line px-[14px] py-[6px]'
                                    : 'min-h-[36px] items-center justify-center rounded-full bg-forest px-[14px] py-[6px]')
                                }
                              >
                                {pendingClassId === item.id ? (
                                  <ActivityIndicator
                                    color={colors.forest}
                                    size="small"
                                  />
                                ) : (
                                  <Text
                                    className={
                                      full
                                        ? 'font-nunito-extrabold text-[13px] text-muted'
                                        : selected
                                          ? 'font-nunito-extrabold text-[13px] text-forest'
                                          : 'font-nunito-extrabold text-[13px] text-canvas'
                                    }
                                  >
                                    {t(
                                      full
                                        ? 'courseSheet.full'
                                        : selected
                                          ? 'courseSheet.picked'
                                          : 'courseSheet.pick'
                                    )}
                                  </Text>
                                )}
                              </PressableScale>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                )}
              </View>
              {error && (
                <Text
                  accessibilityLiveRegion="polite"
                  className="mb-[10px] font-nunito-bold text-[13px] text-status-red"
                >
                  {error}
                </Text>
              )}
              <View className="flex-row items-center gap-[10px]">
                <Text
                  testID="course-sheet-price"
                  className="flex-1 font-nunito-extrabold text-[20px] text-forest"
                >
                  {formatVnd(course.priceAmount)}
                </Text>
                <PressableScale
                  testID="course-sheet-add-to-cart"
                  accessibilityRole="button"
                  accessibilityLabel={t('courseSheet.addToCart')}
                  accessibilityState={{
                    disabled: pending || !canSubmit,
                    busy: !!pendingClassId && !buying,
                  }}
                  disabled={pending || !canSubmit}
                  onPress={onAddToCart}
                  className={
                    pending || !canSubmit
                      ? 'h-[50px] w-[50px] items-center justify-center rounded-[14px] border border-forest bg-soft opacity-60'
                      : 'h-[50px] w-[50px] items-center justify-center rounded-[14px] border border-forest bg-soft'
                  }
                >
                  {pendingClassId && !buying ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.forest}
                    />
                  ) : (
                    <Icon
                      name="cart"
                      size={24}
                      color={colors.forest}
                    />
                  )}
                </PressableScale>
                <Button
                  testID="course-sheet-buy"
                  label={t('courseSheet.buy')}
                  accessibilityHint={t('courseSheet.buyHint')}
                  variant="solid"
                  loading={buying}
                  disabled={pending || !canSubmit}
                  onPress={onBuy}
                  className={
                    pending || !canSubmit
                      ? 'min-h-[50px] rounded-[14px] bg-action px-[20px] opacity-60'
                      : 'min-h-[50px] rounded-[14px] bg-action px-[20px]'
                  }
                />
              </View>
            </View>
            {toast && (
              <Text
                testID="course-sheet-toast"
                accessibilityLiveRegion="polite"
                pointerEvents="none"
                className="absolute inset-x-[0px] top-[12px] z-10 rounded-[14px] bg-forest p-[13px] font-nunito-bold text-[14px] text-canvas shadow-lg"
              >
                {toast}
              </Text>
            )}
          </>
        )}
      </View>
    </AppSheet>
  );
}
