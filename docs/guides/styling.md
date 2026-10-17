# Styling: NativeWind, nativecn và token màu

Cách style component bằng NativeWind, cách thêm và custom component nativecn, và cách chuyển token từ
[GLOBAL_CSS.md](../CORE/GLOBAL_CSS.md) sang Tailwind cho mobile. Đọc khi viết bất kỳ UI nào. Quyết định liên quan:
[ADR-0004](../adr/ADR-0004-nativewind-nativecn.md) (NativeWind + nativecn), [ADR-0005](../adr/ADR-0005-light-mode-only.md)
(chỉ light mode).

> NativeWind/token đã triển khai trong Phase 0.1–0.3, đã kiểm tra màu/font trên Android Emulator. Component nativecn chưa thêm.
> ([IMPLEMENT/PHASE_00_FOUNDATION](../IMPLEMENT/PHASE_00_FOUNDATION/README.md)).

## Styling

- Style bằng `className` của NativeWind. Không dùng `StyleSheet` cho style tĩnh mới.
- **KHÔNG ĐƯỢC** inline style object (`style={{ ... }}`) và màu literal (`#fff`, `'red'`). ESLint đã chặn.
- `style={...}` chỉ dùng cho giá trị động: style của Reanimated (`useAnimatedStyle`) và biến CSS vùng (`regionVars`,
  xem [Ghi đè theo vùng](#ghi-đè-theo-vùng)).
- Màu chỉ lấy từ token ([Global CSS](#global-css-cho-tailwind)). **KHÔNG ĐƯỢC** dùng palette mặc định của Tailwind
  (`bg-slate-700`, `text-gray-500`...). Prop không nhận `className` (`selectionColor`, `placeholderTextColor`,
  `ActivityIndicator.color`, SVG `fill`, theme của React Navigation, `StatusBar`) lấy màu từ `src/theme/colors.ts`.
- Ghép class bằng `cn()`:

```ts
// src/shared/utilities/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
```

- Component ngoài (FastImage, Svg...) muốn nhận `className` phải đăng ký `cssInterop` một lần trong
  `src/components/common/interop.ts`.

## nativecn

nativecn là bộ component kiểu shadcn/ui cho React Native: không cài package, copy source vào repo rồi sửa. Danh sách:
Avatar, Badge, Button, Card, Checkbox, Dialog, Drop down, Input, Progress, Radio group, Select, Skeleton, Switch,
Tabs, Toast.

Cách thêm một component:

1. Lấy source bằng `npx nativecn-ui add <Component>` hoặc copy từ
   https://github.com/Mobilecn-UI/nativecn-ui/tree/main/components.
2. Đặt vào `src/components/ui/<Component>/<Component>.tsx` kèm `index.ts`. Đổi import `../lib/utils` thành
   `@/shared/utilities/cn`.
3. **Viết test cho hành vi hiện có trước khi sửa** ([testing.md](testing.md)).
4. Custom theo bảng dưới, chạy lại test.

| Việc phải sửa | Lý do |
| --- | --- |
| Đổi màu palette mặc định sang token (`ghost: 'bg-slate-700'` → `bg-secondary`, `text-foreground`...) | Đúng màu GLOBAL_CSS |
| Thêm variant còn thiếu theo GLOBAL_CSS §4: `outline`, `action` (CTA coral) | Đồng bộ với web |
| Chiều cao tối thiểu 44 (`h-11` trở lên) hoặc `hitSlop` | Vùng chạm ([ux.md](ux.md)) |
| `accessibilityRole`, `accessibilityState` (`disabled`, `busy`), `accessibilityLabel` | Accessibility |
| Prop `loading`: hiện spinner, khoá bấm | Chống bấm hai lần |
| Prop `testID` truyền xuống phần tử bấm được | Maestro / RNTL |
| Font qua class `font-nunito-*` | Android không tự chọn weight cho font custom |
| Nếu import gói `expo-*` → thay bằng thư viện RN CLI tương đương | Repo không dùng Expo ([ADR-0001](../adr/ADR-0001-rn-cli-no-expo.md)) |
| Thay `TouchableOpacity` bằng `Pressable` + phản hồi chạm ([visual-and-motion.md](visual-and-motion.md)) | Nhất quán animation |

Quan hệ với `@sohantalukder/rn-kit`:

- Component UI mới dùng nativecn + NativeWind. Không trộn component rn-kit và nativecn trong cùng một màn hình.
- `ThemeProvider`, `UiPortalProvider` và `toast` của rn-kit giữ nguyên cho tới khi team quyết định thay.
  Chỉ dùng **một** hệ toast trong app.

## Global CSS cho Tailwind

Chuyển từ [GLOBAL_CSS.md](../CORE/GLOBAL_CSS.md) sang NativeWind. Màu khai báo dạng biến CSS chứa 3 kênh RGB để dùng
được độ mờ (`bg-mint/50`, `shadow-forest/20`).

Quy tắc:

- Đổi màu → sửa `global.css` **và** `src/theme/colors.ts` cùng lúc. Có test đối chiếu hai file
  ([testing.md](testing.md#test-bắt-buộc-khác)).
- Màu dẫn xuất (`soft`, `line`, `muted`...) dùng hex đã quy đổi trong GLOBAL_CSS, không tự pha lại.
- App v1 chỉ có **light mode**. Dark mode chưa có bảng màu thì chưa làm.

### `global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* 1. Màu gốc (brand) */
  --canvas: 255 255 255; /* #FFFFFF */
  --mint: 51 138 133; /* #338A85 */
  --forest: 29 91 87; /* #1D5B57 */
  --coral: 255 127 80; /* #FF7F50 */
  --headsup: 255 84 0; /* #FF5400 */
  --sunshine: 255 221 174; /* #FFDDAE */
  --logo-soft: 216 240 250; /* #D8F0FA */
  --black: 0 0 0; /* #000000 */

  /* 2. Màu pha (dẫn xuất) */
  --soft: 241 247 246; /* #F1F7F6  mint 7% + trắng */
  --line: 216 233 232; /* #D8E9E8  mint 19% + trắng */
  --muted: 52 107 104; /* #346B68  forest 90% + trắng */
  --peach: 255 238 232; /* #FFEEE8  coral 13% + trắng */
  --action: 255 153 115; /* #FF9973  coral 80% + trắng */
  --action-hover: 255 165 132; /* #FFA584  coral 70% + trắng */
  --banner: 202 225 223; /* #CAE1DF  mint 26% + trắng */
  --catalog-ink: 38 38 38; /* #262626  đen 85% + trắng */

  /* Trạng thái */
  --status-green: 21 128 61; /* #15803D */
  --status-yellow: 161 98 7; /* #A16207 */
  --status-red: 185 28 28; /* #B91C1C */
  --pastel-red: 213 119 119; /* #D57777 */
  --ink-soft: 46 46 46; /* #2E2E2E */
  --ink-gray: 107 107 107; /* #6B6B6B */

  /* 3. Token ngữ nghĩa (ghi giá trị trực tiếp, không trỏ var() lồng nhau) */
  --background: 255 255 255; /* canvas */
  --foreground: 29 91 87; /* forest */
  --card: 255 255 255; /* canvas */
  --card-foreground: 29 91 87; /* forest */
  --popover: 255 255 255; /* canvas */
  --popover-foreground: 29 91 87; /* forest */
  --primary: 29 91 87; /* forest */
  --primary-foreground: 255 255 255; /* canvas */
  --secondary: 241 247 246; /* soft */
  --secondary-foreground: 29 91 87; /* forest */
  --accent: 241 247 246; /* soft */
  --accent-foreground: 29 91 87; /* forest */
  --border: 216 233 232; /* line */
  --input: 216 233 232; /* line */
  --ring: 51 138 133; /* mint */
  --muted-foreground: 52 107 104; /* muted */
  --destructive: 255 84 0; /* headsup */
  --destructive-foreground: 255 255 255; /* canvas */
  --hero: 51 138 133; /* mint */
  --hero-ink: 255 255 255; /* canvas */
  --hero-copy: 255 255 255; /* canvas */
  --feature: 255 221 174; /* sunshine */
}

/* 7. Kiểu chữ dùng chung (GLOBAL_CSS §7, bỏ breakpoint sm/lg của web) */
@layer components {
  .section-title {
    @apply font-nunito-extrabold text-3xl tracking-tight text-foreground;
  }

  .eyebrow {
    @apply font-nunito-extrabold text-xs uppercase tracking-[0.14em] text-mint;
  }

  .text-link {
    @apply font-nunito-extrabold text-sm text-mint;
  }

  .body-text {
    @apply font-nunito text-base text-foreground;
  }

  .caption {
    @apply font-nunito text-sm text-muted-foreground;
  }
}
```

### `tailwind.config.js`

```js
/* eslint-disable @typescript-eslint/no-require-imports */

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.js', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        mint: token('mint'),
        forest: token('forest'),
        coral: token('coral'),
        headsup: token('headsup'),
        sunshine: token('sunshine'),
        'logo-soft': token('logo-soft'),
        black: token('black'),
        soft: token('soft'),
        line: token('line'),
        muted: {
          DEFAULT: token('muted'),
          foreground: token('muted-foreground'),
        },
        peach: token('peach'),
        action: {
          DEFAULT: token('action'),
          hover: token('action-hover'),
        },
        banner: token('banner'),
        'catalog-ink': token('catalog-ink'),
        status: {
          green: token('status-green'),
          yellow: token('status-yellow'),
          red: token('status-red'),
        },
        'pastel-red': token('pastel-red'),
        'ink-soft': token('ink-soft'),
        'ink-gray': token('ink-gray'),

        background: token('background'),
        foreground: token('foreground'),
        card: {
          DEFAULT: token('card'),
          foreground: token('card-foreground'),
        },
        popover: {
          DEFAULT: token('popover'),
          foreground: token('popover-foreground'),
        },
        primary: {
          DEFAULT: token('primary'),
          foreground: token('primary-foreground'),
        },
        secondary: {
          DEFAULT: token('secondary'),
          foreground: token('secondary-foreground'),
        },
        accent: {
          DEFAULT: token('accent'),
          foreground: token('accent-foreground'),
        },
        destructive: {
          DEFAULT: token('destructive'),
          foreground: token('destructive-foreground'),
        },
        border: token('border'),
        input: token('input'),
        ring: token('ring'),
        hero: {
          DEFAULT: token('hero'),
          ink: token('hero-ink'),
          copy: token('hero-copy'),
        },
        feature: token('feature'),
      },
      fontFamily: {
        nunito: ['Nunito-Regular'],
        'nunito-semibold': ['Nunito-SemiBold'],
        'nunito-bold': ['Nunito-Bold'],
        'nunito-extrabold': ['Nunito-ExtraBold'],
      },
    },
  },
  plugins: [],
};
```

### `src/theme/colors.ts`

Chỉ dùng cho prop không nhận `className` ([Styling](#styling)).

```ts
export const colors = {
  canvas: '#FFFFFF',
  mint: '#338A85',
  forest: '#1D5B57',
  coral: '#FF7F50',
  headsup: '#FF5400',
  sunshine: '#FFDDAE',
  logoSoft: '#D8F0FA',
  black: '#000000',
  soft: '#F1F7F6',
  line: '#D8E9E8',
  muted: '#346B68',
  peach: '#FFEEE8',
  action: '#FF9973',
  actionHover: '#FFA584',
  banner: '#CAE1DF',
  catalogInk: '#262626',
  statusGreen: '#15803D',
  statusYellow: '#A16207',
  statusRed: '#B91C1C',
  pastelRed: '#D57777',
  inkSoft: '#2E2E2E',
  inkGray: '#6B6B6B',
} as const;

export type ColorToken = keyof typeof colors;
```

### Font

- Font chính **Nunito**. Mobile không dùng bản Variable; dùng file tĩnh `Nunito-Regular.ttf`, `Nunito-SemiBold.ttf`,
  `Nunito-Bold.ttf`, `Nunito-ExtraBold.ttf` đặt trong `assets/fonts/` (đã khai báo trong `react-native.config.js`),
  rồi chạy `npx react-native-asset`.
- Đậm/nhạt dùng `font-nunito-bold`... **KHÔNG** dùng `font-bold` với Nunito vì Android không tự chọn file theo weight.
- Font `Inter` chỉ dùng nếu mobile có màn hình admin.

### Ghi đè theo vùng

Web dùng class bọc (`.home-content`, `.cart-content`...). Trên mobile dùng `vars()` của NativeWind, đặt ở
`style` của `View` bọc vùng đó:

```ts
// src/theme/regions.ts
import { vars } from 'nativewind';

const BLACK = '0 0 0';
const CATALOG_INK = '38 38 38';

export const regionVars = {
  // Trang chủ: forest và muted thành đen
  home: vars({
    '--forest': BLACK,
    '--muted': BLACK,
    '--foreground': BLACK,
    '--muted-foreground': BLACK,
  }),
  // Giỏ hàng: các token *-foreground thành đen
  cart: vars({
    '--foreground': BLACK,
    '--card-foreground': BLACK,
    '--popover-foreground': BLACK,
    '--secondary-foreground': BLACK,
    '--accent-foreground': BLACK,
    '--muted-foreground': BLACK,
  }),
  // Chi tiết khoá học: chữ forest/muted/mint thành đen. SVG lấy màu từ colors.ts nên không bị ảnh hưởng.
  courseDetail: vars({
    '--forest': BLACK,
    '--muted': BLACK,
    '--mint': BLACK,
    '--foreground': BLACK,
    '--muted-foreground': BLACK,
  }),
  // Danh sách khoá học: thành catalog-ink. Bộ lọc đặt ngoài View này để giữ màu gốc.
  catalog: vars({
    '--forest': CATALOG_INK,
    '--muted': CATALOG_INK,
    '--mint': CATALOG_INK,
    '--foreground': CATALOG_INK,
    '--muted-foreground': CATALOG_INK,
  }),
} as const;
```

```tsx
<View
  style={regionVars.home}
  className="flex-1 bg-background"
>
  ...
</View>
```

### Trạng thái tương tác trên mobile

| Web | Mobile |
| --- | --- |
| Hover (`hover:bg-soft`) | Khi nhấn: `active:bg-soft`, `active:opacity-90` trên `Pressable` + scale ([visual-and-motion.md](visual-and-motion.md)) |
| Focus outline mint 3px | `TextInput`: `focus:border-mint`, viền 1.5–2px |
| Lỗi input viền headsup | `border-destructive` + dòng lỗi `text-destructive` dưới input |
| Vùng chọn chữ nền mint | `selectionColor={colors.mint}`, `cursorColor={colors.mint}` |
| `.home-content`, `.cart-content`... | `regionVars` ([Ghi đè theo vùng](#ghi-đè-theo-vùng)) |
