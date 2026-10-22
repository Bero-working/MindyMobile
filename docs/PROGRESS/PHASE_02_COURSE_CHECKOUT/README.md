# Tiến độ Phase 02 — Khoá học → Giỏ hàng → Thanh toán QR

Nhật ký cấp phase: đổi trạng thái, Dọn dẹp, Kiểm tra, xác nhận UI và UAT 2.99. Chỉ ghi thêm.

### 2026-10-17 23:00 (+07:00) · @Bero
- Phase: 2 Tạo phase
- Trạng thái: Todo
- Đã làm: Claude Code tạo spec IMPLEMENT Phase 2 (README, 2.1–2.6, 2.99), lưu 3 ảnh owner gửi vào `references/`, ghi bản đối chiếu nguồn. Viết ADR-0024 (route navigator) và ADR-0025 (thư viện QR) ở trạng thái Proposed.
- Test: không áp dụng (chỉ tài liệu).
- PR / commit: chưa commit.
- Ghi chú: Chờ owner chốt README Q1–Q10 (link Claude Design, chọn lớp, thông tin ngân hàng ngoài contract, tab bar màn Thanh toán...). 2.4 Blocked chờ ADR-0025 và Q3; 2.5 Blocked chờ ADR-0024. 2.1–2.3 làm được bằng preview/fixture.

### 2026-10-17 23:44 (+07:00) · @Bero
- Phase: 2 Cập nhật spec theo quyết định owner
- Trạng thái: Todo
- Đã làm: Claude Code ghi quyết định Q1–Q10 của owner trong chat. Q1: đọc lại artifact Student Home `1792222488-748f`, giải nén bundle, thấy mục 2 đã có màn Khoá học, Bộ lọc, Giỏ hàng, Thanh toán → trích nguồn vào `references/source/courses-cart-payment-design.html` và thay thông số ước lượng của 2.1, 2.3, 2.4 bằng thông số nguồn. Q2: sheet khoá học theo ảnh 4 (lưu `references/claude-course-sheet-classes.png`). Q3: mock chuyển khoản gom một file. Q4/Q5: ADR-0025/ADR-0024 Accepted, ARCHITECTURE cập nhật ngoại lệ. Q9: theo cart.md đã đồng bộ (ADR-0026). Q10: BUSINESS_RULES §7 đổi sang `1.500.000 VND`. Viết ADR-0027 (token ember/ribbon) Proposed.
- Test: không áp dụng (chỉ tài liệu).
- PR / commit: chưa commit.
- Ghi chú: Còn mở Q11 (sắp xếp theo giá không có tham số API), Q12 (ẩn mock ngân hàng ở build production), Q13 (ADR-0027). Sheet khoá học mới không có trong artifact đã publish; phần thẻ lớp là thông số ước lượng từ ảnh. Q10 làm đổi chuỗi tiền của Home Phase 1 (task 2.1.1).

### 2026-10-17 23:52 (+07:00) · @Bero
- Phase: 2 Chốt câu hỏi còn mở
- Trạng thái: Todo
- Đã làm: Owner duyệt Q11–Q13 trong chat. Q11: ẩn nhóm “Sắp xếp” của Bộ lọc tới khi API hỗ trợ (2.1). Q12: mock chuyển khoản chỉ gán khi `APP_ENV !== 'production'` (2.4, 2.99). Q13: ADR-0027 Accepted, token thêm ở task 2.1.1; ARCHITECTURE cập nhật ngoại lệ. Không còn câu hỏi mở; 2.1–2.5 sẵn sàng cho Codex.
- Test: không áp dụng (chỉ tài liệu).
- PR / commit: chưa commit.
- Ghi chú: Phần thẻ lớp của sheet khoá học (2.2) vẫn là thông số ước lượng từ ảnh 4, owner xác nhận ở mốc duyệt UI.

### 2026-10-17 23:46 (+07:00) · @Bero
- Đính chính entry 2026-10-17 23:52: thời gian đúng của entry đó là 2026-10-17 23:46 (lấy từ `date`); nội dung giữ nguyên.
- Phase: 2 Đính chính
- Trạng thái: Todo
- Test: không áp dụng.

### 2026-10-17 23:53 (+07:00) · @Bero
- Phase: 2 Cập nhật nguồn thiết kế
- Trạng thái: Todo
- Đã làm: Link Claude Design `claude.ai/design/p/7b801e55-…` trả 403 nên không đọc được. Owner publish lại artifact Student Home (version `1792255829-893f`); Claude Code giải nén và so sánh với version `1792222488-748f`. Viết lại 2.2 theo mã nguồn (thẻ lớp viền 1.5, “Chọn lớp” thêm ngay vào giỏ, “✓ Đã chọn” bỏ khỏi giỏ, một lớp mỗi khoá, “Mua ngay” thêm rồi mở giỏ); 2.1 đổi nút “+”/✓ trên thẻ thành mũi tên → (áp cả thẻ Home qua `CourseTile`); trích lại bản nguồn, cập nhật README, DESIGN_SOURCE, 2.6, 2.99.
- Test: không áp dụng (chỉ tài liệu).
- PR / commit: chưa commit.
- Ghi chú: Nguồn còn đổi padding carousel giới thiệu của Home (dòng 423) — ngoài luồng Phase 2, chưa áp dụng, chờ owner. Sheet `classes` trong nguồn không có thao tác mở nên không triển khai.

