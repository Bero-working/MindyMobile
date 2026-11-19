import '../../../tests/mocks/nativeUi';
import { AppState } from 'react-native';
import { act, waitFor } from '@testing-library/react-native';
import { renderHookWithProviders } from '../../../tests/utils/renderWithProviders';
import { student } from '../../../tests/fixtures/commerce';
import {
  chatId,
  chatMessage,
  chatConversation,
  chatPage,
} from '../../../tests/fixtures/chat';
import { useStore } from '@/state/store';
import { useChat } from './useChat';
import { chatService } from './service';
import type { ChatConnection } from './connection';
type Events = ConstructorParameters<typeof ChatConnection>[1];
let mockEvents: Events;
const mockSend = jest.fn();
const mockClose = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: () => true,
}));
jest.mock('./connection', () => ({
  chatSocket: jest.fn(),
  ChatConnection: class {
    constructor(_socket: object, mockHandlers: Events) {
      mockEvents = mockHandlers;
    }
    start() {
      mockEvents.status(true);
      mockEvents.ready();
    }
    setRooms() {}
    send(...args: [string, string, string]) {
      return mockSend(...args);
    }
    typing() {}
    close() {
      mockClose();
    }
  },
}));
beforeEach(() => {
  AppState.currentState = 'active';
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 1,
  });
  jest.spyOn(chatService, 'conversation').mockResolvedValue(chatConversation);
  jest.spyOn(chatService, 'history').mockResolvedValue(chatPage([chatMessage]));
  jest
    .spyOn(chatService, 'catchUp')
    .mockResolvedValue({ messages: [], through: '1' });
  jest.spyOn(chatService, 'markRead').mockResolvedValue(undefined);
  mockSend.mockReset();
  mockClose.mockClear();
});
afterEach(() => jest.restoreAllMocks());
it('merges incoming realtime edits and clears content on revoked access', async () => {
  const hook = renderHookWithProviders(() => useChat(chatId));
  await waitFor(() => expect(hook.result.current.messages).toHaveLength(1));
  act(() => mockEvents.message({ ...chatMessage, body: 'Đã sửa', version: 2 }));
  expect(hook.result.current.messages[0]?.body).toBe('Đã sửa');
  act(() => mockEvents.revoked(chatId));
  expect(hook.result.current.denied).toBe(true);
  expect(hook.result.current.messages).toEqual([]);
  expect(mockClose).toHaveBeenCalled();
});
it('keeps a failed message for explicit retry with the same ID, then removes it after confirmation', async () => {
  const hook = renderHookWithProviders(() => useChat(chatId));
  await waitFor(() => expect(hook.result.current.history.isSuccess).toBe(true));
  mockSend.mockRejectedValueOnce(new Error('timeout'));
  act(() => hook.result.current.send('Chào thầy'));
  await waitFor(() =>
    expect(hook.result.current.pending[0]?.failed).toBe(true)
  );
  const pending = hook.result.current.pending[0];
  if (!pending) throw new Error('No pending message');
  mockSend.mockResolvedValueOnce({
    ...chatMessage,
    id: pending.clientMessageId,
    clientMessageId: pending.clientMessageId,
    sequence: '2',
    lastChangedSequence: '2',
    body: pending.body,
    sender: { id: student.id, displayName: student.displayName },
  });
  act(() => hook.result.current.retry(pending));
  await waitFor(() => expect(hook.result.current.pending).toEqual([]));
  expect(mockSend.mock.calls[0]?.[1]).toBe(mockSend.mock.calls[1]?.[1]);
});
it('does not queue a send in read-only mode and clears messages on logout', async () => {
  jest.spyOn(chatService, 'conversation').mockResolvedValue({
    ...chatConversation,
    capabilities: { canRead: true, canSend: false },
    accessMode: 'HISTORY_READ_ONLY',
  });
  const hook = renderHookWithProviders(() => useChat(chatId));
  await waitFor(() => expect(hook.result.current.messages).toHaveLength(1));
  act(() => hook.result.current.send('Test'));
  expect(mockSend).not.toHaveBeenCalled();
  expect(hook.result.current.pending).toEqual([]);
  act(() => useStore.setState({ sessionUser: null, generation: 2 }));
  expect(hook.result.current.messages).toEqual([]);
  expect(mockClose).toHaveBeenCalled();
});
