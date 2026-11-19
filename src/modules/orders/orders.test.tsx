import '../../../tests/mocks/nativeUi';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import '@/config/i18n.config';
import { ApiError } from '@/shared/utilities/apiError';
import { OrdersScreen } from './OrdersScreen';
import { OrderDetailScreen } from './OrderDetailScreen';
import type { Order } from './types';

jest.mock('@/components/common/AppSheet', () => ({
  AppSheet: jest.requireActual('react-native').View,
}));

const order: Order = {
  id: 'o1',
  orderCode: 'MD123',
  status: 'PENDING',
  paymentType: 'PAYOS',
  totalAmount: 1500000,
  createdAt: '2026-11-01T01:00:00Z',
  paidAt: null,
  expiresAt: '2099-11-06T12:00:00Z',
  details: [
    {
      id: 'd1',
      classId: 'c1',
      courseTitle: 'Web development',
      className: 'WEB-01',
      quantity: 1,
      priceAmount: 1500000,
      totalAmount: 1500000,
    },
  ],
};

function detail(
  value = order,
  cancel = jest.fn().mockResolvedValue(undefined)
) {
  return render(
    <OrderDetailScreen
      order={{ status: 'success', data: value }}
      onBack={jest.fn()}
      onCancel={cancel}
    />
  );
}

it('renders the course image and falls back when loading fails', () => {
  render(
    <OrdersScreen
      orders={{
        status: 'success',
        data: [
          {
            ...order,
            details: order.details.map((item) => ({
              ...item,
              imgUrl: 'https://images.mindy.test/web.jpg',
            })),
          },
        ],
      }}
      filter="ALL"
      onFilter={jest.fn()}
      onOpen={jest.fn()}
      onBack={jest.fn()}
      onExplore={jest.fn()}
    />
  );
  expect(
    screen.getByTestId(`order-cover-${order.id}-image`).props.source.uri
  ).toBe('https://images.mindy.test/web.jpg');
  fireEvent(screen.getByTestId(`order-cover-${order.id}-image`), 'error');
  expect(screen.getByTestId(`order-cover-${order.id}-fallback`)).toBeTruthy();
});

it('shows purchase snapshots and calls list actions', () => {
  const open = jest.fn(),
    filter = jest.fn(),
    more = jest.fn(),
    refresh = jest.fn();
  render(
    <OrdersScreen
      orders={{ status: 'success', data: [order] }}
      filter="ALL"
      onFilter={filter}
      onOpen={open}
      onBack={jest.fn()}
      onExplore={jest.fn()}
      hasMore
      onLoadMore={more}
      onRefresh={refresh}
    />
  );
  expect(screen.getByText('WEB-01')).toBeTruthy();
  expect(screen.getByText('1.500.000 VND')).toBeTruthy();
  expect(screen.getByText('Chờ thanh toán')).toBeTruthy();
  expect(screen.queryByTestId('orders-filter-dot')).toBeNull();
  fireEvent.press(screen.getByTestId('order-open-o1'));
  expect(open).toHaveBeenCalledWith('o1');
  expect(screen.queryByTestId('orders-filter-PAID')).toBeNull();
  fireEvent.press(screen.getByTestId('orders-filter-toggle'));
  fireEvent.press(screen.getByTestId('orders-filter-PAID'));
  expect(filter).toHaveBeenCalledWith('PAID');
  expect(screen.queryByTestId('orders-filter-PAID')).toBeNull();
  fireEvent.press(screen.getByTestId('orders-load-more'));
  expect(more).toHaveBeenCalledTimes(1);
});

it('shows the active-filter dot and searches loaded orders on the client', () => {
  const base = order.details[0] as Order['details'][number];
  const second: Order = {
    ...order,
    id: 'o2',
    orderCode: 'MD999',
    details: [
      {
        ...base,
        id: 'd2',
        courseTitle: 'Python cơ bản',
        className: 'PY-02',
      },
      {
        ...base,
        id: 'd3',
        courseTitle: 'Data',
        className: 'DATA-01',
      },
    ],
  };
  render(
    <OrdersScreen
      orders={{ status: 'success', data: [order, second] }}
      filter="PENDING"
      onFilter={jest.fn()}
      onOpen={jest.fn()}
      onBack={jest.fn()}
      onExplore={jest.fn()}
    />
  );
  expect(screen.getByTestId('orders-filter-dot')).toBeTruthy();
  expect(screen.getByText('+1 khóa học khác')).toBeTruthy();
  fireEvent.changeText(screen.getByTestId('orders-search'), 'python');
  expect(screen.queryByTestId('order-card-o1')).toBeNull();
  expect(screen.getByTestId('order-card-o2')).toBeTruthy();
  fireEvent.changeText(screen.getByTestId('orders-search'), 'md123');
  expect(screen.getByTestId('order-card-o1')).toBeTruthy();
  fireEvent.changeText(screen.getByTestId('orders-search'), 'không có');
  expect(screen.getByTestId('orders-search-empty')).toBeTruthy();
});

