/* eslint react-native/no-raw-text: ["error", { "skip": ["WorkText"] }] */
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { privateQueryOptions } from '@/modules/my-classes/hooks/useLearningQuery';
import { cn } from '@/shared/utilities/cn';
import { colors } from '@/theme/colors';
import type { Assignment } from './assignments.service';
import { workService, type CodeRun, type Language } from './work.service';
import {
  useWorkAction,
  useWorkScope,
  WorkError,
  WorkLoading,
  WorkText,
} from './workUi';

const fileNames: Record<Language, string> = {
  javascript: 'solution.js',
  java21: 'Solution.java',
};
const EDITOR_LINE = 20;
// Approximate monospace advance at 13px. The editor scrolls sideways instead
// of wrapping, so the line-number gutter stays aligned with each source line.
const CHAR_WIDTH = 8.1;
const PASSED = /^(PASS|PASSED|OK|ACCEPTED|AC)$/i;

function useMono() {
  return useMemo(
    () => ({
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      includeFontPadding: false,
    }),
    []
  );
}

function Mono({
  children,
  className,
  testID,
}: {
  children: string;
  className: string;
  testID?: string;
}) {
  const mono = useMono();
  return (
    <Text
      selectable
      testID={testID}
      style={mono}
      className={className}
    >
      {children}
    </Text>
  );
}

function Chip({ label, tone }: { label: string; tone: 'mint' | 'soft' }) {
  return (
    <Text
      className={cn(
        'rounded-full px-[12px] py-[6px] font-nunito-bold text-[12.5px] text-forest',
        tone === 'mint' ? 'bg-cover-a-soft' : 'bg-soft'
      )}
    >
      {label}
    </Text>
  );
}

