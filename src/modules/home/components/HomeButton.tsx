import { Pressable, Text, View, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Icon } from '@/components/common/Icon';
import { colors } from '@/theme/colors';
import { cn } from '@/shared/utilities/cn';

export function HomeButton({
  label,
  className,
  disabled,
  onPress,
  ...props
}: Omit<PressableProps, 'children'> & { label: string; className?: string }) {
  const down = useSharedValue(0);
  const reduced = useReducedMotion();
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: down.value }],
  }));
  return (
    <View className={cn('relative', disabled && 'opacity-50')}>
      <View
        className="absolute inset-[0px] translate-y-[4px] rounded-full bg-black"
        accessible={false}
      />
      <Animated.View style={style}>
        <Pressable
          {...props}
          disabled={disabled}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: !!disabled }}
          onPressIn={() => {
            down.value = reduced ? 0 : withTiming(3, { duration: 120 });
          }}
          onPressOut={() => {
            down.value = reduced ? 0 : withTiming(0, { duration: 120 });
          }}
          className={cn(
            'min-h-[46px] min-w-[44px] flex-row items-center justify-center gap-[12px] rounded-full border-2 border-black bg-canvas px-[22px] py-[8px] active:opacity-90',
            className
          )}
        >
          <Text className="shrink text-center font-nunito-extrabold text-[14px] text-black">
            {label}
          </Text>
          <Icon
            name="arrow"
            size={18}
            color={colors.black}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}
