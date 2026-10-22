# 0.6 Logger

## Mô tả
Tạo `logger` có che dữ liệu nhạy cảm và reporter cho production, thay cho `logger` trong `src/ignoreWarnings.ts`.

## Hạ tầng / ADR
- File khoá được tạo: `src/shared/utilities/logger.ts`. File khoá bị sửa: `src/config/http/http.config.ts` (đổi import).
- ADR: [ADR-0009](../../adr/ADR-0009-no-any-unknown-zod.md) (bỏ `unknown` trong logger cũ).
- Nội dung: [guides/logging.md](../../guides/logging.md).

## Task
### 0.6.1 `logger.ts`
- Kết quả mong đợi: `src/shared/utilities/logger.ts` theo guide.
- Test cần viết trước: `src/shared/utilities/logger.test.ts`: `password`, `token`, `cookie`, `set-cookie`,
  `authorization` bị thay bằng `[REDACTED]` (cả trong object lồng và mảng); `debug` không in khi `__DEV__ = false`;
  `error` gọi reporter khi không phải dev.

### 0.6.2 Thay import
- Kết quả mong đợi: mọi import `logger` từ `@/ignoreWarnings` đổi sang `@/shared/utilities/logger`.
- Test cần viết trước: test hiện có của Http client vẫn xanh sau khi đổi import.

## Tiêu chí nghiệm thu
- [x] Không còn import `logger` từ `@/ignoreWarnings`.
- [x] `logger.ts` là file duy nhất có `eslint-disable no-console`.

## Xác nhận nghiệm thu cuối Phase 0

- Trạng thái: **Done** theo xác nhận owner trong chat ngày 2026-10-17: “Bước 6 approve và done phase 0, không cần đợi refresh”.
- Checklist kiểm thử phía trên giữ mức bằng chứng đã ghi; việc đóng theo owner không bổ sung kết quả cho ca chưa chạy.
- Chi tiết nghiệm thu và giới hạn tại [PROGRESS cấp phase](../../PROGRESS/PHASE_00_FOUNDATION/README.md).

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_00_FOUNDATION/PHASE_00_06_LOGGER.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.
