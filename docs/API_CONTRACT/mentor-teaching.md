# API contract: Mentor và Teaching

Mentor xem lớp, roster, thu tiền mặt (§12) và Teaching: lịch dạy, quản lý mentor, dạy thay (§18).

> Số mục (§) giữ nguyên theo contract gốc để tham chiếu chéo vẫn tra được. Mục nào nằm ở file nào: xem
> [bảng đối chiếu](README.md#bảng-đối-chiếu-mục-cũ-sang-file-mới). Quy ước chung (cookie, header `Origin`,
> format lỗi, `Idempotency-Key`, polling): [README.md](README.md).

---

## 12. Mentor: lớp, roster, thu tiền mặt

Role **MENTOR**.

### GET `/api/v1/mentor/classes?page=1&pageSize=20&status=OPEN`

200 `{ items: MentorClassDto[], … }` — `ClassDto` + `status`. Chỉ lớp mà mentor là **mentor chính**.
(Lớp dạy thay theo buổi xem qua `/mentor/schedule`, §18.5.)

### GET `/api/v1/mentor/classes/:classId/students?page&pageSize&paymentType=CASH&orderStatus=PENDING`

200 `{ items, page, pageSize, total }`, item:

```json
{
  "enrollmentId": "…", "enrollmentStatus": "PENDING_PAYMENT",
  "studentId": "…", "studentName": "Nguyễn An",
  "orderId": "…", "orderCode": "MD7K3QX9PA2B4C", "orderStatus": "PENDING",
  "paymentType": "CASH",
  "classAmount": 1500000, "orderTotalAmount": 3000000, "orderClassCount": 2,
  "expiresAt": "2026-10-12T10:00:00.000Z", "paidAt": null,
  "canConfirmCash": true
}
```

Không có email/phone/meeting URL. Lớp không thuộc mentor → 404 `CLASS_NOT_FOUND`.
**Thu và xác nhận toàn bộ `orderTotalAmount` một lần theo `orderId`**, không thu theo từng dòng/lớp.
`canConfirmCash` chỉ là gợi ý UI.

### GET `/api/v1/mentor/cash-orders?page=1&pageSize=20`

200 `{ items: OrderDto[], … }` mới nhất trước, gồm lịch sử mọi trạng thái — các order mà mentor là
**người thu tiền ghi tại thời điểm checkout**. Đổi mentor lớp sau đó **không** chuyển quyền thu tiền.

### POST `/api/v1/mentor/cash-orders/:orderId/confirm` — 200 `OrderDto`

Body `{ "receivedAmount": 3000000 }` — số nguyên VND, **phải bằng `totalAmount`**.

Kích hoạt atomically: payment `SUCCEEDED` + order `PAID` + enrollment `ACTIVE` + tiến độ học. Gọi lặp
đúng số tiền → trả order đã PAID (idempotent).

Lỗi: 403 `ORDER_ACCESS_DENIED` (không phải mentor thu tiền của order), 409 `CASH_CONFIRMATION_INVALID`
(sai số tiền/trạng thái), `CASH_ORDER_CLOSED` (hết hạn), `CASH_HOLD_INVALID`. Sau thành công: refetch roster;
nếu buổi học đang diễn ra thì gọi `sync-roster` (§19.3).

---

## 18. Teaching: quản lý mentor và dạy thay

Staff = **ADMIN/MANAGER** ACTIVE. Chi tiết: Phase 4 §14 (repo BE: `docs/api_flow/PHASE_4_flow-api-breakdown.md#14-implemented41--contract-thực-tế-và-handoff`).

`TeachingSessionDto` (SessionView):

```json
{
  "sessionId": "…", "classId": "…", "classUnitId": "…", "title": "Buổi 1",
  "startsAt": "2026-10-13T12:00:00.000Z", "endsAt": "2026-10-13T14:00:00.000Z",
  "status": "SCHEDULED",
  "primaryMentor": { "id": "…", "displayName": "Mentor A" },
  "effectiveMentor": { "id": "…", "displayName": "Mentor B" },
  "assignmentType": "SUBSTITUTE",
  "version": 3,
  "actualStartedAt": null, "actualEndedAt": null, "editableUntil": null,
  "asOf": "2026-10-13T11:30:00.000Z", "timeZone": "Asia/Ho_Chi_Minh"
}
```

