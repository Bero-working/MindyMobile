import { ApiError, isApiErrorCode } from './apiError';

it('normalizes array messages and all detail shapes', () => {
  for (const details of [undefined, 'field', ['field']]) {
    const error = new ApiError({
      statusCode: 422,
      code: 'INVALID',
      message: ['A', 'B'],
      ...(details === undefined ? {} : { details }),
    });
    expect(error.message).toBe('A\nB');
    expect(error.details).toEqual(details === undefined ? [] : ['field']);
    expect(isApiErrorCode(error, 'INVALID')).toBe(true);
    expect(isApiErrorCode(error, 'OTHER')).toBe(false);
  }
  expect(isApiErrorCode(new Error('INVALID'), 'INVALID')).toBe(false);
});