### 2026-10-17 23:55 (+07:00) · @Bero
- Phase: 2 Chốt thay đổi từ nguồn mới
- Trạng thái: Todo
- Đã làm: Owner quyết định áp dụng thay đổi của artifact `1792255829-893f` cho UI Phase 2 (Q14) và bỏ sheet danh sách lớp dạng gọn (Q15). Đối chiếu code: `HomeCarousel` đã tràn mép từ Phase 1 (slide chỉ `pt-[40px]`), nên carousel chỉ cần đối chiếu ảnh ở 2.5; mũi tên trên thẻ Home làm qua `CourseTile` ở 2.1.1. Cập nhật README, 2.2, 2.5, DESIGN_SOURCE.
- Test: không áp dụng (chỉ tài liệu).
- PR / commit: chưa commit.
- Ghi chú: Không còn câu hỏi mở cho Phase 2.

### 2026-10-18 00:14 (+07:00) · @Bero
- Đính chính entry 2.1.1: owner xác nhận handle là Bero trong chat, dùng @Bero cho các entry tiếp theo. Entry trước dùng bằng chứng handle lịch sử Phase 1; không sửa lịch sử.
- Phase: 2 Triển khai UI
- Trạng thái: In progress
- Đã làm: AI triển khai UI fixture/callback 2.1–2.4, đang đối chiếu Android 2.5; không gọi API mới.
- Test: Android cart-checkout-qr PASS lần đầu; đang rà ảnh và chạy lại sau sửa layout.
- PR / commit: Chưa tạo.
- Ghi chú: UI chưa được owner xác nhận; API 2.6 và UAT 2.99 Todo.

### 2026-10-18 00:38 (+07:00) · @Bero
- Phase: 2 Dọn dẹp và Kiểm tra UI
- Trạng thái: In review
- Đã làm: AI hoàn tất UI 2.1–2.5, dùng common CourseTile/CourseCover/AppTabBar/BrandBar và formatVnd; xoá các file Home đã di chuyển, không để wrapper chết. Cài QR 6.3.26 theo ADR-0025, token theo ADR-0027, routes STUDENT theo ADR-0024. Dọn log Metro do lượt này tạo khỏi workspace, giữ Metro chạy với log tạm ngoài repo. Không sửa/xoá phase1-metro.log hoặc các thay đổi tài liệu có sẵn.
- Test: npm test -- --runInBand --silent: 161/161, 38 suite PASS. Sau chỉnh toast/CTA, payment/controller/flow 9/9 và cart/courseSheet/flow 8/8 PASS. npm run lint:rules, lint:code-format, lint:type-check PASS, không warning mới. Android: cả 7 flow có lượt PASS; lượt toàn folder ban đầu 6/7 do Fast Refresh, ca courses-browse chạy lại PASS; final visual PASS. Checkout mặc định handoff-final PASS; 320dp/chữ 140% compact-final PASS. Không coi một lượt folder ban đầu là 7/7.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Qua native QA đã sửa skeleton co nhỏ, scroll reset khi pending, mô tả dài theo số dòng thật và toast ngoài viewport. Giá/giỏ/order trong preview là dữ liệu mẫu; chưa xác minh backend Phase 2 hoặc QR ngân hàng thật. Native debug hiện có được dùng lại (thư viện QR chỉ JS); chưa build/test iOS hoặc release. TalkBack và Reduce Motion native chưa kiểm tra thủ công; đồng hồ chấp nhận lệch giờ thiết bị theo spec.

### 2026-10-18 00:38 (+07:00) · @Bero
- Phase: 2 Bàn giao xác nhận UI
- Trạng thái: In review — chờ owner xác nhận UI
- Đã làm: [Bàn giao ảnh/hướng dẫn/sai khác](UI_REVIEW.md). Đối chiếu: [Catalog](evidence/catalog.png), [Bộ lọc](evidence/filter.png), [Sheet lớp](evidence/course-sheet.png), [Giỏ rỗng](evidence/cart-empty.png), [Giỏ có lớp](evidence/cart-filled.png), [QR](evidence/payment-qr.png), [QR 320dp/chữ 140%](evidence/compact-payment-qr.png). Roadmap và README phase cập nhật cùng trạng thái.
- Test: Như entry Kiểm tra UI ngay trên; raw runs ở evidence/final-android, review-android, final-visual, handoff-final, compact-final.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa có owner xác nhận UI trong lượt này. Theo ADR-0021 và docs/README.md B.5, API 2.6 và owner UAT 2.99 **Todo**; không chuyển phase Done. Production routes chưa có adapter Phase 2, đang hiện trạng thái lỗi/không có dữ liệu; preview chỉ đăng ký/render __DEV__, không có trong release. Các giới hạn và khác biệt (gồm CTA dùng font 16 của UI kit thay nguồn 15) ghi tại UI_REVIEW.md để owner đối chiếu.