`effectiveMentor` nullable (dữ liệu cũ không rõ người dạy). Trong roster (§19) có thêm `permissions`.

### 18.1 GET `/api/v1/management/classes?status=&page=&pageSize=`

200 `{ items: [{ id, code, name, status, primaryMentor, assignmentVersion }], page, pageSize, total }`,
sort `startDate DESC`.

### 18.2 GET `/api/v1/management/classes/:classId?page=&pageSize=`

200 `{ class: {…như trên}, sessions: { items: SessionView[], page, pageSize, total } }`.

### 18.3 Ứng viên mentor (không giữ chỗ)

| Route | Response |
|---|---|
| GET `/api/v1/management/class-sessions/:sessionId/available-mentors?search=&page=&pageSize=` | `{ sessionId, sessionVersion, checkedFrom, checkedTo, asOf, timeZone, availabilityBasis: "TEACHING_SCHEDULE_ONLY", items: [{ id, displayName, isCurrent }], page, pageSize, total }` |
| GET `/api/v1/management/classes/:classId/available-mentors?search=&page=&pageSize=` | `{ classId, assignmentVersion, affectedSessionCount, asOf, timeZone, availabilityBasis, items, … }` |

`search` ≤100 ký tự. Chỉ kiểm trùng **lịch dạy**; chưa xét lịch nghỉ/chuyên môn → hiện nhãn "Không trùng lịch dạy".

### 18.4 Gán mentor (cần `Idempotency-Key`)

| Route | Body | Response |
|---|---|---|
| PATCH `/api/v1/management/class-sessions/:sessionId/mentor` | `{ "mentorId": "<UUID>" \| null, "reason": "Mentor chính bận", "expectedVersion": 3 }` | 200 SessionView (version+1). `null` = gỡ dạy thay, về mentor chính |
| PATCH `/api/v1/management/classes/:classId/mentor` | `{ "mentorId": "<UUID>", "reason": "…", "expectedVersion": 2 }` (`assignmentVersion`) | 200 `{ classId, primaryMentor, assignmentVersion, affectedSessionCount, asOf }` |

`reason` 1–1000. Session SCHEDULED/IN_PROGRESS (đổi giữa buổi vẫn giữ giờ bắt đầu/deadline). Class
DRAFT/OPEN/IN_PROGRESS. Đổi mentor lớp không ghi đè các buổi đã có dạy thay hoặc đã bắt đầu.
Lỗi: 409 `CLASS_MENTOR_SCHEDULE_CONFLICT` (chọn mentor khác), `SESSION_VERSION_CONFLICT`/
`CLASS_ASSIGNMENT_VERSION_CONFLICT` (refetch), `SESSION_STATE_CONFLICT`, `IDEMPOTENCY_KEY_REUSED`;
422 `CLASS_MENTOR_NOT_ELIGIBLE`. Sau thành công: refetch detail/candidates/roster.

Mentor dạy thay **chỉ** có quyền buổi học (context + điểm danh); **không** có quyền thu tiền CASH, soạn/
duyệt tài liệu hay release chương.

### 18.5 GET `/api/v1/mentor/schedule` — MENTOR

Query `from`, `to` (ISO có offset, gửi cả cặp, tối đa 93 ngày; bỏ trống = tuần hiện tại), `classId?`,
`page`, `pageSize`. 200 `{ items: SessionView[], page, pageSize, total, from, to, timeZone, asOf }`.
Gồm buổi PRIMARY và SUBSTITUTE, sort `startsAt ASC`.

### 18.6 GET `/api/v1/class-sessions/:sessionId/context` — Staff hoặc mentor đang dạy buổi

200 `{ session: SessionView, roomName|null, meetingUrl|null, accessScope: "SESSION" }`. `meetingUrl` ưu tiên
của buổi rồi của lớp; `null` khi buổi/lớp đã kết thúc. Mentor cũ sau khi bị thay → 403.
