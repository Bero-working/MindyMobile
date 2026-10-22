import '../../../tests/mocks/nativeUi';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import '@/config/i18n.config';
import { PhaseThreePreview } from './PhaseThreePreview';
import { useStore } from '@/state/store';
jest.mock('react-native-qrcode-svg', () => ({
  __esModule: true,
  default: jest.requireActual('react-native').View,
}));
jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: { setString: jest.fn() },
}));
jest.mock('@/components/common/AppSheet', () => ({
  AppSheet: jest.requireActual('react-native').View,
}));
it('preserves a class folder while visiting FULL details and keeps preview isolated from auth', () => {
  const initialUser = useStore.getState().sessionUser;
  render(
    <PhaseThreePreview
      initial="classes"
      onExit={jest.fn()}
    />
  );
  fireEvent.press(screen.getByTestId('my-classes-open-full'));
  expect(screen.getByTestId('class-detail-screen')).toBeTruthy();
  fireEvent.press(screen.getByTestId('class-detail-back'));
  expect(
    screen.getByTestId('my-classes-course-web').props.accessibilityState
      .expanded
  ).toBe(true);
  fireEvent.press(screen.getByTestId('my-classes-course-web-next'));
  fireEvent.press(screen.getByTestId('my-classes-open-cash'));
  fireEvent.press(screen.getByTestId('class-detail-session-cash-session'));
  expect(screen.queryByTestId('class-session-join')).toBeNull();
  expect(useStore.getState().sessionUser).toEqual(initialUser);
});
it('keeps schedule read-only and supports tab navigation', () => {
  render(<PhaseThreePreview onExit={jest.fn()} />);
  expect(
    screen.getByTestId('schedule-session-full-session').props.onPress
  ).toBeUndefined();
  expect(screen.queryByTestId('class-session-screen')).toBeNull();
  expect(screen.getByTestId('schedule-screen')).toBeTruthy();
  fireEvent.press(screen.getByTestId('schedule-tab-account'));
  expect(screen.getByTestId('account-screen')).toBeTruthy();
  fireEvent.press(screen.getByTestId('account-my-classes'));
  expect(
    screen.getByTestId('my-classes-tab-account').props.accessibilityState
      .selected
  ).toBe(true);
});

it('opens the Home session and retains the Home origin of my classes', async () => {
  render(
    <PhaseThreePreview
      initial="home"
      onExit={jest.fn()}
    />
  );
  await act(async () => {});
  fireEvent.press(screen.getByTestId('home-join-class-button'));
  expect(screen.getByTestId('class-session-screen')).toBeTruthy();
  fireEvent.press(screen.getByTestId('class-session-close'));
  fireEvent.press(screen.getByTestId('class-detail-back'));
  fireEvent.press(screen.getByTestId('home-my-classes'));
  expect(
    screen.getByTestId('my-classes-tab-home').props.accessibilityState.selected
  ).toBe(true);
});
