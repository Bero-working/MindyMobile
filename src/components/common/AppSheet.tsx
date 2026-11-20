import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, View, useWindowDimensions } from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
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
  const sheetRef = useRef<BottomSheet>(null);
  // Trượt từ mép dưới lên đủ chậm để thấy rõ (mặc định của thư viện ~250 ms trông như bật ra).
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 380,
    easing: Easing.out(Easing.cubic),
  });
  // Nền mờ theo vị trí sheet: -1 (đóng, nằm dưới màn hình) → 0 (mở).
  const sheetIndex = useSharedValue(reduced ? 0 : -1);
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      sheetIndex.value,
      [-1, 0],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));
  // Android hiện cửa sổ Modal trễ; nếu mount sheet ngay thì hiệu ứng trượt
  // chạy xong trước khi người dùng thấy. Chỉ mount sheet khi Modal đã hiện.
  const [shown, setShown] = useState(reduced);
  // BottomSheet gọi onClose sau khi trượt xuống xong.
  const close = () => {
    if (!locked) onClose();
  };
  // Chạm nền / nút back: cho sheet trượt xuống trước, rồi mới đóng Modal.
  const dismiss = () => {
    if (locked) return;
    if (reduced || !sheetRef.current) onClose();
    else sheetRef.current.close();
  };
  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={dismiss}
      onShow={() => setShown(true)}
      statusBarTranslucent
    >
      <GestureHandlerRootView className="flex-1">
        <Animated.View
          style={backdropStyle}
          className="absolute inset-[0px] bg-forest-deep/45"
        >
          <Pressable
            testID="app-sheet-backdrop"
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            disabled={locked}
            onPress={dismiss}
            className="flex-1"
          />
        </Animated.View>
        {shown && (
          <BottomSheet
            ref={sheetRef}
            animatedIndex={sheetIndex}
            index={0}
            animateOnMount={!reduced}
            enableDynamicSizing
            enableContentPanningGesture={scrollable}
            maxDynamicContentSize={height * (scrollable ? 0.82 : 0.94)}
            enablePanDownToClose={!locked}
            enableHandlePanningGesture={!locked}
            animationConfigs={animationConfigs}
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
        )}
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
