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
  deferred,
} from '../../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import { usePaymentQuery } from './usePaymentQuery';
import { AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  enrollmentDto,
  learningPage,
} from '../../../../tests/fixtures/learning';
let calls = 0;
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  jest
    .mocked(AppState.addEventListener)
    .mockImplementation(() => ({ remove: jest.fn() }));
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
  jest.restoreAllMocks();
  mockServer.resetHandlers();
  jest.useRealTimers();
});
afterAll(() => mockServer.close());
it('resumes an existing PayOS order but rechecks review state before retrying its link', async () => {
  let review = false;
  mockServer.use(
    http.get(base + '/me/classes', () =>
      HttpResponse.json(
        learningPage([
          {
            ...enrollmentDto(),
            enrollmentStatus: 'PENDING_PAYMENT',
            accessMode: 'NONE',
            accessReason: 'PENDING_PAYOS',
            canViewClass: false,
            canViewSchedule: false,
            order: {
              orderId: id(500),
              orderCode: 'ORDER500',
              orderStatus: 'PENDING',
              paymentType: 'PAYOS',
              expiresAt: '2099-01-01T00:00:00Z',
              paidAt: null,
              requiresReview: review,
            },
          },
        ])
      )
    )
  );
  const { result } = renderHookWithProviders(() =>
    usePaymentQuery(id(500), true)
  );
  await waitFor(() =>
    expect(result.current.payment?.qrCode).toBe('000201SAMPLE')
  );
  expect(calls).toBe(1);
  review = true;
  act(() => result.current.onRetry());
  await waitFor(() =>
    expect(result.current.errorCode).toBe('PAYMENT_ORDER_INVALID')
  );
  expect(result.current.payment).toBeNull();
  expect(calls).toBe(1);
});
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
  'shows the verified %s ticket without creating a link',
  async (status) => {
    mockServer.use(
      http.get(base + '/me/orders/:id', () =>
        HttpResponse.json({ ...apiOrder(), status, payment: null })
      )
    );
    const { result } = renderHookWithProviders(() => usePaymentQuery(id(500)));
    await waitFor(() => expect(result.current.result?.state).toBe(status));
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

it('GETs before retry and shows late PAID instead of creating a second payment', async () => {
  let paid = false;
  mockServer.use(
    http.get(base + '/me/orders/:id', () =>
      HttpResponse.json({
        ...apiOrder(),
        status: paid ? 'PAID' : 'PENDING',
        payment: null,
      })
    )
  );
  const { result } = renderHookWithProviders(() => usePaymentQuery(id(500)));
  await waitFor(() => expect(calls).toBe(1));
  paid = true;
  act(() => {
    result.current.onRetry();
    result.current.onRetry();
  });
  await waitFor(() => expect(result.current.result?.state).toBe('PAID'));
  expect(calls).toBe(1);
});
it('does not start a request while the route is blurred', async () => {
  const { result } = renderHookWithProviders(() =>
    usePaymentQuery(id(500), false, false)
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(calls).toBe(0);
  expect(result.current.order).toBeNull();
});

it('aborts polling on blur and verifies again on focus without recreating a valid link', async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  let reads = 0;
  mockServer.use(
    http.get(base + '/me/orders/:id', () => {
      reads++;
      return HttpResponse.json({ ...apiOrder(), payment: apiPayment() });
    })
  );
  let active = true;
  const view = renderHookWithProviders(() =>
    usePaymentQuery(id(500), false, active)
  );
  await waitFor(() => expect(view.result.current.payment?.qrCode).toBeTruthy());
  active = false;
  view.rerender(undefined);
  const count = reads;
  await act(async () => {
    await jest.advanceTimersByTimeAsync(30000);
  });
  expect(reads).toBe(count);
  active = true;
  view.rerender(undefined);
  await waitFor(() => expect(reads).toBe(count + 1));
  expect(calls).toBe(0);
  view.unmount();
});
it('aborts on background and reads fresh status when returning to the foreground', async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  const listeners = new Set<(state: AppStateStatus) => void>();
  const change = (state: AppStateStatus) =>
    listeners.forEach((listener) => listener(state));
  const subscription = jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_, listener) => {
      listeners.add(listener);
      return { remove: () => listeners.delete(listener) };
    });
  let reads = 0;
  mockServer.use(
    http.get(base + '/me/orders/:id', () => {
      reads++;
      return HttpResponse.json({ ...apiOrder(), payment: apiPayment() });
    })
  );
  const view = renderHookWithProviders(() => usePaymentQuery(id(500)));
  await waitFor(() => expect(view.result.current.payment?.qrCode).toBeTruthy());
  act(() => change('background'));
  const count = reads;
  await act(async () => {
    await jest.advanceTimersByTimeAsync(30000);
  });
  expect(reads).toBe(count);
  act(() => change('active'));
  await waitFor(() => expect(reads).toBe(count + 1));
  view.unmount();
  subscription.mockRestore();
});
it('hides old results immediately after logout and ignores late responses', async () => {
  const gate = deferred();
  let started = false;
  mockServer.use(
    http.get(base + '/me/orders/:id', async () => {
      started = true;
      await gate.promise;
      return HttpResponse.json({
        ...apiOrder(),
        status: 'PAID',
        payment: null,
      });
    })
  );
  const view = renderHookWithProviders(() => usePaymentQuery(id(500)));
  await waitFor(() => expect(started).toBe(true));
  act(() => useStore.setState({ sessionUser: null, generation: 11 }));
  gate.resolve();
  await act(async () => {
    await Promise.resolve();
  });
  expect(view.result.current.order).toBeNull();
  expect(view.result.current.result).toBeUndefined();
  expect(calls).toBe(0);
});
it('invalidates only the current student caches after PAID and keeps success if refetch fails', async () => {
  const gate = deferred();
  mockServer.use(
    http.get(base + '/me/orders/:id', async () => {
      await gate.promise;
      return HttpResponse.json({
        ...apiOrder(),
        status: 'PAID',
        payment: null,
      });
    })
  );
  const view = renderHookWithProviders(() => ({
    payment: usePaymentQuery(id(500)),
    client: useQueryClient(),
  }));
  const client = view.result.current.client;
  client.setQueryDefaults(['student-learning'], { gcTime: Infinity });
  const own = ['student-learning', student.id, 10, 'classes', 'current'];
  const other = ['student-learning', id(998), 10, 'classes', 'current'];
  client.setQueryData(own, { marker: true });
  client.setQueryData(other, { marker: true });
  const originalInvalidate = client.invalidateQueries.bind(client);
  const invalidate = jest
    .spyOn(client, 'invalidateQueries')
    .mockImplementation(async (filters, options) => {
      await originalInvalidate(filters, options);
      throw new Error('Refetch unavailable');
    });
  gate.resolve();
  await waitFor(() =>
    expect(view.result.current.payment.result?.state).toBe('PAID')
  );
  expect(client.getQueryState(own)?.isInvalidated).toBe(true);
  expect(client.getQueryState(other)?.isInvalidated).toBe(false);
  expect(invalidate).toHaveBeenCalledTimes(4);
  act(() => view.result.current.payment.onRetry());
  await act(async () => {
    await Promise.resolve();
  });
  expect(view.result.current.payment.result?.state).toBe('PAID');
  expect(calls).toBe(0);
  invalidate.mockRestore();
});

it('ignores the previous order response after switching the route order id', async () => {
  const gate = deferred();
  let oldStarted = false;
  mockServer.use(
    http.get(base + '/me/orders/:id', async ({ params }) => {
      if (params.id === id(500)) {
        oldStarted = true;
        await gate.promise;
      }
      return HttpResponse.json({
        ...apiOrder(),
        id: params.id,
        status: params.id === id(500) ? 'PAID' : 'CANCELLED',
        payment: null,
      });
    })
  );
  let orderId = id(500);
  const view = renderHookWithProviders(() => usePaymentQuery(orderId));
  await waitFor(() => expect(oldStarted).toBe(true));
  orderId = id(501);
  view.rerender(undefined);
  await waitFor(() =>
    expect(view.result.current.result?.state).toBe('CANCELLED')
  );
  gate.resolve();
  await act(async () => {
    await Promise.resolve();
  });
  expect(view.result.current.order?.id).toBe(id(501));
  expect(view.result.current.result?.state).toBe('CANCELLED');
  expect(calls).toBe(0);
});
