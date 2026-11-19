import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon, type IconName } from '@/components/common/Icon';
import { ScreenState } from '@/components/common/ScreenState';
import { useStudentScope, scopeKey } from '@/shared/hooks/useStudentScope';
import { env } from '@/config/env';
import { colors } from '@/theme/colors';
import {
  privateQueryOptions,
  useCancelInactive,
} from '../my-classes/hooks/useLearningQuery';
import { BoardCanvas, type Tool, type Viewport } from './Canvas';
import {
  BoardConnection,
  boardSocket,
  type ConnectionState,
} from './connection';
import { whiteboardService as api } from './service';
import { putShape, moveShape } from './document';
import { fitPresenter, fitShapes } from './viewport';

const initial: ConnectionState = {
  status: 'connecting',
  shapes: [],
  people: [],
  cursors: [],
};
const tools = ['hand', 'pen', 'rectangle', 'ellipse', 'eraser'] as const;
const toolIcons: Record<(typeof tools)[number], IconName> = {
  hand: 'hand',
  pen: 'pen',
  rectangle: 'square',
  ellipse: 'circle',
  eraser: 'eraser',
};
// Fixed class strings per status (no dynamic variable-setting classes).
const statusDot: Record<ConnectionState['status'], string> = {
  connecting: 'bg-status-yellow',
  ready: 'bg-status-green',
  saving: 'bg-status-yellow',
  offline: 'bg-status-red',
  revoked: 'bg-status-red',
};

