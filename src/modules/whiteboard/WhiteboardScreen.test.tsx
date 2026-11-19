import '../../../tests/mocks/nativeUi';
import '@/config/i18n.config';
import { AppState } from 'react-native';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import { student } from '../../../tests/fixtures/commerce';
import {
  boardSync,
  boardEpoch,
  boardSessionId,
} from '../../../tests/fixtures/whiteboard';
import { useStore } from '@/state/store';
import { WhiteboardScreen } from './WhiteboardScreen';
import { whiteboardService } from './service';
import type { ConnectionState } from './connection';
import type { BoardCanvas } from './Canvas';

let mockChanged: (state: ConnectionState) => void;
const mockClose = jest.fn();
jest.mock('./connection', () => ({
  boardSocket: jest.fn(),
  BoardConnection: class {
    constructor(
      _socket: object,
      _boardId: string,
      changed: (state: ConnectionState) => void
    ) {
      mockChanged = changed;
    }
    start() {}
    close() {
      mockClose();
    }
    reconnect() {}
  },
}));
jest.mock('./Canvas', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } =
    jest.requireActual<typeof import('react-native')>('react-native');
  return {
    BoardCanvas: (props: React.ComponentProps<typeof BoardCanvas>) =>
      React.createElement(View, {
        testID: 'test-board-canvas',
        accessibilityValue: { text: JSON.stringify(props.viewport) },
        onLayout: ({
          nativeEvent: { layout },
        }: {
          nativeEvent: { layout: { width: number; height: number } };
        }) => props.onLayout?.(layout.width, layout.height),
      }),
  };
});
const camera = () =>
  JSON.parse(
    screen.getByTestId('test-board-canvas').props.accessibilityValue.text
  ) as { x: number; y: number; zoom: number };
beforeEach(() => {
  AppState.currentState = 'active';
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 1,
  });
  const sync = boardSync();
  jest.spyOn(whiteboardService, 'context').mockResolvedValue({
    board: sync.board,
    capabilities: sync.capabilities,
    context: {
      sessionId: boardSessionId,
      sessionTitle: 'Session',
      sessionStatus: 'IN_PROGRESS',
      classId: boardSessionId,
      className: 'Class',
    },
  });
});
afterEach(() => jest.restoreAllMocks());
const mentorView = (x: number, y: number, width: number, height: number) => ({
  connectionId: 'mentor-socket',
  identity: { id: boardSessionId, name: 'Mentor' },
  epoch: boardEpoch,
  x,
  y,
  width,
  height,
  scale: 1,
});
it('follows the mentor and keeps the last view when follow is disabled', async () => {
  renderWithProviders(
    <WhiteboardScreen
      sessionId={boardSessionId}
      onClose={jest.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getByTestId('test-board-canvas')).toBeTruthy()
  );
  act(() =>
    mockChanged({
      status: 'ready',
      sync: boardSync(),
      shapes: [],
      people: [],
      cursors: [],
      presenter: mentorView(100, 200, 640, 960),
      presenterView: mentorView(100, 200, 640, 960),
    })
  );
  expect(camera()).toEqual({
    x: 100,
    y: 200,
    zoom: 0.5,
  });
  fireEvent.press(screen.getByTestId('whiteboard-follow'));
  expect(camera()).toEqual({
    x: 100,
    y: 200,
    zoom: 0.5,
  });
  act(() =>
    mockChanged({
      status: 'ready',
      sync: boardSync(),
      shapes: [],
      people: [],
      cursors: [],
      presenter: mentorView(500, 200, 640, 960),
      presenterView: mentorView(500, 200, 640, 960),
    })
  );
  expect(camera().x).toBe(100);
  fireEvent.press(screen.getByTestId('whiteboard-follow'));
  expect(camera().x).toBe(500);
});
it('clears the canvas and closes the connection on logout', async () => {
  renderWithProviders(
    <WhiteboardScreen
      sessionId={boardSessionId}
      onClose={jest.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getByTestId('test-board-canvas')).toBeTruthy()
  );
  act(() => useStore.setState({ sessionUser: null, generation: 2 }));
  expect(screen.queryByTestId('test-board-canvas')).toBeNull();
  expect(mockClose).toHaveBeenCalled();
});

it('fits the entire presenter viewport into the available canvas after resizing', async () => {
  renderWithProviders(
    <WhiteboardScreen
      sessionId={boardSessionId}
      onClose={jest.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getByTestId('test-board-canvas')).toBeTruthy()
  );
  const presenterView = { x: 100, y: 200, width: 1280, height: 720 };
  act(() =>
    mockChanged({
      status: 'ready',
      sync: boardSync(true),
      shapes: [],
      people: [],
      cursors: [],
      presenter: mentorView(100, 200, 1280, 720),
      presenterView: mentorView(100, 200, 1280, 720),
    })
  );
  // Canvas dimensions exclude the header, presenter controls and toolbar.
  for (const size of [
    { width: 320, height: 460 },
    { width: 740, height: 180 },
    { width: 768, height: 900 },
  ]) {
    fireEvent(screen.getByTestId('test-board-canvas'), 'layout', {
      nativeEvent: { layout: size },
    });
    const view = camera();
    expect(view.zoom).toBeCloseTo(
      Math.min(
        size.width / presenterView.width,
        size.height / presenterView.height
      )
    );
    expect((presenterView.x - view.x) * view.zoom).toBeGreaterThanOrEqual(
      -1e-6
    );
    expect((presenterView.y - view.y) * view.zoom).toBeGreaterThanOrEqual(
      -1e-6
    );
    expect(
      (presenterView.x + presenterView.width - view.x) * view.zoom
    ).toBeLessThanOrEqual(size.width + 1e-6);
    expect(
      (presenterView.y + presenterView.height - view.y) * view.zoom
    ).toBeLessThanOrEqual(size.height + 1e-6);
  }
  expect(
    screen.getByTestId('whiteboard-follow').props.accessibilityState
  ).toEqual({
    selected: true,
  });
});

it('moves the camera with every mentor viewport while following', async () => {
  renderWithProviders(
    <WhiteboardScreen
      sessionId={boardSessionId}
      onClose={jest.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getByTestId('test-board-canvas')).toBeTruthy()
  );
  for (const x of [100, 900, -400]) {
    const view = { ...mentorView(x, 200, 640, 960), scale: 2 };
    act(() =>
      mockChanged({
        status: 'ready',
        sync: boardSync(),
        shapes: [],
        people: [],
        cursors: [],
        presenter: view,
        presenterView: view,
      })
    );
    expect(camera()).toEqual({ x, y: 200, zoom: 1 });
  }
});
