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
  value: Error | readonly LogValue[] | LogRecord
): value is readonly LogValue[] => Array.isArray(value);

function redact(value: Error): Error;
function redact(value: LogValue, ancestors?: WeakSet<object>): LogValue;
function redact(value: LogValue, ancestors = new WeakSet<object>()): LogValue {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (ancestors.has(value)) return '[Circular]';
  ancestors.add(value);
  if (isLogArray(value)) {
    const items = value.map((item) => redact(item, ancestors));
    ancestors.delete(value);
    return items;
  }
  const fields = Object.fromEntries(
    Object.entries(value).map(([key, item]): [string, LogValue] => [
      key,
      SENSITIVE_KEYS.includes(key.toLowerCase()) ||
      key.toLowerCase().endsWith('token') ||
      (!__DEV__ &&
        ['email', 'phone', 'phonenumber'].includes(key.toLowerCase()))
        ? '[REDACTED]'
        : redact(item, ancestors),
    ])
  );
  ancestors.delete(value);
  if (value instanceof Error) {
    // Copy diagnostics without forwarding the original request/config to reporters.
    return Object.assign(new Error(value.message), fields, {
      name: value.name,
      stack: value.stack,
    });
  }
  return fields;
}

export const logger = {
  debug: (message: string, ...args: LogValue[]): void => {
    if (__DEV__) {
      console.log('🐛 DEBUG:', message, ...args.map((arg) => redact(arg)));
    }
  },

  info: (message: string, ...args: LogValue[]): void => {
    if (__DEV__) {
      console.info('ℹ️ INFO:', message, ...args.map((arg) => redact(arg)));
    }
  },

  warn: (message: string, ...args: LogValue[]): void => {
    console.warn('⚠️ WARN:', message, ...args.map((arg) => redact(arg)));
  },

  error: (message: string, error?: Error, context?: LogValue): void => {
    const safeError = error === undefined ? undefined : redact(error);
    const safeContext = redact(context);
    console.error(
      '❌ ERROR:',
      message,
      safeError,
      safeContext === undefined ? '' : safeContext
    );
    if (!__DEV__) {
      reportError?.(message, safeError, safeContext);
    }
  },
};
