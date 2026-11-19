import * as Y from 'yjs';
import { z } from 'zod';
import { io, type Socket } from 'socket.io-client';
import { v4 as newIntentKey } from 'uuid';
import { whiteboardService } from './service';
import {
  cursorSchema,
  presenterSchema,
  type Cursor,
  type Presenter,
} from './viewport';
import { encode, decode, shapesOf } from './document';
import { syncSchema, type BoardSync, type Shape } from './schema';

export type ConnectionState = {
  status: 'connecting' | 'ready' | 'saving' | 'offline' | 'revoked';
  sync?: BoardSync | undefined;
  shapes: Shape[];
  people: { id: string; name: string }[];
  /** Other people's live pen/pointer positions (board:awareness), name from BE. */
  cursors: Cursor[];
  /** Mentor actively sharing (cleared after 6 s silence or offline). */
  presenter?: Presenter | undefined;
  /** Last mentor camera; kept while silent/offline, cleared on epoch change/revoke. */
  presenterView?: Presenter | undefined;
  notice?: 'epoch' | 'rejected' | 'connection' | undefined;
};
/** BE heartbeat is 2 s; a presenter silent for 6 s is no longer live. */
export const PRESENTER_EXPIRY_MS = 6000;
/** Hide a collaborator's name label once they stop moving. */
export const CURSOR_EXPIRY_MS = 4000;
/** Same client throttle as the web board for board:awareness. */
export const AWARENESS_THROTTLE_MS = 120;
type Pending = { epoch: string; updateId: string; binary: string };
type Reply = {
  ok: boolean;
  data?: object;
  error?: { statusCode: number; code: string };
};
export const boardSocket = (url: string, origin: string) =>
  io(new URL(url).origin, {
    path: '/ws/whiteboards',
    addTrailingSlash: false,
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: false,
    extraHeaders: { Origin: origin },
    auth: (done) => {
      whiteboardService.ticket().then(
        (ticket) => done({ ticket }),
        () => done({})
      );
    },
  });

