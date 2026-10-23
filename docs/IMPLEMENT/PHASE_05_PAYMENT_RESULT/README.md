# Phase 05: Hoàn thành luồng thanh toán

## Mục tiêu và phạm vi

Hoàn thiện màn thanh toán PayOS của Student bằng result ticket. Backend xác nhận thành công thì thông báo và đưa về Home; khi thất bại, người dùng có hành động thử lại phù hợp với tình trạng đơn.

- Có: đúng ba ticket kết quả PAID (SUCCESS), CANCELLED (FAIL), EXPIRED theo yêu cầu owner mới nhất; retry, theo dõi trạng thái đơn QR đang mở, cập nhật dữ liệu lớp/lịch sau PAID và điều hướng Home.
- Tái sử dụng checkout, QR và tiếp tục đơn từ Lớp của tôi của Phase 2–3. Không tạo một màn thanh toán mới.
- Không có: xác nhận tiền mặt, huỷ đơn/hoàn tiền, tự xác nhận đã chuyển khoản, tự tạo lại giỏ/checkout hoặc deep link từ trình duyệt ngoài. Luồng PayOS ngoài app cần thống nhất backend theo Business Rules §3; không nằm trong phần QR hiện tại.
- Bước hiện tại: owner đã xác nhận UAT Done trong chat ngày2026-10-22; Phase5 đóng Done. Giới hạn bằng chứng kiểm thử AI/backend/iOS đã bàn giao được giữ nguyên.

## Nguồn thiết kế và đầu vào

- Yêu cầu owner ngày 2026-10-22: hiện result ticket sau thanh toán; thành công redirect về Home; thất bại có retry; UI theo ảnh.
- Owner ban đầu chọn bố cục đề xuất, sau đó bổ sung ảnh ticket và yêu cầu bỏ hình thức modal/card. Dùng ảnh mới và thông số ticket ở 5.1 để triển khai; ảnh modal trước đó chỉ là lịch sử. UI bản chạy đã được owner duyệt trước bước API. Xem [DESIGN_SOURCE](references/DESIGN_SOURCE.md).
- Nền tham chiếu: [Student Home.dc.html](../../../assets/Student%20Home%20Page%20Design/Student%20Home.dc.html) và `src/modules/payment/PaymentScreen.tsx`. HTML có toast checkout mẫu; ảnh ticket của owner là nguồn cho phần kết quả. Bản chạy đã được đối chiếu trong UI_REVIEW.
- Giữ Nunito, token canvas/forest/soft/line/muted/status-red, formatVnd và safe area của app. Thông số cuối tại 5.1 đã được triển khai và owner duyệt UI.
- Hành vi thành công đã duyệt: hiển thị ticket, CTA “Về trang chủ” thực hiện redirect. Không đặt timer tự đóng để người dùng có thời gian đọc.

## Khảo sát kỹ thuật đầu lượt (trước triển khai UI)

Khảo sát tại HEAD `76f7b42` cộng working tree hiện có ngày 2026-10-22:

- `usePaymentQuery.ts` đọc đơn và tạo/tái sử dụng link; chưa poll kết quả. DTO hiển thị bỏ `order.status`, và đơn không payable bị gom thành `PAYMENT_ORDER_INVALID`, kể cả PAID/đối soát.
- `PaymentScreen.tsx` có QR, countdown, lỗi tạo link và retry; chưa có result ticket.
- `PaymentRoute.tsx` hiện rời sang Courses hoặc trở lại màn learning. Nhánh PAID mới cần đi Home từ cả hai điểm vào.
- Không dùng countdown hết giờ, mở QR, `payment.status=SUCCEEDED` riêng lẻ hoặc tham số redirect làm bằng chứng thanh toán thành công. Chỉ `order.status=PAID` từ backend mới là thành công.

## Phụ thuộc và mốc

Phase 0–4 Done; theo [Order/PayOS §11.6–11.8](../../API_CONTRACT/orders-payment.md), [Cart §11](../../API_CONTRACT/cart.md), [polling/cache §21](../../API_CONTRACT/README.md), [Business Rules §3, §6](../../BUSINESS_RULES.md), ADR-0021/0029 và guides UX/testing/visual-and-motion.

**Trạng thái phase: Done — owner xác nhận “UAT tôi xác nhận done” trong chat ngày2026-10-22.**

| Mốc | Trạng thái | Điều kiện |
| --- | --- | --- |
| Đặc tả, triển khai UI 5.1–5.2 | Done | Ảnh ticket mép xé owner cung cấp; UI dùng fixture/callback |
| Owner xác nhận UI | Done | Có bản chạy, ảnh và xác nhận rõ trong PROGRESS |
| API 5.3 | Done | Chỉ bắt đầu sau xác nhận UI; tái sử dụng route PAYMENT |
| Owner UAT 5.99 | Done | Sau API, Dọn dẹp, Kiểm tra và bàn giao bằng chứng |

Không thêm thư viện/route/token mới. Nếu triển khai cần sửa file hạ tầng khoá (navigator, cấu hình, component UI chung), phải có ADR Accepted và cập nhật ARCHITECTURE theo B.8 trước khi sửa; đặc tả hiện tại chưa cấp quyền đó.

## Sub-phase

| # | File | Bước | Trạng thái |
| --- | --- | --- | --- |
| 5.1 | [Result ticket](PHASE_05_01_RESULT_MODAL.md) | UI | Done |
| 5.2 | [Home và retry](PHASE_05_02_RESULT_ACTIONS.md) | UI/callback | Done |
| 5.3 | [Xác nhận kết quả từ backend](PHASE_05_03_PAYMENT_STATUS.md) | API | Done |
| 5.99 | [User Acceptance](PHASE_05_99_User_Acceptance.md) | UAT | Done |

