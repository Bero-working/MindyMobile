import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppTabBar } from '@/components/common/AppTabBar';
import { Icon, type IconName } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { ScreenState } from '@/components/common/ScreenState';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { useStudentScope } from '@/shared/hooks/useStudentScope';
import { ApiError } from '@/shared/utilities/apiError';
import type { HomeTab } from '../home/types/home.type';
import { useChat } from './useChat';
import { useChatAttachment } from './useChatAttachment';
import { AttachmentPreview } from './AttachmentPreview';
import { chatService } from './service';
import {
  formatConversationTime,
  formatDividerTime,
  formatMessageTime,
  layoutMessages,
  messageProblem,
} from './model';
import type { ChatMessage, Conversation } from './schema';

/** Loại tệp được phép gửi trong chat (schema `file.kind`: IMAGE | PDF). */
const ATTACHMENT_OPTIONS = [
  {
    kind: 'IMAGE',
    icon: 'image',
    label: 'chat.attach.image',
    hint: 'chat.attach.imageHint',
  },
  {
    kind: 'PDF',
    icon: 'document',
    label: 'chat.attach.pdf',
    hint: 'chat.attach.pdfHint',
  },
] as const satisfies readonly {
  kind: NonNullable<ChatMessage['file']>['kind'];
  icon: IconName;
  label: string;
  hint: string;
}[];

export const conversationTitle = (row: Conversation) =>
  (row.type === 'GROUP' ? row.name : row.peer?.displayName) ||
  row.name ||
  'Mindy';
function Avatar({
  name,
  group = false,
  small = false,
}: {
  name: string;
  group?: boolean;
  small?: boolean;
}) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <View
      className={`${small ? 'h-[30px] w-[30px]' : 'h-[54px] w-[54px]'} shrink-0 items-center justify-center rounded-full ${group ? 'bg-logo-soft' : 'bg-cover-a-soft'}`}
    >
      {group ? (
        <Icon
          name="chat"
          size={small ? 16 : 25}
          color={colors.forest}
        />
      ) : (
        <Text
          className={`${small ? 'text-[11px]' : 'text-[17px]'} font-nunito-extrabold text-forest`}
        >
          {letters || 'M'}
        </Text>
      )}
    </View>
  );
}
function ConnectionLabel({ online }: { online: boolean }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-1">
      <View
        className={`h-[6px] w-[6px] rounded-full ${online ? 'bg-mint' : 'bg-muted'}`}
      />
      <Text
        accessibilityLiveRegion="polite"
        className="font-nunito text-[11px] text-muted"
      >
        {t(online ? 'chat.connected' : 'chat.reconnecting')}
      </Text>
    </View>
  );
}
function PageEnd({
  more,
  busy,
  failed,
  onMore,
}: {
  more: boolean;
  busy: boolean;
  failed: boolean;
  onMore: () => void;
}) {
  const { t } = useTranslation();
  return more ? (
    <View className="p-3">
      <Button
        label={t(failed ? 'common.retry' : 'chat.loadMore')}
        variant="ghost"
        loading={busy}
        onPress={onMore}
      />
    </View>
  ) : null;
}

