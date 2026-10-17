// src/shared/utilities/apiError.ts
import type { ApiErrorBody } from '@/types/api';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: readonly string[];
  readonly requestId: string | undefined;

  constructor(body: ApiErrorBody) {
    super(Array.isArray(body.message) ? body.message.join('\n') : body.message);
    this.name = 'ApiError';
    this.status = body.statusCode;
    this.code = body.code;
    this.details =
      body.details === undefined
        ? []
        : Array.isArray(body.details)
          ? body.details
          : [body.details];
    this.requestId = body.requestId;
  }
}

export const isApiErrorCode = (error: Error, code: string): boolean =>
  error instanceof ApiError && error.code === code;
