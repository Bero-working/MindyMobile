# Nguồn thiết kế Phase 2

Khảo sát lại: Claude Code, 2026-10-17 23:53, sau khi owner publish lại artifact (version `1792255829-893f`).

## Nguồn

| Nguồn | Nội dung | Ghi chú |
| --- | --- | --- |
| [Artifact Student Home](https://claude.ai/artifact/YMKY9dp3DFE9BQ69Er6rjD) version `1792255829-893f`, `section#t2` | Màn Khoá học (`tab = courses`), sheet Bộ lọc, sheet khoá học “Lớp đang mở”, sheet Giỏ hàng, màn Thanh toán (`tab 4, sub = pay`), top bar thu gọn, tab bar, toast | Bundle đã giải nén; trích ở [source/courses-cart-payment-design.html](source/courses-cart-payment-design.html) kèm số dòng gốc |
| [claude-course-sheet-classes.png](claude-course-sheet-classes.png), [claude-courses-catalog.png](claude-courses-catalog.png), [claude-cart-sheet-empty.png](claude-cart-sheet-empty.png), [claude-payment-qr.png](claude-payment-qr.png) | Ảnh owner gửi | Dùng đối chiếu; khớp mã nguồn |

Link dự án `claude.ai/design/p/7b801e55-…` trả 403 khi đọc tự động; nguồn dùng là artifact public ở trên.

## Thay đổi so với version `1792222488-748f`

So sánh sau khi bỏ mã asset (87 dòng khác):

| Chỗ đổi | Bản cũ | Bản mới | Xử lý |
| --- | --- | --- | --- |
| Sheet khoá học | Khối `sunshine` “Lớp gần nhất” + nút “Thêm vào giỏ” + “Mua ngay” | “Lớp đang mở · n lớp”, thẻ lớp với “Chọn lớp”/“✓ Đã chọn”, giá + “Mua ngay” | [2.2](../PHASE_02_02_CLASS_PICKER.md) |
| Nút trên thẻ lưới Khoá học | Tròn 34 “+”/“✓”, bấm thêm thẳng vào giỏ | Mũi tên → `action` 22, mở sheet khoá học | [2.1](../PHASE_02_01_COURSE_CATALOG.md) |
| Nút trên thẻ “Khoá học nổi bật” của Home (dòng 408) | Như trên | Như trên | Áp dụng qua `CourseTile` dùng chung (2.1.1) |
| Carousel giới thiệu của Home (dòng 423) | Mỗi slide padding ngang 16 | Bỏ padding ngang (slide tràn mép) | Owner: áp dụng cho UI Phase 2. App đã tràn mép từ Phase 1 (`HomeCarousel` chỉ `pt-[40px]`, spec 1.4) → chỉ đối chiếu ảnh ở 2.5, không đổi code |
| Sheet `classes` (dạng gọn) | — | Có mã, không thao tác nào mở | Owner: **bỏ**, không triển khai |
| Script `onAdd` | Bật/tắt khoá trong giỏ | Mở sheet khoá học; thêm danh sách lớp, `pickCls` | 2.2 |

## Ánh xạ màu

| Hex trong nguồn | Token | Dùng |
| --- | --- | --- |
| `#338A85` | `mint` | Top bar, trang hiện tại, eyebrow sheet khoá học |
| `#1D5B57` | `forest` | Chip chọn, chấm hiện tại, số tiền, nút chính, toast |
| `#F1F7F6` | `soft` | Chip không chọn, bảng thông tin, empty |
| `#D8E9E8` | `line` | Viền nút/thẻ, grabber, phân cách |
| `#CAE1DF` | `banner` | Chấm không chọn, viền “Sao chép”, mũi tên trang bị khoá |
| `#346B68` | `muted` | Chữ phụ |
| `#FF9973` | `action` | Mũi tên thẻ khoá học, “Mua ngay”, “Thanh toán” |
| `#FF7F50` | `coral` | Badge giỏ, chấm bộ lọc |
| `#FF5400` | `headsup` | “Xoá” trong giỏ, số chỗ ít |
| `#FFDDAE` | `sunshine` | Chữ “CODING”, eyebrow thẻ lưới |
| `#FFEEE8` | `peach` | Nền chip hết hạn |
| `#C2410C` | `ember` (ADR-0027) | Chữ/icon chip hết hạn |
| `#EC4A3C` / `#C8281D` / `#8E1A12` | `ribbon` / `ribbon-deep` / `ribbon-fold` (ADR-0027) | Dải RECOMMEND |
| `rgba(18,48,46,.45)` | `forest-deep` / 45% | Nền phủ sheet |
| `oklch(0.86 0.06 h)` / `oklch(0.95 0.03 h)` | `cover-*` / `cover-*-soft` (ADR-0020) | Ảnh sọc, nền thẻ gợi ý |

## Dữ liệu trong thiết kế

- Định dạng tiền nguồn: `n.toLocaleString('vi-VN') + 'đ'`; owner chốt `1.500.000 VND` (Q10).
- Lưới 6 thẻ/trang; gợi ý 3 khoá cố định; danh mục mẫu Tất cả/Web/Python/Thuật toán/Thiếu nhi (app lấy từ API).
- Bộ lọc: Hình thức (Tất cả/Online/Offline), Sắp xếp (Mặc định/Giá thấp → cao/Giá cao → thấp — Q11).
- Thanh toán: `left` đếm từ lúc vào màn (mock 15 phút); app dùng `expiresAt` của server.
- Thông tin chuyển khoản mock: MB Bank, `0123 456 789`, `CONG TY MINDY CODING`, nội dung `MINDY {code} 1029` → app
  dùng `MINDY {orderCode}` trong file mock riêng (Q3).

## Sai khác có chủ đích

- Thanh toán trong artifact nằm dưới tab Tài khoản (tab bar hiện) → app ẩn tab bar (Q6).
- Back từ Thanh toán trong artifact về sheet giỏ → app hỏi xác nhận rồi về màn Khoá học (Q7; giỏ đã bị server xoá).
- Nguồn lưu giỏ theo khoá (`pickCls`), app lưu theo lớp: đổi lớp cùng khoá = thêm lớp mới rồi xoá lớp cũ; “Mua ngay” chọn lớp
  còn chỗ khai giảng sớm nhất thay vì lớp đầu danh sách mẫu.
- Sheet giỏ thêm dòng lớp, đổi giá, không mua được theo contract.
- Placeholder “ảnh khoá học”, “mã QR thanh toán” chỉ là nhãn thiết kế, không hiển thị.
