import { useAuthForm } from './useAuthForm';
import { loginSchema } from '../schemas/auth.schema';
import type { LoginProps, LoginValues } from '../types/auth.type';
export function useLoginController(
  { onLogin, onAuthenticated }: LoginProps,
  onInvalid?: (field: keyof LoginValues) => void
) {
  return useAuthForm({
    initial: { email: '', password: '' },
    schema: loginSchema,
    submit: onLogin,
    onSuccess: (result) => onAuthenticated?.(result),
    onInvalid,
  });
}
