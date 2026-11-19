import { useMemo } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PressableScale } from '@/components/common/PressableScale';
import { CoverImage } from '@/components/common/CoverImage';
import { CourseCover } from '@/components/common/CourseCover';
import { Icon } from '@/components/common/Icon';
import { formatVnd, formatDateOnly } from '@/shared/utilities/formatVnd';
import { cn } from '@/shared/utilities/cn';
import { colors } from '@/theme/colors';
import type { Course } from '../types/courses.type';

const tints = ['bg-cover-a-soft', 'bg-cover-b-soft', 'bg-cover-c-soft'];

const GAP = 12;
const PEEK = 24;

/** Top three suggested courses in a manual horizontal rail (no autoplay/dots). */
export function Recommendations({
  courses,
  onOpen,
}: {
  courses: Course[];
  onOpen: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const stacked = fontScale > 1.2;
  const cardWidth = Math.max(240, width - 32 - PEEK);
  const cardSize = useMemo(() => ({ width: cardWidth }), [cardWidth]);
  if (!courses.length) return null;
  return (
    <View testID="courses-recommend">
      <View className="mx-[16px] flex-row items-center justify-between">
        <Text className="font-nunito-extrabold text-[20px] tracking-[-0.4px] text-black">
          {t('courses.recommend.title')}
        </Text>
        <View className="rounded-full bg-ribbon px-[10px] py-[3px]">
          <Text className="font-nunito-extrabold text-[10px] tracking-[1.2px] text-canvas">
            {t('courses.recommend.badge')}
          </Text>
        </View>
      </View>
      <ScrollView
        testID="courses-recommend-scroll"
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerClassName="mt-[14px] gap-[12px] px-[16px] pb-[4px]"
      >
        {courses.slice(0, 3).map((course, index) => (
          <PressableScale
            key={course.id}
            style={cardSize}
            testID={'courses-recommend-' + course.id}
            accessibilityRole="button"
            accessibilityLabel={t('courses.recommend.label', {
              title: course.title,
            })}
            onPress={() => onOpen(course.id)}
          >
            <View
              className={cn(
                'flex-1 rounded-[24px] p-[14px]',
                tints[index] ?? 'bg-soft',
                stacked ? 'gap-[12px]' : 'flex-row items-center gap-[14px]'
              )}
            >
              <View className="relative">
                <CoverImage
                  uri={course.imgUrl}
                  label={course.title}
                  hideLabel
                  fallback={<CourseCover index={index} />}
                  className={
                    stacked
                      ? 'aspect-video w-full rounded-[16px]'
                      : 'aspect-square h-[112px] w-[112px] rounded-[16px]'
                  }
                />
                <View
                  accessible={false}
                  className="absolute left-[6px] top-[6px] h-[24px] min-w-[24px] items-center justify-center rounded-full bg-forest-deep px-[6px]"
                >
                  <Text className="font-nunito-extrabold text-[11px] text-canvas">
                    {index + 1}
                  </Text>
                </View>
              </View>
              <View className={stacked ? 'gap-[4px]' : 'flex-1 gap-[5px]'}>
                <Text
                  numberOfLines={1}
                  className="font-nunito-bold text-[13px] text-muted"
                >
                  {course.category.name}
                  {course.openClass
                    ? ' · ' + course.openClass.deliveryMode
                    : ''}
                </Text>
                <Text
                  numberOfLines={stacked ? undefined : 2}
                  className="font-nunito-extrabold text-[19px] leading-[24px] text-black"
                >
                  {course.title}
                </Text>
                <Text className="font-nunito text-[13.5px] leading-[19px] text-black">
                  {course.openClass
                    ? t('courses.meta.startsAndPrice', {
                        date: formatDateOnly(course.openClass.startDate),
                        price: formatVnd(course.priceAmount),
                      })
                    : formatVnd(course.priceAmount)}
                </Text>
              </View>
              <PressableScale
                testID={'courses-recommend-view-' + course.id}
                accessibilityRole="button"
                accessibilityLabel={t('home.actions.course', {
                  title: course.title,
                })}
                hitSlop={4}
                onPress={() => onOpen(course.id)}
                className={cn(
                  'items-center justify-center',
                  stacked
                    ? 'min-h-[44px] flex-row gap-[6px] rounded-full bg-forest px-[16px]'
                    : 'h-[44px] w-[44px]'
                )}
              >
                {stacked ? (
                  <Text className="font-nunito-extrabold text-[13px] text-canvas">
                    {t('courses.recommend.view')}
                  </Text>
                ) : (
                  <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-forest">
                    <Icon
                      name="arrow"
                      size={18}
                      color={colors.canvas}
                    />
                  </View>
                )}
              </PressableScale>
            </View>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}
