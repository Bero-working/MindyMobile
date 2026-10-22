import '../../../tests/mocks/nativeUi';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import '@/config/i18n.config';
import { PhaseTwoPreview } from './PhaseTwoPreview';
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
it('browses, selects, opens the cart and checks out to a sample QR', async () => {
  render(<PhaseTwoPreview />);
  fireEvent.press(screen.getByTestId('courses-course-demo-0'));
  fireEvent.press(screen.getByTestId('course-sheet-pick-demo-0-a'));
  expect(screen.getByTestId('course-sheet-pick-demo-0-a')).not.toBeDisabled();
  expect(screen.queryByTestId('course-sheet-toast')).toBeNull();
  fireEvent.press(screen.getByTestId('course-sheet-buy'));
  await waitFor(() =>
    expect(screen.getByTestId('cart-item-demo-0-a')).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId('cart-checkout'));
  await waitFor(() => expect(screen.getByTestId('payment-qr')).toBeTruthy());
  expect(screen.queryByTestId('courses-tab-courses')).toBeNull();
});

it('keeps class selection local until adding, then replaces the one class for the course on buy', async () => {
  render(<PhaseTwoPreview />);
  fireEvent.press(screen.getByTestId('courses-course-demo-0'));
  expect(screen.getByTestId('course-sheet-add-to-cart')).toBeDisabled();
  fireEvent.press(screen.getByTestId('course-sheet-pick-demo-0-a'));
  expect(screen.queryByTestId('courses-cart-badge')).toBeNull();
  fireEvent.press(screen.getByTestId('course-sheet-pick-demo-0-b'));
  expect(
    screen.getByTestId('course-sheet-pick-demo-0-a').props.accessibilityState
      .selected
  ).toBe(false);
  expect(
    screen.getByTestId('course-sheet-pick-demo-0-b').props.accessibilityState
      .selected
  ).toBe(true);
  fireEvent.press(screen.getByTestId('course-sheet-add-to-cart'));
  await waitFor(() =>
    expect(screen.getByTestId('course-sheet-toast')).toBeTruthy()
  );
  expect(screen.getByTestId('course-sheet')).toBeTruthy();
  expect(screen.getByTestId('courses-cart-badge')).toHaveTextContent('1');
  fireEvent.press(screen.getByTestId('course-sheet-pick-demo-0-b'));
  expect(screen.getByTestId('course-sheet-add-to-cart')).toBeDisabled();
  expect(screen.getByTestId('courses-cart-badge')).toHaveTextContent('1');
  fireEvent.press(screen.getByTestId('course-sheet-pick-demo-0-a'));
  fireEvent.press(screen.getByTestId('course-sheet-buy'));
  await waitFor(() =>
    expect(screen.getByTestId('cart-item-demo-0-a')).toBeTruthy()
  );
  expect(screen.queryByTestId('cart-item-demo-0-b')).toBeNull();
  expect(screen.getByTestId('courses-cart-badge')).toHaveTextContent('1');
});
