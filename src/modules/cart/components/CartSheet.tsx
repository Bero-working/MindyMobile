import { PressableScale } from '@/components/common/PressableScale';
import { colors } from '@/theme/colors';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppSheet } from '@/components/common/AppSheet';
import { CoverImage } from '@/components/common/CoverImage';
import { CourseCover } from '@/components/common/CourseCover';
import { ScreenState } from '@/components/common/ScreenState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatVnd, formatDateOnly } from '@/shared/utilities/formatVnd';
import type { Cart, CheckoutPaymentType } from '../types/cart.type';

export type CartSheetProps = {
  cart: Cart;
  status?: 'success' | 'error' | 'loading';
  removingId?: string | null | undefined;
  checkingOut?: boolean;
  checkoutError?: string | null | undefined;
  checkoutUnknown?: boolean;
  paymentType?: CheckoutPaymentType;
  onPaymentTypeChange?: (value: CheckoutPaymentType) => void;
  onRemove: (classId: string) => void;
  onCheckout: () => void;
  onVerify?: (() => void) | undefined;
  onRetry?: (() => void) | undefined;
  onClose: () => void;
};
export function CartSheet({
  cart,
  status = 'success',
  removingId,
  checkingOut = false,
  checkoutError,
  checkoutUnknown = false,
  paymentType = 'PAYOS',
  onPaymentTypeChange,
  onRemove,
  onCheckout,
  onVerify,
  onRetry,
  onClose,
}: CartSheetProps) {
  const { t } = useTranslation();
  const unavailable = cart.items.some((item) => !item.isPurchasable);
  const pending = checkingOut || !!removingId;
  const checkoutDisabled =
    pending ||
    status !== 'success' ||
    !cart.items.length ||
    unavailable ||
    checkoutUnknown;
  return (
    <AppSheet
      onClose={onClose}
      locked={pending}
    >
      <View testID="cart-sheet">
        <Text
          testID="cart-title"
          accessibilityRole="header"
          className="mb-[10px] font-nunito-extrabold text-[22px] tracking-[-0.44px] text-black"
        >
          {t('cart.title', { count: cart.items.length })}
        </Text>
        {status === 'loading' ? (
          <View
            testID="cart-loading"
            className="gap-[12px]"
          >
            <Skeleton className="h-[78px]" />
            <Skeleton className="h-[78px]" />
            <Skeleton className="h-[40px]" />
          </View>
        ) : status === 'error' ? (
          <ScreenState
            testID="cart-error"
            title={t('home.errorTitle')}
            description={t('errors.generic')}
            onRetry={onRetry}
            retryTestID="cart-retry"
          />
        ) : cart.items.length === 0 ? (
          <Text
            testID="cart-empty"
            className="py-[28px] text-center font-nunito-semibold text-[14px] text-muted"
          >
            {t('cart.empty')}
          </Text>
        ) : (
          cart.items.map((item, index) => (
            <View
              key={item.classId}
              testID={'cart-item-' + item.classId}
              className={
                item.isPurchasable
                  ? 'flex-row items-center gap-[12px] border-b border-line py-[12px]'
                  : 'flex-row items-center gap-[12px] border-b border-line py-[12px] opacity-60'
              }
            >
              <CoverImage
                uri={item.imgUrl ?? null}
                hideLabel
                label={item.courseTitle}
                fallback={<CourseCover index={index} />}
                className="h-[54px] w-[54px] rounded-[12px]"
              />
              <View className="flex-1">
                <Text className="font-nunito-extrabold text-[15px] text-black">
                  {item.courseTitle}
                </Text>
                <Text className="font-nunito text-[12.5px] text-muted">
                  {t('cart.item.meta', {
                    name: item.className,
                    mode: item.deliveryMode,
                    date: formatDateOnly(item.startDate),
                  })}
                </Text>
                <View className="mt-[2px] flex-row flex-wrap items-center gap-[6px]">
                  <Text className="font-nunito-extrabold text-[14px] text-forest">
                    {formatVnd(item.currentPriceAmount)}
                  </Text>
                  {item.currentPriceAmount !== item.priceSnapshot && (
                    <Text className="font-nunito-semibold text-[12px] text-muted line-through">
                      {formatVnd(item.priceSnapshot)}
                    </Text>
                  )}
                </View>
                {item.currentPriceAmount !== item.priceSnapshot && (
                  <Text
                    testID={'cart-item-price-changed-' + item.classId}
                    className="font-nunito-bold text-[12px] text-status-yellow"
                  >
                    {t('cart.item.priceChanged')}
                  </Text>
                )}
                {!item.isPurchasable && (
                  <Text
                    testID={'cart-item-unavailable-' + item.classId}
                    className="font-nunito-bold text-[12px] text-status-red"
                  >
                    {t('cart.item.unavailable')}
                  </Text>
                )}
              </View>
              <PressableScale
                testID={'cart-item-remove-' + item.classId}
                accessibilityLabel={t('cart.item.removeLabel', {
                  course: item.courseTitle,
                  name: item.className,
                })}
                disabled={pending}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: pending,
                  busy: removingId === item.classId,
                }}
                onPress={() => onRemove(item.classId)}
                className="min-h-[44px] min-w-[44px] items-center justify-center"
              >
                {removingId === item.classId ? (
                  <ActivityIndicator color={colors.headsup} />
                ) : (
                  <Text className="font-nunito-extrabold text-[13px] text-headsup">
                    {t('cart.item.remove')}
                  </Text>
                )}
              </PressableScale>
            </View>
          ))
        )}
        <View className="mb-[14px] mt-[16px] flex-row items-center justify-between">
          <Text className="font-nunito-bold text-[15px] text-muted">
            {t('cart.total')}
          </Text>
          <Text
            testID="cart-total"
            accessibilityLabel={
              t('cart.total') + ' ' + formatVnd(cart.totalAmount)
            }
            className="font-nunito-extrabold text-[22px] text-black"
          >
            {formatVnd(cart.totalAmount)}
          </Text>
        </View>
        {status === 'success' && cart.items.length > 0 && (
          <View className="mb-[16px] gap-[8px]">
            <Text className="font-nunito-extrabold text-[16px] text-forest">
              {t('cart.paymentMethod')}
            </Text>
            {(['PAYOS', 'CASH'] as const).map((method) => (
              <PressableScale
                key={method}
                testID={'cart-payment-' + method}
                accessibilityRole="radio"
                accessibilityLabel={t('cart.methods.' + method)}
                accessibilityState={{
                  checked: paymentType === method,
                  disabled: pending || checkoutUnknown,
                }}
                disabled={pending || checkoutUnknown}
                onPress={() => onPaymentTypeChange?.(method)}
                className={
                  paymentType === method
                    ? 'min-h-[52px] flex-row items-center gap-[10px] rounded-[14px] border-2 border-forest bg-soft px-[14px] py-[12px]'
                    : 'min-h-[52px] flex-row items-center gap-[10px] rounded-[14px] border-2 border-line px-[14px] py-[12px]'
                }
              >
                <View className="h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-forest">
                  {paymentType === method && (
                    <View className="h-[10px] w-[10px] rounded-full bg-forest" />
                  )}
                </View>
                <Text className="flex-1 font-nunito-bold text-[14px] text-forest">
                  {t('cart.methods.' + method)}
                </Text>
              </PressableScale>
            ))}
            <Text
              accessibilityLiveRegion="polite"
              className="font-nunito text-[13px] leading-[19px] text-muted"
            >
              {t(paymentType === 'CASH' ? 'cart.cashHint' : 'cart.qrHint')}
            </Text>
          </View>
        )}
        {(unavailable || checkoutError) && (
          <Text
            testID="cart-checkout-error"
            accessibilityLiveRegion="polite"
            className="mb-[10px] font-nunito-bold text-[13px] text-status-red"
          >
            {checkoutError ?? t('cart.errors.unavailable')}
          </Text>
        )}
        {checkoutUnknown && (
          <View className="mb-[10px]">
            <Text className="font-nunito-bold text-[13px] text-status-red">
              {t('cart.checkoutUnknown')}
            </Text>
            <Button
              testID="cart-checkout-verify"
              variant="outline"
              label={t('cart.checkoutVerify')}
              onPress={onVerify}
              disabled={!onVerify || pending}
            />
          </View>
        )}
        <Button
          testID="cart-checkout"
          label={t(
            checkingOut
              ? 'cart.checkoutPending'
              : paymentType === 'CASH'
                ? 'cart.checkoutCash'
                : 'cart.checkout'
          )}
          variant="solid"
          loading={checkingOut}
          disabled={checkoutDisabled}
          onPress={onCheckout}
          className={
            checkoutDisabled
              ? 'min-h-[52px] rounded-[14px] bg-action opacity-60'
              : 'min-h-[52px] rounded-[14px] bg-action'
          }
        />
      </View>
    </AppSheet>
  );
}
