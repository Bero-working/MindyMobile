import '../../../tests/mocks/nativeUi';
import { Text, View } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL as base } from '../../../tests/mocks/constants';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import {
  apiCartItem,
  apiClass,
  apiCourse,
  apiOrder,
  apiPage,
  apiPayment,
  commerceId as id,
  deferred,
  student,
} from '../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import { useCartQuery } from '@/modules/cart/hooks/useCartQuery';
import '@/config/i18n.config';
import { ShoppingSheets } from './components/ShoppingSheets';
import { CoursesRoute } from './CoursesRoute';
import { PaymentRoute } from '@/modules/payment/PaymentRoute';
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
  useNavigation: () => ({ navigate: mockNavigate, replace: mockNavigate }),
  useRoute: () => ({
    params: { orderId: '22222222-2222-4222-8222-000000000500' },
  }),
}));
jest.mock('@/components/common/AppSheet', () => ({
  AppSheet: jest.requireActual('react-native').View,
}));
jest.mock('react-native-qrcode-svg', () => ({
  __esModule: true,
  default: jest.requireActual('react-native').View,
}));
jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: { setString: jest.fn() },
}));
let items: ReturnType<typeof apiCartItem>[] = [],
  writes: string[] = [],
  queries: string[] = [];
function Badge() {
  const cart = useCartQuery();
  return <Text testID="live-cart-count">{cart.data?.items.length ?? 0}</Text>;
}
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  mockNavigate.mockClear();
  items = [];
  writes = [];
  queries = [];
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 10,
  });
  mockServer.use(
    http.get(base + '/course-categories', () =>
      HttpResponse.json(
        apiPage([{ id: id(50), name: 'Coding', isActive: true }], 50)
      )
    ),
    http.get(base + '/courses', ({ request }) => {
      const search = new URL(request.url).searchParams;
      queries.push(search.toString());
      const page = Number(search.get('page'));
      return HttpResponse.json({
        ...apiPage(
          [{ ...apiCourse, id: id(page) }],
          Number(search.get('pageSize'))
        ),
        page,
        total: 7,
      });
    }),
    http.get(base + '/courses/:id', () => HttpResponse.json(apiCourse)),
    http.get(base + '/courses/:id/classes', () =>
      HttpResponse.json(apiPage([apiClass(10), apiClass(11)]))
    ),
    http.get(base + '/classes/:id', ({ params }) =>
      HttpResponse.json({ id: params.id, units: [] })
    ),
    http.get(base + '/me/cart', () =>
      HttpResponse.json({ items, totalAmount: items.length * 1500000 })
    ),
    http.post(base + '/me/cart/items', async ({ request }) => {
      const body = (await request.json()) as { classId: string };
      writes.push('POST ' + body.classId);
      items.push(apiCartItem(body.classId === id(10) ? 10 : 11));
      return HttpResponse.json(
        { items, totalAmount: items.length * 1500000 },
        { status: 201 }
      );
    }),
    http.delete(base + '/me/cart/items/:id', ({ params }) => {
      writes.push('DELETE ' + params.id);
      items = items.filter((item) => item.classId !== params.id);
      return new HttpResponse(null, { status: 204 });
    }),
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({ ...apiOrder(), payment: null })
    ),
    http.post(base + '/me/orders/:id/payments/payos', () =>
      HttpResponse.json(apiPayment(), { status: 201 })
    )
  );
});
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
it('keeps selection local and changes the live cart badge only after the POST response', async () => {
  const gate = deferred();
  let started = false;
  mockServer.use(
    http.post(base + '/me/cart/items', async () => {
      started = true;
      await gate.promise;
      items = [apiCartItem(10)];
      return HttpResponse.json(
        { items, totalAmount: 1500000 },
        { status: 201 }
      );
    })
  );
  renderWithProviders(
    <View>
      <Badge />
      <ShoppingSheets
        sheet="course"
        courseId={id(1)}
        onOpenCart={jest.fn()}
        onClose={jest.fn()}
      />
    </View>
  );
  await waitFor(() =>
    expect(screen.getByTestId('course-sheet-pick-' + id(10))).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('course-sheet-pick-' + id(10)));
  expect(writes).toEqual([]);
  expect(screen.getByTestId('live-cart-count')).toHaveTextContent('0');
  fireEvent.press(screen.getByTestId('course-sheet-add-to-cart'));
  await waitFor(() => expect(started).toBe(true));
  expect(screen.getByTestId('live-cart-count')).toHaveTextContent('0');
  gate.resolve();
  await waitFor(() =>
    expect(screen.getByTestId('live-cart-count')).toHaveTextContent('1')
  );
  expect(screen.getByTestId('course-sheet')).toBeTruthy();
});
it('buys a replacement with POST before DELETE and preserves only one class per course', async () => {
  items = [apiCartItem(10)];
  const open = jest.fn();
  renderWithProviders(
    <ShoppingSheets
      sheet="course"
      courseId={id(1)}
      onOpenCart={open}
      onClose={jest.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getByTestId('course-sheet-pick-' + id(11))).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('course-sheet-pick-' + id(11)));
  expect(writes).toEqual([]);
  fireEvent.press(screen.getByTestId('course-sheet-buy'));
  await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
  expect(writes).toEqual(['POST ' + id(11), 'DELETE ' + id(10)]);
  expect(items.map((item) => item.classId)).toEqual([id(11)]);
});
it('preserves the previous class and shows CLASS_FULL when adding its replacement fails', async () => {
  items = [apiCartItem(10)];
  const open = jest.fn();
  mockServer.use(
    http.post(base + '/me/cart/items', () =>
      HttpResponse.json(
        { statusCode: 409, code: 'CLASS_FULL', message: 'full' },
        { status: 409 }
      )
    )
  );
  renderWithProviders(
    <ShoppingSheets
      sheet="course"
      courseId={id(1)}
      onOpenCart={open}
      onClose={jest.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getByTestId('course-sheet-pick-' + id(11))).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('course-sheet-pick-' + id(11)));
  fireEvent.press(screen.getByTestId('course-sheet-buy'));
  await waitFor(() => expect(screen.getByText('Lớp đã hết chỗ.')).toBeTruthy());
  expect(writes).toEqual([]);
  expect(items[0]?.classId).toBe(id(10));
  expect(open).not.toHaveBeenCalled();
});
it('routes an unknown checkout through verification without a second checkout', async () => {
  items = [apiCartItem(10)];
  let calls = 0;
  const close = jest.fn();
  mockServer.use(
    http.post(base + '/me/cart/checkout', () => {
      calls++;
      return HttpResponse.error();
    }),
    http.get(base + '/me/orders', () =>
      HttpResponse.json(apiPage([apiOrder()]))
    )
  );
  renderWithProviders(
    <ShoppingSheets
      sheet="cart"
      courseId=""
      onOpenCart={jest.fn()}
      onClose={close}
    />
  );
  await waitFor(() =>
    expect(screen.getByTestId('cart-item-' + id(10))).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('cart-checkout'));
  await waitFor(() =>
    expect(screen.getByTestId('cart-checkout-verify')).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('cart-checkout-verify'));
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith('PAYMENT', { orderId: id(500) })
  );
  expect(calls).toBe(1);
  expect(close).toHaveBeenCalled();
});
it('shows the enrollment or seat-hold reason from a structured backend error', async () => {
  const openCart = jest.fn();
  mockServer.use(
    http.post(base + '/me/cart/items', () =>
      HttpResponse.json(
        {
          statusCode: 409,
          code: 'CLASS_ALREADY_ENROLLED',
          message: 'You already hold a seat or are enrolled in this class',
          details: [{ classId: id(10) }],
          requestId: 'seat-conflict',
        },
        { status: 409 }
      )
    )
  );
  renderWithProviders(
    <ShoppingSheets
      sheet="course"
      courseId={apiCourse.id}
      onOpenCart={openCart}
      onClose={jest.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getByTestId('course-sheet-pick-' + id(10))).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('course-sheet-pick-' + id(10)));
  fireEvent.press(screen.getByTestId('course-sheet-buy'));
  await waitFor(() =>
    expect(
      screen.getByText('Bạn đã đăng ký hoặc đang được giữ chỗ ở lớp này.')
    ).toBeTruthy()
  );
  expect(screen.queryByTestId('course-sheet-toast')).toBeNull();
  expect(openCart).not.toHaveBeenCalled();
  expect(items).toHaveLength(0);
});

