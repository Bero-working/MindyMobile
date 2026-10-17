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
