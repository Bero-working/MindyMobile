import '../../../tests/mocks/nativeUi';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import '@/config/i18n.config';
import { ClassDetailScreen } from './ClassDetailScreen';
import type { ClassDetail } from './types';
jest.mock('@/components/common/AppSheet', () => ({
  AppSheet: ({
    children,
    onClose,
  }: {
    children: import('react').ReactNode;
    onClose: () => void;
  }) => {
    const React = jest.requireActual<typeof import('react')>('react');
    const { View } =
      jest.requireActual<typeof import('react-native')>('react-native');
    return React.createElement(
      View,
      { testID: 'test-participants-modal', onTouchEnd: onClose },
      children
    );
  },
}));
const base = {
  id: 'a',
  code: 'A',
  name: 'Class',
  startDate: '2026-10-20',
  endDate: '2026-12-20',
  deliveryMode: 'ONLINE' as const,
  classStatus: 'OPEN' as const,
  mentor: null,
};
const session = {
  id: 's',
  sessionNumber: 1,
  title: 'Session',
  startsAt: '2026-10-20T01:00:00Z',
  endsAt: '2026-10-20T02:00:00Z',
  roomName: null,
  status: 'SCHEDULED' as const,
};
const full: ClassDetail = {
  ...base,
  accessMode: 'FULL',
  meetingUrl: 'https://example.test/class',
  units: [
    { id: 'u', title: 'Unit', sessions: [{ ...session, meetingUrl: null }] },
  ],
};
it('opens the teacher sheet with a pending student list and clears it on denial', () => {
  const props = {
    detail: {
      status: 'success' as const,
      data: { ...full, mentor: { displayName: 'Trần Quang' } },
    },
    timeZone: 'Asia/Ho_Chi_Minh',
    onBack: jest.fn(),
    onJoin: jest.fn(),
  };
  const view = render(<ClassDetailScreen {...props} />);
  fireEvent.press(screen.getByTestId('class-detail-participants'));
  expect(screen.getByTestId('class-participants-sheet')).toBeTruthy();
  expect(screen.getByTestId('class-participants-mentor').props.children).toBe(
    'Trần Quang'
  );
  expect(screen.getByTestId('class-participants-pending')).toBeTruthy();
  expect(screen.queryByTestId('class-participants-close')).toBeNull();
  fireEvent(screen.getByTestId('test-participants-modal'), 'touchEnd');
  expect(screen.queryByTestId('class-participants-sheet')).toBeNull();
  fireEvent.press(screen.getByTestId('class-detail-participants'));
  view.rerender(
    <ClassDetailScreen
      {...props}
      detail={{
        status: 'error',
        data: null,
        error: { code: 'CLASS_ACCESS_DENIED' },
      }}
    />
  );
  expect(screen.queryByTestId('class-participants-sheet')).toBeNull();
});
it('highlights only the next session and advances the highlight when it ends', () => {
  jest.useFakeTimers();
  const now = Date.parse('2026-10-20T12:00:00Z');
  jest.setSystemTime(now);
  try {
    const view = render(
      <ClassDetailScreen
        detail={{
          status: 'success',
          data: {
            ...full,
            units: [
              {
                id: 'u',
                title: 'Unit',
                sessions: [
                  {
                    ...session,
                    id: 'later',
                    startsAt: new Date(now + 2000).toISOString(),
                    endsAt: new Date(now + 3000).toISOString(),
                    meetingUrl: null,
                  },
                  {
                    ...session,
                    id: 'next',
                    startsAt: new Date(now - 1000).toISOString(),
                    endsAt: new Date(now + 1000).toISOString(),
                    meetingUrl: null,
                  },
                ],
              },
            ],
          },
        }}
        timeZone="Asia/Ho_Chi_Minh"
        onBack={jest.fn()}
        onJoin={jest.fn()}
      />
    );
    expect(
      screen.getByTestId('class-detail-session-next').props.accessibilityState
        .selected
    ).toBe(true);
    expect(
      screen.getByTestId('class-detail-session-later').props.accessibilityState
        .selected
    ).toBe(false);
    act(() => jest.advanceTimersByTime(1000));
    expect(
      screen.getByTestId('class-detail-session-next').props.accessibilityState
        .selected
    ).toBe(false);
    expect(
      screen.getByTestId('class-detail-session-later').props.accessibilityState
        .selected
    ).toBe(true);
    view.unmount();
  } finally {
    jest.useRealTimers();
  }
});
it('opens the selected session, uses root fallback and removes join on preview', async () => {
  const join = jest.fn().mockResolvedValue(undefined);
  const props = {
    detail: { status: 'success' as const, data: full },
    onBack: jest.fn(),
    onJoin: join,
    timeZone: 'Asia/Ho_Chi_Minh',
    sessionId: 's',
  };
  const view = render(<ClassDetailScreen {...props} />);
  await act(async () => {
    fireEvent.press(screen.getByTestId('class-session-join'));
  });
  expect(join).toHaveBeenCalledWith('https://example.test/class');
  view.rerender(
    <ClassDetailScreen
      {...props}
      detail={{
        status: 'success',
        data: {
          ...base,
          accessMode: 'CASH_PREVIEW',
          expiresAt: null,
          units: [{ id: 'u', title: 'Unit', sessions: [session] }],
        },
      }}
    />
  );
  expect(screen.queryByTestId('class-session-join')).toBeNull();
});
it.each([
  'javascript:alert(1)',
  'file:///secret',
  'https://',
  'https://user:password@example.test',
])('does not expose unsafe links: %s', (url) => {
  render(
    <ClassDetailScreen
      detail={{ status: 'success', data: { ...full, meetingUrl: url } }}
      onBack={jest.fn()}
      onJoin={jest.fn()}
      timeZone="Asia/Ho_Chi_Minh"
      sessionId="s"
    />
  );
  expect(screen.queryByTestId('class-session-join')).toBeNull();
});
it('clears the session screen when detail is denied', () => {
  const props = {
    onBack: jest.fn(),
    onJoin: jest.fn(),
    timeZone: 'Asia/Ho_Chi_Minh',
    sessionId: 's',
  };
  const view = render(
    <ClassDetailScreen
      {...props}
      detail={{ status: 'success', data: full }}
    />
  );
  view.rerender(
    <ClassDetailScreen
      {...props}
      detail={{
        status: 'error',
        data: null,
        error: { code: 'CLASS_ACCESS_DENIED' },
      }}
    />
  );
  expect(screen.queryByTestId('class-session-join')).toBeNull();
  expect(screen.queryByText('Session')).toBeNull();
  expect(screen.queryByTestId('class-detail-join')).toBeNull();
});

