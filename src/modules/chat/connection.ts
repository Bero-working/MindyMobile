import { io, type Socket } from 'socket.io-client';
import { z } from 'zod';
import { env } from '@/config/env';
import { ApiError } from '@/shared/utilities/apiError';
import { chatService } from './service';
import { messageEvent, sendResult, type ChatMessage } from './schema';

const reply = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), data: z.object({}).passthrough() }),
  z.object({
    ok: z.literal(false),
    error: z.object({ statusCode: z.number(), code: z.string() }),
  }),
]);
type Events = {
  status: (online: boolean) => void;
  message: (value: ChatMessage) => void;
  changed: () => void;
  revoked: (id: string) => void;
  ready: () => void;
  typing: (value: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
    expiresInMs: number;
  }) => void;
};
export function chatSocket() {
  return io(`${new URL(env.API_URL).origin}/chat`, {
    path: '/socket.io',
    addTrailingSlash: false,
    transports: ['websocket'],
    withCredentials: false,
    autoConnect: false,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    extraHeaders: { Origin: env.APP_ORIGIN },
    auth: (done) => {
      chatService.ticket().then(
        (ticket) => done({ ticket }),
        () => done({})
      );
    },
  });
}

export class ChatConnection {
  private rooms = new Set<string>();
  private joined = new Set<string>();
  private closed = false;
  private generation = 0;
  private reconnects = 0;
  private lastTyping = 0;
  constructor(
    private socket: Socket,
    private events: Events
  ) {}
  async request(name: string, payload: object) {
    const parsed = reply.parse(
      await this.socket.timeout(8000).emitWithAck(name, payload)
    );
    if (!parsed.ok)
      throw new ApiError({ ...parsed.error, message: parsed.error.code });
    return parsed.data;
  }
  start() {
    this.socket.on('connect', () => {
      this.reconnects = 0;
      this.joined.clear();
      const generation = ++this.generation;
      this.joinRooms().then(() => {
        if (
          !this.closed &&
          this.socket.connected &&
          generation === this.generation
        ) {
          this.events.status(true);
          this.events.ready();
        }
      });
    });
    this.socket.on('disconnect', (reason: string) => {
      this.generation++;
      this.joined.clear();
      this.events.status(false);
      if (
        !this.closed &&
        reason === 'io server disconnect' &&
        this.reconnects++ < 3
      )
        this.socket.connect();
    });
    this.socket.on('connect_error', () => this.events.status(false));
    for (const name of [
      'message:created',
      'message:updated',
      'message:deleted',
    ])
      this.socket.on(name, (raw: object) => {
        if (this.closed) return;
        const parsed = messageEvent.safeParse(raw);
        if (
          parsed.success &&
          parsed.data.message &&
          this.rooms.has(parsed.data.message.conversationId)
        )
          this.events.message(parsed.data.message);
        this.events.changed();
      });
    this.socket.on('typing:changed', (raw: object) => {
      const parsed = z
        .object({
          conversationId: z.string().uuid(),
          userId: z.string().uuid(),
          isTyping: z.boolean(),
          expiresInMs: z.number().min(0).max(5000),
        })
        .safeParse(raw);
      if (
        !this.closed &&
        parsed.success &&
        this.rooms.has(parsed.data.conversationId)
      )
        this.events.typing(parsed.data);
    });
    for (const name of ['conversation:access-changed'])
      this.socket.on(name, (raw: object) => {
        const parsed = z
          .object({ conversationId: z.string().uuid() })
          .safeParse(raw);
        if (!this.closed && parsed.success) {
          this.events.revoked(parsed.data.conversationId);
          this.events.changed();
        }
      });
    this.socket.on('conversation:membership-changed', () => {
      if (!this.closed) this.events.changed();
    });
    for (const name of [
      'notification:created',
      'notifications:read',
      'conversation:read',
    ])
      this.socket.on(name, () => {
        if (!this.closed) this.events.changed();
      });
    this.socket.connect();
  }
  setRooms(ids: string[]) {
    const next = new Set(ids.slice(0, 20));
    for (const id of this.joined)
      if (!next.has(id)) {
        this.joined.delete(id);
        if (this.socket.connected)
          this.socket.emit(
            'conversation:leave',
            { conversationId: id },
            () => {}
          );
      }
    this.rooms = next;
    if (this.socket.connected) this.joinRooms().catch(() => {});
  }
  private async joinRooms() {
    await Promise.all(
      [...this.rooms]
        .filter((id) => !this.joined.has(id))
        .map(async (id) => {
          const generation = this.generation;
          try {
            await this.request('conversation:join', { conversationId: id });
            if (
              !this.closed &&
              generation === this.generation &&
              this.rooms.has(id)
            )
              this.joined.add(id);
          } catch (error) {
            if (
              !this.closed &&
              generation === this.generation &&
              error instanceof ApiError &&
              [401, 403, 404].includes(error.status)
            )
              this.events.revoked(id);
          }
        })
    );
  }
  async send(id: string, clientMessageId: string, body: string) {
    if (!this.socket.connected)
      return chatService.send(id, clientMessageId, body);
    if (!this.joined.has(id)) await this.joinRooms();
    if (!this.joined.has(id)) throw new Error('Chat is not ready');
    const result = sendResult.parse(
      await this.request('message:send', {
        conversationId: id,
        clientMessageId,
        type: 'TEXT',
        body,
      })
    );
    if (
      result.message.conversationId !== id ||
      result.message.clientMessageId !== clientMessageId
    )
      throw new Error('Message mismatch');
    return result.message;
  }
  typing(id: string, active: boolean) {
    if (
      !this.socket.connected ||
      !this.joined.has(id) ||
      (active && Date.now() - this.lastTyping < 1500)
    )
      return;
    this.lastTyping = Date.now();
    this.socket.emit(
      active ? 'typing:start' : 'typing:stop',
      { conversationId: id },
      () => {}
    );
  }
  close() {
    this.closed = true;
    this.generation++;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.joined.clear();
  }
}
