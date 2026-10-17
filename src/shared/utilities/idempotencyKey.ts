import { v4 } from 'uuid';

/** Create once per intention; reuse the same key and body for retries. */
export const createIdempotencyKey = (): string => v4();
