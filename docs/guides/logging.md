# Logging

Cách ghi log trong app: dùng `logger`, che dữ liệu nhạy cảm, gửi lỗi production qua reporter. Đọc khi cần log hoặc
xử lý lỗi.

## Quy tắc

- Dùng `logger`. **KHÔNG** gọi `console.*` trực tiếp ở nơi khác.
- `logger.ts` là file **duy nhất** được `eslint-disable no-console`.
- `debug`, `info` chỉ in khi `__DEV__`. `warn`, `error` luôn in. `error` ở production gửi qua reporter
  (gắn Crashlytics/Sentry sau bằng `setErrorReporter`).
- Che dữ liệu nhạy cảm: `password`, `token`, `cookie`, `set-cookie`, `authorization`.
- Không log PII (email, số điện thoại) ngoài dev.
- Log lỗi API kèm `code` và `requestId`.
- File này thay cho `logger` trong `src/ignoreWarnings.ts`. Khi chuyển, sửa import trong `http.config.ts`
  (Phase 0.6).

## `src/shared/utilities/logger.ts`

Triển khai hiện tại: [logger.ts](../../src/shared/utilities/logger.ts),
kiểm tra hành vi: [logger.test.ts](../../src/shared/utilities/logger.test.ts).

- Che đệ quy trường nhạy cảm trong object, mảng và thuộc tính có cấu trúc của `Error`.
  Các khoá kết thúc bằng `token` như `access_token`, `refreshToken` cũng được che.
- Production che thêm PII theo key (`email`, `phone`, `phoneNumber`).
- Console và reporter đều nhận bản sao đã che; dữ liệu gốc không bị sửa.
- Tham chiếu vòng được thay bằng `[Circular]`, tránh lỗi khi ghi chẩn đoán.
- Tên lỗi, message và stack vẫn được giữ. Không đặt credential/PII trong message,
  stack hoặc chuỗi JSON/body tự do: che theo key không phân tích nội dung chuỗi.
- `setErrorReporter` dành cho tích hợp reporter sau này; chưa cài dịch vụ bên ngoài.
