import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import type { HomeActions } from '@/modules/home/types/home.type';
export function BrandBar({
  onTop,
  onCart,
  compact = false,
  prefix = 'home',
  cartCount = 0,
}: {
  onTop: () => void;
  onCart: HomeActions['onCart'];
  compact?: boolean;
  prefix?: string;
  cartCount?: number;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center px-[14px] pt-[2px]">
      <View className="w-[44px]" />
      <View className="flex-1 items-center">
        <PressableScale
          testID={compact ? 'home-compact-logo' : 'home-logo'}
          accessibilityRole="button"
          accessibilityLabel={t('home.tabs.home')}
          onPress={onTop}
          className="min-h-[44px] items-center justify-center"
        >
          <Text className="font-nunito-extrabold text-[19px] leading-[19px] tracking-[-0.19px] text-canvas">
            {t('home.brand.name')}
          </Text>
          <Text className="mt-[2px] font-nunito-extrabold text-[10.5px] leading-[11px] tracking-[2.52px] text-sunshine">
            {t('home.brand.subtitle')}
          </Text>
        </PressableScale>
      </View>
      <PressableScale
        testID={
          prefix === 'home'
            ? compact
              ? 'home-compact-cart-button'
              : 'home-cart-button'
            : 'courses-cart-button'
        }
        accessibilityRole="button"
        accessibilityLabel={t('home.actions.cart')}
        accessibilityHint={!onCart ? t('home.actions.unavailable') : undefined}
        accessibilityState={{ disabled: !onCart }}
        disabled={!onCart}
        onPress={onCart}
        className="h-[44px] w-[44px] items-center justify-center"
      >
        <Icon
          name="cart"
          light
        />
        {cartCount > 0 && (
          <View
            testID={
              compact ? 'home-compact-cart-badge' : prefix + '-cart-badge'
            }
            className="absolute right-[2px] top-[4px] min-w-[18px] rounded-full border-2 border-mint bg-coral px-[4px]"
          >
            <Text className="text-center font-nunito-extrabold text-[11px] text-canvas">
              {cartCount > 9 ? '9+' : cartCount}
            </Text>
          </View>
        )}
      </PressableScale>
    </View>
  );
}
