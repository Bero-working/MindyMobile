import '../../../tests/mocks/nativeUi';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders as render } from '../../../tests/utils/renderWithProviders';
import '@/config/i18n.config';
import routes from '@/navigation/routes';
import {
  WelcomeRoute,
  LoginRoute,
  RegisterRoute,
  StudentHomeRoute,
} from './AuthRoutes';
import { PhaseOnePreview } from '../preview/PhaseOnePreview';
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));
afterEach(() => jest.clearAllMocks());
it('switches Home preview between controlled loading, empty, error and success states', () => {
  render(<PhaseOnePreview />);
  fireEvent.press(screen.getByTestId('preview-home-button'));
  expect(screen.queryByTestId('preview-state-loading')).toBeNull();
  fireEvent.press(screen.getByTestId('preview-tools-toggle'));
  fireEvent.press(screen.getByTestId('preview-state-loading'));
  expect(screen.getByTestId('home-loading')).toBeTruthy();
  fireEvent.press(screen.getByTestId('preview-state-empty'));
  expect(screen.getByTestId('home-empty')).toBeTruthy();
  fireEvent.press(screen.getByTestId('preview-state-error'));
  expect(screen.getByTestId('home-error')).toBeTruthy();
});
it('navigates Welcome to typed login and registration routes without credentials in params', () => {
  render(<WelcomeRoute />);
  fireEvent.press(screen.getByTestId('welcome-login-button'));
  fireEvent.press(screen.getByTestId('welcome-register-button'));
  expect(mockNavigate.mock.calls).toEqual([[routes.login], [routes.register]]);
});
it('links Login and Register and enables submission through the real API adapter', () => {
  const view = render(<LoginRoute />);
  fireEvent.press(screen.getByTestId('login-register-link'));
  expect(mockNavigate).toHaveBeenCalledWith(routes.register);
  expect(screen.getByTestId('login-submit-button')).not.toBeDisabled();
  view.unmount();
  render(<RegisterRoute />);
  fireEvent.press(screen.getByTestId('register-login-link'));
  expect(mockNavigate).toHaveBeenCalledWith(routes.login);
});
it('does not render student data without a real session adapter', () => {
  render(<StudentHomeRoute />);
  expect(screen.queryByTestId('home-screen')).toBeNull();
});
it('has no development preview or preview link in release', () => {
  const runtime = global as typeof global & { __DEV__: boolean };
  const previous = runtime.__DEV__;
  runtime.__DEV__ = false;
  try {
    const view = render(<PhaseOnePreview />);
    expect(screen.queryByTestId('phase-one-preview')).toBeNull();
    view.unmount();
    render(<WelcomeRoute />);
    expect(screen.queryByTestId('phase-one-preview-button')).toBeNull();
  } finally {
    runtime.__DEV__ = previous;
  }
});

jest.mock('react-native-qrcode-svg', () => ({
  __esModule: true,
  default: jest.requireActual('react-native').View,
}));
jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: { setString: jest.fn() },
}));
