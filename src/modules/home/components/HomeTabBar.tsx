import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon, type IconName } from '@/components/common/Icon';
import { colors } from '@/theme/colors';
import type { HomeActions } from '../types/home.type';
export function HomeNav({
  onTop,
  onCart,
  compact = false,
}: {
  onTop: () => void;
  onCart: HomeActions['onCart'];
  compact?: boolean;
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
        testID={compact ? 'home-compact-cart-button' : 'home-cart-button'}
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
      </PressableScale>
    </View>
  );
}
const tabs = [
  { id: 'courses', icon: 'grid' },
  { id: 'schedule', icon: 'calendar' },
  { id: 'home', icon: 'home' },
  { id: 'notifications', icon: 'bell' },
  { id: 'account', icon: 'user' },
] as const;
export function HomeTabBar({
  onTab,
  onTop,
}: {
  onTab: HomeActions['onTab'];
  onTop: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="relative h-[96px] flex-row items-end px-[4px]">
      <View
        className="absolute inset-x-[0px] bottom-[0px] h-[68px] rounded-[26px] bg-canvas shadow-xl shadow-forest/20"
        accessible={false}
      />
      {tabs.map(({ id, icon }) => (
        <View
          key={id}
          className={
            id === 'home'
              ? 'h-[96px] flex-1 items-center'
              : 'h-[68px] flex-1 justify-center'
          }
        >
          <PressableScale
            testID={`home-tab-${id}`}
            accessibilityRole="tab"
            accessibilityLabel={t(`home.tabs.${id}`)}
            accessibilityHint={
              !onTab && id !== 'home'
                ? t('home.actions.unavailable')
                : undefined
            }
            accessibilityState={{
              selected: id === 'home',
              disabled: !onTab && id !== 'home',
            }}
            disabled={!onTab && id !== 'home'}
            onPress={() => (id === 'home' ? onTop() : onTab?.(id))}
            className={
              id === 'home'
                ? 'h-[78px] w-[78px] items-center justify-center rounded-full border-[6px] border-canvas bg-action shadow-lg shadow-forest/30'
                : 'min-h-[44px] items-center justify-center gap-[3px] rounded-[14px] px-[4px] py-[6px]'
            }
          >
            {id === 'home' ? (
              <>
                <Icon
                  name={icon}
                  size={30}
                  light
                />
              </>
            ) : (
              <>
                <Icon
                  name={icon as IconName}
                  size={20}
                  color={colors.muted}
                />
                <Text
                  numberOfLines={1}
                  className="font-nunito-extrabold text-[10.5px] text-muted"
                >
                  {t(`home.tabs.${id}`)}
                </Text>
              </>
            )}
          </PressableScale>
        </View>
      ))}
    </View>
  );
}
