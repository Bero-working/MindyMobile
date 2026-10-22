import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { PaymentScreen } from '../payment/PaymentScreen';
import type { PaymentResultState } from '../payment/resultModel';

export function PhaseFivePreview({
  onHome,
  onCourses,
  onExit,
}: {
  onHome: () => void;
  onCourses: () => void;
  onExit: () => void;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState<PaymentResultState>('PAID');
  const [open, setOpen] = useState(false);
  const [expiresAt] = useState(() =>
    new Date(Date.now() + 15 * 60 * 1000).toISOString()
  );
  if (!__DEV__) return null;
  if (open)
    return (
      <PaymentScreen
        order={{
          id: 'preview-result-order',
          orderCode: 'DEMO-RESULT-5',
          totalAmount: 1500000,
          expiresAt,
          details: [{ courseTitle: t('preview.course0') }],
        }}
        payment={{
          status: 'PENDING',
          amount: 1500000,
          expiresAt,
          qrCode: 'PREVIEW-ONLY-NOT-A-BANK-PAYMENT',
        }}
        bankInfo={null}
        onCopy={() => {}}
        onLeave={() => setOpen(false)}
        onHome={onHome}
        onCourses={onCourses}
        onRetry={() => {}}
        result={{ state, orderCode: 'DEMO-RESULT-5', amount: 1500000 }}
      />
    );
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView
        testID="payment-result-preview"
        contentContainerClassName="gap-[12px] p-[24px]"
      >
        <Text className="font-nunito-extrabold text-[22px] text-forest">
          {t('payment.result.preview')}
        </Text>
        <Text className="font-nunito text-[14px] text-muted">
          {t('payment.result.previewDescription')}
        </Text>
        {(['PAID', 'CANCELLED', 'EXPIRED'] as const).map((next) => (
          <Button
            key={next}
            testID={`preview-result-${next}`}
            label={t(`payment.result.${next}.title`)}
            variant="outline"
            onPress={() => {
              setState(next);
              setOpen(true);
            }}
          />
        ))}
        <Button
          testID="preview-result-exit"
          label={t('payment.result.previewExit')}
          variant="ghost"
          onPress={onExit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
