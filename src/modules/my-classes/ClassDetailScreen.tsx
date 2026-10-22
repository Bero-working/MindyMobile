import { useEffect, useRef, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CoverImage } from '@/components/common/CoverImage';
import { CourseCover } from '@/components/common/CourseCover';
import { Icon } from '@/components/common/Icon';
import { ScreenState } from '@/components/common/ScreenState';
import { PressableScale } from '@/components/common/PressableScale';
import { LearningLayout, LearningState } from './components/LearningLayout';
import { LearningHero } from './components/LearningHero';
import {
  displayDay,
  displayInstant,
  displayTime,
  localDay,
} from '../schedule/calendar';
import type { DataRegion } from '../home/types/home.type';
import type { ClassDetail, ClassSession } from './types';
import { SessionDetailScreen } from './SessionDetailScreen';
import { MeetingButton } from './components/MeetingButton';
import { sessionDisplayStatus } from './sessionDisplayStatus';
import { nextLearningSession } from './nextLearningSession';
import { useSessionTime } from './hooks/useSessionTime';
import { ClassParticipantsSheet } from './components/ClassParticipantsSheet';

function meetingLink(
  detail: ClassDetail,
  session: ClassSession
): string | null {
  if (
    detail.accessMode !== 'FULL' ||
    detail.deliveryMode !== 'ONLINE' ||
    session.status === 'CANCELLED'
  )
    return null;
  const fullSession = detail.units
    .flatMap((u) => u.sessions)
    .find((s) => s.id === session.id);
  const raw = fullSession?.meetingUrl ?? detail.meetingUrl;
  if (!raw || !/^https?:\/\/[^\s]+$/i.test(raw)) return null;
  try {
    const url = new URL(raw);
    return url.hostname && !url.username && !url.password ? raw : null;
  } catch {
    return null;
  }
}
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(-2)
    .join('')
    .toUpperCase() || '?';
function MentorAvatar({ name }: { name: string }) {
  return (
    <View className="h-[44px] w-[44px] items-center justify-center rounded-full border-2 border-canvas bg-sunshine">
      <Text className="font-nunito-extrabold text-[15px] text-mint">
        {initials(name)}
      </Text>
    </View>
  );
}

