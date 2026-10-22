import { useEffect, useRef, useState } from 'react';
import type { z } from 'zod';
import { ApiError } from '@/shared/utilities/apiError';

export type FormFailure = { key: string; requestId?: string | undefined };
const errorKeys: Record<string, string> = {
  INVALID_CREDENTIALS: 'errors.INVALID_CREDENTIALS',
  MAIL_DELIVERY_UNAVAILABLE: 'errors.MAIL_DELIVERY_UNAVAILABLE',
  NETWORK_UNAVAILABLE: 'errors.NETWORK_UNAVAILABLE',
  NETWORK_ERROR: 'errors.NETWORK_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'errors.RATE_LIMIT_EXCEEDED',
};
export function formFailure(error: Error): FormFailure {
  return error instanceof ApiError
    ? {
        key:
          error.status === 429
            ? 'errors.RATE_LIMIT_EXCEEDED'
            : (errorKeys[error.code] ?? 'errors.generic'),
        requestId: error.requestId,
      }
    : { key: 'errors.generic' };
}

export function useAuthForm<T extends Record<string, string>, Result>({
  initial,
  schema,
  submit,
  onSuccess,
  onInvalid,
}: {
  initial: T;
  schema: z.ZodType<T>;
  submit: ((values: T) => Promise<Result>) | undefined;
  onSuccess: (result: Result, values: T) => void;
  onInvalid?: ((field: keyof T) => void) | undefined;
}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [failure, setFailure] = useState<FormFailure | null>(null);
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const validate = (field?: keyof T) => {
    const result = schema.safeParse(values);
    const next: Partial<Record<keyof T, string>> = {};
    if (!result.success)
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (
          typeof key === 'string' &&
          key in values &&
          (!field || key === field)
        )
          next[key as keyof T] = issue.message;
      }
    setErrors((current) =>
      field ? { ...current, [field]: next[field] } : next
    );
    return result;
  };
  const change = (field: keyof T, value: string) => {
    if (!lock.current) {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setFailure(null);
    }
  };
  const reset = () => {
    setValues(initial);
    setErrors({});
    setFailure(null);
  };
  const send = async () => {
    if (lock.current || !submit) return;
    const result = validate();
    if (!result.success) {
      const first = result.error.issues[0]?.path[0];
      if (
        typeof first === 'string' &&
        Object.prototype.hasOwnProperty.call(values, first)
      )
        onInvalid?.(first as keyof T);
      return;
    }
    lock.current = true;
    setPending(true);
    setFailure(null);
    try {
      const response = await submit(result.data);
      if (mounted.current) onSuccess(response, result.data);
    } catch (error) {
      if (!mounted.current) return;
      const exception = error instanceof Error ? error : new Error();
      if (exception instanceof ApiError && exception.status === 422) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        for (const detail of exception.details) {
          const field = detail.match(/^([a-zA-Z]+)\b/)?.[1];
          if (field && Object.prototype.hasOwnProperty.call(values, field))
            fieldErrors[field as keyof T] = 'auth.validation.serverField';
        }
        setErrors(fieldErrors);
        const first = Object.keys(fieldErrors)[0];
        if (first) onInvalid?.(first as keyof T);
      }
      setFailure(formFailure(exception));
    } finally {
      lock.current = false;
      if (mounted.current) setPending(false);
    }
  };
  return { values, errors, failure, pending, change, validate, send, reset };
}