/** One in-flight edit. Only a durable update ACK unlocks the next edit. */
export class BoardConnection {
  private doc = new Y.Doc();
  private pending: Pending | undefined;
  private closed = false;
  private renewing = false;
  private generation = 0;
  private early: Presenter | undefined;
  private expiry: ReturnType<typeof setTimeout> | undefined;
  private cursorTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private lastAwareness = -Infinity;
  state: ConnectionState = {
    status: 'connecting',
    shapes: [],
    people: [],
    cursors: [],
  };
  get hasPending() {
    return !!this.pending;
  }
  constructor(
    private socket: Socket,
    private boardId: string,
    private changed: (state: ConnectionState) => void,
    private renew: () => Promise<boolean>
  ) {}
  private publish(patch: Partial<ConnectionState>) {
    if (this.closed) return;
    this.state = { ...this.state, ...patch };
    this.changed(this.state);
  }
  start() {
    this.socket.on('connect', () => this.join());
    this.socket.on('board:state', (raw: BoardSync) => this.accept(raw));
    this.socket.on(
      'board:presence',
      (raw: { people: { id: string; name: string }[] }) => {
        const value = z
          .object({
            people: z.array(z.object({ id: z.string(), name: z.string() })),
          })
          .safeParse(raw);
        if (value.success) this.publish({ people: value.data.people });
      }
    );
    this.socket.on('board:revoked', () => this.revoke());
    this.socket.on('board:viewport', (raw: object) => {
      const parsed = presenterSchema.safeParse(raw);
      if (!parsed.success) return;
      // BE may fan out right after board:join, before its ACK is processed.
      if (this.state.status === 'connecting') this.early = parsed.data;
      else this.present(parsed.data);
    });
    this.socket.on('board:awareness', (raw: object) => {
      const parsed = cursorSchema.safeParse(raw);
      if (parsed.success && this.state.sync) this.track(parsed.data);
    });
    this.socket.on('disconnect', (reason: string) => {
      this.generation++;
      this.early = undefined;
      this.stopExpiry();
      this.clearCursors();
      if (this.state.status === 'revoked' || this.closed) return;
      this.publish({
        status: 'offline',
        people: [],
        presenter: undefined,
        cursors: [],
      });
      if (reason === 'io server disconnect') this.recoverAuth();
    });
    this.socket.on('connect_error', () => {
      this.publish({ status: 'offline', notice: 'connection' });
      this.recoverAuth();
    });
    this.socket.connect();
  }
  private present(presenter: Presenter) {
    if (presenter.epoch !== this.state.sync?.board.epoch) return;
    this.stopExpiry();
    this.expiry = setTimeout(() => {
      this.expiry = undefined;
      this.publish({ presenter: undefined });
    }, PRESENTER_EXPIRY_MS);
    this.publish({ presenter, presenterView: presenter });
  }
  private track(cursor: Cursor) {
    const id = cursor.connectionId;
    const timer = this.cursorTimers.get(id);
    if (timer) clearTimeout(timer);
    this.cursorTimers.set(
      id,
      setTimeout(() => {
        this.cursorTimers.delete(id);
        this.publish({
          cursors: this.state.cursors.filter((c) => c.connectionId !== id),
        });
      }, CURSOR_EXPIRY_MS)
    );
    const cursors = [...this.state.cursors];
    const index = cursors.findIndex((c) => c.connectionId === id);
    if (index >= 0) cursors[index] = cursor;
    else cursors.push(cursor);
    this.publish({ cursors });
  }
  private clearCursors() {
    for (const timer of this.cursorTimers.values()) clearTimeout(timer);
    this.cursorTimers.clear();
  }
  /** Share where this user is drawing; BE attaches the verified name. */
  awareness(x: number, y: number) {
    const now = Date.now();
    if (
      this.closed ||
      !this.socket.connected ||
      (this.state.status !== 'ready' && this.state.status !== 'saving') ||
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      now - this.lastAwareness < AWARENESS_THROTTLE_MS
    )
      return;
    this.lastAwareness = now;
    const point = {
      x: Math.max(-100000, Math.min(100000, x)),
      y: Math.max(-100000, Math.min(100000, y)),
    };
    // Ephemeral: failures are ignored, the next movement sends a fresh point.
    this.socket.timeout(5000).emit('board:awareness', point, () => {});
  }
  private stopExpiry() {
    if (this.expiry) clearTimeout(this.expiry);
    this.expiry = undefined;
  }
  private async recoverAuth() {
    if (this.renewing || this.closed) return;
    this.renewing = true;
    try {
      if (await this.renew()) {
        if (!this.closed) this.socket.connect();
      }
    } catch {
      /* Retry stays explicit after a failed HTTP refresh. */
    }
  }
  reconnect() {
    if (this.closed || this.state.status === 'revoked') return;
    this.renewing = false;
    if (this.socket.connected) this.join();
    else this.socket.connect();
  }
  pause() {
    this.generation++;
    this.stopExpiry();
    this.clearCursors();
    this.publish({
      status: 'offline',
      people: [],
      presenter: undefined,
      cursors: [],
    });
    this.socket.disconnect();
  }
  private join() {
    const generation = ++this.generation;
    this.publish({ status: 'connecting' });
    this.socket
      .timeout(10000)
      .emit(
        'board:join',
        { boardId: this.boardId },
        (error: Error | null, reply: Reply) => {
          if (this.closed || generation !== this.generation) return;
          if (error || !reply?.ok) {
            if (
              reply?.error?.statusCode === 401 ||
              reply?.error?.statusCode === 403
            )
              this.revoke();
            else this.publish({ status: 'offline', notice: 'connection' });
            return;
          }
          if (!this.accept(reply.data, true)) {
            this.socket.disconnect();
            return;
          }
          if (this.pending) this.send();
        }
      );
  }
  private accept(raw: object | undefined, rejoin = false): boolean {
    if (this.closed || this.state.status === 'revoked') return false;
    const parsed = syncSchema.safeParse(raw);
    if (!parsed.success || parsed.data.board.id !== this.boardId) {
      this.publish({ status: 'offline', notice: 'connection' });
      return false;
    }
    const sync = parsed.data;
    const epochChanged =
      !!this.state.sync && this.state.sync.board.epoch !== sync.board.epoch;
    if (epochChanged) {
      this.pending = undefined;
      this.generation++;
    }
    try {
      if (rejoin || epochChanged) {
        this.doc.destroy();
        this.doc = new Y.Doc();
      }
      Y.applyUpdate(this.doc, decode(sync.binary));
      if (rejoin && this.pending) {
        if (
          this.pending.epoch === sync.board.epoch &&
          sync.capabilities.canEdit
        )
          Y.applyUpdate(this.doc, decode(this.pending.binary));
        else this.pending = undefined;
      }
      this.publish({
        sync,
        shapes: shapesOf(this.doc),
        status: this.pending ? 'saving' : 'ready',
        notice: undefined,
        ...(epochChanged
          ? {
              notice: 'epoch' as const,
              presenter: undefined,
              presenterView: undefined,
              cursors: [],
            }
          : {}),
      });
      const early = this.early;
      this.early = undefined;
      if (epochChanged) {
        this.stopExpiry();
        this.clearCursors();
      }
      if (early) this.present(early);
      return true;
    } catch {
      this.publish({ status: 'offline', notice: 'connection' });
      return false;
    }
  }
  edit(change: (doc: Y.Doc) => void): boolean {
    if (
      this.closed ||
      this.state.status !== 'ready' ||
      !this.state.sync?.capabilities.canEdit
    )
      return false;
    const candidate = new Y.Doc();
    try {
      Y.applyUpdate(candidate, Y.encodeStateAsUpdate(this.doc));
      const vector = Y.encodeStateVector(candidate);
      candidate.transact(() => change(candidate));
      const update = Y.encodeStateAsUpdate(candidate, vector);
      if (
        update.byteLength > 262144 ||
        candidate.getMap('shapes').size > 2000
      ) {
        this.publish({ notice: 'rejected' });
        return false;
      }
      this.pending = {
        epoch: this.state.sync.board.epoch,
        updateId: newIntentKey(),
        binary: encode(update),
      };
      Y.applyUpdate(this.doc, update);
      this.publish({ status: 'saving', shapes: shapesOf(this.doc) });
      this.send();
      return true;
    } finally {
      candidate.destroy();
    }
  }
  private send() {
    const pending = this.pending;
    if (!pending || !this.socket.connected) return;
    const generation = this.generation;
    this.socket
      .timeout(10000)
      .emit('board:update', pending, (error: Error | null, reply: Reply) => {
        if (
          this.closed ||
          generation !== this.generation ||
          this.pending !== pending
        )
          return;
        if (error) {
          this.publish({ status: 'offline', notice: 'connection' });
          // Keep this exact update ID for replay after canonical rejoin.
          this.socket.disconnect();
          return;
        }
        if (!reply?.ok) {
          this.pending = undefined;
          if (
            reply?.error?.statusCode === 401 ||
            reply?.error?.statusCode === 403
          )
            this.revoke();
          else {
            this.publish({ notice: 'rejected' });
            this.join();
          }
          return;
        }
        const ack = z
          .object({
            epoch: z.string(),
            updateId: z.string(),
            sequence: z.string(),
          })
          .safeParse(reply.data);
        if (
          !ack.success ||
          ack.data.epoch !== pending.epoch ||
          ack.data.updateId !== pending.updateId
        ) {
          this.publish({ status: 'offline', notice: 'connection' });
          return;
        }
        this.pending = undefined;
        this.publish({ status: 'ready' });
      });
  }
  private revoke() {
    this.pending = undefined;
    this.doc.destroy();
    this.doc = new Y.Doc();
    this.publish({
      status: 'revoked',
      sync: undefined,
      shapes: [],
      people: [],
      presenter: undefined,
      presenterView: undefined,
      cursors: [],
    });
    this.stopExpiry();
    this.clearCursors();
    this.socket.disconnect();
  }
  close() {
    this.closed = true;
    this.generation++;
    this.stopExpiry();
    this.clearCursors();
    this.pending = undefined;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.doc.destroy();
  }
}
