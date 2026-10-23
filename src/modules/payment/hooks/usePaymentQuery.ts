import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  scopeKey,
  useStudentScope,
  type StudentScope,
} from '@/shared/hooks/useStudentScope';
import { useStore } from '@/state/store';
import { ApiError } from '@/shared/utilities/apiError';
import {
  PaymentCancelled,
  paymentService,
  type OrderPayment,
} from '../services/payment.service';
import { learningQueryKeys } from '@/modules/my-classes/hooks/learningQueryKeys';
import { cartQueryKeys } from '@/modules/cart/hooks/useCartQuery';
import { paymentResult } from '../paymentResult';
import { watchPayment } from './watchPayment';
import type { Payment, PaymentOrder } from '../types/payment.type';

export const orderQueryKeys = {
  detail: (scope: StudentScope, orderId: string) =>
    ['orders', ...scopeKey(scope), orderId] as const,
};
type Progress = {
  key: string;
  payment: Payment | null;
  error: ApiError | null;
  busy: boolean;
};
export function usePaymentQuery(
  orderId: string,
  verifyEnrollment = false,
  active = true
) {
  const scope = useStudentScope();
  const { enabled, userId, generation } = scope;
  const client = useQueryClient();
  const key = useMemo(
    () => [
      ...orderQueryKeys.detail({ enabled, userId, generation }, orderId),
      verifyEnrollment ? 'resume' : 'checkout',
    ],
    [enabled, userId, generation, orderId, verifyEnrollment]
  );
  const identity = JSON.stringify(key);
  const order = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => paymentService.order(orderId, signal),
    enabled: false,
    gcTime: 0,
    staleTime: 0,
    retry: false,
  });
  const [foreground, setForeground] = useState(
    AppState.currentState !== 'background' &&
      AppState.currentState !== 'inactive'
  );
  const [retry, setRetry] = useState(0);
  const [progress, setProgress] = useState<Progress>({
    key: identity,
    payment: null,
    error: null,
    busy: true,
  });
  const epoch = useRef(0);
  const retrying = useRef(false);
  const invalidated = useRef('');
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') request.current?.abort();
      setForeground(state === 'active');
    });
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const current = ++epoch.current;
    const controller = new AbortController();
    request.current = controller;
    if (!enabled || !orderId || !active || !foreground) {
      retrying.current = false;
      return () => controller.abort();
    }
    const valid = () => {
      const session = useStore.getState();
      return (
        !controller.signal.aborted &&
        epoch.current === current &&
        session.bootstrapStatus === 'ready' &&
        session.generation === generation &&
        session.sessionUser?.id === userId
      );
    };
    const publishPaid = () => {
      if (invalidated.current === identity) return;
      invalidated.current = identity;
      const currentScope = { enabled, userId, generation };
      for (const queryKey of [
        learningQueryKeys.root(currentScope),
        cartQueryKeys.cart(currentScope),
        ['home', ...scopeKey(currentScope), 'schedule'],
        ['orders', ...scopeKey(currentScope)],
      ]) {
        client.invalidateQueries({ queryKey }).catch(() => {});
      }
    };
    const cached = client.getQueryData<OrderPayment>(key);
    if (cached?.status === 'PAID') {
      publishPaid();
      retrying.current = false;
      return () => controller.abort();
    }
    setProgress((previous) => ({
      key: identity,
      payment: previous.key === identity ? previous.payment : null,
      error: previous.key === identity ? previous.error : null,
      busy: true,
    }));
    watchPayment(orderId, {
      signal: controller.signal,
      verifyEnrollment,
      cancelled: () => !valid(),
      onOrder: (value) => {
        if (!valid()) return;
        client.setQueryData<OrderPayment>(key, (previous) =>
          previous?.status === 'PAID' ? previous : value
        );
        if (value.status === 'PAID') publishPaid();
      },
      onPayment: (value) => {
        if (!valid()) return;
        const payment: Payment | null =
          value.status === 'PENDING' || value.status === 'CREATING'
            ? {
                status: value.status,
                qrCode: value.qrCode,
                amount: value.amount,
                expiresAt: value.expiresAt,
              }
            : null;
        setProgress({ key: identity, payment, error: null, busy: false });
        retrying.current = false;
      },
    })
      .catch((cause: Error) => {
        if (!valid() || cause instanceof PaymentCancelled) return;
        setProgress((previous) => ({
          ...previous,
          key: identity,
          busy: false,
          error:
            cause instanceof ApiError
              ? cause
              : new ApiError({
                  statusCode: 0,
                  code: 'NETWORK_ERROR',
                  message: 'Unable to verify order',
                }),
        }));
      })
      .finally(() => {
        if (!valid()) return;
        retrying.current = false;
        setProgress((previous) => ({ ...previous, busy: false }));
      });
    return () => {
      controller.abort();
      epoch.current++;
    };
  }, [
    client,
    identity,
    key,
    enabled,
    userId,
    generation,
    orderId,
    verifyEnrollment,
    active,
    foreground,
    retry,
  ]);
  const raw = enabled ? order.data : undefined;
  const currentProgress = progress.key === identity ? progress : null;
  const error = currentProgress?.error;
  const result = raw ? paymentResult(raw) : undefined;
  const review =
    raw?.payment?.status === 'REQUIRES_REVIEW' && raw.status !== 'PAID';
  const blocked =
    review ||
    error?.code === 'PAYMENT_ORDER_INVALID' ||
    (!!error && [401, 403, 404].includes(error.status));
  const view: PaymentOrder | null = raw
    ? {
        id: raw.id,
        orderCode: raw.orderCode,
        totalAmount: raw.totalAmount,
        expiresAt: raw.expiresAt,
        details: raw.details.map(({ courseTitle }) => ({ courseTitle })),
      }
    : null;
  const onRetry = useCallback(() => {
    if (!enabled || !active || !foreground || retrying.current) return;
    retrying.current = true;
    setRetry((value) => value + 1);
  }, [enabled, active, foreground]);
  return {
    status:
      !enabled || (!raw && !error)
        ? ('loading' as const)
        : !raw
          ? ('error' as const)
          : ('success' as const),
    order: view,
    result,
    payment: result || blocked ? null : (currentProgress?.payment ?? null),
    orderErrorCode: error?.code ?? null,
    errorCode: result
      ? null
      : review
        ? 'PAYMENT_REQUIRES_REVIEW'
        : (error?.code ??
          (raw?.paymentType === 'CASH' ? 'PAYMENT_ORDER_INVALID' : null)),
    retrying: currentProgress?.busy ?? true,
    canRetry: !blocked,
    onRetry,
  };
}
