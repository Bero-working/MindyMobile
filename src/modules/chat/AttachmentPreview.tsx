import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { cn } from '@/shared/utilities/cn';
import { colors } from '@/theme/colors';

export type AttachmentPreviewFile = {
  uri: string;
  name: string;
  mime: string;
  size: number;
};
export type AttachmentStatus = 'uploading' | 'processing' | 'ready';

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKind(file: AttachmentPreviewFile) {
  const subtype = file.mime.split('/')[1] ?? '';
  return (subtype === 'jpeg' ? 'jpg' : subtype).toUpperCase();
}

export function AttachmentPreview({
  file,
  status,
  removeDisabled,
  onRemove,
}: {
  file: AttachmentPreviewFile;
  status: AttachmentStatus;
  removeDisabled: boolean;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const image = file.mime.startsWith('image/');
  const uploading = status === 'uploading';
  const ready = status === 'ready';
  return (
    <View
      testID="chat-attachment-preview"
      className="mx-3 mt-3 flex-row items-center gap-3 rounded-[18px] border border-line bg-soft p-2 pr-3"
    >
      <View className="h-[56px] w-[56px] overflow-hidden rounded-[12px] bg-canvas">
        {image ? (
          <Image
            testID="chat-attachment-thumb-image"
            source={{ uri: file.uri }}
            accessibilityLabel={t('chat.attach.preview')}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View
            testID="chat-attachment-thumb-pdf"
            className="h-full w-full items-center justify-center gap-[2px] bg-cover-c-soft"
          >
            <Icon
              name="document"
              size={22}
              color={colors.ember}
            />
            <Text className="font-nunito-extrabold text-[10px] text-ember">
              {fileKind(file)}
            </Text>
          </View>
        )}
        {uploading && (
          <View className="absolute inset-[0px] items-center justify-center bg-forest-deep/45">
            <ActivityIndicator color={colors.canvas} />
          </View>
        )}
      </View>
      <View className="flex-1 gap-[3px]">
        <Text
          numberOfLines={1}
          className="font-nunito-bold text-[14px] text-black"
        >
          {file.name}
        </Text>
        <View className="flex-row items-center gap-[5px]">
          {ready ? (
            <View className="h-[16px] w-[16px] items-center justify-center rounded-full bg-mint">
              <Icon
                name="check"
                size={11}
                light
              />
            </View>
          ) : (
            !uploading && (
              <ActivityIndicator
                size="small"
                color={colors.muted}
              />
            )
          )}
          <Text
            accessibilityLiveRegion="polite"
            className={cn(
              'font-nunito-semibold text-[12.5px]',
              ready ? 'text-mint' : 'text-muted'
            )}
          >
            {t(
              uploading
                ? 'chat.attach.uploading'
                : ready
                  ? 'chat.attach.ready'
                  : 'chat.attach.processing'
            )}
          </Text>
        </View>
        <Text className="font-nunito text-[11.5px] text-muted">
          {`${fileKind(file)} · ${formatFileSize(file.size)}`}
        </Text>
      </View>
      {!uploading && (
        <PressableScale
          testID="chat-attachment-remove"
          accessibilityRole="button"
          accessibilityLabel={t('chat.attach.remove')}
          accessibilityState={{ disabled: removeDisabled }}
          disabled={removeDisabled}
          onPress={onRemove}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          className={cn(
            'h-[36px] w-[36px] items-center justify-center rounded-full border border-line bg-canvas',
            removeDisabled && 'opacity-40'
          )}
        >
          <Icon
            name="close"
            size={16}
            color={colors.forest}
          />
        </PressableScale>
      )}
    </View>
  );
}
