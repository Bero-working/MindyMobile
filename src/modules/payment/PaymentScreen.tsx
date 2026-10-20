import { useEffect, useMemo, useRef } from 'react';
import {
  AccessibilityInfo,
  Alert,
  BackHandler,
  ScrollView,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScreenState } from '@/components/common/ScreenState';
import { colors } from '@/theme/colors';
import { formatVnd } from '@/shared/utilities/formatVnd';
import { useCountdown } from './hooks/useCountdown';
import type {
  BankTransferInfo,
  Payment,
  PaymentOrder,
} from './types/payment.type';

export type PaymentScreenProps = {
  order: PaymentOrder;
  payment: Payment | null;
  bankInfo: BankTransferInfo | null;
  errorCode?: string | null | undefined;
  toast?: string | undefined;
  onRetry: () => void;
  onCopy: (label: string, value: string) => void;
  onLeave: () => void;
};
export function PaymentScreen({
  order,
  payment,
  bankInfo,
  errorCode,
  toast,
  onRetry,
  onCopy,
  onLeave,
}: PaymentScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const toastLayout = useMemo(
    () => ({ bottom: 32 + insets.bottom }),
    [insets.bottom]
  );
  const countdown = useCountdown(payment?.expiresAt ?? order.expiresAt);
  const expired = countdown.expired || errorCode === 'PAYMENT_ORDER_INVALID';
  const announced = useRef(false);
  const expiredAnnounced = useRef(false);
  const layout = useMemo(
    () => ({ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }),
    [insets.top, insets.bottom]
  );
  const leave = () => {
    if (expired) {
      onLeave();
      return;
    }
    const time = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(payment?.expiresAt ?? order.expiresAt));
    Alert.alert(
      t('payment.leave.title'),
      t('payment.leave.message', { time }),
      [
        { text: t('payment.leave.stay'), style: 'cancel' },
        { text: t('payment.leave.confirm'), onPress: onLeave },
      ]
    );
  };
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      leave();
      return true;
    });
    return () => sub.remove();
  }, [expired, order.expiresAt, payment?.expiresAt, onLeave]);
  useEffect(() => {
    if (
      countdown.seconds !== null &&
      countdown.seconds <= 60 &&
      countdown.seconds > 0 &&
      !announced.current
    ) {
      announced.current = true;
      AccessibilityInfo.announceForAccessibility(t('payment.minute'));
    }
    if (expired && !expiredAnnounced.current) {
      expiredAnnounced.current = true;
      AccessibilityInfo.announceForAccessibility(t('payment.expired'));
    }
  }, [countdown.seconds, expired]);
  const creating = !expired && (!payment || payment.status === 'CREATING');
  const rows: { key: string; value: string; copy?: boolean }[] = [
    {
      key: 'courses',
      value: order.details.map((d) => d.courseTitle).join(', '),
    },
    ...(bankInfo
      ? [
          { key: 'bank', value: bankInfo.bankName },
          { key: 'account', value: bankInfo.accountNumber, copy: true },
          { key: 'owner', value: bankInfo.accountName },
        ]
      : []),
    { key: 'amount', value: formatVnd(payment?.amount ?? order.totalAmount) },
    ...(bankInfo
      ? [
          {
            key: 'note',
            value: bankInfo.transferNote(order.orderCode),
            copy: true,
          },
        ]
      : []),
  ];
  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        testID="payment-screen"
        style={layout}
        className="flex-1 bg-canvas"
        contentContainerClassName="px-[20px] pb-[32px]"
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.canvas}
        />
        <View className="mb-[16px] flex-row items-center">
          <PressableScale
            testID="payment-back"
            accessibilityRole="button"
            accessibilityLabel={t('payment.leave.confirm')}
            hitSlop={2}
            onPress={leave}
            className="h-[40px] w-[40px] items-center justify-center rounded-full border border-line"
          >
            <Icon
              name="back"
              size={20}
            />
          </PressableScale>
          <Text
            accessibilityRole="header"
            className="flex-1 text-center font-nunito-extrabold text-[18px] text-black"
          >
            {t('payment.title')}
          </Text>
          <View className="w-[40px]" />
        </View>
        <Text className="text-center font-nunito text-[13px] text-muted">
          {t('payment.amountLabel')}
        </Text>
        <Text
          testID="payment-amount"
          className="mt-[2px] text-center font-nunito-extrabold text-[28px] tracking-[-0.56px] text-forest"
        >
          {formatVnd(payment?.amount ?? order.totalAmount)}
        </Text>
        {!creating && (
          <View className="mt-[8px] flex-row items-center gap-[6px] self-center rounded-full bg-peach px-[10px] py-[4px]">
            <Icon
              name="clock"
              size={13}
              color={colors.ember}
            />
            <Text
              testID="payment-expiry"
              accessibilityLiveRegion="none"
              className="font-nunito-bold text-[12.5px] text-ember"
            >
              {expired
                ? t('payment.expired')
                : t('payment.expiresIn', { time: countdown.time })}
            </Text>
          </View>
        )}
        {errorCode && errorCode !== 'PAYMENT_ORDER_INVALID' ? (
          <ScreenState
            title={t('payment.title')}
            description={t(
              'payment.errors.' +
                ([
                  'PAYMENT_UNAVAILABLE',
                  'PAYMENT_AMOUNT_INVALID',
                  'ORDER_NOT_FOUND',
                  'ORDER_ACCESS_DENIED',
                ].includes(errorCode)
                  ? errorCode
                  : 'generic')
            )}
            onRetry={onRetry}
            retryTestID="payment-retry"
          />
        ) : (
          <View className="mt-[16px] w-[220px] self-center rounded-[20px] border border-line bg-canvas p-[12px] shadow-md shadow-forest/10">
            {expired && !payment?.qrCode ? (
              <View
                testID="payment-qr-expired"
                className="min-h-[196px] items-center justify-center"
              >
                <Text className="text-center font-nunito-extrabold text-[16px] text-status-red">
                  {t('payment.qr.expired')}
                </Text>
              </View>
            ) : creating ? (
              <View testID="payment-qr-loading">
                <Skeleton className="h-[196px] w-[196px] rounded-[10px]" />
                <Text className="mt-[8px] text-center font-nunito text-[12.5px] text-muted">
                  {t('payment.qr.creating')}
                </Text>
              </View>
            ) : payment?.qrCode ? (
              <View>
                <View
                  testID="payment-qr"
                  accessible
                  accessibilityRole="image"
                  accessibilityLabel={t('payment.qr.label', {
                    amount: formatVnd(payment.amount),
                  })}
                  className={
                    expired
                      ? 'items-center justify-center rounded-[10px] opacity-15'
                      : 'items-center justify-center rounded-[10px]'
                  }
                >
                  <QRCode
                    value={payment.qrCode}
                    size={180}
                    quietZone={8}
                    ecl="M"
                    color={colors.forest}
                    backgroundColor={colors.canvas}
                  />
                </View>
                {expired && (
                  <View
                    testID="payment-qr-expired"
                    className="absolute inset-[0px] items-center justify-center"
                  >
                    <Text className="text-center font-nunito-extrabold text-[16px] text-status-red">
                      {t('payment.qr.expired')}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View
                testID="payment-qr-missing"
                className="min-h-[196px] justify-center gap-[12px]"
              >
                <Text className="text-center font-nunito-bold text-[14px] text-muted">
                  {t('payment.qr.missing')}
                </Text>
                {!expired && (
                  <Button
                    testID="payment-retry"
                    variant="outline"
                    label={t('common.retry')}
                    onPress={onRetry}
                  />
                )}
              </View>
            )}
            {!creating && (
              <Text className="mt-[8px] text-center font-nunito text-[12.5px] text-muted">
                {t('payment.qr.caption')}
              </Text>
            )}
          </View>
        )}
        {(expired ||
          errorCode === 'ORDER_NOT_FOUND' ||
          errorCode === 'ORDER_ACCESS_DENIED') && (
          <View className="mt-[16px]">
            <Button
              testID="payment-go-courses"
              variant="solid"
              label={t('payment.goCourses')}
              onPress={onLeave}
              className="min-h-[52px] rounded-[14px]"
            />
          </View>
        )}
        <View
          testID="payment-info"
          className="mt-[18px] rounded-[18px] bg-soft px-[14px] py-[4px]"
        >
          {rows.map((row, index) => (
            <View
              key={row.key}
              testID={'payment-info-row-' + row.key}
              className={
                (fontScale > 1.3
                  ? 'min-h-[52px] gap-[6px] py-[10px]'
                  : 'min-h-[52px] flex-row items-center gap-[10px] py-[8px]') +
                (index < rows.length - 1 ? ' border-b border-line' : '')
              }
            >
              <Text className="w-[96px] font-nunito text-[12.5px] text-muted">
                {t('payment.info.' + row.key)}
              </Text>
              <Text
                className={
                  fontScale > 1.3
                    ? 'w-full font-nunito-bold text-[14px] text-black'
                    : 'flex-1 font-nunito-bold text-[14px] text-black'
                }
              >
                {row.value}
              </Text>
              {row.copy && !expired && (
                <PressableScale
                  testID={'payment-copy-' + row.key}
                  accessibilityRole="button"
                  accessibilityLabel={
                    t('payment.info.copy') + ' ' + t('payment.info.' + row.key)
                  }
                  hitSlop={7}
                  onPress={() =>
                    onCopy(
                      t('payment.info.' + row.key).toLocaleLowerCase(),
                      row.value
                    )
                  }
                  className="min-h-[30px] items-center justify-center rounded-full border border-banner bg-canvas px-[10px]"
                >
                  <Text className="font-nunito-bold text-[12px] text-forest">
                    {t('payment.info.copy')}
                  </Text>
                </PressableScale>
              )}
            </View>
          ))}
        </View>
        <Text
          testID="payment-note"
          className="mt-[10px] font-nunito text-[12.5px] leading-[18.75px] text-muted"
        >
          {t('payment.note')}
        </Text>
      </ScrollView>
      {toast && (
        <View
          pointerEvents="none"
          style={toastLayout}
          className="absolute inset-x-[20px] rounded-[14px] bg-forest px-[16px] py-[13px] shadow-xl shadow-forest/30"
        >
          <Text
            testID="payment-toast"
            accessibilityLiveRegion="polite"
            className="font-nunito-bold text-[14px] text-canvas"
          >
            {toast}
          </Text>
        </View>
      )}
    </View>
  );
}
