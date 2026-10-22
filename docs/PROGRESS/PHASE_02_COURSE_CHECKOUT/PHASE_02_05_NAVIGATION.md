# Tiến độ 2.5 — Điều hướng và kiểm thử luồng UI

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.

### 2026-10-18 00:21 (+07:00) · @Bero
- Phase: 2.5.1 Route và điểm vào
- Trạng thái: In progress
- Đã làm: AI đăng ký COURSES/PAYMENT chỉ cho STUDENT, guard trong route; Home dùng common components, nút giỏ/mũi tên/tab/Khám phá đã nối. Preview Home và Khoá học cùng mở sheet và đi tới QR; không tạo auth session.
- Test: Jest flow ghép PASS, route guard guest PASS, production Home navigate COURSES PASS; tổng Jest 160/160. Lint/format/type-check PASS.
- PR / commit: Chưa tạo.
- Ghi chú: Production Phase 2 chưa có adapter API (2.6 Todo theo ADR-0021); trạng thái lỗi trước adapter không phải lỗi backend đã xác minh. PaymentRoute chưa tải order; QR UI chỉ nhận props trong preview/test tới khi UI được duyệt.

### 2026-10-18 00:38 (+07:00) · @Bero
- Phase: 2.5.2 Kiểm thử thiết bị và đối chiếu
- Trạng thái: In review
- Đã làm: AI chạy catalog/filter/pagination/course/cart/QR, Home arrow/cart/tab, trạng thái catalog và carousel; mở xem ảnh so với 4 ảnh nguồn và bản trích artifact. Bàn giao UI_REVIEW.md và ảnh canonical evidence/*.png.
- Test: Android cả 7 flow có lượt PASS. Lượt toàn e2e/flows ban đầu 6/7, courses-browse gián đoạn vì Fast Refresh đưa về menu; chạy lại courses-browse PASS (58s), phase-two-review PASS (66s), rồi final-visual PASS. Checkout mặc định cuối tại evidence/handoff-final PASS; checkout 320dp/chữ 140% tại evidence/compact-final PASS đủ chọn lớp, QR, Back, copy/toast, rời và giỏ rỗng.
- PR / commit: Chưa tạo.
- Ghi chú: Giữ raw evidence cả Red/Green. Đã khôi phục wm size 1080x2400 và font_scale=1.0. iOS/TalkBack/Reduce Motion native thủ công chưa kiểm tra.


### 2026-10-18 02:00 (+07:00) · @Bero
- Phase: Owner xác nhận UI sub-phase
- Trạng thái: Done (bước UI)
- Đã làm: Owner duyệt UI Phase 2 trong chat: “UI tôi approve”; bằng chứng và phạm vi tại README phase, entry cùng thời gian.
- Test: Kế thừa kiểm tra UI đã bàn giao; chỉ cập nhật tài liệu.
- PR / commit: Chưa tạo.
- Ghi chú: Không phải xác nhận UAT; API 2.6/UAT 2.99 Todo.

### 2026-10-18 19:26 (+07:00) · @Bero
- Phase: Mở lại Phase2/UAT2.99 và sửa E2E thiếu APP_ID
- Trạng thái: In review — chờ owner UAT
- Đã làm: Owner rút xác nhận trước: “Test e2e đã fail (tôi chưa check kĩ, chuyển trạng thái phase 2 tiếp tục chờ UAT, đồng thời fix e2e)”. Phase2 và2.99 trở lại In review trong roadmap/README/UAT. Giữ xác nhận UI và code API, không tự coi test xanh là UAT. Lệnh package hiện chỉ maestro test e2e/flows, cả9flow dùng APP_ID chưa có default nên launch package undefined. Thêm fallback APP_ID || com.mindymobile trong17flow (mặc định9flow,API/accessibility/visual), vẫn cho CLI -e override. Cập nhật spec2.5 và CONTRIBUTING, giữ script package và hạ tầng không đổi.
- Test: Đang chạy npm run test:e2e không truyền APP_ID trên Android, output tại evidence/e2e-default-app-id. Kiểm tra định dạng phát hiện cần quote biểu thức YAML theo Prettier, sẽ chuẩn hoá sau lượt chạy.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Entry Done19:21 là lịch sử và không còn trạng thái hiện tại. UAT mới chưa được owner xác nhận. Bộ mặc định dùng preview và clearState; không checkout API thật trong lượt hồi quy này.

### 2026-10-18 19:34 (+07:00) · @Bero
- Phase: Hoàn tất sửa E2E default APP_ID, tiếp tục chờ UAT
- Trạng thái: In review — chờ owner UAT
- Đã làm: Cả17flow dùng appId: APP_ID || com.mindymobile; lệnh npm run test:e2e không cần -e nữa. Giá trị CLI vẫn được ưu tiên. Giữ package script, không sửa hạ tầng/thêm dependency; CONTRIBUTING đã hướng dẫn lệnh mặc định và cách ghi đè. Roadmap/README/UAT đều thể hiện Phase2 chưa được duyệt lại.
- Test: Chạy npm run test:e2e không truyền APP_ID (chỉ thêm thư mục lưu bằng chứng): 9/9 Flows Passed trong7m12s. Bao gồm api-health, app-launch, auth-ui-login/register, carousel-autoplay, cart-checkout-qr, course-class-scroll (cả kéo handle đóng), courses-browse, student-home-ui. Raw evidence/e2e-default-app-id; summary.json ghi từng flow. Smoke app-launch với -e APP_ID=com.mindymobile cũng PASS, evidence/e2e-explicit-app-id. Prettier17YAML và git diff --check PASS. Không đổi TypeScript/runtime nên không chạy lại Jest/lint/type-check trong lượt chỉ sửa YAML/docs này.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Đính chính entry19:26: Prettier chỉ chuẩn hoá line endings/định dạng, không cần quote biểu thức appId thêm. Mọi kiểm tra trên Android, chưa iOS. API/accessibility/visual ngoài9flow chỉ được cập nhật fallback, chưa chạy lại. Test đạt không thay owner UAT; Phase2/2.99 giữ In review.


### 2026-10-22 09:25 (+07:00) · @Bero-working (Codex)

- Phase: Đồng bộ tiêu chí sau tổng kết test/AI review theo yêu cầu owner.
- Trạng thái: Done theo UAT owner đã có; giữ các giới hạn kiểm chứng, không ghi nhận UAT mới.
- Tiêu chí: tick bổ sung 3 mục đủ bằng chứng đã ghi; 0 mục giữ chưa đủ bằng chứng và nêu lý do trong IMPLEMENT/bảng đối chiếu.
- Test: Chỉ rà hồ sơ, không chạy lại app/Jest/Maestro/backend; không biến kết quả lịch sử hoặc owner approval thành lượt test mới.
- Đồng bộ: [IMPLEMENT](../../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_05_NAVIGATION.md) và [bảng đối chiếu](../ACCEPTANCE_SYNC_2026-10-22.md); nhật ký cũ giữ nguyên.
