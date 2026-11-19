import '../../../tests/mocks/nativeUi';
import { act, waitFor } from '@testing-library/react-native';
import { pick, keepLocalCopy } from '@react-native-documents/picker';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL as base } from '../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../tests/utils/renderWithProviders';
import { student, commerceId } from '../../../tests/fixtures/commerce';
import { chatId, chatMessage } from '../../../tests/fixtures/chat';
import { useStore } from '@/state/store';
import '@/config/i18n.config';
import {
  chatFileDeclaration,
  type FileMessageInput,
} from './attachments.service';
import { useChatAttachment } from './useChatAttachment';

jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  keepLocalCopy: jest.fn(),
  types: { images: 'image/*', pdf: 'application/pdf' },
  isErrorWithCode: () => true,
  errorCodes: { OPERATION_CANCELED: 'cancelled' },
}));
const file = {
  id: commerceId(800),
  originalFilename: 'photo.png',
  mimeType: 'image/png',
  sizeBytes: 11,
  kind: 'IMAGE' as const,
};
const fileStatus = {
  id: file.id,
  status: 'READY',
  originalFilename: file.originalFilename,
  errorCode: null,
  file,
};
const onSent = jest.fn();
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  jest.clearAllMocks();
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 1,
  });
  jest.mocked(pick).mockResolvedValue([
    {
      uri: 'file:///photo.png',
      name: 'photo.png',
      type: 'image/png',
      size: 11,
      isVirtual: false,
      hasRequestedType: true,
      nativeType: 'image/png',
      error: null,
      convertibleToMimeTypes: null,
    },
  ]);
  jest.mocked(keepLocalCopy).mockResolvedValue([
    {
      status: 'success',
      sourceUri: 'file:///photo.png',
      localUri: 'file:///cache/photo.png',
    },
  ]);
  const realFetch = global.fetch;
  jest
    .spyOn(global, 'fetch')
    .mockImplementation((input, init) =>
      String(input).startsWith('file:')
        ? Promise.resolve(new Response(new Blob(['image-bytes'])))
        : realFetch(input, init)
    );
  mockServer.use(
    http.post(base + '/chat/conversations/:id/attachments/upload-intents', () =>
      HttpResponse.json({
        fileId: file.id,
        uploadUrl: 'https://storage.test/file',
        requiredHeaders: { 'content-type': 'image/png' },
      })
    ),
    http.put('https://storage.test/file', async ({ request }) => {
      expect(request.headers.get('authorization')).toBeNull();
      expect(request.headers.get('cookie')).toBeNull();
      expect(request.headers.get('content-type')).toBe('image/png');
      expect(await request.text()).toBe('image-bytes');
      return new HttpResponse(null, { status: 200 });
    }),
    http.post(
      base + '/chat/conversations/:id/attachments/:fileId/complete',
      () =>
        HttpResponse.json({ ...fileStatus, status: 'PROCESSING', file: null })
    ),
    http.get(base + '/chat/conversations/:id/attachments/:fileId', () =>
      HttpResponse.json(fileStatus)
    )
  );
});
afterEach(() => {
  mockServer.resetHandlers();
  jest.restoreAllMocks();
});
afterAll(() => mockServer.close());

it('selects an image, uploads bytes, waits for validation and retries the same file message after a lost confirmation', async () => {
  const inputs: FileMessageInput[] = [];
  mockServer.use(
    http.post(
      base + '/chat/conversations/:id/messages',
      async ({ request }) => {
        expect(request.headers.get('Origin')).toBe('https://mobile.mindy.test');
        const input = (await request.json()) as FileMessageInput;
        inputs.push(input);
        if (inputs.length === 1)
          return HttpResponse.json(
            { statusCode: 503, code: 'UNAVAILABLE', message: 'Retry' },
            { status: 503 }
          );
        return HttpResponse.json({
          message: {
            ...chatMessage,
            clientMessageId: input.clientMessageId,
            type: 'IMAGE',
            body: input.body ?? null,
            file,
          },
          replayed: true,
        });
      }
    )
  );
  const { result } = renderHookWithProviders(() =>
    useChatAttachment(chatId, true, onSent)
  );
  act(() => result.current.select('IMAGE'));
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.file?.uri).toBe('file:///cache/photo.png');
  expect(inputs).toHaveLength(0);
  act(() => result.current.send('Ảnh bài tập'));
  await waitFor(() => expect(result.current.error).toBeTruthy());
  expect(result.current.pendingSend).toBe(true);
  act(() => result.current.clear());
  expect(result.current.file).not.toBeNull();
  await act(async () => {
    await result.current.retry();
  });
  expect(inputs).toHaveLength(2);
  expect(inputs[0]).toEqual(inputs[1]);
  expect(inputs[0]).toMatchObject({
    type: 'IMAGE',
    fileObjectId: file.id,
    body: 'Ảnh bài tập',
  });
  expect(onSent).toHaveBeenCalledTimes(1);
  expect(result.current.file).toBeNull();
});

