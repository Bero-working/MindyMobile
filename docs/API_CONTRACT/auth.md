# API contract: Auth và tài khoản

Đăng ký, đăng nhập, phiên cookie, đăng xuất, Google OIDC và Admin quản lý user (§6, §7). Đọc khi làm
màn Login/Register, bootstrap app, interceptor refresh hoặc tính năng quản lý tài khoản.

> Số mục (§) giữ nguyên theo contract gốc để tham chiếu chéo vẫn tra được. Mục nào nằm ở file nào: xem
> [bảng đối chiếu](README.md#bảng-đối-chiếu-mục-cũ-sang-file-mới). Quy ước chung (cookie, header `Origin`,
> format lỗi, `Idempotency-Key`, polling): [README.md](README.md).

---

## 6. Auth và tài khoản

Response đăng nhập dùng chung `AuthenticatedUserDto`:

```json
{
  "user": {
    "id": "11111111-1111-4111-8111-111111111111",
    "email": "student@example.test",
    "phone": null,
    "displayName": "Nguyễn An",
    "role": "STUDENT",
    "status": "ACTIVE",
    "lastLoginAt": "2026-10-16T02:00:00.000Z",
    "createdAt": "2026-10-01T03:00:00.000Z"
  },
  "accessTokenExpiresAt": "2026-10-16T02:15:00.000Z"
}
```

`UserDto` = object `user` ở trên. Không bao giờ có password/hash/token. `phone`, `lastLoginAt` nullable.

### 6.1 POST `/api/v1/auth/register` — Public — 202

| Field | Rule |
|---|---|
| `email` | email, ≤320 (server trim/lowercase) |
| `password` | string **6–128** (không trim) |
| `displayName` | string 1–150, phải có ký tự khác khoảng trắng |
| `phone` | optional, 7–32 — bỏ field nếu rỗng |

Không gửi `role`/`status` (422). Luôn tạo **STUDENT**, trạng thái `PENDING_VERIFICATION`.

Response `202 { "message": "If the address can be registered, a verification email has been sent." }`.
Response giống nhau dù email đã tồn tại → FE luôn hiện "Kiểm tra email". Không có cookie/session.
503 `MAIL_DELIVERY_UNAVAILABLE` khi mail tạm ngừng.

### 6.2 POST `/api/v1/auth/email/resend` — Public — 202

Body `{ "email": "student@example.test" }`. Response như register. Không tiết lộ email có tồn tại.

### 6.3 POST `/api/v1/auth/email/verify` — Public — 200

FE nhận `token` từ link email (trang `EMAIL_VERIFICATION_PATH` của FE), gọi:

```json
{ "token": "<32–512 ký tự từ link>", "deviceName": "Chrome on Windows" }
```

`deviceName` optional ≤150. 200 `AuthenticatedUserDto` **và set cookie** (đã đăng nhập).
Token dùng một lần, TTL mặc định 30 phút. Sai/hết hạn → 400 `INVALID_EMAIL_VERIFICATION_TOKEN`
→ cho phép "Gửi lại email".

### 6.4 POST `/api/v1/auth/login` — Public — 200

```json
{ "email": "admin@example.test", "password": "123456", "deviceName": "Chrome on Windows" }
```

`password` 1–128, `deviceName` optional ≤150. 200 `AuthenticatedUserDto` + cookie.
401 `INVALID_CREDENTIALS` là lỗi chung (không phân biệt sai email hay sai mật khẩu).
Điều hướng sau login theo `user.role`.

### 6.5 POST `/api/v1/auth/refresh` — cookie `refresh_token` — 200

Không body. 200 `AuthenticatedUserDto` + cookie mới. Lỗi → 401 `INVALID_REFRESH_TOKEN`, server xoá cookie.

**Khuyến nghị FE**: interceptor bắt 401 `AUTHENTICATION_REQUIRED` → gọi refresh **một lần**
(single-flight, các request song song chờ chung) → retry request gốc một lần → nếu vẫn lỗi thì về login.
Có thể chủ động refresh trước `accessTokenExpiresAt`.

