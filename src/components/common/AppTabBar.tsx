import { useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { PressableScale } from './PressableScale';
import { Icon, type IconName } from './Icon';
import { colors } from '@/theme/colors';
import type { HomeActions, HomeTab } from '@/modules/home/types/home.type';

type TabId = HomeTab;
const left = [
  { id: 'courses', icon: 'grid' },
  { id: 'schedule', icon: 'calendar' },
] as const;
const right = [
  { id: 'messages', icon: 'chat' },
  { id: 'account', icon: 'user' },
] as const;

/** Bar geometry: home circle sits in the centre, both bar halves wrap it with a gap. */
const geometry = (roomy: boolean) => {
  const bar = roomy ? 84 : 64;
  const home = roomy ? 80 : 70;
  const gap = 6;
  return { bar, home, gap, cut: home / 2 + gap, corner: 26, fillet: 10 };
};

/**
 * Outline of one bar half. The inner end is a concave arc that follows the
 * home circle (radius = home/2 + gap), joined to the straight edges with small
 * fillets so the outline stays smooth.
 */
export function halfBarPath(
  width: number,
  height: number,
  cut: number,
  corner: number,
  fillet: number,
  mirror: boolean
) {
  const cx = width / 2;
  const cy = height / 2;
  const f = fillet;
  const r = Math.min(corner, cy);
  const fx = cx - Math.sqrt((cut + f) ** 2 - (cy - f) ** 2);
  const k = cut / (cut + f);
  const px = cx + (fx - cx) * k;
  const pyTop = cy + (f - cy) * k;
  const pyBottom = height - pyTop;
  const x = (v: number) => (mirror ? width - v : v).toFixed(2);
  const y = (v: number) => v.toFixed(2);
  // Mirroring along x flips the drawing direction of every arc.
  const cw = mirror ? 0 : 1;
  const ccw = mirror ? 1 : 0;
  return [
    `M${x(r)} ${y(0)}`,
    `L${x(fx)} ${y(0)}`,
    `A${f} ${f} 0 0 ${cw} ${x(px)} ${y(pyTop)}`,
    `A${cut} ${cut} 0 0 ${ccw} ${x(px)} ${y(pyBottom)}`,
    `A${f} ${f} 0 0 ${cw} ${x(fx)} ${y(height)}`,
    `L${x(r)} ${y(height)}`,
    `A${r} ${r} 0 0 ${cw} ${x(0)} ${y(height - r)}`,
    `L${x(0)} ${y(r)}`,
    `A${r} ${r} 0 0 ${cw} ${x(r)} ${y(0)}`,
    'Z',
  ].join(' ');
}

export function AppTabBar({
  onTab,
  onTop,
  selected = 'home',
  prefix = 'home',
  learningEnabled = false,
}: {
  onTab: HomeActions['onTab'];
  onTop: () => void;
  selected?: HomeTab;
  prefix?: string;
  learningEnabled?: boolean;
}) {
  const { t } = useTranslation();
  const { width: screen, fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const roomy = learningEnabled && (screen <= 360 || fontScale >= 1.3);
  const g = geometry(roomy);
  const total = Math.max(g.bar, g.home) + 6;
  const top = (total - g.bar) / 2;
  const enabled = (id: TabId) =>
    id === 'home' ||
    (!!onTab &&
      (id === 'courses' ||
        (learningEnabled &&
          (id === 'schedule' || id === 'account' || id === 'messages'))));
  const homeSelected = selected === 'home';

  const renderTab = ({ id, icon }: { id: TabId; icon: IconName }) => (
    <View
      key={id}
      className="flex-1 items-center justify-center px-[2px]"
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
        onPress={() => onTab?.(id as HomeTab)}
        className="min-h-[44px] min-w-[56px] items-center justify-center gap-[3px] px-[4px] py-[4px]"
      >
        {/* Active: soft pill behind the icon only, so the item never fills the bar. */}
        <View
          className={
            id === selected
              ? 'h-[28px] w-[52px] items-center justify-center rounded-full bg-mint/15'
              : 'h-[28px] w-[52px] items-center justify-center rounded-full bg-transparent'
          }
        >
          <Icon
            name={icon}
            size={20}
            color={id === selected ? colors.mint : colors.muted}
          />
        </View>
        <Text
          numberOfLines={roomy ? 2 : 1}
          className={
            id === selected
              ? 'text-center font-nunito-extrabold text-[10.5px] text-mint'
              : 'text-center font-nunito-bold text-[10.5px] text-muted'
          }
        >
          {t(`home.tabs.${id}`)}
        </Text>
      </PressableScale>
    </View>
  );

  const side = width > 0 ? width / 2 - g.cut : 0;
  const homeFill = homeSelected ? colors.action : colors.mint;

  return (
    <View
      className="relative w-full"
      style={{ height: total }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <View
          className="absolute left-[0px] top-[0px]"
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          <Svg
            width={width}
            height={total}
          >
            {[false, true].map((mirror) => {
              const d = halfBarPath(
                width,
                g.bar,
                g.cut,
                g.corner,
                g.fillet,
                mirror
              );
              return (
                <G key={String(mirror)}>
                  <Path
                    d={d}
                    y={top + 4}
                    fill={colors.forest}
                    fillOpacity={0.08}
                  />
                  <Path
                    d={d}
                    y={top}
                    fill={colors.canvas}
                    stroke={colors.line}
                    strokeWidth={1}
                  />
                </G>
              );
            })}
            <Circle
              cx={width / 2}
              cy={total / 2 + 4}
              r={g.home / 2}
              fill={colors.forest}
              fillOpacity={0.14}
            />
            <Circle
              cx={width / 2}
              cy={total / 2}
              r={g.home / 2}
              fill={homeFill}
              stroke={colors.canvas}
              strokeWidth={4}
            />
          </Svg>
        </View>
      )}
      <View
        className="absolute inset-x-[0px] flex-row items-center"
        style={{ top, height: g.bar }}
      >
        <View
          className="flex-row items-center pl-[10px]"
          style={side ? { width: side } : undefined}
        >
          {left.map(renderTab)}
        </View>
        <View className="flex-1 items-center justify-center">
          <PressableScale
            testID={`${prefix}-tab-home`}
            accessibilityRole="tab"
            accessibilityLabel={t('home.tabs.home')}
            accessibilityState={{ selected: homeSelected, disabled: false }}
            onPress={onTop}
            className={
              roomy
                ? 'h-[80px] w-[80px] items-center justify-center rounded-full'
                : 'h-[70px] w-[70px] items-center justify-center rounded-full'
            }
          >
            <Icon
              name="home"
              size={roomy ? 32 : 28}
              light
            />
          </PressableScale>
        </View>
        <View
          className="flex-row items-center pr-[10px]"
          style={side ? { width: side } : undefined}
        >
          {right.map(renderTab)}
        </View>
      </View>
    </View>
  );
}
