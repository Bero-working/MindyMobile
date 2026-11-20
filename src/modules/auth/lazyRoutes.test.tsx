import '../../../tests/mocks/nativeUi';
import { render } from '@testing-library/react-native';
import { LoginRoute, RegisterRoute, StudentHomeRoute } from './AuthRoutes';

const mockLoaded: string[] = [];

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));
jest.mock('./hooks/useAuthSession', () => ({
  useAuthActions: () => ({
    login: jest.fn(),
    register: jest.fn(),
    resend: jest.fn(),
  }),
}));
jest.mock('./LoginScreen', () => {
  mockLoaded.push('login');
  return { LoginScreen: () => null };
});
jest.mock('./RegisterScreen', () => {
  mockLoaded.push('register');
  return { RegisterScreen: () => null };
});
jest.mock('./WelcomeScreen', () => {
  mockLoaded.push('welcome');
  return { WelcomeScreen: () => null };
});
jest.mock('../home/ProductionStudentHome', () => {
  mockLoaded.push('home');
  return { ProductionStudentHome: () => null };
});
jest.mock('@/state/store', () => ({
  useStore: (select: (state: { sessionUser: null }) => null) =>
    select({ sessionUser: null }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

it('opens Login and Register without evaluating Welcome or student Home UI', () => {
  expect(mockLoaded).toEqual([]);
  const view = render(<LoginRoute />);
  expect(mockLoaded).toEqual(['login']);
  view.rerender(<RegisterRoute />);
  expect(mockLoaded).toEqual(['login', 'register']);
  view.rerender(<StudentHomeRoute />);
  expect(mockLoaded).toEqual(['login', 'register']);
});
