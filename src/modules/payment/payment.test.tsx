import '../../../tests/mocks/nativeUi';
import { Alert } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import '@/config/i18n.config';
import { PaymentScreen } from './PaymentScreen';
import QRCode from 'react-native-qrcode-svg';
jest.mock('react-native-qrcode-svg', () => ({
  __esModule: true,
  default: jest.fn((props: object) =>
    jest
      .requireActual('react')
      .createElement(jest.requireActual('react-native').View, props)
  ),
}));
const order = {
  id: 'o',
  orderCode: 'TEST',
  totalAmount: 1500000,
  expiresAt: '2099-10-18T00:15:00Z',
  details: [{ courseTitle: 'Web' }],
};
const payment = {
  status: 'PENDING' as const,
  amount: 1500000,
  expiresAt: order.expiresAt,
  qrCode: 'PREVIEW-NOT-A-BANK-PAYMENT',
};
const props = {
  order,
  payment,
  bankInfo: null,
  onRetry: jest.fn(),
  onCopy: jest.fn(),
  onLeave: jest.fn(),
};
it('renders a QR and only real information when bankInfo is null', () => {
  render(<PaymentScreen {...props} />);
  expect(screen.getByTestId('payment-qr')).toBeTruthy();
  expect(QRCode).toHaveBeenCalledWith(
    expect.objectContaining({ value: payment.qrCode, ecl: 'M', quietZone: 8 }),
    undefined
  );
  expect(screen.getByTestId('payment-info-row-courses')).toBeTruthy();
  expect(screen.queryByTestId('payment-info-row-bank')).toBeNull();
  expect(screen.queryByTestId('payment-copy-account')).toBeNull();
});
it('shows missing and creating states without a QR', () => {
  const view = render(
    <PaymentScreen
      {...props}
      payment={{ ...payment, qrCode: null }}
    />
  );
  expect(screen.getByTestId('payment-qr-missing')).toBeTruthy();
  fireEvent.press(screen.getByTestId('payment-retry'));
  expect(props.onRetry).toHaveBeenCalledTimes(1);
  view.rerender(
    <PaymentScreen
      {...props}
      payment={null}
    />
  );
  expect(screen.getByTestId('payment-qr-loading')).toBeTruthy();
});
it('expires, hides copy and leaves without confirmation', () => {
  render(
    <PaymentScreen
      {...props}
      payment={{ ...payment, expiresAt: '2000-01-01T00:00:00Z' }}
    />
  );
  expect(screen.getByTestId('payment-qr-expired')).toBeTruthy();
  fireEvent.press(screen.getByTestId('payment-back'));
  expect(props.onLeave).toHaveBeenCalledTimes(1);
});
it('confirms before leaving a live order', () => {
  const alert = jest.spyOn(Alert, 'alert');
  render(<PaymentScreen {...props} />);
  fireEvent.press(screen.getByTestId('payment-back'));
  expect(alert).toHaveBeenCalledWith(
    'Rời trang thanh toán?',
    expect.any(String),
    expect.any(Array)
  );
  alert.mockRestore();
});

it('copies only the supplied bank details and hides copy actions after expiry', () => {
  const copy = jest.fn();
  const bankInfo = {
    bankName: 'Test bank',
    accountNumber: 'TEST-ACCOUNT',
    accountName: 'Test owner',
    transferNote: (code: string) => 'TEST ' + code,
  };
  const view = render(
    <PaymentScreen
      {...props}
      bankInfo={bankInfo}
      onCopy={copy}
    />
  );
  fireEvent.press(screen.getByTestId('payment-copy-account'));
  expect(copy).toHaveBeenCalledWith('số tài khoản', 'TEST-ACCOUNT');
  fireEvent.press(screen.getByTestId('payment-copy-note'));
  expect(copy).toHaveBeenLastCalledWith('nội dung', 'TEST TEST');
  view.rerender(
    <PaymentScreen
      {...props}
      bankInfo={bankInfo}
      payment={{ ...payment, expiresAt: '2000-01-01T00:00:00Z' }}
    />
  );
  expect(screen.queryByTestId('payment-copy-account')).toBeNull();
});
