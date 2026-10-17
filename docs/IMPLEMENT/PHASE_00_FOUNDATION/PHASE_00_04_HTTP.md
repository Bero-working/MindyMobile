# 0.4 HTTP

## Mô tả
Chuyển Http client của template sang xác thực bằng cookie: bỏ Bearer và token trong MMKV, chuẩn hoá mọi lỗi thành
`ApiError`, refresh single-flight khi gặp 401, thêm header `Origin` cho các mutation cần.

## Hạ tầng / ADR
- File khoá bị sửa hoặc tạo: `src/config/http/**`, `src/config/env.ts`, `src/shared/utilities/apiError.ts`, `.env*`
  (biến mới `APP_ORIGIN`).
- ADR: [ADR-0002](../../adr/ADR-0002-cookie-auth.md), [ADR-0009](../../adr/ADR-0009-no-any-unknown-zod.md).
- Nội dung: [guides/api-client.md](../../guides/api-client.md#http-client),
  [API contract §1](../../API_CONTRACT/README.md#1-quy-ước-chung), [§2](../../API_CONTRACT/README.md#2-error-envelope-và-bảng-mã-lỗi),
  [auth.md §6.5](../../API_CONTRACT/auth.md#65-post-apiv1authrefresh--cookie-refresh_token--200).
- Ngoài repo: nhờ backend thêm giá trị `APP_ORIGIN` vào `CORS_ORIGINS`. Chưa có xác nhận thì task 0.4.4 đặt
  `Blocked`.
- Test interceptor cần MSW, cài ở 0.9. Xem ghi chú thứ tự ở [README phase](README.md).

## Task
### 0.4.1 `ApiError`
- Kết quả mong đợi: `src/shared/utilities/apiError.ts` theo guide; type `ApiErrorBody` trong `src/types/api.ts`.
- Test cần viết trước: `message` dạng mảng được nối; `details` string/mảng/vắng đều thành mảng; `isApiErrorCode`.

### 0.4.2 Bỏ Bearer + MMKV token, chuẩn hoá lỗi
- Kết quả mong đợi: interceptor không gắn `Authorization`, không đọc token từ MMKV; giữ `withCredentials: true`; mọi
  lỗi thành `ApiError`, lỗi mạng `status: 0`, `code: 'NETWORK_ERROR'`.
- Test cần viết trước: request không có header `Authorization`; response 404 có body lỗi → `ApiError` đúng `code`;
  mất mạng → `NETWORK_ERROR`.

### 0.4.3 Refresh single-flight
- Kết quả mong đợi: 401 `AUTHENTICATION_REQUIRED` → `POST auth/refresh` một lần cho mọi request song song, retry
  request gốc một lần; refresh lỗi → `queryClient.clear()`, reset store auth, về Login. Request `auth/refresh` không đi
  qua nhánh này.
- Test cần viết trước: 3 request song song cùng nhận 401 → refresh được gọi đúng 1 lần, cả 3 retry thành công;
  refresh lỗi → cache bị xoá.

### 0.4.4 Header `Origin` và `APP_ORIGIN`
- Kết quả mong đợi: biến env `APP_ORIGIN` đọc qua `src/config/env.ts`; mutation materials, release unit, file access
  gửi header `Origin` từ biến này.
- Test cần viết trước: request tới route cần `Origin` có header đúng giá trị env.

## Tiêu chí nghiệm thu
- [ ] Không còn code đọc/ghi token trong MMKV hoặc gắn Bearer.
- [ ] Test interceptor (refresh một lần cho request song song, refresh lỗi xoá cache) xanh.
- [ ] Backend đã xác nhận `APP_ORIGIN` nằm trong `CORS_ORIGINS`.
