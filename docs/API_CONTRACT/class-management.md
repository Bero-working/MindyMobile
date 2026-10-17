# API contract: Quản lý lớp (Admin)

Admin quản lý lớp, buổi học, roster học viên (§10). Đọc khi làm tính năng quản lý lớp cho ADMIN hoặc cần
shape `ClassManagementDetailDto`.

> Số mục (§) giữ nguyên theo contract gốc để tham chiếu chéo vẫn tra được. Mục nào nằm ở file nào: xem
> [bảng đối chiếu](README.md#bảng-đối-chiếu-mục-cũ-sang-file-mới). Quy ước chung (cookie, header `Origin`,
> format lỗi, `Idempotency-Key`, polling): [README.md](README.md).

---

## 10. Admin quản lý lớp, buổi học, học viên

Role **ADMIN**. Response chung `ClassManagementDetailDto`:

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "courseId": "22222222-2222-4222-8222-222222222222",
  "code": "WEB101-A", "name": "Web lớp A",
  "startDate": "2026-10-13", "endDate": "2026-11-14",
  "deliveryMode": "ONLINE", "maxStudents": 20, "availableSeats": 5,
  "mentor": { "id": "44444444-4444-4444-8444-444444444444", "displayName": "Mentor Demo" },
  "assignmentVersion": 2,
  "status": "OPEN",
  "meetingUrl": "https://meet.example.test/web101-a",
  "createdAt": "2026-10-01T03:00:00.000Z",
  "updatedAt": "2026-10-10T03:00:00.000Z",
  "units": [{
    "id": "55555555-5555-4555-8555-555555555555",
    "courseUnitId": "66666666-6666-4666-8666-666666666666",
    "position": 1, "title": "Unit 1",
    "status": "LOCKED", "unlockAt": null,
    "sessions": [{
      "id": "77777777-7777-4777-8777-777777777777",
      "classUnitId": "55555555-5555-4555-8555-555555555555",
      "sessionNumber": 1, "title": "Buổi 1",
      "startsAt": "2026-10-13T08:00:00.000Z", "endsAt": "2026-10-13T10:00:00.000Z",
      "roomName": null, "status": "SCHEDULED", "meetingUrl": null
    }]
  }]
}
```

### 10.1 Lớp

| Method + route | Body/query | Response |
|---|---|---|
| GET `/api/v1/admin/classes` | `page, pageSize, courseId?, mentorId?, status?, deliveryMode?` | 200 `{ items: ClassManagementDto[], … }` |
| GET `/api/v1/admin/classes/:classId` | — | 200 `ClassManagementDetailDto` |
| POST `/api/v1/admin/classes` | `{ courseId, mentorId, code (2–50), name (1–250), startDate, endDate (YYYY-MM-DD), maxStudents (1–1000), deliveryMode, meetingUrl? (≤2048) }` | 201 detail; lớp ở `DRAFT`, units sinh từ Course Units |
| PATCH `/api/v1/admin/classes/:classId` | Bất kỳ: `name`, `startDate`, `endDate`, `maxStudents`, `deliveryMode`, `meetingUrl` (null xoá). **Đổi mentor**: `mentorId` + `expectedVersion` (= `assignmentVersion`) + `reason` (1–1000) + header `Idempotency-Key`; gửi các field mentor **riêng** với các field khác | 200 detail |
| POST `/api/v1/admin/classes/:classId/sessions` | `{ classUnitId, title (1–250), startsAt, endsAt (ISO có offset), roomName? (≤150), meetingUrl? }` | 201 detail |
| POST `/api/v1/admin/classes/:classId/open` | — | 200 detail (`DRAFT → OPEN`) |
| POST `/api/v1/admin/classes/:classId/start` | — | 200 detail (`→ IN_PROGRESS`) |
| POST `/api/v1/admin/classes/:classId/complete` | — | 200 detail (`→ COMPLETED`; bị chặn nếu còn Session SCHEDULED/IN_PROGRESS → 409 `SESSION_STATE_CONFLICT`) |
| POST `/api/v1/admin/classes/:classId/cancel` | — | 200 detail (`→ CANCELLED`) |

Lỗi: 409 `CLASS_CODE_ALREADY_EXISTS`, `CLASS_COURSE_INACTIVE`, `CLASS_NOT_EDITABLE`,
`CLASS_INVALID_TRANSITION`, `CLASS_NOT_READY_TO_OPEN`, `CLASS_SESSION_OVERLAP`,
`CLASS_MENTOR_SCHEDULE_CONFLICT`; 422 `CLASS_DATE_RANGE_INVALID`,
`CLASS_SESSION_TIME_RANGE_INVALID`, `CLASS_SESSION_OUTSIDE_CLASS_PERIOD`,
`CLASS_SESSION_OVERNIGHT_NOT_ALLOWED` (buổi học không được qua đêm), `CLASS_MENTOR_NOT_ELIGIBLE`.

### 10.2 Sửa giờ buổi học (giữ nguyên ngày)

| Route | Body |
|---|---|
| PATCH `/api/v1/admin/classes/:classId/sessions/:sessionId` | `{ "startTime": "07:30", "endTime": "09:30" }` |
| PATCH `/api/v1/admin/classes/:classId/sessions/bulk` | `{ "sessionIds": [UUID…], "startTime": "07:30", "endTime": "09:30" }` |

- `HH:mm` đúng định dạng 00:00–23:59 (không `7:30`, `24:00`, giây). `sessionIds` 1–100 UUID không trùng,
  phải thuộc lớp. Hơn 100 buổi → chia nhiều request (mỗi request atomic riêng).
- Server ghép giờ với **ngày hiện tại của buổi** theo `APP_TIME_ZONE`. Chỉ Class `DRAFT/OPEN/IN_PROGRESS`
  và Session `SCHEDULED`. Bulk lỗi 1 buổi → rollback toàn bộ.
- 200 `ClassManagementDetailDto`. Lỗi: 404 `CLASS_NOT_FOUND`/`CLASS_SESSION_NOT_FOUND`, 409
  `CLASS_NOT_EDITABLE`/`CLASS_SESSION_NOT_EDITABLE`/`CLASS_SESSION_OVERLAP`/`CLASS_MENTOR_SCHEDULE_CONFLICT`,
  422 `CLASS_SESSION_TIME_RANGE_INVALID`/`CLASS_SESSION_OUTSIDE_CLASS_PERIOD`/`CLASS_SESSION_LOCAL_TIME_INVALID`.
- Sau thành công: dùng detail mới, invalidate lịch Student.

### 10.3 Roster học viên theo lớp

**GET `/api/v1/admin/classes/:classId/students?page=1&pageSize=20`** — 200:

```json
{
  "items": [{
    "studentId": "22222222-2222-4222-8222-222222222222",
    "studentName": "Nguyễn An",
    "email": "an@example.test",
    "phone": null,
    "studentStatus": "ACTIVE",
    "enrollmentId": "33333333-3333-4333-8333-333333333333",
    "enrollmentStatus": "PENDING_PAYMENT",
    "enrolledAt": null
  }],
  "page": 1, "pageSize": 20, "total": 1
}
```

Chỉ enrollment `PENDING_PAYMENT/ACTIVE/COMPLETED` (không có CANCELLED). Sort đăng ký mới nhất trước.
`PENDING_PAYMENT` **không** có nghĩa đã trả tiền.

**GET `/api/v1/admin/classes/:classId/students/:studentId`** — 200: các field trên + `classId`,
`orderDetailId` (không phải orderId), `registeredAt`, `accountCreatedAt`, `lastLoginAt|null`.
404 `CLASS_STUDENT_NOT_FOUND` nếu học viên không thuộc lớp.

### 10.4 Mở/khoá chương — xem §16.6.
