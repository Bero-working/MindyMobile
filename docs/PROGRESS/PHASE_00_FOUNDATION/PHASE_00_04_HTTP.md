# Progress 0.4 HTTP

Nhật ký thực hiện task của [0.4 HTTP](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_04_HTTP.md). Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md), không sửa entry cũ.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.4.1
- Trạng thái: In review
- Đã làm: Tạo ApiErrorBody/Paginated và ApiError/isApiErrorCode; parse biên API bằng zod.
- Test: Test message/details và mã lỗi xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.4.2
- Trạng thái: In review
- Đã làm: Bỏ Bearer và API token MMKV; mọi lỗi qua ApiError, giữ credentials; bỏ timeout retry của template để tránh gửi lặp mutation.
- Test: MSW test request không Bearer, 404, mạng và envelope sai xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.4.3
- Trạng thái: Blocked
- Đã làm: Refresh single-flight theo baseURL, generation chống 401 trễ, retry request gốc một lần; refresh lỗi clear QueryClient/reset auth.
- Test: MSW test 3 request song song, refresh lỗi, 401 trễ sau refresh lỗi, không vòng lặp xanh. Chưa có route Login trong repo để nối điều hướng.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.4.4
- Trạng thái: Blocked
- Đã làm: APP_ORIGIN qua env.ts; route protected tự gắn Origin; giá trị env thật để trống, thiếu cấu hình báo lỗi rõ.
- Test: MSW kiểm tra Origin cho materials/release/file access xanh. Chưa có xác nhận CORS_ORIGINS từ backend.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.
