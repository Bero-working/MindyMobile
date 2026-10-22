# Phase 00: Foundation

## Mục tiêu
Dựng hạ tầng mà mọi phase màn hình cần: NativeWind + token, font, Http client theo cookie, logger, QueryClient, ESLint,
hạ tầng test (MSW, Maestro), tiếng Việt mặc định. Phase này phải `Done` trước khi bắt đầu bất kỳ phase màn hình nào.

## Phạm vi
- Có: các bước của mục 15 trong [BUSINESS_RULES.legacy.md](../../BUSINESS_RULES.legacy.md), mỗi bước lớn một sub-phase,
  giữ thứ tự cũ.
- Không có: màn hình nghiệp vụ. Bước 12 cũ (cập nhật `CLAUDE.md` cho phần UI kit) đã làm trong đợt tái cấu trúc docs,
  không còn sub-phase riêng.

## Phụ thuộc
- Phase: không.
- ADR cho phép sửa file hạ tầng: [ADR-0002](../../adr/ADR-0002-cookie-auth.md),
  [ADR-0003](../../adr/ADR-0003-tanstack-query-zustand.md), [ADR-0004](../../adr/ADR-0004-nativewind-nativecn.md),
  [ADR-0006](../../adr/ADR-0006-vietnamese-default.md), [ADR-0007](../../adr/ADR-0007-maestro-msw.md),
  [ADR-0009](../../adr/ADR-0009-no-any-unknown-zod.md). Mỗi sub-phase ghi ADR áp dụng.
- Ngoài repo: backend xác nhận thêm `APP_ORIGIN` vào `CORS_ORIGINS` (0.4).
- Guide: [styling.md](../../guides/styling.md), [api-client.md](../../guides/api-client.md),
  [logging.md](../../guides/logging.md), [testing.md](../../guides/testing.md), [linting.md](../../guides/linting.md).

Sau mỗi sub-phase: chạy lại lint và test (`npm run lint:rules`, `npm run lint:code-format`, `npm run lint:type-check`,
`npm test`).

## Sub-phase
| # | File | Trạng thái |
| --- | --- | --- |
| 0.1 | [PHASE_00_01_NATIVEWIND.md](PHASE_00_01_NATIVEWIND.md) | Done |
| 0.2 | [PHASE_00_02_FONT.md](PHASE_00_02_FONT.md) | Done |
| 0.3 | [PHASE_00_03_THEME.md](PHASE_00_03_THEME.md) | Done |
| 0.4 | [PHASE_00_04_HTTP.md](PHASE_00_04_HTTP.md) | Done |
| 0.5 | [PHASE_00_05_IDEMPOTENCY_KEY.md](PHASE_00_05_IDEMPOTENCY_KEY.md) | Done |
| 0.6 | [PHASE_00_06_LOGGER.md](PHASE_00_06_LOGGER.md) | Done |
| 0.7 | [PHASE_00_07_QUERY_CLIENT.md](PHASE_00_07_QUERY_CLIENT.md) | Done |
| 0.8 | [PHASE_00_08_ESLINT.md](PHASE_00_08_ESLINT.md) | Done |
| 0.9 | [PHASE_00_09_TEST_INFRA.md](PHASE_00_09_TEST_INFRA.md) | Done |
| 0.10 | [PHASE_00_10_E2E.md](PHASE_00_10_E2E.md) | Done |
| 0.11 | [PHASE_00_11_I18N.md](PHASE_00_11_I18N.md) | Done |
| 0.99 | [PHASE_00_99_User_Acceptance.md](PHASE_00_99_User_Acceptance.md) | Done |

