# ADR-0002: Xác thực bằng cookie HttpOnly, bỏ Bearer và token trong MMKV

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
Backend Mindy Center trả 2 cookie `HttpOnly` (`access_token`, `refresh_token`) và không nhận Bearer header
(xem [API contract §1.2](../API_CONTRACT/README.md#12-xác-thực-bằng-cookie)). Interceptor của template lại gắn
`Authorization: Bearer` và lưu token trong MMKV.

## Decision
- Axios giữ `withCredentials: true`. Networking native (NSURLSession / OkHttp) tự lưu và gửi cookie.
- Không gắn `Authorization: Bearer`, không lưu token vào MMKV. Bỏ phần này khỏi interceptor của template.
- 401 `AUTHENTICATION_REQUIRED` → gọi `POST auth/refresh` một lần (single-flight), retry request gốc một lần. Refresh
  lỗi → xoá cache, reset store auth, về màn Login.

## Alternatives
- Giữ Bearer + MMKV: backend không hỗ trợ, phải đổi contract.
- Lưu token trong `react-native-encrypted-storage`: vẫn cần backend trả token trong body, không khớp contract.

## Consequences
+ App không cầm token, giảm rủi ro lộ token. Khớp với web.
- Cần test kỹ interceptor refresh (nhiều request song song). Mutation cần header `Origin` phải tự set trên mobile.
- Đăng nhập Google và link xác thực email đi qua trình duyệt cần cách chuyển cookie về app (xem
  [ADR-0013](ADR-0013-defer-google-oidc-payos-deeplink.md)).
