import { useEffect } from 'react';
import { BackHandler, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PressableScale } from '@/components/common/PressableScale';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from './components/AuthShell';
import { FormFeedback } from './components/FormFeedback';
import { useRegisterController } from './hooks/useRegisterController';
import type { RegisterProps, RegisterValues } from './types/auth.type';
import { useAuthFocus } from './hooks/useAuthFocus';

const fields = [
  'displayName',
  'email',
  'phone',
  'password',
  'confirmPassword',
] as const;
const fieldIds: Record<keyof RegisterValues, string> = {
  displayName: 'display-name',
  email: 'email',
  phone: 'phone',
  password: 'password',
  confirmPassword: 'confirm-password',
};
export function RegisterScreen(props: RegisterProps) {
  const { t } = useTranslation();
  const focus = useAuthFocus<keyof RegisterValues>();
  const controller = useRegisterController(props, focus.focus);
  const { form } = controller;
  useEffect(() => {
    if (!controller.email) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        props.onLogin?.();
        return true;
      }
    );
    return () => subscription.remove();
  }, [controller.email, props.onLogin]);
  return (
    <View
      testID="register-screen"
      className="flex-1"
    >
      <AuthShell
        register={!controller.email}
        scrollRef={focus.scrollRef}
        mascot={props.mascot}
        onBack={form.pending || controller.email ? undefined : props.onBack}
      >
        {controller.email ? (
          <View
            testID="register-check-email"
            className="gap-[0px]"
          >
            <Text
              accessibilityRole="header"
              className="text-center font-nunito-extrabold text-[26px] tracking-[-0.52px] text-black"
            >
              {t('auth.register.checkEmailTitle')}
            </Text>
            <Text className="mb-[24px] mt-[10px] text-center font-nunito text-[14.5px] leading-[23.2px] text-muted">
              {t('auth.register.checkEmailDescription')}
              {'\n'}
              <Text className="font-nunito-bold text-black">
                {controller.email}
              </Text>
            </Text>
            {props.onLogin && (
              <Button
                testID="register-login-link"
                label={t('auth.register.backToLogin')}
                onPress={props.onLogin}
                disabled={controller.resending}
              />
            )}
            <Button
              testID="register-resend-button"
              label={t('auth.register.resend')}
              loading={controller.resending}
              disabled={!props.onResend}
              onPress={controller.resend}
              variant="outline"
              className="mt-[12px]"
            />
            <View className="mt-[12px]">
              <FormFeedback
                testID="register-resend-feedback"
                failure={controller.resendError}
              />
            </View>
            {controller.resent && (
              <Text
                testID="register-resend-feedback"
                accessibilityLiveRegion="polite"
                className="text-center font-nunito-bold text-[13.5px] text-mint"
              >
                {t('auth.register.resendSuccess')}
              </Text>
            )}
          </View>
        ) : (
          <>
            <Text
              accessibilityRole="header"
              className="text-center font-nunito-extrabold text-[26px] tracking-[-0.52px] text-black"
            >
              {t('auth.register.title')}
            </Text>
            <Text className="mb-[18px] mt-[8px] text-center font-nunito text-[14px] leading-[21px] text-muted">
              {t('auth.register.description')}
              {'\n'}
              <Text className="font-nunito-extrabold text-black">
                {t('auth.register.ready')}
              </Text>
            </Text>
            <FormFeedback
              failure={form.failure}
              testID="register-form-error"
            />
            {fields.map((field, index) => (
              <Input
                key={field}
                ref={(ref) => {
                  focus.refs.current[field] = ref;
                }}
                label={t(`auth.fields.${field}`)}
                placeholder={
                  field === 'phone'
                    ? undefined
                    : t(
                        `auth.placeholders.${field === 'confirmPassword' ? 'password' : field}`
                      )
                }
                icon={
                  field === 'email'
                    ? 'mail'
                    : field === 'phone'
                      ? 'phone'
                      : field === 'displayName'
                        ? 'user'
                        : 'lock'
                }
                password={field === 'password' || field === 'confirmPassword'}
                testID={`register-${fieldIds[field]}-input`}
                value={form.values[field]}
                onChangeText={(value) => form.change(field, value)}
                onBlur={() => form.validate(field)}
                error={form.errors[field] ? t(form.errors[field]) : undefined}
                editable={!form.pending}
                autoCorrect={false}
                autoCapitalize={field === 'displayName' ? 'words' : 'none'}
                keyboardType={
                  field === 'email'
                    ? 'email-address'
                    : field === 'phone'
                      ? 'phone-pad'
                      : 'default'
                }
                autoComplete={
                  field === 'email'
                    ? 'email'
                    : field === 'phone'
                      ? 'tel'
                      : field === 'displayName'
                        ? 'name'
                        : 'new-password'
                }
                textContentType={
                  field === 'email'
                    ? 'emailAddress'
                    : field === 'phone'
                      ? 'telephoneNumber'
                      : field === 'displayName'
                        ? 'name'
                        : 'newPassword'
                }
                returnKeyType={index === fields.length - 1 ? 'go' : 'next'}
                submitBehavior="submit"
                onSubmitEditing={() => {
                  const next = fields[index + 1];
                  if (next) focus.focus(next);
                  else form.send();
                }}
              />
            ))}
            {!props.onRegister && (
              <Text className="font-nunito text-[14px] text-muted">
                {t('auth.integrationUnavailable')}
              </Text>
            )}
            <Button
              testID="register-submit-button"
              label={t('auth.register.submit')}
              loading={form.pending}
              disabled={!props.onRegister}
              onPress={form.send}
              className="mt-[6px]"
            />
            {props.onLogin && (
              <View className="mt-[22px]">
                <PressableScale
                  testID="register-login-link"
                  accessibilityRole="link"
                  accessibilityLabel={t('auth.register.loginLink')}
                  accessibilityState={{ disabled: form.pending }}
                  disabled={form.pending}
                  onPress={props.onLogin}
                  className="min-h-[44px] items-center justify-center"
                >
                  <Text className="text-center font-nunito text-[14.5px] text-black">
                    {t('auth.register.loginPrompt')}{' '}
                    <Text className="font-nunito-extrabold text-mint underline">
                      {t('auth.register.loginAction')}
                    </Text>
                  </Text>
                </PressableScale>
              </View>
            )}
          </>
        )}
      </AuthShell>
    </View>
  );
}
