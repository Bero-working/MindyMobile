/* eslint react-native/no-raw-text: ["error", { "skip": ["WorkText"] }] */
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { cn } from '@/shared/utilities/cn';
import { privateQueryOptions } from '@/modules/my-classes/hooks/useLearningQuery';
import type { Assignment } from './assignments.service';
import { workService, type Answer, type Quiz } from './work.service';
import {
  useWorkAction,
  useWorkScope,
  WorkError,
  WorkLoading,
  WorkText,
} from './workUi';

export function quizRemaining(quiz: Quiz, receivedAt: number, now: number) {
  return quiz.expiresAt
    ? Math.max(
        0,
        Math.ceil(
          (Date.parse(quiz.expiresAt) -
            Date.parse(quiz.serverNow) -
            (now - receivedAt)) /
            1000
        )
      )
    : null;
}
export function QuizWork({
  assignment,
  onDirty,
}: {
  assignment: Assignment;
  onDirty: (dirty: boolean) => void;
}) {
  const { t } = useTranslation();
  const { key, enabled } = useWorkScope(assignment.id);
  const client = useQueryClient();
  const action = useWorkAction();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [now, setNow] = useState(performance.now());
  const received = useRef({ data: null as Quiz | null, at: performance.now() });
  const history = useQuery({
    queryKey: [...key, 'history'],
    queryFn: ({ signal }) => workService.history(assignment.id, signal),
    enabled,
    ...privateQueryOptions,
  });
  const prior = history.data?.items.find(
    (item) => 'type' in item && item.type === 'QUIZ'
  );
  const id = attemptId ?? prior?.id;
  const quizKey = [...key, 'quiz', id];
  const query = useQuery({
    queryKey: quizKey,
    queryFn: ({ signal }) => workService.quiz(id ?? '', signal),
    enabled: enabled && !!id,
    ...privateQueryOptions,
    refetchInterval: (q) =>
      q.state.data?.status === 'FINALIZING'
        ? (q.state.data.retryAfterSeconds ?? 2) * 1000
        : false,
  });
  const quiz = query.data;
  if (quiz && received.current.data !== quiz)
    received.current = { data: quiz, at: performance.now() };
  useEffect(() => {
    if (quiz) setAnswers(quiz.answers);
  }, [quiz]);
  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => setNow(performance.now()), 1000);
    return () => clearInterval(timer);
  }, [enabled]);
  const remaining = quiz
    ? quizRemaining(
        quiz,
        received.current.at,
        Math.max(now, received.current.at)
      )
    : null;
  const dirty =
    !!quiz && JSON.stringify(answers) !== JSON.stringify(quiz.answers);
  const blocked =
    action.busy ||
    action.unresolved ||
    !!action.error ||
    confirming ||
    !enabled ||
    query.isFetching ||
    query.isError ||
    quiz?.status !== 'IN_PROGRESS' ||
    remaining === 0;
  useEffect(() => {
    onDirty(dirty || action.busy || action.unresolved);
  }, [dirty, action.busy, action.unresolved]);
  const commit = (submit: boolean) => {
    if (!quiz || action.busy || action.unresolved || !enabled) return;
    if (quizRemaining(quiz, received.current.at, performance.now()) === 0)
      return;
    const snapshot = [...answers];
    action.run(async (receipt) => {
      const updated = await workService.answers(
        quiz,
        snapshot,
        receipt,
        submit
      );
      client.setQueryData(quizKey, updated);
      setAnswers(updated.answers);
      if (submit || updated.status !== 'IN_PROGRESS') {
        // Cache the durable write before refresh; a failed read must not repeat a write.
        query.refetch().catch(() => {});
        history.refetch().catch(() => {});
      }
    });
  };
  // Save the complete answer set, serially, after the learner pauses selecting.
  useEffect(() => {
    if (!dirty || blocked) return;
    const timer = setTimeout(() => commit(false), 900);
    return () => clearTimeout(timer);
  }, [dirty, answers, blocked, quiz?.version]);
  useEffect(() => {
    if (remaining !== 0 || !quiz || quiz.status !== 'IN_PROGRESS' || !enabled)
      return;
    // The server owns timeout grading and grades only answers saved before expiry.
    const timer = setInterval(() => {
      query.refetch().catch(() => {});
    }, 2000);
    return () => clearInterval(timer);
  }, [remaining, quiz?.status, enabled]);
  const error =
    action.error ??
    (query.isError || history.isError ? t('assignmentWork.loadError') : null);
  return (
    <View className="gap-[16px]">
      <WorkError
        message={error}
        retry={
          action.unresolved
            ? action.retry
            : () => {
                action.clearError();
                query.refetch().catch(() => {});
                history.refetch().catch(() => {});
              }
        }
      />
      {!id && history.isPending ? (
        <WorkLoading />
      ) : (
        !id && (
          <>
            <WorkText>
              {t('assignmentWork.quizIntro', {
                count: assignment.timeLimitMinutes ?? 0,
              })}
            </WorkText>
            <Button
              testID="quiz-start"
              label={t('assignmentWork.startResume')}
              variant="solid"
              loading={action.busy}
              disabled={!enabled || action.unresolved || history.isError}
              onPress={() =>
                action.run(async (receipt) => {
                  const started = await workService.startQuiz(
                    assignment.id,
                    assignment.revision,
                    receipt
                  );
                  client.setQueryData(
                    [...key, 'quiz', started.attemptId],
                    started
                  );
                  setAttemptId(started.attemptId);
                })
              }
            />
          </>
        )
      )}
      {id && query.isPending && <WorkLoading />}
      {quiz && (
        <>
          <View className="gap-[8px] rounded-[18px] bg-cover-a-soft p-[16px]">
            <WorkText heading>
              {t(`assignmentWork.quizStatus.${quiz.status}`)}
            </WorkText>
            {remaining !== null && quiz.status === 'IN_PROGRESS' && (
              <Text
                testID="quiz-timer"
                accessibilityLiveRegion="none"
                className="font-nunito-extrabold text-[24px] text-forest"
              >
                {Math.floor(remaining / 60)
                  .toString()
                  .padStart(2, '0')}
                :{(remaining % 60).toString().padStart(2, '0')}
              </Text>
            )}
            {remaining === 0 && quiz.status === 'IN_PROGRESS' && (
              <WorkText>{t('assignmentWork.expired')}</WorkText>
            )}
            <WorkText>
              {t('assignmentWork.answered', {
                count: answers.length,
                total: quiz.questions.length,
              })}
            </WorkText>
            {quiz.status === 'IN_PROGRESS' && (
              <WorkText>
                {t(
                  action.busy
                    ? 'assignmentWork.saving'
                    : dirty
                      ? 'assignmentWork.unsaved'
                      : 'assignmentWork.saved'
                )}
              </WorkText>
            )}
            {quiz.result && (
              <WorkText heading>
                {t('assignmentWork.resultScore', {
                  score: quiz.result.score,
                  max: quiz.result.maxScore,
                })}
              </WorkText>
            )}
          </View>
          {quiz.questions.map((question, index) => {
            const selected = answers.find(
              (answer) => answer.questionId === question.id
            )?.selectedOption;
            const result =
              quiz.status === 'GRADED'
                ? quiz.result?.results.find(
                    (row) => row.questionId === question.id
                  )
                : undefined;
            return (
              <View
                key={question.id}
                className="gap-[10px] rounded-[18px] border border-line bg-soft p-[16px]"
              >
                <WorkText heading>
                  {t('assignmentWork.question', { number: index + 1 })}
                </WorkText>
                <WorkText>{question.prompt}</WorkText>
                {question.options.map((option) => {
                  const picked = selected === option.label;
                  // After grading: the right option turns green, a wrong pick red.
                  const mark = !result
                    ? null
                    : option.label === result.correctOption
                      ? 'right'
                      : picked
                        ? 'wrong'
                        : null;
                  const label = `${option.label}. ${option.text}`;
                  return (
                    <PressableScale
                      key={option.label}
                      testID={`quiz-option-${index}-${option.label}`}
                      accessibilityRole="radio"
                      accessibilityLabel={
                        mark === 'right'
                          ? `${label}, ${t('assignmentWork.markRight')}`
                          : mark === 'wrong'
                            ? `${label}, ${t('assignmentWork.markWrong')}`
                            : label
                      }
                      accessibilityState={{
                        checked: picked,
                        disabled: blocked,
                      }}
                      disabled={blocked}
                      onPress={() =>
                        setAnswers((previous) => [
                          ...previous.filter(
                            (a) => a.questionId !== question.id
                          ),
                          {
                            questionId: question.id,
                            selectedOption: option.label,
                          },
                        ])
                      }
                      className={cn(
                        'min-h-[48px] flex-row items-center gap-[10px] rounded-[14px] border p-[12px]',
                        mark === 'right'
                          ? 'border-status-green bg-cover-d-soft'
                          : mark === 'wrong'
                            ? 'border-status-red bg-cover-c-soft'
                            : picked
                              ? 'border-forest bg-cover-a-soft'
                              : 'border-line bg-canvas'
                      )}
                    >
                      <Text
                        className={cn(
                          'flex-1 font-nunito text-[14px] leading-[23px]',
                          mark === 'right'
                            ? 'font-nunito-bold text-status-green'
                            : mark === 'wrong'
                              ? 'font-nunito-bold text-status-red'
                              : 'text-forest'
                        )}
                      >
                        {label}
                      </Text>
                      {mark && (
                        <View
                          className={cn(
                            'h-[22px] w-[22px] items-center justify-center rounded-full',
                            mark === 'right'
                              ? 'bg-status-green'
                              : 'bg-status-red'
                          )}
                        >
                          <Icon
                            name={mark === 'right' ? 'check' : 'close'}
                            size={13}
                            light
                          />
                        </View>
                      )}
                    </PressableScale>
                  );
                })}
                {result &&
                  (result.isCorrect ? (
                    <Text className="font-nunito-bold text-[13.5px] text-status-green">
                      {t('assignmentWork.correct')}
                    </Text>
                  ) : (
                    <View className="rounded-[12px] bg-cover-d-soft px-[12px] py-[10px]">
                      <Text className="font-nunito-bold text-[13.5px] text-status-green">
                        {t('assignmentWork.correctAnswer', {
                          option: (() => {
                            const right = question.options.find(
                              (option) => option.label === result.correctOption
                            );
                            return right
                              ? `${right.label}. ${right.text}`
                              : result.correctOption;
                          })(),
                        })}
                      </Text>
                    </View>
                  ))}
              </View>
            );
          })}
          {quiz.status === 'IN_PROGRESS' && (
            <Button
              testID="quiz-submit"
              label={t('assignmentWork.submit')}
              variant="solid"
              disabled={blocked}
              onPress={() => {
                setConfirming(true);
                Alert.alert(
                  t('assignmentWork.confirmSubmit'),
                  t('assignmentWork.confirmQuiz', {
                    count: answers.length,
                    total: quiz.questions.length,
                  }),
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
                        commit(true);
                      },
                    },
                  ],
                  { cancelable: true, onDismiss: () => setConfirming(false) }
                );
              }}
            />
          )}
        </>
      )}
    </View>
  );
}
