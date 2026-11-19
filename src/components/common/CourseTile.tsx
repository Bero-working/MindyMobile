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
  const info = (
    <>
      <Text
        numberOfLines={enlarged ? undefined : 2}
        className="font-nunito-extrabold text-[15px] leading-[18.8px] text-canvas"
      >
        {course.title}
      </Text>
      <Text className="mr-[40px] mt-[6px] font-nunito-extrabold text-[15px] text-sunshine">
        {formatVnd(course.priceAmount)}
      </Text>
    </>
  );
  return (
    <View className="mb-[12px] w-1/2 px-[6px]">
      <View className="relative overflow-hidden rounded-[22px] bg-soft">
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
              className="rounded-[22px]"
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
                    id="tileShade"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <Stop
                      offset="0.4"
                      stopColor={colors.forestDeep}
                      stopOpacity={0}
                    />
                    <Stop
                      offset="1"
                      stopColor={colors.forestDeep}
                      stopOpacity={0.55}
                    />
                  </LinearGradient>
                </Defs>
                <Rect
                  width="100%"
                  height="100%"
                  fill="url(#tileShade)"
                />
              </Svg>
            </View>
          </View>
          {course.openClass && (
            <View className="absolute left-[8px] right-[8px] top-[8px] flex-row">
              <View className="rounded-[12px] bg-forest-deep px-[10px] py-[5px]">
                <Text
                  numberOfLines={1}
                  className="font-nunito-extrabold text-[11px] text-sunshine"
                >
                  {course.openClass.deliveryMode}
                  {t('home.starts', {
                    date: formatDateOnly(course.openClass.startDate),
                  })}
                </Text>
              </View>
            </View>
          )}
          {enlarged ? (
            <View className="bg-forest-deep px-[12px] pb-[14px] pt-[12px]">
              {info}
            </View>
          ) : (
            <View className="absolute inset-x-[8px] bottom-[8px]">
              <View className="rounded-[16px] bg-forest-deep px-[12px] pb-[12px] pt-[10px]">
                {info}
              </View>
            </View>
          )}
        </PressableScale>
        <View className="absolute bottom-[12px] right-[12px] h-[44px] w-[44px] items-center justify-center">
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
            <View className="h-[32px] w-[32px] items-center justify-center rounded-full bg-action">
              <Icon
                name="arrow"
                size={18}
                color={colors.canvas}
              />
            </View>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}
