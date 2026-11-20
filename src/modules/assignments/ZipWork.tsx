/* eslint react-native/no-raw-text: ["error", { "skip": ["WorkText"] }] */
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import {
  pick,
  keepLocalCopy,
  isErrorWithCode,
  errorCodes,
  types,
} from '@react-native-documents/picker';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { privateQueryOptions } from '@/modules/my-classes/hooks/useLearningQuery';
import type { Assignment } from './assignments.service';
import {
  uploadZipBytes,
  workService,
  type Upload,
  type ZipSubmission,
} from './work.service';
import {
  useWorkAction,
  useWorkScope,
  WorkError,
  WorkLoading,
  WorkText,
} from './workUi';

export const MAX_ZIP_BYTES = 20 * 1024 * 1024;
export function validZip(name: string | null, size: number | null) {
  return (
    !!name &&
    /\.zip$/i.test(name) &&
    size !== null &&
    size > 0 &&
    size <= MAX_ZIP_BYTES
  );
}

export function ZipWork({
  assignment,
  onDirty,
}: {
  assignment: Assignment;
  onDirty: (dirty: boolean) => void;
}) {
  const { t } = useTranslation();
  const { key, enabled } = useWorkScope(assignment.id);
  const action = useWorkAction();
  const [draft, setDraft] = useState<ZipSubmission | null>(null);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [picking, setPicking] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const history = useQuery({
    queryKey: [...key, 'history'],
    queryFn: ({ signal }) => workService.history(assignment.id, signal),
    enabled,
    ...privateQueryOptions,
  });
  const file = useQuery({
    queryKey: [...key, 'file', upload?.fileId],
    queryFn: ({ signal }) =>
      workService.fileStatus(upload?.fileId ?? '', signal),
    enabled: enabled && !!upload,
    ...privateQueryOptions,
    refetchInterval: (q) =>
      !q.state.data ||
      ['PENDING_UPLOAD', 'PROCESSING'].includes(q.state.data.status)
        ? 2000
        : false,
  });
  const mutations =
    assignment.status === 'PUBLISHED' &&
    assignment.capabilities?.zipMutationsEnabled === true;
  const processing =
    !!upload &&
    (!file.data ||
      ['PENDING_UPLOAD', 'PROCESSING', 'READY'].includes(file.data.status)) &&
    draft?.file?.id !== upload.fileId;
  const blocked =
    !enabled || !mutations || action.busy || action.unresolved || picking;
  useEffect(() => {
    onDirty(action.busy || action.unresolved || picking || processing);
  }, [action.busy, action.unresolved, picking, processing]);
  useEffect(() => {
    if (
      blocked ||
      !draft ||
      draft.status !== 'DRAFT' ||
      !upload ||
      file.data?.status !== 'READY' ||
      draft.file?.id === upload.fileId
    )
      return;
    const currentDraft = draft;
    const fileId = upload.fileId;
    action.run(async (receipt) => {
      const updated = await workService.attachZip(
        currentDraft,
        fileId,
        receipt
      );
      setDraft(updated);
      setUpload(null);
    });
  }, [blocked, draft, upload, file.data?.status]);
  const selectFile = async () => {
    if (blocked || !draft || draft.status !== 'DRAFT' || processing) return;
    setPicking(true);
    setPickError(null);
    try {
      const [selected] = await pick({
        type: [types.zip],
        allowMultiSelection: false,
      });
      if (!validZip(selected.name, selected.size)) {
        setPickError(t('assignmentWork.invalidZip'));
        return;
      }
      const name = selected.name ?? 'assignment.zip';
      const size = selected.size ?? 0;
      const [copy] = await keepLocalCopy({
        files: [{ uri: selected.uri, fileName: name }],
        destination: 'cachesDirectory',
      });
      if (copy.status !== 'success') throw new Error('Could not copy file');
      // Retain each successful step on retry. Never create a second upload after a lost response.
      let intent: Upload | null = null;
      let uploaded = false;
      action.run(async (receipt) => {
        if (!intent)
          intent = await workService.uploadIntent(draft, name, size, receipt);
        if (!uploaded) {
          await uploadZipBytes(intent, copy.localUri);
          uploaded = true;
        }
        await workService.completeFile(intent, receipt);
        setUpload(intent);
      });
    } catch (failure) {
      if (
        !isErrorWithCode(failure) ||
        failure.code !== errorCodes.OPERATION_CANCELED
      )
        setPickError(t('assignmentWork.pickError'));
    } finally {
      setPicking(false);
    }
  };
  const rows =
    history.data?.items.filter(
      (item): item is ZipSubmission => !('type' in item) || item.type !== 'QUIZ'
    ) ?? [];
  return (
    <View className="gap-[16px]">
      <WorkError
        message={
          action.error ??
          pickError ??
          (history.isError || file.isError
            ? t('assignmentWork.loadError')
            : null)
        }
        retry={
          action.unresolved
            ? action.retry
            : () => {
                action.clearError();
                setPickError(null);
                if (draft)
                  workService
                    .zip(draft.id)
                    .then(setDraft)
                    .catch(() => {});
                history.refetch().catch(() => {});
                if (upload) file.refetch().catch(() => {});
              }
        }
      />
      {!mutations && <WorkText>{t('assignmentWork.zipUnavailable')}</WorkText>}
      {(!draft || draft.status !== 'DRAFT') && (
        <Button
          testID="zip-start"
          label={t('assignmentWork.startZip')}
          variant="solid"
          loading={action.busy}
          disabled={blocked}
          onPress={() =>
            action.run(async (receipt) => {
              setDraft(
                await workService.zipDraft(
                  assignment.id,
                  assignment.revision,
                  receipt
                )
              );
            })
          }
        />
      )}
      {draft && (
        <View className="gap-[12px] rounded-[18px] border border-line bg-soft p-[16px]">
          <WorkText heading>
            {t(`assignmentWork.zipStatus.${draft.status}`)}
          </WorkText>
          {draft.file && (
            <WorkText>
              {draft.file.originalFilename} ·{' '}
              {(draft.file.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </WorkText>
          )}
          {draft.status === 'DRAFT' && (
            <>
              <WorkText>{t('assignmentWork.zipHint')}</WorkText>
              {processing && (
                <>
                  <WorkLoading />
                  <WorkText>{t('assignmentWork.processingFile')}</WorkText>
                </>
              )}
              {file.data &&
                ['FAILED', 'DELETED', 'DELETING'].includes(
                  file.data.status
                ) && <WorkError message={t('assignmentWork.fileFailed')} />}
              <Button
                testID="zip-pick"
                label={t(
                  draft.file
                    ? 'assignmentWork.replaceZip'
                    : 'assignmentWork.pickZip'
                )}
                variant="outline"
                loading={picking || action.busy}
                disabled={blocked || processing}
                onPress={() => {
                  selectFile().catch(() => {});
                }}
              />
              <Button
                testID="zip-submit"
                label={t('assignmentWork.submit')}
                variant="solid"
                disabled={blocked || processing || !draft.file}
                onPress={() => {
                  const snapshot = draft;
                  Alert.alert(
                    t('assignmentWork.confirmSubmit'),
                    t('assignmentWork.confirmZip'),
                    [
                      { text: t('assignmentWork.cancel'), style: 'cancel' },
                      {
                        text: t('assignmentWork.submit'),
                        onPress: () =>
                          action.run(async (receipt) => {
                            setDraft(
                              await workService.submitZip(snapshot, receipt)
                            );
                            history.refetch().catch(() => {});
                          }),
                      },
                    ]
                  );
                }}
              />
            </>
          )}
          {draft.status !== 'DRAFT' && (
            <WorkText>{t('assignmentWork.submitted')}</WorkText>
          )}
        </View>
      )}
      {history.isPending && <WorkLoading />}
      {!!rows.length && (
        <WorkText heading>{t('assignmentWork.history')}</WorkText>
      )}
      {rows.map((item, index) => (
        <View
          key={item.id}
          className="gap-[8px] rounded-[18px] bg-cover-a-soft p-[16px]"
        >
          <WorkText heading>
            {t('assignmentWork.submissionNumber', {
              number: item.attemptNumber ?? rows.length - index,
            })}
          </WorkText>
          <WorkText>{item.file?.originalFilename}</WorkText>
          <WorkText>{t(`assignmentWork.zipStatus.${item.status}`)}</WorkText>
          {item.grade ? (
            <>
              <WorkText heading>
                {t('assignmentWork.resultScore', {
                  score: item.grade.score,
                  max: item.snapshot?.maxScore ?? assignment.maxScore,
                })}
              </WorkText>
              <WorkText>{item.grade.feedback}</WorkText>
            </>
          ) : (
            <WorkText>{t('assignmentWork.waitingGrade')}</WorkText>
          )}
        </View>
      ))}
      <Button
        label={t('assignmentWork.refreshResults')}
        variant="outline"
        disabled={!enabled || action.busy || action.unresolved}
        onPress={() => {
          history.refetch().catch(() => {});
          if (draft)
            workService
              .zip(draft.id)
              .then(setDraft)
              .catch(() => setPickError(t('assignmentWork.loadError')));
        }}
      />
    </View>
  );
}
