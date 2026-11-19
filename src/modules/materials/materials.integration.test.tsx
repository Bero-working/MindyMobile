import '../../../tests/mocks/nativeUi';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AppState, Linking, View } from 'react-native';
import type { WebView, WebViewProps } from 'react-native-webview';
import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL as base } from '../../../tests/mocks/constants';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import {
  material,
  materialFile,
  materialAccess,
} from '../../../tests/fixtures/materials';
import { student, commerceId } from '../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import '@/config/i18n.config';
import { materialsService } from './materials.service';
import { MaterialsList, MaterialReader } from './MaterialsRoutes';
import { MaterialViewer } from './MaterialViewer';

const mockNavigate = jest.fn();
const mockInject = jest.fn();
let mockFocused = true;
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockFocused,
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));
jest.mock('react-native-webview', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Native =
    jest.requireActual<typeof import('react-native')>('react-native');
  return {
    WebView: React.forwardRef<WebView, WebViewProps>((props, ref) => {
      React.useImperativeHandle(
        ref,
        () => ({ injectJavaScript: mockInject }) as Partial<WebView> as WebView
      );
      return (
        <Native.View
          {...props}
          testID="mock-webview"
        />
      );
    }),
  };
});
const detailPath = `${base}/me/classes/${material.classId}/materials/${material.id}`;
const listPath = `${base}/me/classes/${material.classId}/units/${material.classUnitId}/materials`;
const list = (items = [material], page = 1, total = items.length) => ({
  items,
  page,
  pageSize: 20,
  total,
  asOf: material.updatedAt,
});
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  jest.clearAllMocks();
  mockFocused = true;
  AppState.currentState = 'active';
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 20,
  });
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
});
afterEach(() => {
  mockServer.resetHandlers();
  jest.restoreAllMocks();
});
afterAll(() => mockServer.close());

it('loads unit materials through the real HTTP client and opens the selected detail', async () => {
  mockServer.use(
    http.get(listPath, ({ request }) => {
      expect(new URL(request.url).searchParams.get('page')).toBe('1');
      expect(new URL(request.url).searchParams.get('pageSize')).toBe('20');
      return HttpResponse.json(list());
    })
  );
  renderWithProviders(
    <MaterialsList
      classId={material.classId}
      unitId={material.classUnitId}
      unitTitle="React"
    />
  );
  fireEvent.press(await screen.findByTestId(`material-open-${material.id}`));
  expect(mockNavigate).toHaveBeenCalledWith('STUDENT_MATERIAL', {
    classId: material.classId,
    materialId: material.id,
  });
});

it('supports pagination without dropping earlier materials', async () => {
  const second = {
    ...material,
    id: commerceId(810),
    title: 'Bài đọc tiếp theo',
  };
  mockServer.use(
    http.get(listPath, ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page'));
      return HttpResponse.json(
        list(page === 1 ? [material] : [second], page, 2)
      );
    })
  );
  renderWithProviders(
    <MaterialsList
      classId={material.classId}
      unitId={material.classUnitId}
      unitTitle="React"
    />
  );
  fireEvent.press(await screen.findByText('Xem thêm'));
  expect(await screen.findByText(second.title)).toBeTruthy();
  expect(screen.getByText(material.title)).toBeTruthy();
});

it('explains an empty list and lets a failed list request be retried', async () => {
  let calls = 0;
  mockServer.use(
    http.get(listPath, () =>
      ++calls === 1
        ? HttpResponse.json(
            { statusCode: 503, code: 'UNAVAILABLE', message: 'Unavailable' },
            { status: 503 }
          )
        : HttpResponse.json(list([]))
    )
  );
  renderWithProviders(
    <MaterialsList
      classId={material.classId}
      unitId={material.classUnitId}
      unitTitle="React"
    />
  );
  fireEvent.press(await screen.findByText('Thử lại'));
  expect(await screen.findByText('Chưa có tài liệu khả dụng')).toBeTruthy();
  expect(calls).toBe(2);
});

it('fetches a fresh primary download URL for every open action', async () => {
  let downloads = 0;
  mockServer.use(
    http.get(detailPath, () => HttpResponse.json(material)),
    http.get(detailPath + '/download', () => {
      downloads++;
      return HttpResponse.json(materialAccess());
    })
  );
  renderWithProviders(
    <MaterialReader
      classId={material.classId}
      materialId={material.id}
    />
  );
  fireEvent.press(await screen.findByTestId('material-download'));
  await waitFor(() => expect(Linking.openURL).toHaveBeenCalledTimes(1));
  fireEvent.press(screen.getByTestId('material-download'));
  await waitFor(() => expect(Linking.openURL).toHaveBeenCalledTimes(2));
  expect(downloads).toBe(2);
});