it('reuses the upload receipt after an uncertain intent failure', async () => {
  const receipts: (string | null)[] = [];
  mockServer.use(
    http.post(
      base + '/chat/conversations/:id/attachments/upload-intents',
      async ({ request }) => {
        receipts.push(request.headers.get('Idempotency-Key'));
        expect(await request.json()).toEqual({
          originalFilename: 'photo.png',
          declaredMimeType: 'image/png',
          declaredSizeBytes: 11,
        });
        if (receipts.length === 1)
          return HttpResponse.json(
            { statusCode: 503, code: 'UNAVAILABLE', message: 'Retry' },
            { status: 503 }
          );
        return HttpResponse.json({
          fileId: file.id,
          uploadUrl: 'https://storage.test/file',
          requiredHeaders: { 'content-type': 'image/png' },
        });
      }
    )
  );
  const { result } = renderHookWithProviders(() =>
    useChatAttachment(chatId, true, onSent)
  );
  act(() => result.current.select('IMAGE'));
  await waitFor(() => expect(result.current.error).toBeTruthy());
  await act(async () => {
    await result.current.retry();
  });
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(receipts).toHaveLength(2);
  expect(receipts[0]).toBeTruthy();
  expect(receipts[0]).toBe(receipts[1]);
});

it('does not send while a file is being processed or after it is rejected', async () => {
  let status = 'PROCESSING';
  let sends = 0;
  mockServer.use(
    http.get(base + '/chat/conversations/:id/attachments/:fileId', () =>
      HttpResponse.json({ ...fileStatus, status, file: null })
    ),
    http.post(base + '/chat/conversations/:id/messages', () => {
      sends++;
      return HttpResponse.json({});
    })
  );
  const { result } = renderHookWithProviders(() =>
    useChatAttachment(chatId, true, onSent)
  );
  act(() => result.current.select('IMAGE'));
  await waitFor(() =>
    expect(result.current.file && !result.current.busy).toBe(true)
  );
  act(() => result.current.send(''));
  status = 'FAILED';
  await act(async () => {
    await result.current.retry();
  });
  await waitFor(() => expect(result.current.rejected).toBe(true));
  act(() => result.current.send(''));
  expect(sends).toBe(0);
});

it('does not open the picker when sending is unavailable', () => {
  const { result } = renderHookWithProviders(() =>
    useChatAttachment(chatId, false, onSent)
  );
  act(() => result.current.select('IMAGE'));
  expect(pick).not.toHaveBeenCalled();
});

it('does not upload a late picker result after the session ends', async () => {
  let resolvePick:
    | ((files: Awaited<ReturnType<typeof pick>>) => void)
    | undefined;
  jest.mocked(pick).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolvePick = resolve;
      })
  );
  const { result } = renderHookWithProviders(() =>
    useChatAttachment(chatId, true, onSent)
  );
  act(() => result.current.select('IMAGE'));
  act(() => {
    useStore.setState({ sessionUser: null, generation: 2 });
  });
  await act(async () => {
    resolvePick?.([
      {
        uri: 'file:///photo.png',
        name: 'photo.png',
        type: 'image/png',
        size: 11,
        isVirtual: false,
        hasRequestedType: true,
        nativeType: 'image/png',
        error: null,
        convertibleToMimeTypes: null,
      },
    ]);
  });
  expect(keepLocalCopy).not.toHaveBeenCalled();
  expect(onSent).not.toHaveBeenCalled();
});

it.each([
  ['photo.heic', 'image/heic', 1024, 'IMAGE'],
  ['photo.png', 'image/png', 6 * 1024 * 1024, 'IMAGE'],
  ['photo.png', 'image/png', 0, 'IMAGE'],
  ['photo.png', 'application/pdf', 100, 'IMAGE'],
  ['file.pdf', 'application/pdf', 11 * 1024 * 1024, 'PDF'],
  ['file.pdf', 'application/pdf', 100, 'IMAGE'],
] as const)(
  'rejects an unsupported file %s (%s, %s bytes, %s)',
  (name, mime, size, kind) => {
    expect(chatFileDeclaration(name, mime, size, kind)).toBeNull();
  }
);

it('accepts PNG/JPEG/WebP and PDF with their respective limits', () => {
  expect(
    chatFileDeclaration('photo.JPG', null, 5 * 1024 * 1024, 'IMAGE')
  ).not.toBeNull();
  expect(
    chatFileDeclaration('photo.webp', 'image/webp', 100, 'IMAGE')
  ).not.toBeNull();
  expect(
    chatFileDeclaration('work.pdf', 'application/pdf', 10 * 1024 * 1024, 'PDF')
  ).not.toBeNull();
});
