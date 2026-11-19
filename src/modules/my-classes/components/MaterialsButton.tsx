import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';

export function MaterialsButton({
  testID,
  compact = false,
  onPress,
}: {
  testID: string;
  compact?: boolean;
  onPress: (() => void) | undefined;
}) {
  const { t } = useTranslation();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={t('classDetail.session.materials')}
      accessibilityHint={onPress ? undefined : t('account.unavailable')}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      className={`min-h-[54px] flex-row items-center rounded-full bg-forest py-[8px] shadow-lg shadow-forest/25 ${!onPress ? 'opacity-60' : ''} ${compact ? 'gap-[6px] px-[8px]' : 'gap-[10px] px-[16px]'}`}
    >
      <View
        className={`items-center justify-center rounded-full bg-mint ${compact ? 'h-[28px] w-[28px]' : 'h-[36px] w-[36px]'}`}
      >
        <Icon
          name="document"
          light
          size={compact ? 17 : 18}
        />
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        className={`shrink font-nunito-extrabold text-canvas ${compact ? 'text-[13px]' : 'text-[14px]'}`}
      >
        {t('classDetail.session.materials')}
      </Text>
    </PressableScale>
  );
}
