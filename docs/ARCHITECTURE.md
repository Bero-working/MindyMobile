# Kiến trúc MindyMobile

Mô tả kiến trúc của app: tech stack, cây thư mục, cấu trúc feature module, tầng gọi API và danh sách file hạ tầng bị
khoá. Đọc trước khi tạo module mới, thêm thư viện hoặc động vào cấu hình. Lý do của từng lựa chọn nằm trong
[adr/](adr/README.md).

## Tech stack

Cột "Trạng thái" theo `package.json` hiện tại. Thêm thư viện mới phải theo
[quy trình B.8](README.md#b8-hạ-tầng-và-công-nghệ-mới): viết ADR, owner duyệt, rồi mới cài và cập nhật bảng này.

| Hạng mục | Lựa chọn | Trạng thái | ADR |
| --- | --- | --- | --- |
| Framework | React Native 0.80 (CLI, không Expo), React 19 | Có | [0001](adr/ADR-0001-rn-cli-no-expo.md) |
| Công cụ RN CLI | CLI/Android/iOS 19.1.2 (khớp RN 0.80) | Có | [0016](adr/ADR-0016-react-native-cli-compatibility.md) |
| Ngôn ngữ | TypeScript strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) | Có | [0009](adr/ADR-0009-no-any-unknown-zod.md) |
| HTTP | Axios, bọc trong class `Http` (`src/config/http/http.config.ts`) | Có | [0002](adr/ADR-0002-cookie-auth.md) |
| Server state | TanStack Query v5 | Có | [0003](adr/ADR-0003-tanstack-query-zustand.md) |
| Client state | Zustand (slice) | Có | [0003](adr/ADR-0003-tanstack-query-zustand.md) |
| Navigation | `@react-navigation/native`, `@react-navigation/stack` | Có | — |
| Lưu trữ cục bộ | `react-native-mmkv` (theme, ngôn ngữ; **không** lưu token) | Có | [0002](adr/ADR-0002-cookie-auth.md) |
| Env | `react-native-config`, đọc qua `src/config/env.ts` | Có | — |
| Trạng thái mạng | `@react-native-community/netinfo` | Có | [0003](adr/ADR-0003-tanstack-query-zustand.md) |
| Safe area | `react-native-safe-area-context` | Có | — |
| Styling | Tailwind qua **NativeWind v4** (`className`) | Có (đã kiểm tra Android) | [0004](adr/ADR-0004-nativewind-nativecn.md) |
| UI component | **nativecn** (https://nativecn.mintlify.app), copy vào repo rồi custom | **Chưa cài** | [0004](adr/ADR-0004-nativewind-nativecn.md) |
| Biến thể class | `class-variance-authority`, `clsx`, `tailwind-merge` | Có (đã kiểm tra Android) | [0004](adr/ADR-0004-nativewind-nativecn.md) |
| UI kit cũ | `@sohantalukder/rn-kit` (chỉ giữ `ThemeProvider`, `UiPortalProvider`, `toast`) | Có | [0004](adr/ADR-0004-nativewind-nativecn.md) |
| Animation | `react-native-reanimated` 3 | Có | [0010](adr/ADR-0010-images-over-cards.md) |
| Bottom sheet | `@gorhom/bottom-sheet` | Có | — |
| Ảnh | `@d11/react-native-fast-image`, `react-native-svg` | Có | — |
| List | `FlatList`, `@shopify/flash-list` | Có | — |
| Form/validation | `zod` | Có | [0009](adr/ADR-0009-no-any-unknown-zod.md) |
| i18n | `i18next` + `react-i18next` | Có | [0006](adr/ADR-0006-vietnamese-default.md) |
| UUID v4 cho `Idempotency-Key` | `uuid` + `react-native-get-random-values` (Hermes không có `crypto.randomUUID`) | Có (uuid v11, polyfill v1.11; Hermes đã kiểm tra) | [0015](adr/ADR-0015-idempotency-key-uuid.md) |
| Lưu trữ mã hoá | `react-native-encrypted-storage` | **Chưa cài**. Chưa có rule hay ADR nào dùng | — |
| Unit/component test | Jest + `@testing-library/react-native` | Có | [0008](adr/ADR-0008-tdd.md) |
| Mock API trong test | **MSW** (`msw/node`) | Có (Phase 0.9) | [0007](adr/ADR-0007-maestro-msw.md) |
| E2E | **Maestro** (CLI, không phải gói npm) | CLI 2.11.0, app-launch Android đã qua | [0007](adr/ADR-0007-maestro-msw.md) |

## Hiện trạng repo

Repo dựng từ boilerplate `@sohantalukder/react-native-boilerplate`. `package.json`, `README.md` gốc, module `example` và
`contacts` vẫn là phần mẫu của template.

- **Entry**: `index.js` → `src/index.tsx`. Thứ tự provider: `SafeAreaProvider` → `GestureHandlerRootView` →
  `QueryClientProvider` → `ThemeProvider` (rn-kit) → `UiPortalProvider` → `Navigation`.
- **Navigation** (`src/navigation/`): một Stack navigator.
- **HTTP** (`src/config/http/http.config.ts`): class `Http` bọc Axios, trả thẳng `response.data`. Interceptor hiện
  dùng cookie, chuẩn hoá ApiError và refresh single-flight theo [ADR-0002](adr/ADR-0002-cookie-auth.md).
- **Env**: `react-native-config` (`API_URL`, `APP_ORIGIN`, `APP_ENV`, `DEBUG_MODE`). Debug dùng `.env`, release dùng
  `.env.production`. Khi `APP_ENV=development`, Android tự đổi `localhost` thành `10.0.2.2`.
- **Import alias**: `@/` → `src/` (babel `module-resolver` + tsconfig `paths`). SVG import như component.

### Đối chiếu tên với boilerplate

Tài liệu boilerplate (https://sohantalukder.github.io/react-native-boilerplate/docs/project-structure/) và repo thực tế
đặt tên hơi khác nhau. **Theo tên trong repo** ([ADR-0012](adr/ADR-0012-repo-folder-naming.md)):

| Boilerplate docs | Repo MindyMobile |
| --- | --- |
| `src/store/` | `src/state/` (`store.ts` + `slices/`) |
| `src/utils/` | `src/shared/utilities/` |
| `src/hooks/` | `src/shared/hooks/` |
| `App.tsx` | `src/index.tsx` |

## Cây thư mục

Cây đích sau Phase 0. Thư mục chưa có trong repo (`tests/`, `e2e/`, `assets/fonts/`, `src/theme/`,
`src/components/`) sẽ được tạo ở Phase 0.

```
MindyMobile/
├── global.css                  # Token Tailwind (guides/styling.md)
├── tailwind.config.js
├── nativewind-env.d.ts
├── assets/fonts/               # Nunito TTF, link qua react-native.config.js
├── e2e/flows/                  # Maestro flow (*.yaml)
├── tests/                      # Helper cho test, KHÔNG chứa file test
│   ├── mocks/                  # server.ts, handlers/<feature>.handlers.ts
│   └── utils/                  # renderWithProviders.tsx, createTestQueryClient.ts
├── __tests__/                  # Test cấp app / integration
└── src/
    ├── assets/                 # constants/, images/, illustrations/ (SVG)
    ├── components/
    │   ├── ui/                 # Component nativecn đã custom (Button, Input, Badge, Dialog...)
    │   └── common/             # Component dùng chung tự viết (PressableScale, CoverImage, ScreenState...)
    ├── config/                 # env.ts, http/, queryClient.ts, i18n.config.ts
    ├── modules/<feature>/      # Mỗi feature một thư mục
    ├── navigation/             # routes.ts, types.ts, index.tsx
    ├── services/               # storage/, appInfo/
    ├── shared/
    │   ├── hooks/
    │   └── utilities/          # cn.ts, logger.ts, apiError.ts, format*.ts
    ├── state/                  # store.ts, slices/
    ├── theme/                  # colors.ts, regions.ts, motion.ts
    ├── translations/
    └── types/                  # Type dùng chung: user.ts, api.ts, enums.ts
```

`tests/` (không phải `__tests__/`) chứa helper vì Jest chạy mọi file trong `__tests__/` như test. `tsconfig.json`
đã include `tests/**/*`.

## Feature module

```
src/modules/catalog/
├── index.ts
├── CatalogScreen.tsx           # Chỉ render, lấy mọi thứ từ controller
├── CatalogScreen.test.tsx
├── components/
│   └── CourseCover/
│       ├── index.ts
│       ├── CourseCover.tsx
│       └── CourseCover.test.tsx
├── hooks/
│   ├── useCoursesQuery.ts      # Query + factory key
│   ├── useAddToCartMutation.ts
│   └── useCatalogController.ts # Gom query, mutation, i18n, toast, điều hướng
├── services/catalog.service.ts
├── schemas/catalog.schema.ts   # zod cho form/filter
├── constants/catalog.constant.ts
└── types/catalog.type.ts
```

Thêm màn hình mới phải sửa đủ 4 chỗ: enum `src/navigation/routes.ts`, `RootStackParamList` trong
`src/navigation/types.ts`, export trong `src/modules/index.ts`, `<Stack.Screen>` trong `src/navigation/index.tsx`.
**Chưa giải quyết, chờ owner quyết định**: `src/navigation/index.tsx` nằm trong danh sách khoá, nên theo B.8 mỗi lần
thêm `<Stack.Screen>` sẽ cần ADR. Cần owner chọn: giữ khoá (mỗi màn hình mới một ADR ngắn), hoặc cho phép thêm
`<Stack.Screen>` khi spec phase ghi rõ.

Quy tắc đặt tên file, thư mục, `testID`, translation key: [guides/typescript.md](guides/typescript.md#đặt-tên).

## Tầng gọi API

```
Screen  →  use<Feature>Controller  →  use<Feature>Query / Mutation  →  <feature>.service  →  apiInstances.service (Http/Axios)
```

- Component **KHÔNG ĐƯỢC** gọi service hoặc Axios trực tiếp.
- Service chỉ gọi HTTP và trả DTO. Hook query/mutation chỉ bọc TanStack Query. Logic màn hình nằm ở controller.
- Response của backend là DTO trực tiếp, **không** có wrapper `{ data }`.

Chi tiết (Http client, `ApiError`, query key, mutation, QueryClient, polling): [guides/api-client.md](guides/api-client.md).

## File hạ tầng (bị khoá)

### Ngoại lệ gắn API Phase 1 — ADR-0022 Accepted

Owner đã duyệt [ADR-0022](adr/ADR-0022-phase-01-api-foundation-exception.md) trong chat ngày2026-10-17.
Cho phép tích hợp API Auth/Home sau UI approval trong Phase1 khi Foundation còn chờ UAT. Được sửa riêng
src/navigation/index.tsx nếu cần cho bootstrap/guard/reset phiên, kèm test; không mở khoá config/native/theme/test
runtime/package. Dùng HTTP cookie và refresh hiện có, không thêm thư viện. Foundation và UAT giữ xác nhận riêng.

### Ngoại lệ Phase 1 — ADR-0020 Accepted (2026-10-17)

Owner chốt trong chat (D1, D2). Đã sửa `global.css` (nhóm “4. Màu thiết kế Phase 1”), `tailwind.config.js`
và `src/theme/colors.ts` để thêm 14 token: `forest-deep`, `forest-night`, `teal`, `aqua`, `cream`, `tape`,
`cover-{a..d}` và `cover-{a..d}-soft`. Không đổi token cũ, token ngữ nghĩa, font hoặc `regions.ts`.
Home mobile 2a không dùng `regionVars.home` (ngoại lệ CORE §5). Xem
[ADR-0020](adr/ADR-0020-phase-01-design-tokens-home-region.md).

### Ngoại lệ Phase 1 — ADR-0018 Accepted (2026-10-17)

Owner đã duyệt [ADR-0018](adr/ADR-0018-phase-01-ui-foundation-exception.md) trong chat.
Cho phép triển khai UI Phase 1 khi Phase 0 còn chờ UAT 5–6; không coi ngoại lệ là nghiệm thu Foundation.
Được sửa `src/navigation/index.tsx` để đăng ký Welcome/Login/Register/Student Home cùng routes,
param list và module exports. Được hoàn thiện Button/Input/Skeleton/ScreenState/PressableScale/CoverImage
theo ADR-0004 và test của task 1.1.2. Không mở quyền sửa cấu hình, theme, provider hoặc thêm thư viện.
Fixture chỉ ở test/preview development, không tạo phiên giả hoặc mở Home production khi chưa xác thực.
Asset gốc vẫn là đầu vào bắt buộc của task 1.1.1. Phạm vi auth integration và UAT còn lại của Foundation
được giữ riêng theo ADR. Các file khác trong danh sách dưới tiếp tục bị khoá.

Triển khai Phase 1 dùng Welcome làm initial route; thêm Login/Register/Student Home và route preview chỉ
đăng ký trong `__DEV__`. Home production hiển thị yêu cầu phiên học viên, không dùng fixture hoặc auth slice
boilerplate để suy ra quyền. Màn Example còn truy cập được từ preview để kiểm tra Foundation. UI auth
nhận callback có kiểu; app chưa gắn adapter backend, nên submit production disabled với giải thích.

Các file dưới đây **KHÔNG ĐƯỢC** sửa nếu không có ADR `Accepted` mô tả thay đổi và cập nhật file này trong cùng PR
(xem [B.8](README.md#b8-hạ-tầng-và-công-nghệ-mới)). Owner review được gán trong `.github/CODEOWNERS`.

```
babel.config.js
metro.config.js
tailwind.config.js
global.css
nativewind-env.d.ts
index.js
jest.config.js
jest.setup.js
.eslintrc.js
.prettierrc*
tsconfig.json
react-native.config.js
package.json (phần dependencies, devDependencies, scripts)
android/**, ios/** (trừ asset, icon, splash)
src/config/**
src/navigation/index.tsx
src/theme/**
src/shared/utilities/logger.ts
src/shared/utilities/apiError.ts
src/components/ui/**   (đã bật khoá sau owner nghiệm thu Phase 0 ngày 2026-10-17)
tests/mocks/server.ts, tests/utils/**
```

Ghi chú:

- Phase 0 tạo và sửa nhiều file trong danh sách này. Mỗi sub-phase của Phase 0 ghi rõ ADR đã `Accepted` cho phép
  thay đổi đó.
- CODEOWNERS không giới hạn được theo phần của `package.json`; cả file được gán cho owner, reviewer chỉ chặn thay đổi ở
  `dependencies`, `devDependencies`, `scripts`.
- Asset, icon, splash được loại khỏi khoá: `android/app/src/main/res/mipmap-*`, `android/app/src/main/res/drawable*`,
  `ios/MindyMobile/Images.xcassets`, `ios/MindyMobile/LaunchScreen.storyboard`.

## Cập nhật triển khai Phase 0 (2026-10-17)

- NativeWind v4 + Tailwind v3 đã nối Babel/Metro/entry, giữ SVG transformer; cva/clsx/tailwind-merge v2 đã cài.
- Nunito static (4 weight) được link Android/iOS và kiểm tra hình ảnh trên Android; nguồn và giấy phép trong `assets/Nunito-README.md`, `assets/Nunito-OFL.txt`.
- `global.css`, `tailwind.config.js`, `src/theme/{colors,regions,motion}.ts`, `cn()` theo ADR-0004/0005/0010.
- `src/config/http/**`, `env.ts`, `ApiError`, store/storage bỏ Bearer và token MMKV theo ADR-0002/0009.
  Không retry timeout tự động cho mutation; refresh chỉ retry request gốc một lần. Chưa có màn Login để nối điều hướng;
  hiện reset auth store và clear QueryClient. `APP_ORIGIN` chờ backend xác nhận, không dùng giá trị giả trong app thật.
- Logger tập trung che khoá nhạy cảm và PII theo key ở production, reporter nhận context đã che.
- QueryClient staleTime 30s, retry tối đa 2 lần cho mạng/5xx, native connectivity/focus, defaultError ApiError.
- MSW/node + helper test riêng; Jest dùng Axios HTTP adapter, biến môi trường test độc lập và strict unhandled requests.
- ESLint cấm unknown, non-null assertion, ts-ignore/ts-expect-error/ts-nocheck và console ngoài logger.
  Điều chỉnh type của context/isEmpty và debounce guard là phần chuyển tiếp template để bật rule mới.
- i18n hỗ trợ vi-VN mặc định và en-EN; lựa chọn ngôn ngữ được lưu; bỏ bn-BN.
- `test:e2e` và flow app-launch đã có; Maestro2.11 đã cài bằng archive kiểm tra checksum, Android Emulator đã khởi động headless. Kết quả E2E ghi ở PROGRESS.
- CLI đã nâng đồng bộ major 19 theo ADR-0016 (Accepted), autolinking nhận react-native-config và polyfill RNG; assembleDebug x86_64 đã thành công, app-launch Maestro xanh trên Android Emulator API37.
- Owner đã nghiệm thu Phase 0 ngày 2026-10-17; đã bật khoá `src/components/ui/**` trong CODEOWNERS theo quy trình. Giới hạn kiểm thử và các điểm tồn đọng được giữ trong PROGRESS/UAT.

## Rà soát và triển khai lại Phase 0 (2026-10-17)

- Theo ADR-0009 và phạm vi 0.6, logger che cả thuộc tính có cấu trúc trong `Error` trước khi in/gửi reporter,
  che các khoá kết thúc bằng `token` (như `access_token`, `refreshToken`) và xử lý tham chiếu vòng.
  Không sửa dữ liệu đầu vào. Chuỗi message/body tự do vẫn phải được caller loại bỏ thông tin nhạy cảm trước khi log.
- Kiểm tra HTTP bổ sung: chặn mutation thiếu Origin trước khi gửi, encode query offset `+07:00`, giữ giá trị
  `0`/`false`, single-flight giữa nhiều Http instance cùng backend, không retry mutation khi lỗi transport.
- Bước UAT cuối phase được ghi riêng trong `PHASE_00_99_User_Acceptance.md` theo ADR-0017;
  không đóng phase khi còn chờ backend Origin hoặc chưa có đích Login.

Owner đã xác nhận Origin development `http://localhost:3003` trong chat 2026-10-17;
`.env` dùng giá trị này theo ADR-0002. `APP_ORIGIN` là giá trị header thuộc allowlist,
không chuyển sang `10.0.2.2` như địa chỉ kết nối `API_URL`. Origin production chưa được
xác nhận nên `.env.production` giữ trống. Còn blocker điều hướng Login; chưa kiểm tra mutation backend thật.