Thứ tự: 5.1 → 5.2 → owner duyệt UI → 5.3 → Dọn dẹp → Kiểm tra → 5.99. Task trong mỗi bước tuần tự Red → Green → Refactor.

## Quy tắc kết quả và retry

| Dữ liệu đã xác minh | Hiển thị | Hành động |
| --- | --- | --- |
| `order.status=PAID` | Thành công; ưu tiên cao nhất | Dừng polling/tạo link; làm mới dữ liệu; “Về trang chủ” |
| Chưa PAID và `payment.status=REQUIRES_REVIEW` | Không mở ticket | Dừng polling/tạo link; không mời thanh toán lại |
| `order.status=EXPIRED/CANCELLED`, không đối soát | Thanh toán chưa hoàn tất; hết hạn/đơn đã huỷ | “Thử lại” về Courses để chọn lại; không POST checkout đơn cũ |
| `PENDING`, chưa đối soát, PAYOS | Giữ QR; không mở ticket | Poll có giới hạn; cho rời màn hình theo cảnh báo đang có |
| Hết ngân sách polling, mạng/5xx hoặc lỗi tạo link | Dùng lỗi inline hiện có; không mở ticket, không gán FAILED | “Thử lại” đọc trạng thái mới trước; chỉ tiếp tục link nếu đơn vẫn payable |
| 401/403 | Không mở ticket; theo auth/lỗi quyền hiện có | Dừng polling, theo auth flow; không mời trả lại đơn bị cấm |
| 404 | Không mở ticket; lỗi inline hiện có | Không tạo link/checkout; cho về Courses |

Contract không có `OrderStatus=FAILED` hay `PaymentStatus=FAILED`. CANCELLED hiển thị FAIL là trạng thái trình bày, không được thêm enum backend. PAID ưu tiên hơn countdown và mọi lỗi cũ; phản hồi phiên/đơn trước không được ghi đè.

## Tiêu chí nghiệm thu chung

Đối chiếu theo [bằng chứng UI](../../PROGRESS/PHASE_05_PAYMENT_RESULT/UI_REVIEW.md); fixture không chứng minh API thật.

- [x] Ticket theo ảnh mới owner cung cấp; có bản chạy đối chiếu màn thường/320dp/font 1.3×. (Ảnh ticket owner bổ sung ngày 2026-10-22.)
- [x] Ticket thành công chỉ xuất hiện theo PAID; CTA về STUDENT_HOME, Back không mở lại QR đã trả.
- [x] CANCELLED/EXPIRED có retry về Courses đúng nhánh trong UI fixture; không tự tạo checkout/khôi phục giỏ.
- [ ] Poll có backoff/giới hạn; dừng khi kết thúc, mất quyền, rời màn hình, nền app, logout/đổi user.
- [x] Dữ liệu lớp/lịch/detail/preview được làm mới theo scope hiện tại; không optimistic enrollment.
- [ ] Ba ticket PAID/CANCELLED/EXPIRED, i18n Việt/Anh, accessibility và Reduce Motion được kiểm tra.
- [ ] Owner duyệt UI trước API; API thật có bằng chứng riêng; owner UAT riêng.
- [x] Jest/lint/format/type-check và Maestro phù hợp đạt, ghi rõ giới hạn native/backend/iOS.

Nhật ký và bằng chứng: [PROGRESS](../../PROGRESS/PHASE_05_PAYMENT_RESULT/README.md). Chỉ tick theo bằng chứng thực tế và đồng bộ theo B.7.1; không chuyển Done trước UAT owner.

Phạm vi các mục UI đã tick: fixture/callback, không phải thanh toán thật. Xem UI_REVIEW và ảnh ticket mới. Success chỉ theo backend PAID; polling/cache/auth đã triển khai và kiểm tra bằng unit/MSW, chưa có đơn backend thật; accessibility/Reduce Motion đạt một phần theo báo cáo. Không tự xác nhận UI/UAT.

Phạm vi cuối theo owner ngày2026-10-22: chỉ ba ticket PAID/CANCELLED/EXPIRED; đã bỏ pending/review/loading/empty/error/forbidden/notFound khỏi component, model UI, i18n và preview. Enum/backend và xử lý QR không bị xoá. Các bằng chứng10trạng thái trước đây chỉ là lịch sử; xem UI_REVIEW cho bản ba trạng thái.

Bản API hiện tại: [API_REVIEW](../../PROGRESS/PHASE_05_PAYMENT_RESULT/API_REVIEW.md). Owner đã duyệt UI và xác nhận UAT Done trong chat. Các mục đã tick theo unit/MSW không thay bằng chứng backend/native thật còn thiếu.

Xác nhận cuối: owner “UAT tôi xác nhận done”. Đây là xác nhận nghiệm thu của owner, không phải lần chạy test mới của AI. Các checkbox ghép còn thiếu bằng chứng backend/native/iOS giữ chưa tick; không tự suy diễn toàn bộ ca UAT đã được ghi log chi tiết. Lịch sử và giới hạn tại PROGRESS.

Dọn dẹp sau UAT đã hoàn tất: [báo cáo và kiểm tra mới](../../PROGRESS/PHASE_05_PAYMENT_RESULT/POST_UAT_CLEANUP.md). Phase giữ Done; checklist kỹ thuật và giới hạn bằng chứng trên không thay đổi.
