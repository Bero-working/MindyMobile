# 3.6 Tích hợp API Student Learning

## Cập nhật owner — 2026-10-20

Owner duyệt ADR-0030 và cho phép gắn API Phase3 trong chat. Lịch học chỉ xem: row buổi là View, không button/onPress/điều hướng session; giữ chọn ngày/đổi tuần/xem nội dung/làm mới. Detail/session mở từ Home hoặc Lớp của tôi. Đây là quyết định UI mới ưu tiên các luồng lịch→session mô tả bên dưới. Tại mốc 2026-10-20, API/route bắt đầu In progress. Cập nhật 2026-10-21: owner đã duyệt UAT, sub-phase Done.

## Bước và điều kiện

API, Done (owner duyệt UAT ngày 2026-10-21). Đã triển khai service/schema/query/route, có MSW/native/backend smoke và giới hạn tại API_REVIEW; Chỉ bắt đầu khi có liên kết xác nhận UI của owner tại [PROGRESS](../../PROGRESS/PHASE_03_STUDENT_LEARNING/README.md) theo ADR-0021. ADR-0030 cần Accepted cho thay đổi navigator. Không thêm dependency, không đổi HTTP/auth infrastructure hoặc gọi route PLANNED.

## API và mapping

| Nhu cầu | Endpoint / contract | Ghi chú |
| --- | --- | --- |
| Hiện tại/lịch sử | GET me/classes — §14.1 | view, page, pageSize; key enrollmentId |
| Xác minh quyền khi vào lớp từ Home/danh sách | GET me/classes — §14.1 | view=all; courseId nếu nguồn có, lấy tiếp trang tới khi đủ; không tự tạo route me/classes?classId |
| Detail | GET me/classes/:classId — §14.2 | FULL; không thay bằng public classes/:classId |
| Xem trước | GET me/classes/:classId/preview — §14.3 | CASH_PREVIEW, tuyệt đối không meetingUrl |
| Lịch tuần | GET me/schedule — §14.4 | from/to ISO offset, pageSize100, includeCancelled=true, đủ trang |
| Tài khoản/logout | auth/me; auth/logout — §6.7/6.6 | Tái sử dụng session/actions đã có |
| Tiếp tục đơn cũ | GET me/orders/:id, POST me/orders/:id/payments/payos | PaymentRoute/service Phase 2; chỉ sau kiểm tra order và requiresReview |

Nguồn: [my-classes.md](../../API_CONTRACT/my-classes.md), [auth.md](../../API_CONTRACT/auth.md), [orders-payment.md](../../API_CONTRACT/orders-payment.md), [cache và PLANNED](../../API_CONTRACT/README.md). Đối chiếu môi trường backend trước gọi endpoint; thiếu triển khai thực tế ghi Blocked đúng phần, không bù bằng dữ liệu giả.

## Ràng buộc dữ liệu

- Tách module `schedule`, `account`, `my-classes`; detail có thể nằm trong my-classes. Schema Zod theo DTO, service gọi Http có sẵn, query/controller xử lý trạng thái; màn render view model. Không đổi schema chỉ để khớp fixture.
- Dùng StudentScope hiện có; query key gồm user/role, view/filter/range/page/classId/accessMode. Detail dùng một snapshot quyền đã xác minh có union FULL/CASH_PREVIEW theo scope/classId; không cache độc lập response endpoint cũ hoặc gộp trường từ hai quyền. Snapshot mới thay toàn bộ snapshot cũ, preview strip meetingUrl root/session bằng Zod; dữ liệu private/no-store chỉ trong bộ nhớ, gcTime0 cho detail chứa link, không persist. Khi vào/focus/refetch phải xác minh quyền lại trước bật link.
- Nguồn list cũ hoặc navigation hint không đủ cấp quyền. Khi vào detail, lấy quyền mới; nếu nhiều enrollment cùng classId, không lấy bừa enrollment đầu hoặc enrollment lịch sử để hạ/nâng quyền; dùng quyền hiện tại nhất quán và protected endpoint xác minh cuối. Không có quyền rõ thì không hiển thị link.
- 403 CLASS_ACCESS_DENIED/CLASS_PREVIEW_DENIED: loại detail/link, refetch list; nếu quyền chuyển hợp lệ thì lấy endpoint mới đúng một lần; còn denied → màn giải thích + về list, không loop/retry403. 404 CLASS_NOT_FOUND → trạng thái không tìm thấy. 401 theo auth flow có sẵn, không retry vô hạn.
- Schedule `SCHEDULE_CLASS_ACCESS_DENIED` nếu tương lai có class filter: bỏ filter, refetch My Classes theo contract; bản đầu không gửi classId. Không poll lịch/list/detail; refetch khi focus, pull-to-refresh, quay lại từ QR và sau mutation liên quan.
- Lịch lấy hết trang, dedupe sessionId; giữ thứ tự startsAt ASC/sessionId ASC, nhóm theo timeZone và ngày địa phương của buổi. Buổi qua nửa đêm giữ giờ bắt đầu/kết thúc đầy đủ, không nhân đôi vào cả hai ngày. Range≤31ngày; đổi tuần huỷ/bỏ response cũ bằng signal/query key. Lỗi trang tiếp theo không thành empty/success đầy đủ.
- My Classes pagination incremental theo enrollmentId; đổi view reset cursor/page và không trộn current/history. Metadata nhóm thiếu không chặn quyền detail; không fetch N public course details chỉ để dựng folder.
- Tiếp tục PAYOS: trước tạo/link lại, refetch list và order; requiresReview=true hoặc order không PENDING/PAYOS thì không gọi link, hiển thị trạng thái và tải lại lớp. Đơn có hạn đã hết cần thông báo tương ứng; server là nơi quyết định, không dùng đồng hồ máy cấp quyền. Không POST checkout lần nữa. Không thêm nút “Đã thanh toán” hoặc poll PAID. Sau Back/refocus refetch classes/schedule/detail thay vì tự đổi trạng thái.
- Checkout ở Phase 2 invalidate query classes/schedule/detail hiện có trong bộ nhớ; không cần tải các màn chưa mở. Logout/đổi tài khoản clear cache và huỷ request, reset expanded/week/modal chứa dữ liệu riêng tư.

