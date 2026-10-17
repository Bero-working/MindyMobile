import { useEffect, useRef, useState } from 'react';
import { registerPayload, registerSchema } from '../schemas/auth.schema';
import type { RegisterProps, RegisterValues } from '../types/auth.type';
import { formFailure, useAuthForm, type FormFailure } from './useAuthForm';
export function useRegisterController(
  { onRegister, onResend }: RegisterProps,
  onInvalid?: (field: keyof RegisterValues) => void
) {
  const [email, setEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<FormFailure | null>(null);
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const form = useAuthForm({
    initial: {
      displayName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    schema: registerSchema,
    onInvalid,
    submit: onRegister
      ? (values) => onRegister(registerPayload(values))
      : undefined,
    onSuccess: (_result, values) => {
      setEmail(values.email);
      form.reset();
    },
  });
  const resend = async () => {
    if (lock.current || !email || !onResend) return;
    lock.current = true;
    setResending(true);
    setResent(false);
    setResendError(null);
    try {
      await onResend(email);
      if (mounted.current) setResent(true);
    } catch (error) {
      if (mounted.current)
        setResendError(
          formFailure(error instanceof Error ? error : new Error())
        );
    } finally {
      lock.current = false;
      if (mounted.current) setResending(false);
    }
  };
  return { form, email, resending, resent, resendError, resend };
}
