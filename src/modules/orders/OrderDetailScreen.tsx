/* eslint-disable @typescript-eslint/no-require-imports */
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { deferComponent } from '@/components/common/deferComponent';
import { Button } from '@/components/ui/Button';
import { ScreenState } from '@/components/common/ScreenState';
import { formatVnd } from '@/shared/utilities/formatVnd';
import { ApiError } from '@/shared/utilities/apiError';
import type { DataRegion } from '../home/types/home.type';
import {
  LearningLayout,
  LearningState,
} from '../my-classes/components/LearningLayout';
import { useCountdown } from '../payment/hooks/useCountdown';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatOrderDate, type Order } from './types';

const cancelErrorKeys: Record<
  string,
  | 'orders.errors.ORDER_NOT_CANCELLABLE'
  | 'orders.errors.ORDER_ACCESS_DENIED'
  | 'orders.errors.ORDER_NOT_FOUND'
  | 'orders.errors.NETWORK_ERROR'
> = {
  ORDER_NOT_CANCELLABLE: 'orders.errors.ORDER_NOT_CANCELLABLE',
  ORDER_ACCESS_DENIED: 'orders.errors.ORDER_ACCESS_DENIED',
  ORDER_NOT_FOUND: 'orders.errors.ORDER_NOT_FOUND',
  NETWORK_ERROR: 'orders.errors.NETWORK_ERROR',
};

const AppSheet = deferComponent(
  () =>
    (
      require('@/components/common/AppSheet') as typeof import('@/components/common/AppSheet')
    ).AppSheet
);

