import '../../../tests/mocks/nativeUi';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Text } from 'react-native';
import i18n from '@/config/i18n.config';
import { ApiError } from '@/shared/utilities/apiError';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { AuthShell } from './components/AuthShell';
import {
  loginSchema,
  registerSchema,
  registerPayload,
} from './schemas/auth.schema';
import type { AuthResult, RegisterValues } from './types/auth.type';

const user: AuthResult = {
  user: {
    id: 'student',
    email: 'student@example.test',
    displayName: 'An',
    phone: null,
    role: 'STUDENT',
    status: 'ACTIVE',
    lastLoginAt: null,
    createdAt: '2026-10-01T00:00:00Z',
  },
  accessTokenExpiresAt: '2026-10-17T09:00:00Z',
};
const valid: RegisterValues = {
  displayName: 'An',
  email: 'student@example.test',
  phone: '',
  password: ' secret ',
  confirmPassword: ' secret ',
};
beforeEach(async () => {
  await i18n.changeLanguage('vi-VN');
});

function fillLogin(password = ' secret ') {
  fireEvent.changeText(
    screen.getByTestId('login-email-input'),
    'student@example.test'
  );
  fireEvent.changeText(screen.getByTestId('login-password-input'), password);
}
function fillRegister() {
  for (const [field, value] of Object.entries(valid)) {
    const id = {
      displayName: 'display-name',
      confirmPassword: 'confirm-password',
      email: 'email',
      password: 'password',
      phone: 'phone',
    }[field];
    fireEvent.changeText(screen.getByTestId(`register-${id}-input`), value);
  }
}

describe('auth foundation and Welcome', () => {
  it('keeps brand text out of the Auth artwork and provides the design placeholders', () => {
    const view = render(
      <WelcomeScreen
        onLogin={jest.fn()}
        onRegister={jest.fn()}
      />
    );
    expect(screen.queryByText(i18n.t('auth.brandName'))).toBeNull();
    view.unmount();
    render(<LoginScreen />);
    expect(screen.getByTestId('login-email-input').props.placeholder).toBe(
      'ten@email.com'
    );
    expect(screen.getByTestId('login-password-input').props.placeholder).toBe(
      '••••••••'
    );
  });
  it('renders the supplied brand mascot as decoration without a repeated screen-reader announcement', () => {
    render(
      <AuthShell>
        <Text>Content</Text>
      </AuthShell>
    );
    expect(screen.getByTestId('auth-mascot').props.accessible).toBe(false);
  });
  it('renders scrollable shell content and provides intentional Welcome callbacks', () => {
    const login = jest.fn();
    const register = jest.fn();
    const view = render(
      <AuthShell>
        <Text>Content</Text>
      </AuthShell>
    );
    expect(screen.getByText('Content')).toBeTruthy();
    view.unmount();
    render(
      <WelcomeScreen
        onLogin={login}
        onRegister={register}
      />
    );
    fireEvent.press(screen.getByTestId('welcome-login-button'));
    fireEvent.press(screen.getByTestId('welcome-register-button'));
    expect(login).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Google/)).toBeNull();
  });
});

describe('Login', () => {
  it.each([0, 1, 128, 129])(
    'validates the login password length %i',
    (length) => {
      expect(
        loginSchema.safeParse({
          email: 'a@example.test',
          password: 'x'.repeat(length),
        }).success
      ).toBe(length >= 1 && length <= 128);
    }
  );
  it('blocks invalid submit and validates on blur', async () => {
    const login = jest.fn(async () => user);
    render(<LoginScreen onLogin={login} />);
    fireEvent.changeText(screen.getByTestId('login-email-input'), 'wrong');
    fireEvent(screen.getByTestId('login-email-input'), 'blur');
    expect(screen.getByText(i18n.t('auth.validation.email'))).toBeTruthy();
    fireEvent.press(screen.getByTestId('login-submit-button'));
    expect(login).not.toHaveBeenCalled();
  });
  it('locks duplicate submissions, preserves password whitespace and hands off staff without a student redirect', async () => {
    let resolveLogin: ((value: AuthResult) => void) | undefined;
    const login = jest.fn(
      () =>
        new Promise<AuthResult>((resolve) => {
          resolveLogin = resolve;
        })
    );
    const success = jest.fn();
    render(
      <LoginScreen
        onLogin={login}
        onAuthenticated={success}
      />
    );
    fillLogin();
    fireEvent.press(screen.getByTestId('login-submit-button'));
    fireEvent(screen.getByTestId('login-password-input'), 'submitEditing');
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith({
      email: 'student@example.test',
      password: ' secret ',
    });
    expect(screen.getByTestId('login-submit-button')).toBeDisabled();
    await act(async () =>
      resolveLogin?.({ ...user, user: { ...user.user, role: 'MENTOR' } })
    );
    expect(success).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ role: 'MENTOR' }),
      })
    );
    expect(success).toHaveBeenCalledTimes(1);
  });
  it('shows generic credentials errors with request id and keeps entered values', async () => {
    render(
      <LoginScreen
        onLogin={async () => {
          throw new ApiError({
            statusCode: 401,
            code: 'INVALID_CREDENTIALS',
            message: 'Do not display server copy',
            requestId: 'req-1',
          });
        }}
      />
    );
    fillLogin();
    fireEvent.press(screen.getByTestId('login-submit-button'));
    await waitFor(() =>
      expect(screen.getByTestId('login-form-error')).toBeTruthy()
    );
    expect(screen.getByText(i18n.t('errors.INVALID_CREDENTIALS'))).toBeTruthy();
    expect(screen.getByText(/req-1/)).toBeTruthy();
    expect(screen.getByTestId('login-password-input').props.value).toBe(
      ' secret '
    );
    expect(screen.queryByText('Do not display server copy')).toBeNull();
  });
  it('disables submission with an explanation when no integration is supplied', () => {
    render(<LoginScreen />);
    expect(screen.getByTestId('login-submit-button')).toBeDisabled();
    expect(
      screen.getByText(i18n.t('auth.integrationUnavailable'))
    ).toBeTruthy();
  });
});

