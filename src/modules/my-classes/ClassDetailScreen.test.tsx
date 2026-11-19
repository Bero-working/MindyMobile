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
it('opens the selected session unit materials for verified FULL access', () => {
  const materials = jest.fn();
  render(
    <ClassDetailScreen
      detail={{ status: 'success', data: full }}
      sessionId="s"
      timeZone="Asia/Ho_Chi_Minh"
      onBack={jest.fn()}
      onJoin={jest.fn()}
      onMaterials={materials}
    />
  );
  fireEvent.press(screen.getByTestId('class-session-materials'));
  expect(materials).toHaveBeenCalledWith('u', 'Unit');
});

it('keeps materials out of the class session list', () => {
  render(
    <ClassDetailScreen
      timeZone="Asia/Ho_Chi_Minh"
      onBack={jest.fn()}
      onJoin={jest.fn()}
      onMaterials={jest.fn()}
      detail={{
        status: 'success',
        data: {
          ...full,
          units: [
            {
              id: 'u',
              title: 'Unit',
              sessions: [{ ...session, meetingUrl: null }],
            },
          ],
        },
      }}
    />
  );
  expect(screen.queryByTestId('class-unit-materials-u')).toBeNull();
});

it('has no class-wide materials button', () => {
  render(
    <ClassDetailScreen
      timeZone="Asia/Ho_Chi_Minh"
      onBack={jest.fn()}
      onJoin={jest.fn()}
      onMaterials={jest.fn()}
      detail={{ status: 'success', data: full }}
    />
  );
  expect(screen.queryByTestId('class-detail-materials')).toBeNull();
});

it('offers the whiteboard only for a verified FULL, non-cancelled session', () => {
  const props = {
    sessionId: session.id,
    timeZone: 'Asia/Ho_Chi_Minh',
    onBack: jest.fn(),
    onJoin: jest.fn(),
  };
  const view = render(
    <ClassDetailScreen
      {...props}
      detail={{ status: 'success', data: full }}
    />
  );
  expect(screen.getByTestId('class-session-whiteboard')).toBeTruthy();
  expect(screen.getByTestId('class-session-tab-assignments')).toBeTruthy();
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
  expect(screen.queryByTestId('class-session-whiteboard')).toBeNull();
  expect(screen.queryByTestId('class-session-tab-assignments')).toBeNull();
  view.rerender(
    <ClassDetailScreen
      {...props}
      detail={{
        status: 'success',
        data: {
          ...full,
          units: [
            {
              id: 'u',
              title: 'Unit',
              sessions: [{ ...session, status: 'CANCELLED', meetingUrl: null }],
            },
          ],
        },
      }}
    />
  );
  expect(screen.queryByTestId('class-session-whiteboard')).toBeNull();
  expect(screen.queryByTestId('class-session-tab-assignments')).toBeNull();
});
it('keeps mentor information without the floating participants button', () => {
  render(
    <ClassDetailScreen
      detail={{
        status: 'success',
        data: { ...full, mentor: { displayName: 'Trần Quang' } },
      }}
      timeZone="Asia/Ho_Chi_Minh"
      onBack={jest.fn()}
      onJoin={jest.fn()}
    />
  );
  expect(screen.getByText('Trần Quang')).toBeTruthy();
  expect(screen.queryByTestId('class-detail-participants')).toBeNull();
  expect(screen.queryByTestId('class-participants-sheet')).toBeNull();
  expect(screen.getByTestId('class-detail-join')).toBeTruthy();
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

it('reports when the deep-linked session is closed so it is not reopened', async () => {
  const onSessionClose = jest.fn();
  render(
    <ClassDetailScreen
      detail={{ status: 'success', data: full }}
      sessionId="s"
      timeZone="Asia/Ho_Chi_Minh"
      onBack={jest.fn()}
      onJoin={jest.fn()}
      onSessionClose={onSessionClose}
    />
  );
  fireEvent.press(await screen.findByTestId('class-session-close'));
  expect(onSessionClose).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('class-session-close')).toBeNull();
});
