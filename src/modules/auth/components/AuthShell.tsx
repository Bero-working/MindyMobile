import { useMemo, type ReactNode, type RefObject } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
  Circle,
} from 'react-native-svg';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import { colors } from '@/theme/colors';
import mindyMascot from '@/assets/illustrations/mindy-mascot-laptop.png';

export function AuthShell({
  children,
  onBack,
  mascot = mindyMascot,
  welcome = false,
  register = false,
  scrollRef,
}: {
  children: ReactNode;
  onBack?: (() => void) | undefined;
  mascot?: ImageSourcePropType | undefined;
  welcome?: boolean;
  register?: boolean;
  scrollRef?: RefObject<ScrollView | null> | undefined;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const heroHeight = insets.top + (welcome ? 374 : register ? 184 : 204);
  const layout = useMemo(
    () => ({
      hero: { height: heroHeight },
      sheet: {
        minHeight: Math.max(0, height - heroHeight + 32),
        paddingBottom: 40 + insets.bottom,
      },
      back: { top: insets.top + 10 },
      mascot: {
        width: Math.min(welcome ? 280 : 170, width - 110),
        height: Math.min(welcome ? 280 : 170, width - 110) * 0.8,
      },
    }),
    [height, heroHeight, insets.bottom, insets.top, welcome, width]
  );
  return (
    <View
      testID="auth-shell"
      className="flex-1 bg-canvas"
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.banner}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerClassName="grow"
          testID="auth-content"
        >
          <View
            style={layout.hero}
            className="items-center justify-end overflow-hidden"
          >
            <View
              className="absolute inset-[0px]"
              accessible={false}
              pointerEvents="none"
            >
              <Svg
                width="100%"
                height="100%"
              >
                <Defs>
                  <LinearGradient
                    id="auth-fill"
                    x1="0.33"
                    y1="0"
                    x2="0.67"
                    y2="1"
                  >
                    <Stop
                      offset="0"
                      stopColor={colors.banner}
                    />
                    <Stop
                      offset="0.45"
                      stopColor={colors.logoSoft}
                    />
                    <Stop
                      offset="1"
                      stopColor={colors.sunshine}
                    />
                  </LinearGradient>
                </Defs>
                <Rect
                  width="100%"
                  height="100%"
                  fill="url(#auth-fill)"
                />
                <Circle
                  cx={50}
                  cy={insets.top + 114}
                  r={90}
                  fill={colors.canvas}
                  fillOpacity={0.35}
                />
                <Circle
                  cx={width - 40}
                  cy={insets.top + 54}
                  r={70}
                  fill={colors.canvas}
                  fillOpacity={0.3}
                />
              </Svg>
            </View>
            <Image
              testID="auth-mascot"
              source={mascot}
              resizeMode="contain"
              accessible={false}
              importantForAccessibility="no"
              style={layout.mascot}
              className={welcome ? 'mb-[50px]' : 'mb-[36px]'}
            />
          </View>
          <View
            style={layout.sheet}
            className="-mt-[32px] rounded-t-[32px] bg-canvas px-[22px] pt-[26px]"
          >
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {onBack && (
        <View
          style={layout.back}
          className="absolute left-[16px]"
        >
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            testID="auth-back-button"
            onPress={onBack}
            className="h-[46px] w-[46px] items-center justify-center rounded-full bg-canvas shadow-md shadow-forest/15"
          >
            <Icon
              name="back"
              size={20}
              color={colors.black}
            />
          </PressableScale>
        </View>
      )}
    </View>
  );
}
