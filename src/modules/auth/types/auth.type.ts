import type { ImageSourcePropType } from 'react-native';

export type UserRole = 'STUDENT' | 'MENTOR' | 'MANAGER' | 'ADMIN';
export type AuthResult = {
  user: {
    id: string;
    email: string;
    displayName: string;
    phone: string | null;
    role: UserRole;
    status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
    lastLoginAt: string | null;
    createdAt: string;
  };
  accessTokenExpiresAt: string;
};
export type LoginValues = { email: string; password: string };
export type RegisterValues = {
  displayName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};
export type RegisterPayload = Omit<
  RegisterValues,
  'confirmPassword' | 'phone'
> & { phone?: string };
export type AuthScreenProps = {
  onBack?: (() => void) | undefined;
  mascot?: ImageSourcePropType | undefined;
};
export type LoginProps = AuthScreenProps & {
  onLogin?: ((values: LoginValues) => Promise<AuthResult>) | undefined;
  onAuthenticated?: ((result: AuthResult) => void) | undefined;
  onRegister?: (() => void) | undefined;
};
export type RegisterProps = AuthScreenProps & {
  onRegister?: ((values: RegisterPayload) => Promise<void>) | undefined;
  onResend?: ((email: string) => Promise<void>) | undefined;
  onLogin?: (() => void) | undefined;
};
