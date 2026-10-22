import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Icon } from './Icon';
export function ScreenState({
  title,
  description,
  onRetry,
  requestId,
  testID,
  retryTestID,
}: {
  title: string;
  description: string;
  onRetry?: (() => void) | undefined;
  requestId?: string | undefined;
  testID?: string | undefined;
  retryTestID?: string | undefined;
}) {
  const { t } = useTranslation();
  return (
    <View
      testID={testID}
      className="gap-3 rounded-3xl bg-soft p-6"
    >
      <Icon
        name="book"
        size={32}
      />
      <Text
        accessibilityRole="header"
        className="font-nunito-extrabold text-xl text-foreground"
      >
        {title}
      </Text>
      <Text
        accessibilityLiveRegion="polite"
        className="font-nunito text-base text-muted-foreground"
      >
        {description}
      </Text>
      {requestId && (
        <Text
          selectable
          className="font-nunito text-xs text-muted-foreground"
        >
          {t('common.requestId', { id: requestId })}
        </Text>
      )}
      {onRetry && (
        <Button
          testID={retryTestID}
          label={t('common.retry')}
          variant="outline"
          onPress={onRetry}
        />
      )}
    </View>
  );
}
