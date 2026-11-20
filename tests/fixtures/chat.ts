import type { ChatMessage, Conversation } from '@/modules/chat/schema';
export const chatId = '11111111-1111-4111-8111-111111111111';
export const mentorId = '22222222-2222-4222-8222-222222222222';
export const clientMessageId = '33333333-3333-4333-8333-333333333333';
export const chatMessage: ChatMessage = {
  id: '44444444-4444-4444-8444-444444444444',
  conversationId: chatId,
  sender: { id: mentorId, displayName: 'Mentor An' },
  clientMessageId,
  sequence: '1',
  lastChangedSequence: '1',
  version: 1,
  type: 'TEXT',
  body: 'Chào em, mình bắt đầu bài học nhé!',
  file: null,
  replyTo: null,
  createdAt: '2026-11-06T03:00:00Z',
  editedAt: null,
  deletedAt: null,
};
export const chatConversation: Conversation = {
  id: chatId,
  type: 'DIRECT',
  classId: null,
  name: null,
  peer: { id: mentorId, displayName: 'Mentor An' },
  capabilities: { canRead: true, canSend: true },
  accessMode: 'ACTIVE',
  lastReadSequence: '0',
  highWatermark: '1',
  unreadCount: 1,
  lastMessage: chatMessage,
  activityAt: chatMessage.createdAt,
};
export const chatPage = <T>(data: T[]) => ({
  data,
  meta: { hasMore: false, nextCursor: null, highWatermark: '1' },
});
