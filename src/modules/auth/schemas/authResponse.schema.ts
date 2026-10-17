import { z } from 'zod';
import { ApiError } from '@/shared/utilities/apiError';

export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(320),
  displayName: z.string().min(1).max(150),
  phone: z.string().nullable(),
  role: z.enum(['STUDENT', 'MENTOR', 'MANAGER', 'ADMIN']),
  status: z.literal('ACTIVE'),
  lastLoginAt: z.string().datetime({ offset: true }).nullable(),
  createdAt: z.string().datetime({ offset: true }),
});
export const authResponseSchema = z.object({
  user: sessionUserSchema,
  accessTokenExpiresAt: z.string().datetime({ offset: true }),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type AuthenticatedSession = z.infer<typeof authResponseSchema>;
export const invalidAuthResponse = () =>
  new ApiError({
    statusCode: 502,
    code: 'INVALID_AUTH_RESPONSE',
    message: 'Invalid authentication response',
  });
