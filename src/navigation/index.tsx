import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useTheme } from '@sohantalukder/rn-kit';
import type { RootStackParamList } from './types';
import routes from './routes';
import { screenOptions } from './screenOptions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ScreenState } from '@/components/common/ScreenState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthSession } from '@/modules/auth/hooks/useAuthSession';
import { useStore } from '@/state/store';
import {
  Example,
  Splash,
  WelcomeRoute,
  LoginRoute,
  RegisterRoute,
  StudentHomeRoute,
  PhaseOnePreview,
} from '@/modules';
const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  const { navigationTheme, variant } = useTheme();
  const { t } = useTranslation();
  const session = useAuthSession();
  const user = useStore((state) => state.sessionUser);
  const generation = useStore((state) => state.generation);
  const hasSessionHistory = useStore((state) => state.hasSessionHistory);
  if (session.pending || session.error)
    return (
      <SafeAreaView className="flex-1 justify-center bg-canvas p-6">
        {session.pending ? (
          <Skeleton
            testID="session-loading"
            className="h-24 rounded-3xl"
          />
        ) : (
          <ScreenState
            testID="session-error"
            title={t('auth.brandName')}
            description={t('auth.session.error')}
            requestId={session.error?.requestId}
            onRetry={() => {
              session.retry();
            }}
          />
        )}
      </SafeAreaView>
    );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={
          user?.role === 'STUDENT'
            ? routes.studentHome
            : !user && hasSessionHistory
              ? routes.login
              : routes.welcome
        }
        key={`${variant}:${generation}:${user?.id ?? 'guest'}:${user?.role ?? 'guest'}`}
        screenOptions={screenOptions}
      >
        {user?.role !== 'STUDENT' && (
          <Stack.Screen
            component={WelcomeRoute}
            name={routes.welcome}
          />
        )}
        {!user && (
          <Stack.Screen
            component={LoginRoute}
            name={routes.login}
          />
        )}
        {!user && (
          <Stack.Screen
            component={RegisterRoute}
            name={routes.register}
          />
        )}
        {user?.role === 'STUDENT' && (
          <Stack.Screen
            component={StudentHomeRoute}
            name={routes.studentHome}
          />
        )}
        {__DEV__ && (
          <Stack.Screen
            component={PhaseOnePreview}
            name={routes.phaseOnePreview}
          />
        )}
        <Stack.Screen
          component={Splash}
          name={routes.splash}
        />
        <Stack.Screen
          component={Example}
          name={routes.example}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