export function OrderDetailScreen({
  order: region,
  onBack,
  onCancel,
}: {
  order: DataRegion<Order>;
  onBack: () => void;
  onCancel: (id: string) => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const order = region.data;
  const countdown = useCountdown(
    order?.status === 'PENDING' ? order.expiresAt : null
  );
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ code: string } | null>(null);
  const busy = useRef(false);
  const cancellable =
    region.status === 'success' &&
    order?.status === 'PENDING' &&
    countdown.seconds !== null &&
    !countdown.expired;
  const cancel = async () => {
    if (
      !order ||
      busy.current ||
      !cancellable ||
      Date.parse(order.expiresAt) <= Date.now()
    )
      return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      await onCancel(order.id);
      setConfirm(false);
    } catch (e) {
      setError(e instanceof ApiError ? { code: e.code } : { code: 'generic' });
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  const date = (value: string) => formatOrderDate(value, i18n.language);
  return (
    <LearningLayout
      title={t('orders.detailTitle')}
      prefix="order-detail"
      onBack={() => {
        if (!pending) onBack();
      }}
      onRefresh={pending ? undefined : region.onRetry}
    >
      {!order && region.status === 'error' ? (
        <ScreenState
          title={t('orders.detailTitle')}
          description={t(
            cancelErrorKeys[region.error?.code ?? ''] ?? 'errors.generic'
          )}
          onRetry={region.onRetry}
          retryTestID="order-detail-retry"
        />
      ) : (
        <LearningState
          region={region}
          prefix="orderDetail"
          empty={!order}
        >
          {order && (
            <>
              <View className="gap-[12px] rounded-[24px] bg-forest p-[20px]">
                <Text className="font-nunito text-[13px] text-canvas/80">
                  {t('orders.orderCode')}
                </Text>
                <Text
                  selectable
                  className="font-nunito-extrabold text-[22px] text-canvas"
                >
                  {order.orderCode}
                </Text>
                <View className="self-start rounded-full bg-canvas p-[3px]">
                  <OrderStatusBadge status={order.status} />
                </View>
                <View className="mt-[4px] border-t border-canvas/20 pt-[12px]">
                  <Text className="font-nunito text-[13px] text-canvas/80">
                    {t('orders.total')}
                  </Text>
                  <Text className="font-nunito-extrabold text-[28px] text-canvas">
                    {formatVnd(order.totalAmount)}
                  </Text>
                </View>
              </View>
              <View className="gap-[14px] rounded-[20px] bg-soft p-[16px]">
                {[
                  [t('orders.createdAt'), date(order.createdAt)],
                  [
                    t('orders.paymentType'),
                    t(`orders.methods.${order.paymentType}`),
                  ],
                  ...(order.paidAt
                    ? [[t('orders.paidAt'), date(order.paidAt)]]
                    : []),
                  ...(order.status === 'PENDING'
                    ? [[t('orders.expiresAt'), date(order.expiresAt)]]
                    : []),
                ].map(([label, value]) => (
                  <View
                    key={label}
                    className="gap-[3px]"
                  >
                    <Text className="font-nunito text-[12px] text-muted">
                      {label}
                    </Text>
                    <Text className="font-nunito-bold text-[14px] text-forest">
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
              <Text
                accessibilityRole="header"
                className="font-nunito-extrabold text-[18px] text-forest"
              >
                {t('orders.items')}
              </Text>
              {order.paymentType === 'CASH' &&
                order.status === 'PENDING' &&
                !countdown.expired && (
                  <Text
                    testID="order-cash-instructions"
                    className="font-nunito-bold text-[14px] leading-[21px] text-forest"
                  >
                    {t('orders.cashInstructions', {
                      time: date(order.expiresAt),
                    })}
                  </Text>
                )}
              {order.details.map((detail) => (
                <View
                  key={detail.id}
                  className="gap-[8px] rounded-[20px] border border-line p-[16px]"
                >
                  <Text className="font-nunito-bold text-[16px] text-forest">
                    {detail.courseTitle}
                  </Text>
                  <Text className="font-nunito text-[14px] text-muted">
                    {detail.className}
                  </Text>
                  <Text className="font-nunito text-[13px] text-muted">
                    {t('orders.quantityPrice', {
                      quantity: detail.quantity,
                      price: formatVnd(detail.priceAmount),
                    })}
                  </Text>
                  <Text className="font-nunito-extrabold text-[17px] text-forest">
                    {formatVnd(detail.totalAmount)}
                  </Text>
                </View>
              ))}
              {order.paymentReview && (
                <Text className="font-nunito text-[14px] text-muted">
                  {t('orders.review')}
                </Text>
              )}
              {order.status === 'PENDING' && countdown.expired && (
                <Text
                  accessibilityLiveRegion="polite"
                  className="font-nunito text-[14px] text-headsup"
                >
                  {t('orders.deadlinePassed')}
                </Text>
              )}
              {order.status === 'CANCELLED' && (
                <Text
                  accessibilityLiveRegion="polite"
                  className="font-nunito text-[14px] text-muted"
                >
                  {t('orders.cancelledNote')}
                </Text>
              )}
              {cancellable && (
                <Button
                  testID="order-cancel"
                  variant="outline"
                  label={t('orders.cancel')}
                  disabled={pending}
                  onPress={() => {
                    setError(null);
                    setConfirm(true);
                  }}
                />
              )}
            </>
          )}
        </LearningState>
      )}
      {confirm && order && (
        <AppSheet
          locked={pending}
          onClose={() => setConfirm(false)}
        >
          <View className="gap-[16px]">
            <Text
              accessibilityRole="header"
              className="font-nunito-extrabold text-[22px] text-forest"
            >
              {t('orders.cancelTitle')}
            </Text>
            <Text className="font-nunito text-[15px] leading-[23px] text-muted">
              {t('orders.cancelMessage', { code: order.orderCode })}
            </Text>
            {!cancellable && (
              <Text
                accessibilityRole="alert"
                className="font-nunito text-[14px] text-headsup"
              >
                {t('orders.deadlinePassed')}
              </Text>
            )}
            {error && (
              <View
                accessibilityRole="alert"
                className="gap-[8px] rounded-[16px] bg-headsup/10 p-[14px]"
              >
                <Text className="font-nunito text-[14px] text-headsup">
                  {t(cancelErrorKeys[error.code] ?? 'orders.cancelError')}
                </Text>
                {region.onRetry && (
                  <Button
                    label={t('orders.refresh')}
                    variant="outline"
                    onPress={region.onRetry}
                    disabled={pending}
                  />
                )}
              </View>
            )}
            <Button
              testID="order-cancel-confirm"
              variant="solid"
              label={t('orders.confirmCancel')}
              className="bg-headsup"
              loading={pending}
              disabled={!cancellable}
              onPress={() => {
                cancel().catch(() => {});
              }}
            />
            <Button
              testID="order-cancel-keep"
              variant="outline"
              label={t('orders.keep')}
              disabled={pending}
              onPress={() => setConfirm(false)}
            />
          </View>
        </AppSheet>
      )}
    </LearningLayout>
  );
}
