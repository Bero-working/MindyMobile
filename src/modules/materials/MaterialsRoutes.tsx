import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Text, View } from 'react-native';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  useIsFocused,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import routes from '@/navigation/routes';
import type { NavigationProp, RootStackParamList } from '@/navigation/types';
import { Button } from '@/components/ui/Button';
import { ScreenState } from '@/components/common/ScreenState';
import { LearningLayout } from '@/modules/my-classes/components/LearningLayout';
import {
  privateQueryOptions,
  useCancelInactive,
} from '@/modules/my-classes/hooks/useLearningQuery';
import { learningQueryKeys } from '@/modules/my-classes/hooks/learningQueryKeys';
import { scopeKey, useStudentScope } from '@/shared/hooks/useStudentScope';
import { ApiError } from '@/shared/utilities/apiError';
import { materialsService, type MaterialDetail } from './materials.service';
import { MaterialViewer } from './MaterialViewer';
import { MaterialCard } from './MaterialCard';

const validIds = (...ids: string[]) =>
  ids.every((id) => z.string().uuid().safeParse(id).success);
function useMaterialsScope() {
  const scope = useStudentScope();
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active'
  );
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) =>
      setForeground(state === 'active')
    );
    return () => listener.remove();
  }, []);
  return {
    scope,
    enabled: scope.enabled && focused && foreground,
    key: ['student-materials', ...scopeKey(scope)],
  };
}
function useMaterialErrors(classId: string, error: Error | null) {
  const scope = useStudentScope();
  const key = ['student-materials', ...scopeKey(scope)];
  const client = useQueryClient();
  useEffect(() => {
    if (!(error instanceof ApiError)) return;
    if (
      [
        'MATERIAL_ACCESS_DENIED',
        'CLASS_UNIT_NOT_FOUND',
        'CLASS_NOT_FOUND',
      ].includes(error.code)
    ) {
      client
        .invalidateQueries({ queryKey: learningQueryKeys.root(scope) })
        .catch(() => {});
    }
    if (error.code === 'MATERIAL_NOT_FOUND') {
      client
        .invalidateQueries({ queryKey: [...key, classId, 'list'] })
        .catch(() => {});
    }
    // Keys contain primitives; do not repeat invalidations on each render.
  }, [client, error, classId, scope.userId, scope.generation]);
}
function MaterialError({
  error,
  retry,
}: {
  error: Error | null;
  retry?: () => void;
}) {
  const { t } = useTranslation();
  const code = error instanceof ApiError ? error.code : '';
  const messages: Record<string, string> = {
    MATERIAL_ACCESS_DENIED: t('materials.errors.MATERIAL_ACCESS_DENIED'),
    CLASS_UNIT_NOT_FOUND: t('materials.errors.CLASS_UNIT_NOT_FOUND'),
    CLASS_NOT_FOUND: t('materials.errors.CLASS_NOT_FOUND'),
    MATERIAL_NOT_FOUND: t('materials.errors.MATERIAL_NOT_FOUND'),
    FILE_NOT_READY: t('materials.errors.FILE_NOT_READY'),
    FILE_STORAGE_DISABLED: t('materials.errors.FILE_STORAGE_DISABLED'),
    FILE_STORAGE_UNAVAILABLE: t('materials.errors.FILE_STORAGE_UNAVAILABLE'),
    MATERIAL_REVISION_CHANGED: t('materials.errors.MATERIAL_REVISION_CHANGED'),
    APP_ORIGIN_REQUIRED: t('materials.errors.APP_ORIGIN_REQUIRED'),
  };
  const message = messages[code] ?? t('materials.errorDescription');
  return (
    <ScreenState
      title={t('materials.error')}
      description={message}
      onRetry={retry}
    />
  );
}

