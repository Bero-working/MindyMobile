# API contract: Điểm danh

Bắt đầu buổi, điểm danh, chốt, sửa, phục hồi và audit điểm danh (§19). Đọc cùng
[mentor-teaching.md](mentor-teaching.md) khi làm màn điểm danh của Mentor.

> Số mục (§) giữ nguyên theo contract gốc để tham chiếu chéo vẫn tra được. Mục nào nằm ở file nào: xem
> [bảng đối chiếu](README.md#bảng-đối-chiếu-mục-cũ-sang-file-mới). Quy ước chung (cookie, header `Origin`,
> format lỗi, `Idempotency-Key`, polling): [README.md](README.md).

---

## 19. Attendance: điểm danh, sửa, phục hồi, audit

Actor: **mentor đang dạy buổi** (effective mentor, ACTIVE) hoặc **Staff**. Student **không** xem roster.
Chi tiết: Phase 4 §15 (repo BE: `docs/api_flow/PHASE_4_flow-api-breakdown.md#15-implemented42--contract-thực-tế-và-handoff`),
4.3 (repo BE: `docs/api_flow/PHASE_4_3_flow-api-breakdown.md`).

**Mọi mutation**: header `Idempotency-Key` (UUID v4) + body `expectedVersion` = `session.version` mới nhất.
Staff **bắt buộc** `reason` (trim 1–1000); Mentor được gửi `reason` tuỳ chọn.

**Quy tắc thời gian**:

- Mentor chỉ **bắt đầu** được trong **ngày học** (theo `APP_TIME_ZONE`), không qua đêm. Ngoài ngày →
  409 `ATTENDANCE_START_DAY_CLOSED` → Staff phục hồi.
- Mentor được sửa đến `editableUntil` = **00:00 của ngày học + 2** (ví dụ học thứ Ba → hết hạn 00:00 thứ Năm).
  Hết hạn → 409 `ATTENDANCE_EDIT_WINDOW_EXPIRED` → chuyển Staff.
- Staff không bị giới hạn deadline.
- Quá giờ học **không** tự vắng/tự chốt.

### 19.1 GET `/api/v1/class-sessions/:sessionId/attendance?page=1&pageSize=20`

```json
{
  "session": {
    "...SessionView": "…",
    "permissions": {
      "canStart": false, "canEditAttendance": true, "canFinalize": true,
      "canSyncRoster": true, "canRecover": false, "canViewAttendanceAudits": false
    }
  },
  "items": [{
    "attendanceId": "…", "enrollmentId": "…",
    "entryType": "REGULAR", "makeupPlacementId": null,
    "student": { "id": "…", "displayName": "Học viên A" },
    "status": "UNMARKED", "checkedInAt": null, "admittedAt": "2026-10-13T10:00:00.000Z"
  }],
  "page": 1, "pageSize": 20, "total": 25,
  "totals": { "present": 10, "absent": 0, "unmarked": 15, "eligible": 25 },
  "pendingPaymentCount": 2
}
```

- Trước khi bắt đầu: `items: []`, totals = 0 — **không** có nghĩa là vắng.
- `totals` tính trên **toàn roster**, không theo trang.
- `pendingPaymentCount`: học viên CASH chưa xác nhận (chưa nằm trong roster).
- `permissions` chỉ là gợi ý UI (`canRecover`, `canViewAttendanceAudits` chỉ Staff).
- Sort `enrollmentId ASC`. Không có email/phone/order.

### 19.2 POST `/api/v1/class-sessions/:sessionId/start` — 200 WriteView

Mentor: `{ "expectedVersion": 2 }`. Staff (phục hồi ngoài ngày): `{ "expectedVersion": 2, "reason": "…",
"actualStartedAt": "2026-10-13T12:05:00+07:00" }` (≤ now). Mentor gửi `actualStartedAt` → 422.

Session `SCHEDULED` → `IN_PROGRESS`, chụp roster ACTIVE tại thời điểm bắt đầu, set `editableUntil`;
Class `OPEN` → `IN_PROGRESS`. Không tự đánh dấu có mặt/vắng.

**WriteView** (response chung của mọi mutation điểm danh):

```json
{
  "session": { "...SessionView + permissions": "…" },
  "totals": { "present": 0, "absent": 0, "unmarked": 25, "eligible": 25 },
  "changedEnrollmentIds": ["…"],
  "changedMakeupPlacementIds": []
}
```

### 19.3 POST `/api/v1/class-sessions/:sessionId/attendance/sync-roster` — 200 WriteView

Body `{ "expectedVersion": 3 }` (Staff + `reason`). Dùng sau khi mentor thu tiền CASH xác nhận học viên
đã giữ chỗ trước giờ học. Mentor: chỉ khi IN_PROGRESS và còn hạn; Staff: cả COMPLETED. Không thêm được ai →
`changedEnrollmentIds: []`, version giữ nguyên.

### 19.4 PUT `/api/v1/class-sessions/:sessionId/attendance` — 200 WriteView

```json
{
  "expectedVersion": 4,
  "records": [{ "enrollmentId": "…", "status": "PRESENT" }]
}
```

