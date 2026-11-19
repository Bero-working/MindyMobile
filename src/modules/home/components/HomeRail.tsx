import {
  Image,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CoverImage } from '@/components/common/CoverImage';
import { cn } from '@/shared/utilities/cn';
import { HomeButton } from './HomeButton';
import { HOME_INTRO_IMAGES } from '../constants/homeIntro.constant';
import map from '@/assets/illustrations/mindy-mascot-map.png';
import laptop from '@/assets/illustrations/mindy-mascot-laptop.png';
import book from '@/assets/illustrations/mindy-mascot-book.png';

const keys = ['first', 'second', 'third'] as const;
const slots = ['start', 'mentor', 'project'] as const;
const mascots = [map, laptop, book];
const backgrounds = ['bg-sunshine', 'bg-logo-soft', 'bg-banner'] as const;
const GAP = 14;

/**
 * Horizontal, free-scrolling rail of cards. Cards snap to their
 * start and the next card peeks in so the rail reads as scrollable.
 */
export function HomeRail({
  kind,
  onAction,
}: {
  kind: 'intro' | 'about';
  onAction?: ((index: number) => void) | undefined;
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const about = kind === 'about';
  const prefix = about ? 'home.about.notes' : 'home.intro';
  const card = Math.min(Math.round(width * 0.8), 340);
  return (
    <View
      testID={`home-${kind}-carousel`}
      className={cn(
        'relative',
        about
          ? 'mt-[44px] overflow-hidden bg-mint pb-[18px] pt-[8px]'
          : 'pt-[34px]'
      )}
    >
      {!about && (
        <Text
          accessibilityRole="header"
          className="mx-[16px] font-nunito-extrabold text-[28px] leading-[30.8px] tracking-[-0.84px] text-black"
        >
          {t('home.intro.headingBefore')}
          <Text className="text-mint">{t('home.intro.headingAccent')}</Text>
          {t('home.intro.headingAfter')}
        </Text>
      )}
      <ScrollView
        testID={`home-${kind}-scroll`}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={card + GAP}
        snapToAlignment="start"
        contentContainerClassName={cn(
          'gap-[14px] px-[16px] pb-[30px]',
          about ? 'pt-[28px]' : 'pt-[64px]'
        )}
      >
        {keys.map((key, index) => (
          <View
            key={key}
            testID={`home-${kind}-slide-${index}`}
            style={{ width: card }}
          >
            <View
              className={cn(
                'relative rounded-[28px]',
                about ? 'bg-forest-deep' : backgrounds[index],
                about
                  ? 'px-[22px] pb-[24px] pt-[26px]'
                  : 'px-[18px] pb-[20px] pt-[66px]'
              )}
            >
              {!about && (
                <Image
                  source={mascots[index]}
                  resizeMode="contain"
                  accessible={false}
                  className="absolute -top-[52px] right-[10px] h-[112px] w-[120px]"
                />
              )}
              {!about && (
                <View className="absolute left-[18px] top-[22px] rounded-full bg-mint px-[12px] py-[4px]">
                  <Text className="font-nunito-extrabold text-[12px] text-canvas">
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                </View>
              )}
              <Text
                accessibilityRole="header"
                className={cn(
                  'font-nunito-extrabold tracking-[-0.46px]',
                  about
                    ? 'mb-[12px] text-[24px] italic leading-[28px] text-canvas'
                    : 'mb-[8px] text-[23px] leading-[27.6px] text-black'
                )}
              >
                {t(`${prefix}.${key}.title`)}
              </Text>
              <Text
                className={cn(
                  'font-nunito text-[14.5px] leading-[23.2px]',
                  about ? 'mb-[12px] text-canvas' : 'mb-[16px] text-black'
                )}
              >
                {t(`${prefix}.${key}.description`)}
              </Text>
              {about ? (
                (['one', 'two'] as const).map((item) => (
                  <Text
                    key={item}
                    className="mb-[10px] font-nunito text-[14.5px] leading-[23.2px] text-canvas"
                  >
                    {t('home.about.dash')}
                    <Text className="font-nunito-extrabold">
                      {t(`${prefix}.${key}.${item}Bold`)}
                    </Text>{' '}
                    {t(`${prefix}.${key}.${item}Text`)}
                  </Text>
                ))
              ) : (
                <>
                  <View className="mb-[18px] overflow-hidden rounded-[20px] border border-canvas bg-teal/20">
                    {HOME_INTRO_IMAGES[slots[index] ?? 'start'] ? (
                      <CoverImage
                        source={HOME_INTRO_IMAGES[slots[index] ?? 'start']}
                        label={t(`home.intro.slides.${slots[index]}.imageAlt`)}
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
                  <View className="mt-auto self-start">
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
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
