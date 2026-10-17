# Progress 0.11 i18n

Nhật ký thực hiện task của [0.11 i18n](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_11_I18N.md). Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md), không sửa entry cũ.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.11.1
- Trạng thái: In review
- Đã làm: Thêm vi-VN đủ key, mặc định/fallback vi-VN; chuyển ngôn ngữ lưu MMKV.
- Test: Test mặc định vi-VN, leaf-key parity, persistence và supported languages xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.11.2
- Trạng thái: In review
- Đã làm: Bỏ bn-BN.json và mọi đăng ký; giữ vi-VN/en-EN.
- Test: Test danh sách ngôn ngữ và toàn bộ test xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:29 (+07:00) · @Bero
- Phase: 0.11.1 Kiểm tra app chính
- Trạng thái: In review
- Đã làm: Mở app sau clearState qua Maestro: các nhãn welcome/chức năng đều tiếng Việt.
- Test: E2E app-launch xanh; kiểm tra native UI hierarchy và screenshot.
- PR / commit: Chưa có, workspace không có .git.
- Ghi chú: Không gọi API nghiệp vụ trong flow mở app. Bằng chứng trong evidence/2026-10-17-native-foundation.png, evidence/2026-10-17-main-app.png và JSON cùng tên.
