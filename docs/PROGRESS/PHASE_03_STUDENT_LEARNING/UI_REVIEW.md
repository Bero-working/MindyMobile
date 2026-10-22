# Bàn giao UI Phase 3 — 2026-10-20

Cập nhật2026-10-20: owner đã cho phép API và duyệt ADR-0030; Lịch chỉ xem. Mốc chờ duyệt UI bên dưới là ghi nhận cũ, đã được thay bằng [bàn giao API](API_REVIEW.md). UAT chưa xác nhận.

UI chạy trong development preview, chưa nối API Student Learning. Mở app debug → Xem thử giao diện → Lịch học / Tài khoản / Lớp của tôi. Không cần đăng nhập; không tạo session giả.

## Lịch theo ảnh owner

- [Snapshot trước sửa](evidence/schedule-redesign/before.png).
- [Ảnh owner gửi](../../IMPLEMENT/PHASE_03_STUDENT_LEARNING/references/schedule-owner-2026-10-20.png).
- [Snapshot sau sửa](evidence/schedule-redesign/after.png).
- [Ảnh320dp/font130%](evidence/schedule-redesign/final-320dp/2026-10-20_153346/student-learning-responsive/takeScreenshot/phase3-responsive-schedule.png).

Đã chuyển sang header tháng/năm, dải ngày phẳng, vòng ngày chọn, chấm lịch, cột ngày nền xen kẽ, vạch trạng thái, cột giờ, mã lớp trong khối soft, tên buổi và chip. Header/dải ngày cố định, chỉ timeline cuộn. Mũi tên đổi tuần; chạm tháng để về hôm nay. Bấm ngày cuộn đến nhóm, không xoá lịch cả tuần. Màn320dp/chữ130% đưa giờ lên trên nội dung, date ngắt theo ngày/tháng; tabs đọc đủ hai dòng.

Theo hai ảnh owner đánh dấu ở lượt tiếp theo ngày2026-10-20: đã bỏ chip “Xem trước” trên lịch và nút “Lớp của tôi” cuối lịch. Không còn callback thừa cho nút này. Quyền preview vẫn được giữ trong callback và màn chi tiết; đây là thay đổi hiển thị.

Khác ảnh có chủ ý: dùng ngày/buổi từ fixture theo tuần hiện tại; “Ca” thay bằng “Buổi N” của sessionNumber; không dùng nhãn điểm danh/nghỉ học chưa có API. Các nhãn thay thế là trạng thái session. Không dựng khung máy hoặc status bar giả. Token mint hiện có giữ nguyên. Nút UI chỉ có trong development preview.

## Các màn còn lại

- Tài khoản đã được chỉnh tiếp theo [ảnh Profile owner](../../IMPLEMENT/PHASE_03_STUDENT_LEARNING/references/profile-owner-2026-10-20.png): hero mint hết chiều ngang/avatar giữa, nhóm menu theo ảnh và row ngôn ngữ có giá trị hiện tại. [Ảnh trước](evidence/profile-redesign/before.png), [ảnh sau](evidence/profile-redesign/after.png); kết quả ghi ở nhật ký. Bấm tên mở thông tin chỉ đọc; các mục chưa có chức năng disabled, không đếm mẫu hoặc push bật giả. Logout giữ dưới menu, xác nhận/lỗi/retry.
- Lớp của tôi theo [ảnh list owner](../../IMPLEMENT/PHASE_03_STUDENT_LEARNING/references/my-classes-owner-2026-10-20.png): folder liên tục, hàng enrollment gọn bấm trực tiếp, header Back tròn/tiêu đề giữa; lịch sử ở icon header. [Ảnh trước](evidence/my-classes-redesign/before.png); [ảnh sau](evidence/my-classes-redesign/after.png) và kết quả ở nhật ký. NONE không mở detail, requiresReview không trả lại lần nữa. Không progress/lịch tuần giả; fixture chia hai khoá để đối chiếu folder mở/đóng.
- Detail đã được chỉnh theo [ảnh owner mới](../../IMPLEMENT/PHASE_03_STUDENT_LEARNING/references/class-detail-owner-2026-10-20.png): hero full width, stats từ DTO, thẻ mentor, buổi học phẳng và video CTA dưới. [Ảnh trước](evidence/class-detail-redesign/before.png), [ảnh sau](evidence/class-detail-redesign/after.png), kết quả tại nhật ký. Preview/denial/offline/cancelled không join. Link trong preview không mở ra ngoài; chỉ mô phỏng callback lỗi. Không tiến độ/roster hoặc link Google Meet mẫu.

