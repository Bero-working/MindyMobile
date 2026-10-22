import { renderHook } from '@testing-library/react-native';
import { env } from '@/config/env';
import { usePaymentController } from './hooks/usePaymentController';
jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: { setString: jest.fn() },
}));
it('never assigns sample bank information in production', () => {
  const previous = env.APP_ENV;
  env.APP_ENV = 'production';
  const view = renderHook(() => usePaymentController());
  expect(view.result.current.bankInfo).toBeNull();
  env.APP_ENV = 'development';
  view.rerender({});
  expect(view.result.current.bankInfo).not.toBeNull();
  view.unmount();
  env.APP_ENV = previous;
});

import '@/config/i18n.config';
