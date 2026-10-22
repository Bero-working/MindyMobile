import { Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';

export function MeetingButton({
  testID,
  joining,
  onPress,
}: {
  testID: string;
  joining: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const compact = width <= 360 || fontScale >= 1.3;
  return (
    <View className="shrink">
      <PressableScale
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={t('classDetail.join')}
        accessibilityState={{ busy: joining, disabled: joining }}
        disabled={joining}
        onPress={onPress}
        className={`min-h-[54px] flex-row items-center rounded-full border border-line bg-canvas p-[8px] shadow-lg shadow-forest/20 ${compact ? 'gap-[6px]' : 'gap-[10px] pr-[16px]'}`}
      >
        <View
          className={`items-center justify-center rounded-full bg-mint ${compact ? 'h-[28px] w-[28px]' : 'h-[36px] w-[36px]'}`}
        >
          <Icon
            name="video"
            light
            size={compact ? 17 : 20}
          />
        </View>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          className={`shrink font-nunito-extrabold text-forest ${compact ? 'text-[13px]' : 'text-[14px]'}`}
        >
          {t(joining ? 'learning.refreshing' : 'classDetail.join')}
        </Text>
      </PressableScale>
    </View>
  );
}
