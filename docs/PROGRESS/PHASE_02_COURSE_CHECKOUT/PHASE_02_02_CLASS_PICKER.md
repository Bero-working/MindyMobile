# Tiến độ 2.2 — Sheet khoá học và chọn lớp

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.2.1 Sheet khoá học và thẻ lớp
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: courseSheet 3 test: chọn/bỏ, hết chỗ, pending, loading/empty/error.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.2.2 Lịch rút gọn
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: summarizeSchedule 1 test: timezone, CN, giờ phổ biến và rỗng.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.2.3 Chọn/bỏ/đổi lớp và Mua ngay
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: selection 3 test: chống tap lặp, add mới trước remove cũ, add lỗi giữ lớp cũ, buy có lớp mở giỏ. Adapter Promise qua callback, chưa HTTP.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:30 (+07:00) · @Bero
- Phase: Tự kiểm tra UI sub-phase
- Trạng thái: In review
- Đã làm: AI hoàn tất code UI/callback, tách preview khỏi production và đối chiếu nguồn. Xem UI_REVIEW.md và ảnh evidence/; chưa có owner xác nhận UI.
- Test: Tổng Jest 160/160 (38 suite); sau sửa layout skeleton chạy lại catalog/courseSheet 7/7. Lint, format, type-check PASS. Các flow Android chính đã qua, ảnh/trạng thái và giới hạn được tổng hợp ở README phase.
- PR / commit: Chưa tạo.
- Ghi chú: API 2.6 chưa triển khai theo ADR-0021; preview không chứng minh giá/chỗ ngồi/QR thật. iOS, TalkBack thủ công và Reduce Motion native chưa kiểm tra.

### 2026-10-18 00:34 (+07:00) · @Bero
- Phase: 2.2.1/2.2.3 Kiểm tra màn 320dp và chữ 140%
- Trạng thái: In review
- Đã làm: Red native cho thấy chọn lớp thành công (badge=1) nhưng scroll nhảy về đầu do bật/tắt content panning khi pending. Giữ scroll gesture ổn định, vẫn khoá đóng qua pan-down/backdrop/Back. Thay heuristic 180 ký tự bằng đo số dòng mô tả thật; text đo ẩn khỏi accessibility và không tham gia bố cục.
- Test: Red → Green test mô tả hơn 4 dòng; Jest sheet/flow/cart 8/8; native retest đã qua selected class và Mua ngay ở 320dp/140%.
- PR / commit: Chưa tạo.
- Ghi chú: Mô tả ít ký tự vẫn có Xem thêm khi xuống hơn 4 dòng trên màn nhỏ/chữ lớn.


### 2026-10-18 00:50 (+07:00) · @Bero
- Phase: 2.2.1 Thẻ bao danh sách và viewport hai lớp theo owner
- Trạng thái: In review
- Đã làm: AI thêm thẻ chung nền soft, viền line, bo góc 20dp, padding 10dp. Đo hai hàng đầu để giới hạn viewport chính xác; lớp thứ ba trở đi cuộn bên trong bằng gesture-handler ScrollView, nested scroll. Với tối đa hai lớp, không giới hạn chiều cao hoặc bật cuộn nội bộ. Giá/Mua ngay nằm ngoài vùng cuộn lớp. Cập nhật IMPLEMENT theo yêu cầu trực tiếp và UI_REVIEW.
- Test: Red → Green test chiều cao thực tế 90+110+10=210dp và tắt cuộn khi chỉ còn hai lớp. Tổng 168/168 tests, 39 suite PASS; ESLint, format, TypeScript PASS. Android course-class-scroll PASS; đối chiếu ảnh class-list-two-visible.png và class-list-third-scrolled.png xác nhận hai hàng và cuộn tới hàng thứ ba, giá/Mua ngay vẫn hiển thị.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Lượt native đầu assertNotVisible theo id thất bại vì UiAutomator vẫn trả hàng ngoài vùng clip; ảnh xác nhận hàng đó không hiển thị. Bỏ assertion id không phản ánh clipping, giữ unit test chiều cao và đối chiếu ảnh trước/sau swipe; raw lần đầu giữ tại evidence/class-scroll. iOS chưa kiểm tra. Chờ owner xác nhận UI; API/UAT chưa bắt đầu.


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
- Phase: Owner xác nhận UI sub-phase
- Trạng thái: Done (bước UI)
- Đã làm: Owner duyệt UI Phase 2 trong chat: “UI tôi approve”; bằng chứng và phạm vi tại README phase, entry cùng thời gian.
- Test: Kế thừa kiểm tra UI đã bàn giao; chỉ cập nhật tài liệu.
- PR / commit: Chưa tạo.
- Ghi chú: Không phải xác nhận UAT; API 2.6/UAT 2.99 Todo.