export function MessagesScreen({
  onBack,
  onTab,
  onOpen,
}: {
  onBack: () => void;
  onTab: (tab: HomeTab) => void;
  onOpen: (row: Conversation) => void;
}) {
  const { t, i18n } = useTranslation();
  const scope = useStudentScope();
  const chat = useChat();
  const { list } = chat;
  const [search, setSearch] = useState('');
  const listDenied =
    list.error instanceof ApiError &&
    [401, 403, 404].includes(list.error.status);
  const all =
    listDenied || !scope.enabled
      ? []
      : [
          ...new Map(
            (list.data?.pages.flatMap((page) => page.data) ?? []).map((row) => [
              row.id,
              row,
            ])
          ).values(),
        ];
  const filtered = all.filter((row) =>
    conversationTitle(row)
      .toLocaleLowerCase(i18n.language)
      .includes(search.toLocaleLowerCase(i18n.language))
  );
  const contacts = all.filter((row) => row.type === 'DIRECT');
  return (
    <SafeAreaView
      testID="messages-screen"
      edges={['top', 'bottom']}
      className="flex-1 bg-canvas"
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.canvas}
      />
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
        <PressableScale
          testID="messages-back"
          accessibilityRole="button"
          accessibilityLabel={t('learning.back')}
          onPress={onBack}
          className="h-[44px] w-[36px] items-center justify-center"
        >
          <Icon
            name="back"
            size={24}
          />
        </PressableScale>
        <View className="flex-1 gap-1">
          <Text
            accessibilityRole="header"
            className="font-nunito-extrabold text-[28px] text-black"
          >
            {t('chat.title')}
          </Text>
          <ConnectionLabel online={chat.online} />
        </View>
      </View>
      <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-2xl bg-soft px-3">
        <Icon
          name="search"
          size={19}
        />
        <TextInput
          testID="messages-search"
          value={search}
          onChangeText={setSearch}
          placeholder={t('chat.searchPlaceholder')}
          accessibilityLabel={t('chat.searchPlaceholder')}
          placeholderTextColor={colors.muted}
          className="min-h-[46px] flex-1 font-nunito text-[15px] text-black"
        />
      </View>
      <FlatList
        testID="messages-list"
        className="flex-1"
        data={filtered}
        keyExtractor={(row) => row.id}
        keyboardShouldPersistTaps="handled"
        refreshing={list.isRefetching && !list.isFetchingNextPage}
        onRefresh={() => {
          list.refetch().catch(() => {});
        }}
        ListHeaderComponent={
          contacts.length > 0 && !search ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-4 px-5 pb-5 pt-2"
            >
              {contacts.map((row) => (
                <PressableScale
                  key={row.id}
                  accessibilityRole="button"
                  accessibilityLabel={t('chat.messageTo', {
                    name: conversationTitle(row),
                  })}
                  onPress={() => onOpen(row)}
                  className="w-[68px] items-center gap-2"
                >
                  <Avatar name={conversationTitle(row)} />
                  <Text
                    numberOfLines={1}
                    className="font-nunito-bold text-[12px] text-black"
                  >
                    {conversationTitle(row)}
                  </Text>
                </PressableScale>
              ))}
            </ScrollView>
          ) : null
        }
        renderItem={({ item: row }) => {
          const last = row.lastMessage;
          const body = last?.deletedAt
            ? t('chat.deleted')
            : last?.body ||
              (last?.file ? last.file.originalFilename : t('chat.noMessages'));
          const preview = last
            ? `${last.sender.id === scope.userId ? t('chat.you') : row.type === 'GROUP' ? last.sender.displayName : ''}${last.sender.id === scope.userId || row.type === 'GROUP' ? ': ' : ''}${body}`
            : body;
          return (
            <PressableScale
              testID={`messages-row-${row.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${conversationTitle(row)}${row.unreadCount ? `, ${t('chat.unread', { count: row.unreadCount })}` : ''}`}
              onPress={() => onOpen(row)}
              className="flex-row items-center gap-3 px-4 py-3"
            >
              <Avatar
                name={conversationTitle(row)}
                group={row.type === 'GROUP'}
              />
              <View className="flex-1 gap-1.5">
                <View className="flex-row items-center gap-2">
                  <Text
                    numberOfLines={1}
                    className="flex-1 font-nunito-extrabold text-[15px] text-black"
                  >
                    {conversationTitle(row)}
                  </Text>
                  <Text className="font-nunito text-[11px] text-muted">
                    {formatConversationTime(row.activityAt, i18n.language)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text
                    numberOfLines={2}
                    className={`flex-1 text-[13px] leading-[19px] ${row.unreadCount ? 'font-nunito-bold text-forest' : 'font-nunito text-muted'}`}
                  >
                    {preview}
                  </Text>
                  {row.unreadCount > 0 && (
                    <View className="min-h-[21px] min-w-[21px] items-center justify-center rounded-full bg-mint px-1">
                      <Text className="font-nunito-bold text-[10px] text-canvas">
                        {row.unreadCount > 99 ? '99+' : row.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </PressableScale>
          );
        }}
        ListEmptyComponent={
          <View className="p-4">
            {list.isPending && scope.enabled ? (
              <ActivityIndicator
                accessibilityLabel={t('chat.loading')}
                color={colors.forest}
              />
            ) : (
              <ScreenState
                title={t('chat.title')}
                description={t(
                  !scope.enabled
                    ? 'chat.denied'
                    : listDenied
                      ? 'chat.denied'
                      : list.isError
                        ? 'chat.error'
                        : search
                          ? 'chat.noResults'
                          : 'chat.empty'
                )}
                onRetry={list.isError ? chat.reconnect : undefined}
              />
            )}
          </View>
        }
        ListFooterComponent={
          <PageEnd
            more={!!list.hasNextPage}
            busy={list.isFetchingNextPage}
            failed={list.isFetchNextPageError}
            onMore={() => {
              list.fetchNextPage().catch(() => {});
            }}
          />
        }
      />
      <AppTabBar
        prefix="messages"
        selected="messages"
        learningEnabled
        onTab={onTab}
        onTop={() => onTab('home')}
      />
    </SafeAreaView>
  );
}

function Attachment({ item, mine }: { item: ChatMessage; mine: boolean }) {
  const { t } = useTranslation();
  const [url, setUrl] = useState<string>();
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const isImage =
    item.type === 'IMAGE' ||
    item.file?.kind === 'IMAGE' ||
    !!item.file?.mimeType.startsWith('image/');
  useEffect(() => {
    if (!isImage) return;
    let active = true;
    setUrl(undefined);
    setFailed(false);
    setLoading(true);
    chatService
      .fileUrl(item.conversationId, item.id)
      .then((value) => {
        if (active) setUrl(value);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [item.conversationId, item.id, item.file?.id, isImage, attempt]);
  return (
    <View className="gap-2">
      {isImage && loading && (
        <View
          testID={`chat-image-loading-${item.id}`}
          className="h-[160px] w-[200px] items-center justify-center rounded-xl bg-soft"
        >
          <ActivityIndicator
            accessibilityLabel={t('chat.loading')}
            color={colors.forest}
          />
        </View>
      )}
      {isImage && url && !failed && (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${t('chat.openFile')}: ${item.file?.originalFilename ?? ''}`}
          onPress={() => {
            chatService
              .fileUrl(item.conversationId, item.id)
              .then((fresh) => Linking.openURL(fresh))
              .catch(() => setFailed(true));
          }}
        >
          <Image
            testID={`chat-image-${item.id}`}
            source={{ uri: url }}
            resizeMode="cover"
            accessibilityLabel={item.file?.originalFilename}
            onError={() => {
              setUrl(undefined);
              setFailed(true);
            }}
            className="h-[160px] w-[200px] rounded-xl bg-soft"
          />
        </PressableScale>
      )}
      {(!isImage || failed) && (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('chat.openFile')}
          onPress={() => {
            if (isImage) {
              setAttempt((value) => value + 1);
              return;
            }
            setFailed(false);
            chatService
              .fileUrl(item.conversationId, item.id)
              .then(async (value) => {
                await Linking.openURL(value);
              })
              .catch(() => setFailed(true));
          }}
          className="flex-row items-center gap-2 py-2"
        >
          <Icon
            name={isImage ? 'image' : 'document'}
            size={19}
            color={mine ? colors.canvas : colors.forest}
          />
          <Text
            className={`shrink font-nunito-bold text-[13px] ${mine ? 'text-canvas' : 'text-forest'}`}
          >
            {item.file?.originalFilename || t('chat.openFile')}
          </Text>
        </PressableScale>
      )}
      {failed && (
        <Text
          accessibilityRole="alert"
          className="font-nunito text-xs text-headsup"
        >
          {t('chat.fileError')}
        </Text>
      )}
    </View>
  );
}

export function ConversationScreen({
  conversationId,
  fallbackTitle,
  onBack,
}: {
  conversationId: string;
  fallbackTitle: string;
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const scope = useStudentScope();
  const room = useChat(conversationId);
  const [draft, setDraft] = useState('');
  const list = useRef<FlatList>(null);
  const opening = useRef<
    { lastRead: string; highWatermark: string } | undefined
  >(undefined);
  if (!opening.current && room.header.data)
    opening.current = {
      lastRead: room.header.data.lastReadSequence,
      highWatermark: room.header.data.highWatermark,
    };
  const title = room.header.data
    ? conversationTitle(room.header.data)
    : fallbackTitle;
  const ready = !!room.header.data && !!room.history.data && !room.denied;
  const canSend =
    ready && room.enabled && !!room.header.data?.capabilities.canSend;
  const rows = layoutMessages(room.messages, scope.userId, opening.current);
  type Row =
    | { id: string; row: (typeof rows)[number] }
    | { id: string; pending: (typeof room.pending)[number] };
  const data: Row[] = [
    ...rows.map((row) => ({ id: row.message.id, row })),
    ...room.pending.map((pending) => ({
      id: pending.clientMessageId,
      pending,
    })),
  ].reverse();
  const [attachOpen, setAttachOpen] = useState(false);
  const attachment = useChatAttachment(conversationId, canSend, (item) => {
    room.acceptSentAttachment(item);
    setDraft('');
    list.current?.scrollToOffset({ offset: 0, animated: true });
  });
  const sendDisabled =
    attachment.busy ||
    attachment.pendingSend ||
    (attachment.file ? !attachment.ready : !!messageProblem(draft));
  const send = () => {
    if (!canSend || sendDisabled) return;
    if (attachment.file) {
      attachment.send(draft);
      return;
    }
    room.send(draft);
    setDraft('');
    list.current?.scrollToOffset({ offset: 0, animated: true });
  };
  return (
    <SafeAreaView
      testID="chat-room-screen"
      edges={['top', 'bottom']}
      className="flex-1 bg-canvas"
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.canvas}
      />
      <View className="flex-row items-center gap-2 border-b border-line px-3 py-2">
        <PressableScale
          testID="chat-back"
          accessibilityRole="button"
          accessibilityLabel={t('learning.back')}
          onPress={onBack}
          className="h-[44px] w-[34px] items-center justify-center"
        >
          <Icon
            name="back"
            size={24}
          />
        </PressableScale>
        <Avatar
          name={title}
          group={room.header.data?.type === 'GROUP'}
          small
        />
        <View className="flex-1 gap-1">
          <Text
            numberOfLines={1}
            accessibilityRole="header"
            className="font-nunito-extrabold text-[16px] text-black"
          >
            {title}
          </Text>
          <ConnectionLabel online={room.online} />
        </View>
      </View>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {!ready ? (
          <View className="flex-1 p-4">
            {!room.denied && !room.header.isError && !room.history.isError ? (
              <ActivityIndicator
                accessibilityLabel={t('chat.loading')}
                color={colors.forest}
              />
            ) : (
              <ScreenState
                title={t('chat.title')}
                description={t(room.denied ? 'chat.denied' : 'chat.error')}
                onRetry={room.denied ? undefined : room.reconnect}
              />
            )}
          </View>
        ) : (
          <>
            {(room.syncError ||
              room.header.isError ||
              room.history.isError) && (
              <PressableScale
                accessibilityRole="button"
                onPress={room.reconnect}
                className="bg-soft p-3"
              >
                <Text
                  accessibilityRole="alert"
                  className="font-nunito text-sm text-muted"
                >
                  {t('chat.syncError')}
                </Text>
              </PressableScale>
            )}
            <FlatList
              ref={list}
              testID="chat-messages"
              inverted
              data={data}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="px-3 py-4"
              ListEmptyComponent={
                <View className="py-8">
                  <Text className="text-center font-nunito text-sm text-muted">
                    {t('chat.firstMessage')}
                  </Text>
                </View>
              }
              ListFooterComponent={
                <PageEnd
                  more={!!room.history.hasNextPage}
                  busy={room.history.isFetchingNextPage}
                  failed={room.history.isFetchNextPageError}
                  onMore={() => {
                    room.history.fetchNextPage().catch(() => {});
                  }}
                />
              }
              renderItem={({ item }) => {
                if ('pending' in item)
                  return (
                    <View className="mb-2 ml-[48px] items-end gap-1">
                      <View className="max-w-[90%] rounded-[18px] rounded-br-[5px] bg-forest/60 px-4 py-2.5">
                        <Text className="font-nunito text-[15px] text-canvas">
                          {item.pending.body}
                        </Text>
                      </View>
                      {item.pending.failed ? (
                        <PressableScale
                          testID={`chat-retry-${item.id}`}
                          accessibilityRole="button"
                          onPress={() => room.retry(item.pending)}
                          className="min-h-[40px] justify-center"
                        >
                          <Text
                            accessibilityRole="alert"
                            className="font-nunito text-[11px] text-headsup"
                          >
                            {t('chat.sendFailed')}
                          </Text>
                        </PressableScale>
                      ) : (
                        <Text className="font-nunito text-[10px] text-muted">
                          {t('chat.sending')}
                        </Text>
                      )}
                    </View>
                  );
                const {
                  message: message,
                  startsRun,
                  endsRun,
                  showTime,
                  showUnread,
                } = item.row;
                const mine = message.sender.id === scope.userId;
                return (
                  <View className={endsRun ? 'mb-3' : 'mb-1'}>
                    {showTime && (
                      <Text className="pb-3 pt-2 text-center font-nunito text-[11px] text-muted">
                        {formatDividerTime(message.createdAt, i18n.language)}
                      </Text>
                    )}
                    {showUnread && (
                      <Text className="py-3 text-center font-nunito-bold text-[11px] text-mint">
                        {t('chat.newMessages')}
                      </Text>
                    )}
                    {startsRun &&
                      !mine &&
                      room.header.data?.type === 'GROUP' && (
                        <Text className="mb-1 ml-[38px] font-nunito-bold text-[11px] text-muted">
                          {message.sender.displayName}
                        </Text>
                      )}
                    <View
                      className={`flex-row items-end gap-2 ${mine ? 'justify-end pl-[40px]' : 'pr-[40px]'}`}
                    >
                      {!mine &&
                        (endsRun ? (
                          <Avatar
                            name={message.sender.displayName}
                            small
                          />
                        ) : (
                          <View className="w-[30px]" />
                        ))}
                      <View
                        className={`max-w-[90%] gap-1 rounded-[18px] px-4 py-2.5 ${mine ? 'rounded-br-[5px] bg-forest' : 'rounded-bl-[5px] bg-soft'}`}
                      >
                        {!message.deletedAt && message.replyTo && (
                          <Text
                            numberOfLines={2}
                            className={`border-l-2 border-mint pl-2 font-nunito text-[11px] ${mine ? 'text-line' : 'text-muted'}`}
                          >
                            {t('chat.replyTo', {
                              name: message.replyTo.senderDisplayName,
                            })}
                          </Text>
                        )}
                        {(message.deletedAt || message.body) && (
                          <Text
                            selectable
                            className={`font-nunito text-[15px] leading-[22px] ${mine ? 'text-canvas' : 'text-black'}`}
                          >
                            {message.deletedAt
                              ? t('chat.deleted')
                              : message.body}
                          </Text>
                        )}
                        {!message.deletedAt && message.file && (
                          <Attachment
                            item={message}
                            mine={mine}
                          />
                        )}
                        {message.editedAt && !message.deletedAt && (
                          <Text
                            className={`font-nunito text-[10px] ${mine ? 'text-line' : 'text-muted'}`}
                          >
                            {t('chat.edited')}
                          </Text>
                        )}
                      </View>
                    </View>
                    {endsRun && (
                      <Text
                        className={`mt-1 font-nunito text-[10px] text-muted ${mine ? 'pr-1 text-right' : 'ml-[38px]'}`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </Text>
                    )}
                  </View>
                );
              }}
            />
            {room.typing && (
              <Text
                accessibilityLiveRegion="polite"
                className="px-5 pb-2 font-nunito text-xs text-muted"
              >
                {t('chat.typing')}
              </Text>
            )}
            {canSend ? (
              <View className="border-t border-line">
                {attachOpen && (
                  <View
                    testID="chat-attach-menu"
                    className="flex-row gap-2 px-3 pt-3"
                  >
                    {ATTACHMENT_OPTIONS.map((option) => (
                      // PressableScale bọc Pressable trong Animated.View (cột): đặt flex-1
                      // lên Pressable sẽ thành flex-basis 0 theo chiều dọc và làm chip
                      // co chiều cao, bị ô nhập đè lên. Chia chiều ngang ở View ngoài.
                      <View
                        key={option.kind}
                        className="min-w-[0px] flex-1"
                      >
                        <PressableScale
                          testID={`chat-attach-${option.kind.toLowerCase()}`}
                          accessibilityRole="button"
                          accessibilityLabel={`${t(option.label)}, ${t(option.hint)}`}
                          onPress={() => {
                            setAttachOpen(false);
                            attachment.select(option.kind);
                          }}
                          disabled={attachment.busy || attachment.pendingSend}
                          className="min-h-[56px] flex-row items-center gap-3 rounded-[16px] bg-soft px-3 py-2"
                        >
                          <View className="h-[36px] w-[36px] items-center justify-center rounded-full bg-mint">
                            <Icon
                              name={option.icon}
                              size={18}
                              light
                            />
                          </View>
                          <View className="shrink">
                            <Text className="font-nunito-bold text-[14px] text-black">
                              {t(option.label)}
                            </Text>
                            <Text className="font-nunito text-[12px] text-muted">
                              {t(option.hint)}
                            </Text>
                          </View>
                        </PressableScale>
                      </View>
                    ))}
                  </View>
                )}
                {attachment.file && (
                  <AttachmentPreview
                    file={attachment.file}
                    status={
                      attachment.busy
                        ? 'uploading'
                        : attachment.ready
                          ? 'ready'
                          : 'processing'
                    }
                    removeDisabled={attachment.pendingSend}
                    onRemove={attachment.clear}
                  />
                )}
                {attachment.error && (
                  <View className="gap-2 px-4 pt-2">
                    <Text
                      testID="chat-attachment-error"
                      accessibilityRole="alert"
                      className="font-nunito text-xs text-headsup"
                    >
                      {attachment.error}
                    </Text>
                    {attachment.file && !attachment.rejected && (
                      <Button
                        testID="chat-attachment-retry"
                        label={t('common.retry')}
                        variant="outline"
                        disabled={attachment.busy}
                        onPress={() => {
                          attachment.retry().catch(() => {});
                        }}
                      />
                    )}
                  </View>
                )}
                {attachment.file &&
                  !attachment.busy &&
                  !attachment.ready &&
                  !attachment.rejected &&
                  !attachment.error && (
                    <View className="px-4 pt-2">
                      <Button
                        label={t('chat.attach.check')}
                        variant="outline"
                        onPress={() => {
                          attachment.retry().catch(() => {});
                        }}
                      />
                    </View>
                  )}
                <View className="flex-row items-end gap-2 px-3 pb-2 pt-3">
                  <PressableScale
                    testID="chat-attach"
                    accessibilityRole="button"
                    accessibilityLabel={t(
                      attachOpen ? 'chat.attach.close' : 'chat.attach.open'
                    )}
                    accessibilityState={{ expanded: attachOpen }}
                    disabled={attachment.busy || attachment.pendingSend}
                    onPress={() => {
                      setAttachOpen((open) => !open);
                    }}
                    className={`h-[46px] w-[46px] items-center justify-center rounded-full ${attachOpen ? 'bg-mint' : 'bg-soft'}`}
                  >
                    {/* Luôn đặt rotate-* (biến --tw-rotate) ngay lần render đầu: thêm động
                      sẽ khiến NativeWind "upgrade" component và crash ở dev. */}
                    <View className={attachOpen ? 'rotate-45' : 'rotate-0'}>
                      <Icon
                        name="plus"
                        size={22}
                        light={attachOpen}
                      />
                    </View>
                  </PressableScale>
                  <TextInput
                    testID="chat-input"
                    multiline
                    value={draft}
                    editable={!attachment.pendingSend && !attachment.busy}
                    onChangeText={(value) => {
                      setDraft(value);
                      room.draftChanged();
                    }}
                    placeholder={t('chat.placeholder')}
                    accessibilityLabel={t('chat.placeholder')}
                    placeholderTextColor={colors.muted}
                    maxLength={4000}
                    className="max-h-[120px] min-h-[46px] flex-1 rounded-[23px] bg-soft px-4 py-3 font-nunito text-[15px] text-black"
                  />
                  <PressableScale
                    testID="chat-send"
                    accessibilityRole="button"
                    accessibilityLabel={t('chat.send')}
                    disabled={sendDisabled}
                    onPress={send}
                    className={`h-[46px] w-[46px] items-center justify-center rounded-full bg-mint ${sendDisabled ? 'opacity-40' : ''}`}
                  >
                    <Icon
                      name="send"
                      size={22}
                      light
                    />
                  </PressableScale>
                </View>
              </View>
            ) : (
              <Text className="border-t border-line px-5 py-4 text-center font-nunito text-sm text-muted">
                {t('chat.readOnly')}
              </Text>
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
