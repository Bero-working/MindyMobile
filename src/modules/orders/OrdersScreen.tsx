import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { CourseCover } from '@/components/common/CourseCover';
import { CoverImage } from '@/components/common/CoverImage';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { ScreenState } from '@/components/common/ScreenState';
import { SubPageHeader } from '@/components/common/SubPageHeader';
import { formatVnd } from '@/shared/utilities/formatVnd';
import { cn } from '@/shared/utilities/cn';
import { colors } from '@/theme/colors';
import type { DataRegion } from '../home/types/home.type';
import {
  LearningLayout,
  LearningState,
} from '../my-classes/components/LearningLayout';
import {
  formatOrderDate,
  matchesOrderQuery,
  orderFilters,
  type Order,
  type OrderFilter,
  type OrderStatus,
} from './types';

const statusTone: Record<OrderStatus, string> = {
  PENDING: 'text-ember',
  PAID: 'text-mint',
  EXPIRED: 'text-ink-gray',
  CANCELLED: 'text-ink-gray',
};

export type OrdersScreenProps = {
  orders: DataRegion<Order[]>;
  filter: OrderFilter;
  onFilter: (filter: OrderFilter) => void;
  onOpen: (id: string) => void;
  onPay?: ((id: string) => void) | undefined;
  onBack: () => void;
  onExplore: () => void;
  refreshing?: boolean;
  onRefresh?: (() => void) | undefined;
  hasMore?: boolean;
  loadingMore?: boolean;
  loadMoreError?: boolean;
  onLoadMore?: (() => void) | undefined;
};

export function OrdersScreen({
  orders,
  filter,
  onFilter,
  onOpen,
  onPay,
  onBack,
  onExplore,
  refreshing = false,
  onRefresh,
  hasMore = false,
  loadingMore = false,
  loadMoreError = false,
  onLoadMore,
}: OrdersScreenProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const visible = useMemo(
    () => orders.data?.filter((order) => matchesOrderQuery(order, query)),
    [orders.data, query]
  );
  const pick = (value: OrderFilter) => {
    setMenuOpen(false);
    onFilter(value);
  };
  return (
    <LearningLayout
      title={t('orders.title')}
      prefix="orders"
      showTitle={false}
      onBack={onBack}
      refreshing={refreshing}
      onRefresh={onRefresh}
      header={
        <SubPageHeader
          title={t('orders.title')}
          prefix="orders"
          onBack={onBack}
          trailing={
            <View>
              <PressableScale
                testID="orders-filter-toggle"
                accessibilityRole="button"
                accessibilityLabel={t('orders.filterLabel')}
                accessibilityState={{ expanded: menuOpen }}
                onPress={() => setMenuOpen((open) => !open)}
                className="h-[40px] w-[40px] items-center justify-center rounded-full border border-line bg-canvas"
              >
                <Icon
                  name="filter"
                  size={18}
                  color={colors.black}
                />
                {filter !== 'ALL' && (
                  <View
                    testID="orders-filter-dot"
                    className="absolute right-[6px] top-[5px] h-[9px] w-[9px] rounded-full border-2 border-canvas bg-coral"
                  />
                )}
              </PressableScale>
              {menuOpen && (
                <View className="absolute right-[0px] top-[46px] w-[190px] rounded-[14px] bg-canvas p-[6px] shadow-lg shadow-forest-deep/20">
                  {orderFilters.map((value) => (
                    <PressableScale
                      key={value}
                      testID={`orders-filter-${value}`}
                      accessibilityRole="button"
                      accessibilityLabel={t(`orders.status.${value}`)}
                      accessibilityState={{ selected: filter === value }}
                      onPress={() => pick(value)}
                      className={cn(
                        'h-[40px] flex-row items-center justify-between rounded-[10px] px-[12px]',
                        filter === value && 'bg-soft'
                      )}
                    >
                      <Text className="font-nunito-semibold text-[14px] text-black">
                        {t(`orders.status.${value}`)}
                      </Text>
                      {filter === value && (
                        <Icon
                          name="check"
                          size={16}
                          color={colors.mint}
                        />
                      )}
                    </PressableScale>
                  ))}
                </View>
              )}
            </View>
          }
        />
      }
    >
      <Text className="font-nunito-bold text-[16px] text-black">
        {t('orders.description')}
      </Text>
      <View className="h-[46px] flex-row items-center gap-[10px] rounded-full border border-line px-[14px]">
        <Icon
          name="search"
          size={17}
        />
        <TextInput
          testID="orders-search"
          value={query}
          onChangeText={setQuery}
          placeholder={t('orders.searchPlaceholder')}
          accessibilityLabel={t('orders.searchPlaceholder')}
          placeholderTextColor={colors.muted}
          selectionColor={colors.mint}
          returnKeyType="search"
          className="h-[46px] min-w-[0px] flex-1 py-[0px] font-nunito text-[14.5px] text-black"
        />
      </View>
      <LearningState
        region={orders}
        prefix="orders"
        empty={false}
      >
        {orders.data?.length === 0 ? (
          <View className="gap-[12px]">
            <ScreenState
              testID="orders-empty"
              title={t('orders.state.empty')}
              description={t(
                filter === 'ALL'
                  ? 'orders.state.description'
                  : 'orders.state.filtered'
              )}
            />
            <Button
              label={t(
                filter === 'ALL' ? 'orders.explore' : 'orders.clearFilter'
              )}
              onPress={filter === 'ALL' ? onExplore : () => onFilter('ALL')}
            />
          </View>
        ) : visible?.length === 0 ? (
          <Text
            testID="orders-search-empty"
            className="py-[28px] text-center font-nunito text-[14px] text-muted"
          >
            {t('orders.searchEmpty')}
          </Text>
        ) : (
          <View className="gap-[10px]">
            {visible?.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
                onOpen={onOpen}
                onPay={onPay}
              />
            ))}
          </View>
        )}
        {loadMoreError && (
          <Text
            accessibilityRole="alert"
            className="font-nunito text-[14px] text-headsup"
          >
            {t('orders.loadMoreError')}
          </Text>
        )}
        {hasMore && (
          <Button
            testID="orders-load-more"
            variant="outline"
            label={t('orders.loadMore')}
            loading={loadingMore}
            onPress={onLoadMore}
          />
        )}
      </LearningState>
    </LearningLayout>
  );
}

