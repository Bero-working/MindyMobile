import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import routes from '@/navigation/routes';
import type { NavigationProp } from '@/navigation/types';
import { ScreenState } from '@/components/common/ScreenState';
import { Button } from '@/components/ui/Button';
import { WelcomeScreen } from './WelcomeScreen';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { useAuthActions } from './hooks/useAuthSession';
import { useStore } from '@/state/store';
import { ProductionStudentHome } from '@/modules/home/ProductionStudentHome';

export function WelcomeRoute() {
  const navigation = useNavigation<NavigationProp>();
  const user = useStore((state) => state.sessionUser);
  if (user && user.role !== 'STUDENT') return <StaffSession />;
  return (
    <WelcomeScreen
      onLogin={() => navigation.navigate(routes.login)}
      onRegister={() => navigation.navigate(routes.register)}
      previewAction={
        __DEV__ ? () => navigation.navigate(routes.phaseOnePreview) : undefined
      }
    />
  );
}
export function LoginRoute() {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuthActions();
  return (
    <LoginScreen
      onLogin={login}
      onBack={() =>
        navigation.canGoBack()
          ? navigation.goBack()
          : navigation.navigate(routes.welcome)
      }
      onRegister={() => navigation.navigate(routes.register)}
    />
  );
}
export function RegisterRoute() {
  const navigation = useNavigation<NavigationProp>();
  const { register, resend } = useAuthActions();
  return (
    <RegisterScreen
      onRegister={register}
      onResend={resend}
      onBack={() => navigation.goBack()}
      onLogin={() => navigation.navigate(routes.login)}
    />
  );
}
function StaffSession() {
  const { t } = useTranslation();
  const { signOut, signingOut, logoutError } = useAuthActions();
  return (
    <SafeAreaView className="flex-1 justify-center gap-6 bg-canvas p-6">
      <ScreenState
        title={t('auth.brandName')}
        description={t('auth.session.staff')}
      />
      {logoutError && (
        <ScreenState
          title={t('auth.session.logout')}
          description={t('errors.generic')}
          requestId={logoutError.requestId}
        />
      )}
      <Button
        label={t('auth.session.logout')}
        disabled={signingOut}
        onPress={() => {
          signOut().catch(() => {});
        }}
      />
    </SafeAreaView>
  );
}
export function StudentHomeRoute() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const user = useStore((state) => state.sessionUser);
  if (user?.role === 'STUDENT') return <ProductionStudentHome user={user} />;
  // A registered destination is never permission to display student data.
  return (
    <SafeAreaView className="flex-1 justify-center gap-6 bg-canvas p-6">
      <ScreenState
        title={t('auth.login.title')}
        description={t('home.authRequired')}
      />
      <Button
        label={t('auth.welcome.login')}
        onPress={() =>
          navigation.reset({ index: 0, routes: [{ name: routes.login }] })
        }
      />
    </SafeAreaView>
  );
}
