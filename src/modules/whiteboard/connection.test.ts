import { EventEmitter } from 'events';
import { io } from 'socket.io-client';
import { BoardConnection } from './connection';
import { putShape } from './document';
import { fitPresenter, presenterSchema } from './viewport';
import {
  boardId,
  boardEpoch,
  boardSessionId,
  boardSync,
} from '../../../tests/fixtures/whiteboard';

function fixture(editable = false) {
  const events = new EventEmitter();
  const requests: {
    event: string;
    payload: object;
    ack: (error: Error | null, reply: object) => void;
  }[] = [];
  const socket = io('http://board.test', { autoConnect: false });
  jest.spyOn(socket, 'on').mockImplementation((name, listener) => {
    events.on(name, listener);
    return socket;
  });
  jest.spyOn(socket, 'timeout').mockReturnValue(socket);
  jest
    .spyOn(socket, 'emit')
    .mockImplementation(
      (
        event,
        payload: object,
        ack: (error: Error | null, reply: object) => void
      ) => {
        requests.push({ event, payload, ack });
        return socket;
      }
    );
  jest.spyOn(socket, 'connect').mockImplementation(() => {
    socket.connected = true;
    events.emit('connect');
    return socket;
  });
  jest.spyOn(socket, 'disconnect').mockImplementation(() => {
    socket.connected = false;
    events.emit('disconnect', 'io client disconnect');
    return socket;
  });
  const changed = jest.fn();
  const connection = new BoardConnection(
    socket,
    boardId,
    changed,
    async () => true
  );
  connection.start();
  const join = requests.shift();
  expect(join?.event).toBe('board:join');
  join?.ack(null, { ok: true, data: boardSync(editable) });
  return { connection, events, requests, socket };
}
const presenter = {
  connectionId: 'mentor-socket',
  identity: { id: boardSessionId, name: 'Mentor' },
  epoch: boardEpoch,
  x: -100,
  y: 50,
  width: 1200,
  height: 600,
  scale: 2,
};
it('accepts the dev board:viewport payload only for the current epoch and keeps the last camera offline', () => {
  const { connection, events } = fixture();
  events.emit('board:viewport', { ...presenter, epoch: boardSessionId });
  events.emit('board:viewport', { ...presenter, width: -1 });
  events.emit('board:viewport', { ...presenter, scale: 5 });
  expect(connection.state.presenter).toBeUndefined();
  events.emit('board:viewport', presenter);
  expect(connection.state.presenter).toEqual(presenter);
  expect(connection.state.presenterView).toEqual(presenter);
  events.emit('board:viewport', { ...presenter, x: 300, scale: 1 });
  expect(connection.state.presenterView?.x).toBe(300);
  events.emit('disconnect', 'transport close');
  expect(connection.state.presenter).toBeUndefined();
  expect(connection.state.presenterView?.x).toBe(300);
  connection.close();
});
it('expires a silent presenter after 6 seconds but keeps its last camera', () => {
  jest.useFakeTimers();
  try {
    const { connection, events } = fixture();
    events.emit('board:viewport', presenter);
    jest.advanceTimersByTime(5000);
    events.emit('board:viewport', presenter);
    jest.advanceTimersByTime(5000);
    expect(connection.state.presenter).toEqual(presenter);
    jest.advanceTimersByTime(1500);
    expect(connection.state.presenter).toBeUndefined();
    expect(connection.state.presenterView).toEqual(presenter);
    connection.close();
  } finally {
    jest.useRealTimers();
  }
});
it('applies a viewport that arrives before the join ACK once the epoch matches', () => {
  const events = new EventEmitter();
  const requests: { ack: (error: Error | null, reply: object) => void }[] = [];
  const socket = io('http://board.test', { autoConnect: false });
  jest.spyOn(socket, 'on').mockImplementation((name, listener) => {
    events.on(name, listener);
    return socket;
  });
  jest.spyOn(socket, 'timeout').mockReturnValue(socket);
  jest.spyOn(socket, 'emit').mockImplementation((_event, _payload, ack) => {
    requests.push({ ack });
    return socket;
  });
  jest.spyOn(socket, 'connect').mockImplementation(() => {
    socket.connected = true;
    events.emit('connect');
    return socket;
  });
  jest.spyOn(socket, 'disconnect').mockReturnValue(socket);
  const connection = new BoardConnection(
    socket,
    boardId,
    jest.fn(),
    async () => true
  );
  connection.start();
  events.emit('board:viewport', presenter);
  expect(connection.state.presenter).toBeUndefined();
  requests.shift()?.ack(null, { ok: true, data: boardSync() });
  expect(connection.state.presenter).toEqual(presenter);
  connection.close();
});
it('clears board content and pending edits on access revocation', () => {
  const { connection, events } = fixture(true);
  connection.edit((doc) =>
    putShape(doc, {
      id: boardSessionId,
      type: 'stroke',
      x: 1,
      y: 1,
      width: 2,
      height: 2,
      color: '#1D5B57',
      points: [0, 0, 1, 1],
      strokeWidth: 3,
    })
  );
  expect(connection.hasPending).toBe(true);
  events.emit('board:revoked');
  expect(connection.state.status).toBe('revoked');
  expect(connection.state.shapes).toEqual([]);
  expect(connection.hasPending).toBe(false);
  connection.close();
});
it('prevents drawing in presentation mode and waits for durable ACK in collaborative mode', () => {
  const readonly = fixture();
  expect(readonly.connection.edit(() => {})).toBe(false);
  readonly.connection.close();
  const { connection, requests } = fixture(true);
  connection.edit((doc) =>
    putShape(doc, {
      id: boardSessionId,
      type: 'rectangle',
      x: 1,
      y: 1,
      width: 20,
      height: 20,
      color: '#1D5B57',
      fill: 'transparent',
      strokeWidth: 3,
    })
  );
  expect(connection.state.status).toBe('saving');
  const update = requests.shift();
  const payload = update?.payload as { epoch: string; updateId: string };
  update?.ack(null, { ok: true, data: { ...payload, sequence: '1' } });
  expect(connection.state.status).toBe('ready');
  expect(connection.hasPending).toBe(false);
  connection.close();
});
it('fits the full mentor FOV (CSS size / scale) on portrait and landscape screens', () => {
  // Mentor shows world x -100..500, y 50..350 (1200x600 CSS px at 200%).
  for (const size of [
    { width: 360, height: 700 },
    { width: 1000, height: 400 },
  ]) {
    const fitted = fitPresenter(presenter, size);
    expect(fitted.zoom).toBeCloseTo(
      Math.min(size.width / 600, size.height / 300)
    );
    expect(size.width / fitted.zoom).toBeGreaterThanOrEqual(600 - 1e-6);
    expect(size.height / fitted.zoom).toBeGreaterThanOrEqual(300 - 1e-6);
    expect(fitted.x + size.width / (2 * fitted.zoom)).toBeCloseTo(200);
    expect(fitted.y + size.height / (2 * fitted.zoom)).toBeCloseTo(200);
  }
  expect(presenterSchema.safeParse({ ...presenter, x: Infinity }).success).toBe(
    false
  );
});
it('keeps the exact pending update through a background pause and same-epoch rejoin', () => {
  const { connection, requests } = fixture(true);
  connection.edit((doc) =>
    putShape(doc, {
      id: boardSessionId,
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      color: '#1D5B57',
      fill: 'transparent',
      strokeWidth: 3,
    })
  );
  const original = requests.shift();
  connection.pause();
  expect(connection.hasPending).toBe(true);
  connection.reconnect();
  const join = requests.shift();
  expect(join?.event).toBe('board:join');
  join?.ack(null, { ok: true, data: boardSync(true) });
  expect(requests.shift()?.payload).toEqual(original?.payload);
  connection.close();
});
const cursor = {
  connectionId: 'peer-socket',
  identity: { id: boardSessionId, name: 'Lan' },
  x: 120,
  y: -40,
};
it('tracks collaborator cursors from board:awareness and expires them after 4 seconds', () => {
  jest.useFakeTimers();
  try {
    const { connection, events } = fixture(true);
    events.emit('board:awareness', { ...cursor, x: Infinity });
    events.emit('board:awareness', { ...cursor, identity: { id: 'x' } });
    expect(connection.state.cursors).toEqual([]);
    events.emit('board:awareness', cursor);
    events.emit('board:awareness', { ...cursor, x: 130 });
    events.emit('board:awareness', {
      ...cursor,
      connectionId: 'other-socket',
      identity: { id: boardId, name: 'Minh' },
    });
    expect(connection.state.cursors).toEqual([
      { ...cursor, x: 130 },
      {
        ...cursor,
        connectionId: 'other-socket',
        identity: { id: boardId, name: 'Minh' },
      },
    ]);
    jest.advanceTimersByTime(3000);
    events.emit('board:awareness', { ...cursor, x: 140 });
    jest.advanceTimersByTime(1500);
    expect(connection.state.cursors).toEqual([{ ...cursor, x: 140 }]);
    events.emit('disconnect', 'transport close');
    expect(connection.state.cursors).toEqual([]);
    connection.close();
  } finally {
    jest.useRealTimers();
  }
});
it('publishes the local pen position at most every 120 ms while ready', () => {
  jest.useFakeTimers();
  try {
    const { connection, requests } = fixture(true);
    connection.awareness(10, 20);
    connection.awareness(11, 21);
    expect(requests.map((r) => [r.event, r.payload])).toEqual([
      ['board:awareness', { x: 10, y: 20 }],
    ]);
    jest.advanceTimersByTime(130);
    connection.awareness(12, 22);
    expect(requests).toHaveLength(2);
    expect(requests[1]?.payload).toEqual({ x: 12, y: 22 });
    connection.awareness(Infinity, 0);
    connection.close();
    connection.awareness(1, 1);
    expect(requests).toHaveLength(2);
  } finally {
    jest.useRealTimers();
  }
});
