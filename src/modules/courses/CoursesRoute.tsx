import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/state/store';
import routes from '@/navigation/routes';
import type { NavigationProp } from '@/navigation/types';
import { ScreenState } from '@/components/common/ScreenState';
import { CoursesScreen } from './CoursesScreen';
import { ShoppingSheets } from './components/ShoppingSheets';
import { FilterSheet } from './components/FilterSheet';
import { useCatalogQuery } from './hooks/useCatalogQuery';
import { useCartQuery } from '@/modules/cart/hooks/useCartQuery';
import type { DeliveryMode } from './types/courses.type';
export function CoursesRoute() {
  const user = useStore((s) => s.sessionUser);
  const { t } = useTranslation();
  if (user?.role !== 'STUDENT')
    return (
      <SafeAreaView className="flex-1 bg-canvas p-6">
        <ScreenState
          title={t('auth.login.title')}
          description={t('home.authRequired')}
        />
      </SafeAreaView>
    );
  return <StudentCourses />;
}
function StudentCourses() {
  const navigation = useNavigation<NavigationProp>();
  const [sheet, setSheet] = useState<'course' | 'cart' | 'filter' | null>(null);
  const [courseId, setCourseId] = useState('');
  const [page, setPage] = useState(1);
  const [categoryId, setCategory] = useState<string | null>(null);
  const [deliveryMode, setMode] = useState<DeliveryMode>();
  const [draftMode, setDraft] = useState<DeliveryMode>();
  const catalog = useCatalogQuery({
    page,
    categoryId,
    deliveryMode,
    filterDraft: sheet === 'filter' ? { deliveryMode: draftMode } : undefined,
  });
  const cart = useCartQuery();
  const applyFilter = (filter: { deliveryMode?: DeliveryMode }) => {
    setMode(filter.deliveryMode);
    setPage(1);
  };
  return (
    <>
      <CoursesScreen
        courses={catalog.courses}
        recommendations={catalog.recommendations}
        categories={catalog.categories}
        total={catalog.total}
        page={page}
        categoryId={categoryId}
        deliveryMode={deliveryMode}
        cartCount={cart.data?.items.length ?? 0}
        refreshing={catalog.refreshing}
        onRefresh={() => {
          catalog.refetchAll().catch(() => {});
          cart.refetch().catch(() => {});
        }}
        onPage={setPage}
        onCategory={(id) => {
          setCategory(id);
          setPage(1);
        }}
        onFilter={applyFilter}
        onPreviewFilter={(mode) => {
          setDraft(mode);
          setSheet('filter');
        }}
        onOpenCourse={(id) => {
          setCourseId(id);
          setSheet('course');
        }}
        onCart={() => setSheet('cart')}
        onHome={() => navigation.navigate(routes.studentHome)}
      />
      {sheet === 'filter' && (
        <FilterSheet
          deliveryMode={deliveryMode}
          total={catalog.filterTotal}
          onPreview={setDraft}
          onApply={applyFilter}
          onClose={() => setSheet(null)}
        />
      )}
      <ShoppingSheets
        sheet={sheet === 'course' || sheet === 'cart' ? sheet : null}
        courseId={courseId}
        onOpenCart={() => setSheet('cart')}
        onClose={() => setSheet(null)}
      />
    </>
  );
}
