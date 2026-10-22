import { useNavigation } from '@react-navigation/native';
import routes from '@/navigation/routes';
import type { NavigationProp } from '@/navigation/types';
import { CartSheet } from '@/modules/cart/components/CartSheet';
import { useCartController } from '@/modules/cart/hooks/useCartController';
import {
  useCartActions,
  useCartQuery,
} from '@/modules/cart/hooks/useCartQuery';
import { useCourseDetailQuery } from '../hooks/useCourseDetailQuery';
import { useCourseSelection } from '../hooks/useCourseSelection';
import type { Course } from '../types/courses.type';
import { CourseSheet } from './CourseSheet';

type Props = {
  sheet: 'course' | 'cart' | null;
  courseId: string;
  onOpenCart: () => void;
  onClose: () => void;
};
// Production adapters for the shared course and cart sheets (Home and Courses).
export function ShoppingSheets({
  sheet,
  courseId,
  onOpenCart,
  onClose,
}: Props) {
  if (sheet === 'cart') return <ProductionCartSheet onClose={onClose} />;
  if (sheet === 'course' && courseId)
    return (
      <ProductionCourseSheet
        key={courseId}
        courseId={courseId}
        onOpenCart={onOpenCart}
        onClose={onClose}
      />
    );
  return null;
}
// The sheet renders only skeleton/error until the detail loads, so no card data is shown as detail.
const placeholder = (id: string): Course => ({
  id,
  code: '',
  title: '',
  description: null,
  imgUrl: null,
  priceAmount: 0,
  category: { id: '', name: '', slug: '' },
});
function ProductionCourseSheet({
  courseId,
  onOpenCart,
  onClose,
}: Omit<Props, 'sheet'>) {
  const detail = useCourseDetailQuery(courseId);
  const cart = useCartQuery();
  const actions = useCartActions();
  const selection = useCourseSelection({
    courseId,
    classes: detail.classes,
    cartItems: cart.data?.items ?? [],
    onAdd: actions.add,
    onRemove: actions.remove,
    onRefresh: async () => {
      await actions.refresh();
    },
    onOpenCart,
  });
  return (
    <CourseSheet
      course={detail.course ?? placeholder(courseId)}
      classes={detail.classes}
      status={detail.status}
      onRetry={detail.onRetry}
      selectedClassId={selection.selectedClassId}
      pendingClassId={selection.pendingClassId}
      buying={selection.buying}
      error={selection.error}
      toast={selection.toast}
      onPick={selection.pick}
      onUnpick={selection.unpick}
      onAddToCart={() => {
        selection.addToCart().catch(() => {});
      }}
      onBuy={() => {
        selection.buy().catch(() => {});
      }}
      onClose={onClose}
    />
  );
}
function ProductionCartSheet({ onClose }: { onClose: () => void }) {
  const navigation = useNavigation<NavigationProp>();
  const controller = useCartController((orderId) => {
    onClose();
    navigation.navigate(routes.payment, { orderId });
  });
  return (
    <CartSheet
      {...controller}
      onRemove={(classId) => {
        controller.onRemove(classId).catch(() => {});
      }}
      onCheckout={() => {
        controller.onCheckout().catch(() => {});
      }}
      onVerify={() => {
        controller.onVerify().catch(() => {});
      }}
      onClose={onClose}
    />
  );
}
