import { z } from 'zod';
import type { RegisterPayload, RegisterValues } from '../types/auth.type';
const email = z
  .string()
  .trim()
  .min(1, 'auth.validation.required')
  .max(320, 'auth.validation.email')
  .email('auth.validation.email');
export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, 'auth.validation.required')
    .max(128, 'auth.validation.passwordMax'),
});
export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(1, 'auth.validation.required')
      .max(150, 'auth.validation.nameMax')
      .refine((value) => value.trim().length > 0, 'auth.validation.required'),
    email,
    phone: z
      .string()
      .refine(
        (value) => value === '' || (value.length >= 7 && value.length <= 32),
        'auth.validation.phone'
      ),
    password: z
      .string()
      .min(6, 'auth.validation.passwordMin')
      .max(128, 'auth.validation.passwordMax'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth.validation.confirmPassword',
  });
export function registerPayload({
  displayName,
  email: address,
  phone,
  password,
}: RegisterValues): RegisterPayload {
  return {
    displayName,
    email: address.trim(),
    password,
    ...(phone ? { phone } : {}),
  };
}
