import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  scopeKey,
  useStudentScope,
  type StudentScope,
} from '@/shared/hooks/useStudentScope';
import { ApiError } from '@/shared/utilities/apiError';
import {
  PaymentCancelled,
  paymentService,
  waitForPayosLink,
} from '../services/payment.service';
import type { Payment, PaymentOrder } from '../types/payment.type';
import { verifiedResumeOrder } from '@/modules/my-classes/services/resumeOrder.service';

export const orderQueryKeys = {
  detail: (scope: StudentScope, orderId: string) =>
    ['orders', ...scopeKey(scope), orderId] as const,
};
const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new PaymentCancelled());
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new PaymentCancelled());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
export function usePaymentQuery(orderId: string, verifyEnrollment = false) {
  const scope = useStudentScope();
  const order = useQuery({
    queryKey: [
      ...orderQueryKeys.detail(scope, orderId),
      verifyEnrollment ? 'resume' : 'checkout',
    ],
    queryFn: ({ signal }) =>
      verifyEnrollment
        ? verifiedResumeOrder(orderId, signal)
        : paymentService.order(orderId, signal),
    enabled: scope.enabled && !!orderId,
    gcTime: 0,
    staleTime: 0,
    retry: false,
  });
  const [payment, setPayment] = useState<Payment | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const run = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  const payable =
    scope.enabled &&
    order.data?.status === 'PENDING' &&
    order.isSuccess &&
    !order.isFetching &&
    order.data.payment?.status !== 'REQUIRES_REVIEW' &&
    order.data.paymentType === 'PAYOS';
  const createLink = useCallback(() => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const current = ++run.current;
    setPayment(null);
    setLinkError(null);
    const prepare = async () => {
      if (verifyEnrollment)
        await verifiedResumeOrder(orderId, controller.signal);
      return waitForPayosLink(orderId, {
        sleep: (ms) => sleep(ms, controller.signal),
        signal: controller.signal,
        cancelled: () => run.current !== current,
      });
    };
    prepare()
      .then((result) => {
        if (run.current !== current) return;
        if (result.status === 'CREATING' || result.status === 'PENDING')
          setPayment({
            status: result.status,
            qrCode: result.qrCode,
            amount: result.amount,
            expiresAt: result.expiresAt,
          });
        else setLinkError('generic');
      })
      .catch((cause: Error) => {
        if (cause instanceof PaymentCancelled || run.current !== current)
          return;
        setLinkError(cause instanceof ApiError ? cause.code : 'generic');
      });
  }, [orderId, verifyEnrollment]);
  useEffect(() => {
    if (payable) createLink();
    return () => {
      run.current++;
      activeRequest.current?.abort();
    };
  }, [payable, createLink]);
  const view: PaymentOrder | null = order.data
    ? {
        id: order.data.id,
        orderCode: order.data.orderCode,
        totalAmount: order.data.totalAmount,
        expiresAt: order.data.expiresAt,
        details: order.data.details.map(({ courseTitle }) => ({
          courseTitle,
        })),
      }
    : null;
  return {
    status: order.isError
      ? ('error' as const)
      : !scope.enabled || order.isPending
        ? ('loading' as const)
        : ('success' as const),
    orderErrorCode: order.error?.code ?? null,
    order: view,
    payment: payable ? payment : null,
    // A closed or non-PayOS order cannot get a link; show it as expired instead of calling the API.
    errorCode: order.data && !payable ? 'PAYMENT_ORDER_INVALID' : linkError,
    onRetry: () => {
      if (order.isError) order.refetch().catch(() => {});
      else if (payable) createLink();
    },
  };
}
