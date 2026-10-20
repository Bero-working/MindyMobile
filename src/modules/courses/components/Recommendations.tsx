import { useCarouselAutoplay } from '@/shared/hooks/useCarouselAutoplay';
import { useMemo, useRef } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { PressableScale } from '@/components/common/PressableScale';
import { CoverImage } from '@/components/common/CoverImage';
import { CourseCover } from '@/components/common/CourseCover';
import { formatVnd, formatDateOnly } from '@/shared/utilities/formatVnd';
import { colors } from '@/theme/colors';
import type { Course } from '../types/courses.type';

export function Recommendations({
  courses,
  onOpen,
}: {
  courses: Course[];
  onOpen: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const ref = useRef<ScrollView>(null);
  const carousel = useCarouselAutoplay({
    count: Math.min(courses.length, 3),
    width,
    onScrollTo: (options) => ref.current?.scrollTo(options),
  });
  const page = carousel.index;
  const layout = useMemo(() => ({ width }), [width]);
  if (!courses.length) return null;
  return (
    <View testID="courses-recommend">
      <Text className="mx-[16px] font-nunito-extrabold text-[20px] tracking-[-0.4px] text-black">
        {t('courses.recommend.title')}
      </Text>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={carousel.onMomentumScrollEnd}
        onScrollBeginDrag={carousel.onScrollBeginDrag}
        onScrollEndDrag={carousel.onScrollEndDrag}
      >
        {courses.slice(0, 3).map((course, index) => (
          <View
            key={course.id}
            style={layout}
            className="px-[16px] pb-[4px] pt-[22px]"
          >
            <PressableScale
              testID={'courses-recommend-' + course.id}
              accessibilityRole="button"
              accessibilityLabel={t('courses.recommend.label', {
                title: course.title,
              })}
              onPress={() => onOpen(course.id)}
            >
              <View className="relative rounded-[24px] bg-soft p-[14px] shadow-md shadow-forest/10">
                <View
                  className="absolute inset-[0px] overflow-hidden rounded-[24px]"
                  pointerEvents="none"
                >
                  <Svg
                    width="100%"
                    height="100%"
                  >
                    <Defs>
                      <LinearGradient
                        id={'recommend-' + index}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <Stop
                          offset="0"
                          stopColor={
                            [
                              colors.coverASoft,
                              colors.coverBSoft,
                              colors.coverCSoft,
                            ][index] ?? colors.soft
                          }
                        />
                        <Stop
                          offset="1"
                          stopColor={colors.canvas}
                        />
                      </LinearGradient>
                    </Defs>
                    <Rect
                      width="100%"
                      height="100%"
                      fill={'url(#recommend-' + index + ')'}
                    />
                  </Svg>
                </View>
                <View
                  className={
                    fontScale > 1.2 ? 'gap-[12px]' : 'flex-row gap-[12px]'
                  }
                >
                  {fontScale > 1.2 && (
                    <CoverImage
                      uri={course.imgUrl}
                      label={course.title}
                      hideLabel
                      fallback={<CourseCover index={index} />}
                      className="aspect-video w-full rounded-[18px]"
                    />
                  )}
                  <View className="flex-1 gap-[5px] py-[2px]">
                    <Text className="font-nunito-bold text-[12px] text-muted">
                      {course.category.name}
                      {course.openClass
                        ? ' · ' + course.openClass.deliveryMode
                        : ''}
                    </Text>
                    <Text className="font-nunito-extrabold text-[20px] leading-[23px] tracking-[-0.4px] text-black">
                      {course.title}
                    </Text>
                    <Text className="font-nunito text-[12.5px] leading-[18px] text-black">
                      {course.openClass
                        ? t('courses.meta.startsAndPrice', {
                            date: formatDateOnly(course.openClass.startDate),
                            price: formatVnd(course.priceAmount),
                          })
                        : formatVnd(course.priceAmount)}
                    </Text>
                    <View className="flex-1" />
                    <PressableScale
                      testID={'courses-recommend-view-' + course.id}
                      accessibilityRole="button"
                      accessibilityLabel={t('home.actions.course', {
                        title: course.title,
                      })}
                      hitSlop={4}
                      onPress={() => onOpen(course.id)}
                      className="mt-[8px] min-h-[36px] items-center justify-center rounded-full border border-line bg-canvas/90 px-[16px]"
                    >
                      <Text className="font-nunito-extrabold text-[13px] text-forest">
                        {t('courses.recommend.view')}
                      </Text>
                    </PressableScale>
                  </View>
                  {fontScale <= 1.2 && (
                    <CoverImage
                      uri={course.imgUrl}
                      label={course.title}
                      hideLabel
                      fallback={<CourseCover index={index} />}
                      className={
                        fontScale > 1.2
                          ? 'aspect-video h-[150px] w-full rounded-[18px]'
                          : 'aspect-[128/150] h-[150px] w-[128px] rounded-[18px]'
                      }
                    />
                  )}
                </View>
                <View
                  pointerEvents="none"
                  accessible={false}
                  className="absolute -right-[7px] -top-[7px] h-[104px] w-[104px] overflow-hidden"
                >
                  <View className="absolute left-[6px] top-[0px] h-[7px] w-[7px] bg-ribbon-fold" />
                  <View className="absolute bottom-[6px] right-[0px] h-[7px] w-[7px] bg-ribbon-fold" />
                  <View className="absolute -right-[32px] top-[26px] w-[156px] rotate-45 overflow-hidden border-y border-dashed border-canvas/45 bg-ribbon py-[7px]">
                    <View className="absolute inset-[0px]">
                      <Svg
                        width="100%"
                        height="100%"
                      >
                        <Defs>
                          <LinearGradient
                            id={'ribbon-' + index}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <Stop
                              offset="0"
                              stopColor={colors.ribbon}
                            />
                            <Stop
                              offset="1"
                              stopColor={colors.ribbonDeep}
                            />
                          </LinearGradient>
                        </Defs>
                        <Rect
                          width="100%"
                          height="100%"
                          fill={'url(#ribbon-' + index + ')'}
                        />
                      </Svg>
                    </View>
                    <Text className="text-center font-nunito-extrabold text-[10px] tracking-[1.4px] text-canvas">
                      {t('courses.recommend.badge')}
                    </Text>
                  </View>
                </View>
              </View>
            </PressableScale>
          </View>
        ))}
      </ScrollView>
      <View className="flex-row justify-center gap-[8px] pt-[12px]">
        {courses.slice(0, 3).map((course, index) => (
          <PressableScale
            key={course.id}
            testID={'courses-recommend-dot-' + index}
            accessibilityRole="button"
            accessibilityLabel={t('courses.pagination.page', {
              page: index + 1,
            })}
            accessibilityState={{ selected: page === index }}
            onPress={() => carousel.select(index)}
            hitSlop={18}
            className="justify-center px-[2px]"
          >
            <View
              className={
                page === index
                  ? 'h-[7px] w-[24px] rounded-full bg-forest'
                  : 'h-[7px] w-[7px] rounded-full bg-banner'
              }
            />
          </PressableScale>
        ))}
      </View>
    </View>
  );
}