export function WhiteboardScreen({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const scope = useStudentScope();
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active'
  );
  const [live, setLive] = useState<ConnectionState>(initial);
  const [follow, setFollow] = useState(true);
  const [tool, setTool] = useState<Tool>('hand');
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [size, setSize] = useState({ width: 320, height: 480 });
  const connection = useRef<BoardConnection | undefined>(undefined);
  const enabled = scope.enabled && foreground;
  const key = ['whiteboard', ...scopeKey(scope), sessionId];
  const context = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => api.context(sessionId, signal),
    enabled,
    ...privateQueryOptions,
    refetchInterval: (query) =>
      query.state.data?.board === null ? 5000 : false,
  });
  useCancelInactive(enabled, key);
  const boardId = context.isError ? undefined : context.data?.board?.id;
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') connection.current?.reconnect();
      else connection.current?.pause();
      setForeground(state === 'active');
    });
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    setLive(initial);
    if (
      !scope.enabled ||
      !boardId ||
      !context.data?.capabilities.canView ||
      !env.APP_ORIGIN
    )
      return;
    const next = new BoardConnection(
      boardSocket(env.API_URL, env.APP_ORIGIN),
      boardId,
      setLive,
      async () => {
        await api.context(sessionId);
        return true;
      }
    );
    connection.current = next;
    next.start();
    return () => {
      next.close();
      connection.current = undefined;
    };
  }, [scope.enabled, boardId, scope.userId, scope.generation]);
  const leave = useCallback(() => {
    if (connection.current?.hasPending) {
      Alert.alert(t('whiteboard.unsavedTitle'), t('whiteboard.unsaved'), [
        { text: t('whiteboard.stay'), style: 'cancel' },
        { text: t('whiteboard.leave'), style: 'destructive', onPress: onClose },
      ]);
    } else onClose();
  }, [onClose, t]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        leave();
        return true;
      }
    );
    return () => subscription.remove();
  }, [leave]);
  const ready = enabled && live.status === 'ready';
  const editable = ready && !!live.sync?.capabilities.canEdit && !follow;
  // Mentor chưa chia sẻ vùng nhìn: tự căn để thấy toàn bộ nội dung bảng.
  const fitted = fitShapes(live.shapes, size);
  // Theo mentor: dựng lại camera từ FOV mới nhất mỗi lần socket gửi board:viewport.
  const camera = follow
    ? live.presenterView
      ? fitPresenter(live.presenterView, size)
      : (fitted ?? viewport)
    : viewport;
  const retry = () => {
    context.refetch().catch(() => {});
    connection.current?.reconnect();
  };
  const error = context.error as
    | (Error & { code?: string; status?: number })
    | null;
  const denied =
    !scope.enabled ||
    live.status === 'revoked' ||
    error?.status === 403 ||
    error?.status === 401;
  const zoomBy = (direction: -1 | 1) => {
    const zoom = Math.max(
      0.05,
      Math.min(8, camera.zoom * (direction < 0 ? 0.8 : 1.25))
    );
    setFollow(false);
    setViewport({
      x: camera.x + size.width / (2 * camera.zoom) - size.width / (2 * zoom),
      y: camera.y + size.height / (2 * camera.zoom) - size.height / (2 * zoom),
      zoom,
    });
  };
  const visibleTools = tools.filter(
    (item) => item === 'hand' || !!live.sync?.capabilities.canEdit
  );
  const caption = t(
    follow
      ? live.presenter
        ? 'whiteboard.presenter'
        : live.presenterView
          ? 'whiteboard.presenterPaused'
          : 'whiteboard.waitingPresenter'
      : 'whiteboard.freeView',
    { name: live.presenterView?.identity.name }
  );
  return (
    <SafeAreaView
      testID="whiteboard-screen"
      edges={['top', 'right', 'bottom', 'left']}
      className="flex-1 bg-cover-a-soft"
    >
      <View className="flex-row items-center gap-[10px] px-[16px] pb-[12px] pt-[8px]">
        <PressableScale
          testID="whiteboard-back"
          accessibilityRole="button"
          accessibilityLabel={t('learning.back')}
          onPress={leave}
          className="h-[44px] w-[44px] items-center justify-center rounded-full bg-canvas"
        >
          <Icon
            name="back"
            size={18}
          />
        </PressableScale>
        <View className="min-w-[0px] flex-1">
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            className="font-nunito-extrabold text-[17px] text-black"
          >
            {t('whiteboard.title')}
          </Text>
          {!!context.data?.context.sessionTitle && (
            <Text
              numberOfLines={1}
              className="font-nunito text-[12px] text-muted"
            >
              {context.data.context.sessionTitle}
            </Text>
          )}
        </View>
        <View
          accessibilityLiveRegion="polite"
          className="flex-row items-center gap-[6px] rounded-full bg-canvas px-[10px] py-[6px]"
        >
          <View
            className={`h-[8px] w-[8px] rounded-full ${statusDot[live.status]}`}
          />
          <Text
            testID="whiteboard-status"
            className="font-nunito-bold text-[11px] text-forest"
          >
            {t(`whiteboard.status.${live.status}`)}
          </Text>
        </View>
      </View>
      <View className="min-h-[0px] flex-1 overflow-hidden rounded-t-[28px] bg-canvas">
        {denied || context.isError ? (
          <ScreenState
            title={t('whiteboard.title')}
            description={t(
              denied
                ? 'whiteboard.denied'
                : error?.code === 'BOARD_DISABLED'
                  ? 'whiteboard.disabled'
                  : 'whiteboard.loadError'
            )}
            onRetry={denied ? undefined : retry}
          />
        ) : context.isPending || !foreground ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              accessibilityLabel={t('whiteboard.loading')}
              color={colors.forest}
            />
          </View>
        ) : !context.data.board ? (
          <ScreenState
            title={t('whiteboard.title')}
            description={t('whiteboard.notCreated')}
            onRetry={retry}
          />
        ) : !env.APP_ORIGIN ? (
          <ScreenState
            title={t('whiteboard.title')}
            description={t('whiteboard.notConfigured')}
          />
        ) : (
          <>
            <View
              testID="whiteboard-presenter-controls"
              className="shrink-0 items-center gap-[6px] px-[16px] py-[8px]"
            >
              <PressableScale
                testID="whiteboard-follow"
                accessibilityRole="button"
                accessibilityLabel={t(
                  follow ? 'whiteboard.following' : 'whiteboard.follow'
                )}
                accessibilityHint={caption}
                accessibilityState={{ selected: follow }}
                onPress={() => {
                  setViewport(camera);
                  setFollow((value) => !value);
                  setTool('hand');
                }}
                className={`min-h-[40px] flex-row items-center gap-[8px] rounded-full border px-[16px] shadow-lg shadow-forest/20 ${follow ? 'border-mint bg-mint' : 'border-line bg-canvas'}`}
              >
                <Icon
                  name="eye"
                  size={16}
                  color={follow ? colors.canvas : colors.forest}
                />
                <Text
                  className={`font-nunito-bold text-[13px] ${follow ? 'text-canvas' : 'text-forest'}`}
                >
                  {t(follow ? 'whiteboard.following' : 'whiteboard.follow')}
                </Text>
              </PressableScale>
              <Text
                accessibilityLiveRegion="polite"
                className="rounded-full bg-canvas px-[10px] py-[4px] text-center font-nunito text-[11px] text-muted"
              >
                {caption}
              </Text>
              {live.notice && (
                <Text
                  accessibilityRole="alert"
                  className="rounded-[12px] bg-canvas px-[12px] py-[6px] text-center font-nunito text-[12px] text-headsup"
                >
                  {t(`whiteboard.notice.${live.notice}`)}
                </Text>
              )}
              {live.status === 'offline' && (
                <Button
                  label={t('common.retry')}
                  onPress={retry}
                />
              )}
            </View>
            <BoardCanvas
              key={live.sync?.board.epoch ?? context.data.board.epoch}
              boardId={context.data.board.id}
              shapes={live.shapes}
              editable={editable}
              tool={tool}
              color={colors.forest}
              viewport={camera}
              cursors={live.cursors}
              onPointer={(x, y) => connection.current?.awareness(x, y)}
              onViewport={(value) => {
                setFollow(false);
                setViewport(value);
              }}
              onLayout={(width, height) => {
                if (width > 0 && height > 0) setSize({ width, height });
              }}
              onAdd={(shape) => {
                connection.current?.edit((doc) => putShape(doc, shape));
              }}
              onMove={(id, x, y) => {
                connection.current?.edit((doc) => moveShape(doc, id, x, y));
              }}
              onDelete={(id) => {
                connection.current?.edit((doc) =>
                  doc.getMap('shapes').delete(id)
                );
              }}
              onText={() => {}}
            />
            <View
              testID="whiteboard-toolbar"
              className="shrink-0 items-center px-[12px] py-[8px]"
            >
              <View className="max-w-full flex-row flex-wrap items-center justify-center gap-[4px] rounded-[28px] border border-line bg-canvas p-[6px] shadow-lg shadow-forest/20">
                {visibleTools.map((item) => {
                  const active = tool === item && !follow;
                  return (
                    <PressableScale
                      key={item}
                      testID={`whiteboard-tool-${item}`}
                      accessibilityRole="button"
                      accessibilityLabel={t(`whiteboard.tools.${item}`)}
                      accessibilityState={{
                        selected: active,
                        disabled: !ready,
                      }}
                      disabled={!ready}
                      className={`h-[42px] w-[42px] items-center justify-center rounded-full ${active ? 'bg-mint' : 'bg-canvas'} ${ready ? 'opacity-100' : 'opacity-40'}`}
                      onPress={() => {
                        setViewport(camera);
                        setFollow(false);
                        setTool(item);
                      }}
                    >
                      <Icon
                        name={toolIcons[item]}
                        size={20}
                        color={active ? colors.canvas : colors.forest}
                      />
                    </PressableScale>
                  );
                })}
                <View className="mx-[4px] h-[24px] w-[1px] bg-line" />
                <PressableScale
                  testID="whiteboard-fit"
                  accessibilityRole="button"
                  accessibilityLabel={t('whiteboard.fit')}
                  accessibilityState={{ disabled: !fitted }}
                  disabled={!fitted}
                  onPress={() => {
                    if (!fitted) return;
                    setFollow(false);
                    setViewport(fitted);
                  }}
                  className={`h-[42px] w-[42px] items-center justify-center rounded-full ${fitted ? 'opacity-100' : 'opacity-40'}`}
                >
                  <Icon
                    name="expand"
                    size={20}
                    color={colors.forest}
                  />
                </PressableScale>
                {([-1, 1] as const).map((direction) => (
                  <PressableScale
                    key={direction}
                    testID={
                      direction < 0
                        ? 'whiteboard-zoom-out'
                        : 'whiteboard-zoom-in'
                    }
                    accessibilityRole="button"
                    accessibilityLabel={t(
                      direction < 0 ? 'whiteboard.zoomOut' : 'whiteboard.zoomIn'
                    )}
                    onPress={() => zoomBy(direction)}
                    className="h-[42px] w-[42px] items-center justify-center rounded-full"
                  >
                    <Icon
                      name={direction < 0 ? 'minus' : 'plus'}
                      size={20}
                      color={colors.forest}
                    />
                  </PressableScale>
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
