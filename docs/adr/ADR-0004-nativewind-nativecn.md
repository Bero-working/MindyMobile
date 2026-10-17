# ADR-0004: Chuyển UI từ rn-kit sang NativeWind + nativecn

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
Boilerplate dùng `@sohantalukder/rn-kit` cho component và theme. Web Mindy Center dùng Tailwind với bộ token trong
[GLOBAL_CSS.md](../CORE/GLOBAL_CSS.md). Mobile cần cùng token màu, font, border để đồng bộ với web.

## Decision
- Style bằng Tailwind qua **NativeWind v4** (`className`). Token khai báo trong `global.css` + `tailwind.config.js`.
- Component UI lấy từ **nativecn** (copy source vào `src/components/ui/`, rồi custom), không cài như package.
- Thư viện đi kèm: `nativewind`, `tailwindcss@^3.4`, `class-variance-authority`, `clsx`, `tailwind-merge`,
  `prettier-plugin-tailwindcss`.
- Tạm giữ `ThemeProvider`, `UiPortalProvider` và `toast` của rn-kit cho tới khi có ADR thay thế. Chỉ dùng một hệ
  toast trong app. Không trộn component rn-kit và nativecn trong cùng một màn hình.

## Alternatives
- Giữ rn-kit + `StyleSheet`: phải tự map token của web, khó đồng bộ.
- Tamagui / gluestack: thêm hệ theme riêng, không dùng lại được class Tailwind của web.

## Consequences
+ Dùng chung token và tên class với web. Component nằm trong repo nên sửa được.
- Phải sửa babel, metro, jest, tsconfig (Phase 0.1). Tạm thời có hai hệ UI cho tới khi bỏ hẳn rn-kit.
