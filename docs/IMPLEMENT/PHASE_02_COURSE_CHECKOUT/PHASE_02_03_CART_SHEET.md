# 2.3 Sheet Giỏ hàng

## Mô tả

Bottom sheet mở từ nút giỏ (màn Khoá học, Home) và sau “Mua ngay”. Hiện các lớp trong giỏ, tổng cộng và nút Thanh
toán. Bấm Thanh toán tạo đơn PAYOS rồi chuyển sang màn Thanh toán QR ([2.4](PHASE_02_04_PAYMENT_QR.md)).

## Đặc tả UI từ Claude Design (Claude Code bàn giao, 2026-10-17 23:45)

Nguồn: artifact mục 2 [bản trích dòng 959–962, 983–995, 1675–1679](references/source/courses-cart-payment-design.html);
ảnh [claude-cart-sheet-empty.png](references/claude-cart-sheet-empty.png).

### Khung sheet chung

Dùng cho Giỏ hàng, sheet khoá học (2.2) và Bộ lọc (2.1). `@gorhom/bottom-sheet`:

- Nền phủ: `forest-deep` opacity **0.45**, fade vào; chạm để đóng.
- Sheet: nền `canvas`, bo trên **28**, padding `10 18 32` (+ `insets.bottom`), cao theo nội dung, tối đa **82%** màn,
  nội dung cuộn bên trong; trượt lên khi mở.
- Grabber: 40×5, bo 9, `line`, căn giữa, margin dưới 14.
- Reduce Motion: mở/đóng không lò xo (tuyến tính ngắn).

### Nội dung giỏ

| Phần | Thông số |
| --- | --- |
| Tiêu đề | “Giỏ hàng ({n})” **22 / 900** tracking −0.44, margin dưới 10 |
| Hàng lớp | padding dọc 12, viền dưới 1 `line`, gap 12, căn giữa dọc. Ảnh 54×54 bo 12 (`CoverImage` hoặc sọc 135° 6px `cover-*`). Cột chữ flex 1: tên khoá 15/800 `black`; giá 14/800 `forest` margin-top 2. Nút chữ “Xoá” 13/800 `headsup`, nền trong suốt (vùng chạm 44) |
| Rỗng | padding dọc 28, “Giỏ hàng đang trống.” 14/600 `muted` căn giữa |
| Tổng | `space-between` margin `16 0 14`: “Tổng cộng” 15/700 `muted`; số tiền **22 / 900** `black` |
| CTA | “Thanh toán” rộng 100%, cao 52, **bo 14**, nền `action`, chữ `canvas` 16/900 |

### Bổ sung bắt buộc theo contract (không có trong thiết kế)

- Dòng phụ dưới tên khoá: “{tên lớp} · {ONLINE/OFFLINE} · KG {dd/MM}” 12.5 `muted` — giỏ có thể chứa nhiều lớp cùng khoá.
- Đổi giá (`currentPriceAmount ≠ priceSnapshot`): giá hiển thị là `currentPriceAmount`; bên cạnh giá cũ gạch ngang
  12/600 `muted`; dòng “Giá đã thay đổi” 12/700 `status-yellow`.
- `isPurchasable=false`: hàng opacity 0.6, dòng “Lớp không còn mở đăng ký — hãy xoá khỏi giỏ.” 12/700 `status-red`;
  CTA disabled, phía trên CTA dòng giải thích 13/700 `status-red`.
- CTA disabled (giỏ rỗng hoặc còn lớp không mua được): giữ màu `action`, opacity 0.6 — ảnh giỏ rỗng hiện nút màu đầy đủ
  nhưng thiết kế cũng `return` khi giỏ rỗng.
- `totalAmount` lấy từ server (gồm cả lớp không mua được, theo [cart.md §11.1](../../API_CONTRACT/cart.md)); không tự cộng.

## Trạng thái

