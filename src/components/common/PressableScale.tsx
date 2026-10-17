import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '@/theme/motion';

type Props = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  className?: string;
};

export function PressableScale({
  children,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: Props) {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const animate = (value: number) => {
    scale.value =
      reducedMotion || disabled
        ? 1
        : withTiming(value, {
            duration: motion.duration.fast,
            easing: motion.easing,
          });
  };
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        {...props}
        disabled={disabled}
        onPressIn={(event) => {
          animate(motion.pressScale);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          animate(1);
          onPressOut?.(event);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