### 2026-10-18 00:50 (+07:00) · @Bero
- Phase: 2.2.1 Thẻ bao danh sách và viewport hai lớp theo owner
- Trạng thái: In review
- Đã làm: AI thêm thẻ chung nền soft, viền line, bo góc 20dp, padding 10dp. Đo hai hàng đầu để giới hạn viewport chính xác; lớp thứ ba trở đi cuộn bên trong bằng gesture-handler ScrollView, nested scroll. Với tối đa hai lớp, không giới hạn chiều cao hoặc bật cuộn nội bộ. Giá/Mua ngay nằm ngoài vùng cuộn lớp. Cập nhật IMPLEMENT theo yêu cầu trực tiếp và UI_REVIEW.
- Test: Red → Green test chiều cao thực tế 90+110+10=210dp và tắt cuộn khi chỉ còn hai lớp. Tổng 168/168 tests, 39 suite PASS; ESLint, format, TypeScript PASS. Android course-class-scroll PASS; đối chiếu ảnh class-list-two-visible.png và class-list-third-scrolled.png xác nhận hai hàng và cuộn tới hàng thứ ba, giá/Mua ngay vẫn hiển thị.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Lượt native đầu assertNotVisible theo id thất bại vì UiAutomator vẫn trả hàng ngoài vùng clip; ảnh xác nhận hàng đó không hiển thị. Bỏ assertion id không phản ánh clipping, giữ unit test chiều cao và đối chiếu ảnh trước/sau swipe; raw lần đầu giữ tại evidence/class-scroll. iOS chưa kiểm tra. Chờ owner xác nhận UI; API/UAT chưa bắt đầu.


### 2026-10-18 00:50 (+07:00) · @Bero
- Phase: 2 Kiểm tra sau điều chỉnh carousel và danh sách lớp
- Trạng thái: In review
- Đã làm: AI hoàn tất hai yêu cầu UI trực tiếp, giữ trạng thái chờ owner xác nhận UI.
- Test: 168/168 tests, 39 suite PASS; lint/format/type-check PASS. Android carousel-autoplay PASS ba carousel. Lượt cuối course-class-scroll và cart-checkout-qr: 2/2 PASS trong 1m23s, gồm chọn lớp → giỏ → QR → Back/Ở lại → sao chép/toast → Rời đi → giỏ rỗng. Bằng chứng evidence/class-scroll-final; git diff --check PASS (chỉ cảnh báo chuyển LF/CRLF của workspace).
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: iOS chưa kiểm tra. API 2.6 và UAT 2.99 Todo; dữ liệu preview vẫn là fixture.


### 2026-10-18 01:01 (+07:00) · @Bero
- Phase: 2.2.1 Cố định modal, tắt cuộn tổng theo owner
- Trạng thái: In review
- Đã làm: AI thêm chế độ scrollable=false cho AppSheet, dùng BottomSheetView và snap 94% cố định; tắt content/handle panning. CourseSheet dùng chế độ này, chỉ danh sách lớp còn cuộn; vùng lớp co theo không gian, giá/Mua ngay căn cuối khung. Giỏ và bộ lọc vẫn dùng chế độ mặc định. Đóng bằng backdrop/Back, vẫn khoá đóng khi pending. Cập nhật IMPLEMENT theo yêu cầu trực tiếp.
- Test: ESLint, Prettier, TypeScript PASS. Jest courseSheet + commerceFlow 6/6 PASS. Android fixed-modal: class-scroll và checkout 2/2 PASS; sau chốt chiều cao vùng cố định, chạy lại class-scroll PASS, ảnh trước/sau vuốt xác nhận khung ngoài đứng yên, chỉ danh sách cuộn. Bằng chứng evidence/fixed-modal-final và evidence/course-modal-fixed.png.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Sửa lỗi kiểu optional snapPoints bằng cách không truyền prop khi dùng dynamic sizing. Chưa kiểm tra lại chữ lớn/320dp cho thay đổi cố định mới; iOS chưa kiểm tra. UI chờ owner xác nhận; API 2.6 và UAT 2.99 Todo.


### 2026-10-18 01:36 (+07:00) · @Bero
- Phase: Điều chỉnh tab, noti và khoảng trắng theo owner
- Trạng thái: In review
- Đã làm: AI hạ thanh tab Home/Khoá học thêm 12dp (bottom=max(insets.bottom−12,0)); catalog giảm đệm cuối 120→100dp cộng safe area. Đưa noti chọn/bỏ lớp lên overlay đầu modal, không chiếm chiều cao hoặc chặn chạm; chưa xây component chung vì owner sẽ làm sau. Bỏ mt-auto ở giá/Mua ngay; modal vừa nội dung, giới hạn 94%, vẫn không cuộn bao ngoài hoặc nhận kéo modal. Chỉ danh sách lớp cuộn. Cập nhật IMPLEMENT và UI_REVIEW theo yêu cầu trực tiếp.
- Test: Tổng Jest 168/168, 39 suite PASS; ESLint, Prettier và TypeScript PASS trên file thay đổi. Android course-class-scroll PASS cả noti/chọn lớp/vuốt ngoài đứng yên và cuộn nội bộ. courses-browse rerun PASS bộ lọc, phân trang, mở modal, Back, giỏ rỗng. Ảnh evidence/course-modal-top-notice.png và evidence/courses-lowered-tabs.png.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Lần browse đầu thất bại do Maestro coi nút phân trang dưới lớp phủ tab là visible; sửa flow centerElement=true để cuộn vào vùng nhìn thấy trước khi bấm, rerun PASS. Raw lỗi giữ tại evidence/tabs-top-notice; final tại evidence/lowered-tabs-final. iOS/chữ lớn chưa kiểm tra lại. UI vẫn chờ owner xác nhận; API 2.6 và UAT 2.99 Todo.


