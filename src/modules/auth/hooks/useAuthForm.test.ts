import { act, renderHook } from '@testing-library/react-native';
import { ApiError } from '@/shared/utilities/apiError';
import { useAuthForm } from './useAuthForm';
import { loginSchema } from '../schemas/auth.schema';

it('requests focus for the first invalid field on submit and the recognized server field on 422', async () => {
  const onInvalid = jest.fn();
  const { result } = renderHook(() =>
    useAuthForm({
      initial: { email: '', password: '' },
      schema: loginSchema,
      submit: async () => {
        throw new ApiError({
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: 'Raw',
          details: ['password is invalid'],
        });
      },
      onSuccess: jest.fn(),
      onInvalid,
    })
  );
  await act(async () => result.current.send());
  expect(onInvalid).toHaveBeenLastCalledWith('email');
  act(() => {
    result.current.change('email', 'a@example.test');
    result.current.change('password', 'x');
  });
  await act(async () => result.current.send());
  expect(onInvalid).toHaveBeenLastCalledWith('password');
});

it('does not deliver a success callback when the pending form has unmounted', async () => {
  let finish: (() => void) | undefined;
  const onSuccess = jest.fn();
  const { result, unmount } = renderHook(() =>
    useAuthForm({
      initial: { email: 'a@example.test', password: 'x' },
      schema: loginSchema,
      submit: () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
      onSuccess,
    })
  );
  act(() => {
    result.current.send();
  });
  unmount();
  await act(async () => finish?.());
  expect(onSuccess).not.toHaveBeenCalled();
});