it('uses POST with Origin for attachments and keeps metadata on storage failure', async () => {
  const file = {
    ...materialFile,
    id: commerceId(811),
    originalFilename: 'practice.pdf',
  };
  const article = {
    ...material,
    contentType: 'ARTICLE',
    file: null,
    contentHtml: '<p>Hello</p>',
    contentSchemaVersion: 1,
    attachments: [file],
    attachmentCount: 1,
  };
  mockServer.use(
    http.get(detailPath, () => HttpResponse.json(article)),
    http.post(detailPath + `/files/${file.id}/access`, async ({ request }) => {
      expect(request.headers.get('Origin')).toBe('https://mobile.mindy.test');
      expect(await request.json()).toEqual({});
      return HttpResponse.json(
        { statusCode: 503, code: 'FILE_STORAGE_DISABLED', message: 'Disabled' },
        { status: 503 }
      );
    })
  );
  renderWithProviders(
    <MaterialReader
      classId={material.classId}
      materialId={material.id}
    />
  );
  fireEvent.press(await screen.findByTestId(`material-attachment-${file.id}`));
  expect(
    await screen.findByText(/Bạn vẫn có thể đọc thông tin tài liệu/)
  ).toBeTruthy();
  expect(screen.getByText(material.title)).toBeTruthy();
  expect(Linking.openURL).not.toHaveBeenCalled();
});

it('rejects changed revisions before opening an attachment', async () => {
  const attached = {
    ...material,
    attachments: [{ ...materialFile, id: commerceId(812) }],
  };
  mockServer.use(
    http.post(detailPath + `/files/${commerceId(812)}/access`, () =>
      HttpResponse.json({
        ...materialAccess(commerceId(812)),
        revision: 2,
        role: 'ATTACHMENT',
      })
    )
  );
  await expect(
    materialsService.access(material.classId, attached, commerceId(812))
  ).rejects.toMatchObject({ code: 'MATERIAL_REVISION_CHANGED' });
});

it('resolves article images through file access with Origin only when requested by the viewer', async () => {
  let accesses = 0;
  const image = { ...materialFile, kind: 'IMAGE', mimeType: 'image/png' };
  mockServer.use(
    http.get(detailPath, () =>
      HttpResponse.json({
        ...material,
        contentType: 'ARTICLE',
        file: null,
        contentHtml: `<p>React</p><img data-file-id="${image.id}">`,
        contentSchemaVersion: 1,
        inlineImages: [image],
      })
    ),
    http.post(detailPath + `/files/${image.id}/access`, ({ request }) => {
      accesses++;
      expect(request.headers.get('Origin')).toBe('https://mobile.mindy.test');
      return HttpResponse.json({
        ...materialAccess(image.id),
        revision: 1,
        role: 'INLINE_IMAGE',
      });
    })
  );
  renderWithProviders(
    <MaterialReader
      classId={material.classId}
      materialId={material.id}
    />
  );
  const viewer = await screen.findByTestId('mock-webview');
  expect(accesses).toBe(0);
  fireEvent(viewer, 'message', {
    nativeEvent: { data: JSON.stringify({ type: 'image', fileId: image.id }) },
  });
  await waitFor(() =>
    expect(mockInject).toHaveBeenCalledWith(
      `window.resolveImage("${image.id}","${materialAccess().url}");true;`
    )
  );
  expect(accesses).toBe(1);
  expect(Linking.openURL).not.toHaveBeenCalled();
});

it('does not open a late download after leaving the screen', async () => {
  let release = () => {};
  let started = false;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  mockServer.use(
    http.get(detailPath, () => HttpResponse.json(material)),
    http.get(detailPath + '/download', async () => {
      started = true;
      await waiting;
      return HttpResponse.json(materialAccess());
    })
  );
  const view = renderWithProviders(
    <MaterialReader
      classId={material.classId}
      materialId={material.id}
    />
  );
  fireEvent.press(await screen.findByTestId('material-download'));
  await waitFor(() => expect(started).toBe(true));
  mockFocused = false;
  view.rerender(
    <MaterialReader
      classId={material.classId}
      materialId={material.id}
    />
  );
  await act(async () => {
    release();
    await waiting;
  });
  expect(Linking.openURL).not.toHaveBeenCalled();
});

it('rejects expired links and broken pagination', async () => {
  mockServer.use(
    http.get(detailPath + '/download', () =>
      HttpResponse.json({
        ...materialAccess(),
        expiresAt: '2020-01-01T00:00:00Z',
      })
    ),
    http.get(listPath, () => HttpResponse.json(list([], 1, 1)))
  );
  await expect(
    materialsService.download(material.classId, material)
  ).rejects.toMatchObject({ code: 'INVALID_MATERIAL_RESPONSE' });
  await expect(
    materialsService.list(material.classId, material.classUnitId, 1)
  ).rejects.toMatchObject({ code: 'INVALID_MATERIAL_RESPONSE' });
});

it('does not request arbitrary files outside the current material detail', async () => {
  await expect(
    materialsService.access(material.classId, material, commerceId(899))
  ).rejects.toMatchObject({ code: 'INVALID_MATERIAL_RESPONSE' });
});

it.each([
  { ...material, classId: commerceId(899) },
  { ...material, classUnitId: commerceId(899) },
])('rejects materials returned for another class or unit', async (other) => {
  mockServer.use(http.get(listPath, () => HttpResponse.json(list([other]))));
  await expect(
    materialsService.list(material.classId, material.classUnitId, 1)
  ).rejects.toMatchObject({ code: 'INVALID_MATERIAL_RESPONSE' });
});

