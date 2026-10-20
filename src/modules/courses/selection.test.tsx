import { act, renderHook } from '@testing-library/react-native';
import '@/config/i18n.config';
import { useCourseSelection } from './hooks/useCourseSelection';
import { ApiError } from '@/shared/utilities/apiError';
import type { CourseClass } from './types/courses.type';
const classes: CourseClass[] = ['a', 'b', 'full'].map((id) => ({
  id,
  courseId: 'c',
  code: id,
  name: id,
  deliveryMode: 'ONLINE',
  availableSeats: id === 'full' ? 0 : 5,
  startDate: '2026-10-20',
  endDate: '2026-12-20',
  mentor: { displayName: 'An' },
}));
function options() {
  return {
    courseId: 'c',
    classes,
    cartItems: [] as { courseId: string; classId: string }[],
    onAdd: jest.fn(async (_id: string) => {}),
    onRemove: jest.fn(async (_id: string) => {}),
    onRefresh: jest.fn(async () => {}),
    onOpenCart: jest.fn(),
  };
}
it('selects only one draft class without changing the cart, and ignores full classes', () => {
  const props = options();
  const { result } = renderHook(() => useCourseSelection(props));
  act(() => result.current.pick('a'));
  act(() => result.current.pick('b'));
  expect(result.current.selectedClassId).toBe('b');
  act(() => result.current.pick('full'));
  expect(result.current.selectedClassId).toBe('b');
  act(() => result.current.unpick('b'));
  expect(result.current.selectedClassId).toBeNull();
  expect(props.onAdd).not.toHaveBeenCalled();
  expect(props.onRemove).not.toHaveBeenCalled();
  expect(props.onRefresh).not.toHaveBeenCalled();
});
it('adds the selected replacement before removing the previous class and prevents repeat taps', async () => {
  const props = options();
  props.cartItems = [
    { courseId: 'c', classId: 'a' },
    { courseId: 'other', classId: 'other-a' },
  ];
  let resolve: () => void = () => {};
  props.onAdd = jest.fn(
    (_id: string) =>
      new Promise<void>((r) => {
        resolve = r;
      })
  );
  const { result } = renderHook(() => useCourseSelection(props));
  act(() => result.current.pick('b'));
  let done = Promise.resolve();
  act(() => {
    done = result.current.addToCart();
    result.current.addToCart().catch(() => {});
  });
  expect(props.onAdd).toHaveBeenCalledTimes(1);
  expect(props.onAdd).toHaveBeenCalledWith('b');
  expect(props.onRemove).not.toHaveBeenCalled();
  await act(async () => {
    resolve();
    await done;
  });
  expect(props.onRemove).toHaveBeenCalledTimes(1);
  expect(props.onRemove).toHaveBeenCalledWith('a');
  expect(props.onOpenCart).not.toHaveBeenCalled();
});
it('keeps the previous class if its replacement cannot be added', async () => {
  const props = options();
  props.cartItems = [{ courseId: 'c', classId: 'a' }];
  props.onAdd = jest.fn(async (_id: string): Promise<void> => {
    throw new ApiError({
      statusCode: 409,
      code: 'CLASS_FULL',
      message: 'full',
    });
  });
  const { result } = renderHook(() => useCourseSelection(props));
  act(() => result.current.pick('b'));
  await act(async () => {
    await result.current.buy();
  });
  expect(props.onRemove).not.toHaveBeenCalled();
  expect(props.onOpenCart).not.toHaveBeenCalled();
  expect(result.current.error).toBe('Lớp đã hết chỗ.');
});
it('explains an existing enrollment or seat hold without opening the cart', async () => {
  const props = options();
  props.onAdd = jest.fn(async (_id: string): Promise<void> => {
    throw new ApiError({
      statusCode: 409,
      code: 'CLASS_ALREADY_ENROLLED',
      message: 'Seat conflict',
    });
  });
  const { result } = renderHook(() => useCourseSelection(props));
  act(() => result.current.pick('a'));
  await act(async () => {
    await result.current.buy();
  });
  expect(result.current.error).toBe(
    'Bạn đã đăng ký hoặc đang được giữ chỗ ở lớp này.'
  );
  expect(result.current.toast).toBeNull();
  expect(props.onRemove).not.toHaveBeenCalled();
  expect(props.onOpenCart).not.toHaveBeenCalled();
  expect(props.onRefresh).toHaveBeenCalledTimes(1);
});

it('buy adds the draft class then opens the cart', async () => {
  const props = options();
  const { result } = renderHook(() => useCourseSelection(props));
  act(() => result.current.pick('b'));
  await act(async () => {
    await result.current.buy();
  });
  expect(props.onAdd).toHaveBeenCalledWith('b');
  expect(props.onOpenCart).toHaveBeenCalledTimes(1);
});
it('does not duplicate a class already in the cart and does not remove it when unpicked', async () => {
  const props = options();
  props.cartItems = [{ courseId: 'c', classId: 'a' }];
  const { result } = renderHook(() => useCourseSelection(props));
  expect(result.current.selectedClassId).toBe('a');
  await act(async () => {
    await result.current.buy();
  });
  expect(props.onAdd).not.toHaveBeenCalled();
  expect(props.onOpenCart).toHaveBeenCalledTimes(1);
  act(() => result.current.unpick('a'));
  expect(props.onRemove).not.toHaveBeenCalled();
});
it('requires an available selected class before either cart action', async () => {
  const props = options();
  const { result, rerender } = renderHook(() => useCourseSelection(props));
  await act(async () => {
    await result.current.addToCart();
    await result.current.buy();
  });
  act(() => result.current.pick('b'));
  props.classes = classes.map((item) => ({ ...item, availableSeats: 0 }));
  rerender({});
  await act(async () => {
    await result.current.buy();
  });
  expect(props.onAdd).not.toHaveBeenCalled();
  expect(props.onOpenCart).not.toHaveBeenCalled();
});
it('clears abandoned selections and notices when reopening a course', () => {
  const props = options();
  const { result } = renderHook(() => useCourseSelection(props));
  act(() => result.current.pick('b'));
  act(() => result.current.reset('c'));
  expect(result.current.selectedClassId).toBeNull();
  expect(result.current.toast).toBeNull();
});
