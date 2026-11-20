import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { z } from 'zod';
import type { MaterialDetail } from './materials.service';
import { materialHtml, scriptValue } from './materialHtml';

const styles = StyleSheet.create({ viewer: { height: 460 } });
const messageSchema = z.object({
  type: z.enum(['image', 'imageError', 'videoReady', 'videoError']),
  fileId: z.string().uuid().optional(),
  time: z.number().finite().nonnegative().optional(),
});
export function MaterialViewer({
  material,
  resolve,
  onError,
}: {
  material: MaterialDetail;
  resolve: (fileId?: string) => Promise<string | null>;
  onError: () => void;
}) {
  const web = useRef<WebView>(null);
  const attempts = useRef(new Map<string, number>());
  const pending = useRef(new Set<string>());
  const source = useMemo(
    () => ({
      html: materialHtml(
        material.contentHtml,
        material.contentType === 'VIDEO'
      ),
    }),
    [material.contentHtml, material.contentType]
  );
  const load = async (key: string, fileId?: string, time = 0) => {
    if (pending.current.has(key)) return;
    const count = attempts.current.get(key) ?? 0;
    if (count >= 2) {
      onError();
      return;
    }
    attempts.current.set(key, count + 1);
    pending.current.add(key);
    try {
      const url = await resolve(fileId);
      if (url)
        web.current?.injectJavaScript(
          fileId
            ? `window.resolveImage(${scriptValue(fileId)},${scriptValue(url)});true;`
            : `window.resolveVideo(${scriptValue(url)},${time});true;`
        );
    } finally {
      pending.current.delete(key);
    }
  };
  return (
    <View
      style={styles.viewer}
      testID="material-viewer"
    >
      <WebView
        ref={web}
        source={source}
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={(request) =>
          request.url === 'about:blank'
        }
        javaScriptEnabled
        // Do not use `incognito`: on Android it clears the shared CookieManager,
        // wiping the app's HttpOnly auth cookies and signing the student out.
        cacheEnabled={false}
        sharedCookiesEnabled={false}
        thirdPartyCookiesEnabled={false}
        domStorageEnabled={false}
        allowFileAccess={false}
        allowFileAccessFromFileURLs={false}
        allowUniversalAccessFromFileURLs={false}
        mixedContentMode="never"
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction
        onError={onError}
        onMessage={(event) => {
          try {
            const parsed = messageSchema.safeParse(
              JSON.parse(event.nativeEvent.data)
            );
            if (!parsed.success) return;
            const { type, fileId, time } = parsed.data;
            if (
              (type === 'image' || type === 'imageError') &&
              typeof fileId === 'string' &&
              material.inlineImages.some((file) => file.id === fileId)
            ) {
              load(fileId, fileId).catch(onError);
            } else if (
              material.contentType === 'VIDEO' &&
              (type === 'videoReady' || type === 'videoError')
            ) {
              load('video', undefined, time ?? 0).catch(onError);
            }
          } catch {
            /* Ignore messages outside the viewer protocol. */
          }
        }}
      />
    </View>
  );
}
