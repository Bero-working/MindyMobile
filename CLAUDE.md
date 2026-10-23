# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Trước khi làm bất kỳ việc gì: đọc `docs/README.md`.**

## Quy trình bắt buộc

Tóm tắt từ [docs/README.md](docs/README.md#quy-trình-làm-việc). Khi có khác biệt, `docs/README.md` thắng.

- **CI và bàn giao merge**: [ADR-0032](docs/adr/ADR-0032-require-successful-ci-before-merge.md) và [B.10](docs/README.md#b10-điều-kiện-bắt-buộc-trước-khi-merge): chỉ merge khi đủ sáu job CI của bản PR mới nhất hoàn tất success. AI được bàn giao PR/run/head/trạng thái rồi kết thúc lượt khi CI đang chạy; owner có thể stop AI mà CI vẫn tiếp tục. CI lỗi thì owner gửi bằng chứng để AI sửa; CI đạt thì owner tự merge. AI không tự merge/bật auto-merge trong quy trình này, kể cả yêu cầu trước có nhắc merge. Pending/thiếu/lỗi/hủy/skipped không đạt; yêu cầu merge/UAT Done, CI cũ hoặc test local không miễn CI; cấm admin/bypass/push thẳng để vượt điều kiện.

- **Thứ tự ưu tiên nguồn**: `docs/API_CONTRACT/` → `docs/BUSINESS_RULES.md` → `docs/adr/` (Accepted) → `docs/ARCHITECTURE.md` + `docs/guides/` → `docs/CORE/` → `docs/IMPLEMENT/` → code mẫu boilerplate. Spec phase mâu thuẫn với nguồn đứng trước thì dừng lại hỏi owner (@Bero).
- **Đặc tả và triển khai UI**: Codex mặc định đặc tả kỹ trong `docs/IMPLEMENT/<phase>/` và có thể triển khai; Claude có thể đặc tả khi owner yêu cầu. Khi cần thiết kế hoặc truy cập Claude Design, owner sẽ giao Claude hỗ trợ. UI base là `assets/Student Home Page Design/` (`Student Home.dc.html`, `Auth.dc.html` và asset đi kèm), có thể thay đổi theo yêu cầu owner. Ghi nguồn/biến thể, thông số, trạng thái, tương tác, tiêu chí đối chiếu và thay đổi so với base vào IMPLEMENT trước khi sửa UI; đối chiếu bản chạy và ghi bằng chứng/sai khác vào PROGRESS. Thiếu đầu vào phải ghi rõ và bổ sung. Xem [ADR-0029](docs/adr/ADR-0029-local-ui-base-codex-spec-implementation.md).
- **Phase**: Phase 0 (`PHASE_00_FOUNDATION`) là hạ tầng, phải nghiệm thu trước mọi phase màn hình. Phase 1+ mỗi phase một màn hình; sub-phase là một phần màn hình; task (`1.1.1`) là một đơn vị TDD. Task và sub-phase làm tuần tự. Phase màn hình độc lập được làm song song.
- **Vòng đời từng phase**: Thiết kế và triển khai UI → owner (@Bero) xác nhận UI → gắn API trong chính phase đó → Dọn dẹp/Kiểm tra → owner UAT (N.99) → Done khi owner xác nhận đạt. Chưa có xác nhận UI thì không gắn API; duyệt UI không thay UAT. Trong mỗi bước vẫn task tuần tự, Red → Green → Refactor → AI tự kiểm tra và ghi PROGRESS. Xem [ADR-0021](docs/adr/ADR-0021-per-phase-ui-approval-api-uat.md).
- **Trạng thái**: `Todo` · `In progress` · `Blocked` · `In review` · `Done`. Bị chặn bởi yếu tố ngoài (API PLANNED, chờ backend) → `Blocked`, ghi lý do, chuyển phase khác.
- **File UAT**: mỗi phase lớn có bước cuối `N.99` trong file `PHASE_<NN>_99_User_Acceptance.md` (ví dụ `PHASE_02_99_User_Acceptance.md`), giữ nguyên cách viết `User_Acceptance`. `99` dành riêng cho UAT của owner; sub-phase triển khai dùng `01`–`98`. Ghi kết quả UAT vào `PROGRESS/<phase>/README.md`.
- **PROGRESS**: xong task hoặc đổi trạng thái phase thì thêm entry vào cuối file `docs/PROGRESS/<phase>/...` theo `docs/PROGRESS/_template/ENTRY.md`. Không sửa/xoá entry cũ. Thời gian lấy từ `date '+%Y-%m-%d %H:%M'` (+07:00). Tên lấy từ `gh api user --jq .login`, không lấy được thì hỏi, không đoán. Cập nhật cột trạng thái ở `docs/IMPLEMENT/README.md` và README của phase.
- **Hạ tầng bị khoá**: file trong mục "File hạ tầng (bị khoá)" của `docs/ARCHITECTURE.md` chỉ được sửa khi có ADR được owner `Accepted` và `ARCHITECTURE.md` cập nhật trong cùng PR. Thêm thư viện (kể cả devDependency): ADR `Proposed` → owner `Accepted` → mới `npm install`.
- **Dừng và hỏi owner** khi: spec mâu thuẫn với contract/business rule/ADR, cần API PLANNED, cần sửa hạ tầng hoặc thêm thư viện, không xác định được GitHub handle, thấy rác ngoài phạm vi phase, tiêu chí nghiệm thu không rõ.

## Tổng quan

MindyMobile là app React Native (0.80, React 19, TypeScript strict) cho hệ thống **Mindy Center** (trung tâm đào tạo: catalog khoá học, giỏ hàng/thanh toán, lớp học, tài liệu, điểm danh; role Student / Mentor / Manager/Admin). Dự án được dựng từ boilerplate `@sohantalukder/react-native-boilerplate`, nên `package.json`, `README.md`, module `example` và `contacts` vẫn là phần mẫu của template.

## Lệnh thường dùng

```bash
npm install                 # repo đang dùng package-lock.json
npm start                   # Metro bundler
npm run android             # / npm run ios
npm run pod-install         # cài CocoaPods cho iOS

npm test                                   # Jest (preset react-native)
npx jest __tests__/App.test.tsx            # chạy một file test
npx jest -t "renders correctly"            # chạy test theo tên

npm run lint:rules          # ESLint
npm run lint:code-format    # Prettier check
npm run lint:type-check     # tsc (noEmit)
```

Script `lint` / `lint:fix` gọi các script con bằng npm. `build-release.sh` là script build release (bash) cho Android/iOS.

## Kiến trúc

- **Entry**: `index.js` → `src/index.tsx`. Thứ tự provider: `SafeAreaProvider` → `GestureHandlerRootView` → `QueryClientProvider` → `ThemeProvider` (từ `@sohantalukder/rn-kit`, lưu theme qua MMKV) → `UiPortalProvider` → `Navigation`.
- **UI kit**: NativeWind + nativecn (theo [ADR-0004](docs/adr/ADR-0004-nativewind-nativecn.md)). Style bằng `className` với token từ `global.css`; component UI copy từ nativecn vào `src/components/ui/` rồi custom. NativeWind v4 đã cài và cấu hình ở Phase 0.1; component nativecn chưa thêm. `ThemeProvider`, `UiPortalProvider`, `toast` của `@sohantalukder/rn-kit` tạm giữ; không dùng component rn-kit cho UI mới và không trộn rn-kit với nativecn trong một màn hình. Chi tiết: `docs/guides/styling.md`.
- **Navigation** (`src/navigation/`): một Stack navigator. Thêm màn hình mới cần sửa 4 chỗ: enum `routes.ts`, `RootStackParamList` trong `types.ts`, export trong `src/modules/index.ts`, và `<Stack.Screen>` trong `navigation/index.tsx`.
- **Feature module** (`src/modules/<feature>/`), theo mẫu `example`:
  - `services/*.service.ts`: gọi API qua `apiInstances.service` (`src/config/http/apiInstance.config.ts`).
  - `hooks/use*Query.ts`: React Query, có factory query key (`xxxQueryKeys`).
  - `hooks/use*Controller.ts`: logic màn hình (gom query, action, i18n, toast). Component màn hình chỉ render.
  - `components/`, `constants/`, `types/`.
- **HTTP** (`src/config/http/http.config.ts`): class `Http` bọc Axios. Các method trả về thẳng `response.data`. Interceptor kiểm tra mạng bằng NetInfo, dùng cookie HttpOnly, chuẩn hoá ApiError và refresh single-flight khi 401 AUTHENTICATION_REQUIRED; retry request gốc một lần. Không tự retry timeout mutation.
- **State**: Zustand theo kiểu slice (`src/state/store.ts` + `slices/`). Server state dùng React Query (`src/config/queryClient.ts`).
- **Lưu trữ**: `src/services/storage/localStore.service.ts` là singleton MMKV (theme, ngôn ngữ; không lưu token).
- **i18n**: `src/translations/vi-VN.json` (mặc định), `en-EN.json`. Đổi ngôn ngữ bằng `useI18n`. Text hiển thị phải đi qua `t(...)`.
- **Env**: `react-native-config` (`API_URL`, `APP_ORIGIN`, `APP_ENV`, `DEBUG_MODE`), luôn đọc qua `src/config/env.ts`, không gọi `Config` trực tiếp. Build debug dùng `.env`, build release dùng `.env.production` (Android: `envConfigFiles` trong `android/app/build.gradle`; iOS: biến `ENVFILE` trong script `ios:release` / `build:ios`). Muốn chọn file khác thì set `ENVFILE`. Đổi file env phải build lại native, reload Metro là không đủ. Khi `APP_ENV=development`, trên Android `localhost` được tự đổi thành `10.0.2.2`. Khi `APP_ENV=production` mà thiếu `API_URL` thì app throw lỗi ngay lúc khởi động.
- **Import alias**: `@/` → `src/` (babel `module-resolver` + tsconfig `paths`). File SVG import như component (`react-native-svg-transformer`).

### Những điểm template chưa khớp backend (cần biết khi tích hợp)

- Contract dùng prefix `/api/v1`, nên `API_URL` cần trỏ đúng tới prefix này.
- Backend xác thực bằng **cookie HttpOnly** (`access_token` / `refresh_token`), **không dùng Bearer token**. Khi gặp 401 `AUTHENTICATION_REQUIRED`, gọi `POST /api/v1/auth/refresh` đúng một lần, thất bại thì về màn login. Logic Bearer + MMKV token của template đã được bỏ trong Phase 0.

## Tài liệu nghiệp vụ / API

Bản đồ đầy đủ: `docs/README.md`.

- `docs/API_CONTRACT/API_CONTRACT_BE.md`: contract nguyên văn nhận từ BE, chỉ owner (@Bero) cập nhật, không sửa tay. File này đổi thì đồng bộ phần khác biệt sang các file domain cùng commit (quy trình ở `docs/API_CONTRACT/README.md`, mục "Nguồn contract nhận từ BE").
- `docs/API_CONTRACT/`: hợp đồng API, tách theo domain (nguồn chính khi viết service). Đọc `README.md` (quy ước chung, lỗi, enum, polling, API PLANNED) rồi file domain (`auth.md`, `catalog.md`, `cart.md`, `orders-payment.md`, `my-classes.md`, `materials.md`, `files.md`, `mentor-teaching.md`, `attendance.md`...). Các quy ước quan trọng:
  - Route `{API_ORIGIN}/api/v1/...`. Response là DTO trực tiếp, **không** có wrapper `{ data }`. List phân trang trả `{ items, page, pageSize, total }`.
  - Lỗi có dạng `{ statusCode, code, message, details?, requestId? }`. Xử lý theo `statusCode` + `code`, không so sánh `message` (`message` có thể là mảng).
  - Body có field lạ sẽ bị trả 422 (forbidNonWhitelisted). Timestamp gửi lên phải có offset. Múi giờ hiển thị lấy từ field `timeZone` của response.
  - Một số mutation (materials, release unit, file access) bắt buộc header `Origin` hợp lệ. Trên mobile phải tự set header này.
  - `expectedRevision` / `expectedVersion` (gặp 409 thì refetch) và header `Idempotency-Key` (UUID v4, retry giữ nguyên key + body) cho Teaching / Attendance.
  - Mục 0 và 22: API gắn nhãn **PLANNED** chưa có route, FE không được gọi.
- `docs/BUSINESS_RULES.md`: rule nghiệp vụ. `docs/ARCHITECTURE.md`: tech stack, cây thư mục, file hạ tầng bị khoá. `docs/CONTRIBUTING.md`: lệnh, TDD, Definition of Done. `docs/guides/`: quy chuẩn kỹ thuật. `docs/adr/`: quyết định kiến trúc.
- `docs/IMPLEMENT/`: spec từng phase + roadmap. `docs/PROGRESS/`: nhật ký, chỉ ghi thêm.
- `*.legacy.md`: bản gốc trước khi tách, chỉ giữ để đối chiếu, không dùng làm nguồn.

## Quy tắc code (ESLint / Prettier)

- Cấm inline style và màu literal (`react-native/no-inline-styles`, `no-color-literals`). Trước Phase 0.1: dùng `StyleSheet` + màu từ theme. Sau Phase 0.1: dùng `className` + token (`docs/guides/styling.md`).
- Text thô trong JSX bị cấm (`no-raw-text`).
- `console` chỉ được dùng `warn` / `error`.
- Dùng single quote, line ending LF.
- tsconfig bật `exactOptionalPropertyTypes` và `noUncheckedIndexedAccess`: phần tử lấy từ mảng/record có kiểu `T | undefined`, phải kiểm tra trước khi dùng.

## Trạng thái Phase 0

Xem `docs/IMPLEMENT/PHASE_00_FOUNDATION/README.md` và `docs/PROGRESS/PHASE_00_FOUNDATION/README.md`.
Owner đã nghiệm thu toàn Phase 0 và xác nhận Done trong chat ngày 2026-10-17. ADR-0015/0016 đã Accepted, UUID v11 + polyfill v1.11 và CLI19 đã cài;
autolinking đã nhận native modules. Build Android debug x86_64 và flow Maestro app-launch đã qua trên emulator API37; font/token và UUID trên Hermes đã kiểm tra.
APP_ORIGIN development `http://localhost:3003` đã được owner xác nhận và cấu hình trong `.env`; production chưa xác nhận, giữ trống. Login/auth navigator đã nối ở Phase 1; Phase 1 cũng đã được owner nghiệm thu. Khoá `src/components/ui/` đã bật trong CODEOWNERS theo quy trình sau UAT. Owner yêu cầu không đợi refresh; các ca native hết hạn/thu hồi và mutation Origin thật chưa có kết quả trong lượt đóng phase, giới hạn ghi trong PROGRESS.
