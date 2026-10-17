# 0.1 NativeWind

## Mô tả
Cài NativeWind v4 và các thư viện đi kèm, tạo file cấu hình Tailwind, nối vào babel, metro, Jest để component dùng
được `className` với token màu của [GLOBAL_CSS.md](../../CORE/GLOBAL_CSS.md).

## Hạ tầng / ADR
- File khoá bị sửa hoặc tạo: `package.json`, `babel.config.js`, `metro.config.js`, `index.js`, `jest.config.js`,
  `tsconfig.json`, `global.css`, `tailwind.config.js`, `nativewind-env.d.ts`.
- ADR: [ADR-0004](../../adr/ADR-0004-nativewind-nativecn.md).
- Nội dung cấu hình: [guides/styling.md](../../guides/styling.md#global-css-cho-tailwind).

## Task
### 0.1.1 Cài thư viện
- Kết quả mong đợi: `npm i nativewind class-variance-authority clsx tailwind-merge` và
  `npm i -D tailwindcss@^3.4 prettier-plugin-tailwindcss` đã chạy, `package-lock.json` cập nhật.
- Test cần viết trước: smoke test render một `View` có `className` trong Jest. Chạy, phải fail (chưa cấu hình).

### 0.1.2 Tạo file cấu hình Tailwind
- Kết quả mong đợi: `global.css`, `tailwind.config.js` theo guide; `nativewind-env.d.ts` chứa
  `/// <reference types="nativewind/types" />` và được thêm vào `include` của `tsconfig.json`.
- Test cần viết trước: `npm run lint:type-check` báo lỗi khi dùng prop `className` trên `View` trước khi có
  `nativewind-env.d.ts`.

### 0.1.3 Nối babel, metro, entry
- Kết quả mong đợi:
  - `babel.config.js`: `presets: ['module:@react-native/babel-preset', 'nativewind/babel']`. Giữ
    `react-native-reanimated/plugin` ở cuối danh sách plugin.
  - `metro.config.js`: bọc config bằng `withNativeWind(config, { input: './global.css' })` từ `nativewind/metro`,
    giữ cấu hình SVG transformer.
  - `index.js` import `./global.css`.
- Test cần viết trước: smoke test ở 0.1.1.

### 0.1.4 Jest
- Kết quả mong đợi: `jest.config.js` thêm `nativewind|react-native-css-interop` vào `transformIgnorePatterns`. Smoke
  test ở 0.1.1 xanh.
- Test cần viết trước: smoke test ở 0.1.1.

## Tiêu chí nghiệm thu
- [ ] Một `View` dùng `className="bg-mint"` hiện đúng màu `#338A85` trên Android Emulator.
- [ ] SVG import như component vẫn chạy (metro transformer còn nguyên).
- [ ] `npm test`, `npm run lint:type-check` xanh.
- [ ] Bảng tech stack trong [ARCHITECTURE.md](../../ARCHITECTURE.md#tech-stack) đổi NativeWind, cva/clsx/tailwind-merge
      sang "Có".
