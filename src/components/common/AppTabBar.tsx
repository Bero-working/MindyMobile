import { Text, View, useWindowDimensions } from 'react-native';
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
  learningEnabled = false,
}: {
  onTab: HomeActions['onTab'];
  onTop: () => void;
  selected?: 'home' | 'courses' | 'schedule' | 'account';
  prefix?: string;
  learningEnabled?: boolean;
}) {
  const { t } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const roomy = learningEnabled && (width <= 360 || fontScale >= 1.3);
  const enabled = (id: (typeof tabs)[number]['id']) =>
    id === 'home' ||
    (!!onTab &&
      (id === 'courses' ||
        (learningEnabled && (id === 'schedule' || id === 'account'))));
  return (
    <View
      className={
        roomy
          ? 'relative h-[116px] flex-row items-end px-[4px]'
          : 'relative h-[96px] flex-row items-end px-[4px]'
      }
    >
      <View
        className={
          roomy
            ? 'absolute inset-x-[0px] bottom-[0px] h-[88px] rounded-[26px] bg-canvas shadow-xl shadow-forest/20'
            : 'absolute inset-x-[0px] bottom-[0px] h-[68px] rounded-[26px] bg-canvas shadow-xl shadow-forest/20'
        }
        accessible={false}
      />
      {tabs.map(({ id, icon }) => (
        <View
          key={id}
          className={
            id === 'home'
              ? roomy
                ? 'h-[116px] flex-1 items-center'
                : 'h-[96px] flex-1 items-center'
              : roomy
                ? 'h-[88px] flex-1 justify-center'
                : 'h-[68px] flex-1 justify-center'
          }
        >
          <PressableScale
            testID={`${prefix}-tab-${id}`}
            accessibilityRole="tab"
            accessibilityLabel={t(`home.tabs.${id}`)}
            accessibilityHint={
              !enabled(id) ? t('home.actions.unavailable') : undefined
            }
            accessibilityState={{
              selected: id === selected,
              disabled: !enabled(id),
            }}
            disabled={!enabled(id)}
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
                  numberOfLines={roomy ? 2 : 1}
                  className={
                    id === selected
                      ? 'text-center font-nunito-extrabold text-[10.5px] text-canvas'
                      : 'text-center font-nunito-extrabold text-[10.5px] text-muted'
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