### 2026-10-18 18:33 (+07:00) · @Bero
- Phase: 2.2 Điều chỉnh modal detail theo ảnh owner
- Trạng thái: In review
- Đã làm: AI đưa mã khoá/danh mục sunshine và tiêu đề canvas vào hero ảnh 8:5 bo 20dp, gradient forestDeep tăng dần về đáy. Mô tả 14/22dp dưới ảnh; header lớp 15dp. Bỏ viền/nền/padding ngoài danh sách để các thẻ lớp giống mẫu; giữ wrapper và viewport hai lớp có cuộn. Thẻ lớp viền 1dp, bo16, lịch/mentor12/18dp, badge9dp; chỗ ít chuyển status-red như ảnh. Giá20dp. Giữ nút icon giỏ, chọn tạm, mutation API, định dạng VND, noti trên và modal không cuộn ngoài. Không thêm nhãn placeholder ảnh khoá học vào sản phẩm. Đặc tả đã cập nhật theo yêu cầu trực tiếp trước sửa code.
- Test: ESLint, Prettier, TypeScript PASS; Jest courseSheet/productionCommerce/commerceFlow 13/13 PASS. Android course-class-scroll PASS (mới 2 lớp, vuốt ngoài không đổi modal, cuộn lớp3, chọn tạm, thêm giỏ/noti). Đối chiếu ảnh evidence/course-detail-redesign.png với ảnh owner: đúng hero, gradient, chữ trong ảnh và lớp gọn; mẫu không có icon giỏ nhưng giữ theo hành vi owner đã chốt.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Chỉ đổi UI, không thay API/data. Đang xác nhận lại checkout Android. Chưa iOS/chữ lớn ở bố cục mới. Phase vẫn In review chờ owner UAT, không tự xác nhận UAT.


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

### 2026-10-18 19:08 (+07:00) · @Bero
- Phase: 2.2 Sửa layout khi đổi Chọn lớp thành Đã chọn
- Trạng thái: In review
- Đã làm: Owner báo nhãn Đã chọn rộng hơn làm title bị ép xuống dòng. Tách tên lớp/badge lên hàng riêng rộng toàn thẻ; lịch/mentor và nút nằm hàng dưới. Nút giữ104dp và shrink-0 cho mọi trạng thái, fontScale>1,2 dùng rộng toàn hàng với bố cục dọc. Nhờ đó thay nhãn không thay không gian title hoặc chiều cao nút. Giữ tên dài xuống dòng tự nhiên, viewport đo2,5thẻ và API/hành vi chọn tạm hiện tại. Spec cập nhật trước code, Metro đã tải UI mới.
- Test: Jest courseSheet/productionCommerce/commerceFlow13/13 PASS; ESLint/TypeScript/Prettier PASS. Quan sát native dữ liệu Python thật thấy tên lớp dài có hàng riêng, nút đúng layout (evidence/class-selection-layout/selected-before-toggle.png, tên screenshot là nhãn capture chứ không xác nhận đang chọn). Thử so sánh bounds hai trạng thái trên lớp HTML không hoàn tất vì modal trên máy đang thay đổi sang khoá khác rồi đóng; dừng lượt test, không xoá phiên hay giỏ để chạy fixture. Không ghi nhận phép so sánh geometry đã PASS. Không thêm unit test cho kích thước/tổ chức layout thuần giao diện.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Chỉ sửa UI, không gọi mutation backend mới. Chưa kiểm tra iOS/chữ lớn trên native trong lượt này. Chờ owner kiểm tra, không tự xác nhận UAT.

### 2026-10-18 19:13 (+07:00) · @Bero
- Phase: Bật kéo handle xuống để đóng course detail
- Trạng thái: In review
- Đã làm: Owner báo không kéo xuống được. Nguyên nhân enableHandlePanningGesture và enablePanDownToClose phụ thuộc scrollable=false của course detail. Đã tách cả hai thành !locked, giữ enableContentPanningGesture=false và không cuộn ngoài; chỉ handle kéo xuống để đóng. Mutation pending vẫn khoá đóng. Cập nhật spec trước code, thêm testID handle và bước hồi quy native vào course-class-scroll.
- Test: Android trên modal production đang mở: kéo từ app-sheet-handle xuống → course-sheet biến mất → courses-screen hiện PASS; evidence/sheet-handle-dismiss. Không xoá phiên/giỏ hoặc gọi checkout. Jest11/11 PASS, ESLint/TypeScript/Prettier PASS.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: ADR-0028 về parser lỗi add giỏ vẫn Proposed, chưa được owner duyệt; lượt này không sửa HTTP. Chưa iOS. Phase chờ owner UAT.


### 2026-10-22 09:25 (+07:00) · @Bero-working (Codex)

- Phase: Đồng bộ tiêu chí sau tổng kết test/AI review theo yêu cầu owner.
- Trạng thái: Done theo UAT owner đã có; giữ các giới hạn kiểm chứng, không ghi nhận UAT mới.
- Tiêu chí: tick bổ sung 1 mục đủ bằng chứng đã ghi; 1 mục giữ chưa đủ bằng chứng và nêu lý do trong IMPLEMENT/bảng đối chiếu.
- Test: Chỉ rà hồ sơ, không chạy lại app/Jest/Maestro/backend; không biến kết quả lịch sử hoặc owner approval thành lượt test mới.
- Đồng bộ: [IMPLEMENT](../../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_02_CLASS_PICKER.md) và [bảng đối chiếu](../ACCEPTANCE_SYNC_2026-10-22.md); nhật ký cũ giữ nguyên.