export function CodeWork({
  assignment,
  onDirty,
}: {
  assignment: Assignment;
  onDirty: (dirty: boolean) => void;
}) {
  const { t } = useTranslation();
  const { key, enabled } = useWorkScope(assignment.id);
  const [language, setLanguage] = useState<Language | null>(null);
  const query = useQuery({
    queryKey: [...key, 'code'],
    queryFn: ({ signal }) => workService.code(assignment.id, signal),
    enabled,
    ...privateQueryOptions,
  });
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const detail = query.data;
  const id = submissionId ?? detail?.inFlightSubmissionId;
  const result = useQuery({
    queryKey: [...key, 'code-result', id],
    queryFn: ({ signal }) => workService.codeResult(id ?? '', signal),
    enabled: enabled && !!id,
    ...privateQueryOptions,
    refetchInterval: (q) =>
      q.state.data && ['QUEUED', 'RUNNING'].includes(q.state.data.status)
        ? Math.max(1000, q.state.data.retryAfterMs ?? 2000)
        : false,
  });
  const history = useQuery({
    queryKey: [...key, 'code-history'],
    queryFn: ({ signal }) => workService.codeHistory(assignment.id, signal),
    enabled,
    ...privateQueryOptions,
  });
  useEffect(() => {
    if (result.data && !['QUEUED', 'RUNNING'].includes(result.data.status)) {
      query.refetch().catch(() => {});
      history.refetch().catch(() => {});
    }
  }, [result.data?.id, result.data?.status]);
  const selected = language ?? detail?.languages[0]?.key;
  const judging =
    !!id &&
    (!result.data || ['QUEUED', 'RUNNING'].includes(result.data.status));
  return (
    <View className="gap-[16px]">
      <WorkError
        message={
          query.isError || history.isError || result.isError
            ? t('assignmentWork.loadError')
            : null
        }
        retry={() => {
          query.refetch().catch(() => {});
          history.refetch().catch(() => {});
          if (id) result.refetch().catch(() => {});
        }}
      />
      {query.isPending && <WorkLoading />}
      {detail && selected && (
        <>
          <View className="flex-row flex-wrap gap-[8px]">
            <Chip
              tone="mint"
              label={t('assignmentWork.attemptsRemaining', {
                count: detail.attemptsRemaining,
              })}
            />
            {detail.bestScore !== null && (
              <Chip
                tone="soft"
                label={t('assignmentWork.bestScore', {
                  score: detail.bestScore,
                  max: assignment.maxScore,
                })}
              />
            )}
          </View>
          {detail.deadlinePassed && (
            <View className="rounded-[16px] bg-peach px-[14px] py-[12px]">
              <Text className="font-nunito-bold text-[14px] text-headsup">
                {t('assignmentWork.deadlinePassed')}
              </Text>
            </View>
          )}
          <View className="gap-[12px] rounded-[20px] border border-line bg-canvas p-[16px]">
            <WorkText heading>{t('assignmentWork.problem')}</WorkText>
            <WorkText>{detail.problem.statementMd}</WorkText>
            {!!detail.problem.constraintsMd && (
              <View className="gap-[4px] rounded-[12px] bg-soft px-[12px] py-[10px]">
                <Text className="font-nunito-bold text-[12px] text-muted">
                  {t('assignmentWork.constraints')}
                </Text>
                <Mono className="text-[13px] leading-[20px] text-forest">
                  {detail.problem.constraintsMd}
                </Mono>
              </View>
            )}
            {detail.samples.map((sample) => (
              <View
                key={sample.position}
                className="overflow-hidden rounded-[14px] bg-forest-deep"
              >
                <Text className="bg-forest-night px-[12px] py-[7px] font-nunito-bold text-[12px] text-banner">
                  {t('assignmentWork.sample', { number: sample.position })}
                </Text>
                <View className="gap-[4px] px-[12px] py-[10px]">
                  <Mono className="text-[13px] leading-[20px] text-canvas">
                    {t('assignmentWork.input', { value: sample.display })}
                  </Mono>
                  <Mono className="text-[13px] leading-[20px] text-aqua">
                    {t('assignmentWork.output', {
                      value: JSON.stringify(sample.expected),
                    })}
                  </Mono>
                  {sample.explanationMd && (
                    <Text className="pt-[4px] font-nunito text-[13px] leading-[20px] text-banner">
                      {sample.explanationMd}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
          <CodeEditor
            key={selected}
            assignmentId={assignment.id}
            language={selected}
            languages={detail.languages}
            onLanguage={setLanguage}
            onDirty={onDirty}
            runClosed={detail.deadlinePassed}
            submitHint={
              detail.deadlinePassed
                ? t('assignmentWork.deadlinePassed')
                : detail.attemptsRemaining <= 0
                  ? t('assignmentWork.errors.ASSIGNMENT_ATTEMPTS_EXHAUSTED')
                  : judging
                    ? t('assignmentWork.judgingHint')
                    : null
            }
            canSubmit={
              detail.canSubmit &&
              !query.isError &&
              !query.isFetching &&
              !judging
            }
            onSubmitted={(newId) => {
              setSubmissionId(newId);
              history.refetch().catch(() => {});
            }}
          />
        </>
      )}
      {result.data && (
        <View
          testID="code-result"
          className="gap-[6px] rounded-[18px] bg-cover-a-soft p-[16px]"
        >
          <Text className="font-nunito-bold text-[12px] text-muted">
            {t('assignmentWork.judgeResult')}
          </Text>
          <WorkText heading>
            {t(`assignmentWork.codeStatus.${result.data.status}`)}
          </WorkText>
          {result.data.score !== null && (
            <Text className="font-nunito-extrabold text-[22px] text-forest">
              {t('assignmentWork.resultScore', {
                score: result.data.score,
                max: result.data.maxScore,
              })}
            </Text>
          )}
          {result.data.passedCount !== null && (
            <WorkText>
              {t('assignmentWork.testsPassed', {
                count: result.data.passedCount,
                total: result.data.totalCount,
              })}
            </WorkText>
          )}
          {result.data.verdict && <WorkText>{result.data.verdict}</WorkText>}
          {result.data.compileOutput && (
            <View className="rounded-[12px] bg-forest-deep p-[12px]">
              <Mono className="text-[12px] leading-[18px] text-peach">
                {result.data.compileOutput}
              </Mono>
            </View>
          )}
        </View>
      )}
      {!!history.data?.items.length && (
        <View className="gap-[8px]">
          <WorkText heading>{t('assignmentWork.history')}</WorkText>
          {history.data.items.map((item, index) => (
            <PressableScale
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: item.id === id }}
              accessibilityLabel={t('assignmentWork.codeHistory', {
                number: item.attemptNumber ?? history.data.items.length - index,
                status: t(`assignmentWork.codeStatus.${item.status}`),
                score: item.score ?? '—',
                max: item.maxScore,
              })}
              onPress={() => setSubmissionId(item.id)}
              className={cn(
                'min-h-[48px] flex-row items-center gap-[10px] rounded-[14px] border px-[14px] py-[10px]',
                item.id === id
                  ? 'border-forest bg-cover-a-soft'
                  : 'border-line bg-canvas'
              )}
            >
              <Text className="font-nunito-extrabold text-[14px] text-forest">
                {t('assignmentWork.attemptTag', {
                  number:
                    item.attemptNumber ?? history.data.items.length - index,
                })}
              </Text>
              <Text className="flex-1 font-nunito-semibold text-[14px] text-black">
                {t(`assignmentWork.codeStatus.${item.status}`)}
              </Text>
              <Text className="font-nunito-bold text-[14px] text-forest">
                {t('assignmentWork.scoreShort', {
                  score: item.score ?? '—',
                  max: item.maxScore,
                })}
              </Text>
            </PressableScale>
          ))}
        </View>
      )}
    </View>
  );
}

function CodeEditor({
  assignmentId,
  language,
  languages,
  onLanguage,
  onDirty,
  runClosed,
  submitHint,
  canSubmit,
  onSubmitted,
}: {
  assignmentId: string;
  language: Language;
  languages: { key: Language; displayName: string }[];
  onLanguage: (language: Language) => void;
  onDirty: (dirty: boolean) => void;
  // The server rejects sample runs once the deadline has passed.
  runClosed: boolean;
  submitHint: string | null;
  canSubmit: boolean;
  onSubmitted: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { key, enabled } = useWorkScope(assignmentId);
  const client = useQueryClient();
  const mono = useMono();
  const { width } = useWindowDimensions();
  const draftKey = [...key, 'code-draft', language];
  const query = useQuery({
    queryKey: draftKey,
    queryFn: ({ signal }) => workService.draft(assignmentId, language, signal),
    enabled,
    ...privateQueryOptions,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const [source, setSource] = useState<string | null>(null);
  const [run, setRun] = useState<CodeRun | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const action = useWorkAction();
  const text = source ?? query.data?.sourceCode ?? '';
  const passedCount =
    run?.tests.filter((test) => PASSED.test(test.status)).length ?? 0;
  const lines = text.split('\n');
  const lineCount = lines.length;
  const longest = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const editorStyle = useMemo(
    () => [
      mono,
      {
        minHeight: Math.max(300, lineCount * EDITOR_LINE + 24),
        width: Math.max(width - 96, longest * CHAR_WIDTH + 28),
      },
    ],
    [mono, width, longest, lineCount]
  );
  const dirty = !!query.data && text !== query.data.sourceCode;
  const blocked =
    !enabled ||
    action.busy ||
    action.unresolved ||
    !!action.error ||
    confirming ||
    query.isFetching ||
    query.isPending ||
    query.isError;
  const runDisabled = blocked || runClosed || !text.trim();
  useEffect(() => {
    onDirty(dirty || action.busy || action.unresolved);
  }, [dirty, action.busy, action.unresolved]);
  const save = () => {
    if (!query.data || blocked || !dirty) return;
    const snapshot = text;
    const version = query.data.version;
    action.run(async () => {
      const updated = await workService.saveCode(
        assignmentId,
        language,
        snapshot,
        version
      );
      client.setQueryData(draftKey, updated);
    });
  };
  useEffect(() => {
    if (!dirty || blocked) return;
    const timer = setTimeout(save, 1000);
    return () => clearTimeout(timer);
  }, [text, dirty, blocked]);
  return (
    <View className="gap-[12px]">
      <View
        testID="code-ide"
        className="overflow-hidden rounded-[18px] bg-forest-deep"
      >
        <View className="flex-row items-center gap-[6px] bg-forest-night px-[12px] py-[9px]">
          <View className="h-[9px] w-[9px] rounded-full bg-headsup" />
          <View className="h-[9px] w-[9px] rounded-full bg-sunshine" />
          <View className="h-[9px] w-[9px] rounded-full bg-mint" />
          <Mono className="ml-[6px] flex-1 text-[12px] text-banner">
            {fileNames[language]}
          </Mono>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-[6px] px-[12px] py-[8px]"
          className="flex-grow-0 border-b border-forest"
        >
          {languages.map((item) => {
            const active = item.key === language;
            const locked = blocked || dirty;
            return (
              <PressableScale
                key={item.key}
                testID={`code-language-${item.key}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: active, disabled: locked }}
                disabled={locked}
                onPress={() => onLanguage(item.key)}
                className={cn(
                  'min-h-[32px] justify-center rounded-full px-[14px]',
                  active ? 'bg-aqua' : 'border border-forest',
                  !active && locked && 'opacity-50'
                )}
              >
                <Text
                  className={cn(
                    'font-nunito-bold text-[13px]',
                    active ? 'text-forest-night' : 'text-banner'
                  )}
                >
                  {item.displayName}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
        {query.isPending ? (
          <View className="min-h-[300px] items-center justify-center">
            <WorkLoading />
          </View>
        ) : (
          <View className="min-h-[300px] flex-row">
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              className="items-end bg-forest-night/60 px-[8px] py-[12px]"
            >
              <Text
                testID="code-gutter"
                style={mono}
                className="text-right text-[13px] leading-[20px] text-banner/50"
              >
                {Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')}
              </Text>
            </View>
            <ScrollView
              horizontal
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              className="flex-1"
            >
              <TextInput
                testID="code-editor"
                accessibilityLabel={t('assignmentWork.sourceCode')}
                multiline
                scrollEnabled={false}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textAlignVertical="top"
                editable={!blocked}
                value={text}
                onChangeText={(value) => {
                  setSource(value);
                  setRun(null);
                }}
                style={editorStyle}
                className="px-[10px] py-[12px] text-[13px] leading-[20px] text-canvas"
              />
            </ScrollView>
          </View>
        )}
        <View className="min-h-[36px] flex-row items-center gap-[8px] bg-forest-night px-[12px] py-[6px]">
          <View
            className={cn(
              'h-[7px] w-[7px] rounded-full',
              action.busy ? 'bg-sunshine' : dirty ? 'bg-action' : 'bg-mint'
            )}
          />
          <Text
            accessibilityLiveRegion="polite"
            className="font-nunito-semibold text-[12px] text-banner"
          >
            {t(
              action.busy
                ? 'assignmentWork.saving'
                : dirty
                  ? 'assignmentWork.unsaved'
                  : 'assignmentWork.saved'
            )}
          </Text>
          {dirty && (
            <PressableScale
              testID="code-save"
              accessibilityRole="button"
              accessibilityLabel={t('assignmentWork.save')}
              accessibilityState={{ disabled: blocked }}
              disabled={blocked}
              onPress={save}
              hitSlop={{ top: 8, bottom: 8 }}
              className={cn(
                'rounded-full border border-aqua px-[10px] py-[3px]',
                blocked && 'opacity-40'
              )}
            >
              <Text className="font-nunito-bold text-[11.5px] text-aqua">
                {t('assignmentWork.saveNow')}
              </Text>
            </PressableScale>
          )}
          <View className="flex-1" />
          <Mono className="text-[11px] text-banner/70">
            {t('assignmentWork.lines', { count: lineCount })}
          </Mono>
        </View>
      </View>
      <View
        testID="code-output"
        className="overflow-hidden rounded-[18px] bg-forest-deep"
      >
        <View className="flex-row items-center gap-[8px] bg-forest-night py-[8px] pl-[14px] pr-[8px]">
          <Text
            accessibilityRole="header"
            className="font-nunito-extrabold text-[13px] text-canvas"
          >
            {t('assignmentWork.outputTitle')}
          </Text>
          {run && (
            <Text
              className={cn(
                'rounded-full px-[8px] py-[2px] font-nunito-bold text-[11.5px] text-forest-night',
                passedCount === run.tests.length ? 'bg-aqua' : 'bg-action'
              )}
            >
              {t('assignmentWork.passedSummary', {
                passed: passedCount,
                total: run.tests.length,
              })}
            </Text>
          )}
          <View className="flex-1" />
          <PressableScale
            testID="code-run"
            accessibilityRole="button"
            accessibilityLabel={t('assignmentWork.run')}
            accessibilityState={{ disabled: runDisabled, busy: running }}
            disabled={runDisabled}
            onPress={() => {
              const snapshot = text;
              setRunning(true);
              setRun(null);
              action.run(async () => {
                try {
                  setRun(
                    await workService.run(assignmentId, language, snapshot)
                  );
                } finally {
                  setRunning(false);
                }
              });
            }}
            className={cn(
              'min-h-[36px] flex-row items-center gap-[6px] rounded-full bg-aqua px-[14px]',
              runDisabled && 'opacity-40'
            )}
          >
            {running ? (
              <ActivityIndicator
                size="small"
                color={colors.forestNight}
              />
            ) : (
              <Icon
                name="play"
                size={14}
                color={colors.forestNight}
              />
            )}
            <Text className="font-nunito-extrabold text-[13px] text-forest-night">
              {t('assignmentWork.run')}
            </Text>
          </PressableScale>
        </View>
        {running ? (
          <View className="flex-row items-center gap-[10px] p-[16px]">
            <ActivityIndicator
              size="small"
              color={colors.aqua}
            />
            <Mono className="text-[12.5px] text-banner">
              {t('assignmentWork.running')}
            </Mono>
          </View>
        ) : run ? (
          <View
            testID="code-run-result"
            className="gap-[10px] p-[12px]"
          >
            <View className="flex-row items-center gap-[8px]">
              <Text className="font-nunito-bold text-[12px] text-banner">
                {t('assignmentWork.compile')}
              </Text>
              <Mono className="rounded-[6px] bg-forest-night px-[8px] py-[2px] text-[12px] text-sunshine">
                {run.compileStatus}
              </Mono>
            </View>
            {!!run.compileOutput && (
              <View className="rounded-[10px] bg-forest-night p-[10px]">
                <Mono className="text-[12px] leading-[18px] text-peach">
                  {run.compileOutput}
                </Mono>
              </View>
            )}
            {run.tests.map((test, index) => {
              const passed = PASSED.test(test.status);
              return (
                <View
                  key={index}
                  className="gap-[8px] rounded-[12px] bg-forest-night/70 p-[10px]"
                >
                  <View className="flex-row items-center gap-[8px]">
                    <View
                      className={cn(
                        'flex-row items-center gap-[4px] rounded-full px-[8px] py-[2px]',
                        passed ? 'bg-aqua' : 'bg-action'
                      )}
                    >
                      <Text className="font-nunito-extrabold text-[11.5px] text-forest-night">
                        {t(
                          passed
                            ? 'assignmentWork.casePassed'
                            : 'assignmentWork.caseFailed'
                        )}
                      </Text>
                    </View>
                    <Text className="font-nunito-bold text-[12.5px] text-canvas">
                      {t('assignmentWork.sample', { number: index + 1 })}
                    </Text>
                    <View className="flex-1" />
                    <Mono className="text-[11px] text-banner/70">
                      {test.status}
                    </Mono>
                  </View>
                  <Mono className="text-[12.5px] leading-[18px] text-canvas">
                    {test.display}
                  </Mono>
                  <View className="flex-row gap-[8px]">
                    <View className="flex-1 gap-[2px] rounded-[8px] bg-forest-deep px-[8px] py-[6px]">
                      <Text className="font-nunito-semibold text-[11px] text-banner/70">
                        {t('assignmentWork.expectedLabel')}
                      </Text>
                      <Mono className="text-[12.5px] text-aqua">
                        {JSON.stringify(test.expected) ?? '—'}
                      </Mono>
                    </View>
                    <View className="flex-1 gap-[2px] rounded-[8px] bg-forest-deep px-[8px] py-[6px]">
                      <Text className="font-nunito-semibold text-[11px] text-banner/70">
                        {t('assignmentWork.actualLabel')}
                      </Text>
                      <Mono
                        className={cn(
                          'text-[12.5px]',
                          passed ? 'text-aqua' : 'text-action'
                        )}
                      >
                        {JSON.stringify(test.actual) ?? '—'}
                      </Mono>
                    </View>
                  </View>
                  {!!test.console && (
                    <Mono className="text-[12px] leading-[18px] text-banner">
                      {t('assignmentWork.stdout', { value: test.console })}
                    </Mono>
                  )}
                  {!!test.stderr && (
                    <Mono className="text-[12px] leading-[18px] text-peach">
                      {t('assignmentWork.stderr', { value: test.stderr })}
                    </Mono>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View className="items-center gap-[8px] px-[16px] py-[22px]">
            <View className="h-[36px] w-[36px] items-center justify-center rounded-full bg-forest-night">
              <Icon
                name="play"
                size={16}
                color={colors.aqua}
              />
            </View>
            <Text
              testID="code-output-empty"
              className="text-center font-nunito text-[13px] leading-[19px] text-banner"
            >
              {t(
                runClosed
                  ? 'assignmentWork.runClosed'
                  : 'assignmentWork.consoleEmpty'
              )}
            </Text>
          </View>
        )}
      </View>
      {/* Errors sit beside the run/submit controls that caused them. */}
      <WorkError
        message={
          action.error ?? (query.isError ? t('assignmentWork.loadError') : null)
        }
        retry={
          action.unresolved
            ? action.retry
            : () => {
                action.clearError();
                query.refetch().catch(() => {});
              }
        }
      />
      <View className="gap-[8px]">
        <Button
          testID="code-submit"
          label={t('assignmentWork.submit')}
          variant="solid"
          disabled={blocked || !canSubmit || !text.trim()}
          onPress={() => {
            setConfirming(true);
            const snapshot = text;
            Alert.alert(
              t('assignmentWork.confirmSubmit'),
              t('assignmentWork.confirmCode'),
              [
                {
                  text: t('assignmentWork.cancel'),
                  style: 'cancel',
                  onPress: () => setConfirming(false),
                },
                {
                  text: t('assignmentWork.submit'),
                  onPress: () => {
                    setConfirming(false);
                    action.run(async (receipt) => {
                      const result = await workService.submitCode(
                        assignmentId,
                        language,
                        snapshot,
                        receipt
                      );
                      onSubmitted(result.id);
                    });
                  },
                },
              ],
              { cancelable: true, onDismiss: () => setConfirming(false) }
            );
          }}
        />
        {submitHint && (
          <Text className="text-center font-nunito-semibold text-[12.5px] text-muted">
            {submitHint}
          </Text>
        )}
      </View>
    </View>
  );
}
