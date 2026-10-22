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

### 2026-10-17 13:35 (+07:00) · @Bero
- Phase: 0.11.1–0.11.2 Triển khai lại / AI tự kiểm tra
- Trạng thái: In review
- Đã làm: AI kiểm tra vi-VN mặc định, parity key, danh sách chỉ vi-VN/en-EN và lưu lựa chọn ngôn ngữ.
- Test: 3 test i18n xanh; không còn bn-BN trong source app.
- PR / commit: Chưa tạo; kiểm tra trên working tree từ 5087fbf (main).
- Ghi chú: Kiểm tra hiển thị mặc định trực tiếp trên Android ghi trong nhật ký phase; không có kiểm tra iOS. Codex thực hiện; handle dùng lại xác nhận trực tiếp đã ghi trong nhật ký trước, vì máy không có gh CLI.

### 2026-10-17 14:24 (+07:00) · @Bero
- Phase: Đồng bộ nghiệm thu sub-phase theo UAT 1–4a
- Trạng thái: Done
- Đã làm: Tick checklist nghiệm thu và đồng bộ bảng sub-phase theo xác nhận trực tiếp của owner về UAT bước 1–4a. NativeWind, Nunito, theme và i18n tương ứng phạm vi đã chấp nhận.
- Test: Chỉ cập nhật tài liệu, không đổi code; dùng bằng chứng test/native đã ghi trong nhật ký trước, không chạy lại test.
- PR / commit: Chưa tạo.
- Ghi chú: Done chỉ cho sub-phase này; Phase 0/0.99 chưa Done. Bằng chứng native/font của lần kiểm tra trước; không ghi đã xem lại màn kiểm tra tạm trên emulator, chưa chạy iOS trên Windows. Codex ghi nhận quyết định owner, không tự nghiệm thu thay owner.