### 2026-10-18 01:47 (+07:00) · @Bero
- Phase: 2.2.1 Giảm chiều cao modal dưới hàng giá theo owner
- Trạng thái: In review
- Đã làm: AI giảm padding dưới của chế độ modal không cuộn từ 32dp + safe area xuống 8dp + safe area; chiều cao tự co giảm 24dp. Giữ safe area cho thanh điều hướng hệ thống; không ảnh hưởng sheet giỏ/bộ lọc. Cập nhật IMPLEMENT theo chỉ dẫn trực tiếp.
- Test: Android course-class-scroll PASS: vuốt ngoài không di chuyển modal, cuộn tới lớp thứ ba, chọn lớp, noti trên và nút mua vẫn hiển thị. Đối chiếu ảnh evidence/compact-modal-bottom.png. ESLint PASS; kiểm tra format/type-check ghi bổ sung khi hoàn tất. Không thêm unit test cho thay đổi padding thuần tuý.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: iOS chưa kiểm tra. UI chờ owner xác nhận; API 2.6/UAT 2.99 Todo.


### 2026-10-18 01:47 (+07:00) · @Bero
- Phase: Kiểm tra bổ sung giảm đệm đáy modal
- Trạng thái: In review
- Đã làm: Hoàn tất kiểm tra mã sau chỉnh padding.
- Test: ESLint, Prettier và TypeScript PASS; Android PASS như entry trên.
- PR / commit: Chưa tạo.
- Ghi chú: Không thay trạng thái chờ owner xác nhận UI.


### 2026-10-18 01:58 (+07:00) · @Bero
- Phase: 2.2.3 Chọn tạm một lớp và xác nhận thêm giỏ bằng nút riêng
- Trạng thái: In review
- Đã làm: AI tách draft selectedClassId khỏi cartItems. Chọn/bỏ/đổi lớp không gọi add/remove/refresh; chọn lớp khác thay lựa chọn cũ, lớp hết chỗ không chọn được. Thêm icon giỏ 50dp cạnh Mua ngay: xác nhận thêm và giữ modal. Mua ngay thêm/thay lớp đã chọn rồi mở giỏ. Khoá hai hành động khi chưa chọn/hết chỗ/pending. Giữ một lớp mỗi khoá, thêm mới trước bỏ cũ và không đụng lớp của khoá khác, chống tap lặp, không thêm trùng. Mở lại modal lấy lớp từ giỏ và bỏ draft chưa lưu. Cập nhật bản dịch, business rules, IMPLEMENT, hướng dẫn UAT và UI_REVIEW theo chỉ dẫn owner.
- Test: Red 7 hook tests trên hành vi cũ → Green; hook/UI/integration 14/14 PASS. Tổng 173/173, 39 suite PASS; ESLint không warning, Prettier, TypeScript PASS. Android course-class-scroll (chọn chưa tăng badge, icon giỏ thêm/hiện toast/giữ modal) và cart-checkout-qr (Mua ngay thêm lớp → giỏ → QR → Back/copy/leave) 2/2 PASS trong 1m26s. Bằng chứng evidence/draft-class-selection và evidence/course-modal-add-to-cart.png.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Đây là UI/callback preview, chưa tích hợp API 2.6. Một lớp mỗi khoá là quy tắc hiện tại, owner có thể đổi sau. iOS/chữ lớn chưa kiểm tra lại cho hàng nút mới. UI vẫn In review, API 2.6 và UAT 2.99 Todo.


### 2026-10-18 02:00 (+07:00) · @Bero
- Phase: 2 Owner xác nhận UI
- Trạng thái: In progress — UI đã được owner duyệt; chuẩn bị bước API
- Đã làm: Ghi nhận xác nhận trực tiếp của owner trong chat: “UI tôi approve”. Phạm vi duyệt là UI Phase 2 hiện tại, gồm chọn tạm một lớp mỗi khoá, icon thêm giỏ cạnh Mua ngay, modal không cuộn ngoài/hai lớp và cuộn nội bộ, noti trên, modal thu gọn, tab hạ thấp và autoplay 3 giây. UI 2.1–2.5 hoàn tất mốc xác nhận; chưa phải UAT cuối phase.
- Test: Không chạy lại vì chỉ ghi nhận duyệt UI. Bằng chứng gần nhất: 173/173 Jest, lint/format/type-check PASS; Android draft-class-selection 2/2 PASS.
- PR / commit: Chưa tạo.
- Ghi chú: API 2.6 vẫn Todo, cần Claude Code rà lại khung đặc tả sau duyệt UI và trước khi Codex triển khai theo PHASE_02_06_API_INTEGRATION.md §Mô tả. Không còn chờ owner duyệt UI; chưa bắt đầu gọi API Phase 2 hoặc xác nhận UAT. UAT 2.99 Todo.


### 2026-10-18 02:14 (+07:00) · @Bero
- Phase: 2 Tạm dừng 2.6 theo yêu cầu owner
- Trạng thái: In progress
- Đã làm: Đặc tả 2.6 đã được Claude Code chốt; 2.6.1 In review, 2.6.2/2.6.3 In progress (code xong, còn test hook/route), 2.6.4 Todo. Chi tiết: [PHASE_02_06_API_INTEGRATION.md](PHASE_02_06_API_INTEGRATION.md).
- Test: Jest 199/199 PASS; tsc PASS; ESLint 1 cảnh báo; Prettier 10 file chưa format; Maestro chưa chạy.
- PR / commit: Chưa tạo.
- Ghi chú: Dừng theo chỉ đạo owner; UAT 2.99 Todo.


