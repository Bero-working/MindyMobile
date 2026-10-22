# 3.99 User Acceptance — Student Learning

- Owner: @Bero. Trạng thái **Done**; owner xác nhận “Tôi duyệt UAT phase 3” trong chat ngày 2026-10-21 (+07:00). Phase 3 được đóng theo xác nhận này.
- Phạm vi: Lịch học, Tài khoản chỉ đọc/ngôn ngữ/logout, Lớp của tôi nhóm theo khoá, chi tiết FULL/CASH_PREVIEW và thông tin buổi; nối Home/Khoá học/QR Phase 2.
- Theo ADR-0017/0021; owner nghiệm thu sau UI approval, API, Dọn dẹp và Kiểm tra.

## Điều kiện bắt đầu

- [x] 3.1–3.5 đủ ảnh/bản chạy và owner duyệt UI; navigator có ADR được duyệt.
- [x] 3.6 hoàn tất, có bằng chứng API thật và giới hạn; không dữ liệu mẫu trong production.
- [x] Jest/lint/format/type-check và Maestro đạt, ghi rõ cảnh báo/môi trường/flow chưa chạy.

## Owner kiểm tra

| # | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| 1 | Chuyển Home/Khoá học/Lịch/Tài khoản | Tab đúng; không lặp stack, Thông báo chưa mở; Back đúng nguồn |
| 2 | Lịch: trước/sau tuần, Hôm nay, chọn ngày | Đúng tuần/ngày, đủ buổi, ngày rỗng rõ; không lệch timezone |
| 3 | Chạm buổi trên Lịch, mở buổi từ Home/Lớp của tôi | Lịch chỉ xem, không chuyển trang; Home/detail mở đúng sessionId, không tự vào meeting |
| 4 | Account: tên/email/phone null và ngôn ngữ | Dữ liệu đúng phiên, đọc được, Việt/Anh áp dụng; không lưu hồ sơ giả |
| 5 | Home/Account → Lớp của tôi (điểm vào Khoá học đã bỏ theo yêu cầu owner) | Folder khoá học, mở/đóng, current/history, thêm trang, không mất enrollment |
| 6 | Mở lớp FULL, chọn chương/buổi | Hero/meta/session đúng server, không tiến độ/roster giả; link học chỉ khi hợp lệ |
| 7 | Mở CASH_PREVIEW, NONE, lớp huỷ/hoàn thành | Banner/giải thích đúng; preview không link học; không tự cấp quyền xem lại |
| 8 | Tiếp tục PENDING_PAYOS; thử trường hợp đối soát | Đơn cũ, không checkout lại; đối soát không mời trả lần nữa |
| 9 | Quyền đổi/403/404, mất mạng và retry | Link nhạy cảm biến mất khi bị từ chối; không loop; retry đúng vùng |
| 10 | Logout rồi Back; đăng nhập user khác | Không quay về màn hoặc dữ liệu user trước |
| 11 | 320dp, font1.3×, Reduce Motion, đọc màn hình | Không che CTA, target≥44dp, label/expanded/selected rõ |
| 12 | Hồi quy mua khoá→giỏ→QR và xem báo cáo | Luồng Phase 2 giữ đúng; không suy QR thành PAID hoặc FULL |

## Bằng chứng và xác nhận

Bằng chứng UI, MSW và backend/native ở [API_REVIEW](../../PROGRESS/PHASE_03_STUDENT_LEARNING/API_REVIEW.md); lịch sử triển khai và kiểm tra ở [PROGRESS](../../PROGRESS/PHASE_03_STUDENT_LEARNING/README.md). Cập nhật ngày 2026-10-20 18:44–18:45 đã mở protected detail JS-101-ON1 với mentor thật; giới hạn tài khoản chỉ có NONE trong lượt cũ là dữ liệu lịch sử.

Owner @Bero xác nhận trực tiếp: **“Tôi duyệt UAT phase 3”**, ngày **2026-10-21 (+07:00)**. UAT 3.99 và Phase 3 chuyển **Done**. Đây là xác nhận UAT toàn phase của owner; không suy diễn rằng từng tình huống trong bảng đã được chạy hoặc có thêm bằng chứng kiểm thử.

Giới hạn được giữ nguyên: Student roster chưa có API, modal học viên hiển thị chờ dữ liệu; chưa kiểm tra iOS/TalkBack thủ công; các trạng thái CASH_PREVIEW/PAYOS/đối soát và lịch có buổi chưa có đủ bằng chứng backend/native thật như API_REVIEW. Lint toàn repo còn lỗi asset JavaScript thiết kế cũ; kiểm tra phần triển khai đã ghi trong PROGRESS. Các ô điều kiện và bảng kiểm tra là checklist tham chiếu, không tự đánh dấu thành kết quả test mới theo xác nhận UAT.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_03_STUDENT_LEARNING/README.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.

Kiểm tra chất lượng hiện tại có thêm CI Phase 4 run 39700197090: 63 suites/294 tests và 13 flow CI đạt; iOS là build Simulator. Đây là bằng chứng bổ sung ngày 2026-10-22, không thay số liệu/môi trường của các lượt lịch sử và không chứng minh API/thanh toán thật.

Các nhánh FULL/CASH_PREVIEW/NONE, thay đổi quyền và dữ liệu có buổi được ghi theo unit/MSW/fixture khi chưa có dataset backend phù hợp. Có native protected detail bổ sung lúc 18:44 ngày 2026-10-20; Student roster, các dataset còn thiếu và TalkBack/iOS thủ công giữ giới hạn tại API_REVIEW.