Sau 0.11: **Dọn dẹp → Kiểm tra → 0.99 User Acceptance** theo [B.5](../../README.md#b5-vòng-đời-một-phase).
AI tự kiểm tra task/sub-phase; owner thực hiện UAT cuối phase theo ADR-0017.

## Ghi chú thứ tự triển khai

- Hạ tầng MSW/helper của 0.9 được dựng trước test HTTP/QueryClient để đáp ứng TDD; kết quả test và lý do ghi trong PROGRESS.
- ADR-0015 đã Accepted trước khi cài uuid/polyfill; ADR-0016 đã Accepted trước khi nâng đồng bộ CLI19.
- Component dùng chung (nativecn `Button`, `Input`, `Skeleton`, `Dialog`...; `PressableScale`, `ScreenState`,
  `CoverImage`, `interop.ts`) chưa có sub-phase vì mục 15 cũ không liệt kê. Owner quyết định có thêm sub-phase cho
  Phase 0 không.

## Tiêu chí nghiệm thu phase
- [x] Owner nghiệm thu toàn Phase 0 và đóng các sub-phase; giới hạn bằng chứng giữ trong PROGRESS.
- [x] `npm run lint:rules`, `npm run lint:code-format`, `npm run lint:type-check`, `npm test` không lỗi.
- [x] `npm run test:e2e` chạy được ít nhất một flow mẫu trên Android Emulator.
- [x] App build và chạy trên Android Emulator (iOS Simulator nếu có macOS), hiện đúng màu token và font Nunito.
- [x] Owner chấp nhận đối chiếu tech stack/file khoá theo UAT bước 9, kèm các điểm tồn đọng đã ghi; không coi các điểm đó đã được sửa.
- [x] Sau khi nghiệm thu: đã bật khoá `src/components/ui/**` trong `.github/CODEOWNERS`.

## Tình trạng triển khai 2026-10-17

Code nền tảng đã triển khai và qua unit/integration test; phase còn **Blocked**, chưa nghiệm thu:
- 0.2: bốn Nunito static đã link, build và kiểm tra hình ảnh trên Android Emulator; chờ owner review.
- 0.4: APP_ORIGIN/CORS_ORIGINS chờ backend; Login chưa có route (chỉ clear cache/reset auth).
- 0.5: UUID v11/polyfill v1.11 và test xanh; kiểm tra trên Hermes xác nhận UUID v4 và hai key khác nhau.
- 0.10: CLI19 đã sửa autolinking; assembleDebug x86_64 thành công; Maestro app-launch xanh trên Android Emulator API37 (19 giây).
- Đã dựng hạ tầng MSW trước test HTTP/QueryClient để bảo đảm test đi qua interceptor thật.
- Chưa thêm sub-phase nativecn/common component chưa có spec; chưa bật khoá UI trong CODEOWNERS.

Bằng chứng Android: [màu/font/UUID](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-native-foundation.png), [app chính tiếng Việt](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-main-app.png).

## Triển khai lại và AI tự kiểm tra (2026-10-17, 13:36 +07:00)

- Đã rà soát 11 sub-phase; sửa logger che thuộc tính Error và xử lý tham chiếu vòng theo ADR-0009.
- Bổ sung 4 test HTTP cho Origin trống, query offset, single-flight giữa Http instance và mutation lỗi mạng.
- Lint, format, type-check xanh; **13 suite / 43 test** xanh; Android debug x86_64 build/cài thành công.
- Maestro app-launch **1/1 xanh, 30 giây** sau khi khởi động emulator API37 với 4 GB RAM.
  Lần thử 2 GB không đạt vì Android lowmemorykiller đóng driver; không dùng lần thất bại làm bằng chứng đạt.
- Đã xem ảnh app mới: mở mặc định tiếng Việt, giao diện sáng. Font/token/UUID native vẫn tham chiếu bằng chứng
  12:29, không ghi nhận là đã chạy lại smoke tạm. Chưa kiểm tra iOS.
- 0.4 và 0.99 còn **Blocked**: chưa có xác nhận backend Origin và chưa có đích Login.
  Các sub-phase còn lại `In review`; chỉ owner xác nhận UAT mới chuyển phase `Done`.
- Bằng chứng mới: [Jest](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-reimplementation-jest.json),
  [Maestro JUnit](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-reimplementation-maestro.xml),
  [ảnh app](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-reimplementation-main-app.png).

## Cập nhật Origin development

Owner đã cung cấp `http://localhost:3003` trong phản hồi yêu cầu xác nhận Origin.
Đã đặt `APP_ORIGIN=http://localhost:3003` trong `.env`; không đổi giá trị header sang
`10.0.2.2`. `.env.production` giữ trống vì chưa có xác nhận cho production.
Blocker xác nhận Origin development đã được gỡ; 0.4 và 0.99 vẫn `Blocked` vì chưa có
màn Login/auth navigator. Chưa thực hiện mutation với backend thật; owner chưa UAT.

## Sửa nút kiểm tra API mẫu

Theo phản hồi owner, nút “Thử kết nối API” còn gọi `users?limit=1` của boilerplate,
chờ cấu trúc user giả nên không khớp backend Mindy. Đã thay bằng `GET health/live`
theo contract §5, parse `status: ok` và `timestamp` qua Zod; query chỉ chạy khi bấm.
Kết quả thành công/lỗi hiện ngay dưới nút bằng cả hai ngôn ngữ; lỗi có code và HTTP status,
có thể bấm thử lại. Không thay cấu hình đổi ngôn ngữ hoặc thêm màn nghiệp vụ.

Lint/format/type-check xanh; **15 suite / 48 test** xanh.
Maestro **2/2 flow** xanh trên Android với backend online: `app-launch` và `api-health`
(bấm nút và xác nhận `example-api-success`).
[Bằng chứng](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-api-health-maestro.xml).
Đây là kiểm tra kết nối health, chưa xác minh đăng nhập hay mutation. Phase vẫn Blocked bởi Login/UAT.

## Owner UAT một phần (2026-10-17)

@Bero đã xác nhận trong chat: **“Từ 1-4a đã được chấp nhận”**.
Đã ghi nhận các bước 1, 2, 3, 4 và 4a đạt trong [file UAT](PHASE_00_99_User_Acceptance.md).
Ngày 2026-10-17 14:21 owner chấp nhận thêm bước 7, 8 và 9 (bước 9 kèm 4 điểm tồn đọng ghi trong file UAT).
Các bước 5–6 chưa có xác nhận; 0.4/0.99 và Phase 0 vẫn `Blocked` do còn tích hợp Login.
Không coi xác nhận một phần là nghiệm thu toàn phase, không bật khoá UI hoặc bắt đầu phase màn hình.

Đã đồng bộ **0.1, 0.2, 0.3 và 0.11 Done** theo UAT 1–4a của owner.
Tiêu chí/sub-phase đã chấp nhận được tick ngay; Phase 0/0.99 vẫn chờ nghiệm thu đầy đủ.

## Cập nhật sau ADR-0022 (2026-10-17 22:12)

Login/auth navigator đã được nối ở Phase1; Android/backend đã qua cookie/auth-me sau mở lại app, Home dữ liệu thật,
logout/Back. Không còn phụ thuộc thiếu màn Login. Owner đã duyệt UAT bước 5 trong chat ngày 2026-10-17;
test tự động refresh/phiên/điều hướng 28/28 PASS, kiểm tra native bổ sung đang tiếp tục.
Foundation/0.4/0.99 vẫn Blocked bởi mutation Origin thật và owner UAT bước 6. Xem [nhật ký API Phase1](../../PROGRESS/PHASE_01_AUTH_HOME_UI/PHASE_01_06_API_INTEGRATION.md).

## Owner nghiệm thu hoàn tất (2026-10-17 22:52 +07:00)

**Trạng thái hiện tại: Done.** Owner xác nhận “Tôi approve bước 5 phase 0 UAT”, sau đó
“Bước 6 approve và done phase 0, không cần đợi refresh”. Toàn bộ sub-phase và 0.99 được đóng theo xác nhận.
Các mục tình trạng trước đây phía trên là lịch sử. Đã bật khoá UI trong CODEOWNERS theo ADR-0014/quy trình UAT.
Test bước 5 mới nhất: 28/28 PASS qua MSW/component test. Đã thấy phiên Student thật trên Android và auth/me trả 200;
dừng trước khi access cookie hết hạn, chưa thu hồi phiên hoặc chạy mutation Origin. Không coi các ca chưa chạy là PASS.
Các điểm tồn đọng đã được owner chấp nhận ở bước 9 giữ nguyên trong file UAT.
