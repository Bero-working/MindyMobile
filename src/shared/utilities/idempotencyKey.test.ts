import { createIdempotencyKey } from './idempotencyKey';

it('creates distinct UUID v4 keys for separate intentions', () => {
  const first = createIdempotencyKey();
  const second = createIdempotencyKey();
  const uuidV4 =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  expect(first).toMatch(uuidV4);
  expect(second).toMatch(uuidV4);
  expect(second).not.toBe(first);
});
