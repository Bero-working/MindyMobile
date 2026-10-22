import '../../../tests/mocks/nativeUi';
import { render, screen } from '@testing-library/react-native';
import i18n from '@/config/i18n.config';
import { CoursesRoute } from './CoursesRoute';
import { PaymentRoute } from '../payment/PaymentRoute';
import { useStore } from '@/state/store';
jest.mock('react-native-qrcode-svg', () => ({
  __esModule: true,
  default: jest.requireActual('react-native').View,
}));
jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: { setString: jest.fn() },
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), replace: jest.fn() }),
}));
it('does not expose course or payment data without a student session', () => {
  useStore.setState({ sessionUser: null });
  const view = render(<CoursesRoute />);
  expect(screen.queryByTestId('courses-screen')).toBeNull();
  view.unmount();
  render(<PaymentRoute />);
  expect(screen.queryByTestId('payment-qr')).toBeNull();
  expect(screen.getByText(i18n.t('home.authRequired'))).toBeTruthy();
});