it.each([
  'http://storage.test/file',
  // eslint-disable-next-line no-script-url -- Deliberately hostile API response.
  'javascript:alert(1)',
  'https://user:pass@storage.test/file',
])('rejects unsafe storage capabilities: %s', async (url) => {
  mockServer.use(
    http.get(detailPath + '/download', () =>
      HttpResponse.json({ ...materialAccess(), url })
    )
  );
  await expect(
    materialsService.download(material.classId, material)
  ).rejects.toMatchObject({ code: 'INVALID_MATERIAL_RESPONSE' });
});

it('removes the viewer immediately when material access is denied', async () => {
  const video = {
    ...material,
    contentType: 'VIDEO',
    file: { ...materialFile, kind: 'VIDEO', mimeType: 'video/mp4' },
  };
  mockServer.use(
    http.get(detailPath, () => HttpResponse.json(video)),
    http.get(detailPath + '/download', () =>
      HttpResponse.json(
        { statusCode: 403, code: 'MATERIAL_ACCESS_DENIED', message: 'Denied' },
        { status: 403 }
      )
    )
  );
  renderWithProviders(
    <MaterialReader
      classId={material.classId}
      materialId={material.id}
    />
  );
  const viewer = await screen.findByTestId('mock-webview');
  fireEvent(viewer, 'message', {
    nativeEvent: { data: JSON.stringify({ type: 'videoReady' }) },
  });
  expect(await screen.findByText(/Bạn hiện không có quyền xem/)).toBeTruthy();
  expect(screen.queryByTestId('material-viewer')).toBeNull();
});

it('does not fetch material data when the student session is unavailable', async () => {
  useStore.setState({ sessionUser: null });
  renderWithProviders(
    <MaterialReader
      classId={material.classId}
      materialId={material.id}
    />
  );
  expect(
    await screen.findByText('Đăng nhập với tài khoản học viên để xem tài liệu.')
  ).toBeTruthy();
});

it('keeps the shared auth cookies when the viewer opens', async () => {
  mockServer.use(
    http.get(detailPath, () =>
      HttpResponse.json({ ...material, contentType: 'VIDEO' })
    )
  );
  renderWithProviders(
    <MaterialReader
      classId={material.classId}
      materialId={material.id}
    />
  );
  const webView = await screen.findByTestId('mock-webview');
  // Android incognito clears the CookieManager shared with the app's HTTP client.
  expect(webView.props.incognito).toBeFalsy();
  expect(webView.props.cacheEnabled).toBe(false);
  expect(webView.props.thirdPartyCookiesEnabled).toBe(false);
  expect(webView.props.domStorageEnabled).toBe(false);
});

it('unmounts the player when leaving the screen', async () => {
  mockServer.use(
    http.get(detailPath, () =>
      HttpResponse.json({ ...material, contentType: 'VIDEO' })
    )
  );
  const view = renderWithProviders(
    <MaterialReader
      classId={material.classId}
      materialId={material.id}
    />
  );
  await screen.findByTestId('material-viewer');
  mockFocused = false;
  view.rerender(
    <MaterialReader
      classId={material.classId}
      materialId={material.id}
    />
  );
  expect(screen.queryByTestId('material-viewer')).toBeNull();
});

it('renews video access only once after a storage error and restores the seek time', async () => {
  const resolve = jest.fn().mockResolvedValue('https://storage.test/video');
  const error = jest.fn();
  renderWithProviders(
    <MaterialViewer
      material={{ ...material, contentType: 'VIDEO' }}
      resolve={resolve}
      onError={error}
    />
  );
  const message = async (type: string, time = 0) => {
    await act(async () =>
      fireEvent(screen.getByTestId('mock-webview'), 'message', {
        nativeEvent: { data: JSON.stringify({ type, time }) },
      })
    );
  };
  await message('videoReady');
  await message('videoError', 23);
  expect(mockInject).toHaveBeenLastCalledWith(
    'window.resolveVideo("https://storage.test/video",23);true;'
  );
  await message('videoError', 23);
  expect(resolve).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(1);
});

it('loads only inline images requested by the visible article and rejects unknown IDs', async () => {
  const resolve = jest.fn().mockResolvedValue('https://storage.test/image');
  renderWithProviders(
    <View>
      <MaterialViewer
        material={{
          ...material,
          contentType: 'ARTICLE',
          inlineImages: [materialFile],
        }}
        resolve={resolve}
        onError={jest.fn()}
      />
    </View>
  );
  expect(resolve).not.toHaveBeenCalled();
  await act(async () =>
    fireEvent(screen.getByTestId('mock-webview'), 'message', {
      nativeEvent: {
        data: JSON.stringify({ type: 'image', fileId: commerceId(899) }),
      },
    })
  );
  expect(resolve).not.toHaveBeenCalled();
  await act(async () =>
    fireEvent(screen.getByTestId('mock-webview'), 'message', {
      nativeEvent: {
        data: JSON.stringify({ type: 'image', fileId: materialFile.id }),
      },
    })
  );
  expect(resolve).toHaveBeenCalledWith(materialFile.id);
});
