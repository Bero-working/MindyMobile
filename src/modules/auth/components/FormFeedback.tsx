import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FormFailure } from '../hooks/useAuthForm';
export function FormFeedback({
  failure,
  testID,
}: {
  failure: FormFailure | null;
  testID: string;
}) {
  const { t } = useTranslation();
  if (!failure) return null;
  return (
    <View
      testID={testID}
      accessibilityLiveRegion="polite"
      className="mb-[14px] gap-[8px] rounded-[14px] bg-peach px-[14px] py-[12px]"
    >
      <Text
        accessibilityRole="alert"
        className="font-nunito-bold text-[13.5px] text-headsup"
      >
        {t(failure.key)}
      </Text>
      {failure.requestId && (
        <Text
          selectable
          className="font-nunito text-[12px] text-forest"
        >
          {t('common.requestId', { id: failure.requestId })}
        </Text>
      )}
    </View>
  );
}
