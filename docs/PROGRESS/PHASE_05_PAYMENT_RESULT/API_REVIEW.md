# Bàn giao API Phase 5

## Kết quả

Owner xác nhận trong chat ngày 2026-10-22: “UI đã duyệt, bây giờ nối API đi”. AI Codex đã nối dữ liệu backend vào ticket đã duyệt, giữ đúng PAID (SUCCESS), CANCELLED (FAIL), EXPIRED. Không thêm ticket khác, route, dependency hoặc sửa hạ tầng khoá. Nhật ký @Bero theo handle owner đã xác nhận.

`PaymentRoute` đọc `usePaymentQuery` theo orderId/origin/focus. Runner `watchPayment` GET `/me/orders/:orderId` trước; chỉ đơn PAYOS/PENDING, chưa đối soát/thành công và còn hạn mới được lấy hoặc tạo link bằng endpoint hiện có. QR đã có trong GET được tái sử dụng. Điểm vào learning kiểm tra enrollment trước thao tác link; đơn PAID được đọc trước kiểm tra tiếp tục thanh toán cũ để vẫn hiện success.

PAID mở ticket thành công, CTA/Back reset stack chỉ còn STUDENT_HOME. CANCELLED/EXPIRED mở ticket đơn đóng và về Courses để chọn lại, không tự checkout/khôi phục giỏ. Ticket chỉ hiện khi route đang focus để lớp native không che Courses sau điều hướng. `payment.status=SUCCEEDED`, countdown hoặc URL không tự tạo success/EXPIRED.

Review ưu tiên hơn ticket đơn đóng, không QR hoặc nút retry thanh toán; hiển thị inline. Nếu POST trả review trong khi GET tạm thiếu payment, giữ trạng thái review đã nhận từ backend, kiểm tra lại PAID và không mời trả lần nữa. PAID vẫn có ưu tiên cao nhất. Lỗi mạng/timeout/quyền vẫn inline theo giao diện hiện có; không tạo ticket lỗi mới.

## Polling, retry và dữ liệu

- Một chuỗi request tuần tự, GET sau 3s → 5s → 10s, tiếp tục 10s; không POST trong các lần poll. Deadline 120s bao gồm thời gian request, tách khỏi backoff tạo link CREATING tối đa 30s. Request có timeout theo ngân sách và AbortSignal.
- Dừng khi đơn kết thúc/review, lỗi/quyền/auth, blur/unmount, app background, logout/đổi session. Foreground/focus bắt đầu xác minh mới; PAID đã xác nhận trong cache của cùng scope được giữ. Không phản hồi cũ ghi đè user/order mới hoặc PAID.
- Retry thủ công GET trước POST và khoá bấm lặp. POST409 GET lại để bắt PAID đến muộn; nếu chưa đủ điều kiện không tiếp tục tạo link. Refetch lỗi giữ thông tin đơn/lỗi inline, không biến thành ticket FAIL.
- DTO nằm trong TanStack Query, key có userId/generation/orderId/origin. PAID invalidate learning (classes/schedule/detail/preview), cart, Home schedule và orders trong scope hiện tại, một lần; không optimistic enrollment/FULL và không clear cache toàn app. Refetch thất bại không xoá ticket PAID; auth mất hiệu lực vẫn theo guard phiên hiện có.
- Service GET kiểm tra schema và id khớp đơn yêu cầu; không dùng DTO đơn khác. Không gọi callback `/payment-result` hoặc đăng ký deep link ngoài app trong phạm vi QR này.

## Bằng chứng

Môi trường: Windows, React Native debug/Metro, Pixel_8 API37. Revision: HEAD `76f7b42` cộng working tree ngày 2026-10-22 (+07:00). Chưa commit/push/PR/CI mới. Các thay đổi auth/env/navigator/docs/E2E có sẵn trước lượt này được giữ nguyên.

