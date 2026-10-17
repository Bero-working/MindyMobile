import { useState } from 'react';
import { Image, Text, View, type ImageSourcePropType } from 'react-native';
import type { ReactNode } from 'react';
import FastImage from '@d11/react-native-fast-image';
import './interop';
import { Icon } from './Icon';
import { cn } from '@/shared/utilities/cn';
type Props = {
  uri?: string | null;
  source?: ImageSourcePropType | undefined;
  fallback?: ReactNode;
  label: string;
  testID?: string;
  className?: string;
  hideLabel?: boolean;
};
function ImageContent({
  uri,
  source,
  fallback,
  label,
  testID,
  hideLabel,
}: Props) {
  const [failed, setFailed] = useState(false);
  if (source && !failed)
    return (
      <Image
        source={source}
        testID={`${testID}-image`}
        accessibilityLabel={label}
        resizeMode="cover"
        onError={() => setFailed(true)}
        className="h-full w-full"
      />
    );
  if ((!uri || failed) && fallback !== undefined)
    return (
      <View
        testID={`${testID}-fallback`}
        className="flex-1"
        accessible={false}
      >
        {fallback}
      </View>
    );
  return uri && !failed ? (
    <FastImage
      testID={`${testID}-image`}
      source={{ uri }}
      resizeMode={FastImage.resizeMode.cover}
      onError={() => setFailed(true)}
      accessibilityLabel={label}
      className="h-full w-full"
    />
  ) : (
    <View
      testID={`${testID}-fallback`}
      accessibilityRole="image"
      accessibilityLabel={label}
      className={cn(
        'flex-1 gap-2 bg-banner p-3',
        hideLabel ? 'items-start justify-start' : 'items-center justify-center'
      )}
    >
      <Icon
        name="image"
        size={32}
      />
      {!hideLabel && (
        <Text className="text-center font-nunito-bold text-sm text-forest">
          {label}
        </Text>
      )}
    </View>
  );
}
export function CoverImage({ className, ...props }: Props) {
  return (
    <View
      className={cn(
        'aspect-[3/4] overflow-hidden rounded-[20px] bg-soft',
        className
      )}
    >
      <ImageContent
        key={props.uri ?? JSON.stringify(props.source)}
        {...props}
      />
    </View>
  );
}
