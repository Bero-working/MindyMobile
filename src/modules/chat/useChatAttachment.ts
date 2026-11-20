import { useEffect, useRef, useState } from 'react';
import {
  pick,
  keepLocalCopy,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { v4 } from 'uuid';
import { scopeKey, useStudentScope } from '@/shared/hooks/useStudentScope';
import { ApiError } from '@/shared/utilities/apiError';
import { privateQueryOptions } from '@/modules/my-classes/hooks/useLearningQuery';
import {
  chatAttachments,
  chatFileDeclaration,
  type ChatAttachmentFile,
  type ChatUploadIntent,
  type FileMessageInput,
} from './attachments.service';
import type { ChatMessage } from './schema';

type UploadJob = {
  file: ChatAttachmentFile;
  receipt: string;
  intent?: ChatUploadIntent;
  uploaded: boolean;
  input?: FileMessageInput;
};

export function useChatAttachment(
  conversationId: string,
  enabled: boolean,
  onSent: (message: ChatMessage) => void
) {
  const { t } = useTranslation();
  const scope = useStudentScope();
  const client = useQueryClient();
  const [file, setFile] = useState<ChatAttachmentFile | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [pendingSend, setPendingSend] = useState(false);
  const locked = useRef(false);
  const job = useRef<UploadJob | null>(null);
  const lifetime = useRef(new AbortController());
  const current = useRef({ enabled, onSent });
  current.current = { enabled: enabled && scope.enabled, onSent };
  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    job.current = null;
    locked.current = false;
    setFile(null);
    setFileId(null);
    setBusy(false);
    setError(null);
    setUploadFailed(false);
    setPendingSend(false);
    return () => controller.abort();
  }, [conversationId, scope.userId, scope.generation]);
  const statusKey = [
    'chat',
    ...scopeKey(scope),
    conversationId,
    'attachment',
    fileId,
  ];
  const status = useQuery({
    queryKey: statusKey,
    queryFn: ({ signal }) =>
      chatAttachments.status(conversationId, fileId ?? '', signal),
    enabled: enabled && scope.enabled && !!fileId,
    ...privateQueryOptions,
    refetchInterval: (query) =>
      query.state.data?.status === 'PROCESSING' &&
      query.state.dataUpdateCount < 20
        ? 1500
        : false,
  });
  const ready = !!status.data?.file && status.data.status === 'READY';
  const rejected =
    !!status.data &&
    ['FAILED', 'DELETED', 'DELETING'].includes(status.data.status);
  const upload = async (params: UploadJob, signal: AbortSignal) => {
    if (signal.aborted) return;
    if (!params.intent)
      params.intent = await chatAttachments.intent(
        conversationId,
        params.file,
        params.receipt,
        signal
      );
    if (signal.aborted) return;
    if (!params.uploaded) {
      await chatAttachments.upload(params.intent, params.file.uri, signal);
      params.uploaded = true;
    }
    if (signal.aborted) return;
    const result = await chatAttachments.complete(
      conversationId,
      params.intent.fileId,
      signal
    );
    if (signal.aborted) return;
    client.setQueryData(
      [
        'chat',
        ...scopeKey(scope),
        conversationId,
        'attachment',
        params.intent.fileId,
      ],
      result
    );
    setFileId(params.intent.fileId);
    setUploadFailed(false);
  };
  const select = async (kind: 'IMAGE' | 'PDF') => {
    if (locked.current || pendingSend || !current.current.enabled) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    const signal = lifetime.current.signal;
    let uploading = false;
    try {
      const [selected] = await pick({
        type: kind === 'IMAGE' ? [types.images] : [types.pdf],
        allowMultiSelection: false,
      });
      if (signal.aborted) return;
      const declaration = chatFileDeclaration(
        selected.name,
        selected.type,
        selected.size,
        kind
      );
      if (!declaration) {
        setError(t('chat.attach.invalid'));
        return;
      }
      const [copy] = await keepLocalCopy({
        files: [{ uri: selected.uri, fileName: declaration.originalFilename }],
        destination: 'cachesDirectory',
      });
      if (signal.aborted) return;
      if (copy.status !== 'success') throw new Error('File copy failed');
      const item: UploadJob = {
        file: {
          uri: copy.localUri,
          name: declaration.originalFilename,
          mime: declaration.declaredMimeType,
          size: declaration.declaredSizeBytes,
        },
        receipt: v4(),
        uploaded: false,
      };
      job.current = item;
      setFile(item.file);
      setFileId(null);
      uploading = true;
      await upload(item, signal);
    } catch (failure) {
      if (
        signal.aborted ||
        (isErrorWithCode(failure) &&
          failure.code === errorCodes.OPERATION_CANCELED)
      )
        return;
      setUploadFailed(uploading);
      setError(
        t(uploading ? 'chat.attach.uploadError' : 'chat.attach.pickError')
      );
    } finally {
      locked.current = false;
      if (!signal.aborted) setBusy(false);
    }
  };
  const send = async (body: string) => {
    const item = job.current;
    if (
      !item ||
      locked.current ||
      !current.current.enabled ||
      (!item.input && (!ready || !fileId))
    )
      return;
    item.input ??= {
      clientMessageId: v4(),
      type: item.file.mime.startsWith('image/') ? 'IMAGE' : 'FILE',
      fileObjectId: fileId ?? '',
      ...(body.trim() ? { body } : {}),
    };
    locked.current = true;
    setBusy(true);
    setPendingSend(true);
    setError(null);
    const signal = lifetime.current.signal;
    try {
      const result = await chatAttachments.send(
        conversationId,
        item.input,
        signal
      );
      if (signal.aborted) return;
      job.current = null;
      setFile(null);
      setFileId(null);
      setPendingSend(false);
      current.current.onSent(result);
    } catch (failure) {
      if (signal.aborted) return;
      if (
        failure instanceof ApiError &&
        failure.status >= 400 &&
        failure.status < 500 &&
        ![408, 429].includes(failure.status)
      ) {
        delete item.input;
        setPendingSend(false);
        setError(t('chat.attach.sendRejected'));
        if ([401, 403, 404].includes(failure.status))
          client
            .invalidateQueries({
              queryKey: ['chat', ...scopeKey(scope), 'room', conversationId],
            })
            .catch(() => {});
      } else {
        setError(t('chat.attach.sendError'));
      }
    } finally {
      locked.current = false;
      if (!signal.aborted) setBusy(false);
    }
  };
  return {
    file,
    busy,
    pendingSend,
    ready,
    rejected,
    error:
      error ??
      (status.isError
        ? t('chat.attach.statusError')
        : rejected
          ? t('chat.attach.rejected')
          : null),
    select: (kind: 'IMAGE' | 'PDF') => {
      select(kind).catch(() => {});
    },
    send: (body: string) => {
      send(body).catch(() => {});
    },
    clear: () => {
      if (locked.current || pendingSend) return;
      job.current = null;
      setFile(null);
      setFileId(null);
      setUploadFailed(false);
      setError(null);
    },
    retry: async () => {
      if (locked.current || !current.current.enabled) return;
      if (job.current?.input) {
        await send(job.current.input.body ?? '');
        return;
      }
      if (uploadFailed && job.current) {
        locked.current = true;
        setBusy(true);
        setError(null);
        const signal = lifetime.current.signal;
        try {
          await upload(job.current, signal);
        } catch {
          if (!signal.aborted) setError(t('chat.attach.uploadError'));
        } finally {
          locked.current = false;
          if (!signal.aborted) setBusy(false);
        }
      } else {
        setError(null);
        await status.refetch();
      }
    },
  };
}
