# Hình ảnh và animation thay cho card

Cách trình bày danh sách và section bằng ảnh, khối màu, animation thay cho card, cùng quy tắc ảnh và Reanimated. Đọc
khi làm màn hình có danh sách, ảnh hoặc hiệu ứng. Lý do: [ADR-0010](../adr/ADR-0010-images-over-cards.md).

## Hạn chế card

- **KHÔNG** dùng card (khung viền + bóng) làm mặc định cho item danh sách.
- Ưu tiên:
  - **Ảnh bìa tràn**: ảnh 16:9 bo `rounded-2xl`, gradient tối ở đáy, tiêu đề và giá đặt trên gradient.
  - **Carousel ngang** cho danh mục, khoá học nổi bật, lớp sắp khai giảng.
  - **Row phẳng**: thumbnail + text, phân tách bằng khoảng trắng hoặc `border-b border-line` mảnh.
  - **Khối nền màu** (`bg-banner`, `bg-feature`, `bg-logo-soft`, `bg-hero`) cho section, không viền.
- Card chỉ dùng khi cần gom nhóm thông tin không có ảnh: tóm tắt thanh toán, thông tin order, form trong Dialog.
- Empty state và error state dùng **illustration SVG** (`src/assets/illustrations/`), không chỉ có chữ.
- Ảnh chưa có (`imgUrl: null`) dùng ảnh placeholder theo danh mục, không để khung trống.

## Ảnh

- Ảnh mạng dùng `FastImage` (cache, priority). Ảnh local dùng `require` hoặc SVG component.
- Luôn đặt kích thước hoặc `aspect-video` / `aspect-square` để không giật layout khi ảnh tải xong.
- Có placeholder (`bg-soft`) và hiệu ứng fade-in khi ảnh tải xong.
- Gradient overlay vẽ bằng `react-native-svg` (`LinearGradient`), màu lấy từ `colors.ts`.
- Ảnh có nội dung phải có `accessibilityLabel`. Ảnh trang trí đặt `accessible={false}`.

## Animation (Reanimated 3)

| Loại | Cách làm | Thời lượng |
| --- | --- | --- |
| Phản hồi chạm | Scale 1 → 0.97 trên `Pressable` (`PressableScale`) | 120–150ms |
| Item xuất hiện | `FadeInDown` lệch theo index, **chỉ 8 item đầu** | 200–300ms, delay 40ms/item |
| Ảnh tải xong | Opacity 0 → 1 | 200ms |
| Loading | `Skeleton` của nativecn đúng layout thật, không dùng spinner toàn màn hình | — |
| Đổi màn hình | Transition mặc định của React Navigation | — |
| Bottom sheet | `@gorhom/bottom-sheet` | — |

Quy tắc:

- Chỉ animate `transform` và `opacity`. Không animate `width`, `height`, `top`, `left`.
- Chạy trên UI thread (worklet). Gọi JS từ worklet qua `runOnJS`.
- Tôn trọng **Reduce Motion**: `useReducedMotion()` trả `true` thì tắt entering animation và vòng lặp.
- Thời lượng và easing lấy từ `src/theme/motion.ts`, không hard-code số trong component.
- Không thêm Lottie hoặc thư viện animation khác khi chưa có ADR ([B.8](../README.md#b8-hạ-tầng-và-công-nghệ-mới)).

```ts
// src/theme/motion.ts
import { Easing } from 'react-native-reanimated';

export const motion = {
  duration: { fast: 150, base: 250, slow: 350 },
  easing: Easing.out(Easing.cubic),
  pressScale: 0.97,
  staggerMs: 40,
  staggerLimit: 8,
} as const;
```

```tsx
// src/components/common/PressableScale/PressableScale.tsx
import { memo, useCallback, type ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme/motion';

type PressableScaleProps = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  className?: string;
};

export const PressableScale = memo(function PressableScale({
  children,
  className,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animateTo = useCallback(
    (value: number) => {
      if (reducedMotion) return;
      scale.value = withTiming(value, {
        duration: motion.duration.fast,
        easing: motion.easing,
      });
    },
    [reducedMotion, scale]
  );

  const handlePressIn = useCallback(() => animateTo(motion.pressScale), [animateTo]);
  const handlePressOut = useCallback(() => animateTo(1), [animateTo]);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className={className}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
});
```
