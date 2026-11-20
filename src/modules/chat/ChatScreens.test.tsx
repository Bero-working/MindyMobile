import '../../../tests/mocks/nativeUi';
import '@/config/i18n.config';
import { AppState } from 'react-native';
import { pick } from '@react-native-documents/picker';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import { useStore } from '@/state/store';
import { student } from '../../../tests/fixtures/commerce';
import {
  chatConversation,
  chatId,
  chatMessage,
  chatPage,
} from '../../../tests/fixtures/chat';
import { MessagesScreen, ConversationScreen } from './ChatScreens';
import { chatService } from './service';
const mockSend = jest.fn();
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  keepLocalCopy: jest.fn(),
  types: { images: 'image/*', pdf: 'application/pdf' },
  isErrorWithCode: () => true,
  errorCodes: { OPERATION_CANCELED: 'cancelled' },
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: () => true,
}));
jest.mock('./connection', () => ({
  chatSocket: jest.fn(),
  ChatConnection: class {
    start() {}
    setRooms() {}
    send(...args: [string, string, string]) {
      return mockSend(...args);
    }
    typing() {}
    close() {}
  },
}));
beforeEach(() => {
  jest.mocked(pick).mockRejectedValue({ code: 'cancelled' });
  AppState.currentState = 'active';
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 1,
  });
  jest
    .spyOn(chatService, 'conversations')
    .mockResolvedValue(chatPage([chatConversation]));
  jest.spyOn(chatService, 'conversation').mockResolvedValue(chatConversation);
  jest.spyOn(chatService, 'history').mockResolvedValue(chatPage([chatMessage]));
  jest
    .spyOn(chatService, 'catchUp')
    .mockResolvedValue({ messages: [], through: '1' });
  jest.spyOn(chatService, 'markRead').mockResolvedValue(undefined);
  mockSend.mockReset();
  mockSend.mockImplementation(
    async (_id: string, clientMessageId: string, body: string) => ({
      ...chatMessage,
      clientMessageId,
      body,
      sequence: '2',
      sender: { id: student.id, displayName: student.displayName },
    })
  );
});
afterEach(() => jest.restoreAllMocks());
it('automatically loads image attachments as thumbnails and retries an expired image URL', async () => {
  const image = {
    ...chatMessage,
    type: 'FILE' as const,
    body: null,
    file: {
      id: chatMessage.id,
      originalFilename: 'bang-ve.png',
      mimeType: 'image/png',
      sizeBytes: 1200,
      kind: 'IMAGE' as const,
    },
  };
  jest.spyOn(chatService, 'history').mockResolvedValue(chatPage([image]));
  const access = jest
    .spyOn(chatService, 'fileUrl')
    .mockResolvedValue('https://files.mindy.test/thumbnail.png');
  renderWithProviders(
    <ConversationScreen
      conversationId={chatId}
      fallbackTitle="Mentor"
      onBack={jest.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getByTestId(`chat-image-${image.id}`).props.source.uri).toBe(
      'https://files.mindy.test/thumbnail.png'
    )
  );
  expect(access).toHaveBeenCalledWith(chatId, image.id);
  expect(screen.queryByText('bang-ve.png')).toBeNull();
  fireEvent(screen.getByTestId(`chat-image-${image.id}`), 'error', {
    nativeEvent: { error: 'expired' },
  });
  fireEvent.press(screen.getByRole('button', { name: 'Mở tệp đính kèm' }));
  await waitFor(() =>
    expect(screen.getByTestId(`chat-image-${image.id}`)).toBeTruthy()
  );
  expect(access).toHaveBeenCalledTimes(2);
});
it('keeps non-image attachments as files without loading a thumbnail', async () => {
  const pdf = {
    ...chatMessage,
    type: 'FILE' as const,
    body: null,
    file: {
      id: chatMessage.id,
      originalFilename: 'bai-tap.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1200,
      kind: 'PDF' as const,
    },
  };
  jest.spyOn(chatService, 'history').mockResolvedValue(chatPage([pdf]));
  const access = jest.spyOn(chatService, 'fileUrl');
  renderWithProviders(
    <ConversationScreen
      conversationId={chatId}
      fallbackTitle="Mentor"
      onBack={jest.fn()}
    />
  );
  await waitFor(() => expect(screen.getByText('bai-tap.pdf')).toBeTruthy());
  expect(access).not.toHaveBeenCalled();
});
it('shows Messages as the selected tab and opens a mentor conversation', async () => {
  const onOpen = jest.fn(),
    onTab = jest.fn();
  renderWithProviders(
    <MessagesScreen
      onBack={jest.fn()}
      onTab={onTab}
      onOpen={onOpen}
    />
  );
  expect(
    screen.getByTestId('messages-tab-messages').props.accessibilityLabel
  ).toBe('Tin nhắn');
  expect(
    screen.getByTestId('messages-tab-messages').props.accessibilityState
      .selected
  ).toBe(true);
  await waitFor(() =>
    expect(screen.getByTestId(`messages-row-${chatId}`)).toBeTruthy()
  );
  fireEvent.press(screen.getByTestId(`messages-row-${chatId}`));
  expect(onOpen).toHaveBeenCalledWith(chatConversation);
});
it('renders incoming bubbles and only offers a composer when sending is allowed', async () => {
  const view = renderWithProviders(
    <ConversationScreen
      conversationId={chatId}
      fallbackTitle="Mentor"
      onBack={jest.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getByText(chatMessage.body ?? '')).toBeTruthy()
  );
  fireEvent.changeText(screen.getByTestId('chat-input'), 'Chào thầy');
  fireEvent.press(screen.getByTestId('chat-send'));
  await waitFor(() =>
    expect(mockSend).toHaveBeenCalledWith(
      chatId,
      expect.any(String),
      'Chào thầy'
    )
  );
  view.unmount();
  jest.spyOn(chatService, 'conversation').mockResolvedValue({
    ...chatConversation,
    capabilities: { canRead: true, canSend: false },
  });
  renderWithProviders(
    <ConversationScreen
      conversationId={chatId}
      fallbackTitle="Mentor"
      onBack={jest.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getByText(chatMessage.body ?? '')).toBeTruthy()
  );
  expect(screen.queryByTestId('chat-input')).toBeNull();
});
it('toggles the attachment menu with only the allowed file kinds', async () => {
  renderWithProviders(
    <ConversationScreen
      conversationId={chatId}
      fallbackTitle="Mentor"
      onBack={jest.fn()}
    />
  );
  await waitFor(() => expect(screen.getByTestId('chat-attach')).toBeTruthy());
  expect(screen.queryByTestId('chat-attach-menu')).toBeNull();
  fireEvent.press(screen.getByTestId('chat-attach'));
  expect(screen.getByTestId('chat-attach-image')).toBeTruthy();
  expect(screen.getByTestId('chat-attach-pdf')).toBeTruthy();
  expect(
    screen.getByTestId('chat-attach').props.accessibilityState.expanded
  ).toBe(true);
  fireEvent.press(screen.getByTestId('chat-attach-pdf'));
  expect(screen.queryByTestId('chat-attach-menu')).toBeNull();
  await waitFor(() =>
    expect(pick).toHaveBeenCalledWith({
      type: ['application/pdf'],
      allowMultiSelection: false,
    })
  );
  await waitFor(() =>
    expect(
      screen.getByTestId('chat-attach').props.accessibilityState.disabled
    ).toBe(false)
  );
  expect(screen.queryByTestId('chat-attachment-preview')).toBeNull();
  fireEvent.press(screen.getByTestId('chat-attach'));
  fireEvent.press(screen.getByTestId('chat-attach'));
  expect(screen.queryByTestId('chat-attach-menu')).toBeNull();
});
