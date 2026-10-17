# Tiến độ 1.1 — Thiết kế Claude và nền UI

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.

### 2026-10-17 15:01 (+07:00) · @LogKoNger
- Phase: 1.1.1 Xác nhận thiết kế và asset gốc
- Trạng thái: Blocked
- Đã làm: AI đối chiếu DESIGN_SOURCE và ảnh đã có; mở lại Auth public artifact, xác nhận Welcome và mascot còn hiển thị. Kiểm tra menu không có Download/Export; mở iframe trực tiếp bị chuyển về wrapper. Thử tải ảnh gốc bằng downloadMedia, công cụ từ chối blob trong embedded frame. Lập references/SECTION_MAP.md cho các section Auth/Home 2a, nguồn dữ liệu, callback và giới hạn preview/production. Chưa xác nhận lại trực tiếp Home 2a trong lần này; dùng bản ghi nguồn đã có.
- Test: Task khảo sát tài liệu không có test production. Không lấy được asset gốc nên chưa đạt tiêu chí asset; không có bằng chứng UI native mới. Kiểm tra diff whitespace.
- PR / commit: Chưa tạo.
- Ghi chú: ADR-0018 đã Accepted, không còn chặn quyền navigator/shared UI. Cần file mascot gốc hoặc export thiết kế; screenshot tham chiếu không thay thế asset cuối. Chưa chuyển sang task 1.1.2.

### 2026-10-17 15:04 (+07:00) · @LogKoNger
- Phase: 1.1.1 Xác nhận thiết kế và asset gốc
- Trạng thái: Done
- Đã làm: AI đọc HTML hai artifact bằng công cụ Artifact `read` (Auth version 1792222520-e878, Home version 1792222488-748f). Ảnh gốc nằm dạng base64 trong `__bundler/manifest`; giải mã bằng script Python ngoài repo, chỉ đọc dữ liệu, không chạy script bundle. Lưu 4 PNG RGBA vào IMPLEMENT/PHASE_01_AUTH_HOME_UI/references/assets/: mindy-mascot-laptop.png 540×432 (Auth và Home cùng SHA-256 90c3a326…), mindy-mascot-map.png 170×175, mindy-mascot-book.png 137×164, student-certificate.png 471×502. Đối chiếu vị trí dùng trong template (hero, slide map/book/laptop/photo, thông báo rỗng). Xác nhận Home mục 2/2a vẫn còn trong version đã đọc. Cập nhật DESIGN_SOURCE, SECTION_MAP, spec 1.1 và README phase.
- Test: Task khảo sát tài liệu, không có test production. Kiểm tra kích thước, kiểu màu RGBA và hash của từng file; xem trực quan mascot là ảnh nền trong suốt, không phải ảnh cắt từ screenshot.
- PR / commit: Chưa tạo.
- Ghi chú: Mascot bản đồ/sách độ phân giải thấp (~45–57dp @3x); ảnh học viên là người thật, cần owner xác nhận quyền dùng. Asset chưa copy vào src/assets; làm khi triển khai 1.1.3/1.2. Tiếp theo task 1.1.2.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.1.2 Component nền tảng
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Nativecn Button/Input/Skeleton với nguồn upstream; PressableScale, CoverImage, ScreenState và SVG/FastImage interop. Nút pending/disabled chặn callback, Input forward ref và toggle giữ giá trị, ảnh null/lỗi có fallback và phục hồi khi URL đổi. Giữ token/font, không thêm dependency.
- Test: 5 test shared UI xanh; RED ban đầu thiếu module, test selected-state RED vì caller state bị mất rồi GREEN. Skeleton tĩnh không có animation loop; PressableScale dùng useReducedMotion và motion token. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.1.3 Shell Auth
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Safe area, KeyboardAvoidingView, ScrollView, nền pastel, panel trắng bo góc và mascot gốc laptop. Đã xem asset, copy nguyên file và đối chiếu SHA-256 90c3a326… trùng reference. Tái dùng ảnh gốc có sẵn trong workspace; không tự nhận là đã trích asset trong phiên triển khai này.
- Test: Test children/CTA và test mascot trang trí accessible=false xanh; test mascot đã RED khi chưa có ảnh mặc định. Không dùng ảnh học viên chưa được xác nhận quyền dùng. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:46 (+07:00) · @LogKoNger
- Phase: AI tự kiểm tra sub-phase và bàn giao UAT
- Trạng thái: In review
- Đã làm: Hoàn tất phần UI trong phạm vi; dùng mascot gốc, không dùng ảnh học viên chưa xác nhận quyền. Review độc lập phát hiện focus field lỗi và accessibilityState của Button; đã sửa với test RED→GREEN. Kiểm tra native phát hiện stylesheet cũ và tên course bị lặp trong fallback; đã reset Metro, bỏ tên lặp, giữ vị trí caption. Button dùng đủ chiều ngang cho label; intro giữ vùng ảnh placeholder, about có giấy nghiêng/băng dính/góc gấp. Không thêm dependency hoặc sửa auth/backend Foundation.
- Test: Jest cuối 20 suite/97 test xanh; lint:rules, lint:code-format, lint:type-check xanh. Maestro Android 5/5 flow chính; fontScale1.3 + animator_duration_scale0 1/1, đã khôi phục font1.0 và animator không đặt (null). Kiểm tra riêng Login 1/1 và Home 1/1 sau sửa UI; báo cáo trong evidence/. Native screenshot đối chiếu đã có.
- PR / commit: Chưa tạo.
- Ghi chú: UAT owner chưa thực hiện; sub-phase In review, không Done. iOS, release binary và TalkBack thủ công chưa chạy. UI callback không chứng minh cookie/backend/auth hết phiên.

