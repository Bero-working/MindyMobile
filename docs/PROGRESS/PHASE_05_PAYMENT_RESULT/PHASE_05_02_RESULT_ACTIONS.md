# Tiến độ 5.2 — Home và retry

Nhật ký chỉ ghi thêm cho các task 5.2.x. Chưa triển khai; Todo, thực hiện sau 5.1 bằng fixture/callback trước bước API. Chưa có owner xác nhận UI.

### 2026-10-22 14:45 (+07:00) · @Bero
- Phase: 5.2.1 Thành công về Home — AI Codex.
- Trạng thái: In review.
- Đã làm: adapter reset stack về STUDENT_HOME trong module payment, gắn callback sẵn ở PaymentRoute (cả hai origin dùng chung), UI fixture giữ modal đến khi CTA/Back; không nối result vào query trước owner UI approval.
- Test: Red thiếu adapter/background → Green; unit reset chỉ còn Home; component CTA một lần và QR bị cô lập; Maestro fixture success CTA/Back về Home rồi Back không mở lại QR đạt.
- Tiêu chí: callback/adapter đạt; hành trình backend thật từ checkout và learning chưa kiểm tra, thuộc 5.3. Preview Home là dữ liệu mẫu, không giả phiên.
- Đồng bộ: IMPLEMENT 5.2/README/roadmap đang In progress cho bước UI; API/UAT Todo.
- Revision: HEAD 76f7b42 + working tree, Windows Android API37, chưa commit.

### 2026-10-22 14:45 (+07:00) · @Bero
- Phase: 5.2.2 Retry và trạng thái chờ — AI Codex.
- Trạng thái: In review.
- Đã làm: đơn đóng về Courses, pending/error chỉ gọi callback kiểm tra, review chỉ Home, forbidden rời màn và notFound/empty về Courses. Callback async khoá bấm lặp, giữ nội dung khi lỗi và cho kiểm tra lại; không HTTP/checkout/khôi phục giỏ.
- Test: unit 10 mapping + modal Back/CTA/duplicate/rejection/English đạt; Maestro expired→Courses, pending→success, review không retry, error cập nhật requestId và Back ở lại/rời đạt.
- Tiêu chí: UI/callback đạt trong phạm vi fixture; xác minh GET trước POST/race/auth backend giữ Todo ở 5.3.
- Đồng bộ: IMPLEMENT 5.2; native compact/gallery đang chạy; owner UI/UAT chưa xác nhận.
- Revision: HEAD 76f7b42 + working tree; Windows, Android API37.

### 2026-10-22 14:59 (+07:00) · @Bero
- Phase: 5.2.3 Preview và bàn giao UI — AI Codex.
- Trạng thái: In review — chờ owner xác nhận UI.
- Đã làm: preview development10 trạng thái, ticket theo ảnh mới, hướng dẫn mở/đối chiếu và bảng bằng chứng UI_REVIEW. Native main flow và gallery compact đã chạy đạt; chuyển ca gallery qua tools→menu để chờ navigation ổn định.
- Test: Maestro main PASS, gallery PASS10trạng thái/19ảnh ở320×640dp/font1.3; toàn repo66suite/338test, lint/format/type-check PASS với1warning có sẵn ngoài phase.
- Tiêu chí: callback retry/pending/review đạt fixture; success adapter reset/CTA/Back đạt unit và native preview. Hai origin backend thật, polling/cache/auth/GETtrướcPOST chưa kiểm tra, thuộc5.3; owner UI approval/API/UAT chưa có.
- Đồng bộ: checklist5.2 tick riêng phần đủ bằng chứng, mục success hai origin thật và mục có owner confirmation giữ chưa tick; README/roadmap In review. API5.3/UAT5.99 Todo.
- Revision: HEAD76f7b42 + working tree; chưa commit/push/PR/CI mới.

### 2026-10-22 15:08 (+07:00) · @Bero
- Phase: 5.2 Thu gọn và kiểm tra ba ticket — AI Codex.
- Trạng thái: In review, chờ owner duyệt UI.
- Đã làm: chỉ PAID về Home, CANCELLED/EXPIRED thử lại về Courses; bỏ các nhánh ticket khác, callback kiểm tra lại và fixture/i18n/test tương ứng. Thiết kế ticket mép xé theo ảnh được giữ.
- Test: toàn repo66suite/317test PASS, module payment45test PASS; lint0error/1warning ngoài phase, format/type-check PASS. Maestro ba trạng thái PASS trên Android màn thường; gallery ba trạng thái PASS320×640dp/font1.3×, sáu ảnh top/actions; emulator đã khôi phục.
- Tiêu chí: callback/Back/double tap/nguồn ảnh/layout/i18n và cuộn chữ lớn có bằng chứng. API hai origin thật, polling/cache/auth còn5.3; TalkBack/iOS/Reduce Motion native chưa đủ bằng chứng.
- Đồng bộ: IMPLEMENT5.1/5.2/5.3/README/UAT, roadmap và UI_REVIEW; ảnh cuối three-results-normal/three-results-compact. API5.3/UAT5.99 Todo; chưa owner UI approval.
- Revision: HEAD76f7b42 + working tree; không commit/push/merge.
