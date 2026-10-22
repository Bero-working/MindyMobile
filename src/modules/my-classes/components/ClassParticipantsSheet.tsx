import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppSheet } from '@/components/common/AppSheet';

export function ClassParticipantsSheet({
  mentorName,
  classCode,
  onClose,
}: {
  mentorName: string | null;
  classCode: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const initials = mentorName
    ?.trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(-2)
    .join('')
    .toUpperCase();
  return (
    <AppSheet onClose={onClose}>
      <View
        testID="class-participants-sheet"
        className="gap-[16px] pb-[8px]"
      >
        <Text
          accessibilityRole="header"
          className="font-nunito-bold text-[13px] text-muted"
        >
          {t('classDetail.mentorLabel')}
        </Text>
        {mentorName ? (
          <View className="flex-row items-center gap-[12px] rounded-[16px] bg-soft p-[12px]">
            <View className="h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-sunshine">
              <Text className="font-nunito-extrabold text-[15px] text-mint">
                {initials}
              </Text>
            </View>
            <View className="min-w-[0px] flex-1 gap-[3px]">
              <Text
                testID="class-participants-mentor"
                className="font-nunito-bold text-[15px] text-black"
              >
                {mentorName}
              </Text>
              <Text className="font-nunito text-[12px] text-muted">
                {t('classDetail.participants.mentorClass', { code: classCode })}
              </Text>
            </View>
          </View>
        ) : (
          <Text className="font-nunito text-[14px] text-muted">
            {t('classDetail.noMentor')}
          </Text>
        )}
        <Text
          accessibilityRole="header"
          className="font-nunito-bold text-[13px] text-muted"
        >
          {t('classDetail.participants.students')}
        </Text>
        <View className="rounded-[16px] bg-soft p-[16px]">
          <Text
            testID="class-participants-pending"
            className="font-nunito text-[14px] leading-[22px] text-muted"
          >
            {t('classDetail.participants.pending')}
          </Text>
        </View>
      </View>
    </AppSheet>
  );
}