### 2026-10-18 18:11 (+07:00) · @Bero
- Phase: Tiếp tục 2.6.1–2.6.3 sau owner yêu cầu “tiếp tục phase 2”
- Trạng thái: In progress
- Đã làm: Hoàn tất test MSW hook/route còn thiếu cho Catalog, chi tiết lớp/lịch (tối đa 3 đồng thời, lỗi lịch bỏ qua), giỏ/checkout/verify và PaymentRoute. Production chọn tạm không gọi mutation, chỉ icon giỏ/Mua ngay thêm lớp; thay lớp POST trước DELETE, thêm lỗi giữ lớp cũ; badge đổi sau response. Test phát hiện và sửa GET giỏ cũ ghi đè POST server (cancel query trước setQueryData), checkout hoàn tất sau rời sheet vẫn điều hướng (mounted guard), đơn đóng không có QR vẫn hiện loading (hiện expired), chờ PayOS không tính thời gian HTTP/còn gọi sau huỷ (ngân sách 30s tính cả HTTP, timeout theo phần còn lại, AbortController), phiên chưa ready vẫn tạo link (dừng/huỷ theo scope). Giới hạn metadata lớp ở 6 request đồng thời ngay tại service. Format file mới và bỏ eslint-disable thừa.
- Test: Red → Green các regression trên. Toàn bộ 231/231, 48 suite PASS; lint/format/type-check PASS. Chạy detectOpenHandles xác định handle CustomGC của lightningcss được import ở src/config/nativewind.test.tsx (hạ tầng có sẵn), không phải timer PayOS mới; không sửa test config bị khoá. Hai lượt Jest đều 231 PASS, process còn handle native được dừng sau báo cáo.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Catalog thật trả 200; đã tìm lại tài khoản owner đã cung cấp ở Phase 1 và xác nhận login STUDENT, giỏ ban đầu rỗng. Không ghi credential/cookie vào repo hoặc evidence. Đang kiểm tra Android/backend 2.6.4, chưa xác nhận QR hay UAT.


### 2026-10-18 18:23 (+07:00) · @Bero
- Phase: 2 Kiểm tra API cuối và bàn giao owner UAT
- Trạng thái: In review — chờ owner UAT 2.99
- Đã làm: AI hoàn tất 2.6.1–2.6.3 và tự kiểm tra backend/Android 2.6.4. Regression bổ sung tái hiện refresh sau DELETE dùng lại GET cũ → sửa actions.refresh huỷ GET đang chạy trước khi fetch bản mới; Red → Green. Không sửa hạ tầng, không thêm thư viện, không commit, giữ thay đổi ngoài phạm vi có sẵn. Cập nhật roadmap, README, đặc tả API, UAT và API_REVIEW; UI approval trước đó giữ nguyên.
- Test: Jest 232/232, 48 suite PASS (evidence/api-final-jest.json); ESLint, Prettier, TypeScript PASS. detectOpenHandles xác định CustomGC/lightningcss từ test NativeWind có sẵn; process Jest được dừng sau khi JSON success=true và toàn bộ assertion hoàn tất, không tự coi process có handle này đã thoát thành công. npm run test:e2e Android: 9/9 flow PASS trong 7m23s (evidence/api-ui-regression). Sau sửa refresh cuối, MSW cart/query/controller/production route 17/17 PASS, toàn bộ Jest 232/232 PASS và native cart-add-remove với API thật PASS (evidence/api-remove-retest): chọn lớp ở cuối vùng cuộn, Mua ngay → giỏ, DELETE → giỏ rỗng, đóng/mở lại vẫn rỗng. API checkout/PayOS native PASS tại api-native-final; QR screenshot decode trùng backend và CRC đúng.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Lượt add-remove đầu dùng scrollUntilVisible nhận nhầm nút của lớp ngoài vùng clip; ảnh cho thấy lớp thứ ba chưa cuộn vào viewport. Sửa flow vuốt bên trong danh sách trước khi bấm, không sửa UI; rerun PASS. Raw lỗi giữ tại api-remove-final. Hai luồng API cuối không nằm trong bộ fixture mặc định; credentials không lưu vào YAML/source/evidence. Native 1080x2400, density420/font1.0, APK debug hiện có + Metro mới. Không chuyển tiền hoặc poll PAID. Chưa quét app ngân hàng/xác nhận sandbox phía server; chưa chạy iOS/release hoặc kiểm tra lại chữ lớn/TalkBack/Reduce Motion native trong lượt API. Các giới hạn bàn giao owner tại API_REVIEW; không tự chuyển phase Done hoặc xác nhận UAT.


### 2026-10-18 18:24 (+07:00) · @Bero
- Phase: Đối chiếu giỏ sau native DELETE
- Trạng thái: In review — chờ owner UAT
- Đã làm: HTTP probe ngoài app dùng access cookie của lần login đầu trả 401 sau thời gian kiểm thử; đăng nhập lại cùng tài khoản và đọc giỏ để xác minh riêng. Đây là probe không có interceptor refresh, không coi là lỗi phiên native hoặc bằng chứng native refresh. Cookie/credential không lưu vào repo; file cookie tạm đã xoá.
- Test: Kết quả GET sau xác thực mới tại evidence/api-remove-summary.json; native xoá/mở lại giỏ đã PASS.
- PR / commit: Chưa tạo.
- Ghi chú: Giữ nguyên giới hạn ngân hàng/sandbox và UAT chưa được owner xác nhận.