it('offers continue payment only for open payOS pending orders', () => {
  const pay = jest.fn();
  const view = (data: Order[]) => (
    <OrdersScreen
      orders={{ status: 'success', data }}
      filter="ALL"
      onFilter={jest.fn()}
      onOpen={jest.fn()}
      onPay={pay}
      onBack={jest.fn()}
      onExplore={jest.fn()}
    />
  );
  const screenView = render(view([order]));
  fireEvent.press(screen.getByTestId('order-pay-o1'));
  expect(pay).toHaveBeenCalledWith('o1');
  expect(screen.getByText('Tiếp tục thanh toán')).toBeTruthy();
  expect(screen.getByTestId('order-open-o1')).toBeTruthy();
  screenView.rerender(
    view([
      { ...order, id: 'paid', status: 'PAID' },
      { ...order, id: 'late', expiresAt: '2020-01-01T00:00:00Z' },
      { ...order, id: 'cash', paymentType: 'CASH' },
    ])
  );
  expect(screen.queryByTestId('order-pay-paid')).toBeNull();
  expect(screen.queryByTestId('order-pay-late')).toBeNull();
  expect(screen.queryByTestId('order-pay-cash')).toBeNull();
});

it('requires confirmation and keeping an order never cancels it', () => {
  const cancel = jest.fn();
  detail(order, cancel);
  fireEvent.press(screen.getByTestId('order-cancel'));
  expect(cancel).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId('order-cancel-keep'));
  expect(screen.queryByTestId('order-cancel-confirm')).toBeNull();
  expect(cancel).not.toHaveBeenCalled();
});

it('blocks duplicate cancellation and keeps the sheet locked until completion', async () => {
  let finish: (() => void) | undefined;
  const cancel = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  detail(order, cancel);
  fireEvent.press(screen.getByTestId('order-cancel'));
  fireEvent.press(screen.getByTestId('order-cancel-confirm'));
  fireEvent.press(screen.getByTestId('order-cancel-confirm'));
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('order-cancel-confirm')).toBeDisabled();
  expect(screen.getByTestId('order-cancel-keep')).toBeDisabled();
  await act(async () => {
    finish?.();
  });
  expect(screen.queryByTestId('order-cancel-confirm')).toBeNull();
});

it('retains cancellation errors and request IDs, allowing a retry', async () => {
  const cancel = jest.fn().mockRejectedValue(
    new ApiError({
      statusCode: 409,
      code: 'ORDER_NOT_CANCELLABLE',
      message: 'Conflict',
      requestId: 'cancel-req',
    })
  );
  detail(order, cancel);
  fireEvent.press(screen.getByTestId('order-cancel'));
  fireEvent.press(screen.getByTestId('order-cancel-confirm'));
  await waitFor(() => expect(screen.getByText(/cancel-req/)).toBeTruthy());
  expect(screen.getByTestId('order-cancel-confirm')).not.toBeDisabled();
  cancel.mockResolvedValueOnce(undefined);
  await act(async () => {
    fireEvent.press(screen.getByTestId('order-cancel-confirm'));
  });
  expect(cancel).toHaveBeenCalledTimes(2);
  expect(screen.queryByTestId('order-cancel-confirm')).toBeNull();
});

it.each(['PAID', 'EXPIRED', 'CANCELLED'] as const)(
  'hides cancellation for %s orders',
  (status) => {
    detail({ ...order, status });
    expect(screen.queryByTestId('order-cancel')).toBeNull();
  }
);

it('hides cancellation for a pending order past its deadline', () => {
  detail({ ...order, expiresAt: '2020-01-01T00:00:00Z' });
  expect(screen.queryByTestId('order-cancel')).toBeNull();
});

it('blocks confirmation when the deadline passes with the sheet open', () => {
  jest.useFakeTimers();
  try {
    detail({ ...order, expiresAt: new Date(Date.now() + 2000).toISOString() });
    fireEvent.press(screen.getByTestId('order-cancel'));
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId('order-cancel-confirm')).toBeDisabled();
    expect(screen.queryByTestId('order-cancel')).toBeNull();
  } finally {
    jest.useRealTimers();
  }
});

it('shows loading, empty, error and retry states', () => {
  const props = {
    filter: 'ALL' as const,
    onFilter: jest.fn(),
    onOpen: jest.fn(),
    onBack: jest.fn(),
    onExplore: jest.fn(),
  };
  const retry = jest.fn();
  const view = render(
    <OrdersScreen
      {...props}
      orders={{ status: 'loading', data: null }}
    />
  );
  expect(screen.getByTestId('orders-loading')).toBeTruthy();
  view.rerender(
    <OrdersScreen
      {...props}
      orders={{ status: 'success', data: [] }}
    />
  );
  expect(screen.getByTestId('orders-empty')).toBeTruthy();
  view.rerender(
    <OrdersScreen
      {...props}
      orders={{
        status: 'error',
        data: null,
        error: { code: 'NETWORK_ERROR', requestId: 'list-req' },
        onRetry: retry,
      }}
    />
  );
  expect(screen.getByText(/list-req/)).toBeTruthy();
  fireEvent.press(screen.getByTestId('orders-retry'));
  expect(retry).toHaveBeenCalledTimes(1);
});
