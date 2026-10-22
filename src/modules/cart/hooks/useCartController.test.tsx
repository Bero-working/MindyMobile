import '../../../../tests/mocks/nativeUi';
import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL as base } from '../../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../../tests/utils/renderWithProviders';
import {
  apiCartItem,
  apiOrder,
  apiPage,
  commerceId as id,
  deferred,
  student,
} from '../../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import '@/config/i18n.config';
import { useCartController } from './useCartController';
let items = [apiCartItem(10)],
  checkoutCalls = 0,
  cartReads = 0;
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  items = [apiCartItem(10)];
  checkoutCalls = cartReads = 0;
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 10,
  });
  mockServer.use(
    http.get(base + '/me/cart', () => {
      cartReads++;
      return HttpResponse.json({ items, totalAmount: items.length * 1500000 });
    }),
    http.post(base + '/me/cart/checkout', async ({ request }) => {
      checkoutCalls++;
      expect(await request.json()).toEqual({ paymentType: 'PAYOS' });
      items = [];
      return HttpResponse.json({ orders: [apiOrder()] }, { status: 201 });
    })
  );
});
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
async function setup() {
  const navigate = jest.fn();
  const view = renderHookWithProviders(() => useCartController(navigate));
  await waitFor(() => expect(view.result.current.status).toBe('success'));
  return { ...view, navigate };
}
it('checks out once, refetches the emptied cart and opens the returned order', async () => {
  const { result, navigate } = await setup();
  await act(async () => {
    await Promise.all([
      result.current.onCheckout(),
      result.current.onCheckout(),
    ]);
  });
  expect(checkoutCalls).toBe(1);
  expect(navigate).toHaveBeenCalledWith(id(500));
  await waitFor(() => expect(result.current.cart.items).toEqual([]));
  expect(cartReads).toBeGreaterThan(1);
});
it.each([0, 503])(
  'does not retry checkout with unknown outcome (%s) and verifies the exact order',
  async (status) => {
    mockServer.use(
      http.post(base + '/me/cart/checkout', () => {
        checkoutCalls++;
        return status === 0
          ? HttpResponse.error()
          : HttpResponse.json(
              { statusCode: status, code: 'TEMPORARY', message: 'failed' },
              { status }
            );
      }),
      http.get(base + '/me/orders', () =>
        HttpResponse.json(apiPage([apiOrder([id(11)]), apiOrder()]))
      )
    );
    const { result, navigate } = await setup();
    await act(async () => {
      await result.current.onCheckout();
    });
    expect(result.current.checkoutUnknown).toBe(true);
    await act(async () => {
      await result.current.onCheckout();
    });
    expect(checkoutCalls).toBe(1);
    expect(navigate).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.onVerify();
    });
    expect(navigate).toHaveBeenCalledWith(id(500));
    expect(checkoutCalls).toBe(1);
  }
);
it.each([true, false])(
  'unlocks an unknown checkout only after verifying no matching order (cart remains: %s)',
  async (remains) => {
    mockServer.use(
      http.post(base + '/me/cart/checkout', () => HttpResponse.error()),
      http.get(base + '/me/orders', () => HttpResponse.json(apiPage([])))
    );
    const { result, navigate } = await setup();
    await act(async () => {
      await result.current.onCheckout();
    });
    if (!remains) items = [];
    await act(async () => {
      await result.current.onVerify();
    });
    expect(result.current.checkoutUnknown).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(!!result.current.checkoutError).toBe(!remains);
  }
);
it('reports CLASS_FULL without navigation and refetches current cart', async () => {
  mockServer.use(
    http.post(base + '/me/cart/checkout', () =>
      HttpResponse.json(
        { statusCode: 409, code: 'CLASS_FULL', message: 'full' },
        { status: 409 }
      )
    )
  );
  const { result, navigate } = await setup();
  await act(async () => {
    await result.current.onCheckout();
  });
  expect(result.current.checkoutUnknown).toBe(false);
  expect(result.current.checkoutError).toBe('Lớp đã hết chỗ.');
  expect(navigate).not.toHaveBeenCalled();
  expect(cartReads).toBeGreaterThan(1);
});
it('treats a missing cart item as synchronized and still refetches', async () => {
  mockServer.use(
    http.delete(base + '/me/cart/items/:id', () => {
      items = [];
      return HttpResponse.json(
        { statusCode: 404, code: 'CART_ITEM_NOT_FOUND', message: 'missing' },
        { status: 404 }
      );
    })
  );
  const { result } = await setup();
  await act(async () => {
    await result.current.onRemove(id(10));
  });
  expect(result.current.checkoutError).toBeNull();
  expect(result.current.cart.items).toEqual([]);
});

it('does not navigate if the checkout completes after leaving the sheet', async () => {
  const gate = deferred();
  let started = false;
  mockServer.use(
    http.post(base + '/me/cart/checkout', async () => {
      started = true;
      await gate.promise;
      return HttpResponse.json({ orders: [apiOrder()] }, { status: 201 });
    })
  );
  const { result, navigate, unmount } = await setup();
  let done = Promise.resolve();
  act(() => {
    done = result.current.onCheckout();
  });
  await waitFor(() => expect(started).toBe(true));
  unmount();
  await act(async () => {
    gate.resolve();
    await done;
  });
  expect(navigate).not.toHaveBeenCalled();
});