- Loading: skeleton 2 hàng + tổng. Error: thông điệp + Thử lại trong sheet, CTA disabled.
- Xoá: nút “Xoá” thành spinner, hàng giữ nguyên tới khi server trả 204 rồi refetch (ADR-0011). 404 `CART_ITEM_NOT_FOUND` → refetch im lặng.
- Thanh toán pending: CTA spinner “Đang tạo đơn…”, khoá đóng sheet và Xoá.
- Thành công: server đã xoá giỏ trong cùng transaction (Q9) → refetch giỏ (badge = 0), đóng sheet, điều hướng màn
  Thanh toán với `orderId`.
- Lỗi checkout: giỏ giữ nguyên, refetch để hiện giá/`isPurchasable` mới. `CART_EMPTY` → “Giỏ hàng đã trống.” (cũng là
  kết quả khi có checkout đồng thời); `CLASS_NOT_OPEN`/`CLASS_FULL`/`CLASS_ALREADY_ENROLLED` → thông điệp riêng trên
  CTA. `isPurchasable` không xét chỗ trống: lớp hết chỗ chỉ biết khi checkout trả `CLASS_FULL`.
- Mất response/timeout: **không tự retry**; “Không rõ đơn đã tạo chưa.” + nút “Kiểm tra lại” (2.6 gọi
  `GET me/orders?status=PENDING`, có đơn mới → mở màn Thanh toán).

## Tương tác

- Phương thức thanh toán: chỉ `PAYOS` (QR). Không có CASH trong phase này.
- Đóng: kéo xuống, chạm nền phủ, Back Android (trừ khi pending).
- Accessibility: tiêu đề là `header`; tổng đọc “Tổng cộng {số tiền}”; “Xoá” đọc “Xoá {tên khoá} {tên lớp} khỏi giỏ”.

## API / dữ liệu

- UI: props `cart`, `status`, `onRemove(classId)`, `onCheckout()`.
- API (2.6): `GET me/cart`, `DELETE me/cart/items/:classId`, `POST me/cart/checkout { paymentType: "PAYOS" }`
  → [cart.md §11.1, 11.3, 11.4](../../API_CONTRACT/cart.md).

## Bước của phase

- Bước: **UI**.

## Task

### 2.3.1 Khung sheet chung, rỗng và tổng

- Test trước: rỗng hiện “Giỏ hàng (0)”, “Giỏ hàng đang trống.”, `0 VND`, CTA disabled; nền phủ đóng sheet.
- testID: `app-sheet`, `app-sheet-backdrop`, `cart-sheet`, `cart-title`, `cart-empty`, `cart-total`, `cart-checkout`.
- i18n key: `cart.title`, `cart.empty`, `cart.total`, `cart.checkout`.

### 2.3.2 Hàng lớp, đổi giá, không mua được, Xoá

- Test trước: dòng phụ lớp; đổi giá hiện giá cũ; `isPurchasable=false` khoá CTA; Xoá gọi `onRemove` một lần, hàng không biến mất trước khi callback xong.
- testID: `cart-item-{classId}`, `cart-item-remove-{classId}`, `cart-item-price-changed-{classId}`, `cart-item-unavailable-{classId}`.
- i18n key: `cart.item.meta`, `cart.item.priceChanged`, `cart.item.unavailable`, `cart.item.remove`.

### 2.3.3 Checkout pending và lỗi

- Test trước: pending khoá thao tác; mỗi mã lỗi đúng thông điệp; thành công gọi `onCheckoutSuccess(orderId)`; mất response hiện “Kiểm tra lại”.
- testID: `cart-checkout-error`, `cart-checkout-verify`.
- i18n key: `cart.errors.*`, `cart.checkoutPending`, `cart.checkoutUnknown`, `cart.checkoutVerify`.

## Tiêu chí nghiệm thu

- [ ] Khớp artifact/ảnh: nền phủ tối 45%, bo 28, grabber, tiêu đề, hàng 54×54 + “Xoá” cam, tổng 22/900, CTA bo 14.
- [ ] Bổ sung contract (lớp, đổi giá, không mua được) được owner xác nhận ở mốc duyệt UI.
- [ ] Không optimistic, không gửi giá, lỗi theo `code`; không tự retry checkout.
