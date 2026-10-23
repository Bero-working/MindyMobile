import '../../../tests/mocks/nativeUi';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL as base } from '../../../tests/mocks/constants';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import {
  apiOrder,
  apiPayment,
  student,
} from '../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import '@/config/i18n.config';
import { PaymentRoute } from './PaymentRoute';
const mockReset = jest.fn();
const mockNavigate = jest.fn();
const mockBack = jest.fn();
let mockOrigin: 'learning' | undefined;
let mockFocused = true;
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockFocused,
  useNavigation: () => ({
    reset: mockReset,
    navigate: mockNavigate,
    goBack: mockBack,
    canGoBack: () => true,
  }),
  useRoute: () => ({
    params: {
      orderId: '22222222-2222-4222-8222-000000000500',
      origin: mockOrigin,
    },
  }),
}));
jest.mock('react-native-qrcode-svg', () => ({
  __esModule: true,
  default: jest.requireActual('react-native').View,
}));
jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: { setString: jest.fn() },
}));
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  mockFocused = true;
  mockOrigin = undefined;
  jest.clearAllMocks();
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 10,
  });
});
afterEach(() => {
  mockServer.resetHandlers();
  jest.useRealTimers();
});
afterAll(() => mockServer.close());

it.each([
  ['PAID', undefined],
  ['PAID', 'learning'],
  ['CANCELLED', undefined],
  ['CANCELLED', 'learning'],
  ['EXPIRED', undefined],
  ['EXPIRED', 'learning'],
] as const)(
  'shows backend %s from origin %s before navigating',
  async (status, origin) => {
    mockOrigin = origin;
    let writes = 0;
    mockServer.use(
      http.get(base + '/me/orders/:id', () =>
        HttpResponse.json({ ...apiOrder(), status, payment: null })
      ),
      http.post(base + '/me/orders/:id/payments/payos', () => {
        writes++;
        return HttpResponse.json(apiPayment());
      })
    );
    renderWithProviders(<PaymentRoute />);
    await waitFor(() =>
      expect(screen.getByTestId('payment-result-ticket')).toBeTruthy()
    );
    expect(mockReset).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    fireEvent.press(
      screen.getByTestId(
        status === 'PAID' ? 'payment-result-home' : 'payment-result-retry'
      )
    );
    if (status === 'PAID')
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'STUDENT_HOME' }],
      });
    else expect(mockNavigate).toHaveBeenCalledWith('COURSES');
    expect(mockBack).not.toHaveBeenCalled();
    expect(writes).toBe(0);
  }
);
it('polls a live QR into success without a second link request', async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  let paid = false,
    writes = 0;
  mockServer.use(
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({
        ...apiOrder(),
        status: paid ? 'PAID' : 'PENDING',
        payment: null,
      })
    ),
    http.post(base + '/me/orders/:id/payments/payos', () => {
      writes++;
      return HttpResponse.json(apiPayment(), { status: 201 });
    })
  );
  renderWithProviders(<PaymentRoute />);
  await waitFor(() => expect(screen.getByTestId('payment-qr')).toBeTruthy());
  expect(screen.queryByTestId('payment-result-ticket')).toBeNull();
  paid = true;
  await act(async () => {
    await jest.advanceTimersByTimeAsync(3100);
  });
  await waitFor(() =>
    expect(screen.getByTestId('payment-result-home')).toBeTruthy()
  );
  expect(writes).toBe(1);
});
it('keeps review inline without a ticket, QR or payment retry', async () => {
  mockServer.use(
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({
        ...apiOrder(),
        payment: apiPayment('REQUIRES_REVIEW'),
      })
    )
  );
  renderWithProviders(<PaymentRoute />);
  await waitFor(() =>
    expect(
      screen.getByText(
        'Giao dịch đang được đối soát. Vui lòng không thanh toán lại.'
      )
    ).toBeTruthy()
  );
  expect(screen.queryByTestId('payment-result-ticket')).toBeNull();
  expect(screen.queryByTestId('payment-qr')).toBeNull();
  expect(screen.queryByTestId('payment-retry')).toBeNull();
});

it('removes the native ticket layer when navigation blurs a mounted payment screen', async () => {
  mockServer.use(
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({ ...apiOrder(), status: 'CANCELLED', payment: null })
    )
  );
  const view = renderWithProviders(<PaymentRoute />);
  await waitFor(() =>
    expect(screen.getByTestId('payment-result-ticket')).toBeTruthy()
  );
  mockFocused = false;
  view.rerender(<PaymentRoute />);
  expect(screen.queryByTestId('payment-result-ticket')).toBeNull();
});
