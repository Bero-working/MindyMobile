# API contract cho Mobile

Điểm vào của API contract Mindy Center: quy ước chung, mã lỗi, enum, bản đồ route theo role, polling/refetch và
danh sách API chưa có. Ai viết service, hook query/mutation hoặc spec phase **PHẢI** đọc file này trước, rồi mới đọc
file domain liên quan.

Contract tổng hợp từ source BE (nhánh `feat/phase-3-3`, đã chứa dev `e0c9174`), đối chiếu ngày 2026-10-16, và các
flow trong `docs/api_flow/` của repo BE. Khi contract lệch với BE, **source code + Swagger (`/docs`) là nguồn sự
thật**.

## Nguồn contract nhận từ BE

[API_CONTRACT_BE.md](API_CONTRACT_BE.md) là bản contract **nguyên văn nhận từ BE** (repo BE:
`docs/api_flow/API_CONTRACT_FE.md`). Đây là nguồn của mọi file domain trong thư mục này. Lý do:
[ADR-0026](../adr/ADR-0026-be-api-contract-source.md).

- Chỉ owner (@Bero) cập nhật `API_CONTRACT_BE.md`, bằng cách chép đè bản mới nhất từ BE. **KHÔNG ĐƯỢC** sửa tay
  nội dung file này trong repo mobile.
