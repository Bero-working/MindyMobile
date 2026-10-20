import { useCarouselAutoplay } from '@/shared/hooks/useCarouselAutoplay';
import { useRef, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { CoverImage } from '@/components/common/CoverImage';
import { PressableScale } from '@/components/common/PressableScale';
import { cn } from '@/shared/utilities/cn';
import { colors } from '@/theme/colors';
import { HomeButton } from './HomeButton';
import { HOME_INTRO_IMAGES } from '../constants/homeIntro.constant';
import map from '@/assets/illustrations/mindy-mascot-map.png';
import laptop from '@/assets/illustrations/mindy-mascot-laptop.png';
import book from '@/assets/illustrations/mindy-mascot-book.png';

const keys = ['first', 'second', 'third'] as const;
const slots = ['start', 'mentor', 'project'] as const;
const mascots = [map, laptop, book];
const backgrounds = ['bg-sunshine', 'bg-logo-soft', 'bg-banner'];
const mascotClasses = [
  '-top-[44px] left-[14px] h-[107px] w-[104px]',
  '-top-[50px] right-[10px] h-[112px] w-[140px]',
  '-top-[36px] left-1/2 -ml-[38px] h-[91px] w-[76px]',
];
const paperClasses = [
  'rotate-[-1.6deg]',
  'rotate-[1.2deg]',
  'rotate-[-0.8deg]',
];
const tapeClasses = [
  'right-[52px] rotate-[5deg]',
  'right-[140px] rotate-[-4deg]',
  'right-[70px] rotate-[3deg]',
];

function Dot({ active, about }: { active: boolean; about: boolean }) {
  const reduced = useReducedMotion();
  const style = useAnimatedStyle(() => ({
    width: reduced
      ? active
        ? 28
        : 8
      : withTiming(active ? 28 : 8, { duration: 250 }),
  }));
  return (
    <Animated.View
      style={style}
      className={cn(
        'h-[8px] rounded-full',
        about
          ? active
            ? 'bg-canvas'
            : 'bg-canvas/40'
          : active
            ? 'bg-black'
            : 'bg-banner'
      )}
    />
  );
}
export function HomeCarousel({
  kind,
  onAction,
}: {
  kind: 'intro' | 'about';
  onAction?: ((index: number) => void) | undefined;
  preview?: boolean;
}) {
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const about = kind === 'about';
  const prefix = about ? 'home.about.notes' : 'home.intro';
  const carousel = useCarouselAutoplay({
    count: keys.length,
    width,
    onScrollTo: (options) => scroll.current?.scrollTo(options),
  });
  const selected = carousel.index;
  return (
    <View
      testID={`home-${kind}-carousel`}
      className={cn(
        'relative',
        about
          ? 'mt-[44px] overflow-hidden bg-mint pb-[30px] pt-[6px]'
          : 'pt-[34px]'
      )}
    >
      {about ? (
        <>
          <View
            className="absolute -left-[40px] -top-[30px] h-[140px] w-[140px] rounded-full bg-canvas/10"
            accessible={false}
          />
          <View
            className="absolute -right-[50px] bottom-[40px] h-[120px] w-[120px] rounded-full bg-canvas/5"
            accessible={false}
          />
        </>
      ) : (
        <Text
          accessibilityRole="header"
          className="mx-[16px] font-nunito-extrabold text-[28px] leading-[30.8px] tracking-[-0.84px] text-black"
        >
          {t('home.intro.headingBefore')}
          <Text className="text-mint">{t('home.intro.headingAccent')}</Text>
          {t('home.intro.headingAfter')}
        </Text>
      )}
      <View
        testID={`home-${kind}-viewport`}
        onLayout={(event) => {
          const w = event.nativeEvent.layout.width;
          setWidth(w);
          scroll.current?.scrollTo({ x: selected * w, animated: false });
        }}
      >
        <ScrollView
          ref={scroll}
          testID={`home-${kind}-scroll`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={carousel.onMomentumScrollEnd}
          onScrollBeginDrag={carousel.onScrollBeginDrag}
          onScrollEndDrag={carousel.onScrollEndDrag}
          contentContainerClassName="w-[300%]"
        >
          {keys.map((key, index) => (
            <View
              key={key}
              testID={`home-${kind}-slide-${index}`}
              accessibilityElementsHidden={selected !== index}
              importantForAccessibility={
                selected === index ? 'auto' : 'no-hide-descendants'
              }
              className={cn(
                'w-1/3',
                about ? 'px-[26px] pb-[26px] pt-[40px]' : 'pt-[40px]'
              )}
            >
              <View
                className={cn(
                  'relative',
                  about
                    ? 'min-h-[300px] bg-canvas px-[22px] pb-[48px] pt-[30px] shadow-xl shadow-forest-night/35'
                    : 'px-[18px] pb-[22px] pt-[66px]',
                  about ? paperClasses[index] : backgrounds[index]
                )}
              >
                {!about && (
                  <Image
                    source={mascots[index]}
                    resizeMode="contain"
                    accessible={false}
                    className={cn('absolute', mascotClasses[index])}
                  />
                )}
                <Text
                  accessibilityRole="header"
                  className={cn(
                    'mb-[8px] font-nunito-extrabold tracking-[-0.46px] text-black',
                    about
                      ? 'mb-[14px] text-[26px] italic leading-[29.9px]'
                      : 'text-[23px] leading-[27.6px]'
                  )}
                >
                  {t(`${prefix}.${key}.title`)}
                </Text>
                <Text
                  className={cn(
                    'font-nunito text-[14.5px] leading-[23.2px] text-black',
                    about ? 'mb-[12px]' : 'mb-[16px]'
                  )}
                >
                  {t(`${prefix}.${key}.description`)}
                </Text>
                {about ? (
                  <>
                    {(['one', 'two'] as const).map((item) => (
                      <Text
                        key={item}
                        className="mb-[12px] font-nunito text-[14.5px] leading-[23.2px] text-black"
                      >
                        {t('home.about.dash')}
                        <Text className="font-nunito-extrabold">
                          {t(`${prefix}.${key}.${item}Bold`)}
                        </Text>{' '}
                        {t(`${prefix}.${key}.${item}Text`)}
                      </Text>
                    ))}
                    <View
                      className="absolute bottom-[0px] right-[0px] h-[46px] w-[46px]"
                      accessible={false}
                    >
                      <Svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 46 46"
                      >
                        <Path
                          d="M0 46V0h46Z"
                          fill={colors.cream}
                        />
                        <Path
                          d="M0 46h46V0Z"
                          fill={colors.mint}
                        />
                      </Svg>
                    </View>
                  </>
                ) : (
                  <>
                    <View className="mb-[18px] bg-teal p-[9px] shadow-lg shadow-forest/20">
                      {HOME_INTRO_IMAGES[slots[index] ?? 'start'] ? (
                        <CoverImage
                          source={HOME_INTRO_IMAGES[slots[index] ?? 'start']}
                          label={t(
                            `home.intro.slides.${slots[index]}.imageAlt`
                          )}
                          testID={`home-intro-image-${index}`}
                          className="aspect-[4/3] rounded-none"
                          fallback={<View className="flex-1 bg-canvas/60" />}
                        />
                      ) : (
                        <View
                          testID={`home-intro-image-${index}`}
                          accessible={false}
                          importantForAccessibility="no-hide-descendants"
                          className="aspect-[4/3] bg-canvas/60"
                        />
                      )}
                    </View>
                    <View className="self-start">
                      <HomeButton
                        testID={`home-intro-action-${index}`}
                        label={t(`${prefix}.${key}.action`)}
                        disabled={!onAction}
                        accessibilityHint={
                          !onAction ? t('home.actions.unavailable') : undefined
                        }
                        onPress={() => onAction?.(index)}
                      />
                    </View>
                  </>
                )}
              </View>
              {about && (
                <View
                  accessible={false}
                  className={cn(
                    'absolute top-[28px] h-[24px] w-[76px] bg-tape/80 shadow-sm',
                    tapeClasses[index]
                  )}
                />
              )}
            </View>
          ))}
        </ScrollView>
      </View>
      <View
        className={cn(
          'flex-row justify-center',
          about ? 'pt-[4px]' : 'pt-[18px]'
        )}
      >
        {keys.map((key, index) => (
          <PressableScale
            key={key}
            accessibilityRole="button"
            accessibilityLabel={t('home.carousel.goToSlide', {
              index: index + 1,
              title: t(`${prefix}.${key}.title`),
            })}
            accessibilityState={{ selected: selected === index }}
            testID={`home-${kind}-dot-${index}`}
            onPress={() => carousel.select(index)}
            className="min-h-[44px] items-center justify-center px-[5px]"
          >
            <Dot
              active={selected === index}
              about={about}
            />
          </PressableScale>
        ))}
      </View>
    </View>
  );
}
