import '../../../../tests/mocks/nativeUi';
import { AccessibilityInfo } from 'react-native';
import { fireEvent, render, screen, act } from '@testing-library/react-native';
import i18n from '@/config/i18n.config';
import { PaymentResultTicket } from './PaymentResultTicket';

const actions = { onHome: jest.fn(), onCourses: jest.fn() };
beforeEach(() => jest.clearAllMocks());
it.each(['PAID', 'CANCELLED', 'EXPIRED'] as const)(
  'renders the %s ticket with order details',
  (state) => {
    render(
      <PaymentResultTicket
        result={{ state, orderCode: 'TEST-5', amount: 1500000 }}
        {...actions}
      />
    );
    expect(screen.getByTestId('payment-result-ticket')).toBeTruthy();
    expect(
      screen.getByTestId('payment-result-title').props.children
    ).not.toContain('payment.result.');
    expect(screen.getByText('TEST-5')).toBeTruthy();
    expect(screen.queryByTestId('payment-result-check-again')).toBeNull();
  }
);
it.each(['PAID', 'CANCELLED', 'EXPIRED'] as const)(
  'waits for a user action and deduplicates %s CTA taps',
  (state) => {
    render(
      <PaymentResultTicket
        result={{ state }}
        {...actions}
      />
    );
    expect(actions.onHome).not.toHaveBeenCalled();
    expect(actions.onCourses).not.toHaveBeenCalled();
    const button = screen.getByTestId(
      state === 'PAID' ? 'payment-result-home' : 'payment-result-retry'
    );
    fireEvent.press(button);
    fireEvent.press(button);
    expect(
      state === 'PAID' ? actions.onHome : actions.onCourses
    ).toHaveBeenCalledTimes(1);
    expect(
      state === 'PAID' ? actions.onCourses : actions.onHome
    ).not.toHaveBeenCalled();
  }
);
it.each(['PAID', 'CANCELLED', 'EXPIRED'] as const)(
  'handles Back safely for %s',
  (state) => {
    render(
      <PaymentResultTicket
        result={{ state }}
        {...actions}
      />
    );
    fireEvent(screen.getByTestId('payment-result-surface'), 'requestClose');
    expect(
      state === 'PAID' ? actions.onHome : actions.onCourses
    ).toHaveBeenCalledTimes(1);
  }
);
it('announces only a result transition, not an order metadata update', () => {
  const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
  const view = render(
    <PaymentResultTicket
      result={{ state: 'CANCELLED', orderCode: 'TEST-5' }}
      {...actions}
    />
  );
  view.rerender(
    <PaymentResultTicket
      result={{ state: 'CANCELLED', orderCode: 'TEST-5', amount: 1500000 }}
      {...actions}
    />
  );
  expect(announce).toHaveBeenCalledTimes(1);
  view.rerender(
    <PaymentResultTicket
      result={{ state: 'PAID', orderCode: 'TEST-5' }}
      {...actions}
    />
  );
  expect(announce).toHaveBeenCalledTimes(2);
  announce.mockRestore();
});
it('focuses the ticket title after native presentation', () => {
  const handle = jest
    .spyOn(jest.requireActual('react-native'), 'findNodeHandle')
    .mockReturnValue(7);
  const focus = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus');
  render(
    <PaymentResultTicket
      result={{ state: 'PAID' }}
      {...actions}
    />
  );
  fireEvent(screen.getByTestId('payment-result-surface'), 'show');
  expect(focus).toHaveBeenCalledWith(7);
  handle.mockRestore();
  focus.mockRestore();
});
it('supports English for all three results', async () => {
  await act(async () => {
    await i18n.changeLanguage('en-EN');
  });
  try {
    const view = render(
      <PaymentResultTicket
        result={{ state: 'PAID' }}
        {...actions}
      />
    );
    expect(screen.getByText('Payment successful')).toBeTruthy();
    view.rerender(
      <PaymentResultTicket
        result={{ state: 'CANCELLED' }}
        {...actions}
      />
    );
    expect(screen.getByText('Payment unsuccessful')).toBeTruthy();
    view.rerender(
      <PaymentResultTicket
        result={{ state: 'EXPIRED' }}
        {...actions}
      />
    );
    expect(screen.getByText('Payment order expired')).toBeTruthy();
  } finally {
    await act(async () => {
      await i18n.changeLanguage('vi-VN');
    });
  }
});