Từ Schedule/Home mở đúng session. Từ Home/Khoá học/Tài khoản mở danh sách và giữ tab nguồn; Back giữ folder/scroll. QR dùng PreviewPayment Phase2 với orderId mẫu cũ, không gọi checkout/API thanh toán.

## Kiểm tra và giới hạn

- Toàn bộ Jest ở lượt đầu:53suites/254tests PASS. Sau bổ sung và thay đổi UI:9suites/30tests liên quan PASS; kiểm tra lịch sau thay đổi auto-scroll:2suites/4tests PASS. Không cộng các lượt thành một tổng giả.
- Type-check, Prettier và eslint src/tests/__tests__ đạt (eslint còn1warning về URL cố ý không an toàn trong test). Lint tổng repo còn626lỗi/44warnings từ JavaScript asset thiết kế; không sửa ngoài phạm vi.
- Android trước redesign:normal3/3flows PASS trong một lượt tại evidence/normal-final/2026-10-20_152515;320dp/font130% PASS tại evidence/320dp-font130-final/2026-10-20_152335.
- Android redesign:flow lịch normal PASS tại evidence/schedule-redesign/final-normal/2026-10-20_153225; responsive320dp/font130%/animator0 PASS tại evidence/schedule-redesign/final-320dp/2026-10-20_153346. Đã khôi phục emulator1080×2400/font100% và giá trị animator ban đầu. Lượt320dp ban đầu thất bại do nút preview ngoài viewport; đã sửa flow để cuộn tới nút. Một ảnh lịch ở lượt320dp trung gian chụp sớm ra menu, không dùng làm bằng chứng UI; lượt cuối có assert trước khi chụp.
- Chưa kiểm tra iOS, TalkBack thủ công, backend Student Learning thật, thay đổi quyền trên server hoặc thanh toán thật. Phân trang/cancel request/query scope và logout production là bước3.6, chưa thực hiện.

## Mốc cần owner xác nhận

1. Duyệt UI sau khi xem bản chạy/ảnh. Yêu cầu chỉnh lịch không tự trở thành duyệt UI toàn phase.
2. [ADR-0030](../../adr/ADR-0030-phase-03-navigation-routes.md) còn Proposed; cần owner Accepted trước sửa navigator và bổ sung route production.
3. Sau hai mốc trên mới thực hiện3.6 API;3.99 UAT là mốc riêng. Không coi preview hoặc test xanh là nghiệm thu API/UAT.


## Detail, session và nút Meet theo yêu cầu tiếp theo

- Detail: hero full width, cover/status, stats từ dữ liệu, mentor và danh sách buổi phẳng.
- Session: [ảnh owner](../../IMPLEMENT/PHASE_03_STUDENT_LEARNING/references/session-detail-owner-2026-10-20.png), [trước](evidence/session-detail-redesign/before.png), [sau](evidence/session-detail-redesign/after.png). Màn toàn màn hình trong preview, header mint nhạt, bốn ô thông tin, nội dung/mục tiêu và nút tài liệu disabled vì chưa có dữ liệu.
- Theo yêu cầu mới nhất, nhãn “Vào Google Meet” dùng pill trắng có shadow, icon video trong vòng mint và rộng vừa nội dung trên cả hai màn; [mẫu nút](../../IMPLEMENT/PHASE_03_STUDENT_LEARNING/references/meet-button-owner-2026-10-20.png). Callback vẫn dùng URL đã xác minh từ dữ liệu, không đổi hoặc tự tạo link.
- Hai lượt native trung gian dùng Modal bị lỗi session cũ phủ lên sheet công cụ khi Back; đã chuyển màn buổi sang trạng thái nội bộ, không thêm route/navigator production. Nhật ký ghi kết quả lượt cuối riêng.


Owner chỉnh tiếp footer: trong session, Tài liệu sát trái và Meet sát phải; Meet nền trắng/chữ forest, viền line1dp, video trắng trong vòng mint, chiều ngang vừa nội dung. Class detail dùng cùng nút có viền sát phải, avatar mentor sát trái. Giữ callback/quyền truy cập và Tài liệu disabled.


Footer cuối đã kiểm tra native normal và320dp/font130% (hardware Back PASS). [Session màn nhỏ](evidence/meet-button/footer-320dp-compact/2026-10-20_162434/session-detail-footer/takeScreenshot/phase3-session-footer.png); class detail trong cùng thư mục. Ảnh normal after.png ở trên đã cập nhật hai đầu hàng/nút trắng có viền.
