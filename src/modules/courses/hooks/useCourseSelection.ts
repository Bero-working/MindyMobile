import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/shared/utilities/apiError';
import type { CourseClass } from '../types/courses.type';
type Options = {
  courseId: string;
  classes: CourseClass[];
  cartItems: { courseId: string; classId: string }[];
  onAdd: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onOpenCart: () => void;
};
export function useCourseSelection(options: Options) {
  const { t, i18n } = useTranslation();
  const busy = useRef(false);
  const [pendingClassId, setPending] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    courseId: string;
    classId: string | null;
  } | null>(null);
  const savedClassId = (courseId: string) =>
    options.cartItems.find((item) => item.courseId === courseId)?.classId ??
    null;
  const selectedClassId =
    draft?.courseId === options.courseId
      ? draft.classId
      : savedClassId(options.courseId);
  const reset = (courseId: string) => {
    setDraft({ courseId, classId: savedClassId(courseId) });
    setError(null);
    setToast(null);
  };
  const pick = (id: string) => {
    if (
      busy.current ||
      !options.classes.some((item) => item.id === id && item.availableSeats > 0)
    )
      return;
    setDraft({ courseId: options.courseId, classId: id });
    setError(null);
    setToast(null);
  };
  const unpick = (id: string) => {
    if (busy.current || selectedClassId !== id) return;
    setDraft({ courseId: options.courseId, classId: null });
    setError(null);
    setToast(null);
  };
  const run = async (open = false) => {
    const id = selectedClassId;
    if (
      busy.current ||
      !id ||
      !options.classes.some((item) => item.id === id && item.availableSeats > 0)
    )
      return;
    busy.current = true;
    setPending(id);
    setBuying(open);
    setError(null);
    setToast(null);
    try {
      if (!options.cartItems.some((item) => item.classId === id))
        await options.onAdd(id);
      for (const old of options.cartItems.filter(
        (item) => item.courseId === options.courseId && item.classId !== id
      ))
        await options.onRemove(old.classId);
      await options.onRefresh();
      const name = options.classes.find((c) => c.id === id)?.name ?? '';
      setToast(t('courseSheet.added', { name }));
      if (open) options.onOpenCart();
    } catch (cause) {
      const code = cause instanceof ApiError ? cause.code : 'generic';
      if (
        code !== 'CART_ITEM_NOT_FOUND' &&
        code !== 'CART_ITEM_ALREADY_EXISTS'
      ) {
        const key = 'cart.errors.' + code;
        setError(t(i18n.exists(key) ? key : 'cart.errors.generic'));
      }
      await options.onRefresh().catch(() => {});
    } finally {
      busy.current = false;
      setPending(null);
      setBuying(false);
    }
  };
  return {
    pendingClassId,
    buying,
    error,
    toast,
    selectedClassId,
    reset,
    pick,
    unpick,
    addToCart: () => run(),
    buy: () => run(true),
  };
}
