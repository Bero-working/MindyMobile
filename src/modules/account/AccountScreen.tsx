import { useRef, useState, type ReactNode } from 'react';
import { Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppSheet } from '@/components/common/AppSheet';
import { Icon, type IconName } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/shared/hooks/language/useI18n';
import { ApiError } from '@/shared/utilities/apiError';
import { colors } from '@/theme/colors';
import {
  LearningLayout,
  LearningState,
} from '../my-classes/components/LearningLayout';
import type { AuthResult } from '../auth/types/auth.type';
import type { DataRegion, HomeTab } from '../home/types/home.type';

function AccountRow({
  testID,
  icon,
  label,
  value,
  onPress,
  children,
  disabled = false,
  destructive = false,
}: {
  testID: string;
  icon: IconName;
  label: string;
  value?: string;
  onPress?: (() => void) | undefined;
  children?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityHint={disabled ? t('account.unavailable') : undefined}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={
        disabled
          ? 'min-h-[50px] flex-row items-center gap-[12px] px-[14px] py-[8px] opacity-60'
          : 'min-h-[50px] flex-row items-center gap-[12px] px-[14px] py-[8px]'
      }
    >
      <View className="h-[32px] w-[32px] items-center justify-center rounded-full bg-canvas">
        <Icon
          name={icon}
          size={17}
          color={destructive ? colors.headsup : colors.muted}
        />
      </View>
      <Text
        className={
          destructive
            ? 'flex-1 font-nunito-semibold text-[14.5px] text-headsup'
            : 'flex-1 font-nunito-semibold text-[14.5px] text-black'
        }
      >
        {label}
      </Text>
      {value && (
        <Text className="max-w-[100px] shrink text-right font-nunito text-[12px] text-muted">
          {value}
        </Text>
      )}
      {children ?? (
        <Text
          accessible={false}
          className="font-nunito-bold text-[17px] text-muted"
        >
          {t('schedule.next')}
        </Text>
      )}
    </PressableScale>
  );
}

