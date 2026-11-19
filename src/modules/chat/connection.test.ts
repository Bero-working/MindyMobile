import { EventEmitter } from 'events';
import { io } from 'socket.io-client';
import { ChatConnection } from './connection';
import { chatService } from './service';
import { upsertMessages } from './model';
import {
  chatId,
  chatMessage,
  clientMessageId,
} from '../../../tests/fixtures/chat';

function fixture() {
  const emitter = new EventEmitter();
  const socket = io('http://chat.test/chat', { autoConnect: false });
  const requests: { name: string; payload: object }[] = [];
  const status = jest.fn(),
    message = jest.fn(),
    revoked = jest.fn(),
    ready = jest.fn();
  const send = jest.fn(async (name: string, payload: object) => {
    requests.push({ name, payload });
    return name === 'message:send'
      ? { ok: true, data: { message: chatMessage, replayed: false } }
      : { ok: true, data: { conversationId: chatId } };
  });
  jest.spyOn(socket, 'on').mockImplementation((name, callback) => {
    emitter.on(name, callback);
    return socket;
  });
  jest.spyOn(socket, 'timeout').mockReturnValue(socket);
  jest.spyOn(socket, 'emitWithAck').mockImplementation(send);
  jest.spyOn(socket, 'connect').mockImplementation(() => {
    socket.connected = true;
    emitter.emit('connect');
    return socket;
  });
  jest.spyOn(socket, 'disconnect').mockImplementation(() => {
    socket.connected = false;
    return socket;
  });
  const connection = new ChatConnection(socket, {
    status,
    message,
    revoked,
    ready,
    changed: jest.fn(),
    typing: jest.fn(),
  });
  connection.setRooms([chatId]);
  connection.start();
  return {
    connection,
    emitter,
    socket,
    requests,
    send,
    message,
    revoked,
    ready,
    status,
  };
}
afterEach(() => jest.restoreAllMocks());
it('joins the authorized room and sends messages through Socket.IO with a stable client ID', async () => {
  const f = fixture();
  await new Promise((resolve) => setImmediate(resolve));
  expect(f.ready).toHaveBeenCalled();
  expect(await f.connection.send(chatId, clientMessageId, 'Chào thầy')).toEqual(
    chatMessage
  );
  expect(f.requests).toContainEqual({
    name: 'message:send',
    payload: {
      conversationId: chatId,
      clientMessageId,
      type: 'TEXT',
      body: 'Chào thầy',
    },
  });
  f.connection.close();
});
it('does not blindly resend by HTTP after a socket ACK timeout', async () => {
  const f = fixture();
  await new Promise((resolve) => setImmediate(resolve));
  const http = jest.spyOn(chatService, 'send');
  f.send.mockRejectedValueOnce(new Error('ACK timeout'));
  await expect(
    f.connection.send(chatId, clientMessageId, 'Chào thầy')
  ).rejects.toThrow('ACK timeout');
  expect(http).not.toHaveBeenCalled();
  await f.connection.send(chatId, clientMessageId, 'Chào thầy');
  expect(
    f.requests
      .filter((r) => r.name === 'message:send')
      .every(
        (r) =>
          (r.payload as { clientMessageId: string }).clientMessageId ===
          clientMessageId
      )
  ).toBe(true);
  f.connection.close();
});
it('validates realtime events, rejects another room and handles access changes', async () => {
  const f = fixture();
  const event = {
    eventId: clientMessageId,
    sequence: '1',
    type: 'message:created',
    message: chatMessage,
  };
  f.emitter.emit('message:created', {
    ...event,
    message: { ...chatMessage, conversationId: clientMessageId },
  });
  f.emitter.emit('message:created', { ...event, message: { body: 'bad' } });
  expect(f.message).not.toHaveBeenCalled();
  f.emitter.emit('message:created', event);
  expect(f.message).toHaveBeenCalledWith(chatMessage);
  f.emitter.emit('conversation:access-changed', { conversationId: chatId });
  expect(f.revoked).toHaveBeenCalledWith(chatId);
  f.connection.close();
});
it('merges duplicate delivery without replacing edited or deleted messages with older versions', () => {
  const removed = {
    ...chatMessage,
    body: null,
    version: 3,
    deletedAt: '2026-11-06T04:00:00Z',
  };
  expect(upsertMessages([removed], [chatMessage, chatMessage])).toEqual([
    removed,
  ]);
});