export function MaterialsRoute() {
  const { params } =
    useRoute<RouteProp<RootStackParamList, routes.studentMaterials>>();
  const scope = useStudentScope();
  return (
    <MaterialsList
      key={`${scope.userId}:${scope.generation}:${params.classId}:${params.unitId}`}
      {...params}
    />
  );
}
export function MaterialsList({
  classId,
  unitId,
  unitTitle,
}: {
  classId: string;
  unitId: string;
  unitTitle: string;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { scope, enabled, key } = useMaterialsScope();
  const valid = validIds(classId, unitId);
  const queryKey = [...key, classId, 'list', unitId];
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      materialsService.list(classId, unitId, pageParam, signal),
    getNextPageParam: (last, pages) =>
      pages.reduce((n, page) => n + page.items.length, 0) < last.total
        ? last.page + 1
        : undefined,
    enabled: enabled && valid,
    ...privateQueryOptions,
  });
  useCancelInactive(enabled, queryKey);
  useMaterialErrors(classId, query.error);
  const items = [
    ...new Map(
      query.data?.pages
        .flatMap((page) => page.items)
        .map((item) => [item.id, item]) ?? []
    ).values(),
  ];
  const total = query.data?.pages[0]?.total ?? 0;
  const refresh = () => {
    query.refetch().catch(() => {});
  };
  return (
    <LearningLayout
      prefix="materials"
      title={t('materials.title')}
      onBack={() => navigation.goBack()}
      onRefresh={enabled && valid ? refresh : undefined}
      refreshing={query.isRefetching}
    >
      <View className="gap-[2px]">
        <Text
          accessibilityRole="header"
          className="font-nunito-extrabold text-[20px] leading-[26px] text-forest"
        >
          {unitTitle}
        </Text>
        {!!total && (
          <Text className="font-nunito-semibold text-[13px] text-muted">
            {t('materials.count', { count: total })}
          </Text>
        )}
      </View>
      {!scope.enabled ? (
        <ScreenState
          title={t('materials.title')}
          description={t('materials.authRequired')}
        />
      ) : !valid ? (
        <MaterialError error={null} />
      ) : !enabled || query.isPending ? (
        <ActivityIndicator />
      ) : query.isError && !query.isFetchNextPageError ? (
        <MaterialError
          error={query.error}
          retry={refresh}
        />
      ) : (
        <>
          {!items.length && (
            <ScreenState
              title={t('materials.empty')}
              description={t('materials.emptyDescription')}
            />
          )}
          {items.map((item) => (
            <MaterialCard
              key={item.id}
              item={item}
              onPress={() =>
                navigation.navigate(routes.studentMaterial, {
                  classId,
                  materialId: item.id,
                })
              }
            />
          ))}
          {query.isFetchNextPageError && <MaterialError error={query.error} />}
          {query.hasNextPage && (
            <Button
              label={t(
                query.isFetchNextPageError
                  ? 'common.retry'
                  : 'materials.loadMore'
              )}
              loading={query.isFetchingNextPage}
              onPress={() => {
                if (!query.isFetching) query.fetchNextPage().catch(() => {});
              }}
            />
          )}
        </>
      )}
    </LearningLayout>
  );
}

