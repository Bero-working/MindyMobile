# 3.2 Tài khoản

### 2026-10-20 15:16 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.2 UI tài khoản.
- Trạng thái: In progress.
- Đã làm: Hero gradient token hiện có, avatar initials, thông tin chỉ đọc từ UserDto, menu lớp/lịch, ngôn ngữ qua useI18n, xác nhận logout với khoá double-submit và lỗi tại thao tác.
- Test: AccountScreen.test.tsx kiểm tra profile và không logout trước xác nhận PASS. Dùng mock native sheet giống test Phase 2; native đang kiểm tra.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa nối auth production; logout trong preview chỉ thoát preview. Không có sửa profile/avatar hoặc thành công giả.

### 2026-10-20 15:35 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.2.1–3.2.2 tự kiểm tra UI tài khoản.
- Trạng thái: In review.
- Đã làm: Hoàn thiện lỗi logout có requestId/retry; xác nhận bằng AppSheet dùng chung vì repo không có Dialog. Không thêm dependency hoặc sửa UI kit khoá.
- Test: AccountScreen2tests PASS; native student-account PASS trong lượt normal-final3/3, profile/ngôn ngữ/logout; responsive320dp/font130% đã xem ảnh, không mất nút.
- PR / commit: Chưa tạo.
- Ghi chú: Chỉ UI/callback; cache/stack/logout thật thuộc3.6 sau UI approval. TalkBack/iOS chưa kiểm tra.

### 2026-10-20 15:50 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.2 chỉnh Profile theo ảnh owner mới.
- Trạng thái: In review.
- Đã làm: Hero mint/initials88dp/tên-email căn giữa; sheet trắng bo28dp và ba nhóm row/icon theo ảnh. Camera disabled ở góc avatar, không upload giả. Các mục ngoài API disabled, push off, không số mẫu. Tên mở profile chỉ đọc; ngôn ngữ một row mở picker sheet; logout giữ dưới menu. Lưu before.png/after.png tại evidence/profile-redesign.
- Test: Lượt đầu3suites/9tests PASS; sau chỉnh vị trí camera2suites/6tests PASS, format/type-check/eslint phần sửa PASS. Maestro account normal PASS tại final-normal/2026-10-20_154818; responsive320dp/font130% PASS tại final-320dp/2026-10-20_154925. Đã xem ảnh native normal/320dp, khôi phục emulator1080×2400/font100%/animator.
- PR / commit: Chưa tạo.
- Ghi chú: Không API mới. Owner tiếp tục yêu cầu sửa list lớp theo ảnh riêng; đây không phải UI approval toàn phase.
