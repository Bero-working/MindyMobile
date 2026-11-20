/* eslint-disable @typescript-eslint/no-require-imports */
import { useState } from 'react';
import {
  useIsFocused,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { deferComponent } from '@/components/common/deferComponent';
import routes from '@/navigation/routes';
import type { NavigationProp, RootStackParamList } from '@/navigation/types';
import { useOrders, useOrderDetail } from './useOrders';
import type { OrderFilter } from './types';

const OrdersScreen = deferComponent(
  () =>
    (require('./OrdersScreen') as typeof import('./OrdersScreen')).OrdersScreen
);
const OrderDetailScreen = deferComponent(
  () =>
    (require('./OrderDetailScreen') as typeof import('./OrderDetailScreen'))
      .OrderDetailScreen
);

export function OrdersRoute() {
  const navigation = useNavigation<NavigationProp>();
  const active = useIsFocused();
  const [filter, setFilter] = useState<OrderFilter>('ALL');
  const data = useOrders(filter, active);
  return (
    <OrdersScreen
      {...data}
      filter={filter}
      onFilter={setFilter}
      onOpen={(orderId) =>
        navigation.navigate(routes.studentOrderDetail, { orderId })
      }
      onPay={(orderId) =>
        navigation.navigate(routes.payment, { orderId, origin: 'learning' })
      }
      onBack={() => navigation.goBack()}
      onExplore={() => navigation.navigate(routes.courses)}
    />
  );
}

export function OrderDetailRoute() {
  const navigation = useNavigation<NavigationProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, routes.studentOrderDetail>>();
  const active = useIsFocused();
  const data = useOrderDetail(route.params.orderId, active);
  return (
    <OrderDetailScreen
      {...data}
      onBack={() => navigation.goBack()}
    />
  );
}