| Kiểm tra | Kết quả và phạm vi |
| --- | --- |
| Toàn bộ Jest | **69 suite / 358 test PASS** sau bản API cuối |
| Integration route + MSW | **9 test PASS**: ba ticket × checkout/learning, QR poll→PAID, review inline, blur gỡ lớp ticket; không HTTP thật |
| Polling runner + MSW | **16 test PASS**: lịch/backoff/deadline/network chậm/abort/terminal/403/404/503/409/auth refresh/review/SUCCEEDED chưa PAID |
| Hook + MSW | **18 test PASS**: retry GET trước POST, double tap, review, blur/focus, background/foreground, logout, đổi order bỏ phản hồi cũ, invalidate đúng user và lỗi refetch không che success |
| Mapping và service | Mapping **8 test PASS**; service **10 test PASS**, gồm schema/identity. Counterpart integration checkout đã đổi assertion EXPIRED sang ticket và PASS |
| Coverage phần mới | 52 test mapping/hook/runner/service PASS; lines **97.10%**, branch **88.44%**. Hook usePaymentQuery lines98.66%, watchPayment96.38%, service95.45%, mapping100%; vượt mục tiêu80% dòng. Lượt coverage chạy song song toàn bộ test trước đó có một timeout khởi động integration; bộ integration đã PASS trong full run, coverage cuối chạy riêng phần cần đo và PASS |
| Lint/format/type-check | PASS; lint0error, 1warning có sẵn tại my-classes/ClassDetailScreen.test.tsx:183, ngoài phase |
| Android regression | `e2e/flows/payment-result.yaml` **PASS**, ba ticket, CTA/Back; dùng preview fixture. Ảnh ở evidence/api-regression. Đây là kiểm tra native UI, không phải xác nhận backend thật |
| Backend đang cấu hình | GET `/auth/me` thật không cookie trả **HTTP401**, xác nhận endpoint yêu cầu đăng nhập; không chứng minh kết quả thanh toán |
| Backend PAID/đóng/review thật | **Chưa kiểm tra**: chưa có phiên Student/dataset đơn phù hợp trong lượt này. Không chuyển tiền thật hoặc giả bằng chứng backend bằng MSW |
| iOS/TalkBack/Reduce Motion | iOS chưa có môi trường; giới hạn kiểm tra accessibility native trước đó giữ trong UI_REVIEW, không tick toàn mục theo test xanh |

## Cách kiểm tra với backend test

Flow [API thật](../../../e2e/api/payment-result.yaml) đã chuẩn bị, chưa chạy vì thiếu dataset. Owner đăng nhập Student test, vào PAYMENT từ checkout hoặc learning và chuẩn bị đơn backend có kết quả mong muốn, không cần chuyển tiền thật. Dùng locale Việt, truyền RESULT_STATUS=PAID/CANCELLED/EXPIRED cho flow. Ticket phải tự xuất hiện theo GET; PAID về Home và Back không QR; hai đơn đóng về Courses.

Kiểm tra thêm pending qua120s, background/focus, mất phiên/quyền, review và API lớp/lịch lỗi theo [UAT](../../IMPLEMENT/PHASE_05_PAYMENT_RESULT/PHASE_05_99_User_Acceptance.md). Pending/review không có ticket, review không trả lại. Không tự khôi phục tag cart-checkout-qr đang hoãn trong CI; không thay workflow.

## Trạng thái bàn giao

UI owner approval **Done**. Owner sau đó xác nhận “UAT tôi xác nhận done” trong chat ngày2026-10-22: API5.3, UAT5.99 và Phase5 **Done**. Giới hạn bằng chứng AI về native/backend thật ở5.3.4 và iOS giữ nguyên; xác nhận UAT không tạo ra test log/dataset mới. Xem manifest `evidence/api-source-sha256.txt` để định danh code bàn giao. Không có PR/run mới và không merge.

Test race cuối Red→Green: khi session đổi đúng lúc GET được publish, runner kiểm tra scope trước thao tác tiếp theo và không POST. Lượt Red ghi nhận1POST; bản sửa0POST, full358test PASS. File `evidence/api-coverage-final.json` lưu số đo chi tiết bốn file; manifest API gồm26file trong phạm vi. JS của báo cáo HTML coverage sinh tạm đã dọn riêng để không tạo cảnh báo lint ngoài code; không sửa ignore/cấu hình hạ tầng.