### 2026-10-18 18:34 (+07:00) · @Bero
- Phase: Kiểm tra cuối modal detail theo ảnh owner
- Trạng thái: In review — chờ owner UAT
- Đã làm: Hoàn tất thay đổi UI và đối chiếu Android. [Ảnh mới](evidence/course-detail-redesign.png). Giữ hành vi thêm giỏ riêng, Mua ngay và API đã tích hợp.
- Test: Jest liên quan 13/13 PASS; lint/format/type-check PASS. Android course-class-scroll + cart-checkout-qr 2/2 PASS trong 1m23s (evidence/course-detail-redesign). git diff --check PASS.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Không gọi mutation backend thật mới trong lượt đổi UI; native dùng preview fixture. Bằng chứng API thật ở API_REVIEW vẫn giữ. iOS/chữ lớn chưa kiểm tra lại. Không tự xác nhận UAT.


### 2026-10-18 18:39 (+07:00) · @Bero
- Phase: 2.2 Ảnh full width hai mép, bỏ bo ảnh
- Trạng thái: In review
- Đã làm: Theo hai yêu cầu trực tiếp của owner, hero rộng bằng useWindowDimensions.width, margin-left −18dp để thoát padding nội dung; bỏ bo góc ảnh, giữ tỉ lệ8:5/gradient/title. Các phần dưới giữ padding. Lượt đầu dùng margin âm hai bên với width auto gây SVG không render đủ và hở phải; đã sửa bằng width tường minh theo cửa sổ, xác nhận ảnh/gradient phủ sát cả hai mép.
- Test: ESLint/Prettier/TypeScript PASS; Android course-class-scroll PASS sau sửa: 2 lớp, cuộn lớp3, chọn tạm và thêm giỏ/noti, không cuộn ngoài. Đối chiếu ảnh evidence/course-hero-edge-to-edge.png thấy hai cạnh ngang sát modal, bốn góc ảnh vuông và gradient/title rõ. Lượt lỗi hình ảnh giữ tại evidence/course-hero-full-width; lượt đạt tại evidence/course-hero-edge-to-edge. Không thêm unit test cho margin/width thuần giao diện.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Chỉ đổi UI, API/hành vi giữ nguyên. iOS/chữ lớn chưa kiểm tra lại. Phase vẫn chờ owner UAT, không tự Done.

### 2026-10-18 18:51 (+07:00) · @Bero
- Phase: 2.2 Khối trắng chồng ảnh, mô tả và danh sách 2,5 lớp theo owner
- Trạng thái: In review
- Đã làm: Theo ảnh owner, thêm khối nội dung trắng full width bo hai góc trên22dp, chồng đáy hero22dp. Giữ hero sát hai mép không bo, dời chữ lên tránh bị che. Mô tả 14/22dp đứng đầu khối trắng trước Lớp đang mở, không co mất; giữ Xem thêm khi dài. Viewport đo ba thẻ đầu, bằng hàng1+hàng2+20dp+0,5×hàng3; tối đa hai lớp không cuộn, từ ba lớp cuộn nội bộ. Giữ modal cố định, icon giỏ và Mua ngay. Cập nhật spec trước code.
- Test: Jest liên quan13/13 PASS, viewport Red→Green từ210 thành260 với ba hàng90/110/80. ESLint/Prettier/TypeScript PASS. Android course-class-scroll PASS: mô tả hiện, hai lớp rưỡi, cuộn lớp cuối, chọn tạm và thêm giỏ/noti. Ảnh đối chiếu evidence/course-detail-description.png. Lượt native đầu course-detail-overlap-2half bị nuốt tap khi danh sách còn dừng cuộn, lượt checkout không tìm được preview button; bổ sung chờ hết animation và xác nhận Đã chọn trong flow, lượt riêng class-scroll đạt. Đang chạy lại checkout riêng. git diff --check PASS.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Preview fixture, không tạo đơn backend thật mới. API trả description null thì không tạo mô tả giả. Chưa kiểm tra lại iOS/chữ lớn. Phase vẫn In review chờ owner UAT.

### 2026-10-18 18:51 (+07:00) · @Bero
- Phase: Kiểm tra cuối mô tả và viewport2,5 lớp
- Trạng thái: In review — chờ owner UAT
- Đã làm: Hoàn tất UI theo hai yêu cầu owner mới nhất; ảnh evidence/course-detail-description.png có mô tả trước header, khối trắng bo góc chồng ảnh và hai lớp rưỡi.
- Test: Android chạy riêng course-class-scroll và cart-checkout-qr đều PASS. Luồng Mua ngay → giỏ → checkoutQR → ở lại/rời đi → giỏ rỗng đạt, raw evidence/course-detail-description và evidence/course-detail-description-checkout. Jest13/13, ESLint/TypeScript/Prettier PASS.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Không thay API. Chưa iOS/chữ lớn; không tự xác nhận owner UAT.

### 2026-10-18 18:59 (+07:00) · @Bero
- Phase: Bàn giao UI mới với API thật cho owner kiểm tra
- Trạng thái: In review — chờ owner UAT
- Đã làm: Owner xác nhận UI mới bằng “Được rồi gắn API vào để tôi kiểm tra”. Kiểm tra production Home/Courses/ShoppingSheets đã nối catalog/course detail/classes/cart/checkout/PayOS thật; UI mới dùng chung CourseSheet, không cần đổi service hay thay fixture preview. Đăng nhập STUDENT bằng tài khoản owner đã cung cấp, chuyển máy ảo từ preview sang luồng production. Không lưu credential vào repo/bằng chứng; flow và output đăng nhập tạm được xoá sau chạy.
- Test: Native đăng nhập thật → Home → tab Khoá học → có thẻ khoá server PASS. Backend danh mục HTTP200. Ảnh evidence/api-owner-ready.png xác nhận modal HTML & CSS từ con số0 có ảnh, mô tả,3lớp/lịch/mentor/chỗ/giá1000VND thật và bố cục mới. Không tạo mutation giỏ hay checkout mới trong lượt bàn giao này. Kế thừa kiểm tra API/QR và hồi quy trước đó.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Máy ảo hiện ở phiên STUDENT thật để owner kiểm tra. Giữ giới hạn PayOS/ngân hàng đã ghi tại API_REVIEW; chưa có xác nhận UAT/Done.

