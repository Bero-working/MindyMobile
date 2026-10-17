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
| 0.1 | [PHASE_00_01_NATIVEWIND.md](PHASE_00_01_NATIVEWIND.md) | In review |
| 0.2 | [PHASE_00_02_FONT.md](PHASE_00_02_FONT.md) | In review |
| 0.3 | [PHASE_00_03_THEME.md](PHASE_00_03_THEME.md) | In review |
| 0.4 | [PHASE_00_04_HTTP.md](PHASE_00_04_HTTP.md) | Blocked |
| 0.5 | [PHASE_00_05_IDEMPOTENCY_KEY.md](PHASE_00_05_IDEMPOTENCY_KEY.md) | In review |
| 0.6 | [PHASE_00_06_LOGGER.md](PHASE_00_06_LOGGER.md) | In review |
| 0.7 | [PHASE_00_07_QUERY_CLIENT.md](PHASE_00_07_QUERY_CLIENT.md) | In review |
| 0.8 | [PHASE_00_08_ESLINT.md](PHASE_00_08_ESLINT.md) | In review |
| 0.9 | [PHASE_00_09_TEST_INFRA.md](PHASE_00_09_TEST_INFRA.md) | In review |
| 0.10 | [PHASE_00_10_E2E.md](PHASE_00_10_E2E.md) | In review |
| 0.11 | [PHASE_00_11_I18N.md](PHASE_00_11_I18N.md) | In review |

Sau 0.11: **Dọn dẹp → Kiểm tra → Nghiệm thu** theo [B.5](../../README.md#b5-vòng-đời-một-phase).

## Ghi chú thứ tự triển khai

- Hạ tầng MSW/helper của 0.9 được dựng trước test HTTP/QueryClient để đáp ứng TDD; kết quả test và lý do ghi trong PROGRESS.
- ADR-0015 đã Accepted trước khi cài uuid/polyfill; ADR-0016 đã Accepted trước khi nâng đồng bộ CLI19.
- Component dùng chung (nativecn `Button`, `Input`, `Skeleton`, `Dialog`...; `PressableScale`, `ScreenState`,
  `CoverImage`, `interop.ts`) chưa có sub-phase vì mục 15 cũ không liệt kê. Owner quyết định có thêm sub-phase cho
  Phase 0 không.

## Tiêu chí nghiệm thu phase
- [ ] Mọi sub-phase đạt tiêu chí nghiệm thu riêng.
- [ ] `npm run lint:rules`, `npm run lint:code-format`, `npm run lint:type-check`, `npm test` không lỗi.
- [ ] `npm run test:e2e` chạy được ít nhất một flow mẫu trên Android Emulator.
- [ ] App build và chạy trên Android Emulator (iOS Simulator nếu có macOS), hiện đúng màu token và font Nunito.
- [ ] Bảng tech stack và danh sách file khoá trong [ARCHITECTURE.md](../../ARCHITECTURE.md) khớp với repo.
- [ ] Sau khi nghiệm thu: bật khoá `src/components/ui/**` trong `.github/CODEOWNERS`.

## Tình trạng triển khai 2026-10-17

Code nền tảng đã triển khai và qua unit/integration test; phase còn **Blocked**, chưa nghiệm thu:
- 0.2: bốn Nunito static đã link, build và kiểm tra hình ảnh trên Android Emulator; chờ owner review.
- 0.4: APP_ORIGIN/CORS_ORIGINS chờ backend; Login chưa có route (chỉ clear cache/reset auth).
- 0.5: UUID v11/polyfill v1.11 và test xanh; kiểm tra trên Hermes xác nhận UUID v4 và hai key khác nhau.
- 0.10: CLI19 đã sửa autolinking; assembleDebug x86_64 thành công; Maestro app-launch xanh trên Android Emulator API37 (19 giây).
- Đã dựng hạ tầng MSW trước test HTTP/QueryClient để bảo đảm test đi qua interceptor thật.
- Chưa thêm sub-phase nativecn/common component chưa có spec; chưa bật khoá UI trong CODEOWNERS.

Bằng chứng Android: [màu/font/UUID](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-native-foundation.png), [app chính tiếng Việt](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-main-app.png).
