# 6.1 Danh sách "Đơn hàng của tôi" — chỉnh UI theo base

## Mô tả

Màn danh sách đơn hàng của học viên (`OrdersScreen`): xem đơn, lọc theo trạng thái, tìm trong các đơn đã tải,
mở chi tiết đơn, tải thêm. Lượt này chỉ đổi giao diện; hook/API (`useOrders`) và màn chi tiết giữ nguyên.

## Đặc tả UI (Claude, theo yêu cầu owner ngày 2026-11-06)

- Nguồn: `assets/Student Home Page Design/Student Home.dc.html`, khối `c.subOrders` (dòng ~335–369) và logic
  `orders`/`ordFilterOpts` (dòng ~1312–1325). Khảo sát 2026-11-06.
- Yêu cầu owner: bám sát UI base; mỗi card **chỉ một nút "Xem chi tiết"** (không làm Huỷ/Thanh toán/Đánh giá/
  Vào lớp/Mua lại trên card).
- Thay đổi so với base:
  - Bộ lọc có thêm `EXPIRED` (backend có trạng thái này); thứ tự: Tất cả, Chờ thanh toán, Đã thanh toán, Hết hạn, Đã hủy.
  - Card có thêm dòng tên lớp; đơn nhiều khoá hiển thị khoá đầu + "+N khóa học khác".
  - Không hiển thị mã đơn trên card (base không có); mã đơn vẫn tìm được và nằm trong accessibilityLabel/chi tiết.
  - Ô tìm kiếm lọc phía client trên các đơn **đã tải** (API danh sách không có tham số tìm kiếm).
- Bố cục (từ trên xuống):
  1. Header 3 cột (`showTitle={false}`, truyền qua `header`), padding ngang 16, dọc 8: nút back tròn 40×40
     (viền `line`, nền `canvas`, icon `back` màu `forest`); tiêu đề giữa 18px extrabold `black`; nút lọc tròn
     40×40 icon `filter`, có chấm `coral` 9px viền trắng ở góc trên phải khi filter ≠ `ALL`.
  2. Menu lọc: thả xuống dưới nút lọc (top 46, phải 0), rộng 190, nền `canvas`, bo 14, padding 6, bóng lớn.
     Mỗi mục cao 40, bo 10, chữ 14 semibold; mục đang chọn nền `soft` và dấu ✓ màu `mint`. Chọn → đóng menu.
  3. Phụ đề 16px bold (`orders.description`).
  4. Ô tìm kiếm cao 46, bo tròn, viền `line`, icon `search` 17px màu `muted`, placeholder `orders.searchPlaceholder`.
  5. Danh sách card, gap 10. Card: hàng ngang, padding 8, gap 12, bo 18, nền `canvas`, bóng `shadow-md shadow-forest/10`.
     - Trái: thumbnail rộng 96, bo 12, `CourseCover` theo vị trí card.
     - Phải (gap 4): tên khoá 14.5px bold; tên lớp 12.5px `muted`; dòng ngày (icon `calendar` 13px + ngày giờ
       12.5px `muted`); hàng trạng thái (chữ 12.5px bold màu theo trạng thái) ↔ tổng tiền 12.5px extrabold `forest`;
       nút "Xem chi tiết" cao 38, full width, nền `forest`, chữ `canvas` 13px bold.
  6. Lỗi tải thêm / nút "Xem thêm đơn hàng" giữ như cũ.
- Màu trạng thái: `PENDING` → `ember` (#C2410C, như base), `PAID` → `mint`, `EXPIRED`/`CANCELLED` → `ink-gray`
  (base dùng #8A9A99, không có token; dùng token xám gần nhất).
- Trạng thái: loading/error/stale do `LearningState` giữ nguyên. Rỗng từ server: giữ `ScreenState` + CTA như cũ.
  Rỗng do tìm kiếm: chữ giữa `orders.searchEmpty` 14px `muted`, padding dọc 28.
- Tương tác/a11y: nút back/lọc có `accessibilityLabel`; nút lọc có `accessibilityState.expanded`; mục lọc
  `accessibilityState.selected`; vùng chạm ≥ 40 như base.
- Sai khác khi chuyển RN: thumbnail sọc dùng `CourseCover` (SVG pattern) thay `repeating-linear-gradient`.

## API / dữ liệu

- Không đổi. `GET /api/v1/orders` qua `useOrders` → [orders-payment.md](../../API_CONTRACT/orders-payment.md).

## Task

### 6.1.1 Header + menu lọc

- testID: `orders-back`, `orders-filter-toggle`, `orders-filter-dot`, `orders-filter-<STATUS>`.

### 6.1.2 Ô tìm kiếm client

- testID: `orders-search`, `orders-search-empty`; i18n `orders.searchPlaceholder`, `orders.searchEmpty`.

### 6.1.3 Card ngang

- testID giữ: `order-card-<id>`, `order-open-<id>`; i18n mới `orders.moreCourses`.

## Tiêu chí nghiệm thu

- [ ] Bố cục, màu, trạng thái như mục trên; chỉ một nút "Xem chi tiết" mỗi card.
- [ ] Lọc qua menu, chấm báo khi đang lọc, tìm theo tên khoá/lớp/mã đơn.
- [ ] Test unit xanh; lint/type-check xanh.
- [ ] Owner đối chiếu bản chạy trên máy thật/emulator (chưa kiểm tra trong lượt này).

## Bổ sung 2026-11-06: "Tiếp tục thanh toán"

- Yêu cầu owner (thay quyết định "chỉ 1 nút"): đơn Chờ thanh toán có thêm nút "Tiếp tục thanh toán" mở màn thanh toán.
- Điều kiện hiện: `status = PENDING`, `paymentType = PAYOS`, `expiresAt` còn ở tương lai (màn thanh toán chỉ có QR payOS).
- Bố cục: hai nút cùng một hàng, `justify-between`, gap 8, mỗi nút `flex-1` cao 38: trái "Xem chi tiết" viền `line`
  nền `canvas`; phải "Tiếp tục thanh toán" nền `forest`. Chữ 13px, 1 dòng, tự thu nhỏ tối đa 85%. Đơn khác giữ một
  nút "Xem chi tiết" nền `forest` full width.
- Điều hướng: `routes.payment` với `{ orderId, origin: 'learning' }` (giống resume ở Lớp học của tôi; back quay về danh sách).
- testID `order-pay-<id>`; i18n `orders.continuePayment`, `orders.payOrder`.
