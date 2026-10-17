import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ScreenState } from '@/components/common/ScreenState';
import { useAuthActions } from '@/modules/auth/hooks/useAuthSession';
import type { SessionUser } from '@/modules/auth/schemas/authResponse.schema';
import { useHomeQuery } from './hooks/useHomeQuery';
import { StudentHome } from './StudentHome';

export function ProductionStudentHome({ user }: { user: SessionUser }) {
  const { t } = useTranslation();
  const data = useHomeQuery();
  const { signOut, signingOut, logoutError } = useAuthActions();
  return (
    <StudentHome
      {...data}
      displayName={user.displayName}
      sessionControls={
        <View className="mt-4 gap-3">
          {logoutError && (
            <ScreenState
              title={t('auth.session.logout')}
              description={t('errors.generic')}
              requestId={logoutError.requestId}
            />
          )}
          <Button
            testID="session-logout"
            label={t('auth.session.logout')}
            disabled={signingOut}
            onPress={() => {
              signOut().catch(() => {});
            }}
          />
        </View>
      }
    />
  );
}
