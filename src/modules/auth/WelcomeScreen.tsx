import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { AuthShell } from './components/AuthShell';
import type { AuthScreenProps } from './types/auth.type';
export function WelcomeScreen({
  onLogin,
  onRegister,
  mascot,
  previewAction,
}: AuthScreenProps & {
  onLogin: () => void;
  onRegister: () => void;
  previewAction?: (() => void) | undefined;
}) {
  const { t } = useTranslation();
  return (
    <View
      testID="welcome-screen"
      className="flex-1"
    >
      <AuthShell
        mascot={mascot}
        welcome
      >
        <Text
          accessibilityRole="header"
          className="text-center font-nunito-extrabold text-[28px] tracking-[-0.56px] text-black"
        >
          {t('auth.welcome.title')}
        </Text>
        <Text className="mb-[24px] mt-[10px] text-center font-nunito text-[14.5px] leading-[23.2px] text-muted">
          {t('auth.welcome.description')}
        </Text>
        <Button
          testID="welcome-register-button"
          label={t('auth.welcome.register')}
          onPress={onRegister}
        />
        <Button
          testID="welcome-login-button"
          variant="outline"
          label={t('auth.welcome.login')}
          onPress={onLogin}
          className="mt-[12px]"
        />
        {__DEV__ && previewAction && (
          <Button
            testID="phase-one-preview-button"
            variant="ghost"
            label={t('preview.open')}
            onPress={previewAction}
            className="mt-[24px]"
          />
        )}
      </AuthShell>
    </View>
  );
}
