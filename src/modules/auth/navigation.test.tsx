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
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));
afterEach(() => jest.clearAllMocks());
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
it.each([true, false])('has no demo entry with __DEV__=%s', (development) => {
  const runtime = global as typeof global & { __DEV__: boolean };
  const previous = runtime.__DEV__;
  runtime.__DEV__ = development;
  try {
    render(<WelcomeRoute />);
    expect(screen.queryByTestId('phase-one-preview-button')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  } finally {
    runtime.__DEV__ = previous;
  }
});
