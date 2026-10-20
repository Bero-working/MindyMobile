import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenState } from '@/components/common/ScreenState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStore } from '@/state/store';
import routes from '@/navigation/routes';
import type { NavigationProp, RootStackParamList } from '@/navigation/types';
import { PaymentScreen } from './PaymentScreen';
import { usePaymentController } from './hooks/usePaymentController';
import { usePaymentQuery } from './hooks/usePaymentQuery';

const ORDER_ERRORS = ['ORDER_NOT_FOUND', 'ORDER_ACCESS_DENIED'];
export function PaymentRoute() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const user = useStore((s) => s.sessionUser);
  if (user?.role !== 'STUDENT')
    return (
      <SafeAreaView className="flex-1 justify-center gap-4 bg-canvas p-6">
        <ScreenState
          title={t('payment.title')}
          description={t('home.authRequired')}
        />
        <Button
          label={t('payment.goCourses')}
          onPress={() => navigation.replace(routes.login)}
        />
      </SafeAreaView>
    );
  return <StudentPayment />;
}
function StudentPayment() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, routes.payment>>();
  const data = usePaymentQuery(route.params?.orderId ?? '');
  const controller = usePaymentController();
  const leave = () => navigation.navigate(routes.courses);
  if (data.status !== 'success' || !data.order)
    return (
      <SafeAreaView className="flex-1 justify-center gap-4 bg-canvas p-6">
        {data.status === 'loading' ? (
          <View
            testID="payment-loading"
            accessible
            accessibilityLabel={t('common.loading')}
            className="items-center gap-4"
          >
            <Skeleton className="h-[34px] w-[200px]" />
            <Skeleton className="h-[220px] w-[220px] rounded-[20px]" />
          </View>
        ) : (
          <ScreenState
            testID="payment-load-error"
            title={t('payment.title')}
            description={t(
              'payment.errors.' +
                (data.orderErrorCode &&
                ORDER_ERRORS.includes(data.orderErrorCode)
                  ? data.orderErrorCode
                  : 'generic')
            )}
            onRetry={
              data.orderErrorCode && ORDER_ERRORS.includes(data.orderErrorCode)
                ? undefined
                : data.onRetry
            }
            retryTestID="payment-load-retry"
          />
        )}
        <Button
          testID="payment-go-courses"
          label={t('payment.goCourses')}
          onPress={leave}
        />
      </SafeAreaView>
    );
  return (
    <PaymentScreen
      {...controller}
      order={data.order}
      payment={data.payment}
      errorCode={data.errorCode}
      onRetry={data.onRetry}
      onLeave={leave}
    />
  );
}
