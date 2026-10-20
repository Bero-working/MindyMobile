import { View } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@/navigation/types';
import routes from '@/navigation/routes';
import { ShoppingSheets } from '@/modules/courses/components/ShoppingSheets';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ScreenState } from '@/components/common/ScreenState';
import { useAuthActions } from '@/modules/auth/hooks/useAuthSession';
import type { SessionUser } from '@/modules/auth/schemas/authResponse.schema';
import { useCartQuery } from '@/modules/cart/hooks/useCartQuery';
import { useHomeQuery } from './hooks/useHomeQuery';
import { StudentHome } from './StudentHome';

export function ProductionStudentHome({ user }: { user: SessionUser }) {
  const { t } = useTranslation();
  const data = useHomeQuery();
  const cart = useCartQuery();
  const navigation = useNavigation<NavigationProp>();
  const [sheet, setSheet] = useState<'course' | 'cart' | null>(null);
  const [courseId, setCourseId] = useState('');
  const openCourse = (id: string) => {
    setCourseId(id);
    setSheet('course');
  };
  const { signOut, signingOut, logoutError } = useAuthActions();
  return (
    <>
      <StudentHome
        {...data}
        cartCount={cart.data?.items.length ?? 0}
        displayName={user.displayName}
        actions={{
          onCourse: openCourse,
          onSelectCourse: openCourse,
          onCart: () => setSheet('cart'),
          onExplore: () => navigation.navigate(routes.courses),
          onTab: (tab) => {
            if (tab === 'courses') navigation.navigate(routes.courses);
          },
        }}
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
      <ShoppingSheets
        sheet={sheet}
        courseId={courseId}
        onOpenCart={() => setSheet('cart')}
        onClose={() => setSheet(null)}
      />
    </>
  );
}
