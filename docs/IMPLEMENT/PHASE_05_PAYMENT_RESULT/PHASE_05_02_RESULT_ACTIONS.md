# 5.2 Home và retry

## Phạm vi cuối theo owner

**UI/callback**, trạng thái **Done** cho mốc UI owner đã duyệt. Chỉ PAID (SUCCESS), CANCELLED (FAIL), EXPIRED có ticket. Giữ thiết kế ticket mép xé theo ảnh; không có pending/review/loading/empty/error/forbidden/notFound hoặc nút kiểm tra lại trong ticket/preview. QR và lỗi inline hiện có giữ nguyên, không đổi enum API.

- PAID: đọc ticket rồi bấm “Về trang chủ” hoặc Back để reset stack chỉ còn STUDENT_HOME; không tự redirect bằng timer. Áp dụng adapter chung cho checkout/learning, không sửa navigator khoá.
- CANCELLED/EXPIRED: “Thử lại” hoặc Back về Courses chọn lại lớp; không tự checkout/khôi phục giỏ/giá/giữ chỗ cũ. Thông báo huỷ/hết hạn riêng, không xác nhận lại tiền từ client.
- Mỗi thao tác rời ticket chỉ gọi callback một lần; backdrop không đóng; không animation tự chạy. testID payment-result-home, payment-result-retry.

## Task tuần tự

### 5.2.1 Thành công về Home

Unit/callback PAID, CTA/Back chỉ gọi một lần; adapter reset Home không còn PAYMENT. Hai origin backend thật kiểm tra sau5.3.

### 5.2.2 Retry đơn đóng

Unit/callback CANCELLED và EXPIRED đều về Courses, không tạo checkout/giỏ. Bỏ toàn bộ callback kiểm tra lại và fixture lỗi/chờ của ticket.

### 5.2.3 Bàn giao UI

Preview development chỉ ba trạng thái. Flow payment-result.yaml kiểm tra PAID→Home, CANCELLED/EXPIRED→Courses và PAID Back. Gallery ba trạng thái ở320×640dp/font1.3×. Đối chiếu ảnh owner; bàn giao tại [UI_REVIEW](../../PROGRESS/PHASE_05_PAYMENT_RESULT/UI_REVIEW.md). Owner duyệt UI trước API5.3; không lấy thay đổi phạm vi làm UI approval.

## Tiêu chí nghiệm thu

- [ ] Success CTA/Back về Home, không quay QR cũ, đúng cả origin learning. Unit/preview có bằng chứng; hai origin đã nối và MSW route đạt; backend thật chưa kiểm tra.
- [x] CANCELLED/EXPIRED retry khoá bấm lặp, về Courses, không tự tạo checkout/giỏ. Unit/callback đã kiểm tra; native bản ba trạng thái PASS màn thường và320×640dp/font1.3×.
- [x] Chỉ ba trạng thái có ticket, preview và text tương ứng; không có nút kiểm tra lại. Source/type và unit đã kiểm tra.
- [ ] Có preview/ảnh/flow fixture và xác nhận UI riêng của owner. Owner đã xác nhận UI trong chat; backend/UAT riêng.

Đồng bộ nhật ký5.2/README/roadmap và UI_REVIEW khi tổng kết; không tự xác nhận UAT.