it('loads the live route and resets the page when category or delivery mode changes', async () => {
  renderWithProviders(<CoursesRoute />);
  await waitFor(() =>
    expect(screen.getByTestId('courses-course-' + id(1))).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('courses-page-next'));
  await waitFor(() =>
    expect(screen.getByTestId('courses-course-' + id(2))).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('courses-category-' + id(50)));
  await waitFor(() =>
    expect(queries).toContain('page=1&pageSize=6&categoryId=' + id(50))
  );
  fireEvent.press(screen.getByTestId('courses-filter-button'));
  fireEvent.press(screen.getByTestId('courses-filter-mode-OFFLINE'));
  fireEvent.press(screen.getByTestId('courses-filter-apply'));
  await waitFor(() =>
    expect(queries).toContain(
      'page=1&pageSize=6&categoryId=' + id(50) + '&deliveryMode=OFFLINE'
    )
  );
});
it('renders the real order QR route, and never creates a link for a closed order', async () => {
  let posts = 0;
  mockServer.use(
    http.post(base + '/me/orders/:id/payments/payos', () => {
      posts++;
      return HttpResponse.json(apiPayment(), { status: 201 });
    })
  );
  const view = renderWithProviders(<PaymentRoute />);
  await waitFor(() => expect(screen.getByTestId('payment-qr')).toBeTruthy());
  expect(posts).toBe(1);
  view.unmount();
  mockServer.use(
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({ ...apiOrder(), status: 'EXPIRED', payment: null })
    )
  );
  renderWithProviders(<PaymentRoute />);
  await waitFor(() =>
    expect(screen.getByTestId('payment-result-title').props.children).toBe(
      'Đơn thanh toán đã hết hạn'
    )
  );
  expect(posts).toBe(1);
});
