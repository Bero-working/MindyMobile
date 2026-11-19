import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OrderStatus } from './types';

const tones: Record<OrderStatus, string> = {
  PENDING: 'bg-sunshine/30',
  PAID: 'bg-mint/20',
  EXPIRED: 'bg-soft',
  CANCELLED: 'bg-headsup/10',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return (
    <View
      className={`self-start rounded-full px-[12px] py-[6px] ${tones[status]}`}
    >
      <Text className="font-nunito-bold text-[12px] text-forest">
        {t(`orders.status.${status}`)}
      </Text>
    </View>
  );
}
