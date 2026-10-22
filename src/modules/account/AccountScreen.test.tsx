import '../../../tests/mocks/nativeUi';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import '@/config/i18n.config';
import { AccountScreen } from './AccountScreen';
import { ApiError } from '@/shared/utilities/apiError';
jest.mock('@/components/common/AppSheet', () => ({
  AppSheet: jest.requireActual('react-native').View,
}));
const user = {
  id: 's',
  displayName: 'Student',
  email: 'student@example.test',
  phone: null,
  role: 'STUDENT' as const,
  status: 'ACTIVE' as const,
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00Z',
};
it('shows read-only profile and confirms logout before calling it', async () => {
  const logout = jest.fn().mockResolvedValue(undefined);
  render(
    <AccountScreen
      profile={{ status: 'success', data: user }}
      onLogout={logout}
      onTab={jest.fn()}
      onMyClasses={jest.fn()}
    />
  );
  fireEvent.press(screen.getByTestId('account-profile'));
  expect(screen.getByTestId('account-profile-fields')).toBeTruthy();
  fireEvent.press(screen.getByTestId('account-sheet-close'));
  fireEvent.press(screen.getByTestId('account-logout'));
  expect(logout).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId('account-logout-confirm'));
  await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
});

it('keeps unavailable actions disabled and exposes the language picker from its row', async () => {
  render(
    <AccountScreen
      profile={{ status: 'success', data: user }}
      onLogout={jest.fn()}
      onTab={jest.fn()}
      onMyClasses={jest.fn()}
    />
  );
  for (const id of [
    'account-orders',
    'account-edit-profile',
    'account-certificates',
    'account-attendance',
    'account-help',
    'account-policy',
    'account-avatar-camera',
  ])
    expect(screen.getByTestId(id)).toBeDisabled();
  expect(screen.getByTestId('account-push-switch').props.value).toBe(false);
  expect(screen.getByTestId('account-push-switch')).toBeDisabled();
  expect(screen.queryByTestId('account-language-en-EN')).toBeNull();
  fireEvent.press(screen.getByTestId('account-language'));
  fireEvent.press(screen.getByTestId('account-language-en-EN'));
  await waitFor(() =>
    expect(screen.queryByTestId('account-language-en-EN')).toBeNull()
  );
});

it('retains logout errors with a retry action', async () => {
  const logout = jest.fn().mockRejectedValue(
    new ApiError({
      statusCode: 503,
      code: 'SERVER_ERROR',
      message: 'Unavailable',
      requestId: 'logout-request',
    })
  );
  render(
    <AccountScreen
      profile={{ status: 'success', data: user }}
      onLogout={logout}
      onTab={jest.fn()}
      onMyClasses={jest.fn()}
    />
  );
  fireEvent.press(screen.getByTestId('account-logout'));
  fireEvent.press(screen.getByTestId('account-logout-confirm'));
  await waitFor(() => expect(screen.getByText(/logout-request/)).toBeTruthy());
  expect(screen.getByTestId('account-logout-confirm')).not.toBeDisabled();
  logout.mockResolvedValueOnce(undefined);
  fireEvent.press(screen.getByTestId('account-logout-confirm'));
  await waitFor(() => expect(logout).toHaveBeenCalledTimes(2));
});
