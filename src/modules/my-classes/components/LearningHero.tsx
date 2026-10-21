import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { cn } from '@/shared/utilities/cn';
export function LearningHero({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      className={cn(
        'gap-[12px] overflow-hidden rounded-[24px] p-[20px] pb-[36px]',
        className
      )}
    >
      <View
        className="absolute inset-[0px]"
        pointerEvents="none"
        accessible={false}
      >
        <Svg
          width="100%"
          height="100%"
        >
          <Defs>
            <LinearGradient
              id="learning-hero"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <Stop
                offset="0"
                stopColor={colors.forestDeep}
              />
              <Stop
                offset="0.5"
                stopColor={colors.forest}
              />
              <Stop
                offset="1"
                stopColor={colors.mint}
              />
            </LinearGradient>
          </Defs>
          <Rect
            width="100%"
            height="100%"
            fill="url(#learning-hero)"
          />
        </Svg>
      </View>
      {children}
    </View>
  );
}
