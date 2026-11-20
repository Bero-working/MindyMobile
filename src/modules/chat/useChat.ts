import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { v4 } from 'uuid';
import { useStudentScope, scopeKey } from '@/shared/hooks/useStudentScope';
import { ApiError } from '@/shared/utilities/apiError';
import { env } from '@/config/env';
import { privateQueryOptions } from '../my-classes/hooks/useLearningQuery';
import { chatService as api } from './service';
import { ChatConnection, chatSocket } from './connection';
import { maxSequence, upsertMessages, messageProblem } from './model';
import type { ChatMessage } from './schema';

export type PendingMessage = {
  clientMessageId: string;
  body: string;
  failed: boolean;
};
export function useChat(conversationId?: string) {
  const scope = useStudentScope(),
    focused = useIsFocused(),
    client = useQueryClient();
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active'
  );
  const enabled = scope.enabled && focused && foreground;
  const [online, setOnline] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [denied, setDenied] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const socket = useRef<ChatConnection | null>(null);
  const checkpoint = useRef<string | null>(null);
  const generation = useRef(0),
    syncing = useRef(false),
    needsSync = useRef(false);
  const incoming = useRef<ChatMessage[]>([]);
  const stopTyping = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const typingExpiry = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const rootKey = ['chat', ...scopeKey(scope)];
  const list = useInfiniteQuery({
    queryKey: [...rootKey, 'conversations'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => api.conversations(pageParam, signal),
    getNextPageParam: (last) =>
      last.meta.hasMore ? (last.meta.nextCursor ?? undefined) : undefined,
    enabled: enabled && !conversationId,
    ...privateQueryOptions,
    refetchInterval: enabled && !conversationId ? 15000 : false,
  });
  const header = useQuery({
    queryKey: [...rootKey, 'room', conversationId],
    queryFn: ({ signal }) => api.conversation(conversationId ?? '', signal),
    enabled: enabled && !!conversationId && !denied,
    ...privateQueryOptions,
  });
  const history = useInfiniteQuery({
    queryKey: [...rootKey, 'history', conversationId],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api.history(conversationId ?? '', pageParam, signal),
    getNextPageParam: (last) =>
      last.meta.hasMore ? (last.meta.nextCursor ?? undefined) : undefined,
    enabled: enabled && !!conversationId && header.isSuccess && !denied,
    ...privateQueryOptions,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const rows = list.data?.pages.flatMap((page) => page.data) ?? [];
  const rooms = conversationId
    ? [conversationId]
    : rows.map((item) => item.id).slice(0, 20);
  const roomSignature = rooms.join(',');
  const merge = useCallback((items: ChatMessage[]) => {
    setMessages((current) => upsertMessages(current, items));
    const confirmed = new Set(items.map((item) => item.clientMessageId));
    setPending((current) =>
      current.filter((item) => !confirmed.has(item.clientMessageId))
    );
  }, []);
  const sync = useRef<() => void>(() => {});
  sync.current = () => {
    if (!conversationId || checkpoint.current === null || !enabled || denied)
      return;
    if (syncing.current) {
      needsSync.current = true;
      return;
    }
    syncing.current = true;
    const activeGeneration = generation.current;
    api
      .catchUp(conversationId, checkpoint.current)
      .then((result) => {
        if (activeGeneration !== generation.current) return;
        merge(result.messages);
        checkpoint.current = maxSequence(
          checkpoint.current ?? '0',
          result.through
        );
        setSyncError(false);
      })
      .catch((error: Error) => {
        if (activeGeneration !== generation.current) return;
        if (
          error instanceof ApiError &&
          [401, 403, 404].includes(error.status)
        ) {
          setDenied(true);
          setMessages([]);
          setPending([]);
        } else if (error instanceof ApiError && error.status === 410) {
          checkpoint.current = null;
          incoming.current = [];
          setMessages([]);
          history.refetch().catch(() => {});
        } else setSyncError(true);
      })
      .finally(() => {
        if (activeGeneration !== generation.current) return;
        syncing.current = false;
        if (needsSync.current) {
          needsSync.current = false;
          sync.current();
        }
      });
  };
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) =>
      setForeground(state === 'active')
    );
    return () => sub.remove();
  }, []);
  useEffect(
    () => () => {
      generation.current++;
    },
    []
  );
  useEffect(() => {
    generation.current++;
    syncing.current = false;
    needsSync.current = false;
    checkpoint.current = null;
    incoming.current = [];
    setMessages([]);
    setPending([]);
    setDenied(false);
    setSyncError(false);
  }, [conversationId, scope.userId, scope.generation]);
  useEffect(() => {
    if (!enabled || denied || !history.data) return;
    const first = history.data.pages[0];
    merge(history.data.pages.flatMap((page) => page.data));
    if (
      checkpoint.current === null &&
      first?.meta.highWatermark !== undefined
    ) {
      checkpoint.current = first.meta.highWatermark;
      merge(incoming.current);
      incoming.current = [];
      sync.current();
    }
  }, [history.data, enabled, denied]);
  useEffect(() => {
    if (!enabled || denied || !env.APP_ORIGIN) return;
    let active = true;
    const next = new ChatConnection(chatSocket(), {
      status: (value) => {
        if (active) setOnline(value);
      },
      message: (item) => {
        if (!active) return;
        if (item.conversationId === conversationId) {
          if (checkpoint.current === null) incoming.current.push(item);
          merge([item]);
        }
      },
      changed: () => {
        if (active) {
          if (conversationId) {
            client
              .invalidateQueries({
                queryKey: [...rootKey, 'room', conversationId],
              })
              .catch(() => {});
          } else
            client
              .invalidateQueries({ queryKey: [...rootKey, 'conversations'] })
              .catch(() => {});
        }
      },
      revoked: (id) => {
        if (!active) return;
        if (id === conversationId) {
          setDenied(true);
          setMessages([]);
          setPending([]);
          client.removeQueries({ queryKey: [...rootKey, 'history', id] });
        } else
          client
            .invalidateQueries({ queryKey: [...rootKey, 'conversations'] })
            .catch(() => {});
      },
      ready: () => {
        if (active) {
          sync.current();
          if (!conversationId) list.refetch().catch(() => {});
        }
      },
      typing: (value) => {
        if (
          !active ||
          value.conversationId !== conversationId ||
          value.userId === scope.userId
        )
          return;
        clearTimeout(typingExpiry.current);
        setTyping(value.isTyping);
        if (value.isTyping)
          typingExpiry.current = setTimeout(
            () => setTyping(false),
            value.expiresInMs
          );
      },
    });
    socket.current = next;
    next.setRooms(rooms);
    next.start();
    return () => {
      active = false;
      next.close();
      socket.current = null;
      setOnline(false);
      setTyping(false);
      clearTimeout(stopTyping.current);
      clearTimeout(typingExpiry.current);
    };
  }, [enabled, denied, conversationId, scope.userId, scope.generation]);
  useEffect(() => {
    socket.current?.setRooms(rooms);
  }, [roomSignature]);
  useEffect(() => {
    if (!enabled || !conversationId || denied) return;
    const timer = setInterval(() => sync.current(), 15000);
    return () => clearInterval(timer);
  }, [enabled, conversationId, denied]);
  useEffect(() => {
    const errors = [header.error, history.error];
    if (
      errors.some(
        (e) => e instanceof ApiError && [401, 403, 404].includes(e.status)
      )
    ) {
      setDenied(true);
      setMessages([]);
      setPending([]);
    }
  }, [header.error, history.error]);
  const newest = messages[messages.length - 1]?.sequence;
  useEffect(() => {
    if (!enabled || !conversationId || !newest || denied || !header.data)
      return;
    const timer = setTimeout(
      () =>
        api
          .markRead(conversationId, newest)
          .then(() =>
            client.invalidateQueries({
              queryKey: [...rootKey, 'conversations'],
            })
          )
          .catch(() => {}),
      500
    );
    return () => clearTimeout(timer);
  }, [enabled, conversationId, newest, denied]);
  const send = async (item: PendingMessage) => {
    if (
      !enabled ||
      denied ||
      !conversationId ||
      !header.data?.capabilities.canSend
    )
      return;
    const token = generation.current;
    setPending((current) =>
      current.map((row) =>
        row.clientMessageId === item.clientMessageId
          ? { ...row, failed: false }
          : row
      )
    );
    try {
      const result = await (socket.current
        ? socket.current.send(conversationId, item.clientMessageId, item.body)
        : api.send(conversationId, item.clientMessageId, item.body));
      if (generation.current === token) {
        merge([result]);
        client
          .invalidateQueries({ queryKey: [...rootKey, 'conversations'] })
          .catch(() => {});
      }
    } catch {
      if (generation.current === token)
        setPending((current) =>
          current.map((row) =>
            row.clientMessageId === item.clientMessageId
              ? { ...row, failed: true }
              : row
          )
        );
    }
  };
  return {
    list,
    header,
    history,
    online,
    typing,
    denied: denied || !scope.enabled,
    enabled,
    messages: scope.enabled ? messages : [],
    pending: scope.enabled ? pending : [],
    syncError,
    acceptSentAttachment: (item: ChatMessage) => {
      if (item.conversationId !== conversationId) return;
      merge([item]);
      client
        .invalidateQueries({ queryKey: [...rootKey, 'conversations'] })
        .catch(() => {});
    },
    send: (body: string) => {
      if (
        !enabled ||
        denied ||
        !header.data?.capabilities.canSend ||
        messageProblem(body)
      )
        return;
      const item = { clientMessageId: v4(), body, failed: false };
      setPending((current) => [...current, item]);
      send(item).catch(() => {});
      if (conversationId) socket.current?.typing(conversationId, false);
    },
    retry: (item: PendingMessage) => {
      send(item).catch(() => {});
    },
    draftChanged: () => {
      if (!conversationId) return;
      socket.current?.typing(conversationId, true);
      clearTimeout(stopTyping.current);
      stopTyping.current = setTimeout(
        () => socket.current?.typing(conversationId, false),
        2200
      );
    },
    reconnect: () => {
      if (conversationId) {
        header.refetch().catch(() => {});
        history.refetch().catch(() => {});
        sync.current();
      } else list.refetch().catch(() => {});
    },
  };
}
