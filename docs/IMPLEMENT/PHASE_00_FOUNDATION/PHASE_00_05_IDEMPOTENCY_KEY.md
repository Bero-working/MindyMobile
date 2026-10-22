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
- [x] ADR đã `Accepted` trước khi cài.
- [x] Hàm sinh key chạy được trên Android (Hermes).
- [x] Bảng tech stack trong [ARCHITECTURE.md](../../ARCHITECTURE.md#tech-stack) cập nhật.

## Xác nhận nghiệm thu cuối Phase 0

- Trạng thái: **Done** theo xác nhận owner trong chat ngày 2026-10-17: “Bước 6 approve và done phase 0, không cần đợi refresh”.
- Checklist kiểm thử phía trên giữ mức bằng chứng đã ghi; việc đóng theo owner không bổ sung kết quả cho ca chưa chạy.
- Chi tiết nghiệm thu và giới hạn tại [PROGRESS cấp phase](../../PROGRESS/PHASE_00_FOUNDATION/README.md).

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_00_FOUNDATION/PHASE_00_05_IDEMPOTENCY_KEY.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.
