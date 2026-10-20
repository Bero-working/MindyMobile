import { useMemo, type ReactNode } from 'react';
import { Modal, Pressable, View, useWindowDimensions } from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

export function AppSheet({
  children,
  onClose,
  locked = false,
  scrollable = true,
}: {
  children: ReactNode;
  onClose: () => void;
  locked?: boolean;
  scrollable?: boolean;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { t } = useTranslation();
  const contentStyle = useMemo(
    () => ({ paddingBottom: 32 + insets.bottom, paddingHorizontal: 18 }),
    [insets.bottom]
  );
  const fixedContentStyle = useMemo(
    () => ({
      ...contentStyle,
      paddingBottom: 8 + insets.bottom,
      maxHeight: height * 0.94 - 29,
    }),
    [contentStyle, height, insets.bottom]
  );
  const close = () => {
    if (!locked) onClose();
  };
  return (
    <Modal
      transparent
      visible
      animationType={reduced ? 'none' : 'fade'}
      onRequestClose={close}
      statusBarTranslucent
    >
      <GestureHandlerRootView className="flex-1">
        <Pressable
          testID="app-sheet-backdrop"
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          disabled={locked}
          onPress={close}
          className="absolute inset-[0px] bg-forest-deep/45"
        />
        <BottomSheet
          index={0}
          enableDynamicSizing
          enableContentPanningGesture={scrollable}
          maxDynamicContentSize={height * (scrollable ? 0.82 : 0.94)}
          enablePanDownToClose={!locked}
          enableHandlePanningGesture={!locked}
          animateOnMount={!reduced}
          onClose={close}
          backgroundComponent={SheetBackground}
          handleComponent={SheetHandle}
        >
          {scrollable ? (
            <BottomSheetScrollView
              contentContainerStyle={contentStyle}
              keyboardShouldPersistTaps="handled"
            >
              <View
                testID="app-sheet"
                accessibilityViewIsModal
              >
                {children}
              </View>
            </BottomSheetScrollView>
          ) : (
            <BottomSheetView style={fixedContentStyle}>
              <View
                testID="app-sheet"
                accessibilityViewIsModal
                className="shrink"
              >
                {children}
              </View>
            </BottomSheetView>
          )}
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
}

function SheetBackground() {
  return <View className="absolute inset-[0px] rounded-t-[28px] bg-canvas" />;
}
function SheetHandle() {
  return (
    <View
      testID="app-sheet-handle"
      className="items-center pb-[14px] pt-[10px]"
    >
      <View className="h-[5px] w-[40px] rounded-[9px] bg-line" />
    </View>
  );
}
