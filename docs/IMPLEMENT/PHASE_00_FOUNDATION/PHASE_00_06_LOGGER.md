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
- [ ] Không còn import `logger` từ `@/ignoreWarnings`.
- [ ] `logger.ts` là file duy nhất có `eslint-disable no-console`.
