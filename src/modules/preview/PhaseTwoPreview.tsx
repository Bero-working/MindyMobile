import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CoursesScreen } from '../courses/CoursesScreen';
import { CourseSheet } from '../courses/components/CourseSheet';
import { FilterSheet } from '../courses/components/FilterSheet';
import { CartSheet } from '../cart/components/CartSheet';
import { useCourseSelection } from '../courses/hooks/useCourseSelection';
import { StudentHome } from '../home/StudentHome';
import type { HomeProps, DataRegion } from '../home/types/home.type';
type PreviewProps = {
  homeProps?: HomeProps;
  dataState?: 'success' | 'empty' | 'loading' | 'error';
  onRetry?: () => void;
  onPaymentChange?: ((active: boolean) => void) | undefined;
};
import type { DeliveryMode } from '../courses/types/courses.type';
import type { Cart, CartItem } from '../cart/types/cart.type';
import type { PaymentOrder } from '../payment/types/payment.type';
import { commerceFixtures } from './commerceFixtures';
import PreviewPayment from './PreviewPayment';
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 350));
export function PhaseTwoPreview(props: PreviewProps) {
  return __DEV__ ? <CommercePreview {...props} /> : null;
}
function CommercePreview({
  homeProps,
  dataState = 'success',
  onRetry,
  onPaymentChange,
}: PreviewProps) {
  const { t } = useTranslation();
  const fixtures = useMemo(commerceFixtures, []);
  const [tab, setTab] = useState<'home' | 'courses'>(
    homeProps ? 'home' : 'courses'
  );
  const [page, setPage] = useState(1);
  const [categoryId, setCategory] = useState<string | null>(null);
  const [deliveryMode, setMode] = useState<DeliveryMode>();
  const [draft, setDraft] = useState<DeliveryMode>();
  const [sheet, setSheet] = useState<'course' | 'cart' | 'filter' | null>(null);
  const [selectedId, setSelected] = useState('');
  const [cart, setCart] = useState<Cart>({ items: [], totalAmount: 0 });
  const cartRef = useRef<Cart>(cart);
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  useEffect(() => {
    onPaymentChange?.(!!order);
  }, [order, onPaymentChange]);
  const [removingId, setRemoving] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const busy = useRef(false);
  const allCourses = homeProps?.courses.data?.length
    ? [...homeProps.courses.data, ...fixtures.courses]
    : fixtures.courses;
  const allClasses = allCourses.flatMap((course) =>
    fixtures.classes.some((c) => c.courseId === course.id)
      ? fixtures.classes.filter((c) => c.courseId === course.id)
      : fixtures.classes
          .filter((c) => c.courseId === 'demo-0')
          .map((c) => ({
            ...c,
            id: course.id + '-' + c.id,
            courseId: course.id,
          }))
  );
  const course = allCourses.find((c) => c.id === selectedId);
  const classes = allClasses.filter((c) => c.courseId === selectedId);
  const update = (items: CartItem[]) => {
    const next = {
      items,
      totalAmount: items.reduce(
        (sum, item) => sum + item.currentPriceAmount,
        0
      ),
    };
    cartRef.current = next;
    setCart(next);
  };
  const selection = useCourseSelection({
    courseId: selectedId,
    classes,
    cartItems: cart.items,
    onAdd: async (id) => {
      await pause();
      const cls = allClasses.find((c) => c.id === id);
      const target = allCourses.find((c) => c.id === cls?.courseId);
      if (!cls || !target) return;
      update([
        ...cartRef.current.items,
        {
          classId: cls.id,
          classCode: cls.code,
          className: cls.name,
          courseId: target.id,
          courseTitle: target.title,
          deliveryMode: cls.deliveryMode,
          startDate: cls.startDate,
          endDate: cls.endDate,
          priceSnapshot: target.priceAmount,
          currentPriceAmount: target.priceAmount,
          isPurchasable: true,
          addedAt: new Date().toISOString(),
        },
      ]);
    },
    onRemove: async (id) => {
      await pause();
      update(cartRef.current.items.filter((item) => item.classId !== id));
    },
    onRefresh: async () => {},
    onOpenCart: () => setSheet('cart'),
  });
  const openCourse = (id: string) => {
    selection.reset(id);
    setSelected(id);
    setSheet('course');
  };
  const filtered = allCourses.filter(
    (c) =>
      (!categoryId || c.category.id === categoryId) &&
      (!deliveryMode ||
        allClasses.some(
          (cls) => cls.courseId === c.id && cls.deliveryMode === deliveryMode
        ))
  );
  const totalDraft = allCourses.filter(
    (c) =>
      (!categoryId || c.category.id === categoryId) &&
      (!draft ||
        allClasses.some(
          (cls) => cls.courseId === c.id && cls.deliveryMode === draft
        ))
  ).length;
  const changeCategory = (id: string | null) => {
    setCategory(id);
    setPage(1);
  };
  const changeFilter = (filter: { deliveryMode?: DeliveryMode }) => {
    setMode(filter.deliveryMode);
    setPage(1);
  };
  const remove = async (id: string) => {
    if (busy.current) return;
    busy.current = true;
    setRemoving(id);
    await pause();
    update(cartRef.current.items.filter((item) => item.classId !== id));
    setRemoving(null);
    busy.current = false;
  };
  const checkout = async () => {
    if (busy.current || !cartRef.current.items.length) return;
    busy.current = true;
    setCheckingOut(true);
    await pause();
    setOrder({
      id: 'preview-order',
      orderCode: 'PREVIEW-ORDER',
      totalAmount: cartRef.current.totalAmount,
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
      details: cartRef.current.items.map((item) => ({
        courseTitle: item.courseTitle,
      })),
    });
    update([]);
    setSheet(null);
    setCheckingOut(false);
    busy.current = false;
  };
  if (order)
    return (
      <PreviewPayment
        order={order}
        onLeave={() => {
          setOrder(null);
          setTab('courses');
        }}
      />
    );
  const region = <T,>(data: T): DataRegion<T> => ({
    status:
      dataState === 'loading'
        ? 'loading'
        : dataState === 'error'
          ? 'error'
          : 'success',
    data: dataState === 'loading' || dataState === 'error' ? null : data,
    ...(onRetry ? { onRetry } : {}),
  });
  return (
    <View className="flex-1">
      {tab === 'home' ? (
        <StudentHome
          {...(homeProps ?? {
            displayName: t('preview.fixtureName'),
            courses: region(fixtures.courses.slice(0, 4)),
            schedule: { status: 'success' as const, data: null },
            timeZone: 'Asia/Ho_Chi_Minh',
            asOf: new Date().toISOString(),
          })}
          cartCount={cart.items.length}
          actions={{
            ...homeProps?.actions,
            onCourse: openCourse,
            onSelectCourse: openCourse,
            onExplore: () => setTab('courses'),
            onCart: () => setSheet('cart'),
            onTab: () => setTab('courses'),
          }}
        />
      ) : (
        <CoursesScreen
          courses={region(
            dataState === 'empty'
              ? []
              : filtered.slice((page - 1) * 6, page * 6)
          )}
          recommendations={region(
            dataState === 'empty' ? [] : allCourses.slice(0, 3)
          )}
          categories={region([
            ...new Map(
              allCourses.map((c) => [c.category.id, c.category])
            ).values(),
          ])}
          total={dataState === 'empty' ? 0 : filtered.length}
          page={page}
          categoryId={categoryId}
          deliveryMode={deliveryMode}
          cartCount={cart.items.length}
          onPage={setPage}
          onCategory={changeCategory}
          onFilter={changeFilter}
          onPreviewFilter={(mode) => {
            setDraft(mode);
            setSheet('filter');
          }}
          onOpenCourse={openCourse}
          onCart={() => setSheet('cart')}
          onHome={() => {
            setTab('home');
          }}
          onRefresh={onRetry}
        />
      )}
      {sheet === 'filter' && (
        <FilterSheet
          deliveryMode={deliveryMode}
          total={totalDraft}
          onPreview={setDraft}
          onApply={changeFilter}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'course' && course && (
        <CourseSheet
          key={course.id}
          course={course}
          classes={classes}
          {...selection}
          onPick={(id) => {
            selection.pick(id);
          }}
          onUnpick={(id) => {
            selection.unpick(id);
          }}
          onAddToCart={() => {
            selection.addToCart().catch(() => {});
          }}
          onBuy={() => {
            selection.buy().catch(() => {});
          }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'cart' && (
        <CartSheet
          cart={cart}
          removingId={removingId}
          checkingOut={checkingOut}
          onRemove={(id) => {
            remove(id).catch(() => {});
          }}
          onCheckout={() => {
            checkout().catch(() => {});
          }}
          onClose={() => setSheet(null)}
        />
      )}
    </View>
  );
}