## Task — Red → Green theo tầng

### 3.6.1 Schema, service và phân trang lớp
- MSW/test: current/history/all, page/query đúng, grouping nhiều trang, cùng classId nhiều enrollment, null order/mentor, quyền lạ, lỗi mạng/schema, không gửi studentId.
- Query/controller test: scope khác nhau không chia sẻ data, đổi view không dính response cũ, refresh giữ đúng vùng, footer retry không mất trang trước.

### 3.6.2 Lịch tuần
- Test offset +07:00 encode đúng, khoảng tuần qua tháng/năm và đủ trang>100buổi; response timezone, session qua nửa đêm, cancelled, lỗi trang2, đổi tuần nhanh, focus không poll.
- Fixture đồng hồ cố định chỉ để test lịch; asOf dùng cho quyền, không giả clock production.

### 3.6.3 Detail/preview và hành động học
- Test FULL→preview/NONE sau denial, preview→FULL, repeated403 dừng,404, sessionId thiếu, không URL trong preview cache/params, URL invalid và failure Linking. Không log URL/profile.
- Integration Home→đúng session, schedule chỉ xem, My Classes history không vượt quyền; account dùng auth/me, logout reset cache/stack.

### 3.6.4 Đơn cũ và làm mới sau checkout
- Test pending PAYOS mở đúng orderId và không checkout; requiresReview chặn POST link (kể cả trạng thái đổi sau rời list); CASH/PAID/EXPIRED/CANCELLED không tạo link.
- Hồi quy Phase 2 catalog/cart/checkout; query invalidation và quyền mới khi quay về app, không tự tạo enrollment.

### 3.6.5 Android và backend thật
- Tài khoản STUDENT được owner cho dùng, lớp đủ trạng thái nếu môi trường có: list, lịch, FULL, CASH_PREVIEW, denial và QR đơn cũ. Không tạo/xác nhận thanh toán hay user thật chỉ để lấy bằng chứng nếu chưa được giao.
- Chụp màn, requestId/code khi lỗi, ghi dữ liệu nào có/không có để tái hiện. Không log credential/cookie/meetingUrl. Native thiếu trạng thái nào ghi chưa kiểm tra; MSW không thay chứng cứ backend.

## Nghiệm thu

- [x] Link UI approval và ADR đủ trước thay đổi phụ thuộc (chat owner2026-10-20, nhật ký phase).
- [x] Test tự động đạt; auth/courses/cart/payment không hồi quy trong60suites284tests.
- [x] Bằng chứng backend/native và giới hạn trong PROGRESS/API_REVIEW.md; chưa có dữ liệu thực tế FULL/CASH/PAYOS để native kiểm, không tự đánh dấu UAT.


## Cấu trúc triển khai và quyết định

- `my-classes/schemas/learning.schema.ts`, `services/learning.service.ts`: DTO trực tiếp, list từng trang100; xác minh detail lấy đủ view=all, ưu tiên ACTIVE/FULL rồi CASH_PREVIEW hợp lệ, protected endpoint kiểm quyền cuối. Denial refetch list và chỉ chuyển endpoint một lần khi accessMode đổi.
- `hooks/useLearningQuery.ts`: key scope/generation/view/classId; list infinite theo enrollmentId, giữ trang cũ khi lỗi load-more. Query detail chỉ đưa data ra khi success và không fetching, tránh link FULL cũ trong focus/refetch/denial; không persist, gcTime0. Snapshot quyền union thay toàn bộ response thay vì hai cache endpoint dễ tái dùng nhầm.
- `schedule/services/schedule.service.ts`, `hooks/useScheduleController.ts`: đủ trang, includeCancelled=true, dedupe/sort sessionId, timezone/range validate, không thành partial success nếu trang sau lỗi. Range ISO UTC tương đương offset theo timezone response, xử lý ranh giới DST; không gửi classId/studentId. SESSION_MAKEUP trong Swagger được bỏ qua như Home hiện tại vì ngoài phạm vi FULL/CASH_PREVIEW.
- `LearningRoutes.tsx`: route adapters, focused query enable/refetch, Tab navigate pop=true tránh lặp screen đã tồn tại; tham số chỉ ID/origin. Class detail route không tin accessMode từ route. Account auth/me và logout dùng module auth hiện có.
- Payment param `origin: learning`: preflight list/order trước link và mỗi retry. Đơn expired/CASH/PAID/CANCELLED/requiresReview không tạo link; không gọi checkout. Query resume tách key khỏi checkout; leave về nguồn nếu còn stack. Checkout invalidate student-learning cùng scope.
- Không thêm dependency; ngoại lệ navigator/ARCHITECTURE theo ADR-0030 Accepted. Không lưu credential/URL nhạy cảm vào docs/log test. Backend smoke chỉ đọc các dữ liệu được cấp quyền; không tạo enrollment/giao dịch để dựng bằng chứng.
