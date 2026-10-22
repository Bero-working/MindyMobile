// Adapted from Mobilecn-UI/nativecn-ui components/Input.tsx (MIT).
import { forwardRef, useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { cn } from '@/shared/utilities/cn';
import { colors } from '@/theme/colors';

type Props = TextInputProps & {
  label: string;
  error?: string | undefined;
  password?: boolean;
  icon?: IconName;
  className?: string;
};
export const Input = forwardRef<TextInput, Props>(function LabeledInput(
  {
    label,
    error,
    password = false,
    icon,
    className,
    testID,
    editable = true,
    ...props
  },
  ref
) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <View className={cn('mb-[14px] gap-[6px]', className)}>
      <Text className="font-nunito-bold text-[13.5px] text-black">{label}</Text>
      <View
        className={cn(
          'min-h-[50px] flex-row items-center gap-[10px] rounded-full border-[1.5px] bg-canvas px-[14px]',
          error ? 'border-headsup' : 'border-line'
        )}
      >
        {icon && (
          <Icon
            name={icon}
            size={17}
          />
        )}
        <TextInput
          {...props}
          ref={ref}
          testID={testID}
          editable={editable}
          accessibilityLabel={label}
          accessibilityHint={error}
          secureTextEntry={password ? !visible : props.secureTextEntry}
          placeholderTextColor={colors.muted}
          selectionColor={colors.mint}
          className="min-h-[48px] flex-1 py-[8px] font-nunito text-[15px] text-black"
        />
        {password && (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t(
              visible ? 'common.hidePassword' : 'common.showPassword'
            )}
            accessibilityState={{ disabled: !editable }}
            disabled={!editable}
            testID={
              testID ? `${testID.replace(/-input$/, '')}-toggle` : undefined
            }
            onPress={() => setVisible(!visible)}
            className="min-h-[44px] min-w-[44px] items-center justify-center"
          >
            <Icon
              name={visible ? 'eyeOff' : 'eye'}
              size={18}
            />
          </PressableScale>
        )}
      </View>
      {error && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          className="pl-[14px] font-nunito-semibold text-[12.5px] text-headsup"
        >
          {error}
        </Text>
      )}
    </View>
  );
});
