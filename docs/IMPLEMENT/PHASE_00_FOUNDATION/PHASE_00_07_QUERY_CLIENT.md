# 0.7 QueryClient

## Mô tả
Cấu hình QueryClient cho React Native: nối trạng thái mạng và app foreground, retry chỉ cho lỗi mạng/5xx, kiểu lỗi
mặc định là `ApiError`.

## Hạ tầng / ADR
- File khoá bị sửa: `src/config/queryClient.ts`.
- ADR: [ADR-0003](../../adr/ADR-0003-tanstack-query-zustand.md).
- Nội dung: [guides/api-client.md](../../guides/api-client.md#queryclient-cho-react-native).
- Phụ thuộc: `ApiError` (0.4.1).

## Task
### 0.7.1 Retry và kiểu lỗi
- Kết quả mong đợi: `staleTime: 30_000`; query retry khi `status === 0` hoặc `>= 500`, tối đa 2 lần; không retry
  4xx; mutation không retry; `Register.defaultError = ApiError`.
- Test cần viết trước: hàm retry trả `false` với 404, `true` với 500 ở lần 1, `false` ở lần 2.

### 0.7.2 `onlineManager` và `focusManager`
- Kết quả mong đợi: `onlineManager` theo NetInfo, `focusManager` theo `AppState`.
- Test cần viết trước: mock NetInfo báo mất mạng → `onlineManager.isOnline()` là `false`.

## Tiêu chí nghiệm thu
- [ ] Test retry và online/focus xanh.
- [ ] `error` trong hook query có kiểu `ApiError` khi type-check.
