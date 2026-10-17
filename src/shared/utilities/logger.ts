// src/shared/utilities/logger.ts
/* eslint-disable no-console -- logger là nơi duy nhất được gọi console */

type LogPrimitive = string | number | boolean | null | undefined;

export type LogValue =
  | LogPrimitive
  | Error
  | readonly LogValue[]
  | { readonly [key: string]: LogValue };

type LogRecord = { readonly [key: string]: LogValue };

type ErrorReporter = (
  message: string,
  error?: Error,
  context?: LogValue
) => void;

const SENSITIVE_KEYS: readonly string[] = [
  'password',
  'token',
  'cookie',
  'set-cookie',
  'authorization',
];

let reportError: ErrorReporter | null = null;

export const setErrorReporter = (reporter: ErrorReporter): void => {
  reportError = reporter;
};

const isLogArray = (
  value: readonly LogValue[] | LogRecord
): value is readonly LogValue[] => Array.isArray(value);

const redact = (value: LogValue): LogValue => {
  if (value === null || typeof value !== 'object' || value instanceof Error) {
    return value;
  }
  if (isLogArray(value)) {
    return value.map(redact);
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, item]): [string, LogValue] => [
      key,
      SENSITIVE_KEYS.includes(key.toLowerCase()) ||
      (!__DEV__ &&
        ['email', 'phone', 'phonenumber'].includes(key.toLowerCase()))
        ? '[REDACTED]'
        : redact(item),
    ])
  );
};

export const logger = {
  debug: (message: string, ...args: LogValue[]): void => {
    if (__DEV__) {
      console.log('🐛 DEBUG:', message, ...args.map(redact));
    }
  },

  info: (message: string, ...args: LogValue[]): void => {
    if (__DEV__) {
      console.info('ℹ️ INFO:', message, ...args.map(redact));
    }
  },

  warn: (message: string, ...args: LogValue[]): void => {
    console.warn('⚠️ WARN:', message, ...args.map(redact));
  },

  error: (message: string, error?: Error, context?: LogValue): void => {
    console.error(
      '❌ ERROR:',
      message,
      error,
      context === undefined ? '' : redact(context)
    );
    if (!__DEV__) {
      reportError?.(message, error, redact(context));
    }
  },
};
