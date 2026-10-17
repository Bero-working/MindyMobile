# API contract: Materials

Soạn, duyệt, release tài liệu (§16) và Student đọc/tải tài liệu, staff preview (§17).

> Số mục (§) giữ nguyên theo contract gốc để tham chiếu chéo vẫn tra được. Mục nào nằm ở file nào: xem
> [bảng đối chiếu](README.md#bảng-đối-chiếu-mục-cũ-sang-file-mới). Quy ước chung (cookie, header `Origin`,
> format lỗi, `Idempotency-Key`, polling): [README.md](README.md).

---

## 16. Materials: soạn, duyệt, release

Chi tiết: breakdown 3.3 (repo BE: `docs/api_flow/PHASE_3_3_flow-api-breakdown.md`). Mutations cần **Origin** (§1.3).
Metadata response `private, no-store`, **không** có signed URL.

### 16.1 Khái niệm

- Material thuộc **Course Unit** → dùng chung cho mọi lớp dạy Course Unit đó; mỗi lớp **release riêng**.
- 3 loại:
  - `ARTICLE`: HTML (soạn bằng CKEditor) do server sanitize; ảnh inline dùng `<img data-file-id="…">`;
    có thể có attachments. Không bắt buộc upload.
  - `FILE`: 1 file primary (READY, kind khác VIDEO) + attachments tuỳ chọn.
  - `VIDEO`: 1 file primary MP4 (kind VIDEO) + attachments tuỳ chọn.
- Vòng duyệt: `DRAFT` → (Mentor submit) `PENDING_REVIEW` → Manager `APPROVED` (đồng thời publish) hoặc
  `REJECTED` (có lý do) → Mentor sửa → `DRAFT` revision+1 → submit lại.
- Mọi lần sửa nội dung → **revision+1**, về `DRAFT`, **thu hồi approval/publication**.

### 16.2 Body tạo Material (Manager và Mentor dùng chung)

| Field | Rule |
|---|---|
| `contentType` | **required** `ARTICLE`/`FILE`/`VIDEO`, bất biến |
| `title` | required, 1–250, không chỉ khoảng trắng |
| `contentHtml` | **ARTICLE bắt buộc**; ≤48 KiB UTF-8 (input và sau sanitize), depth ≤32, ≤5000 node, ≤50 `<img>`. Không gửi với FILE/VIDEO |
| `contentSchemaVersion` | chỉ ARTICLE, `1` (default 1) |
| `fileId` | **FILE/VIDEO bắt buộc**, file READY đúng Course Unit, đúng kind. Không gửi với ARTICLE |
| `attachmentFileIds` | optional, UUID v4 không trùng, ≤50, default `[]` |
| `description` | optional/null, ≤5000 |
| `sortOrder` | optional int 0..2147483647, default 0 |
| `availableAt` | optional/null, ISO có offset (Student chỉ thấy sau thời điểm này) |
| `sessionId` | optional/null, buổi thuộc đúng lớp/chương |

Toàn body ≤64 KiB. Field lạ (`courseUnitId`, `createdBy`, `externalUrl`, …) → 422.

HTML: chỉ href `http/https/mailto` tuyệt đối; bị loại `script`, `style`, event handler, `src`, `svg`, `math`,
`class`/`style` attribute. `<img>` **chỉ** có `data-file-id` (UUID của file IMAGE READY) và `alt`, không `src`/
base64/URL ngoài. Server trả lại HTML đã sanitize → editor nên hiển thị lại bản này.

```json
{
  "contentType": "ARTICLE",
  "title": "Giới thiệu Unit 1",
  "contentHtml": "<h2>Mục tiêu</h2><p>Học về biến.</p><img data-file-id=\"55555555-5555-4555-8555-555555555555\" alt=\"Sơ đồ\">",
  "contentSchemaVersion": 1,
  "attachmentFileIds": []
}
```

```json
{ "contentType": "VIDEO", "title": "Video Unit 1", "fileId": "88888888-8888-4888-8888-888888888888" }
```

### 16.3 Response Material (detail)

```json
{
  "id": "44444444-4444-4444-8444-444444444444",
  "courseUnitId": "33333333-3333-4333-8333-333333333333",
  "contentType": "FILE",
  "contentHtml": null,
  "contentSchemaVersion": null,
  "inlineImages": [],
  "attachments": [],
  "title": "Bài đọc Unit 1",
  "description": "Tài liệu chuẩn bị",
  "sortOrder": 0,
  "availableAt": "2026-10-11T02:00:00.000Z",
  "sessionId": null,
  "file": { "id": "…", "originalFilename": "unit-1.pdf", "mimeType": "application/pdf", "kind": "PDF", "sizeBytes": 2048 },
  "reviewStatus": "DRAFT",
  "revision": 1,
  "approvedRevision": null,
  "reviewedBy": null,
  "reviewedAt": null,
  "firstApprovedAt": null,
  "rejectionReason": null,
  "publishedAt": null,
  "createdBy": "66666666-6666-4666-8666-666666666666",
  "createdInClassId": null,
  "createdAt": "2026-10-11T01:00:00.000Z",
  "updatedAt": "2026-10-11T01:00:00.000Z",
  "canEdit": true
}
```

