import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { colors } from '@/theme/colors';
import type { Material } from './materials.service';

const typeStyle: Record<
  Material['contentType'],
  { icon: IconName; tile: string; color: string }
> = {
  ARTICLE: { icon: 'book', tile: 'bg-cover-a-soft', color: colors.forest },
  FILE: { icon: 'document', tile: 'bg-peach', color: colors.coral },
  VIDEO: { icon: 'play', tile: 'bg-cream', color: colors.statusYellow },
};

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MaterialCard({
  item,
  onPress,
}: {
  item: Material;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const style = typeStyle[item.contentType];
  const meta = [
    item.file &&
      `${item.file.originalFilename} · ${formatFileSize(item.file.sizeBytes)}`,
    item.attachmentCount > 0 &&
      t('materials.attachmentCount', { count: item.attachmentCount }),
  ].filter((value): value is string => !!value);
  return (
    <PressableScale
      testID={`material-open-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={t('materials.openA11y', {
        type: t(`materials.type.${item.contentType}`),
        title: item.title,
      })}
      onPress={onPress}
      className="flex-row items-center gap-[14px] rounded-[20px] border border-line bg-canvas p-[14px]"
    >
      <View
        className={`h-[48px] w-[48px] items-center justify-center rounded-[14px] ${style.tile}`}
      >
        <Icon
          name={style.icon}
          size={22}
          color={style.color}
        />
      </View>
      <View className="flex-1 gap-[3px]">
        <Text className="font-nunito-bold text-[12px] uppercase tracking-[0.6px] text-mint">
          {t(`materials.type.${item.contentType}`)}
        </Text>
        <Text
          numberOfLines={2}
          className="font-nunito-extrabold text-[16px] leading-[22px] text-black"
        >
          {item.title}
        </Text>
        {!!item.description && (
          <Text
            numberOfLines={2}
            className="font-nunito text-[13px] leading-[18px] text-muted"
          >
            {item.description}
          </Text>
        )}
        {meta.map((line) => (
          <Text
            key={line}
            numberOfLines={1}
            className="font-nunito-semibold text-[12px] text-muted"
          >
            {line}
          </Text>
        ))}
      </View>
      <View className="h-[32px] w-[32px] items-center justify-center rounded-full bg-soft">
        <Icon
          name="arrow"
          size={16}
          color={colors.forest}
        />
      </View>
    </PressableScale>
  );
}
