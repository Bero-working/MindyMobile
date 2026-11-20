/* eslint-disable @typescript-eslint/no-require-imports */
import { deferComponent } from '@/components/common/deferComponent';
import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@/navigation/types';
import routes from '@/navigation/routes';
import type { SessionUser } from '@/modules/auth/schemas/authResponse.schema';
import { useCartQuery } from '@/modules/cart/hooks/useCartQuery';
import { useHomeQuery } from './hooks/useHomeQuery';
import { StudentHome } from './StudentHome';
import { navigateLearningTab } from '@/navigation/navigateLearningTab';

const ShoppingSheets = deferComponent(
  () =>
    (
      require('@/modules/courses/components/ShoppingSheets') as typeof import('@/modules/courses/components/ShoppingSheets')
    ).ShoppingSheets
);

export function ProductionStudentHome({ user }: { user: SessionUser }) {
  const data = useHomeQuery();
  const cart = useCartQuery();
  const navigation = useNavigation<NavigationProp>();
  const refresh = useRef(data.onRefresh);
  refresh.current = data.onRefresh;
  useEffect(() => {
    if (!navigation.addListener) return;
    return navigation.addListener('focus', () => {
      refresh.current().catch(() => {});
    });
  }, [navigation]);
  const [sheet, setSheet] = useState<'course' | 'cart' | null>(null);
  const [courseId, setCourseId] = useState('');
  const openCourse = (id: string) => {
    setCourseId(id);
    setSheet('course');
  };
  return (
    <>
      <StudentHome
        {...data}
        learningEnabled
        cartCount={cart.data?.items.length ?? 0}
        displayName={user.displayName}
        actions={{
          onCourse: openCourse,
          onSelectCourse: openCourse,
          onCart: () => setSheet('cart'),
          onExplore: () => navigation.navigate(routes.courses),
          onTab: (tab) => navigateLearningTab(navigation, tab),
          onMyClasses: () =>
            navigation.navigate(routes.myClasses, { origin: 'home' }),
          onSession: (session) =>
            navigation.navigate(routes.studentClassDetail, {
              classId: session.classId,
              sessionId: session.sessionId,
            }),
        }}
      />
      {sheet !== null && (
        <ShoppingSheets
          sheet={sheet}
          courseId={courseId}
          onOpenCart={() => setSheet('cart')}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  );
}
