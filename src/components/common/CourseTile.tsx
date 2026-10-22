import { Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { CoverImage } from '@/components/common/CoverImage';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { colors } from '@/theme/colors';
import type { HomeActions, HomeCourse } from '@/modules/home/types/home.type';
import { formatVnd, formatDateOnly } from '@/shared/utilities/formatVnd';
import { CourseCover } from './CourseCover';
import { cn } from '@/shared/utilities/cn';
export function CourseTile({
  course,
  actions,
  index = 0,
  prefix = 'home',
  onOpen,
}: {
  index?: number;
  prefix?: string;
  onOpen?: ((id: string) => void) | undefined;
  course: HomeCourse;
  actions: HomeActions;
}) {
  const { t } = useTranslation();
  const open = onOpen ?? actions.onCourse ?? actions.onSelectCourse;
  const { fontScale } = useWindowDimensions();
  const enlarged = fontScale > 1.2;
  return (
    <View className="mb-[12px] w-1/2 px-[6px]">
      <View className="relative overflow-hidden rounded-[20px] bg-soft">
        <PressableScale
          testID={`${prefix}-course-${course.id}`}
          accessibilityRole="button"
          accessibilityLabel={t('home.actions.course', { title: course.title })}
          accessibilityHint={!open ? t('home.actions.unavailable') : undefined}
          accessibilityState={{ disabled: !open }}
          disabled={!open}
          onPress={() => open?.(course.id)}
        >
          <View>
            <CoverImage
              fallback={<CourseCover index={index} />}
              hideLabel
              uri={course.imgUrl}
              label={course.title}
              testID={`${prefix}-cover-${course.id}`}
            />
            <View
              className="absolute inset-[0px]"
              accessible={false}
              pointerEvents="none"
            >
              <Svg
                width="100%"
                height="100%"
              >
                <Defs>
                  <LinearGradient
                    id="shade"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <Stop
                      offset="0"
                      stopColor={colors.forestDeep}
                      stopOpacity={0}
                    />
                    <Stop
                      offset="0.45"
                      stopColor={colors.forestDeep}
                      stopOpacity={0.82}
                    />
                    <Stop
                      offset="1"
                      stopColor={colors.forestDeep}
                      stopOpacity={0.95}
                    />
                  </LinearGradient>
                </Defs>
                <Rect
                  width="100%"
                  height="100%"
                  fill="url(#shade)"
                />
              </Svg>
            </View>
          </View>
          <View
            className={cn(
              'px-[12px] pb-[12px] pt-[44px]',
              enlarged
                ? 'bg-forest-deep'
                : 'absolute inset-x-[0px] bottom-[0px]'
            )}
          >
            {course.openClass && (
              <Text className="font-nunito-extrabold text-[11px] text-sunshine">
                {course.openClass.deliveryMode}
                {t('home.starts', {
                  date: formatDateOnly(course.openClass.startDate),
                })}
              </Text>
            )}
            <Text
              numberOfLines={enlarged ? undefined : 3}
              className="mt-[3px] font-nunito-extrabold text-[15px] leading-[18.8px] text-canvas"
            >
              {course.title}
            </Text>
            <Text className="mr-[36px] mt-[8px] font-nunito-extrabold text-[15px] text-canvas">
              {formatVnd(course.priceAmount)}
            </Text>
          </View>
        </PressableScale>
        <View className="absolute bottom-[7px] right-[7px] h-[44px] w-[44px]">
          <PressableScale
            testID={`${prefix === 'home' ? 'home-course-open' : 'courses-open'}-${course.id}`}
            accessibilityRole="button"
            accessibilityLabel={t('home.actions.course', {
              title: course.title,
            })}
            accessibilityHint={
              !open ? t('home.actions.unavailable') : undefined
            }
            accessibilityState={{ disabled: !open }}
            disabled={!open}
            onPress={() => open?.(course.id)}
            className="h-[44px] w-[44px] items-center justify-center"
          >
            <View className="h-[34px] w-[34px] items-center justify-center">
              <Icon
                name="arrow"
                size={22}
                color={colors.action}
              />
            </View>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}
