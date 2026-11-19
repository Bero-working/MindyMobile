import { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import { env } from '@/config/env';
import { ApiError } from '@/shared/utilities/apiError';
import { message, sendResult } from './schema';

const id = z.string().uuid();
const webUrl = z
  .string()
  .url()
  .refine((value) => /^https?:$/.test(new URL(value).protocol));
const intentSchema = z.object({
  fileId: id,
  uploadUrl: webUrl,
  requiredHeaders: z.record(z.string()),
});
export type ChatUploadIntent = z.infer<typeof intentSchema>;
export const attachmentStatusSchema = z.object({
  id,
  status: z.enum([
    'PENDING_UPLOAD',
    'PROCESSING',
    'READY',
    'FAILED',
    'DELETING',
    'DELETED',
  ]),
  originalFilename: z.string(),
  errorCode: z.string().nullable(),
  file: message.shape.file,
});
export type ChatAttachmentFile = {
  uri: string;
  name: string;
  mime: string;
  size: number;
};
export type FileMessageInput = {
  clientMessageId: string;
  type: 'IMAGE' | 'FILE';
  fileObjectId: string;
  body?: string;
};

export function chatFileDeclaration(
  name: string | null,
  mime: string | null,
  size: number | null,
  kind: 'IMAGE' | 'PDF'
) {
  const extension = name?.split('.').at(-1)?.toLowerCase() ?? '';
  const formats: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    pdf: 'application/pdf',
  };
  const declaredMimeType = formats[extension];
  const limit = kind === 'IMAGE' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (
    !name ||
    name.length > 250 ||
    [...name].some(
      (character) =>
        character.charCodeAt(0) < 32 ||
        character.charCodeAt(0) === 127 ||
        character === '/' ||
        character === '\\'
    ) ||
    !declaredMimeType ||
    (mime &&
      mime !== 'application/octet-stream' &&
      mime !== declaredMimeType) ||
    (kind === 'PDF') !== (declaredMimeType === 'application/pdf') ||
    !Number.isSafeInteger(size) ||
    size === null ||
    size <= 0 ||
    size > limit
  )
    return null;
  return { originalFilename: name, declaredMimeType, declaredSizeBytes: size };
}

const path = (conversationId: string) =>
  `chat/conversations/${id.parse(conversationId)}`;
const config = (signal: AbortSignal, key?: string) => {
  if (!env.APP_ORIGIN)
    throw new ApiError({
      statusCode: 0,
      code: 'APP_ORIGIN_REQUIRED',
      message: 'Missing chat Origin',
    });
  return {
    signal,
    headers: {
      Origin: env.APP_ORIGIN,
      ...(key ? { 'Idempotency-Key': key } : {}),
    },
  };
};
export const chatAttachments = {
  async intent(
    conversationId: string,
    file: ChatAttachmentFile,
    key: string,
    signal: AbortSignal
  ) {
    return intentSchema.parse(
      await apiInstances.service.post<object, object>(
        `${path(conversationId)}/attachments/upload-intents`,
        {
          originalFilename: file.name,
          declaredMimeType: file.mime,
          declaredSizeBytes: file.size,
        },
        config(signal, key)
      )
    );
  },
  async upload(intent: ChatUploadIntent, uri: string, signal: AbortSignal) {
    const transfer = new AbortController();
    const abort = () => transfer.abort();
    signal.addEventListener('abort', abort);
    if (signal.aborted) abort();
    const timer = setTimeout(abort, 60000);
    try {
      const local = await fetch(uri, { signal: transfer.signal });
      const blob = await local.blob();
      const result = await fetch(intent.uploadUrl, {
        method: 'PUT',
        headers: intent.requiredHeaders,
        body: blob,
        credentials: 'omit',
        signal: transfer.signal,
      });
      if (!result.ok)
        throw new ApiError({
          statusCode: result.status,
          code: 'CHAT_UPLOAD_FAILED',
          message: 'Upload failed',
        });
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
    }
  },
  async complete(conversationId: string, fileId: string, signal: AbortSignal) {
    const result = attachmentStatusSchema.parse(
      await apiInstances.service.post<object, object>(
        `${path(conversationId)}/attachments/${id.parse(fileId)}/complete`,
        {},
        config(signal)
      )
    );
    if (result.id !== fileId) throw new Error('Attachment mismatch');
    return result;
  },
  async status(conversationId: string, fileId: string, signal: AbortSignal) {
    const result = attachmentStatusSchema.parse(
      await apiInstances.service.get<object>(
        `${path(conversationId)}/attachments/${id.parse(fileId)}`,
        { signal }
      )
    );
    if (result.id !== fileId || (result.file && result.file.id !== fileId))
      throw new Error('Attachment mismatch');
    return result;
  },
  async send(
    conversationId: string,
    input: FileMessageInput,
    signal: AbortSignal
  ) {
    const result = sendResult.parse(
      await apiInstances.service.post<object, object>(
        `${path(conversationId)}/messages`,
        input,
        config(signal)
      )
    );
    if (
      result.message.conversationId !== conversationId ||
      result.message.clientMessageId !== input.clientMessageId ||
      result.message.file?.id !== input.fileObjectId
    )
      throw new Error('Message mismatch');
    return result.message;
  },
};
