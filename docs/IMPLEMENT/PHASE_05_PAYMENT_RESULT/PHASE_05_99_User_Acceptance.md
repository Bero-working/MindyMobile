# 5.99 User Acceptance — Hoàn thành luồng thanh toán

Owner: @Bero. Trạng thái **Done** — owner xác nhận “UAT tôi xác nhận done” trong chat ngày2026-10-22. AI ghi nhận xác nhận này, không tự thực hiện nghiệm thu thay owner.

## Phạm vi và điều kiện bắt đầu

Nghiệm thu result ticket và hành trình QR → backend xác nhận → Home/retry. Không gồm deep link PayOS ngoài app, thu tiền mặt hoặc hoàn tiền.

- [x] 5.1–5.2 có ảnh đối chiếu với bố cục được owner chọn và xác nhận UI riêng trong PROGRESS.
- [ ] 5.3 tích hợp xong; test, dữ liệu thật, revision/môi trường và giới hạn được bàn giao.
- [x] Dọn dẹp trong phạm vi phase; Jest, lint rules/format, type-check và Maestro Android phù hợp đạt.
- [ ] Có tài khoản Student và đơn test cho PAID/PENDING/đóng/review; thiếu dataset phải ghi rõ, không giả thanh toán thật.

UI đã được owner duyệt, API code và unit/MSW/native fixture đã kiểm tra; điều kiện dataset và xác minh backend thật chưa đủ. Xem [API_REVIEW](../../PROGRESS/PHASE_05_PAYMENT_RESULT/API_REVIEW.md). Test fixture/MSW không thay xác nhận backend/native. iOS kiểm tra khi có macOS, nếu chưa có phải ghi giới hạn. Quy định CI trước merge theo ADR-0032 vẫn áp dụng.

## Owner kiểm tra

| # | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| 1 | So ticket với ticket theo ảnh owner ở màn thường, 320dp/font 1.3× | Đúng bố cục đã duyệt; đọc đủ chữ và bấm được CTA |
| 2 | Mở QR và để backend test chuyển PAID | Ticket thành công xuất hiện một lần; không yêu cầu quét/trả lại |
| 3 | Bấm Về trang chủ, sau đó Back | Vào Home, không quay lại QR/checkout đã trả |
| 4 | Lặp từ Lớp của tôi → tiếp tục thanh toán | Thành công vẫn về Home; quyền/lịch mới lấy từ backend |
| 5 | Đơn EXPIRED/CANCELLED → Thử lại | Về Courses để chọn lại, không tự checkout hay khôi phục giá/chỗ cũ |
| 6 | Mất mạng/lỗi tạo link rồi Thử lại, bấm nhanh nhiều lần | Một lượt xử lý; GET trước, server PAID thì success, pending hợp lệ mới tiếp tục link |
| 7 | Server còn PENDING qua 120s | Báo chưa xác nhận; Kiểm tra lại dùng GET, không tự coi thất bại hoặc tạo đơn mới |
| 8 | Server trả REQUIRES_REVIEW | Không mở ticket, không retry thanh toán, polling dừng |
| 9 | Đóng màn/đưa app về nền, trở lại; logout hoặc đổi user | Request/timer cũ dừng; focus xác minh lại, không lộ dữ liệu user trước |
| 10 | Countdown hết nhưng GET trả PAID; phản hồi cũ đến trễ | Success theo backend, không bị expired/lỗi cũ ghi đè |
| 11 | Hết phiên, order người khác/không tồn tại | Dừng kiểm tra; auth/lỗi đúng quyền, không tạo link mới |
| 12 | PAID nhưng API lớp/lịch lỗi | Vẫn xem success/về Home; lỗi tải dữ liệu xử lý riêng, không mời thanh toán lại |
| 13 | Chuyển Việt/Anh, TalkBack, Reduce Motion | Nội dung đúng, focus vào modal, không thao tác nền, không animation lặp |

## Bằng chứng và xác nhận

AI bàn giao tại [PROGRESS cấp phase](../../PROGRESS/PHASE_05_PAYMENT_RESULT/README.md), các nhật ký sub-phase và evidence của phase. Mỗi ca ghi Đạt/Chưa đạt/Chưa kiểm tra/Owner chấp nhận kèm giới hạn, nguồn fixture/MSW/backend, revision, môi trường và thời điểm. Không tick toàn bộ theo tổng số test xanh.

Kết quả owner: **Đã xác nhận Done** trong chat ngày2026-10-22: “UAT tôi xác nhận done”. Xác nhận được ghi vào PROGRESS và đồng bộ README/roadmap/5.3. Không chạy lại test hoặc bổ sung bằng chứng AI về dataset/backend/iOS trong lượt ghi nhận này; checkbox thiếu bằng chứng vẫn giữ chưa tick.
