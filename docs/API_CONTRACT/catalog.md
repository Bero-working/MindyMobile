# API contract: Catalog

Catalog public (danh mục, khoá học active, lớp OPEN) và Admin catalog (§8, §9). Đọc khi làm màn trang chủ,
danh sách/chi tiết khoá học, chi tiết lớp.

> Số mục (§) giữ nguyên theo contract gốc để tham chiếu chéo vẫn tra được. Mục nào nằm ở file nào: xem
> [bảng đối chiếu](README.md#bảng-đối-chiếu-mục-cũ-sang-file-mới). Quy ước chung (cookie, header `Origin`,
> format lỗi, `Idempotency-Key`, polling): [README.md](README.md).

---

## 8. Catalog public

Không cần cookie, không trả meeting URL.

### GET `/api/v1/course-categories?page=1&pageSize=20`

200 `{ items: [{ id, name, slug, description|null, isActive }], page, pageSize, total }`.

### GET `/api/v1/courses`

Query: `page`, `pageSize`, `categoryId` (UUID), `deliveryMode` (`ONLINE`/`OFFLINE`),
`startsFrom`, `startsTo` (`YYYY-MM-DD`). Khi có `deliveryMode`/`startsFrom`/`startsTo`, chỉ trả các
khoá học **có lớp OPEN khớp filter**.

200 `{ items: CourseDto[], page, pageSize, total }`:

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "code": "WEB101",
  "title": "Web cơ bản",
  "description": null,
  "imgUrl": null,
  "priceAmount": 1500000,
  "category": { "id": "…", "name": "Lập trình", "slug": "lap-trinh" }
}
```

`priceAmount` là số nguyên VND.

### GET `/api/v1/courses/:courseId` — 200 `PublicCourseDetailDto`

`CourseDto` + `units[]` + `openClasses[]`:

- `units[]`: `{ id (courseUnitId), unitNumber, title, description|null, requiredScorePercent }`.
- `openClasses[]`: các lớp OPEN sớm nhất (`ClassDto`); xem thêm qua endpoint dưới.
- 404 `COURSE_NOT_FOUND` nếu khoá học không tồn tại/không active.

### GET `/api/v1/courses/:courseId/classes`

Query: `page`, `pageSize`, `deliveryMode`, `startsFrom`, `startsTo`. 200 `{ items: ClassDto[], … }`:

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "courseId": "22222222-2222-4222-8222-222222222222",
  "code": "WEB101-A",
  "name": "Web lớp A",
  "startDate": "2026-10-13",
  "endDate": "2026-11-14",
  "deliveryMode": "ONLINE",
  "maxStudents": 20,
  "availableSeats": 5,
  "mentor": { "id": "44444444-4444-4444-8444-444444444444", "displayName": "Mentor Demo" }
}
```

### GET `/api/v1/classes/:classId` — 200 `ClassDetailDto`

`ClassDto` + `units[]`: `{ id (classUnitId), position, title, sessions[] }`;
session `{ id, sessionNumber, title, startsAt, endsAt, roomName|null, status }`.
Chỉ lớp OPEN. Lớp không OPEN/không tồn tại → 404 `CLASS_NOT_FOUND`.

> `courseUnitId` (Course Unit, thuộc khoá học) ≠ `classUnitId` (Class Unit, thuộc từng lớp). Không
> ghép theo title/position.

---

## 9. Admin catalog

Role **ADMIN**.

| Method + route | Body | Response |
|---|---|---|
| POST `/api/v1/admin/course-categories` | `{ name (1–150), slug? (kebab-case 1–180), description? (≤2000) }` | 201 `CourseCategoryDto` |
| GET `/api/v1/admin/courses?page&pageSize&categoryId&isActive` | — | 200 `{ items: CourseManagementDto[], … }` (CourseDto + `isActive`, `createdAt`, `updatedAt`) |
| GET `/api/v1/admin/courses/:courseId` | — | 200 `CourseManagementDetailDto` (+ `units[]`) |
| POST `/api/v1/admin/courses` | `{ categoryId, code (2–50, `[A-Za-z0-9][A-Za-z0-9_-]*`), title (1–250), description? (≤10000), imgUrl? (http/https ≤2048 hoặc null), priceAmount (int 0–1e12) }` | 201 `CourseManagementDetailDto` |
| PATCH `/api/v1/admin/courses/:courseId` | Bất kỳ: `categoryId`, `title`, `description` (null xoá), `imgUrl` (null xoá), `priceAmount` | 200 `CourseManagementDetailDto` |
| POST `/api/v1/admin/courses/:courseId/units` | `{ title (1–250), description? (≤10000), requiredScorePercent? (0–100, 2 chữ số thập phân) }` | 201 `CourseUnitDto` |
| PUT `/api/v1/admin/courses/:courseId/units/order` | `{ unitIds: UUID[] }` — đủ toàn bộ unit, không trùng, 1–200 | 200 `CourseManagementDetailDto` |
| POST `/api/v1/admin/courses/:courseId/activate` | — | 200 `CourseManagementDetailDto` |

Lỗi chính: 409 `COURSE_CODE_ALREADY_EXISTS`, `COURSE_CATEGORY_SLUG_ALREADY_EXISTS`,
`COURSE_CATEGORY_INACTIVE`, `COURSE_HAS_NO_UNITS` (activate khi chưa có unit),
`COURSE_UNIT_ORDER_MISMATCH` (danh sách unitIds không khớp); 404 `COURSE_NOT_FOUND`/`COURSE_CATEGORY_NOT_FOUND`.

> Chưa có picker catalog cho MANAGER (kể cả khoá học inactive). Manager hiện lấy `courseUnitId` từ
> `GET /courses/:courseId` (chỉ khoá active).
