import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PressableScale } from './PressableScale';
import { Icon, type IconName } from './Icon';
import { colors } from '@/theme/colors';
import type { HomeActions } from '@/modules/home/types/home.type';
const tabs = [
  { id: 'courses', icon: 'grid' },
  { id: 'schedule', icon: 'calendar' },
  { id: 'home', icon: 'home' },
  { id: 'notifications', icon: 'bell' },
  { id: 'account', icon: 'user' },
] as const;
export function AppTabBar({
  onTab,
  onTop,
  selected = 'home',
  prefix = 'home',
}: {
  onTab: HomeActions['onTab'];
  onTop: () => void;
  selected?: 'home' | 'courses';
  prefix?: string;
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
            testID={`${prefix}-tab-${id}`}
            accessibilityRole="tab"
            accessibilityLabel={t(`home.tabs.${id}`)}
            accessibilityHint={
              id !== 'home' && (id !== 'courses' || !onTab)
                ? t('home.actions.unavailable')
                : undefined
            }
            accessibilityState={{
              selected: id === selected,
              disabled: id !== 'home' && (id !== 'courses' || !onTab),
            }}
            disabled={id !== 'home' && (id !== 'courses' || !onTab)}
            onPress={() => (id === 'home' ? onTop() : onTab?.(id))}
            className={
              id === 'home'
                ? selected === 'home'
                  ? 'h-[78px] w-[78px] items-center justify-center rounded-full border-[6px] border-canvas bg-action shadow-lg shadow-forest/30'
                  : 'h-[78px] w-[78px] items-center justify-center rounded-full border-[6px] border-canvas bg-mint shadow-lg shadow-forest/30'
                : id === selected
                  ? 'min-h-[44px] items-center justify-center gap-[3px] rounded-[14px] bg-mint px-[4px] py-[6px]'
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
                  color={id === selected ? colors.canvas : colors.muted}
                />
                <Text
                  numberOfLines={1}
                  className={
                    id === selected
                      ? 'font-nunito-extrabold text-[10.5px] text-canvas'
                      : 'font-nunito-extrabold text-[10.5px] text-muted'
                  }
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