### 6.6 POST `/api/v1/auth/logout` và `/auth/logout-all` — 204

Cần `access_token`. `logout` thu hồi session hiện tại; `logout-all` thu hồi mọi session. Server xoá cookie.
FE xoá toàn bộ cache dữ liệu user, huỷ polling, xoá signed URL trong bộ nhớ.

### 6.7 GET `/api/v1/auth/me` — 200 `UserDto`

Dùng khi bootstrap app. 401 nếu chưa đăng nhập hoặc tài khoản không còn ACTIVE.

### 6.8 Google OIDC

1. FE điều hướng trình duyệt (không fetch) tới
   `GET /api/v1/auth/google?returnTo=/dashboard` (`returnTo` optional, phải là path nội bộ bắt đầu bằng `/`, ≤500).
2. BE redirect sang Google → callback `GET /api/v1/auth/google/callback` (BE xử lý).
3. Kết quả là redirect 302 về FE:
   - Tài khoản đã có → set cookie, về `{FRONTEND_BASE_URL}{returnTo}`.
   - Tài khoản mới → set cookie tạm `registration_intent`, về `GOOGLE_REGISTRATION_PATH` của FE.
   - Lỗi → về `GOOGLE_AUTH_ERROR_PATH?error=google_authentication_failed`.
4. Ở trang đăng ký Google, FE gọi `GET /api/v1/auth/registration-context` →
   `{ email, displayName|null, avatarUrl|null, expiresAt }`. `email` read-only; displayName/avatar chỉ là gợi ý.
5. FE submit `POST /api/v1/auth/google/complete-registration` (201):
   `{ "displayName": "Nguyễn An", "phone": "0901234567", "deviceName": "Chrome" }`
   (`displayName` 1–150 bắt buộc, `phone` 7–32 optional, `deviceName` optional) → `AuthenticatedUserDto` + cookie.
6. Intent hết hạn (mặc định 15 phút)/sai → 401 `INVALID_REGISTRATION_INTENT` → bắt đầu lại từ bước 1.

---

## 7. Admin quản lý user

Role **ADMIN**. Không có self-service profile/đổi mật khẩu/quên mật khẩu (xem §22).

### POST `/api/v1/admin/users` — 201 `UserDto`

| Field | Rule |
|---|---|
| `email` | email ≤320 |
| `password` | **6–128** (cho mọi role) |
| `displayName` | 1–150 |
| `role` | `ADMIN`/`MANAGER`/`MENTOR`/`STUDENT` |
| `phone` | optional 7–32 |

Tài khoản tạo ra **ACTIVE ngay**, không cần verify email, không tự đăng nhập. Đây là cách duy nhất
để tạo MANAGER/MENTOR. Không có idempotency key → nếu mất response, refetch list trước khi tạo lại.
409 `USER_EMAIL_ALREADY_EXISTS` / `USER_PHONE_ALREADY_EXISTS` → hiện lỗi field.

### GET `/api/v1/admin/users?page=1&pageSize=20&role=MENTOR&status=ACTIVE`

200 `{ items: UserDto[], page, pageSize, total }`, sort `createdAt DESC`. `role`, `status` optional.

### GET `/api/v1/admin/users/:userId` — 200 `UserDto`; 404 `USER_NOT_FOUND`.

### PATCH `/api/v1/admin/users/:userId/status` — 200 `UserDto`

Body `{ "status": "SUSPENDED" }` hoặc `"ACTIVE"`. Tài khoản bị khoá sẽ nhận 401 ở request kế tiếp.

> FE phải hỗ trợ role `MANAGER` trong schema/enum; nếu schema chỉ có ADMIN/MENTOR/STUDENT thì
> list user có Manager sẽ lỗi parse (gap P0 trong FE gaps (repo BE: `docs/api_flow/PHASE_3_4_FE_API_GAPS.md`)).
