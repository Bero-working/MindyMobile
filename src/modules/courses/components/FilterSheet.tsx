import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppSheet } from '@/components/common/AppSheet';
import { PressableScale } from '@/components/common/PressableScale';
import { Button } from '@/components/ui/Button';
import type { DeliveryMode } from '../types/courses.type';

export function FilterSheet({
  deliveryMode,
  total,
  onApply,
  onPreview,
  onClose,
}: {
  deliveryMode?: DeliveryMode | undefined;
  total?: number | undefined;
  onPreview?: ((mode: DeliveryMode | undefined) => void) | undefined;
  onApply: (filter: { deliveryMode?: DeliveryMode }) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(deliveryMode);
  return (
    <AppSheet onClose={onClose}>
      <View testID="courses-filter-sheet">
        <Text
          accessibilityRole="header"
          className="mb-[16px] font-nunito-extrabold text-[22px] text-black"
        >
          {t('courses.filter.title')}
        </Text>
        <Text className="mb-[10px] font-nunito-extrabold text-[14px] text-black">
          {t('courses.filter.mode')}
        </Text>
        <View className="mb-[20px] flex-row gap-[8px]">
          {(['all', 'ONLINE', 'OFFLINE'] as const).map((id) => (
            <PressableScale
              key={id}
              testID={'courses-filter-mode-' + id}
              accessibilityRole="tab"
              accessibilityState={{ selected: (mode ?? 'all') === id }}
              hitSlop={2}
              onPress={() => {
                const value = id === 'all' ? undefined : id;
                setMode(value);
                onPreview?.(value);
              }}
              className={
                (mode ?? 'all') === id
                  ? 'h-[40px] justify-center rounded-[12px] bg-forest px-[16px]'
                  : 'h-[40px] justify-center rounded-[12px] bg-soft px-[16px]'
              }
            >
              <Text
                className={
                  (mode ?? 'all') === id
                    ? 'font-nunito-extrabold text-[14px] text-canvas'
                    : 'font-nunito-extrabold text-[14px] text-forest'
                }
              >
                {t('courses.filter.' + id)}
              </Text>
            </PressableScale>
          ))}
        </View>
        <View className="flex-row gap-[10px]">
          <Button
            variant="outline"
            testID="courses-filter-reset"
            label={t('courses.filter.reset')}
            onPress={() => {
              setMode(undefined);
              onPreview?.(undefined);
              onApply({});
              onClose();
            }}
            className="min-h-[52px] rounded-[14px] px-[20px]"
          />
          <View className="flex-1">
            <Button
              variant="solid"
              testID="courses-filter-apply"
              label={
                total === undefined
                  ? t('courses.recommend.view')
                  : t('courses.filter.apply', { count: total })
              }
              onPress={() => {
                onApply(mode ? { deliveryMode: mode } : {});
                onClose();
              }}
              className="min-h-[52px] rounded-[14px] px-[12px]"
            />
          </View>
        </View>
      </View>
    </AppSheet>
  );
}
