# 6.1 Danh sách "Đơn hàng của tôi" — nhật ký

### 2026-11-06 11:30 (+07:00) · @Bero

- Phase: 6.1.1–6.1.3 Chỉnh UI danh sách đơn hàng theo base
- Trạng thái: In review
- Đã làm: viết spec `docs/IMPLEMENT/PHASE_06_ORDERS/PHASE_06_01_ORDERS_LIST_UI.md`; đổi `OrdersScreen` sang header 3 cột (back tròn, tiêu đề giữa, nút lọc dropdown có chấm báo), ô tìm kiếm client, card ngang có thumbnail `CourseCover`, trạng thái màu chữ, một nút "Xem chi tiết". Thêm icon `search`, i18n `orders.searchPlaceholder|searchEmpty|filterLabel|moreCourses`, helper `matchesOrderQuery`.
- Test: `npx jest src/modules/orders src/modules/preview` ✓ (27) · eslint ✓ · tsc ✓ · prettier ✓. Chưa chạy native/e2e.
- Tiêu chí nghiệm thu: test/lint đạt; đối chiếu bản chạy trên emulator chưa kiểm tra.
- Đồng bộ: chưa có README phase 6 / dòng roadmap — cần owner xác nhận cấu trúc phase 6.
- PR / commit: chưa commit.
- Ghi chú: sai khác so với base ghi trong spec (thêm EXPIRED, dòng tên lớp, bỏ mã đơn trên card, màu xám dùng `ink-gray`).

### 2026-11-06 11:45 (+07:00) · @Bero

- Phase: 6.1.3 Card ngang — sửa lỗi UI
- Trạng thái: In review
- Đã làm: owner gửi ảnh emulator: card bị kéo cao vì SVG `CourseCover` (`height="100%"`) tự đặt chiều cao. Bọc cover trong lớp `absolute inset-0` để thumbnail lấp theo chiều cao nội dung.
- Test: `npx jest src/modules/orders` ✓ · eslint ✓ · prettier ✓. Chưa chụp lại trên emulator.
- Tiêu chí nghiệm thu: chờ owner đối chiếu lại bản chạy.
- PR / commit: chưa commit.

### 2026-11-06 12:00 (+07:00) · @Bero

- Phase: 6.1.3 Card — nút "Tiếp tục thanh toán"
- Trạng thái: In review
- Đã làm: thêm prop `onPay` cho `OrdersScreen`, nối `OrdersRoute` → `routes.payment` (`origin: 'learning'`). Nút chỉ hiện với đơn PENDING + PAYOS + chưa hết hạn giữ chỗ; hai nút cùng hàng `justify-between` theo yêu cầu owner.
- Test: `npx jest src/modules/orders src/modules/preview` ✓ (28) · eslint ✓ · tsc ✓. Chưa kiểm tra trên emulator.
- PR / commit: chưa commit.
