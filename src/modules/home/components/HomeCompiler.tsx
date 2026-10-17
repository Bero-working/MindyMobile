import { useMemo } from 'react';
import { Platform, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HomeButton } from './HomeButton';
import { cn } from '@/shared/utilities/cn';
export function HomeCompiler({
  name,
  onPress,
}: {
  name: string;
  onPress?: (() => void) | undefined;
}) {
  const { t } = useTranslation();
  const { fontScale } = useWindowDimensions();
  const enlarged = fontScale > 1.2;
  const mono = useMemo(
    () => ({ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }),
    []
  );
  return (
    <View
      testID="home-compiler-section"
      className="relative mx-[16px] mt-[44px]"
    >
      <View
        className={cn(
          'min-h-[280px] rounded-[32px] bg-logo-soft py-[26px] pr-[18px]',
          enlarged ? 'px-[18px]' : 'ml-[52px] pl-[110px]'
        )}
      >
        <Text
          accessibilityRole="header"
          className="mb-[14px] font-nunito-extrabold text-[21px] leading-[25.2px] text-black"
        >
          {t('home.sections.compiler')}
        </Text>
        {(['one', 'two', 'three'] as const).map((key, index) => (
          <Text
            key={key}
            className={cn(
              'border-t border-forest/20 py-[11px] font-nunito-semibold text-[14.5px] leading-[19.6px] text-black',
              index === 2 && 'border-b'
            )}
          >
            {t(`home.compiler.benefits.${key}`)}
          </Text>
        ))}
        <View className="mt-[16px] self-end">
          <HomeButton
            testID="home-compiler-button"
            label={t('home.compiler.action')}
            disabled={!onPress}
            accessibilityHint={
              !onPress ? t('home.actions.unavailable') : undefined
            }
            onPress={onPress}
            className="min-h-[44px] px-[18px]"
          />
        </View>
      </View>
      <View
        testID="home-terminal"
        accessibilityLabel={t('home.compiler.illustration')}
        accessible
        importantForAccessibility="yes"
        className={cn(
          'w-[154px] rotate-[-4deg] overflow-hidden rounded-[14px] bg-forest-deep shadow-xl shadow-forest-deep/35',
          enlarged
            ? 'mt-[20px] self-center'
            : 'absolute bottom-1/2 left-[0px] translate-y-1/2'
        )}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View className="flex-row items-center gap-[4px] bg-forest-night px-[9px] py-[8px]">
            <View className="h-[7px] w-[7px] rounded-full bg-headsup" />
            <View className="h-[7px] w-[7px] rounded-full bg-sunshine" />
            <View className="h-[7px] w-[7px] rounded-full bg-mint" />
            <Text
              style={mono}
              className="ml-[2px] text-[8px] text-banner"
            >
              {t('home.compiler.terminal')}
            </Text>
          </View>
          <View className="px-[10px] pb-[14px] pt-[10px]">
            {(
              [
                'command',
                'running',
                'hello',
                'test1',
                'test2',
                'test3',
                'complete',
              ] as const
            ).map((key) => (
              <Text
                key={key}
                style={mono}
                numberOfLines={1}
                className={cn(
                  'text-[8.5px] leading-[15.3px]',
                  key === 'running'
                    ? 'text-banner'
                    : key.startsWith('test')
                      ? 'text-aqua'
                      : key === 'complete'
                        ? 'text-action'
                        : 'text-canvas'
                )}
              >
                {t(`home.compiler.${key}`, { name })}
              </Text>
            ))}
            <View className="flex-row items-center">
              <Text
                style={mono}
                className="text-[8.5px] leading-[15.3px] text-sunshine"
              >
                {t('home.compiler.prompt')}
              </Text>
              <View className="h-[10px] w-[5px] bg-canvas" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