export function AccountScreen({
  profile,
  onLogout,
  onTab,
  onMyClasses,
}: {
  profile: DataRegion<AuthResult['user']>;
  onLogout: () => Promise<void>;
  onTab: (tab: HomeTab) => void;
  onMyClasses: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { changeLanguage } = useI18n();
  const [sheet, setSheet] = useState<'profile' | 'language' | 'logout' | null>(
    null
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const user = profile.data;
  const open = (next: 'profile' | 'language' | 'logout') => {
    setError(null);
    setSheet(next);
  };
  const logout = async () => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      await onLogout();
      setSheet(null);
    } catch (e) {
      setError(
        e instanceof ApiError && e.requestId
          ? t('common.requestId', { id: e.requestId })
          : t('errors.generic')
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  return (
    <LearningLayout
      title={t('account.title')}
      prefix="account"
      showTitle={false}
      tintedStatusBar
      contentClassName="gap-[0px] px-[0px] pb-[0px]"
      tab="account"
      onTab={onTab}
      onRefresh={profile.onRetry}
    >
      <LearningState
        region={profile}
        prefix="account"
        empty={!user}
      >
        {user && (
          <>
            <View
              testID="account-profile-hero"
              className="items-center bg-mint px-[16px] pb-[40px] pt-[8px]"
            >
              <View
                accessibilityLabel={t('account.avatar', {
                  name: user.displayName,
                })}
                className="h-[88px] w-[88px] items-center justify-center rounded-full border-[3px] border-canvas bg-sunshine"
              >
                <Text className="font-nunito-extrabold text-[28px] text-forest">
                  {user.displayName
                    .trim()
                    .split(/\s+/)
                    .map((part) => part[0])
                    .slice(-2)
                    .join('')
                    .toUpperCase() || '?'}
                </Text>
                <View className="absolute -bottom-[4px] -right-[4px]">
                  <PressableScale
                    testID="account-avatar-camera"
                    accessibilityRole="button"
                    accessibilityLabel={t('account.changeAvatar')}
                    accessibilityHint={t('account.unavailable')}
                    accessibilityState={{ disabled: true }}
                    disabled
                    className="h-[32px] w-[32px] items-center justify-center rounded-full border border-line bg-canvas"
                  >
                    <Icon
                      name="camera"
                      size={16}
                    />
                  </PressableScale>
                </View>
              </View>
              <PressableScale
                testID="account-profile"
                accessibilityRole="button"
                accessibilityLabel={t('account.profile')}
                onPress={() => open('profile')}
                className="mt-[8px] min-h-[44px] items-center justify-center"
              >
                <Text className="text-center font-nunito-extrabold text-[20px] leading-[26px] text-canvas">
                  {user.displayName}
                </Text>
              </PressableScale>
              <Text className="text-center font-nunito text-[13.5px] leading-[20px] text-canvas">
                {user.email}
              </Text>
            </View>
            <View className="-mt-[28px] gap-[12px] rounded-t-[28px] bg-canvas px-[16px] pb-[24px] pt-[20px]">
              <View className="rounded-[18px] bg-soft py-[4px]">
                <AccountRow
                  testID="account-orders"
                  icon="bag"
                  label={t('account.orders')}
                  disabled
                />
              </View>
              <View className="rounded-[18px] bg-soft py-[4px]">
                <AccountRow
                  testID="account-edit-profile"
                  icon="edit"
                  label={t('account.editProfile')}
                  disabled
                />
                <AccountRow
                  testID="account-my-classes"
                  icon="monitor"
                  label={t('myClasses.title')}
                  onPress={onMyClasses}
                />
                <AccountRow
                  testID="account-certificates"
                  icon="award"
                  label={t('account.certificates')}
                  disabled
                />
                <AccountRow
                  testID="account-attendance"
                  icon="check-calendar"
                  label={t('account.attendance')}
                  disabled
                />
              </View>
              <View className="rounded-[18px] bg-soft py-[4px]">
                <AccountRow
                  testID="account-push"
                  icon="bell"
                  label={t('account.push')}
                  disabled
                >
                  <Switch
                    testID="account-push-switch"
                    value={false}
                    disabled
                    accessibilityLabel={t('account.push')}
                    accessibilityHint={t('account.unavailable')}
                    trackColor={{ false: colors.line, true: colors.mint }}
                    thumbColor={colors.canvas}
                  />
                </AccountRow>
                <AccountRow
                  testID="account-language"
                  icon="globe"
                  label={t('account.language')}
                  value={t(
                    i18n.language === 'vi-VN'
                      ? 'account.languages.vi-VN'
                      : 'account.languages.en-EN'
                  )}
                  onPress={() => open('language')}
                />
                <AccountRow
                  testID="account-help"
                  icon="help"
                  label={t('account.help')}
                  disabled
                />
                <AccountRow
                  testID="account-policy"
                  icon="document"
                  label={t('account.policy')}
                  disabled
                />
              </View>
              <View className="rounded-[18px] bg-soft py-[4px]">
                <AccountRow
                  testID="account-logout"
                  icon="logout"
                  label={t('account.logout')}
                  destructive
                  onPress={() => open('logout')}
                />
              </View>
            </View>
          </>
        )}
      </LearningState>
      {sheet && (
        <AppSheet
          locked={pending}
          onClose={() => setSheet(null)}
        >
          <View className="gap-[16px]">
            <Text
              accessibilityRole="header"
              className="font-nunito-extrabold text-[20px] text-forest"
            >
              {t(
                sheet === 'profile'
                  ? 'account.profile'
                  : sheet === 'language'
                    ? 'account.language'
                    : 'account.confirmLogout'
              )}
            </Text>
            {sheet === 'profile' && user && (
              <View
                testID="account-profile-fields"
                className="gap-[12px] rounded-[18px] bg-soft p-[16px]"
              >
                {(['displayName', 'email', 'phone', 'role'] as const).map(
                  (field) => (
                    <View key={field}>
                      <Text className="font-nunito text-[12.5px] text-muted">
                        {t(`account.fields.${field}`)}
                      </Text>
                      <Text
                        selectable
                        className="font-nunito-bold text-[14.5px] text-forest"
                      >
                        {field === 'role'
                          ? t(`account.roles.${user.role}`)
                          : user[field] || t('account.notUpdated')}
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}
            {sheet === 'language' &&
              (['vi-VN', 'en-EN'] as const).map((lang) => (
                <Button
                  key={lang}
                  testID={`account-language-${lang}`}
                  label={t(`account.languages.${lang}`)}
                  variant={i18n.language === lang ? 'default' : 'outline'}
                  accessibilityState={{ selected: i18n.language === lang }}
                  onPress={() => {
                    changeLanguage(lang)
                      .then(() => setSheet(null))
                      .catch(() => setError(t('errors.generic')));
                  }}
                />
              ))}
            {error && (
              <Text
                accessibilityRole="alert"
                className="font-nunito text-[14px] text-headsup"
              >
                {error}
              </Text>
            )}
            {sheet === 'logout' && (
              <Button
                testID="account-logout-confirm"
                label={t('account.logout')}
                loading={pending}
                variant="solid"
                className="bg-headsup"
                onPress={() => {
                  logout().catch(() => {});
                }}
              />
            )}
            <Button
              testID="account-sheet-close"
              label={t(sheet === 'logout' ? 'learning.cancel' : 'common.close')}
              variant="outline"
              disabled={pending}
              onPress={() => setSheet(null)}
            />
          </View>
        </AppSheet>
      )}
    </LearningLayout>
  );
}
