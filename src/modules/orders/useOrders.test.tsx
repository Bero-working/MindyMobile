import '../../../tests/mocks/nativeUi';
import { act, waitFor } from '@testing-library/react-native';
import { useQueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL } from '../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../tests/utils/renderWithProviders';
import { commerceId, student } from '../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import { purchaseKeys, useOrderDetail, useOrders } from './useOrders';
import type { Order, OrderFilter } from './types';

const order: Order = {
  id: commerceId(500),
  orderCode: 'MD500',
  status: 'PENDING',
  paymentType: 'CASH',
  totalAmount: 1500000,
  createdAt: '2026-11-01T01:00:00Z',
  paidAt: null,
  expiresAt: '2099-11-06T12:00:00Z',
  details: [
    {
      id: commerceId(501),
      classId: commerceId(10),
      courseTitle: 'Web',
      className: 'WEB-01',
      quantity: 1,
      priceAmount: 1500000,
      totalAmount: 1500000,
    },
  ],
};

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  mockServer.use(
    http.get(TEST_API_URL + '/courses', () =>
      HttpResponse.json({
        items: [],
        page: 1,
        pageSize: 100,
        total: 0,
      })
    ),
    http.get(
      TEST_API_URL + '/classes/:id',
      () => new HttpResponse(null, { status: 404 })
    )
  );
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 1,
  });
});
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('shows catalog images for paid and expired orders whose classes are no longer public', async () => {
  const expired = { ...order, id: commerceId(502), status: 'EXPIRED' as const };
  const paid = { ...order, status: 'PAID' as const };
  let catalogRequests = 0;
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders', () =>
      HttpResponse.json({
        items: [paid, expired],
        page: 1,
        pageSize: 20,
        total: 2,
      })
    ),
    http.get(TEST_API_URL + '/courses', () => {
      catalogRequests++;
      return HttpResponse.json({
        items: [
          {
            id: commerceId(20),
            title: 'Web',
            imgUrl: 'https://images.mindy.test/web.jpg',
          },
        ],
        page: 1,
        pageSize: 100,
        total: 1,
      });
    })
  );
  const view = renderHookWithProviders(() => useOrders('ALL', true));
  await waitFor(() =>
    expect(
      view.result.current.orders.data?.map((row) => row.details[0]?.imgUrl)
    ).toEqual([
      'https://images.mindy.test/web.jpg',
      'https://images.mindy.test/web.jpg',
    ])
  );
  expect(catalogRequests).toBe(1);
  expect(view.result.current.orders.status).toBe('success');
});

it('loads the matching course cover without blocking orders when a cover is unavailable', async () => {
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders', () =>
      HttpResponse.json({
        items: [order],
        page: 1,
        pageSize: 20,
        total: 1,
      })
    ),
    http.get(TEST_API_URL + '/classes/:id', () =>
      HttpResponse.json({
        id: commerceId(10),
        courseId: commerceId(20),
      })
    ),
    http.get(TEST_API_URL + '/courses/:id', () =>
      HttpResponse.json({
        id: commerceId(20),
        imgUrl: 'https://images.mindy.test/web.jpg',
      })
    )
  );
  const view = renderHookWithProviders(() => useOrders('ALL', true));
  await waitFor(() =>
    expect(view.result.current.orders.data?.[0]?.details[0]?.imgUrl).toBe(
      'https://images.mindy.test/web.jpg'
    )
  );
  expect(view.result.current.orders.status).toBe('success');
});

it('paginates, filters, deduplicates IDs and isolates new sessions', async () => {
  let filter: OrderFilter = 'ALL';
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders', ({ request }) => {
      const params = new URL(request.url).searchParams;
      const page = Number(params.get('page'));
      return HttpResponse.json({
        items: params.get('status') === 'PAID' ? [] : [order],
        page,
        pageSize: 1,
        total: 2,
      });
    })
  );
  const view = renderHookWithProviders(() => useOrders(filter, true));
  await waitFor(() => expect(view.result.current.orders.data).toHaveLength(1));
  await act(async () => {
    view.result.current.onLoadMore();
  });
  await waitFor(() => expect(view.result.current.hasMore).toBe(false));
  expect(view.result.current.orders.data).toHaveLength(1);
  filter = 'PAID';
  view.rerender({});
  expect(view.result.current.orders.data).toBeNull();
  await waitFor(() => expect(view.result.current.orders.data).toEqual([]));
  act(() => useStore.setState({ generation: 2 }));
  expect(view.result.current.orders.data).toBeNull();
});

it('publishes confirmed cancellation and invalidates related lists', async () => {
  let status: Order['status'] = 'PENDING';
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders/:id', () =>
      HttpResponse.json({ ...order, status, payment: null })
    ),
    http.post(TEST_API_URL + '/me/orders/:id/cancel', () => {
      status = 'CANCELLED';
      return HttpResponse.json({ ...order, status });
    })
  );
  const view = renderHookWithProviders(() => ({
    ...useOrderDetail(order.id, true),
    client: useQueryClient(),
  }));
  await waitFor(() =>
    expect(view.result.current.order.data?.status).toBe('PENDING')
  );
  const invalidate = jest.spyOn(
    view.result.current.client,
    'invalidateQueries'
  );
  await act(async () => {
    await view.result.current.onCancel(order.id);
  });
  await waitFor(() =>
    expect(view.result.current.order.data?.status).toBe('CANCELLED')
  );
  expect(invalidate).toHaveBeenCalledWith({
    queryKey: purchaseKeys.lists({
      enabled: true,
      userId: student.id,
      generation: 1,
    }),
  });
});

it('propagates cancellation conflicts without publishing a false success', async () => {
  let posts = 0;
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders/:id', () =>
      HttpResponse.json({ ...order, payment: null })
    ),
    http.post(TEST_API_URL + '/me/orders/:id/cancel', () => {
      posts++;
      return HttpResponse.json(
        { statusCode: 409, code: 'ORDER_NOT_CANCELLABLE', message: 'Conflict' },
        { status: 409 }
      );
    })
  );
  const view = renderHookWithProviders(() => useOrderDetail(order.id, true));
  await waitFor(() =>
    expect(view.result.current.order.data?.id).toBe(order.id)
  );
  await act(async () => {
    await expect(view.result.current.onCancel(order.id)).rejects.toMatchObject({
      code: 'ORDER_NOT_CANCELLABLE',
    });
  });
  expect(posts).toBe(1);
  expect(view.result.current.order.data?.status).toBe('PENDING');
});

it('discards a cancellation result arriving after the session changes', async () => {
  let finish: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    finish = resolve;
  });
  mockServer.use(
    http.get(TEST_API_URL + '/me/orders/:id', () =>
      HttpResponse.json({ ...order, payment: null })
    ),
    http.post(TEST_API_URL + '/me/orders/:id/cancel', async () => {
      await gate;
      return HttpResponse.json({ ...order, status: 'CANCELLED' });
    })
  );
  const view = renderHookWithProviders(() => ({
    ...useOrderDetail(order.id, true),
    client: useQueryClient(),
  }));
  await waitFor(() =>
    expect(view.result.current.order.data?.id).toBe(order.id)
  );
  let cancellation: Promise<void> | undefined;
  act(() => {
    cancellation = view.result.current.onCancel(order.id);
  });
  act(() => useStore.setState({ generation: 2 }));
  await act(async () => {
    finish();
    await cancellation;
  });
  const oldKey = purchaseKeys.detail(
    { enabled: true, userId: student.id, generation: 1 },
    order.id
  );
  expect(
    view.result.current.client.getQueryData<Order>(oldKey)?.status
  ).not.toBe('CANCELLED');
});
