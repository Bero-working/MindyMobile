import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  scopeKey,
  useStudentScope,
  type StudentScope,
} from '@/shared/hooks/useStudentScope';
import { cartService } from '../services/cart.service';
import type { Cart } from '../types/cart.type';

export const cartQueryKeys = {
  cart: (scope: StudentScope) => ['cart', ...scopeKey(scope)] as const,
};
export function useCartQuery() {
  const scope = useStudentScope();
  return useQuery({
    queryKey: cartQueryKeys.cart(scope),
    queryFn: ({ signal }) => cartService.get(signal),
    enabled: scope.enabled,
  });
}
// No optimistic updates (ADR-0011): the cache changes only from server responses.
export function useCartActions() {
  const scope = useStudentScope();
  const client = useQueryClient();
  const key = cartQueryKeys.cart(scope);
  return {
    add: async (classId: string) => {
      const cart = await cartService.add(classId);
      await client.cancelQueries({ queryKey: key, exact: true });
      client.setQueryData<Cart>(key, cart);
    },
    remove: (classId: string) => cartService.remove(classId),
    refresh: async () => {
      // A read started before a mutation must not satisfy its follow-up refresh.
      await client.cancelQueries({ queryKey: key, exact: true });
      return client.fetchQuery({
        queryKey: key,
        queryFn: ({ signal }) => cartService.get(signal),
        staleTime: 0,
      });
    },
    afterCheckout: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: key, exact: true }),
        client.invalidateQueries({
          queryKey: ['student-learning', ...scopeKey(scope)],
        }),
        client.invalidateQueries({
          queryKey: ['home', ...scopeKey(scope), 'schedule'],
        }),
      ]);
    },
  };
}