### 2026-10-18 19:08 (+07:00) · @Bero
- Phase: 2.2 Sửa layout khi đổi Chọn lớp thành Đã chọn
- Trạng thái: In review
- Đã làm: Owner báo nhãn Đã chọn rộng hơn làm title bị ép xuống dòng. Tách tên lớp/badge lên hàng riêng rộng toàn thẻ; lịch/mentor và nút nằm hàng dưới. Nút giữ104dp và shrink-0 cho mọi trạng thái, fontScale>1,2 dùng rộng toàn hàng với bố cục dọc. Nhờ đó thay nhãn không thay không gian title hoặc chiều cao nút. Giữ tên dài xuống dòng tự nhiên, viewport đo2,5thẻ và API/hành vi chọn tạm hiện tại. Spec cập nhật trước code, Metro đã tải UI mới.
- Test: Jest courseSheet/productionCommerce/commerceFlow13/13 PASS; ESLint/TypeScript/Prettier PASS. Quan sát native dữ liệu Python thật thấy tên lớp dài có hàng riêng, nút đúng layout (evidence/class-selection-layout/selected-before-toggle.png, tên screenshot là nhãn capture chứ không xác nhận đang chọn). Thử so sánh bounds hai trạng thái trên lớp HTML không hoàn tất vì modal trên máy đang thay đổi sang khoá khác rồi đóng; dừng lượt test, không xoá phiên hay giỏ để chạy fixture. Không ghi nhận phép so sánh geometry đã PASS. Không thêm unit test cho kích thước/tổ chức layout thuần giao diện.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Chỉ sửa UI, không gọi mutation backend mới. Chưa kiểm tra iOS/chữ lớn trên native trong lượt này. Chờ owner kiểm tra, không tự xác nhận UAT.

### 2026-10-18 19:11 (+07:00) · @Bero
- Phase: Điều tra API thêm giỏ theo ảnh lỗi owner
- Trạng thái: In review — cần owner duyệt ngoại lệ hạ tầng nếu sửa bộ đọc lỗi
- Đã làm: Gọi thật bằng tài khoản owner; GET giỏ200 rỗng; POST me/cart/items cho lớp25449860-d1cb-4949-852a-90d6b42dc2d3 trả409 CLASS_ALREADY_ENROLLED, message đã giữ chỗ hoặc enrolled; GET sau vẫn rỗng. Không checkout/huỷorder/xoágiỏ. Backend trả details=[{classId}], khác kiểu chuỗi/mảng chuỗi của contract. errorSchema trong HTTP từ chối toàn envelope vì details nên code bị mất thành HTTP_ERROR, UI hiện generic. Bằng chứng evidence/add-cart-investigation.json.
- Test: Tái hiện schema bằng đúng envelope backend: parser hiện tại reject; phương án bỏ qua metadata optional không đúng dạng giữ CLASS_ALREADY_ENROLLED, vẫn reject envelope thiếu code. Chuẩn bị ADR-0028 Proposed và patch review được, chưa áp dụng vào src/config bị khoá. git apply --check xác nhận patch áp dụng được. Một số probe auth/read riêng gặp response non-JSON tạm thời; không dùng để kết luận enrollment hay thời hạn giữ chỗ cụ thể.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Đã xác định lý do add bị chặn, chưa xác nhận đang giữ chỗ hay đã enrolled vì cần dữ liệu khác. Đề xuất thông báo bao phủ cả hai trường hợp. docs/README.md B.8 và ARCHITECTURE khoá HTTP yêu cầu ADR Accepted; chưa có quyền sửa. Phase/UAT không Done.

### 2026-10-18 19:13 (+07:00) · @Bero
- Phase: Bật kéo handle xuống để đóng course detail
- Trạng thái: In review
- Đã làm: Owner báo không kéo xuống được. Nguyên nhân enableHandlePanningGesture và enablePanDownToClose phụ thuộc scrollable=false của course detail. Đã tách cả hai thành !locked, giữ enableContentPanningGesture=false và không cuộn ngoài; chỉ handle kéo xuống để đóng. Mutation pending vẫn khoá đóng. Cập nhật spec trước code, thêm testID handle và bước hồi quy native vào course-class-scroll.
- Test: Android trên modal production đang mở: kéo từ app-sheet-handle xuống → course-sheet biến mất → courses-screen hiện PASS; evidence/sheet-handle-dismiss. Không xoá phiên/giỏ hoặc gọi checkout. Jest11/11 PASS, ESLint/TypeScript/Prettier PASS.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: ADR-0028 về parser lỗi add giỏ vẫn Proposed, chưa được owner duyệt; lượt này không sửa HTTP. Chưa iOS. Phase chờ owner UAT.

