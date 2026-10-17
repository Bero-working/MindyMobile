# API contract: Lớp của tôi và lịch

Lớp của tôi, chi tiết lớp theo `accessMode`, preview lớp CASH và lịch cá nhân của Student (§14).

> Số mục (§) giữ nguyên theo contract gốc để tham chiếu chéo vẫn tra được. Mục nào nằm ở file nào: xem
> [bảng đối chiếu](README.md#bảng-đối-chiếu-mục-cũ-sang-file-mới). Quy ước chung (cookie, header `Origin`,
> format lỗi, `Idempotency-Key`, polling): [README.md](README.md).

---

## 14. Student: Lớp của tôi, chi tiết lớp, lịch

Role **STUDENT**. Toàn bộ là GET chỉ đọc, `Cache-Control: private, no-store`. Chi tiết:
breakdown 2.3 (repo BE: `docs/api_flow/PHASE_2_3_flow-api-breakdown.md`).

### 14.1 GET `/api/v1/me/classes`

| Query | Rule |
|---|---|
| `page`, `pageSize` | 1.., 1–100 (default 20) |
| `view` | `current` (default) / `history` / `all` |
| `enrollmentStatus`, `classStatus`, `deliveryMode`, `courseId` | optional filter |

Sort `createdAt DESC, enrollmentId ASC`. **Mỗi dòng là một enrollment** → row key là `enrollmentId`
(mua lại lớp sẽ có enrollmentId mới).

```json
{
  "items": [{
    "enrollmentId": "11111111-1111-4111-8111-111111111111",
    "enrollmentStatus": "PENDING_PAYMENT",
    "enrolledAt": null,
    "createdAt": "2026-10-10T10:00:00.000Z",
    "isHoldExpired": false,
    "courseId": "…", "courseCode": "WEB101", "courseTitle": "Web cơ bản", "courseImageUrl": null,
    "classId": "33333333-3333-4333-8333-333333333333",
    "classCode": "WEB101-A", "className": "Web lớp A", "classStatus": "OPEN",
    "deliveryMode": "ONLINE", "startDate": "2026-10-12", "endDate": "2026-11-12",
    "mentor": { "id": "…", "displayName": "Mentor Demo" },
    "order": {
      "orderId": "55555555-5555-4555-8555-555555555555",
      "orderCode": "MD-DEMO-001", "orderStatus": "PENDING", "paymentType": "CASH",
      "expiresAt": "2026-10-12T10:00:00.000Z", "paidAt": null, "requiresReview": false
    },
    "accessMode": "CASH_PREVIEW",
    "accessReason": "PENDING_CASH",
    "canViewClass": true,
    "canViewSchedule": true
  }],
  "page": 1, "pageSize": 20, "total": 1,
  "asOf": "2026-10-10T12:00:00.000Z"
}
```

**FE chọn hành động theo `accessMode`:**

| accessMode | accessReason | FE làm |
|---|---|---|
| `FULL` | `ACTIVE_ENROLLMENT` | Mở `GET /me/classes/:classId` |
| `CASH_PREVIEW` | `PENDING_CASH` | Mở `GET /me/classes/:classId/preview`, hiện hạn `order.expiresAt` |
| `NONE` | `PENDING_PAYOS` | Thẻ tóm tắt + nút "Tiếp tục thanh toán" (`order.orderId` → §11.6/11.7) |
| `NONE` | `HOLD_EXPIRED`, `ENROLLMENT_CANCELLED` | Lịch sử, không mở chi tiết |
| `NONE` | `ENROLLMENT_COMPLETED` | Đã hoàn thành; chưa có quyền xem lại chi tiết/lịch |
| `NONE` | `CLASS_CANCELLED` | Lớp bị huỷ |
| `NONE` | `STATE_MISMATCH` | Dữ liệu không nhất quán; `order` có thể `null` — hiện "liên hệ hỗ trợ" |

`order.requiresReview=true` → "Đang đối soát", không mời trả lần nữa. Access hint chỉ đúng tại `asOf`;
detail/preview luôn kiểm quyền lại.

### 14.2 GET `/api/v1/me/classes/:classId` — FULL detail