export function ClassDetailScreen({
  detail,
  sessionId,
  courseTitle,
  courseImageUrl,
  courseDescription,
  timeZone,
  onBack,
  onJoin,
  onSessionChange,
}: {
  detail: DataRegion<ClassDetail>;
  sessionId?: string | undefined;
  courseTitle?: string | undefined;
  courseImageUrl?: string | null | undefined;
  courseDescription?: string | null | undefined;
  timeZone: string;
  onBack: () => void;
  onJoin: (url: string) => Promise<void>;
  onSessionChange?: (active: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const compact = width <= 360 || fontScale >= 1.3;
  const data = detail.data;
  const [selected, setSelected] = useState<string | null>(sessionId ?? null);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const busy = useRef(false);
  useEffect(() => {
    setSelected(sessionId ?? null);
    setJoinError(false);
    setDescriptionOpen(false);
    setParticipantsOpen(false);
  }, [data?.id, data?.accessMode, sessionId]);
  const denied =
    detail.status === 'error' &&
    ['CLASS_ACCESS_DENIED', 'CLASS_PREVIEW_DENIED', 'CLASS_NOT_FOUND'].includes(
      detail.error?.code ?? ''
    );
  const units = data?.units ?? [];
  const sessions: ClassSession[] = units.flatMap((u) => u.sessions);
  const now = useSessionTime(sessions);
  const activeSessionId = nextLearningSession(sessions, now)?.id;
  const selectedUnit = units.find((u) =>
    u.sessions.some((s) => s.id === selected)
  );
  const session = selectedUnit?.sessions.find((s) => s.id === selected);
  const sessionOpen = !!session;
  useEffect(() => {
    onSessionChange?.(sessionOpen);
    return () => onSessionChange?.(false);
  }, [onSessionChange, sessionOpen]);
  const verified = !!data && !denied && detail.status === 'success';
  const url = data && session && verified ? meetingLink(data, session) : null;
  const preferred =
    session ??
    sessions.find(
      (s) => s.status === 'IN_PROGRESS' && data && meetingLink(data, s)
    ) ??
    sessions.find(
      (s) => s.status === 'SCHEDULED' && data && meetingLink(data, s)
    );
  const footerUrl =
    data && preferred && verified ? meetingLink(data, preferred) : null;
  const mentorName = data?.mentor?.displayName ?? t('classDetail.noMentor');
  const join = async (link: string) => {
    if (busy.current) return;
    busy.current = true;
    setJoining(true);
    setJoinError(false);
    try {
      await onJoin(link);
    } catch {
      setJoinError(true);
    } finally {
      busy.current = false;
      setJoining(false);
    }
  };
  const sessionMeta = (item: ClassSession) => {
    const day = localDay(item.startsAt, timeZone);
    const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
    return `${t('classDetail.sessionNumber', { number: item.sessionNumber })} · ${t(`schedule.days.${(weekday + 6) % 7}`)} ${displayDay(day).slice(0, 5)} · ${displayTime(item.startsAt, timeZone)} – ${displayTime(item.endsAt, timeZone)}`;
  };
  const footer =
    data && verified ? (
      <View
        pointerEvents="box-none"
        className="gap-[6px] px-[16px] py-[10px]"
      >
        {joinError && !session && (
          <Text
            accessibilityRole="alert"
            className="font-nunito text-[13px] text-headsup"
          >
            {t('classDetail.linkError')}
          </Text>
        )}
        <View
          pointerEvents="box-none"
          className="flex-row items-center justify-between gap-[12px]"
        >
          <View className="shrink-0">
            <PressableScale
              testID="class-detail-participants"
              accessibilityRole="button"
              accessibilityLabel={t('classDetail.participants.open')}
              onPress={() => setParticipantsOpen(true)}
              className="min-h-[54px] min-w-[54px] items-center justify-center rounded-full border border-line bg-canvas p-[8px] shadow-lg shadow-forest/20"
            >
              <View className="h-[36px] w-[36px] items-center justify-center overflow-hidden rounded-full bg-sunshine">
                <Text className="font-nunito-extrabold text-[16px] text-mint">
                  {initials(mentorName)}
                </Text>
              </View>
            </PressableScale>
          </View>
          {footerUrl && (
            <MeetingButton
              testID="class-detail-join"
              joining={joining}
              onPress={() => {
                join(footerUrl).catch(() => {});
              }}
            />
          )}
        </View>
      </View>
    ) : null;
  if (session && data && verified) {
    return (
      <SessionDetailScreen
        session={session}
        classCode={data.code}
        totalSessions={sessions.length}
        unitTitle={selectedUnit?.title ?? ''}
        mentorName={mentorName}
        deliveryMode={data.deliveryMode}
        timeZone={timeZone}
        joining={joining}
        joinError={joinError}
        onJoin={
          url && session.status !== 'COMPLETED'
            ? () => {
                join(url).catch(() => {});
              }
            : undefined
        }
        onClose={() => {
          setSelected(null);
          setJoinError(false);
        }}
      />
    );
  }
  return (
    <LearningLayout
      prefix="class-detail"
      title={t('classDetail.title')}
      showTitle={false}
      onBack={onBack}
      tintedStatusBar
      statusTintTone="forest"
      contentClassName="gap-[0px] px-[0px] pb-[110px]"
      onRefresh={detail.onRetry}
      footer={footer}
      floatingFooter
      header={
        !data || denied ? (
          <View className="bg-forest-deep px-[16px] py-[4px]">
            <PressableScale
              testID="class-detail-back"
              accessibilityRole="button"
              accessibilityLabel={t('learning.back')}
              onPress={onBack}
              className="h-[44px] w-[44px] items-center justify-center"
            >
              <Icon
                name="back"
                light
                size={24}
              />
            </PressableScale>
          </View>
        ) : undefined
      }
    >
      {participantsOpen && data && verified && (
        <ClassParticipantsSheet
          mentorName={data.mentor?.displayName ?? null}
          classCode={data.code}
          onClose={() => setParticipantsOpen(false)}
        />
      )}
      {denied ? (
        <View className="p-[16px]">
          <ScreenState
            title={t(
              detail.error?.code === 'CLASS_NOT_FOUND'
                ? 'classDetail.notFound'
                : 'classDetail.denied'
            )}
            description={t('classDetail.returnToList')}
          />
        </View>
      ) : (
        <LearningState
          region={detail}
          prefix="class-detail"
          empty={!data}
        >
          {data && (
            <>
              <LearningHero className="rounded-none px-[16px] pb-[52px] pt-[4px]">
                <View
                  pointerEvents="none"
                  accessible={false}
                  className="absolute -right-[56px] top-[30px] h-[224px] w-[224px] rounded-full bg-mint/25"
                />
                <View className="items-start">
                  <PressableScale
                    testID="class-detail-back"
                    accessibilityRole="button"
                    accessibilityLabel={t('learning.back')}
                    onPress={onBack}
                    className="h-[44px] w-[44px] items-center justify-center"
                  >
                    <Icon
                      name="back"
                      light
                      size={24}
                    />
                  </PressableScale>
                </View>
                <View
                  className={
                    compact ? 'gap-[16px]' : 'flex-row items-center gap-[16px]'
                  }
                >
                  <CoverImage
                    uri={courseImageUrl ?? null}
                    label={courseTitle ?? data.name}
                    className={
                      compact
                        ? 'w-[88px] rounded-[14px]'
                        : 'w-[112px] rounded-[14px]'
                    }
                    fallback={<CourseCover index={0} />}
                  />
                  <View
                    className={
                      compact ? 'gap-[10px]' : 'min-w-[0px] flex-1 gap-[10px]'
                    }
                  >
                    <Text className="font-nunito-extrabold text-[24px] leading-[28px] text-canvas">
                      {data.code}
                    </Text>
                    <View className="flex-row items-start gap-[8px]">
                      <Icon
                        name="monitor"
                        light
                        size={16}
                      />
                      <Text className="flex-1 font-nunito text-[14.5px] leading-[20px] text-canvas">
                        {courseTitle ?? data.name}
                      </Text>
                    </View>
                    <View className="items-start">
                      <View className="rounded-full bg-coral px-[12px] py-[6px]">
                        <Text className="font-nunito-extrabold text-[12px] text-canvas">
                          {t(`learning.classStatus.${data.classStatus}`)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LearningHero>
              <View className="-mt-[28px] gap-[20px] rounded-t-[28px] bg-canvas px-[16px] pb-[16px] pt-[24px]">
                {data.accessMode === 'CASH_PREVIEW' && (
                  <View
                    testID="class-detail-preview"
                    className="gap-[8px] rounded-[12px] bg-sunshine p-[14px]"
                  >
                    <Text className="font-nunito-bold text-[14px] text-forest">
                      {t('classDetail.preview')}
                    </Text>
                    {data.expiresAt && (
                      <Text className="font-nunito text-[12px] text-forest">
                        {t('myClasses.expires', {
                          date: displayInstant(
                            data.expiresAt,
                            timeZone,
                            i18n.language
                          ),
                        })}
                      </Text>
                    )}
                  </View>
                )}
                <View className="flex-row flex-wrap">
                  {[
                    {
                      value: String(sessions.length),
                      label: t('classDetail.sessionsLabel'),
                    },
                    {
                      value: displayDay(data.startDate).slice(0, 5),
                      label: t('classDetail.startDate'),
                    },
                    {
                      value: displayDay(data.endDate).slice(0, 5),
                      label: t('classDetail.endDate'),
                    },
                    {
                      value: t(`schedule.delivery.${data.deliveryMode}`),
                      label: t('classDetail.deliveryLabel'),
                    },
                  ].map((stat) => (
                    <View
                      key={stat.label}
                      className={
                        compact
                          ? 'w-1/2 items-center gap-[5px] px-[4px] pb-[12px]'
                          : 'min-w-[0px] flex-1 items-center gap-[5px] px-[4px]'
                      }
                    >
                      <Text className="text-center font-nunito-extrabold text-[16px] text-black">
                        {stat.value}
                      </Text>
                      <Text className="text-center font-nunito text-[11px] text-muted">
                        {stat.label}
                      </Text>
                    </View>
                  ))}
                </View>
                <View className="gap-[4px]">
                  <Text
                    numberOfLines={
                      courseDescription && !descriptionOpen ? 2 : undefined
                    }
                    className="font-nunito text-[14px] leading-[23px] text-black"
                  >
                    {courseDescription || data.name}
                  </Text>
                  {courseDescription && (
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityState={{ expanded: descriptionOpen }}
                      onPress={() => setDescriptionOpen(!descriptionOpen)}
                      className="min-h-[44px] justify-center"
                    >
                      <Text className="font-nunito-bold text-[14px] text-headsup">
                        {t(
                          descriptionOpen
                            ? 'classDetail.less'
                            : 'classDetail.more'
                        )}
                      </Text>
                    </PressableScale>
                  )}
                </View>
                <View className="flex-row items-center gap-[12px] rounded-[18px] bg-soft p-[14px]">
                  <MentorAvatar name={mentorName} />
                  <View className="flex-1 gap-[3px]">
                    <Text className="font-nunito text-[11px] text-muted">
                      {t('classDetail.mentorLabel')}
                    </Text>
                    <Text className="font-nunito-bold text-[14px] text-black">
                      {mentorName}
                    </Text>
                  </View>
                </View>
                <View className="gap-[8px]">
                  <View className="flex-row items-center gap-[8px]">
                    <Text
                      accessibilityRole="header"
                      className="flex-1 font-nunito-extrabold text-[18px] text-black"
                    >
                      {t('classDetail.sessionsLabel')}
                    </Text>
                    <Text className="ml-[4px] font-nunito text-[12px] text-muted">
                      {t('classDetail.sessionCount', {
                        count: sessions.length,
                      })}
                    </Text>
                  </View>
                  {sessionId && !sessions.some((s) => s.id === sessionId) && (
                    <Text
                      accessibilityRole="alert"
                      className="font-nunito text-[14px] text-headsup"
                    >
                      {t('classDetail.missingSession')}
                    </Text>
                  )}
                  {!sessions.length && (
                    <Text className="font-nunito text-[14px] text-muted">
                      {t('classDetail.noUnits')}
                    </Text>
                  )}
                  {sessions.map((item, index) => {
                    const displayStatus = sessionDisplayStatus(item, now);
                    const active = item.id === activeSessionId;
                    const isToday =
                      localDay(item.startsAt, timeZone) ===
                        localDay(new Date(now).toISOString(), timeZone) ||
                      Date.parse(item.startsAt) <= now;
                    const statusLabel = active
                      ? t(
                          isToday
                            ? 'classDetail.rowToday'
                            : 'classDetail.rowUpcoming'
                        )
                      : displayStatus === 'SCHEDULED'
                        ? t('classDetail.rowUpcoming')
                        : t(`learning.sessionStatus.${displayStatus}`);
                    return (
                      <PressableScale
                        key={item.id}
                        testID={`class-detail-session-${item.id}`}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.title}, ${sessionMeta(item)}, ${statusLabel}`}
                        accessibilityState={{ selected: active }}
                        onPress={() => {
                          setSelected(item.id);
                          setJoinError(false);
                        }}
                        className={
                          active
                            ? 'min-h-[64px] flex-row items-center gap-[10px] rounded-[14px] bg-peach px-[8px] py-[10px]'
                            : 'min-h-[64px] flex-row items-center gap-[10px] rounded-b-[14px] border-b border-line px-[8px] py-[10px]'
                        }
                      >
                        <View
                          className={
                            displayStatus === 'COMPLETED'
                              ? 'h-[32px] w-[32px] min-w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-mint'
                              : active
                                ? 'h-[32px] w-[32px] min-w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-coral'
                                : 'h-[32px] w-[32px] min-w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-soft'
                          }
                        >
                          {displayStatus === 'COMPLETED' ? (
                            <Icon
                              name="check"
                              size={17}
                              light
                            />
                          ) : (
                            <Text
                              className={
                                active
                                  ? 'text-center font-nunito-extrabold text-[14px] text-canvas'
                                  : 'text-center font-nunito-bold text-[14px] text-forest'
                              }
                            >
                              {index + 1}
                            </Text>
                          )}
                        </View>
                        <View className="min-w-[0px] flex-1 gap-[4px]">
                          <Text
                            className={
                              active
                                ? 'font-nunito-extrabold text-[13px] leading-[18px] text-black'
                                : 'font-nunito text-[13px] leading-[18px] text-black'
                            }
                          >
                            {item.title}
                          </Text>
                          <Text className="font-nunito text-[11px] leading-[16px] text-muted">
                            {sessionMeta(item)}
                          </Text>
                        </View>
                        <View
                          className={
                            compact
                              ? 'w-[90px] shrink-0 flex-row items-center justify-end gap-[4px]'
                              : 'w-[80px] shrink-0 flex-row items-center justify-end gap-[4px]'
                          }
                        >
                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.85}
                            className={
                              active || displayStatus === 'CANCELLED'
                                ? 'shrink font-nunito-bold text-[11px] text-headsup'
                                : 'shrink font-nunito-bold text-[11px] text-mint'
                            }
                          >
                            {statusLabel}
                          </Text>
                          <Text
                            accessible={false}
                            className="font-nunito-bold text-[16px] text-mint"
                          >
                            {t('schedule.next')}
                          </Text>
                        </View>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </LearningState>
      )}
    </LearningLayout>
  );
}
