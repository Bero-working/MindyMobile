import { useEffect, useRef, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';
import { env } from '@/config/env';
import { bankTransferMock } from '../mocks/bankTransfer.mock';
export function usePaymentController() {
  const { t } = useTranslation();
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  return {
    bankInfo: env.APP_ENV !== 'production' ? bankTransferMock : null,
    toast,
    onCopy: (label: string, value: string) => {
      Clipboard.setString(value);
      setToast(t('payment.copied', { label }));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(''), 2500);
    },
  };
}
