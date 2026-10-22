// Adapted from Mobilecn-UI/nativecn-ui components/Button.tsx (MIT).
import {
  ActivityIndicator,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { cva, type VariantProps } from 'class-variance-authority';
import { PressableScale } from '@/components/common/PressableScale';
import { cn } from '@/shared/utilities/cn';
import { colors } from '@/theme/colors';

const buttonVariants = cva(
  'min-h-[54px] min-w-[44px] flex-row items-center justify-center gap-[8px] rounded-full px-[24px] py-[12px]',
  {
    variants: {
      variant: {
        default: 'bg-primary shadow-lg shadow-forest/25',
        outline: 'border-[1.5px] border-banner bg-canvas',
        solid: 'bg-forest',
        action: 'bg-action',
        ghost: 'bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);
type Props = Omit<PressableProps, 'children'> &
  VariantProps<typeof buttonVariants> & {
    label: string;
    loading?: boolean;
    className?: string;
  };
export function Button({
  label,
  loading = false,
  disabled = false,
  className,
  variant,
  onPress,
  ...props
}: Props) {
  const blocked = loading || !!disabled;
  return (
    <PressableScale
      key={variant ?? 'default'}
      {...props}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityState={{
        ...props.accessibilityState,
        disabled: blocked,
        busy: loading,
      }}
      disabled={blocked}
      onPress={blocked ? undefined : onPress}
      className={cn(
        buttonVariants({ variant }),
        blocked && 'opacity-50',
        className
      )}
    >
      {(!variant || variant === 'default') && (
        <View
          className="absolute inset-[0px] overflow-hidden rounded-full"
          pointerEvents="none"
          accessible={false}
        >
          <Svg
            width="100%"
            height="100%"
            accessible={false}
          >
            <Defs>
              <LinearGradient
                id="button-fill"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <Stop
                  offset="0"
                  stopColor={colors.mint}
                />
                <Stop
                  offset="1"
                  stopColor={colors.forest}
                />
              </LinearGradient>
            </Defs>
            <Rect
              width="100%"
              height="100%"
              fill="url(#button-fill)"
            />
          </Svg>
        </View>
      )}
      {loading && (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? colors.forest
              : colors.canvas
          }
        />
      )}
      <Text
        className={cn(
          'shrink grow text-center font-nunito-extrabold text-[16px]',
          variant === 'outline' || variant === 'ghost' || variant === 'action'
            ? 'text-black'
            : 'text-primary-foreground'
        )}
      >
        {label}
      </Text>
    </PressableScale>
  );
}
