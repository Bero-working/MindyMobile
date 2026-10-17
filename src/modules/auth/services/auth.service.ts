import { apiInstances } from '@/config/http/apiInstance.config';
import {
  authResponseSchema,
  invalidAuthResponse,
  sessionUserSchema,
  type SessionUser,
  type AuthenticatedSession,
} from '../schemas/authResponse.schema';
import type {
  AuthResult,
  LoginValues,
  RegisterPayload,
} from '../types/auth.type';

export const authService = {
  async login({ email, password }: LoginValues): Promise<AuthenticatedSession> {
    const response = await apiInstances.service.post<AuthResult, LoginValues>(
      'auth/login',
      { email, password }
    );
    const parsed = authResponseSchema.safeParse(response);
    if (!parsed.success) throw invalidAuthResponse();
    return parsed.data;
  },
  async register({
    displayName,
    email,
    password,
    phone,
  }: RegisterPayload): Promise<void> {
    await apiInstances.service.post<void, RegisterPayload>('auth/register', {
      displayName,
      email,
      password,
      ...(phone ? { phone } : {}),
    });
  },
  async resend(email: string): Promise<void> {
    await apiInstances.service.post<void, { email: string }>(
      'auth/email/resend',
      { email }
    );
  },
  async me(signal?: AbortSignal): Promise<SessionUser> {
    const response = await apiInstances.service.get<SessionUser>(
      'auth/me',
      signal ? { signal } : {}
    );
    const parsed = sessionUserSchema.safeParse(response);
    if (!parsed.success) throw invalidAuthResponse();
    return parsed.data;
  },
  async logout(): Promise<void> {
    await apiInstances.service.post<void, undefined>('auth/logout', undefined);
  },
};
