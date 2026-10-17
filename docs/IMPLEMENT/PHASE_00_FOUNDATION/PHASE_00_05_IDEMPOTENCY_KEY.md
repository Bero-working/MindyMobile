# 0.5 Idempotency-Key

## Mô tả
Sinh UUID v4 cho header `Idempotency-Key` của Teaching / Attendance. Hermes không có `crypto.randomUUID`, nên cần
`uuid` + `react-native-get-random-values`.

## Hạ tầng / ADR
- File khoá bị sửa: `package.json`, `index.js` (import `react-native-get-random-values` trước mọi import khác).
- ADR: [ADR-0015](../../adr/ADR-0015-idempotency-key-uuid.md), Accepted bởi @Bero ngày 2026-10-17.
- Quy tắc dùng key: [guides/api-client.md](../../guides/api-client.md#http-client),
  [API contract §1.7](../../API_CONTRACT/README.md#17-concurrency-expectedversion-expectedrevision-idempotency-key).

## Task
### 0.5.1 ADR cho `uuid` + `react-native-get-random-values`
- Kết quả mong đợi: ADR mới trạng thái `Proposed`, owner duyệt `Accepted`.
- Test cần viết trước: không áp dụng.

### 0.5.2 Hàm sinh key
- Kết quả mong đợi: cài 2 thư viện; hàm tạo key trả UUID v4.
- Test cần viết trước: key khớp định dạng UUID v4; hai lần gọi trả hai key khác nhau.

## Tiêu chí nghiệm thu
- [ ] ADR đã `Accepted` trước khi cài.
- [ ] Hàm sinh key chạy được trên Android (Hermes).
- [ ] Bảng tech stack trong [ARCHITECTURE.md](../../ARCHITECTURE.md#tech-stack) cập nhật.
