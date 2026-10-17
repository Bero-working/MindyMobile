# Progress 0.7 QueryClient

Nhật ký thực hiện task của [0.7 QueryClient](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_07_QUERY_CLIENT.md). Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md), không sửa entry cũ.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.7.1
- Trạng thái: In review
- Đã làm: StaleTime 30s; query retry mạng/5xx tối đa 2, mutation không retry; defaultError ApiError.
- Test: Test retry 0/404/500, giới hạn và type-check xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.7.2
- Trạng thái: In review
- Đã làm: Nối onlineManager với NetInfo, focusManager với AppState và cleanup listener.
- Test: Test connectivity/focus/unsubscribe xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.