- Mỗi lần file này đổi, PHẢI đồng bộ phần khác biệt sang file domain tương ứng (README.md và các file theo
  [bảng đối chiếu](#bảng-đối-chiếu-mục-cũ-sang-file-mới)) trong cùng commit, giữ nguyên số mục (§). So khác biệt
  bằng `git diff docs/API_CONTRACT/API_CONTRACT_BE.md`.
- Thay đổi ảnh hưởng spec phase đang làm (`docs/IMPLEMENT/`) hoặc `BUSINESS_RULES.md` thì báo owner trước khi sửa
  spec/rule theo B.9 của [docs/README.md](../README.md).
- File domain lệch với `API_CONTRACT_BE.md` thì `API_CONTRACT_BE.md` thắng; sửa file domain cho khớp.

Lần đồng bộ gần nhất: 2026-10-17 (§11.1 hành vi giỏ hàng, §11.4 giỏ bị xoá sau checkout → [cart.md](cart.md)).

## File theo domain

| File | Nội dung | Mục gốc |
| --- | --- | --- |
| [README.md](README.md) | Trạng thái IMPL/PLANNED, quy ước chung, lỗi, enum, route theo role, health, polling/refetch, API chưa có, ghi chú lệch | §0–§5, §21–§23 |
| [auth.md](auth.md) | Đăng ký, đăng nhập, refresh, logout, Google OIDC, Admin quản lý user | §6, §7 |
| [catalog.md](catalog.md) | Catalog public, Admin catalog | §8, §9 |
| [class-management.md](class-management.md) | Admin quản lý lớp, buổi học, roster | §10 |
| [cart.md](cart.md) | Quy tắc thanh toán chung, giỏ hàng, checkout | §11 (đầu), §11.1–11.4 |
| [orders-payment.md](orders-payment.md) | Order, PayOS, Admin đối soát | §11.5–11.8, §13 |
| [my-classes.md](my-classes.md) | Lớp của tôi, chi tiết/preview lớp, lịch Student | §14 |
| [files.md](files.md) | Upload file private | §15 |
| [materials.md](materials.md) | Soạn/duyệt/release tài liệu, Student đọc/tải | §16, §17 |
| [mentor-teaching.md](mentor-teaching.md) | Mentor: lớp, roster, thu tiền mặt; Teaching: lịch dạy, dạy thay | §12, §18 |
| [attendance.md](attendance.md) | Điểm danh, sửa, phục hồi, audit | §19 |
| [flows.md](flows.md) | Flow end-to-end theo vai trò | §20 |

Số mục (§) giữ nguyên theo contract gốc trong mọi file, nên tham chiếu như "§1.3" hay "§16.6" vẫn tra được qua
[bảng đối chiếu](#bảng-đối-chiếu-mục-cũ-sang-file-mới) ở cuối file.

## Tài liệu nguồn ở repo BE

Các flow/breakdown theo phase của BE (không có trong repo mobile):

| Phase | Flow | Breakdown chi tiết |
|---|---|---|
| 1 — Identity/Account | PHASE_1_FLOW (repo BE: `docs/api_flow/PHASE_1_FLOW.md`) | breakdown (repo BE: `docs/api_flow/PHASE_1_flow-api-breakdown.md`) |
| 2 — Catalog/Cart/Payment | contract Phase 2 (repo BE: `docs/PHASE_2_FE_CONTRACT.md`) | (contract) |
| 2.3 — My Classes/Lịch | PHASE_2_3_FLOW (repo BE: `docs/api_flow/PHASE_2_3_FLOW.md`) | breakdown (repo BE: `docs/api_flow/PHASE_2_3_flow-api-breakdown.md`) · contract 2.3 (repo BE: `docs/PHASE_2_3_FE_CONTRACT.md`) |
| 2.3 → 3.x tổng quan | PHASE_2_3_TO_3_2_FLOW (repo BE: `docs/api_flow/PHASE_2_3_TO_3_2_FLOW.md`) | — |
| 3.2 — Upload file | PHASE_3_2_FLOW (repo BE: `docs/api_flow/PHASE_3_2_FLOW.md`) | breakdown (repo BE: `docs/api_flow/PHASE_3_2_flow-api-breakdown.md`) |
| 3.3 — Material CRUD/review/release | PHASE_3_3_FLOW (repo BE: `docs/api_flow/PHASE_3_3_FLOW.md`) | breakdown (repo BE: `docs/api_flow/PHASE_3_3_flow-api-breakdown.md`) |
| 3.4 — Student material/preview | PHASE_3_4_FLOW (repo BE: `docs/api_flow/PHASE_3_4_FLOW.md`) | breakdown (repo BE: `docs/api_flow/PHASE_3_4_flow-api-breakdown.md`) · FE gaps (repo BE: `docs/api_flow/PHASE_3_4_FE_API_GAPS.md`) |
| 4 — Điểm danh/dạy thay | PHASE_4_FLOW (repo BE: `docs/api_flow/PHASE_4_FLOW.md`) | breakdown (repo BE: `docs/api_flow/PHASE_4_flow-api-breakdown.md`) |
| 4.1 / 4.2 / 4.3 | 4.1 (repo BE: `docs/api_flow/PHASE_4_1_FLOW.md`) · 4.2 (repo BE: `docs/api_flow/PHASE_4_2_FLOW.md`) · 4.3 (repo BE: `docs/api_flow/PHASE_4_3_FLOW.md`) | 4.1 (repo BE: `docs/api_flow/PHASE_4_1_flow-api-breakdown.md`) · 4.2 (repo BE: `docs/api_flow/PHASE_4_2_flow-api-breakdown.md`) · 4.3 (repo BE: `docs/api_flow/PHASE_4_3_flow-api-breakdown.md`) |

---

## 0. Trạng thái triển khai — đọc trước khi gọi API

| Nhãn | Ý nghĩa |
|---|---|
| **IMPL** | Có trong source, đã test local (PostgreSQL test DB + HTTP E2E với provider giả). |
| **VPS ✓** | Đã có nghiệm thu trên VPS. |
| **PLANNED** | Mới có thiết kế, **chưa có route**. FE không được gọi. |

| Nhóm | Source | Môi trường |
|---|---|---|
| Auth, Users, Catalog, Classes admin, Cart/Checkout/Orders (Phase 0–2) | IMPL | Đã chạy trên server; giao dịch **PayOS thật** vẫn chờ nghiệm thu live theo runbook 2.2 |
| Phase 2.3 My Classes/Lịch, Admin sửa giờ Session, Admin roster học viên | IMPL | Chưa có bằng chứng VPS |
| Phase 3.2 Files | IMPL | **VPS ✓** (user xác nhận 2026-10-12) |
| Phase 3.3 Material CRUD/review/release, 3.4 Student materials + staff preview | IMPL (local 13–14/10) | Chưa deploy branch; chưa nghiệm thu browser |
| Phase 4.1 Teaching, 4.2 Attendance, 4.3 Correction/Recovery/Audit | IMPL (local) | Có trong dev `e0c9174` (deploy run thành công) nhưng **chưa nghiệm thu VPS/FE** |
| Phase 4.4a/b/c, 4.5 (nghỉ dạy, học bù, Student xem điểm danh…) | **PLANNED** | — |

> Một route có trong source **không** có nghĩa là môi trường FE đang gọi đã có release đó. Kiểm
> Swagger của môi trường (`/docs` khi `SWAGGER_ENABLED=true`) trước khi bật tính năng.

---

## 1. Quy ước chung

### 1.1 Base URL, version

- Mọi route BE: `{API_ORIGIN}/api/v1/...`. Trong tài liệu, route viết đầy đủ `/api/v1/...`.
- Swagger: `{API_ORIGIN}/docs` (chỉ khi bật).
- **Ngoại lệ**: PUT upload file và GET signed URL đi **trực tiếp tới storage (MinIO)**, không qua BE.

### 1.2 Xác thực bằng cookie

- Đăng nhập trả 2 cookie `HttpOnly`, `SameSite=Lax`, `Secure` theo `COOKIE_SECURE`:
  - `access_token` — path `/`, TTL mặc định **900 giây**.
  - `refresh_token` — path `/api/v1/auth/refresh`, TTL mặc định **30 ngày**, xoay vòng mỗi lần refresh.
- FE **không** đọc/lưu token. Mọi request BE gửi `credentials: 'include'` (fetch) hoặc
  `withCredentials: true` (Axios). Không dùng Bearer header, không localStorage.
- Không bao giờ gửi `studentId`, `mentorId` của chính mình, `role`, `status` để tự cấp quyền. Server
  lấy actor từ cookie.
- CORS: origin của FE phải nằm trong `CORS_ORIGINS` của BE.

### 1.3 Header `Origin` bắt buộc cho một số mutation

Các route sau kiểm tra header `Origin` phải thuộc `CORS_ORIGINS`, thiếu/sai → **403 `ORIGIN_NOT_ALLOWED`**:

- Mọi mutation `/manager/...materials...` và `/mentor/classes/:classId/...materials...` (POST/PATCH/DELETE).
- `PATCH .../units/:unitId/release` (Admin và Mentor).
- `POST /me/classes/:classId/materials/:materialId/files/:fileId/access` (Student).
- `POST .../files/:fileId/access` của Manager/Mentor.

Browser tự gửi `Origin`. Nếu FE đi qua proxy/BFF server-side thì proxy **phải chuyển tiếp nguyên header
Origin**. Khi test bằng Postman, phải tự thêm header `Origin`. GET không cần Origin.

### 1.4 Response

- Success là **DTO JSON trực tiếp**, **không** có wrapper `{ data: ... }`.
- List phân trang: `{ items, page, pageSize, total }` (một số list thêm `asOf`, `timeZone`, `from`, `to`).
- Query phân trang: `page` integer ≥1 (default 1), `pageSize` integer 1–100 (default 20 trừ khi ghi khác).
  `page` vượt quá dữ liệu → `200` với `items: []`, `total` giữ nguyên.
- Dữ liệu cá nhân trả `Cache-Control: private, no-store` (Files: `no-store`). FE không cache chéo user.
- Status code:
  - `GET` → 200; `POST` tạo resource → 201; action `POST` (approve, start, finalize, access…) → 200;
  - `PATCH`/`PUT` → 200; `DELETE` → 204 (không body); `POST /auth/register` → 202.

### 1.5 Validation

- Global ValidationPipe: whitelist + **forbidNonWhitelisted** → gửi field lạ là lỗi.
- **Path UUID sai** (ParseUUIDPipe) → **400 `HTTP_ERROR`**.
- **Body/query sai** (kiểu, enum, giới hạn, field lạ, UUID trong body/query) → **422 `HTTP_ERROR`**,
  `message`/`details` có thể là **mảng** chuỗi.
- JSON hỏng → 400 `INVALID_JSON_BODY`; body quá lớn → 413 `INVALID_JSON_BODY`. Giới hạn body mặc định
  **64 KiB**; riêng `POST .../attendance/recover` là **256 KiB**.
- UUID là **v4**.

### 1.6 Thời gian

- Response timestamps: ISO 8601 UTC (`2026-10-12T01:00:00.000Z`).
- Ngày thuần: `YYYY-MM-DD` (startDate/endDate của lớp, filter catalog).
- Timestamp gửi lên BE **phải có offset** (`Z` hoặc `+07:00`). Thiếu timezone → 422.
- Múi giờ nghiệp vụ = `APP_TIME_ZONE` (hiện `Asia/Ho_Chi_Minh`, một số ví dụ ghi `Asia/Bangkok` — cùng +07).
  Response lịch có field `timeZone`; FE dùng giá trị đó để hiển thị.
- `asOf` = thời điểm server đánh giá quyền/thời hạn. Không dùng đồng hồ client để tự quyết quyền.
- Khi build query string có `+07:00`, dùng `URLSearchParams` để encode dấu `+`.

### 1.7 Concurrency: `expectedVersion`, `expectedRevision`, `Idempotency-Key`

| Cơ chế | Dùng ở | Cách FE làm |
|---|---|---|
| `expectedRevision` (integer ≥1) | Materials (PATCH/DELETE/submit/approve/reject/publish/unpublish) | Lấy `revision` từ detail mới nhất. 409 → refetch, cho user quyết định lại. Không tự tăng rồi retry. |
| `expectedVersion` (integer ≥1) | Teaching (assignmentVersion / session version), Attendance (`session.version`), Admin PATCH class khi đổi mentor | Lấy từ GET mới nhất. 409 `SESSION_VERSION_CONFLICT`/`CLASS_ASSIGNMENT_VERSION_CONFLICT` → refetch. |
| Header `Idempotency-Key` (UUID v4) | Mọi mutation Teaching 4.1 và Attendance 4.2/4.3, Admin PATCH class có `mentorId` | Tạo **1 key cho 1 ý định**. Retry do lỗi mạng: **giữ nguyên key + body**. Đổi body/ý định → key mới. Cùng key khác body → 409 `IDEMPOTENCY_KEY_REUSED`. Thiếu/sai header → 422. |

Replay cùng key trả lại kết quả đã commit (có thể có `asOf`/`permissions` cũ) → luôn GET lại sau đó.

### 1.8 Request ID

Response có header `x-request-id`; error body có `requestId` (có thể thiếu). FE nên log/hiện mã này khi báo lỗi.

---

## 2. Error envelope và bảng mã lỗi

```json
{
  "statusCode": 409,
  "code": "MATERIAL_REVIEW_CONFLICT",
  "message": "The material action is not allowed in its current context",
  "details": ["optional"],
  "requestId": "3f0c9c1e-0000-4000-8000-000000000000"
}
```

- `details`, `requestId` có thể không có. `message` có thể là string **hoặc mảng** (validation).
- FE xử lý theo **`statusCode` + `code`**, không so sánh `message`.

### 2.1 Mã lỗi chung

| Status | Code | Khi nào | FE xử lý |
|---|---|---|---|
| 400 | `HTTP_ERROR` | Path UUID sai | Sửa route/ID; không retry |
| 400 | `INVALID_JSON_BODY` | JSON hỏng | Sửa request |
| 401 | `AUTHENTICATION_REQUIRED` | Thiếu/hết hạn `access_token`, session bị thu hồi, user không còn ACTIVE | Gọi `POST /auth/refresh` **một lần**; thất bại → về login, xoá cache user |
| 401 | `INVALID_REFRESH_TOKEN` | Refresh token sai/hết hạn/bị dùng lại | Về login (cookie đã bị xoá) |
| 403 | `INSUFFICIENT_ROLE` | Sai role cho route | Ẩn tính năng; không retry |
| 403 | `ORIGIN_NOT_ALLOWED` | Thiếu/sai Origin ở route yêu cầu | Lỗi cấu hình FE/proxy; không retry |
| 409 | `UNIQUE_CONSTRAINT_VIOLATION` | Vi phạm unique DB chưa map | Refetch |
| 413 | `INVALID_JSON_BODY` | Body vượt giới hạn | Giảm payload |
| 422 | `HTTP_ERROR` | Validation body/query | Hiện lỗi field |
| 422 | `FOREIGN_KEY_VIOLATION` / `CHECK_CONSTRAINT_VIOLATION` | Dữ liệu vi phạm rule DB chưa map | Hiện lỗi chung |
| 500 | `INTERNAL_SERVER_ERROR` | Lỗi ngoài dự kiến | Retry có giới hạn, hiện requestId |

### 2.2 Mã lỗi nghiệp vụ theo domain

| Domain | Status → Code |
|---|---|
| Auth | 401 `INVALID_CREDENTIALS`, 401 `INVALID_REGISTRATION_INTENT`, 401 `GOOGLE_AUTHENTICATION_FAILED`, 400 `INVALID_EMAIL_VERIFICATION_TOKEN`, 503 `MAIL_DELIVERY_UNAVAILABLE` |
| Users | 404 `USER_NOT_FOUND`, 409 `USER_EMAIL_ALREADY_EXISTS`, 409 `USER_PHONE_ALREADY_EXISTS` |
| Catalog | 404 `COURSE_NOT_FOUND`, 404 `COURSE_CATEGORY_NOT_FOUND`, 409 `COURSE_CODE_ALREADY_EXISTS`, 409 `COURSE_CATEGORY_SLUG_ALREADY_EXISTS`, 409 `COURSE_CATEGORY_INACTIVE`, 409 `COURSE_HAS_NO_UNITS`, 409 `COURSE_UNIT_ORDER_MISMATCH`, 422 `COURSE_CATEGORY_SLUG_REQUIRED` |
| Classes | 404 `CLASS_NOT_FOUND`, 404 `CLASS_UNIT_NOT_FOUND`, 404 `CLASS_SESSION_NOT_FOUND`, 404 `CLASS_STUDENT_NOT_FOUND`, 409 `CLASS_CODE_ALREADY_EXISTS`, 409 `CLASS_COURSE_INACTIVE`, 409 `CLASS_NOT_OPEN`, 409 `CLASS_FULL`, 409 `CLASS_ALREADY_ENROLLED`, 409 `CLASS_NOT_EDITABLE`, 409 `CLASS_INVALID_TRANSITION`, 409 `CLASS_NOT_READY_TO_OPEN`, 409 `CLASS_SESSION_NOT_EDITABLE`, 409 `CLASS_SESSION_OVERLAP`, 409 `CLASS_MENTOR_SCHEDULE_CONFLICT`, 409 `UNIT_RELEASE_CONFLICT`, 422 `CLASS_DATE_RANGE_INVALID`, 422 `CLASS_SESSION_TIME_RANGE_INVALID`, 422 `CLASS_SESSION_OUTSIDE_CLASS_PERIOD`, 422 `CLASS_SESSION_LOCAL_TIME_INVALID`, 422 `CLASS_SESSION_OVERNIGHT_NOT_ALLOWED`, 422 `CLASS_MENTOR_NOT_ELIGIBLE` |
| Student access | 403 `CLASS_ACCESS_DENIED`, 403 `CLASS_PREVIEW_DENIED`, 403 `SCHEDULE_CLASS_ACCESS_DENIED` |
| Cart/Order | 404 `CART_ITEM_NOT_FOUND`, 409 `CART_ITEM_ALREADY_EXISTS`, 409 `CART_LIMIT_EXCEEDED` (tối đa 20 lớp), 409 `CART_EMPTY`, 404 `ORDER_NOT_FOUND`, 403 `ORDER_ACCESS_DENIED` |
| Payment | 409 `PAYMENT_ORDER_INVALID`, 422 `PAYMENT_AMOUNT_INVALID`, 503 `PAYMENT_UNAVAILABLE`, 400 `INVALID_PAYMENT_WEBHOOK` (provider) |
| Cash | 409 `CASH_CONFIRMATION_INVALID`, 409 `CASH_ORDER_CLOSED`, 409 `CASH_HOLD_INVALID`, 403 `ORDER_ACCESS_DENIED` |
| Files | 404 `FILE_NOT_FOUND`, 409 `FILE_NOT_READY`, 409 `UPLOAD_EXPIRED`, 409 `UPLOAD_FAILED`, 409 `FILE_DELETED`, 403 `FILE_OWNER_MISMATCH`, 429 `FILE_UPLOAD_QUOTA_EXCEEDED`, 503 `FILE_STORAGE_DISABLED`, 503 `FILE_STORAGE_UNAVAILABLE` |
| Materials | 403 `MATERIAL_ACCESS_DENIED`, 404 `MATERIAL_NOT_FOUND`, 409 `MATERIAL_REVIEW_CONFLICT`, 413 `MATERIAL_CONTENT_TOO_LARGE`, 422 `MATERIAL_CONTENT_INVALID`, 422 `MATERIAL_SCOPE_MISMATCH` |
| Teaching/Attendance | 403 `SESSION_ASSIGNMENT_REQUIRED`, 409 `SESSION_VERSION_CONFLICT`, 409 `CLASS_ASSIGNMENT_VERSION_CONFLICT`, 409 `SESSION_STATE_CONFLICT`, 409 `IDEMPOTENCY_KEY_REUSED`, 409 `ATTENDANCE_START_DAY_CLOSED`, 409 `ATTENDANCE_EDIT_WINDOW_EXPIRED`, 409 `ATTENDANCE_RECOVERY_RECORD_EXISTS`, 409 `ATTENDANCE_RECOVERY_CLOCK_CONFLICT`, 422 `ATTENDANCE_ENROLLMENT_NOT_ELIGIBLE`, 422 `ATTENDANCE_RECOVERY_EVIDENCE_INVALID` |

`FileStatusDto.errorCode` (không phải HTTP code): `FILE_BINARY_INVALID`, `FILE_SIZE_MISMATCH`,
`FILE_RETRY_EXHAUSTED`, `UPLOAD_EXPIRED`.

---

## 3. Enum dùng chung

| Enum | Giá trị |
|---|---|
| UserRole | `ADMIN`, `MANAGER`, `MENTOR`, `STUDENT` |
| UserStatus | `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED` |
| DeliveryMode | `ONLINE`, `OFFLINE` |
| ClassStatus | `DRAFT`, `OPEN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| ClassUnitStatus | `LOCKED`, `OPEN`, `COMPLETED` |
| SessionStatus | `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| PaymentType | `PAYOS`, `CASH` |
| OrderStatus | `PENDING`, `PAID`, `EXPIRED`, `CANCELLED` |
| PaymentStatus | `CREATING`, `PENDING`, `SUCCEEDED`, `REQUIRES_REVIEW` |
| EnrollmentStatus | `PENDING_PAYMENT`, `ACTIVE`, `COMPLETED`, `CANCELLED` |
| AccessMode (My Classes) | `FULL`, `CASH_PREVIEW`, `NONE` |
| AccessReason | `ACTIVE_ENROLLMENT`, `PENDING_CASH`, `PENDING_PAYOS`, `HOLD_EXPIRED`, `ENROLLMENT_CANCELLED`, `ENROLLMENT_COMPLETED`, `CLASS_CANCELLED`, `STATE_MISMATCH` |
| FileStatus | `PENDING_UPLOAD`, `PROCESSING`, `READY`, `FAILED`, `DELETED` |
| FileKind | `PDF`, `IMAGE`, `DOCUMENT`, `PRESENTATION`, `SPREADSHEET`, `AUDIO`, `VIDEO`, `SOURCE_CODE` |
| MaterialContentType | `ARTICLE`, `FILE`, `VIDEO` |
| MaterialReviewStatus | `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED` |
| MaterialFileRole | `PRIMARY`, `INLINE_IMAGE`, `ATTACHMENT` |
| AssignmentType | `PRIMARY`, `SUBSTITUTE` |
| AttendanceStatus | `UNMARKED`, `PRESENT`, `ABSENT` |
| AttendanceAuditAction | `ADMIT`, `MARK`, `FINALIZE`, `CORRECT`, `RECOVER` |
| AdmissionBasis (recover) | `PAID_BEFORE_START`, `CASH_LATE_ADMISSION` |

---

## 4. Bản đồ API theo role

Tất cả route có prefix `/api/v1`. "Origin" = cần header Origin (§1.3). "Idem" = cần `Idempotency-Key`.

### Public (không cần đăng nhập)

| Method | Route | Mục đích |
|---|---|---|
| GET | `/health/live`, `/health/ready` | Health check |
| POST | `/auth/register` | Đăng ký Student |
| POST | `/auth/email/resend` | Gửi lại mail xác thực |
| POST | `/auth/email/verify` | Xác thực email + đăng nhập |
| POST | `/auth/login` | Đăng nhập email/password |
| POST | `/auth/refresh` | Xoay refresh token |
| GET | `/auth/google` → `/auth/google/callback` | Google OIDC (redirect) |
| GET | `/auth/registration-context` | Prefill đăng ký Google (cookie intent) |
| POST | `/auth/google/complete-registration` | Hoàn tất đăng ký Google |
| GET | `/course-categories` | Danh mục khoá học |
| GET | `/courses`, `/courses/:courseId`, `/courses/:courseId/classes` | Khoá học active, lớp OPEN |
| GET | `/classes/:classId` | Lớp OPEN + timetable |

### Mọi user đã đăng nhập

| Method | Route |
|---|---|
| GET | `/auth/me` |
| POST | `/auth/logout`, `/auth/logout-all` |

### STUDENT

| Method | Route | Mục đích |
|---|---|---|
| GET | `/me/cart` | Giỏ hàng |
| POST | `/me/cart/items` | Thêm lớp |
| DELETE | `/me/cart/items/:classId` | Bỏ lớp |
| POST | `/me/cart/checkout` | Tạo order + giữ chỗ |
| GET | `/me/orders` | Lịch sử order |
| GET | `/me/orders/:orderId` | Order + payment |
| GET | `/me/orders/payment-result?orderCode=` | Tra order sau redirect PayOS |
| POST | `/me/orders/:orderId/payments/payos` | Tạo/tái dùng link PayOS |
| GET | `/me/classes` | Lớp của tôi + access hint |
| GET | `/me/classes/:classId` | Chi tiết lớp đầy đủ (ACTIVE) |
| GET | `/me/classes/:classId/preview` | Preview lớp (CASH pending) |
| GET | `/me/schedule` | Lịch cá nhân |
| GET | `/me/classes/:classId/units/:classUnitId/materials` | Tài liệu của chương |
| GET | `/me/classes/:classId/materials/:materialId` | Chi tiết tài liệu |
| GET | `/me/classes/:classId/materials/:materialId/download` | Signed URL primary FILE/VIDEO |
| POST | `/me/classes/:classId/materials/:materialId/files/:fileId/access` | Signed URL từng file (Origin) |

### MENTOR

| Method | Route | Mục đích |
|---|---|---|
| GET | `/mentor/classes` | Lớp được phân công (primary) |
| GET | `/mentor/classes/:classId/students` | Học viên + thông tin thu tiền |
| GET | `/mentor/cash-orders` | Order CASH mình phụ trách |
| POST | `/mentor/cash-orders/:orderId/confirm` | Xác nhận đã thu tiền |
| GET | `/mentor/classes/:classId/units` | Context Class Unit ↔ Course Unit |
| GET | `/mentor/classes/:classId/units/:unitId/sessions` | Context buổi học |
| PATCH | `/mentor/classes/:classId/units/:unitId/release` | Mở/khoá chương (Origin) |
| GET/POST | `/mentor/classes/:classId/units/:unitId/materials` | List/tạo tài liệu (POST: Origin) |
| GET/PATCH/DELETE | `/mentor/classes/:classId/materials/:materialId` | Detail/sửa/xoá (Origin cho ghi) |
| POST | `/mentor/classes/:classId/materials/:materialId/submit` | Gửi duyệt (Origin) |
| POST | `/mentor/classes/:classId/materials/:materialId/files/:fileId/access` | Preview file (Origin) |
| POST/GET | `/files/upload-intents`, `/files/:fileId/complete`, `/files/:fileId` | Upload |
| GET | `/mentor/schedule` | Lịch dạy (gồm dạy thay) |
| GET | `/class-sessions/:sessionId/context` | Phòng/meeting của buổi |
| GET/PUT | `/class-sessions/:sessionId/attendance` | Roster / điểm danh (PUT: Idem) |
| POST | `/class-sessions/:sessionId/start`, `/attendance/sync-roster`, `/finalize` | Vòng đời buổi (Idem) |

### MANAGER

| Method | Route | Mục đích |
|---|---|---|
| POST/GET | `/files/...` | Upload |
| GET/POST | `/manager/course-units/:courseUnitId/materials` | List/tạo tài liệu (POST: Origin) |
| GET | `/manager/materials` | Hàng đợi/danh sách |
| GET/PATCH/DELETE | `/manager/materials/:materialId` | Detail/sửa/xoá (Origin cho ghi) |
| POST | `/manager/materials/:materialId/approve`, `/reject`, `/publish`, `/unpublish` | Duyệt/xuất bản (Origin) |
| POST | `/manager/materials/:materialId/files/:fileId/access` | Preview file (Origin) |
| GET/PATCH | `/management/...` (§18) | Teaching (dùng chung với ADMIN) |
| GET/POST/PUT | `/class-sessions/...`, `/management/class-sessions/...` (§19) | Attendance staff |

### ADMIN

| Method | Route | Mục đích |
|---|---|---|
| POST/GET/PATCH | `/admin/users`, `/admin/users/:userId`, `/admin/users/:userId/status` | Quản lý tài khoản |
| POST | `/admin/course-categories` | Tạo danh mục |
| GET/POST/PATCH/PUT | `/admin/courses...` | Quản lý khoá học |
| GET/POST/PATCH | `/admin/classes...` | Quản lý lớp, buổi, lifecycle |
| GET | `/admin/classes/:classId/students[/:studentId]` | Roster học viên |
| PATCH | `/admin/classes/:classId/units/:unitId/release` | Mở/khoá chương (Origin) |
| GET/POST | `/admin/payments/reconciliation`, `/admin/payments/:paymentId/reconcile` | Đối soát |
| (như MANAGER) | `/management/...`, `/class-sessions/...` | Teaching/attendance |

> ADMIN **không** có quyền Files/Materials authoring. MANAGER **không** có quyền `/admin/*` và
> không release chương.

---

## 5. Health

| Route | Response 200 |
|---|---|
| `GET /api/v1/health/live` | `{ "status": "ok", "timestamp": "..." }` |
| `GET /api/v1/health/ready` | Như trên; **503** nếu dependency bắt buộc (DB) chưa sẵn sàng |

---

## 21. Polling, cache, refetch

| Tình huống | Hành động |
|---|---|
| Upload file | Poll `GET /files/:id` mỗi 2–3s, không chồng request, dừng khi READY/FAILED/unmount/mất quyền |
| PayOS chờ xác nhận | Poll `GET /me/orders/:id` có backoff + giới hạn; dừng khi PAID/EXPIRED/CANCELLED/REQUIRES_REVIEW/401/403 |
| Roster đang điểm danh | Poll `GET .../attendance` mỗi **30s** khi tab hiển thị và session `IN_PROGRESS`; dừng khi COMPLETED/CANCELLED/401/403/rời trang |
| Payment link `CREATING` | Retry `POST .../payments/payos` vài lần có backoff |
| Material review, catalog, lịch | **Không poll**; refetch khi focus/sau mutation |

Refetch sau mutation:

- Checkout/PAID/CASH confirm → `/me/classes`, `/me/schedule`, detail/preview; Mentor roster.
- Admin sửa giờ buổi/gán mentor → class detail, lịch Student, `/mentor/schedule`, candidates.
- Material mutation → detail + unit list + queue.
- Release chương → units context + danh sách tài liệu Student.
- Attendance mutation → roster (+ audit nếu đang mở).

Cache key phải gồm user/role + ID + filter + page. Logout/401/đổi tài khoản → xoá toàn bộ cache,
signed URL, player. Đổi filter/range → reset page về 1, bỏ response cũ không còn khớp.

---

## 22. API chưa có — FE không được gọi

| Tính năng | Trạng thái |
|---|---|
| Đổi thông tin cá nhân, đổi mật khẩu, quên/đặt lại mật khẩu | Chưa có controller |
| Picker Course/Course Unit cho MANAGER (gồm khoá inactive) | Chưa có |
| Tiến độ học (progress) đọc/ghi | Chưa có |
| Huỷ order / hoàn tiền | Chưa có |
| Student xem điểm danh: field attendance trong `/me/schedule`, `GET /me/classes/:classId/attendance`, `/attendance-summary` | PLANNED 4.4c |
| `GET /management/classes/:classId/attendance-summary`, `GET /management/class-sessions/incomplete` | PLANNED 4.4c |
| Đổi lịch/huỷ/buổi bù: `PATCH /management/class-sessions/:id/schedule`, `POST .../cancel`, `POST .../makeups` | PLANNED 4.4a |
| Mentor xin nghỉ: `/mentor/leave-requests/*`, `/management/mentor-leave-requests/*` | PLANNED 4.4a |
| Học bù lớp khác: `/management/student-schedule-conflicts/*`, `/management/makeup-placements/*`, `/me/makeup-placements` | PLANNED 4.4b |
| Danh sách/xoá/tải file trực tiếp ở module Files | Không có (tải qua Materials) |
| GET `/manager/materials/:id/preview` hoặc `/assets` (thiết kế 13/10) | **Đã bị thay** bằng POST `.../files/:fileId/access` |
| Streaming video HLS | Sau |
| Chat/DM, notification/email cho lịch | Phase sau |

---

## 23. Ghi chú lệch tài liệu đã phát hiện

Đã đối chiếu với source ngày 2026-10-16:

1. **403 của RolesGuard** trả code **`INSUFFICIENT_ROLE`** (`src/modules/auth/guards/roles.guard.ts`).
   Bảng lỗi Phase 4.3 §6 (repo BE: `docs/api_flow/PHASE_4_3_flow-api-breakdown.md#6-errors-và-fe-handling`) ghi "RolesGuard là
   `HTTP_ERROR`" là chưa chính xác.
2. **401 của AccessTokenGuard** là **`AUTHENTICATION_REQUIRED`**; một số bảng Phase 4 ghi `401 HTTP_ERROR`.
3. Contract Phase 2 nhắc `REQUIRES_REVIEW` như trạng thái order; thực tế đây là **`payment.status`**,
   còn My Classes dùng `order.requiresReview` (boolean).
4. Phase 4 breakdown §1 mô tả `SessionView` đầy đủ (`makeupForSessionId`, `canReassign`…) là **thiết kế**;
   shape thực tế là `TeachingSessionDto` ở §18 của tài liệu này + `permissions` 6 cờ ở roster.

Khi FE gặp khác biệt khác, ưu tiên Swagger của môi trường đang gọi và báo BE cập nhật tài liệu.

---

## Bảng đối chiếu mục cũ sang file mới

Nguồn hiện hành: [API_CONTRACT_BE.md](API_CONTRACT_BE.md). Bản gốc lúc tách:
[API_CONTRACT_FE.legacy.md](API_CONTRACT_FE.legacy.md) (giữ lại tới khi owner xác nhận đã tách đủ).

| § cũ | Tiêu đề | File mới |
| --- | --- | --- |
| Đầu file | Giới thiệu, bảng tài liệu phase của BE | [README.md](README.md) |
| §0 | Trạng thái triển khai (IMPL / VPS ✓ / PLANNED) | [README.md](#0-trạng-thái-triển-khai--đọc-trước-khi-gọi-api) |
| §1 | Quy ước chung (base URL, cookie, `Origin`, response, validation, thời gian, concurrency, request ID) | [README.md](#1-quy-ước-chung) |
| §2 | Error envelope và bảng mã lỗi | [README.md](#2-error-envelope-và-bảng-mã-lỗi) |
| §3 | Enum dùng chung | [README.md](#3-enum-dùng-chung) |
| §4 | Bản đồ API theo role | [README.md](#4-bản-đồ-api-theo-role) |
| §5 | Health | [README.md](#5-health) |
| §6 | Auth và tài khoản | [auth.md](auth.md#6-auth-và-tài-khoản) |
| §7 | Admin quản lý user | [auth.md](auth.md#7-admin-quản-lý-user) |
| §8 | Catalog public | [catalog.md](catalog.md#8-catalog-public) |
| §9 | Admin catalog | [catalog.md](catalog.md#9-admin-catalog) |
| §10 | Admin quản lý lớp, buổi học, học viên | [class-management.md](class-management.md) |
| §11 (đầu), §11.1–11.4 | Quy tắc thanh toán, cart, checkout | [cart.md](cart.md) |
| §11.5–11.8 | Order, PayOS, trang kết quả PayOS | [orders-payment.md](orders-payment.md) |
| §12 | Mentor: lớp, roster, thu tiền mặt | [mentor-teaching.md](mentor-teaching.md#12-mentor-lớp-roster-thu-tiền-mặt) |
| §13 | Admin đối soát payment | [orders-payment.md](orders-payment.md#13-admin-đối-soát-payment) |
| §14 | Student: Lớp của tôi, chi tiết lớp, lịch | [my-classes.md](my-classes.md) |
| §15 | Files: upload private | [files.md](files.md) |
| §16 | Materials: soạn, duyệt, release | [materials.md](materials.md#16-materials-soạn-duyệt-release) |
| §17 | Materials: Student đọc/tải và staff preview | [materials.md](materials.md#17-materials-student-đọctải-và-staff-preview) |
| §18 | Teaching: quản lý mentor và dạy thay | [mentor-teaching.md](mentor-teaching.md#18-teaching-quản-lý-mentor-và-dạy-thay) |
| §19 | Attendance: điểm danh, sửa, phục hồi, audit | [attendance.md](attendance.md) |
| §20 | Flow end-to-end theo vai trò | [flows.md](flows.md) |
| §21 | Polling, cache, refetch | [README.md](#21-polling-cache-refetch) |
| §22 | API chưa có, FE không được gọi | [README.md](#22-api-chưa-có--fe-không-được-gọi) |
| §23 | Ghi chú lệch tài liệu đã phát hiện | [README.md](#23-ghi-chú-lệch-tài-liệu-đã-phát-hiện) |