it.each(['OFFLINE', 'CANCELLED'] as const)(
  'blocks joining %s sessions',
  (mode) => {
    render(
      <ClassDetailScreen
        detail={{
          status: 'success',
          data: {
            ...full,
            deliveryMode: mode === 'OFFLINE' ? 'OFFLINE' : 'ONLINE',
            units: [
              {
                id: 'u',
                title: 'Unit',
                sessions: [
                  {
                    ...session,
                    status: mode === 'CANCELLED' ? 'CANCELLED' : 'SCHEDULED',
                    meetingUrl: 'https://example.test/session',
                  },
                ],
              },
            ],
          },
        }}
        onBack={jest.fn()}
        onJoin={jest.fn()}
        timeZone="Asia/Ho_Chi_Minh"
        sessionId="s"
      />
    );
    expect(screen.queryByTestId('class-session-join')).toBeNull();
    expect(screen.queryByTestId('class-detail-join')).toBeNull();
  }
);

it('keeps the session screen open when opening a link fails', async () => {
  render(
    <ClassDetailScreen
      detail={{ status: 'success', data: full }}
      onBack={jest.fn()}
      onJoin={jest.fn().mockRejectedValue(new Error('Unavailable'))}
      timeZone="Asia/Ho_Chi_Minh"
      sessionId="s"
    />
  );
  fireEvent.press(screen.getByTestId('class-session-join'));
  await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
  expect(screen.getByTestId('class-session-screen')).toBeTruthy();
});

it('joins from the footer only after a tap and hides it for CASH preview', async () => {
  const join = jest.fn().mockResolvedValue(undefined);
  const props = {
    onBack: jest.fn(),
    onJoin: join,
    timeZone: 'Asia/Ho_Chi_Minh',
  };
  const view = render(
    <ClassDetailScreen
      {...props}
      detail={{ status: 'success', data: full }}
    />
  );
  expect(join).not.toHaveBeenCalled();
  await act(async () => {
    fireEvent.press(screen.getByTestId('class-detail-join'));
  });
  expect(join).toHaveBeenCalledWith('https://example.test/class');
  view.rerender(
    <ClassDetailScreen
      {...props}
      detail={{
        status: 'success',
        data: {
          ...base,
          accessMode: 'CASH_PREVIEW',
          expiresAt: null,
          units: [{ id: 'u', title: 'Unit', sessions: [session] }],
        },
      }}
    />
  );
  expect(screen.queryByTestId('class-detail-join')).toBeNull();
});

it('retains a back action while loading without data', () => {
  const back = jest.fn();
  render(
    <ClassDetailScreen
      detail={{ status: 'loading', data: null }}
      onBack={back}
      onJoin={jest.fn()}
      timeZone="Asia/Ho_Chi_Minh"
    />
  );
  fireEvent.press(screen.getByTestId('class-detail-back'));
  expect(back).toHaveBeenCalledTimes(1);
});

it('does not invite joining a completed session or enable unavailable materials', () => {
  render(
    <ClassDetailScreen
      detail={{
        status: 'success',
        data: {
          ...full,
          units: [
            {
              id: 'u',
              title: 'Unit',
              sessions: [
                {
                  ...session,
                  status: 'COMPLETED',
                  meetingUrl: 'https://example.test/session',
                },
              ],
            },
          ],
        },
      }}
      sessionId="s"
      onBack={jest.fn()}
      onJoin={jest.fn()}
      timeZone="Asia/Ho_Chi_Minh"
    />
  );
  expect(screen.getByTestId('class-session-screen')).toBeTruthy();
  expect(screen.queryByTestId('class-session-join')).toBeNull();
  expect(screen.getByTestId('class-session-materials')).toBeDisabled();
});
