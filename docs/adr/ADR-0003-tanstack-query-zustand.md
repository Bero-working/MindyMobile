# ADR-0003: TanStack Query cho server state, Zustand cho client state

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
App có nhiều dữ liệu từ API (catalog, giỏ, lớp, lịch, điểm danh) cần cache, refetch sau mutation và polling theo
[contract §21](../API_CONTRACT/README.md#21-polling-cache-refetch). Ngoài ra có ít state thuần client (user đang đăng
nhập, cờ bootstrap). Boilerplate đã cài sẵn `@tanstack/react-query` v5 và `zustand` (slice).

## Decision
- Dữ liệu từ server chỉ nằm trong TanStack Query. Mỗi feature có factory query key.
- Zustand chỉ giữ state client. Không copy dữ liệu server vào Zustand.
- QueryClient nối `onlineManager` với NetInfo và `focusManager` với `AppState`.

## Alternatives
- Redux Toolkit + RTK Query: nặng hơn, boilerplate chưa dùng.
- Chỉ Zustand + tự fetch: phải tự viết cache, retry, polling, invalidate.

## Consequences
+ Cache, retry, polling, invalidate có sẵn. Tách rõ hai loại state.
- Phải giữ query key đúng chuẩn (có `userId` cho dữ liệu cá nhân) để không lẫn cache giữa tài khoản.
