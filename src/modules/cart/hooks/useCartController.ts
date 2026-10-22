import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/shared/utilities/apiError';
import { paymentService } from '@/modules/payment/services/payment.service';
import { cartService } from '../services/cart.service';
import { useCartActions, useCartQuery } from './useCartQuery';

const codeOf = (error: Error) =>
  error instanceof ApiError ? error.code : 'generic';
// A lost or failed-on-server checkout response may still have created the order.
const isUnknownOutcome = (error: Error) =>
  !(error instanceof ApiError) || error.status === 0 || error.status >= 500;
export function useCartController(onOrder: (orderId: string) => void) {
  const { t, i18n } = useTranslation();
  const cart = useCartQuery();
  const actions = useCartActions();
  const busy = useRef(false);
  const mounted = useRef(true);
  const pendingClassIds = useRef<string[]>([]);
  const [removingId, setRemoving] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unknown, setUnknown] = useState(false);
  const message = (code: string) => {
    const key = 'cart.errors.' + code;
    return t(i18n.exists(key) ? key : 'cart.errors.generic');
  };
  useEffect(() => {
    // Always show the server's current cart when the sheet opens.
    mounted.current = true;
    actions.refresh().catch(() => {});
    return () => {
      mounted.current = false;
    };
  }, []);
  const guard = async (task: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    try {
      await task();
    } finally {
      busy.current = false;
    }
  };
  const finish = async (orderId: string) => {
    if (!mounted.current) return;
    setUnknown(false);
    await actions.afterCheckout().catch(() => {});
    if (mounted.current) onOrder(orderId);
  };
  return {
    cart: cart.data ?? { items: [], totalAmount: 0 },
    status: cart.isError
      ? ('error' as const)
      : cart.isPending
        ? ('loading' as const)
        : ('success' as const),
    removingId,
    checkingOut,
    checkoutError: error,
    checkoutUnknown: unknown,
    onRetry: () => {
      cart.refetch().catch(() => {});
    },
    onRemove: (classId: string) =>
      guard(async () => {
        setRemoving(classId);
        setError(null);
        try {
          await actions.remove(classId);
        } catch (cause) {
          if (cause instanceof Error && codeOf(cause) !== 'CART_ITEM_NOT_FOUND')
            setError(message(codeOf(cause)));
        } finally {
          await actions.refresh().catch(() => {});
          setRemoving(null);
        }
      }),
    onCheckout: () =>
      guard(async () => {
        const items = cart.data?.items ?? [];
        if (!items.length || unknown) return;
        pendingClassIds.current = items.map((item) => item.classId);
        setCheckingOut(true);
        setError(null);
        try {
          // Never retried automatically: a retry could create a second order.
          const order = await cartService.checkout();
          await finish(order.id);
        } catch (cause) {
          if (cause instanceof Error && isUnknownOutcome(cause))
            setUnknown(true);
          else {
            setError(
              message(cause instanceof Error ? codeOf(cause) : 'generic')
            );
            await actions.refresh().catch(() => {});
          }
        } finally {
          setCheckingOut(false);
        }
      }),
    onVerify: () =>
      guard(async () => {
        setCheckingOut(true);
        setError(null);
        try {
          const order = await paymentService.findPendingPayosOrder(
            pendingClassIds.current
          );
          if (order) {
            await finish(order.id);
            return;
          }
          const latest = await actions.refresh();
          setUnknown(false);
          if (!latest.items.length) setError(message('generic'));
        } catch {
          setError(message('generic'));
        } finally {
          setCheckingOut(false);
        }
      }),
  };
}
