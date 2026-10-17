import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PressableScale } from '@/components/common/PressableScale';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from './components/AuthShell';
import { FormFeedback } from './components/FormFeedback';
import { useLoginController } from './hooks/useLoginController';
import type { LoginProps, LoginValues } from './types/auth.type';
import { useAuthFocus } from './hooks/useAuthFocus';
export function LoginScreen(props: LoginProps) {
  const { t } = useTranslation();
  const focus = useAuthFocus<keyof LoginValues>();
  const form = useLoginController(props, focus.focus);
  return (
    <View
      testID="login-screen"
      className="flex-1"
    >
      <AuthShell
        scrollRef={focus.scrollRef}
        onBack={form.pending ? undefined : props.onBack}
        mascot={props.mascot}
      >
        <Text
          accessibilityRole="header"
          className="mb-[18px] text-center font-nunito-extrabold text-[26px] tracking-[-0.52px] text-black"
        >
          {t('auth.login.title')}
        </Text>
        <FormFeedback
          failure={form.failure}
          testID="login-form-error"
        />
        <Input
          ref={(ref) => {
            focus.refs.current.email = ref;
          }}
          label={t('auth.fields.email')}
          placeholder={t('auth.placeholders.email')}
          icon="mail"
          testID="login-email-input"
          value={form.values.email}
          onChangeText={(value) => form.change('email', value)}
          onBlur={() => form.validate('email')}
          error={form.errors.email ? t(form.errors.email) : undefined}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => focus.focus('password')}
          editable={!form.pending}
        />
        <Input
          ref={(ref) => {
            focus.refs.current.password = ref;
          }}
          label={t('auth.fields.password')}
          placeholder={t('auth.placeholders.password')}
          icon="lock"
          password
          testID="login-password-input"
          value={form.values.password}
          onChangeText={(value) => form.change('password', value)}
          onBlur={() => form.validate('password')}
          error={form.errors.password ? t(form.errors.password) : undefined}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={form.send}
          editable={!form.pending}
        />
        {!props.onLogin && (
          <Text className="font-nunito text-[14px] text-muted">
            {t('auth.integrationUnavailable')}
          </Text>
        )}
        <Button
          testID="login-submit-button"
          label={t('auth.login.submit')}
          loading={form.pending}
          disabled={!props.onLogin}
          onPress={form.send}
          className="mt-[6px]"
        />
        {props.onRegister && (
          <View className="mt-[22px]">
            <PressableScale
              testID="login-register-link"
              accessibilityRole="link"
              accessibilityLabel={t('auth.login.registerLink')}
              accessibilityState={{ disabled: form.pending }}
              disabled={form.pending}
              onPress={props.onRegister}
              className="min-h-[44px] items-center justify-center"
            >
              <Text className="text-center font-nunito text-[14.5px] text-black">
                {t('auth.login.registerPrompt')}{' '}
                <Text className="font-nunito-extrabold text-mint underline">
                  {t('auth.login.registerAction')}
                </Text>
              </Text>
            </PressableScale>
          </View>
        )}
      </AuthShell>
    </View>
  );
}
