# 5.3 Xác nhận kết quả từ backend

## Bước và điều kiện

**API**, trạng thái **Done** theo xác nhận UAT của owner. Chỉ bắt đầu khi PROGRESS đã có owner xác nhận UI 5.1–5.2; owner đã xác nhận trong chat ngày2026-10-22: “UI đã duyệt, bây giờ nối API đi”. Không thay bố cục mới trong bước này; chỉ PAID/CANCELLED/EXPIRED mở ticket đã duyệt; các trạng thái khác không tạo modal/ticket mới, dùng QR/lỗi inline hiện có. Không thêm thư viện hoặc sửa hạ tầng khoá.

## API và mapping

- [§11.6 GET `/me/orders/:orderId`](../../API_CONTRACT/orders-payment.md): nguồn xác nhận trên màn QR, dùng schema hiện có, giữ `status`, `payment.status`, `paymentType`, id và expiresAt trong adapter.
- [§11.7 POST `/me/orders/:orderId/payments/payos`](../../API_CONTRACT/orders-payment.md), body `{}`: chỉ tạo/tái sử dụng link khi GET mới nhất xác nhận PAYOS/PENDING và chưa đối soát/còn trả được. 409 phải đọc lại đơn; PAID có thể vừa đến, không mặc định coi 409 là thất bại thanh toán.
- §11.8 `/me/orders/payment-result?orderCode=…` dành cho callback provider; **không cần gọi trong QR orderId hiện tại**. Nếu mở rộng callback, phải có thoả thuận deep link/backend trước; chỉ nhận providerOrderCode hợp lệ `^[1-9][0-9]{0,15}$`, không dùng mã đơn Mindy dạng chữ, không tin code/status/cancel của URL. Không tự đăng ký deep link trong Phase 5 này.
- Hết hạn countdown chỉ khoá QR cũ và yêu cầu kiểm tra server; không kết luận EXPIRED trước GET. `payment.status=SUCCEEDED` với order chưa PAID không cấp quyền học.
- Phân loại kết quả đúng thứ tự trong README: PAID mở success; review dừng tạo link/polling và không mở ticket; CANCELLED/EXPIRED mở ticket đóng; pending giữ QR. Không gom tất cả non-payable thành `PAYMENT_ORDER_INVALID`.

## Polling và vòng đời

- Đọc ngay khi vào/focus màn PAYMENT, chỉ theo dõi đơn của session Student hiện tại. Khi PAYOS/PENDING và chưa review, GET có backoff 3s → 5s → 10s, các lần sau 10s; mỗi lượt tối đa 120s wall-clock, bao gồm thời gian request. Không có request chồng nhau; đặt timeout theo ngân sách còn lại.
- Dừng và huỷ request/timer khi PAID/EXPIRED/CANCELLED/REQUIRES_REVIEW, 401/403/404, blur/unmount, app background hoặc logout/đổi user. Không tự khởi động vòng mới do render/query rerender.
- Foreground/focus trở lại: GET mới một lần; chỉ tạo lượt theo dõi mới nếu server vẫn cho phép. Hết ngân sách hoặc mạng/5xx: hiện “Chưa thể xác nhận”, giữ định danh đơn và cho “Kiểm tra lại” bằng thao tác rõ.
- Retry thủ công bắt đầu bằng GET, rồi phân nhánh PAID/review/đóng/pending. Chỉ pending hợp lệ mới lấy lại link nếu cần; không POST link khi chỉ kiểm tra kết quả hoặc mỗi lần poll.
- Bảo vệ race bằng scope + orderId + lượt request; response cũ sau abort hoặc retry không ghi đè đơn/user mới. Terminal PAID không bị lỗi request cũ thay thế. Tách vòng chờ tạo link CREATING tối đa 30s hiện có khỏi vòng theo dõi kết quả 120s.
- Auth theo cơ chế refresh một lần hiện có; nếu phiên không còn hợp lệ thì dừng, không tự lặp auth/polling.

## Cache và điều hướng

