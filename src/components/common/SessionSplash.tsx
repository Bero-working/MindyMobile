import { ActivityIndicator, Image, StatusBar, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import mindyMascot from '@/assets/illustrations/mindy-mascot-laptop.png';
import { colors } from '@/theme/colors';

/** Full-screen brand splash shown while the auth session is being restored. */
export function SessionSplash() {
  const { t } = useTranslation();
  return (
    <View
      testID="session-loading"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loading')}
      className="flex-1 items-center justify-center gap-[20px] bg-mint px-[24px]"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.mint}
      />
      <Image
        testID="session-loading-mascot"
        source={mindyMascot}
        resizeMode="contain"
        accessible={false}
        className="aspect-[540/432] w-[220px]"
      />
      <View className="items-center">
        <Text className="font-nunito-extrabold text-[28px] leading-[30px] tracking-[-0.3px] text-canvas">
          {t('home.brand.name')}
        </Text>
        <Text className="mt-[4px] font-nunito-extrabold text-[13px] leading-[14px] tracking-[3px] text-sunshine">
          {t('home.brand.subtitle')}
        </Text>
      </View>
      <ActivityIndicator color={colors.canvas} />
    </View>
  );
}