### 2026-10-17 16:17 (+07:00) · @Bero
- Phase: 1.1.1 Xác nhận thiết kế và asset gốc (bàn giao lại)
- Trạng thái: In progress
- Đã làm: Claude Code đọc lại Auth `1792222520-e878` và Home `1792222488-748f`, giải mã template, lưu `references/source/auth-design.html` và `references/source/home-2a-design.html`. Viết đặc tả UI chung (khung quy đổi, bảng màu → token, gradient, chữ, bóng, motion, quy tắc preview) và quyết định mở D1–D4 trong IMPLEMENT 1.1; đặc tả chi tiết từng màn ở 1.2–1.4.
- Test: Tài liệu; kiểm tra bản trích không chứa base64/font, version artifact trùng bản khảo sát trước.
- PR / commit: Chưa tạo.
- Ghi chú: 1.1.2/1.1.3 cần Codex chỉnh shell Auth (gradient, bỏ chữ brand, vòng tròn trắng mờ) và công cụ preview nổi thu gọn trước khi làm 1.2.

### 2026-10-17 20:52 (+07:00) · @LogKoNger
- Phase: 1.1.1–1.1.3 · Tiếp tục bàn giao Claude Design
- Trạng thái: In progress
- Đã làm: AI thực hiện. Giữ nguồn Auth 1792222520-e878 / Home 1792222488-748f đã trích trong repo. Áp dụng D1–D4/ADR-0020; chép nguyên mascot map/book vào assets. Dựng lại AuthShell bằng SVG gradient, vòng tròn trắng mờ, safe area, mascot và sheet đúng kích thước; bỏ chữ brand khỏi artwork. Input và Button dùng thông số bàn giao. Preview chuyển sang bộ chọn nổi, không chiếm layout.
- Test: Baseline 20 suite/97 test đạt. Test Auth mới RED (brand thừa/thiếu placeholder) → GREEN; Auth + shared UI 32/32. Test preview bộ chọn ẩn khi mở màn RED → GREEN.
- PR / commit: Chưa tạo.
- Ghi chú: Không đổi token hoặc dependency. Làm tiếp trên branch codex/phase-01-design-handoff vì toàn bộ source phase hiện là thay đổi chưa commit trong workspace; giữ mọi thay đổi ngoài phạm vi, không sao chép sang checkout sạch.

### 2026-10-17 21:08 (+07:00) · @LogKoNger
- Phase: 1 Kiểm tra sau chỉnh UI và bàn giao
- Trạng thái: In review
- Đã làm: AI đối chiếu bản chạy với bàn giao, sửa finding quan trọng, giữ UAT cuối cùng cho owner. Home320dp đã sửa mascot che chữ; kích thước vùng chạm dùng dp tường minh.
- Test: Jest20 suite/102 test đạt; lint:rules, lint:code-format, lint:type-check đạt. Maestro main: api-health/app-launch/Login/Register đạt ở lượt2026-10-17_205658; Home đạt sau sửa flow retry ở lượt210136 (1/1). Chữ lớn1.3×/Reduce Motion1/1, visual sections1/1 và compact320dp1/1 đạt. Hệ thống máy ảo đã khôi phục1080×2400, font1.0, animator_duration_scale=null.
- PR / commit: Chưa tạo.
- Ghi chú: Bằng chứng, giới hạn và sai khác nhỏ ở README và evidence/2026-10-17-handoff-review.md. Không xác nhận cookie/backend hoặc UAT thay owner.