PAID làm mới các query của user hiện tại: `learningQueryKeys` cho `/me/classes`, `/me/schedule`, detail/preview và query order liên quan. Invalidate phạm vi user, refetch query active; query inactive phải stale để đọc lại khi mở. Không tự tạo enrollment/FULL hoặc tăng quyền bằng optimistic update.

Refetch cart phản ánh giỏ đã bị xoá từ checkout, không khôi phục snapshot. Refetch lỗi không biến PAID thành failure hoặc chặn CTA Home; vùng lớp/lịch báo lỗi và retry riêng khi mở. Không clear toàn bộ cache như logout. Không để callback invalidation lặp vô hạn sau mỗi render PAID.

## Task tuần tự (Red → Green → Refactor)

### 5.3.1 Adapter và xác minh trạng thái

MSW/test fail cho GET với PAID/PENDING/EXPIRED/CANCELLED/review, payment null, schema sai và 401/403/404. Sau đó sửa adapter giữ trạng thái; kiểm tra resume learning vẫn xác minh enrollment, không lộ đơn user khác. Không thêm endpoint giả.

### 5.3.2 Theo dõi kết quả có giới hạn

Test fake timers + MSW fail trước: lịch backoff/ngân sách 120s, request chậm, không overlap, mỗi terminal dừng, background/blur/logout đổi user/order abort, response cũ bị bỏ. Implement hook module-local hoặc mở rộng usePaymentQuery, tránh tạo link lại do state polling.

### 5.3.3 Retry, cache và route

Test fail cho retry GET trước POST, 409 rồi GET PAID, success muộn, review không POST, đơn đóng không checkout, double tap và refetch cache lỗi vẫn về Home. Tích hợp ba ticket/callback đã duyệt với PaymentRoute và query keys hiện có.

### 5.3.4 Kiểm tra native/backend

Mở rộng `payment-result.yaml` kiểm tra fixture và flow API riêng dự kiến `e2e/api/payment-result.yaml`. Ghi kết quả PAID/đóng/review từ backend test có dataset phù hợp; không thực hiện chuyển tiền thật để tạo bằng chứng. Thiếu dataset ghi Chưa kiểm tra/Blocked theo phần phụ thuộc, không dùng MSW thay bằng chứng thật. Rà `cart-checkout-qr` đang hoãn trong CI: cập nhật assertion theo UI mới, chạy ổn định trước khi khôi phục tag CI; không tự sửa workflow hạ tầng nếu chưa có quyền.

## Tiêu chí nghiệm thu

Đã được phép bắt đầu API sau owner UI approval; kiểm chứng từng mục theo test/bằng chứng mới.

- [x] Có xác nhận UI owner trước commit tích hợp; đúng route/schema và phân loại trạng thái.
- [x] Chỉ PAID mở success; countdown/URL/payment đơn lẻ không giả success.
- [ ] Backoff/ngân sách/abort/race/auth đạt bằng test; dừng trên native được đối chiếu.
- [x] Retry GET trước POST, không thanh toán lại review/PAID hoặc tự tạo checkout.
- [x] Cache đúng user và quyền server; success không bị lỗi refetch che; Home không back lại QR.
- [ ] Jest/MSW và flow Android phù hợp đạt; API thật/iOS còn thiếu được nêu rõ theo từng ca.

Ghi bằng chứng và đồng bộ [nhật ký 5.3](../../PROGRESS/PHASE_05_PAYMENT_RESULT/PHASE_05_03_PAYMENT_STATUS.md), checklist/README/roadmap ngay khi tổng kết.

## Bàn giao API ngày2026-10-22

Code đã tích hợp, owner đã duyệt UI. [API_REVIEW](../../PROGRESS/PHASE_05_PAYMENT_RESULT/API_REVIEW.md) đối chiếu từng mục: mapping/route/GET/POST/cache có unit+MSW, flow Android fixture đạt. Polling/lifecycle/race/auth đạt unit+MSW nhưng chưa đối chiếu lifecycle trên native với đơn backend thật, nên mục ghép còn chưa tick. AI chưa có bằng chứng backend thật/iOS; phần này giữ giới hạn sau khi owner xác nhận UAT Done. 5.3.1–5.3.3 đã triển khai; không coi fixture/MSW là thanh toán thật.
