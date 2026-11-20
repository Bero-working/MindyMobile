/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import routes from '@/navigation/routes';
import type { NavigationProp, RootStackParamList } from '@/navigation/types';
import { deferComponent } from '@/components/common/deferComponent';
import { Button } from '@/components/ui/Button';
import { ScreenState } from '@/components/common/ScreenState';
import { LearningLayout } from '@/modules/my-classes/components/LearningLayout';
import { privateQueryOptions } from '@/modules/my-classes/hooks/useLearningQuery';
import { displayInstant } from '@/modules/schedule/calendar';
import { useStudentScope } from '@/shared/hooks/useStudentScope';
import { workService } from './work.service';
import { useWorkScope, WorkError, WorkLoading } from './workUi';

const QuizWork = deferComponent(
  () => (require('./QuizWork') as typeof import('./QuizWork')).QuizWork
);
const CodeWork = deferComponent(
  () => (require('./CodeWork') as typeof import('./CodeWork')).CodeWork
);
const ZipWork = deferComponent(
  () => (require('./ZipWork') as typeof import('./ZipWork')).ZipWork
);

export function AssignmentWorkRoute() {
  const { params } =
    useRoute<RouteProp<RootStackParamList, routes.studentAssignment>>();
  // A new assignment always owns a fresh editor and leave guard.
  return (
    <AssignmentWork
      key={params.assignmentId}
      id={params.assignmentId}
    />
  );
}

function AssignmentWork({ id }: { id: string }) {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const scope = useStudentScope();
  const { key, enabled } = useWorkScope(id);
  const [dirty, setDirty] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const valid = z.string().uuid().safeParse(id).success;
  const query = useQuery({
    queryKey: [...key, 'detail'],
    queryFn: ({ signal }) => workService.detail(id, signal),
    enabled: enabled && valid,
    ...privateQueryOptions,
  });
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (!dirty || !scope.enabled) return;
        event.preventDefault();
        Alert.alert(
          t('assignmentWork.leaveTitle'),
          t('assignmentWork.leaveDescription'),
          [
            { text: t('assignmentWork.stay'), style: 'cancel' },
            {
              text: t('assignmentWork.leave'),
              style: 'destructive',
              onPress: () => navigation.dispatch(event.data.action),
            },
          ]
        );
      }),
    [navigation, dirty, scope.enabled, t]
  );
  const assignment = query.data;
  return (
    <LearningLayout
      prefix="assignment-work"
      title={t('assignments.title')}
      onBack={() => navigation.goBack()}
    >
      {!scope.enabled ? (
        <ScreenState
          title={t('assignments.title')}
          description={t('home.authRequired')}
        />
      ) : !valid ? (
        <WorkError message={t('assignmentWork.notFound')} />
      ) : query.isPending ? (
        <WorkLoading />
      ) : query.isError && !assignment ? (
        <WorkError
          message={t('assignmentWork.loadError')}
          retry={() => {
            query.refetch().catch(() => {});
          }}
        />
      ) : (
        assignment && (
          <>
            {query.isError && (
              <WorkError
                message={t('assignmentWork.loadError')}
                retry={() => {
                  query.refetch().catch(() => {});
                }}
              />
            )}
            <View className="gap-[12px] rounded-[22px] bg-cover-a-soft p-[18px]">
              <View className="flex-row flex-wrap gap-[6px]">
                <Text className="rounded-full bg-forest px-[10px] py-[4px] font-nunito-bold text-[11.5px] text-primary-foreground">
                  {t(`assignments.type.${assignment.type}`)}
                </Text>
                <Text className="rounded-full bg-canvas px-[10px] py-[4px] font-nunito-bold text-[11.5px] text-forest">
                  {t(`assignments.purpose.${assignment.purpose}`)}
                </Text>
              </View>
              <Text
                selectable
                accessibilityRole="header"
                className="font-nunito-extrabold text-[22px] leading-[28px] text-black"
              >
                {assignment.title}
              </Text>
              <Text
                selectable
                className={
                  assignment.description
                    ? 'font-nunito text-[14px] leading-[22px] text-forest'
                    : 'font-nunito text-[13px] italic leading-[20px] text-muted'
                }
              >
                {assignment.description || t('assignments.noInstructions')}
              </Text>
              <View className="-mx-[4px] flex-row flex-wrap">
                {[
                  {
                    label: t('assignmentWork.factScore'),
                    value: assignment.maxScore,
                    wide: false,
                  },
                  {
                    label: t('assignmentWork.factAttempts'),
                    value: String(assignment.maxAttempts),
                    wide: false,
                  },
                  {
                    label: t('assignmentWork.factDue'),
                    value: assignment.dueAt
                      ? displayInstant(
                          assignment.dueAt,
                          'Asia/Ho_Chi_Minh',
                          i18n.language
                        )
                      : t('assignmentWork.factNoDue'),
                    wide: true,
                  },
                ].map((fact) => (
                  <View
                    key={fact.label}
                    className={
                      fact.wide
                        ? 'w-full px-[4px] pt-[8px]'
                        : 'w-1/2 px-[4px] pt-[8px]'
                    }
                  >
                    <View className="gap-[2px] rounded-[14px] bg-canvas px-[12px] py-[10px]">
                      <Text className="font-nunito-semibold text-[11.5px] text-muted">
                        {fact.label}
                      </Text>
                      <Text className="font-nunito-bold text-[15px] text-black">
                        {fact.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              {assignment.instructionFiles.map((file) => (
                <Button
                  key={file.id}
                  label={file.originalFilename}
                  variant="outline"
                  disabled={!enabled}
                  onPress={async () => {
                    setDownloadError(false);
                    try {
                      const result = await workService.download(file.id);
                      await Linking.openURL(result.url);
                    } catch {
                      setDownloadError(true);
                    }
                  }}
                />
              ))}
              <WorkError
                message={
                  downloadError ? t('assignmentWork.downloadError') : null
                }
              />
            </View>
            {assignment.type === 'QUIZ' ? (
              <QuizWork
                assignment={assignment}
                onDirty={setDirty}
              />
            ) : assignment.type === 'CODE' ? (
              <CodeWork
                assignment={assignment}
                onDirty={setDirty}
              />
            ) : (
              <ZipWork
                assignment={assignment}
                onDirty={setDirty}
              />
            )}
          </>
        )
      )}
    </LearningLayout>
  );
}