### 2026-10-18 19:17 (+07:00) · @Bero
- Phase: Áp dụng ADR-0028 sau owner duyệt
- Trạng thái: In review
- Đã làm: Owner chốt “Duyệt ADR-28”; ADR chuyển Accepted, index và ARCHITECTURE ghi ngoại lệ giới hạn HTTP/test. Optional details sai dạng được bỏ qua, code/status/message/requestId hợp lệ được giữ. Không đổi kiểu ApiError/cookie/refresh/retry/Origin. Bản dịch vi/en CLASS_ALREADY_ENROLLED bao phủ đã đăng ký hoặc giữ chỗ. Thêm hồi quy HTTP, hook chọn lớp và integration ShoppingSheets thật qua MSW.
- Test: Red→Green tái hiện code bị đổi thành HTTP_ERROR/mất requestId và bản dịch cũ. Bộ HTTP/cart/selection/productionCommerce62/62 PASS; sau thêm integration lỗi structured, productionCommerce7/7 PASS (tổng các test liên quan63). Giữ details chuỗi/mảng chuỗi, vẫn từ chối envelope thiếu code/message; POST lỗi không toast/không mở giỏ. ESLint/TypeScript/Prettier PASS.
- Native: Mở lớp HTML thật và thêm giỏ. Lần này server cho phép thêm, app toast thành công và badge1; ảnh evidence/adr28-native-add-success.png. Flow dự kiến409 vì thế fail ở assert thông báo409, raw evidence/adr28-native; không coi đây là PASS cho nhánh lỗi thật. Không tạo checkout hay huỷ order để tái tạo seat hold. Nhánh409 cùng payload đã xác nhận qua integration MSW. Lớp thêm mới giữ trong giỏ cho owner kiểm tra, không tự xoá.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Chưa tái hiện409 trên native sau thay đổi do trạng thái server đã cho thêm; không suy đoán đã thanh toán/enrolled. Phase vẫn chờ owner UAT, không tự Done.

### 2026-10-18 19:21 (+07:00) · @Bero
- Phase: Owner UAT2.99 và đóng Phase2
- Trạng thái: Done
- Đã làm: Owner xác nhận trực tiếp trong chat: “UAT phase 2 được approve”. Ghi nhận đây là duyệt UAT cuối phase, tách biệt với UI approval và ADR approval trước đó. Chuyển Phase2, API2.6 và UAT2.99 sang Done trong roadmap/README phase/hướng dẫn UAT. UI2.1–2.5 đã Done. Không triển khai phase mới hoặc tạo commit/PR khi chưa được yêu cầu.
- Test: Chỉ cập nhật tài liệu, không chạy lại test. Kế thừa bằng chứng API thật, Android, UI và hồi quy ADR-0028 đã ghi ở các entry trước. Không ghi thêm kết quả quét bank app/sandbox/iOS khi owner chỉ xác nhận UAT chung.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Các entry In review/chờ UAT trước thời điểm này là lịch sử, được thay bằng xác nhận Done này. Giới hạn kiểm thử và dữ liệu mock ngân hàng development vẫn giữ tại API_REVIEW; xác nhận owner không biến chúng thành bằng chứng kiểm thử mới. Phase2 hoàn tất theo owner.

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

### 2026-10-18 21:34 (+07:00) · @Bero
- Phase: Owner duyệt lại UAT2.99 và đóng Phase2 sau sửa E2E
- Trạng thái: Done
- Đã làm: Owner xác nhận trực tiếp “UAT phase 2 approve”. Đây là xác nhận mới sau lần mở lại19:25 và sửa APP_ID. Chuyển Phase2 và2.99 sang Done ở roadmap, README phase và tài liệu UAT. Lịch sử PROGRESS giữ nguyên, các entry chờ UAT trước đây được thay bởi trạng thái hiện tại này.
- Test: Chỉ cập nhật tài liệu, không chạy lại test. Kế thừa E2E mặc định9/9 PASS7m12s, smoke APP_ID thủ công PASS, kiểm tra API/QR thật và hồi quy ADR-0028 đã ghi. Không suy ra bằng chứng mới cho iOS/quét ngân hàng/sandbox từ xác nhận UAT chung.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Phase2 hoàn tất theo owner, không phải AI tự duyệt. Giữ giới hạn bằng chứng tại API_REVIEW. Không bắt đầu phase mới khi chưa có yêu cầu.


### 2026-10-22 09:25 (+07:00) · @Bero-working (Codex)

- Phase: Đồng bộ hồ sơ nghiệm thu theo yêu cầu owner sau tổng kết test.
- Trạng thái: Done theo xác nhận UAT lịch sử; không phát sinh xác nhận UAT hoặc kết quả kiểm thử mới.
- Đã làm: Đối chiếu từng checklist với bằng chứng đã có, tick phần đủ căn cứ và ghi rõ phần chưa kiểm tra/đạt một phần; giữ giới hạn được owner chấp nhận. Các file đồng bộ: PHASE_02_01_COURSE_CATALOG.md, PHASE_02_02_CLASS_PICKER.md, PHASE_02_03_CART_SHEET.md, PHASE_02_04_PAYMENT_QR.md, PHASE_02_05_NAVIGATION.md, PHASE_02_06_API_INTEGRATION.md, README.md.
- Test: Chỉ rà tài liệu/liên kết/diff. Kết quả CI Phase 4 là nguồn bổ sung có ngày/revision riêng, không thay kết quả các lượt cũ. Không chạy lại native/backend và không sửa mã nguồn.
- Đồng bộ: [Bảng đối chiếu](../ACCEPTANCE_SYNC_2026-10-22.md); trạng thái roadmap/README giữ theo owner đã duyệt. Quy trình B.7.1 và template được cập nhật để tự đồng bộ trong cùng lượt review về sau. Nhật ký cũ giữ nguyên.
