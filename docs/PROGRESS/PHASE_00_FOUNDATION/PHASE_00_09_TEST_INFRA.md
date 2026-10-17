# Progress 0.9 Hạ tầng test

Nhật ký thực hiện task của [0.9 Hạ tầng test](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_09_TEST_INFRA.md). Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md), không sửa entry cũ.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.9.1
- Trạng thái: In review
- Đã làm: Cài MSW; server strict unhandled requests, health handler, URL test /api/v1; Jest Node export conditions/ESM transforms và Axios HTTP adapter.
- Test: MSW chặn request thật qua Axios interceptor. Phần này dựng trước HTTP nhằm đáp ứng TDD, như phụ thuộc đã ghi trong phase README.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.9.2
- Trạng thái: In review
- Đã làm: Tạo createTestQueryClient, renderWithProviders/renderHookWithProviders; safe-area mock đúng để app smoke render cây con.
- Test: Hook nhận dữ liệu MSW qua QueryClientProvider xanh; app smoke có assert app-root và dọn timer.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:07 (+07:00) · @Bero
- Phase: 0.9.1 Kiểm tra bổ sung
- Trạng thái: In review
- Đã làm: Xác nhận MSW onUnhandledRequest error chặn request không có handler, không rơi ra mạng thật.
- Test: test unhandled request xanh; toàn bộ 35 test xanh.
- PR / commit: Chưa có.
- Ghi chú: Adapter HTTP chỉ dùng trong Jest; app native giữ networking/cookie của RN.
