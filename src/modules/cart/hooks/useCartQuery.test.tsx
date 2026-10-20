import '../../../../tests/mocks/nativeUi';
import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL as base } from '../../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../../tests/utils/renderWithProviders';
import {
  apiCartItem,
  commerceId as id,
  deferred,
  student,
} from '../../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import { useCartActions, useCartQuery } from './useCartQuery';
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() =>
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 10,
  })
);
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
it('does not let an older in-flight GET overwrite the authoritative POST cart response', async () => {
  const gate = deferred();
  let started = false,
    getFinished = false;
  mockServer.use(
    http.get(base + '/me/cart', async () => {
      started = true;
      await gate.promise;
      getFinished = true;
      return HttpResponse.json({ items: [], totalAmount: 0 });
    }),
    http.post(base + '/me/cart/items', () =>
      HttpResponse.json(
        { items: [apiCartItem(10)], totalAmount: 1500000 },
        { status: 201 }
      )
    )
  );
  const { result } = renderHookWithProviders(() => ({
    query: useCartQuery(),
    actions: useCartActions(),
  }));
  await waitFor(() => expect(started).toBe(true));
  await act(async () => {
    await result.current.actions.add(id(10));
  });
  await waitFor(() => expect(result.current.query.data?.items).toHaveLength(1));
  gate.resolve();
  await waitFor(() => expect(getFinished).toBe(true));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(result.current.query.data?.items).toHaveLength(1);
});
it('uses separate caches for different session generations', async () => {
  let calls = 0;
  mockServer.use(
    http.get(base + '/me/cart', () =>
      HttpResponse.json({
        items: ++calls === 1 ? [apiCartItem(10)] : [],
        totalAmount: calls === 1 ? 1500000 : 0,
      })
    )
  );
  const { result } = renderHookWithProviders(useCartQuery);
  await waitFor(() => expect(result.current.data?.items).toHaveLength(1));
  act(() => useStore.setState({ generation: 11 }));
  expect(result.current.data).toBeUndefined();
  await waitFor(() => expect(result.current.data?.items).toHaveLength(0));
});

it('fetches a new server cart after deletion instead of reusing a GET started before the mutation', async () => {
  const gate = deferred();
  let reads = 0;
  let items = [apiCartItem(10)];
  mockServer.use(
    http.get(base + '/me/cart', async () => {
      const snapshot = [...items];
      if (++reads === 2) await gate.promise;
      return HttpResponse.json({
        items: snapshot,
        totalAmount: snapshot.length * 1500000,
      });
    }),
    http.delete(base + '/me/cart/items/:id', () => {
      items = [];
      return new HttpResponse(null, { status: 204 });
    })
  );
  const { result } = renderHookWithProviders(() => ({
    query: useCartQuery(),
    actions: useCartActions(),
  }));
  await waitFor(() => expect(result.current.query.data?.items).toHaveLength(1));
  let oldRead = Promise.resolve();
  act(() => {
    oldRead = result.current.query.refetch().then(() => {});
  });
  await waitFor(() => expect(reads).toBe(2));
  let latest: { items: object[] } | undefined;
  await act(async () => {
    await result.current.actions.remove(id(10));
    const refreshed = result.current.actions.refresh();
    await new Promise((resolve) => setTimeout(resolve, 20));
    gate.resolve();
    latest = await refreshed;
    await oldRead;
  });
  expect(latest?.items).toEqual([]);
  expect(result.current.query.data?.items).toEqual([]);
});
