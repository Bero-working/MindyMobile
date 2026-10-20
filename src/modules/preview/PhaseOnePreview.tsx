import { useEffect, useState } from 'react';
import { BackHandler, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { WelcomeScreen } from '../auth/WelcomeScreen';
import { LoginScreen } from '../auth/LoginScreen';
import { RegisterScreen } from '../auth/RegisterScreen';
import { PhaseTwoPreview } from './PhaseTwoPreview';
import type { HomeProps } from '../home/types/home.type';
import { ApiError } from '@/shared/utilities/apiError';
import routes from '@/navigation/routes';
import type { NavigationProp } from '@/navigation/types';
import type { AuthResult } from '../auth/types/auth.type';
import type {
  HomeCourse,
  HomeSession,
  DataRegion,
} from '../home/types/home.type';

function PreviewHome({
  onPaymentChange,
  ...props
}: HomeProps & { onPaymentChange: (active: boolean) => void }) {
  return (
    <PhaseTwoPreview
      homeProps={props}
      onPaymentChange={onPaymentChange}
    />
  );
}

type Mode = 'menu' | 'welcome' | 'login' | 'register' | 'home' | 'courses';
type DataState = 'success' | 'loading' | 'empty' | 'error';
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 400));

function DevelopmentPreview() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [commercePaying, setCommercePaying] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('menu');
  const [status, setStatus] = useState<DataState>('success');
  const [fail, setFail] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (mode === 'menu') return false;
        setMode(mode === 'login' || mode === 'register' ? 'welcome' : 'menu');
        setMessage('');
        return true;
      }
    );
    return () => subscription.remove();
  }, [mode]);
  const onLogin = async (): Promise<AuthResult> => {
    await pause();
    if (fail)
      throw new ApiError({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Preview only',
        requestId: 'preview-auth',
      });
    return {
      user: {
        id: 'preview-student',
        displayName: t('preview.fixtureName'),
        email: 'student@example.test',
        phone: null,
        role: 'STUDENT',
        status: 'ACTIVE',
        lastLoginAt: null,
        createdAt: '2026-10-01T00:00:00Z',
      },
      accessTokenExpiresAt: '2026-10-17T09:00:00Z',
    };
  };
  const onRegister = async () => {
    await pause();
    if (fail)
      throw new ApiError({
        statusCode: 503,
        code: 'MAIL_DELIVERY_UNAVAILABLE',
        message: 'Preview only',
      });
  };
  const action = (name: string) => setMessage(t('preview.action', { name }));
  const courses: HomeCourse[] = [1500000, 1800000, 2200000, 2500000].map(
    (priceAmount, index) => ({
      id: `preview-${index}`,
      code: `DEMO-${index}`,
      title: t(`preview.course${index}`),
      description: null,
      imgUrl: null,
      priceAmount,
      category: {
        id: 'preview-category',
        name: t('home.tabs.courses'),
        slug: 'preview',
      },
    })
  );
  const session: HomeSession = {
    classId: 'preview-class',
    sessionId: 'preview-session',
    className: t('preview.className'),
    sessionTitle: t('preview.nextSession'),
    startsAt: '2026-10-18T01:00:00Z',
    accessMode: 'FULL',
  };
  const region = <T,>(data: T | null): DataRegion<T> => ({
    status:
      status === 'loading'
        ? 'loading'
        : status === 'error'
          ? 'error'
          : 'success',
    data: status === 'success' ? data : null,
    ...(status === 'error'
      ? { error: { code: 'PREVIEW_ERROR', requestId: 'preview-data' } }
      : {}),
    onRetry: () => setStatus('success'),
  });
  return (
    <View
      testID="phase-one-preview"
      className="flex-1 bg-canvas"
    >
      {(mode === 'menu' || toolsOpen) && !commercePaying && (
        <SafeAreaView
          className={
            mode === 'menu'
              ? 'bg-canvas px-[16px] pb-[8px]'
              : 'absolute inset-x-[12px] top-[0px] z-50 rounded-[16px] border border-line bg-canvas px-[16px] pb-[8px] shadow-lg'
          }
          edges={['top']}
        >
          <View className="gap-[8px]">
            <Text
              accessibilityRole="header"
              className="font-nunito-extrabold text-[18px] text-forest"
            >
              {t('preview.title')}
            </Text>
            <Text className="font-nunito text-[12px] text-muted">
              {t('preview.description')}
            </Text>
            {mode !== 'menu' && !commercePaying && (
              <Button
                testID="preview-menu-button"
                variant="ghost"
                label={t('preview.reset')}
                onPress={() => {
                  setMode('menu');
                  setToolsOpen(false);
                  setMessage('');
                }}
              />
            )}
            {(mode === 'home' || mode === 'courses') && (
              <View className="flex-row flex-wrap gap-[4px]">
                {(['success', 'loading', 'empty', 'error'] as const).map(
                  (item) => (
                    <Button
                      key={item}
                      testID={`preview-state-${item}`}
                      label={t(`preview.${item}`)}
                      variant={status === item ? 'default' : 'outline'}
                      onPress={() => setStatus(item)}
                      className={
                        item === 'loading'
                          ? 'min-w-[96px] px-[12px]'
                          : 'px-[12px]'
                      }
                    />
                  )
                )}
              </View>
            )}
            {(mode === 'login' || mode === 'register') && (
              <Button
                testID="preview-error-toggle"
                label={t('preview.failure')}
                variant={fail ? 'default' : 'outline'}
                accessibilityState={{ selected: fail }}
                onPress={() => setFail(!fail)}
              />
            )}
            {message && (
              <Text
                testID="preview-action-result"
                accessibilityLiveRegion="polite"
                className="font-nunito text-[14px] text-forest"
              >
                {message}
              </Text>
            )}
          </View>
        </SafeAreaView>
      )}
      {mode === 'menu' ? (
        <ScrollView contentContainerClassName="gap-[16px] p-[24px]">
          <Button
            testID="preview-auth-button"
            label={t('preview.auth')}
            onPress={() => {
              setMode('welcome');
              setToolsOpen(false);
            }}
          />
          <Button
            testID="preview-home-button"
            label={t('preview.home')}
            onPress={() => {
              setStatus('success');
              setMode('home');
              setToolsOpen(false);
            }}
          />
          <Button
            testID="preview-courses-button"
            label={t('preview.courses')}
            onPress={() => {
              setStatus('success');
              setMode('courses');
              setToolsOpen(false);
            }}
          />
          <Button
            testID="preview-foundation-button"
            variant="outline"
            label={t('preview.foundation')}
            onPress={() => navigation.navigate(routes.example)}
          />
        </ScrollView>
      ) : mode === 'courses' ? (
        <PhaseTwoPreview
          onPaymentChange={setCommercePaying}
          dataState={status}
          onRetry={() => setStatus('success')}
        />
      ) : mode === 'welcome' ? (
        <WelcomeScreen
          onLogin={() => setMode('login')}
          onRegister={() => setMode('register')}
        />
      ) : mode === 'login' ? (
        <LoginScreen
          onBack={() => setMode('welcome')}
          onRegister={() => setMode('register')}
          onLogin={onLogin}
          onAuthenticated={(result) =>
            setMessage(t('preview.signedIn', { role: result.user.role }))
          }
        />
      ) : mode === 'register' ? (
        <RegisterScreen
          onBack={() => setMode('welcome')}
          onLogin={() => setMode('login')}
          onRegister={onRegister}
          onResend={onRegister}
        />
      ) : (
        <PreviewHome
          onPaymentChange={setCommercePaying}
          displayName={t('preview.fixtureName')}
          courses={region(status === 'empty' ? [] : courses)}
          schedule={region(status === 'empty' ? null : session)}
          timeZone="Asia/Ho_Chi_Minh"
          asOf="2026-10-17T08:00:00Z"
          preview
          onRefresh={async () => {
            await pause();
            setStatus('success');
          }}
          actions={{
            onCourse: (id) => action(id),
            onSelectCourse: (id) => action(id),
            onSession: ({ sessionId }) => action(sessionId),
            onExplore: () => action(t('home.actions.explore')),
            onIntro: (index) =>
              action(
                t(`home.intro.${['first', 'second', 'third'][index]}.action`)
              ),
            onCompiler: () => action(t('home.compiler.action')),
            onCart: () => action(t('home.actions.cart')),
            onTab: (tab) => action(t(`home.tabs.${tab}`)),
            onMyClasses: () => action(t('home.footer.myClasses')),
          }}
        />
      )}
      {mode !== 'menu' && !commercePaying && (
        <View className="absolute bottom-[112px] left-[12px] z-50">
          <Button
            testID="preview-tools-toggle"
            label={t('preview.toolsShort')}
            accessibilityLabel={t(
              toolsOpen ? 'preview.closeTools' : 'preview.tools'
            )}
            variant="outline"
            onPress={() => setToolsOpen(!toolsOpen)}
            className="min-h-[44px] px-[12px]"
          />
        </View>
      )}
      {!!message && !toolsOpen && !commercePaying && (
        <SafeAreaView
          edges={['top']}
          pointerEvents="none"
          className="absolute inset-x-[12px] top-[0px] z-50"
        >
          <Text
            testID="preview-action-result"
            accessibilityLiveRegion="polite"
            className="rounded-[12px] bg-peach p-[12px] font-nunito text-[14px] text-black"
          >
            {message}
          </Text>
        </SafeAreaView>
      )}
    </View>
  );
}

export function PhaseOnePreview() {
  return __DEV__ ? <DevelopmentPreview /> : null;
}