function OrderCard({
  order,
  index,
  onOpen,
  onPay,
}: {
  order: Order;
  index: number;
  onOpen: (id: string) => void;
  onPay?: ((id: string) => void) | undefined;
}) {
  const { t, i18n } = useTranslation();
  const [first] = order.details;
  const extra = order.details.length - 1;
  const payable =
    !!onPay &&
    order.status === 'PENDING' &&
    order.paymentType === 'PAYOS' &&
    Date.parse(order.expiresAt) > Date.now();
  return (
    <View
      testID={`order-card-${order.id}`}
      className="flex-row gap-[12px] rounded-[18px] bg-canvas p-[8px] shadow-md shadow-forest/10"
    >
      <View className="w-[96px] overflow-hidden rounded-[12px]">
        <View
          pointerEvents="none"
          className="absolute inset-[0px]"
        >
          <CoverImage
            uri={first?.imgUrl ?? null}
            label={first?.courseTitle ?? order.orderCode}
            testID={`order-cover-${order.id}`}
            hideLabel
            fallback={<CourseCover index={index} />}
            className="aspect-auto h-full w-full rounded-[12px]"
          />
        </View>
      </View>
      <View className="min-w-[0px] flex-1 gap-[4px] py-[2px]">
        <Text className="font-nunito-bold text-[14.5px] leading-[19px] text-black">
          {first?.courseTitle ?? order.orderCode}
        </Text>
        {first && (
          <Text className="font-nunito text-[12.5px] text-muted">
            {first.className}
          </Text>
        )}
        {extra > 0 && (
          <Text className="font-nunito text-[12.5px] text-muted">
            {t('orders.moreCourses', { n: extra })}
          </Text>
        )}
        <View className="flex-row items-center gap-[6px]">
          <Icon
            name="calendar"
            size={13}
          />
          <Text className="font-nunito text-[12.5px] text-muted">
            {formatOrderDate(order.createdAt, i18n.language)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between gap-[6px]">
          <Text
            className={cn(
              'font-nunito-bold text-[12.5px]',
              statusTone[order.status]
            )}
          >
            {t(`orders.status.${order.status}`)}
          </Text>
          <Text className="font-nunito-extrabold text-[12.5px] text-forest">
            {formatVnd(order.totalAmount)}
          </Text>
        </View>
        <View className="mt-[6px] flex-row justify-between gap-[8px]">
          <View className="flex-1">
            <PressableScale
              testID={`order-open-${order.id}`}
              accessibilityRole="button"
              accessibilityLabel={t('orders.openOrder', {
                code: order.orderCode,
              })}
              onPress={() => onOpen(order.id)}
              className={cn(
                'h-[38px] items-center justify-center rounded-full px-[8px]',
                payable ? 'border border-line bg-canvas' : 'bg-forest'
              )}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                className={cn(
                  'font-nunito-bold text-[13px]',
                  payable ? 'text-black' : 'text-canvas'
                )}
              >
                {t('orders.viewDetail')}
              </Text>
            </PressableScale>
          </View>
          {payable && (
            <View className="flex-1">
              <PressableScale
                testID={`order-pay-${order.id}`}
                accessibilityRole="button"
                accessibilityLabel={t('orders.payOrder', {
                  code: order.orderCode,
                })}
                onPress={() => onPay?.(order.id)}
                className="h-[38px] items-center justify-center rounded-full bg-forest px-[8px]"
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                  className="font-nunito-bold text-[13px] text-canvas"
                >
                  {t('orders.continuePayment')}
                </Text>
              </PressableScale>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