- ARTICLE: `file=null`, `contentHtml` canonical, `contentSchemaVersion=1`, `inlineImages[]`/`attachments[]`
  là file summary cùng shape `file`.
- **List** (unit list, queue) **không** có `contentHtml`/`contentSchemaVersion`/`inlineImages`/`attachments` →
  mở editor phải GET detail.
- `canEdit` chỉ là gợi ý; BE luôn kiểm lại.
- Mentor xem Material đã duyệt của người khác: không có `rejectionReason`, `createdInClassId`, thông tin
  reviewer/creator.

### 16.4 Manager (role MANAGER)

| Method + route | Input | Response |
|---|---|---|
| GET `/api/v1/manager/course-units/:courseUnitId/materials` | `page, pageSize, contentType?, reviewStatus?` | 200 page summary, sort `sortOrder ASC, id ASC` |
| POST `/api/v1/manager/course-units/:courseUnitId/materials` | body §16.2 | 201 detail `DRAFT`, revision 1 |
| GET `/api/v1/manager/materials` | `page, pageSize, reviewStatus?, courseUnitId?, contentType?` | 200 page, sort `createdAt DESC`. Hàng đợi duyệt: `?reviewStatus=PENDING_REVIEW` |
| GET `/api/v1/manager/materials/:materialId` | — | 200 detail |
| PATCH `/api/v1/manager/materials/:materialId` | `expectedRevision` + ít nhất 1 field nội dung | 200 detail revision+1, `DRAFT` |
| DELETE `/api/v1/manager/materials/:materialId?expectedRevision=1` | query | 204 (xoá mềm) |
| POST `.../approve` | `{ "expectedRevision": 1 }` | 200 detail `APPROVED` + `publishedAt` |
| POST `.../reject` | `{ "expectedRevision": 1, "reason": "Cần bổ sung ví dụ" }` (1–2000, trim) | 200 detail `REJECTED` |
| POST `.../publish` | `{ "expectedRevision": 1 }` | 200 detail, set `publishedAt` |
| POST `.../unpublish` | `{ "expectedRevision": 1 }` | 200 detail, `publishedAt=null`, giữ approval |

PATCH: `contentHtml` (chỉ ARTICLE), `fileId` (chỉ FILE/VIDEO), `title`, `sortOrder` không được null;
`description`/`availableAt`/`sessionId`: bỏ qua = giữ, `null` = xoá; `attachmentFileIds`: bỏ qua = giữ,
`[]` = xoá, `null` = 422. Không đổi `contentType`/`contentSchemaVersion`.

Quy tắc duyệt:

- Approve: `PENDING_REVIEW`, hoặc DRAFT do **chính Manager đó** tạo (không gắn lớp), hoặc bản Manager sửa
  sau khi từng được duyệt. Mentor DRAFT chưa submit → 409.
- Approve lặp cùng revision → no-op. Approve lại sau unpublish **không** tự publish → cần gọi publish.
- Reject chỉ từ `PENDING_REVIEW`.
- Trước khi approve/reject: GET detail lấy `revision`, preview file (§17.5), gửi đúng revision đã xem.
  409 → refetch và để người dùng quyết định lại, **không tự approve revision mới**.

### 16.5 Mentor (role MENTOR, được phân công lớp chưa CANCELLED)

Context (để lấy ID):

| Route | Response item |
|---|---|
| GET `/api/v1/mentor/classes/:classId/units?page&pageSize` | `{ id (classUnitId → dùng làm unitId), classId, courseUnitId, title, position, status, unlockAt }` |
| GET `/api/v1/mentor/classes/:classId/units/:unitId/sessions?page&pageSize` | `{ id (sessionId), classUnitId, title, sessionNumber, status }` |

Authoring:

| Method + route | Input | Response |
|---|---|---|
| GET `/api/v1/mentor/classes/:classId/units/:unitId/materials` | `page, pageSize, reviewStatus?, contentType?` | 200 page: Material đã duyệt+publish + bản nháp của chính mình trong lớp này |
| POST `/api/v1/mentor/classes/:classId/units/:unitId/materials` | body §16.2 | 201 detail `DRAFT`, `createdInClassId=classId` |
| GET `/api/v1/mentor/classes/:classId/materials/:materialId` | — | 200 detail |
| PATCH `/api/v1/mentor/classes/:classId/materials/:materialId` | như Manager | 200, chỉ bản **của mình** ở `DRAFT`/`REJECTED` và **chưa từng được duyệt** |
| DELETE `/api/v1/mentor/classes/:classId/materials/:materialId?expectedRevision=1` | query | 204, cùng điều kiện |
| POST `/api/v1/mentor/classes/:classId/materials/:materialId/submit` | `{ "expectedRevision": 1 }` | 200 detail `PENDING_REVIEW` |

- Pending: không sửa/xoá được (403). Rejected: phải PATCH trước khi submit lại (submit thẳng → 409).
- Đã từng được duyệt: Mentor không sửa/xoá/submit nữa (403).
- File gắn vào phải do chính Mentor upload (403 `FILE_OWNER_MISMATCH` nếu không).
- Mất assignment: mọi route → 403 `MATERIAL_ACCESS_DENIED`; Manager vẫn duyệt được submission.

### 16.6 Release chương (Class Unit) theo lớp

| Route | Role |
|---|---|
| PATCH `/api/v1/admin/classes/:classId/units/:unitId/release` | ADMIN |
| PATCH `/api/v1/mentor/classes/:classId/units/:unitId/release` | MENTOR được phân công |

Cần Origin. `unitId` = **classUnitId** (từ Admin class detail hoặc Mentor units context).

```json
{ "status": "OPEN", "unlockAt": "2026-10-11T09:00:00+07:00" }
```

- `status` bắt buộc `LOCKED`/`OPEN` (gửi `COMPLETED` → 422).
- `unlockAt`: bỏ qua = giữ giá trị cũ; `null` = xoá lịch; quá khứ hợp lệ. `OPEN` + tương lai → Student
  thấy khi tới giờ server (không cần worker).
- 200 `{ id, classId, courseUnitId, title, position, status, unlockAt }`.
- 409 `UNIT_RELEASE_CONFLICT` (chương COMPLETED hoặc lớp CANCELLED). Gọi lặp cùng payload = no-op.
- Release **không** duyệt Material, không đổi enrollment/thanh toán. Không có `expectedRevision`;
  mất response → refetch, không tự gửi lại trạng thái cũ.

### 16.7 Lỗi Materials

| Status/code | FE |
|---|---|
| 403 `MATERIAL_ACCESS_DENIED` / `FILE_OWNER_MISMATCH` | Dừng retry, refetch quyền/assignment |
| 403 `ORIGIN_NOT_ALLOWED` | Lỗi cấu hình proxy |
| 404 `MATERIAL_NOT_FOUND` / `FILE_NOT_FOUND` / `CLASS_NOT_FOUND` / `CLASS_UNIT_NOT_FOUND` / `CLASS_SESSION_NOT_FOUND` | Đóng item, refetch context |
| 409 `MATERIAL_REVIEW_CONFLICT` | Refetch, so sánh revision, người dùng quyết định lại |
| 409 `FILE_NOT_READY` | File đang PROCESSING → quay lại poll §15.4; FAILED/DELETED → không gắn được |
| 409 `UNIT_RELEASE_CONFLICT` | Refetch, disable thao tác |
| 413 `MATERIAL_CONTENT_TOO_LARGE` / `INVALID_JSON_BODY` | Rút gọn bài |
| 422 `MATERIAL_CONTENT_INVALID` / `MATERIAL_SCOPE_MISMATCH` / `HTTP_ERROR` | Giữ form, hiện lỗi |

POST tạo **không có idempotency key**: mất response → refetch list trước khi tạo lại.

---

## 17. Materials: Student đọc/tải và staff preview

Chi tiết: breakdown 3.4 (repo BE: `docs/api_flow/PHASE_3_4_flow-api-breakdown.md`). Student đọc được khi **đủ tất cả**:
user ACTIVE, enrollment ACTIVE, lớp chưa CANCELLED, Class Unit `OPEN`/`COMPLETED` và đã tới `unlockAt`,
Material chưa xoá + được duyệt đúng revision + đã publish + đã tới `availableAt`, mọi file READY.
Enrollment `COMPLETED` **không** có quyền đọc.

### 17.1 GET `/api/v1/me/classes/:classId/units/:classUnitId/materials?page=1&pageSize=20`

`classUnitId` = `units[].id` từ §14.2. 200:

```json
{
  "items": [{
    "id": "33333333-3333-4333-8333-333333333333",
    "classId": "…", "classUnitId": "…", "courseUnitId": "…",
    "contentType": "FILE", "title": "Bài học", "description": null,
    "sortOrder": 0, "revision": 1, "sessionId": null, "availableAt": null,
    "publishedAt": "2026-10-12T08:00:00.000Z", "updatedAt": "2026-10-12T08:00:00.000Z",
    "file": { "id": "…", "originalFilename": "lesson.pdf", "mimeType": "application/pdf", "sizeBytes": 4096, "kind": "PDF" },
    "attachmentCount": 0
  }],
  "page": 1, "pageSize": 20, "total": 1, "asOf": "2026-10-12T09:00:00.000Z"
}
```

`file` = `null` với ARTICLE. `total` chỉ đếm tài liệu được xem. Danh sách rỗng có thể do chương còn khoá,
chưa có tài liệu, hoặc chưa tới giờ — dùng `units[].status/unlockAt` (nếu có) để giải thích.

### 17.2 GET `/api/v1/me/classes/:classId/materials/:materialId`

Item §17.1 + `contentHtml` (ARTICLE), `contentSchemaVersion`, `inlineImages[]`, `attachments[]`
(mảng luôn có, có thể rỗng, không chứa URL). 404 `MATERIAL_NOT_FOUND` khi ẩn/không tồn tại.

**Render ARTICLE**: parse `contentHtml` (đã sanitize), **không** chèn script/style. Với mỗi
`img[data-file-id]` thuộc `inlineImages` → gọi §17.4 lấy URL rồi gán `src` vào DOM tạm thời; không ghi URL
vào HTML/cache. Attachments → nút tải gọi §17.4.

### 17.3 GET `/api/v1/me/classes/:classId/materials/:materialId/download` — primary FILE/VIDEO

200 (JSON, không redirect):

```json
{
  "materialId": "33333333-3333-4333-8333-333333333333",
  "fileId": "55555555-5555-4555-8555-555555555555",
  "url": "https://storage.example.test/private/obj?versionId=v&X-Amz-Expires=60&X-Amz-Signature=…",
  "expiresAt": "2026-10-12T09:01:00.000Z"
}
```

ARTICLE → 404 (dùng §17.4). `url` là capability ngắn hạn (TTL ≤60s): chỉ giữ trong bộ nhớ, không log/
localStorage, GET trực tiếp storage không kèm cookie. Hỗ trợ Range 206 (seek video). URL hết hạn/lỗi 403 từ
storage → gọi lại BE **một lần** để lấy URL mới, khôi phục `currentTime`; vẫn lỗi thì báo lỗi.

### 17.4 POST `/api/v1/me/classes/:classId/materials/:materialId/files/:fileId/access`

Cần Origin; body `{}` hoặc rỗng. `fileId` lấy từ `file.id`, `inlineImages[].id` hoặc `attachments[].id`
**của chính detail đó**. 200 (không phải 201):

```json
{
  "materialId": "…", "fileId": "…",
  "role": "INLINE_IMAGE",
  "revision": 2,
  "url": "https://storage.example.test/…",
  "expiresAt": "2026-10-14T09:01:00.000Z"
}
```

`role` do server xác định: `PRIMARY`/`INLINE_IMAGE` → mở inline; `ATTACHMENT` → trình duyệt tải xuống.
`revision` khác revision đang hiển thị → refetch detail. File không thuộc Material → 404.
Không prefetch hàng loạt ngoài viewport.

### 17.5 Staff preview (trước khi duyệt)

| Route | Actor | Điều kiện |
|---|---|---|
| POST `/api/v1/manager/materials/:materialId/files/:fileId/access` | MANAGER | Material chưa xoá, mọi trạng thái; mọi file READY |
| POST `/api/v1/mentor/classes/:classId/materials/:materialId/files/:fileId/access` | MENTOR được phân công | Material đã duyệt + publish, **hoặc** bản nháp của chính mình trong lớp, chưa từng duyệt |

Cần Origin, body `{}`, response giống §17.4. Không dùng route Student thay thế và ngược lại.

### 17.6 Lỗi đọc tài liệu

| Status/code | FE |
|---|---|
| 403 `MATERIAL_ACCESS_DENIED` | Không còn ACTIVE/lớp huỷ → refetch My Classes, dừng player |
| 404 `CLASS_UNIT_NOT_FOUND` / `CLASS_NOT_FOUND` | Refetch class detail / về My Classes |
| 404 `MATERIAL_NOT_FOUND` | "Tài liệu chưa khả dụng", refetch list |
| 409 `FILE_NOT_READY` | Refetch detail |
| 503 `FILE_STORAGE_DISABLED` | Không tải được nhưng metadata vẫn đọc |
| 503 `FILE_STORAGE_UNAVAILABLE` | Retry hữu hạn theo thao tác người dùng |
