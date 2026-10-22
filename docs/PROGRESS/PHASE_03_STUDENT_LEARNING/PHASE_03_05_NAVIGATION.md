# Tiến độ 3.5 — Điều hướng và kiểm tra UI

Chỉ ghi thêm kết quả từng task; chưa có entry triển khai.

### 2026-10-20 15:35 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.5.1–3.5.2 preview/điểm vào và kiểm tra UI.
- Trạng thái: Blocked chỉ đối với route production — chờ ADR-0030; UI preview In review.
- Đã làm: Menu development thêm schedule/account/classes. Preview nối Home session→đúng lớp/buổi, Home/Khoá học/Tài khoản→MyClasses với tab nguồn, giữ week/expanded/scroll; AppTabBar bật learning bằng opt-in để production cũ giữ hành vi. QR dùng PreviewPayment với orderId cũ. Không sửa navigator/routes/types/module registry hoặc auth infrastructure.
- Test: learningFlow3tests PASS, auth store không bị tạo session; commerceFlow hồi quy PASS. Normal-final student-schedule/student-account/my-classes-detail3/3 PASS một lượt; responsive cuối trước redesign PASS. Bổ sung kiểm tra lịch sau ảnh owner, xem UI_REVIEW/README phase cho lượt cuối.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa thể test guard/Back stack production Phase3 khi route chưa đăng ký. ADR-0030 còn Proposed; không coi yêu cầu chỉnh UI hoặc test xanh là duyệt ADR/UI/UAT.


### 2026-10-20 18:11 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.5.1 route production.
- Trạng thái: In review.
- Đã làm: ADR-0030 Accepted theo xác nhận trực tiếp của @Bero, cập nhật ARCHITECTURE cùng thay đổi navigator. Đăng ký STUDENT_SCHEDULE/STUDENT_ACCOUNT/MY_CLASSES/STUDENT_CLASS_DETAIL trong nhánh STUDENT, route params ID/origin; Home và Courses mở tab/MyClasses, Home mở session, Lịch không mở. navigate pop=true tái dùng tab; MyClasses giữ view/folder/scroll qua detail. Session state nội bộ không thêm route; hardware Back giữ hành vi đã kiểm tra.
- Test: App integration thật với MSW Home→Lịch chỉ xem→Account→MyClasses→detail/session→Back→logout clear cache PASS. Native backend flow Home→Schedule→Account→classes/history→Back→Home PASS; status bar danh sách trắng đã sửa dark và xem ảnh final.
- PR / commit: Chưa tạo.


### 2026-10-20 18:19 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.1/3.5 điều chỉnh theo ảnh owner.
- Trạng thái: In review.
- Đã làm: ONLINE trên Lịch giữ nhãn Phòng nhưng giá trị trống, không hiện thông báo thiếu phòng; OFFLINE giữ dữ liệu/fallback. Bỏ thanh Lớp của tôi ở trang Khoá học cả production/preview, dọn prop/callback thừa, giữ lối vào Home/Tài khoản. Flow responsive cập nhật không tìm thanh đã bỏ.
- Kiểm tra: Prettier/type-check/scopedESLint PASS. Thay đổi hiển thị và gỡ điểm vào, không đổi endpoint/quyền dữ liệu.
- PR / commit: Chưa tạo; UAT chưa xác nhận.


### 2026-10-22 09:25 (+07:00) · @Bero-working (Codex)

- Phase: Đồng bộ tiêu chí sau tổng kết test/AI review theo yêu cầu owner.
- Trạng thái: Done theo UAT owner đã có; giữ các giới hạn kiểm chứng, không ghi nhận UAT mới.
- Tiêu chí: tick bổ sung 2 mục đủ bằng chứng đã ghi; 0 mục giữ chưa đủ bằng chứng và nêu lý do trong IMPLEMENT/bảng đối chiếu.
- Test: Chỉ rà hồ sơ, không chạy lại app/Jest/Maestro/backend; không biến kết quả lịch sử hoặc owner approval thành lượt test mới.
- Đồng bộ: [IMPLEMENT](../../IMPLEMENT/PHASE_03_STUDENT_LEARNING/PHASE_03_05_NAVIGATION.md) và [bảng đối chiếu](../ACCEPTANCE_SYNC_2026-10-22.md); nhật ký cũ giữ nguyên.
