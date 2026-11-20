import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { colors } from '@/theme/colors';

/**
 * Sub-page header from the Student Home base: round back button, centred
 * title and an optional 40px trailing control (spacer keeps the title centred).
 */
export function SubPageHeader({
  title,
  prefix,
  onBack,
  trailing,
}: {
  title: string;
  prefix: string;
  onBack: () => void;
  trailing?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <View className="z-20 flex-row items-center px-[16px] py-[8px]">
      <PressableScale
        testID={`${prefix}-back`}
        accessibilityRole="button"
        accessibilityLabel={t('learning.back')}
        onPress={onBack}
        className="h-[40px] w-[40px] items-center justify-center rounded-full border border-line bg-canvas"
      >
        <Icon
          name="back"
          size={20}
          color={colors.forest}
        />
      </PressableScale>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        className="flex-1 px-[8px] text-center font-nunito-extrabold text-[18px] text-black"
      >
        {title}
      </Text>
      {trailing ?? (
        <View
          testID={`${prefix}-header-spacer`}
          className="w-[40px]"
        />
      )}
    </View>
  );
}