export function MaterialRoute() {
  const { params } =
    useRoute<RouteProp<RootStackParamList, routes.studentMaterial>>();
  const scope = useStudentScope();
  return (
    <MaterialReader
      key={`${scope.userId}:${scope.generation}:${params.classId}:${params.materialId}`}
      {...params}
    />
  );
}
export function MaterialReader({
  classId,
  materialId,
}: {
  classId: string;
  materialId: string;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const client = useQueryClient();
  const { scope, enabled, key } = useMaterialsScope();
  const valid = validIds(classId, materialId);
  const queryKey = [...key, classId, 'detail', materialId];
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      materialsService.detail(classId, materialId, signal),
    enabled: enabled && valid,
    ...privateQueryOptions,
  });
  useCancelInactive(enabled, queryKey);
  const [actionError, setActionError] = useState<Error | null>(null);
  const [busy, setBusy] = useState(false);
  const [viewerVersion, setViewerVersion] = useState(0);
  const alive = useRef(enabled);
  alive.current = enabled;
  const controllers = useRef(new Set<AbortController>());
  const opening = useRef(false);
  useEffect(() => {
    const pending = controllers.current;
    return () => {
      pending.forEach((controller) => controller.abort());
      pending.clear();
    };
  }, [enabled]);
  useEffect(
    () => () => {
      alive.current = false;
    },
    []
  );
  useMaterialErrors(classId, actionError ?? query.error);
  const material = query.data;
  const refresh = () => {
    setActionError(null);
    setViewerVersion((value) => value + 1);
    query.refetch().catch(() => {});
  };
  const resolve = async (current: MaterialDetail, fileId?: string) => {
    if (!alive.current || query.isError) return null;
    const controller = new AbortController();
    controllers.current.add(controller);
    try {
      const access = fileId
        ? await materialsService.access(
            classId,
            current,
            fileId,
            controller.signal
          )
        : await materialsService.download(classId, current, controller.signal);
      return !controller.signal.aborted && alive.current ? access.url : null;
    } catch (error) {
      if (controller.signal.aborted || !alive.current) return null;
      setActionError(
        error instanceof Error ? error : new Error('File unavailable')
      );
      if (
        error instanceof ApiError &&
        ['MATERIAL_REVISION_CHANGED', 'FILE_NOT_READY'].includes(error.code)
      ) {
        client.invalidateQueries({ queryKey }).catch(() => {});
      }
      return null;
    } finally {
      controllers.current.delete(controller);
    }
  };
  const open = async (current: MaterialDetail, fileId?: string) => {
    if (opening.current || !alive.current) return;
    opening.current = true;
    setBusy(true);
    setActionError(null);
    try {
      const url = await resolve(current, fileId);
      if (url && alive.current) await Linking.openURL(url);
    } catch (error) {
      if (alive.current)
        setActionError(
          error instanceof Error ? error : new Error('File unavailable')
        );
    } finally {
      opening.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const denied =
    actionError instanceof ApiError &&
    [
      'MATERIAL_ACCESS_DENIED',
      'CLASS_NOT_FOUND',
      'CLASS_UNIT_NOT_FOUND',
      'MATERIAL_NOT_FOUND',
      'MATERIAL_REVISION_CHANGED',
      'FILE_NOT_READY',
    ].includes(actionError.code);
  return (
    <LearningLayout
      prefix="material"
      title={t('materials.title')}
      onBack={() => navigation.goBack()}
    >
      {!scope.enabled ? (
        <ScreenState
          title={t('materials.title')}
          description={t('materials.authRequired')}
        />
      ) : !valid ? (
        <MaterialError error={null} />
      ) : !enabled || query.isPending ? (
        <ActivityIndicator />
      ) : query.isError ? (
        <MaterialError
          error={query.error}
          retry={refresh}
        />
      ) : (
        material && (
          <>
            <Text
              accessibilityRole="header"
              className="font-nunito-extrabold text-[22px] text-forest"
            >
              {material.title}
            </Text>
            {!!material.description && (
              <Text className="font-nunito text-[14px] text-muted">
                {material.description}
              </Text>
            )}
            {!!actionError && (
              <MaterialError
                error={actionError}
                retry={refresh}
              />
            )}
            {!denied && (
              <>
                {(material.contentType === 'ARTICLE' ||
                  material.contentType === 'VIDEO') && (
                  <MaterialViewer
                    key={`${material.id}:${material.revision}:${viewerVersion}`}
                    material={material}
                    resolve={(fileId) => resolve(material, fileId)}
                    onError={() =>
                      setActionError(new Error('Viewer unavailable'))
                    }
                  />
                )}
                {material.file && (
                  <Button
                    testID="material-download"
                    label={t('materials.openFile', {
                      name: material.file.originalFilename,
                    })}
                    loading={busy}
                    onPress={() => {
                      open(material).catch(() => {});
                    }}
                  />
                )}
                {!!material.attachments.length && (
                  <Text
                    accessibilityRole="header"
                    className="font-nunito-bold text-[17px] text-forest"
                  >
                    {t('materials.attachments')}
                  </Text>
                )}
                {material.attachments.map((file) => (
                  <Button
                    key={file.id}
                    testID={`material-attachment-${file.id}`}
                    label={file.originalFilename}
                    variant="outline"
                    disabled={busy}
                    onPress={() => {
                      open(material, file.id).catch(() => {});
                    }}
                  />
                ))}
              </>
            )}
          </>
        )
      )}
    </LearningLayout>
  );
}
