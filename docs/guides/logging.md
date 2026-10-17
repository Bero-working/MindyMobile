# Logging

Cách ghi log trong app: dùng `logger`, che dữ liệu nhạy cảm, gửi lỗi production qua reporter. Đọc khi cần log hoặc
xử lý lỗi.

## Quy tắc

- Dùng `logger`. **KHÔNG** gọi `console.*` trực tiếp ở nơi khác.
- `logger.ts` là file **duy nhất** được `eslint-disable no-console`.
- `debug`, `info` chỉ in khi `__DEV__`. `warn`, `error` luôn in. `error` ở production gửi qua reporter
  (gắn Crashlytics/Sentry sau bằng `setErrorReporter`).
- Che dữ liệu nhạy cảm: `password`, `token`, `cookie`, `set-cookie`, `authorization`.
- Không log PII (email, số điện thoại) ngoài dev.
- Log lỗi API kèm `code` và `requestId`.
- File này thay cho `logger` trong `src/ignoreWarnings.ts`. Khi chuyển, sửa import trong `http.config.ts`
  (Phase 0.6).

## `src/shared/utilities/logger.ts`

File đã triển khai ở Phase 0.6. Reporter nhận context đã được che; PII theo key cũng được che ở production. Mẫu nền:

```ts
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
      SENSITIVE_KEYS.includes(key.toLowerCase()) ? '[REDACTED]' : redact(item),
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
      reportError?.(message, error, context);
    }
  },
};
```