- `records` 1–100, `enrollmentId` không trùng, thuộc roster của buổi. **Chỉ gửi các dòng thay đổi.**
- `IN_PROGRESS`: `UNMARKED`/`PRESENT`/`ABSENT`.
- Sau khi chốt (`COMPLETED`) hoặc buổi `CANCELLED` đã bắt đầu (chỉ Staff): chỉ `PRESENT`/`ABSENT`
  (`UNMARKED` → 422). Đây là **correction**, ghi audit `CORRECT`.
- Một dòng sai → 422 `ATTENDANCE_ENROLLMENT_NOT_ELIGIBLE`, rollback cả batch.
- Nhiều trang: gửi các batch nối tiếp, mỗi batch dùng `session.version` mới từ response trước.

### 19.5 POST `/api/v1/class-sessions/:sessionId/finalize` — 200 WriteView

Mentor `{ "expectedVersion": 5 }`; Staff thêm `reason`, có thể `actualEndedAt` (`actualStartedAt < end ≤ now`).
FE hiện **tổng toàn roster** để người dùng xác nhận trước khi gọi. Server: mọi `UNMARKED` → `ABSENT`,
Session → `COMPLETED`.

### 19.6 GET `/api/v1/management/class-sessions/:sessionId/attendance-audits` — Staff

Query `page`, `pageSize`, `enrollmentId?`. 200:

```json
{
  "items": [{
    "id": "…", "attendanceId": "…", "enrollmentId": "…",
    "actor": { "id": "…", "displayName": "Manager A" },
    "oldStatus": "ABSENT", "newStatus": "PRESENT",
    "reason": "Đối chiếu danh sách, học viên có mặt",
    "occurredAt": "2026-10-14T02:00:00Z", "action": "CORRECT", "version": 8,
    "recoveryAuditId": null, "recoveryEvidence": null
  }],
  "page": 1, "pageSize": 20, "total": 1
}
```

`action`: `ADMIT`/`MARK`/`FINALIZE`/`CORRECT`/`RECOVER`. `oldStatus`, `reason`, `actor.displayName` nullable.
Bản ghi RECOVER có `recoveryEvidence { evidenceNote, admissionBasis, paidAt, oldSessionStatus,
newSessionStatus, oldActualStartedAt, newActualStartedAt, oldActualEndedAt, newActualEndedAt }`.
Sort `occurredAt DESC`. Sau correction/recover → refetch trang 1.

### 19.7 POST `/api/v1/management/class-sessions/:sessionId/attendance/recover` — Staff

Phục hồi buổi đã học nhưng chưa điểm danh (Session `SCHEDULED` đã diễn ra hoặc `COMPLETED` thiếu dữ liệu,
kể cả lớp đã kết thúc; không cho `IN_PROGRESS` — dùng finalize — hay `CANCELLED`).

| Field | Rule |
|---|---|
| `expectedVersion` | integer ≥1 |
| `reason` | trim 1–1000 |
| `evidenceNote` | trim 1–2000 — chứng cứ |
| `actualStartedAt`, `actualEndedAt` | ISO có offset, `start < end ≤ now`, cùng ngày học, không qua đêm |
| `records[]` | 1–1000, `enrollmentId` không trùng, cùng lớp, tạo trước giờ bắt đầu |
| `records[].status` | `PRESENT`/`ABSENT` |
| `records[].admissionBasis` | `PAID_BEFORE_START` / `CASH_LATE_ADMISSION` |

Body tối đa **256 KiB**. Chỉ chèn mới: dòng đã tồn tại → 409 `ATTENDANCE_RECOVERY_RECORD_EXISTS` (dùng PUT
correction). Giờ khác giờ đã lưu → 409 `ATTENDANCE_RECOVERY_CLOCK_CONFLICT`. Thiếu bằng chứng thanh toán →
422 `ATTENDANCE_RECOVERY_EVIDENCE_INVALID`. Không tự đánh vắng người không có trong `records`.
200 WriteView (Session → `COMPLETED`).

### 19.8 Lỗi điểm danh

| Status/code | FE |
|---|---|
| 403 `SESSION_ASSIGNMENT_REQUIRED` | Không còn là mentor của buổi → dừng poll/ghi, refetch context |
| 404 `CLASS_SESSION_NOT_FOUND` | Quay lại lịch |
| 409 `SESSION_VERSION_CONFLICT` | Refetch roster, người dùng xác nhận lại, **key mới** |
| 409 `SESSION_STATE_CONFLICT` | Trạng thái buổi không phù hợp → refetch, chọn đúng thao tác |
| 409 `ATTENDANCE_START_DAY_CLOSED` / `ATTENDANCE_EDIT_WINDOW_EXPIRED` | Khoá thao tác, chuyển Staff |
| 409 `IDEMPOTENCY_KEY_REUSED` | Lỗi logic FE (cùng key khác body) |
| 422 `ATTENDANCE_ENROLLMENT_NOT_ELIGIBLE` / `HTTP_ERROR` / `CLASS_SESSION_OVERNIGHT_NOT_ALLOWED` | Hiện lỗi, sửa input |
