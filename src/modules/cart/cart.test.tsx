import '../../../tests/mocks/nativeUi';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CartSheet } from './components/CartSheet';
import '@/config/i18n.config';
import type { CartItem } from './types/cart.type';
jest.mock('@/components/common/AppSheet', () => ({
  AppSheet: jest.requireActual('react-native').View,
}));
const item: CartItem = {
  classId: 'a',
  classCode: 'A',
  className: 'Class A',
  courseId: 'c',
  courseTitle: 'Web',
  deliveryMode: 'ONLINE',
  startDate: '2026-10-20',
  endDate: '2026-12-20',
  priceSnapshot: 1000000,
  currentPriceAmount: 1500000,
  isPurchasable: true,
  addedAt: '2026-10-17T00:00:00Z',
};
const callbacks = {
  onRemove: jest.fn(),
  onCheckout: jest.fn(),
  onClose: jest.fn(),
};
it('disables checkout on an empty cart', () => {
  render(
    <CartSheet
      {...callbacks}
      cart={{ items: [], totalAmount: 0 }}
    />
  );
  expect(screen.getByTestId('cart-empty')).toBeTruthy();
  expect(screen.getByTestId('cart-checkout')).toBeDisabled();
});
it('renders server total, changed prices and blocks unavailable items', () => {
  const view = render(
    <CartSheet
      {...callbacks}
      cart={{ items: [item], totalAmount: 123 }}
    />
  );
  expect(screen.getByText('123 VND')).toBeTruthy();
  expect(screen.getByTestId('cart-item-price-changed-a')).toBeTruthy();
  fireEvent.press(screen.getByTestId('cart-item-remove-a'));
  expect(callbacks.onRemove).toHaveBeenCalledWith('a');
  expect(screen.getByTestId('cart-item-a')).toBeTruthy();
  view.rerender(
    <CartSheet
      {...callbacks}
      cart={{ items: [{ ...item, isPurchasable: false }], totalAmount: 123 }}
    />
  );
  expect(screen.getByTestId('cart-checkout')).toBeDisabled();
  expect(screen.getByTestId('cart-item-unavailable-a')).toBeTruthy();
});
it('locks checkout and remove while pending and provides a verification action for unknown outcomes', () => {
  const props = { ...callbacks, cart: { items: [item], totalAmount: 1500000 } };
  const view = render(
    <CartSheet
      {...props}
      checkingOut
    />
  );
  expect(screen.getByTestId('cart-checkout')).toBeDisabled();
  expect(screen.getByTestId('cart-item-remove-a')).toBeDisabled();
  const verify = jest.fn();
  view.rerender(
    <CartSheet
      {...props}
      checkoutUnknown
      onVerify={verify}
    />
  );
  fireEvent.press(screen.getByTestId('cart-checkout-verify'));
  expect(verify).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('cart-checkout')).toBeDisabled();
});