Yêu cầu enrollment ACTIVE của chính mình và lớp chưa CANCELLED. 200: `ClassDetailDto` + `meetingUrl|null`
ở root và ở từng session + `classStatus`, `enrollmentId`, `enrollmentStatus`, `enrolledAt`, `accessMode: "FULL"`.

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "courseId": "…", "code": "WEB101-A", "name": "Web lớp A",
  "startDate": "2026-10-12", "endDate": "2026-11-12",
  "deliveryMode": "ONLINE", "maxStudents": 20, "availableSeats": 5,
  "mentor": { "id": "…", "displayName": "Mentor Demo" },
  "units": [{
    "id": "<classUnitId>", "position": 1, "title": "Unit 1",
    "sessions": [{ "id": "<sessionId>", "sessionNumber": 1, "title": "Buổi 1",
      "startsAt": "…", "endsAt": "…", "roomName": null, "status": "SCHEDULED",
      "meetingUrl": "https://meet.example.test/s1" }]
  }],
  "meetingUrl": "https://meet.example.test/demo-class",
  "classStatus": "OPEN",
  "enrollmentId": "…", "enrollmentStatus": "ACTIVE", "enrolledAt": "2026-10-10T12:00:00.000Z",
  "accessMode": "FULL"
}
```

Session `CANCELLED` → nhãn "Đã huỷ", không hiện nút tham gia. Lỗi: 403 `CLASS_ACCESS_DENIED` (refetch list,
chuyển sang chế độ phù hợp), 404 `CLASS_NOT_FOUND`. FULL **không** có nghĩa đã đọc được tài liệu (§17).

> `units[].id` ở đây là **classUnitId** dùng cho API tài liệu §17.1.

### 14.3 GET `/api/v1/me/classes/:classId/preview` — CASH pending

Cùng shape với detail nhưng **không có `meetingUrl`** (root và session), không có `enrolledAt`;
thêm `orderId`, `orderCode`, `expiresAt`, `accessMode: "CASH_PREVIEW"`, `enrollmentStatus: "PENDING_PAYMENT"`.
403 `CLASS_PREVIEW_DENIED` khi hết hạn/đã xác nhận/lớp huỷ → refetch list (nếu đã FULL thì chuyển sang detail).

### 14.4 GET `/api/v1/me/schedule`

| Query | Rule |
|---|---|
| `from`, `to` | **Bắt buộc**, ISO có offset, `from < to`, tối đa **31 ngày** |
| `page` | ≥1 (default 1) |
| `pageSize` | 1–100, **default 100** |
| `classId` | optional UUID; phải có quyền lịch |
| `includeCancelled` | `true`/`false`, default `true` |

```http
GET /api/v1/me/schedule?from=2026-10-11T17:00:00Z&to=2026-10-18T17:00:00Z&page=1&pageSize=100
```

Lấy buổi giao với `[from, to)`. Sort `startsAt ASC, sessionId ASC`. Chỉ lớp `FULL`/`CASH_PREVIEW`.

```json
{
  "items": [{
    "sessionId": "…", "sessionNumber": 1, "sessionTitle": "Buổi 1", "sessionStatus": "SCHEDULED",
    "startsAt": "2026-10-12T01:00:00.000Z", "endsAt": "2026-10-12T02:00:00.000Z",
    "dayOfWeek": "Monday", "startTime": "08:00", "endTime": "09:00",
    "roomName": null,
    "classId": "…", "classCode": "WEB101-A", "className": "Web lớp A", "classStatus": "OPEN",
    "courseId": "…", "courseTitle": "Web cơ bản",
    "classUnitId": "…", "unitTitle": "Unit 1",
    "deliveryMode": "ONLINE",
    "mentor": { "id": "…", "displayName": "Mentor Demo" },
    "enrollmentId": "…", "accessMode": "CASH_PREVIEW"
  }],
  "page": 1, "pageSize": 100, "total": 1,
  "timeZone": "Asia/Ho_Chi_Minh",
  "from": "2026-10-11T17:00:00.000Z", "to": "2026-10-18T17:00:00.000Z",
  "asOf": "2026-10-10T12:00:00.000Z"
}
```

- `dayOfWeek` (Monday…Sunday), `startTime`/`endTime` (`HH:mm`) tính theo `timeZone` từ `startsAt`/`endsAt`.
- Không có meetingUrl, order/payment, attendance. Bấm event → gọi lại detail/preview, định vị theo `sessionId`.
- **Lấy đủ các trang** trước khi coi lịch tuần/tháng là đầy đủ. Lịch dài hơn 31 ngày → chia range.
- 403 `SCHEDULE_CLASS_ACCESS_DENIED` khi `classId` không có quyền → bỏ filter đó, refetch My Classes.
- Mentor hiển thị là mentor chính của lớp (mentor dạy thay theo buổi chưa đưa sang lịch Student — 4.4c).
