import '../../../../tests/mocks/nativeUi';
import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL as base } from '../../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../../tests/utils/renderWithProviders';
import {
  apiOrder,
  apiPayment,
  commerceId as id,
  student,
} from '../../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import { usePaymentQuery } from './usePaymentQuery';
let calls = 0;
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  calls = 0;
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 10,
  });
  mockServer.use(
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({ ...apiOrder(), payment: null })
    ),
    http.post(base + '/me/orders/:id/payments/payos', () => {
      calls++;
      return HttpResponse.json(apiPayment(), { status: 201 });
    })
  );
});
afterEach(() => {
  mockServer.resetHandlers();
  jest.useRealTimers();
});
afterAll(() => mockServer.close());
it('creates a QR for a pending order and can explicitly retry the safe link endpoint', async () => {
  const { result } = renderHookWithProviders(() => usePaymentQuery(id(500)));
  await waitFor(() =>
    expect(result.current.payment?.qrCode).toBe('000201SAMPLE')
  );
  expect(result.current.order?.id).toBe(id(500));
  expect(calls).toBe(1);
  act(() => result.current.onRetry());
  await waitFor(() => expect(calls).toBe(2));
});
it.each(['PAID', 'CANCELLED', 'EXPIRED'])(
  'rejects %s orders without creating a link',
  async (status) => {
    mockServer.use(
      http.get(base + '/me/orders/:id', () =>
        HttpResponse.json({ ...apiOrder(), status, payment: null })
      )
    );
    const { result } = renderHookWithProviders(() => usePaymentQuery(id(500)));
    await waitFor(() =>
      expect(result.current.errorCode).toBe('PAYMENT_ORDER_INVALID')
    );
    expect(calls).toBe(0);
  }
);
it.each([
  [503, 'PAYMENT_UNAVAILABLE'],
  [422, 'PAYMENT_AMOUNT_INVALID'],
  [409, 'PAYMENT_ORDER_INVALID'],
])(
  'surfaces %s %s without auto retrying a failed link',
  async (status, code) => {
    mockServer.use(
      http.post(base + '/me/orders/:id/payments/payos', () => {
        calls++;
        return HttpResponse.json(
          { statusCode: status, code, message: code },
          { status }
        );
      })
    );
    const { result } = renderHookWithProviders(() => usePaymentQuery(id(500)));
    await waitFor(() => expect(result.current.errorCode).toBe(code));
    expect(calls).toBe(1);
  }
);
it.each([
  [404, 'ORDER_NOT_FOUND'],
  [403, 'ORDER_ACCESS_DENIED'],
])('shows %s %s without requesting PayOS', async (status, code) => {
  mockServer.use(
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({ statusCode: status, code, message: code }, { status })
    )
  );
  const { result } = renderHookWithProviders(() => usePaymentQuery(id(500)));
  await waitFor(() => expect(result.current.orderErrorCode).toBe(code));
  expect(calls).toBe(0);
});
it('stops a CREATING retry when the student session becomes unready', async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  mockServer.use(
    http.post(base + '/me/orders/:id/payments/payos', () => {
      calls++;
      return HttpResponse.json(apiPayment('CREATING', null), { status: 201 });
    })
  );
  const { result, unmount } = renderHookWithProviders(() =>
    usePaymentQuery(id(500))
  );
  await waitFor(() => expect(calls).toBe(1));
  await act(async () => {
    await Promise.resolve();
  });
  act(() => useStore.setState({ bootstrapStatus: 'idle' }));
  await act(async () => {
    await jest.advanceTimersByTimeAsync(2500);
  });
  expect(result.current.status).toBe('loading');
  expect(calls).toBe(1);
  unmount();
});
