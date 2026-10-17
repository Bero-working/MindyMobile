# ADR-0015: UUID v4 cho Idempotency-Key trên Hermes

- Status: Accepted
- Date: 2026-10-17
- Author: @Bero (triển khai với Codex)
- Approved by: @Bero (xác nhận trực tiếp trong chat 2026-10-17)

## Context
Teaching và Attendance yêu cầu header `Idempotency-Key` là UUID v4. Hermes không bảo đảm có `crypto.randomUUID`.
Phase 0.5 cần chốt thư viện trước khi cài theo B.8.

## Decision
- Dùng `uuid` v11 (hỗ trợ CommonJS/Jest hiện tại) và `react-native-get-random-values` v1.11.
  Bản polyfill v2 yêu cầu RN >=0.81, không dùng với RN 0.80 hiện tại.
- Import polyfill ở đầu `index.js`, trước mọi import khác.
- Tạo `src/shared/utilities/idempotencyKey.ts`, export `createIdempotencyKey(): string` dùng `v4()`.
- Một key cho một ý định; retry giữ nguyên key và body. Không tự sinh key trong interceptor.
- Test định dạng v4 và tính khác nhau của hai lần gọi; kiểm tra thêm trên Android Hermes.

## Alternatives
- `Math.random`: không đáp ứng nguồn ngẫu nhiên an toàn.
- `crypto.randomUUID`: không bảo đảm có trên Hermes.

## Consequences
Thêm hai dependency và cần build lại native. Chỉ cài sau khi owner duyệt Accepted.
