# Progress 0.2 Font

Nhật ký thực hiện task của [0.2 Font](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_02_FONT.md). Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md), không sửa entry cũ.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.2.1
- Trạng thái: Blocked
- Đã làm: Thêm 4 Nunito static TTF, nguồn/giấy phép; chạy react-native-asset link Android/iOS.
- Test: Asset link thành công; chưa kiểm tra bằng mắt trên emulator.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:29 (+07:00) · @Bero
- Phase: 0.2.1 Kiểm tra Android
- Trạng thái: In review
- Đã làm: Bốn font Regular/SemiBold/Bold/ExtraBold hiển thị rõ đúng độ đậm và dấu tiếng Việt.
- Test: Native assembleDebug x86_64 thành công; ảnh đã kiểm tra bằng mắt.
- PR / commit: Chưa có, workspace không có .git.
- Ghi chú: Chưa build iOS vì host Windows; asset iOS đã link ở phiên trước. Bằng chứng trong evidence/2026-10-17-native-foundation.png, evidence/2026-10-17-main-app.png và JSON cùng tên.

### 2026-10-17 13:35 (+07:00) · @Bero
- Phase: 0.2.1 Triển khai lại / AI tự kiểm tra
- Trạng thái: In review
- Đã làm: AI đối chiếu 4 Nunito static với asset Android và UIAppFonts iOS; xem lại ảnh đủ bốn weight và dấu tiếng Việt.
- Test: SHA256 của cả 4 asset Android khớp assets/fonts; Info.plist khai báo đủ 4 tên. Build Android xanh.
- PR / commit: Chưa tạo; kiểm tra trên working tree từ 5087fbf (main).
- Ghi chú: Ảnh kiểm tra font là bằng chứng lần trước, chưa chạy iOS trên Windows. Codex thực hiện; handle dùng lại xác nhận trực tiếp đã ghi trong nhật ký trước, vì máy không có gh CLI.

### 2026-10-17 14:24 (+07:00) · @Bero
- Phase: Đồng bộ nghiệm thu sub-phase theo UAT 1–4a
- Trạng thái: Done
- Đã làm: Tick checklist nghiệm thu và đồng bộ bảng sub-phase theo xác nhận trực tiếp của owner về UAT bước 1–4a. NativeWind, Nunito, theme và i18n tương ứng phạm vi đã chấp nhận.
- Test: Chỉ cập nhật tài liệu, không đổi code; dùng bằng chứng test/native đã ghi trong nhật ký trước, không chạy lại test.
- PR / commit: Chưa tạo.
- Ghi chú: Done chỉ cho sub-phase này; Phase 0/0.99 chưa Done. Bằng chứng native/font của lần kiểm tra trước; không ghi đã xem lại màn kiểm tra tạm trên emulator, chưa chạy iOS trên Windows. Codex ghi nhận quyết định owner, không tự nghiệm thu thay owner.
