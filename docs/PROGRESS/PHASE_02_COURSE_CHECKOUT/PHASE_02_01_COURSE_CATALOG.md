# Tiến độ 2.1 — Màn Khoá học

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.

### 2026-10-17 23:59 (+07:00) · @LogKoNger
- Phase: 2.1.1 Component chung và định dạng tiền
- Trạng thái: In progress
- Đã làm: AI tách CourseTile/CourseCover/BrandBar/AppTabBar; thêm token ADR-0027; Home dùng formatVnd, ngày thuần và mũi tên.
- Test: Red xác nhận thiếu utility/token; Green Jest 19/19 (Home + utility + token).
- PR / commit: Chưa tạo.
- Ghi chú: Chưa đối chiếu thiết bị. Handle theo bằng chứng GitHub connector đã ghi ở Phase 1 ngày 2026-10-17 22:42.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.1.2 Top bar/badge/gợi ý/ribbon
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: catalog 4 test: badge 0/9+, mở khoá, vùng lỗi và empty/loading; điều chỉnh ribbon sau xem ảnh Android.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.1.3 Chip và bộ lọc
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: filter 1 test: chỉ deliveryMode, reset bỏ key rỗng; Android thao tác filter đã qua.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.1.4 Lưới và phân trang
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: catalog: trang tiếp, biên disabled, callback chỉ retry vùng lỗi; 6 thẻ/trang và ellipsis.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:29 (+07:00) · @Bero
- Phase: 2.1.4 Sửa kích thước skeleton qua đối chiếu Android
- Trạng thái: In review
- Đã làm: Ảnh Red cho thấy Skeleton kế thừa h-5 nên co thành chấm; thêm h-auto/w-full để aspect ratio dựng đúng 6 thẻ. Áp dụng cùng sửa cho skeleton ảnh sheet. Ảnh Green lưu evidence/catalog-loading.png, đã mở xem trực tiếp.
- Test: Jest catalog/courseSheet 7/7; lint/format/type-check PASS. Native visual loading/empty/error đã qua sau sửa, đang hoàn tất luồng ảnh còn lại.
- PR / commit: Chưa tạo.
- Ghi chú: Không sửa component UI bị khoá; chỉ sửa className tại nơi dùng.

### 2026-10-18 00:30 (+07:00) · @Bero
- Phase: Tự kiểm tra UI sub-phase
- Trạng thái: In review
- Đã làm: AI hoàn tất code UI/callback, tách preview khỏi production và đối chiếu nguồn. Xem UI_REVIEW.md và ảnh evidence/; chưa có owner xác nhận UI.
- Test: Tổng Jest 160/160 (38 suite); sau sửa layout skeleton chạy lại catalog/courseSheet 7/7. Lint, format, type-check PASS. Các flow Android chính đã qua, ảnh/trạng thái và giới hạn được tổng hợp ở README phase.
- PR / commit: Chưa tạo.
- Ghi chú: API 2.6 chưa triển khai theo ADR-0021; preview không chứng minh giá/chỗ ngồi/QR thật. iOS, TalkBack thủ công và Reduce Motion native chưa kiểm tra.


### 2026-10-18 00:49 (+07:00) · @Bero
- Phase: Điều chỉnh carousel theo owner
- Trạng thái: In review
- Đã làm: AI áp dụng tự chuyển mỗi 3 giây cho Home intro, Home about và Gợi ý khoá học. Chuyển theo thứ tự trái → phải; cuối danh sách về đầu tức thì, không quét ngược. Dừng khi kéo hoặc app ở nền; thao tác tay khởi động lại nhịp. Reduce Motion vẫn đổi trang mỗi 3 giây nhưng không animation. Cập nhật IMPLEMENT theo chỉ dẫn trực tiếp của owner.
- Test: Red → Green hook/tích hợp; 168/168 tests, 39 suite PASS; lint, format, type-check PASS. Android carousel-autoplay PASS cả ba carousel; checkout sau autoplay PASS (evidence/autoplay-checkout).
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Bằng chứng ở Phase 2 evidence/carousel-autoplay; iOS và Reduce Motion native chưa kiểm tra.


### 2026-10-18 01:36 (+07:00) · @Bero
- Phase: Điều chỉnh tab, noti và khoảng trắng theo owner
- Trạng thái: In review
- Đã làm: AI hạ thanh tab Home/Khoá học thêm 12dp (bottom=max(insets.bottom−12,0)); catalog giảm đệm cuối 120→100dp cộng safe area. Đưa noti chọn/bỏ lớp lên overlay đầu modal, không chiếm chiều cao hoặc chặn chạm; chưa xây component chung vì owner sẽ làm sau. Bỏ mt-auto ở giá/Mua ngay; modal vừa nội dung, giới hạn 94%, vẫn không cuộn bao ngoài hoặc nhận kéo modal. Chỉ danh sách lớp cuộn. Cập nhật IMPLEMENT và UI_REVIEW theo yêu cầu trực tiếp.
- Test: Tổng Jest 168/168, 39 suite PASS; ESLint, Prettier và TypeScript PASS trên file thay đổi. Android course-class-scroll PASS cả noti/chọn lớp/vuốt ngoài đứng yên và cuộn nội bộ. courses-browse rerun PASS bộ lọc, phân trang, mở modal, Back, giỏ rỗng. Ảnh evidence/course-modal-top-notice.png và evidence/courses-lowered-tabs.png.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Lần browse đầu thất bại do Maestro coi nút phân trang dưới lớp phủ tab là visible; sửa flow centerElement=true để cuộn vào vùng nhìn thấy trước khi bấm, rerun PASS. Raw lỗi giữ tại evidence/tabs-top-notice; final tại evidence/lowered-tabs-final. iOS/chữ lớn chưa kiểm tra lại. UI vẫn chờ owner xác nhận; API 2.6 và UAT 2.99 Todo.


### 2026-10-18 02:00 (+07:00) · @Bero
- Phase: Owner xác nhận UI sub-phase
- Trạng thái: Done (bước UI)
- Đã làm: Owner duyệt UI Phase 2 trong chat: “UI tôi approve”; bằng chứng và phạm vi tại README phase, entry cùng thời gian.
- Test: Kế thừa kiểm tra UI đã bàn giao; chỉ cập nhật tài liệu.
- PR / commit: Chưa tạo.
- Ghi chú: Không phải xác nhận UAT; API 2.6/UAT 2.99 Todo.
