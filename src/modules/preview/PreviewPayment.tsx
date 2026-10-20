import { PaymentScreen } from '../payment/PaymentScreen';
import { usePaymentController } from '../payment/hooks/usePaymentController';
import type { PaymentOrder } from '../payment/types/payment.type';
export default function PreviewPayment({
  order,
  onLeave,
}: {
  order: PaymentOrder;
  onLeave: () => void;
}) {
  const controller = usePaymentController();
  return (
    <PaymentScreen
      {...controller}
      order={order}
      payment={{
        status: 'PENDING',
        qrCode: 'MINDY-PREVIEW-ONLY-NOT-A-BANK-PAYMENT',
        amount: order.totalAmount,
        expiresAt: order.expiresAt,
      }}
      onRetry={() => {}}
      onLeave={onLeave}
    />
  );
}