describe('Register', () => {
  it.each([1, 150, 151])('validates display name length %i', (length) => {
    expect(
      registerSchema.safeParse({ ...valid, displayName: 'A'.repeat(length) })
        .success
    ).toBe(length <= 150);
  });
  it('keeps check-email after a failed resend and blocks duplicate resends', async () => {
    let rejectResend: ((reason: Error) => void) | undefined;
    const onResend = jest.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectResend = reject;
        })
    );
    render(
      <RegisterScreen
        onRegister={async () => undefined}
        onResend={onResend}
      />
    );
    fillRegister();
    fireEvent.press(screen.getByTestId('register-submit-button'));
    await waitFor(() =>
      expect(screen.getByTestId('register-check-email')).toBeTruthy()
    );
    fireEvent.press(screen.getByTestId('register-resend-button'));
    fireEvent.press(screen.getByTestId('register-resend-button'));
    expect(onResend).toHaveBeenCalledTimes(1);
    await act(async () =>
      rejectResend?.(
        new ApiError({
          statusCode: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Raw',
        })
      )
    );
    expect(screen.getByTestId('register-check-email')).toBeTruthy();
    expect(screen.getByText(i18n.t('errors.RATE_LIMIT_EXCEEDED'))).toBeTruthy();
  });
  it.each([5, 6, 128, 129])(
    'validates registration password length %i',
    (length) => {
      const password = 'x'.repeat(length);
      expect(
        registerSchema.safeParse({
          ...valid,
          password,
          confirmPassword: password,
        }).success
      ).toBe(length >= 6 && length <= 128);
    }
  );
  it.each([0, 6, 7, 32, 33])('validates optional phone length %i', (length) => {
    expect(
      registerSchema.safeParse({ ...valid, phone: '1'.repeat(length) }).success
    ).toBe(length === 0 || (length >= 7 && length <= 32));
  });
  it('rejects blank display name and mismatched confirmation; excludes UI-only fields from the payload', () => {
    expect(
      registerSchema.safeParse({ ...valid, displayName: '  ' }).success
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...valid, confirmPassword: 'different' })
        .success
    ).toBe(false);
    expect(registerPayload(valid)).toEqual({
      displayName: 'An',
      email: 'student@example.test',
      password: ' secret ',
    });
  });
  it('shows neutral check-email on accepted registration and resends only on a press', async () => {
    const register = jest.fn(async () => undefined);
    const resend = jest.fn(async () => undefined);
    const onLogin = jest.fn();
    render(
      <RegisterScreen
        onRegister={register}
        onResend={resend}
        onLogin={onLogin}
      />
    );
    fillRegister();
    fireEvent.press(screen.getByTestId('register-submit-button'));
    await waitFor(() =>
      expect(screen.getByTestId('register-check-email')).toBeTruthy()
    );
    expect(register).toHaveBeenCalledWith({
      displayName: 'An',
      email: 'student@example.test',
      password: ' secret ',
    });
    expect(resend).not.toHaveBeenCalled();
    expect(onLogin).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('register-resend-button'));
    await waitFor(() =>
      expect(screen.getByTestId('register-resend-feedback')).toBeTruthy()
    );
    expect(resend).toHaveBeenCalledWith('student@example.test');
    fireEvent.press(screen.getByTestId('register-login-link'));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
  it('preserves registration values and maps known 422 fields without exposing backend text', async () => {
    render(
      <RegisterScreen
        onRegister={async () => {
          throw new ApiError({
            statusCode: 422,
            code: 'VALIDATION_ERROR',
            message: 'Raw error',
            details: ['email must be an email'],
          });
        }}
      />
    );
    fillRegister();
    fireEvent.press(screen.getByTestId('register-submit-button'));
    await waitFor(() =>
      expect(
        screen.getByText(i18n.t('auth.validation.serverField'))
      ).toBeTruthy()
    );
    expect(screen.getByTestId('register-password-input').props.value).toBe(
      ' secret '
    );
    expect(screen.queryByText('Raw error')).toBeNull();
  });
});
