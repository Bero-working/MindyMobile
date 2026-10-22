# 2.4 Màn Thanh toán QR

## Mô tả

Màn cuối của Phase 2. Hiện số tiền, thời gian giữ chỗ còn lại, mã QR PayOS để quét bằng app ngân hàng, bảng thông
tin chuyển khoản và ghi chú. **Không** theo dõi kết quả thanh toán (không poll `PAID`) trong phase này.

## Đặc tả UI từ Claude Design (Claude Code bàn giao, 2026-10-17 23:45)

- Nguồn: artifact mục 2, `tab = 4, sub = 'pay'` — [bản trích dòng 707–734, 1558, 1590–1596](references/source/courses-cart-payment-design.html);
  ảnh [claude-payment-qr.png](references/claude-payment-qr.png). Trong artifact màn này nằm dưới tab Tài khoản nên ảnh
  có tab bar; app **ẩn tab bar** (Q6).
- Khung: nền `canvas`, nội dung `ScrollView` padding ngang 20, trên `insets.top + 16`, đáy `insets.bottom + 24`.

| # | Khối | Thông số |
| --- | --- | --- |
| 1 | Header | lưới `40 · 1fr · 40`, margin dưới 16. Back 40×40 tròn, viền `line` 1, nền `canvas`, “‹” 20/700 `forest` (dùng icon chevron cùng cỡ). “Thanh toán” 18/800 căn giữa |
| 2 | Nhãn số tiền | căn giữa, 13 `muted` “Số tiền cần thanh toán” |
| 3 | Số tiền | 28/800 `forest` tracking −0.56, margin-top 2 |
| 4 | Chip hết hạn | margin-top 8, inline, gap 6, padding `4 10`, pill, nền `peach`, chữ 12.5/700 `ember`; icon đồng hồ 13 stroke `ember` 2 (`M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2`); “Hết hạn sau mm:ss”, chữ số `tabular-nums`. Màu `ember` theo [ADR-0027](../../adr/ADR-0027-phase-02-design-tokens.md) |
| 5 | Thẻ QR | margin-top 16, căn giữa, rộng **220**, padding 12, bo 20, viền `line` 1, nền `canvas`, bóng `0 4 16 forest/8`. QR vuông (196), bo 10, module `forest`, nền `canvas`, mức sửa lỗi M, quiet zone thư viện. Chú thích “Quét mã bằng app ngân hàng” 12.5 `muted` căn giữa margin-top 8 |
| 6 | Bảng thông tin | margin-top 18, bo 18, nền `soft`, padding `4 14`. Hàng: tối thiểu 52, gap 10, căn giữa dọc, viền dưới 1 `line` (trừ hàng cuối). Nhãn rộng 96, 12.5 `muted`; giá trị flex 1, 14/700 `black`, tự xuống dòng; “Sao chép” cao 30, padding ngang 10, pill, viền 1 `banner`, nền `canvas`, chữ 12/700 `forest` |
| 7 | Ghi chú | margin-top 10, 12.5 line-height 1.5 `muted`: “Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự xác nhận đơn hàng.” |
| 8 | Toast | nền `forest`, chữ `canvas` 14/700, bo 14, padding `13 16`, cách lề 20, cách đáy 32 + `insets.bottom` (không có tab bar), bóng `0 10 30 forest/30` |

### Hàng của bảng thông tin

Thứ tự theo artifact:

| Hàng | Nguồn | Sao chép |
| --- | --- | --- |
| Khoá học | `order.details[].courseTitle` nối bằng “, ” | Không |
| Ngân hàng | **mock** `bankName` | Không |
| Số tài khoản | **mock** `accountNumber` | Có |
| Chủ tài khoản | **mock** `accountName` | Không |
| Số tiền | `payment.amount` → `formatVnd` | Không |
| Nội dung | **mock** `transferNote(orderCode)` → `MINDY {orderCode}` | Có |

### Dữ liệu mock chuyển khoản (Q3)

- Owner quyết định dùng dữ liệu thiết kế cho đến khi backend trả dữ liệu thật. Gom **toàn bộ** vào một file:
  `src/modules/payment/mocks/bankTransfer.mock.ts`, export `bankTransferMock: BankTransferInfo` (`bankName: 'MB Bank'`,
  `accountNumber: '0123 456 789'`, `accountName: 'CONG TY MINDY CODING'`, `transferNote: (orderCode) => \`MINDY ${orderCode}\``),
  đầu file có chú thích `MOCK — xoá khi backend trả thông tin chuyển khoản (Phase 02 Q3)`.
- Chỉ **một** chỗ import: `usePaymentController` gán `bankInfo: BankTransferInfo | null`. UI chỉ nhận `bankInfo` qua
  props; `null` → ẩn 4 hàng mock và giữ Khoá học + Số tiền. Gỡ mock = xoá file + đổi dòng gán thành `null`
  (hoặc map từ API mới). Không đặt chuỗi mock trong i18n, fixture test hay component.
- Q12 (owner duyệt): chỉ gán mock khi `env.APP_ENV !== 'production'` (đọc qua `src/config/env.ts`); bản phát hành
  `bankInfo = null`, không hiện tài khoản không có thật. Mã QR luôn lấy từ backend, không bị ảnh hưởng.
- Test bắt buộc: `APP_ENV=production` → `bankInfo = null`; `development` → mock; `bankInfo = null` không render hàng mock; tìm toàn repo chỉ có một import `bankTransfer.mock`.

## Trạng thái

- Đang tạo link (`payment.status = CREATING` hoặc chưa có payment): thẻ QR hiện skeleton vuông + “Đang tạo mã thanh
  toán…”; chip hết hạn ẩn. Backoff do tầng 2.6 lo.
- Thành công: `payment.status = PENDING` + `qrCode` → QR.
- `qrCode = null` (Q8): thẻ QR thay bằng “Chưa có mã QR cho đơn này.” + “Thử lại”; không mở `checkoutUrl`.
- Hết hạn: đồng hồ về `00:00` (từ `payment.expiresAt`, fallback `order.expiresAt`) hoặc `PAYMENT_ORDER_INVALID` → QR
  opacity 0.15 + lớp phủ “Mã đã hết hạn” 16/900 `status-red`; chip “Đã hết hạn”; nút “Về trang Khoá học” cao 52 bo 14
  nền `forest` chữ `canvas` 15/900 dưới thẻ QR; nút Sao chép ẩn.
- Lỗi khác: `PAYMENT_UNAVAILABLE` (503) → “Cổng thanh toán tạm ngưng, thử lại sau.” + Thử lại;
  `PAYMENT_AMOUNT_INVALID` → “Không tạo được mã thanh toán.”; `ORDER_NOT_FOUND`/`ORDER_ACCESS_DENIED` → khối lỗi + nút về Khoá học.
- Đồng hồ: cập nhật mỗi giây, dừng khi unmount/hết hạn; tính lại khi app về foreground (`AppState`). Lệch đồng hồ máy
  được chấp nhận và ghi trong PROGRESS.

## Tương tác

- Sao chép → `@react-native-clipboard/clipboard`, toast “Đã sao chép {nhãn viết thường}” (như artifact).
- Back/nút back khi QR còn hạn → hộp thoại (Q7): tiêu đề “Rời trang thanh toán?”, nội dung “Đơn vẫn giữ chỗ tới
  {HH:mm}. Hiện chưa mở lại được mã QR sau khi rời trang.”, nút “Ở lại” / “Rời đi”. Rời đi → màn Khoá học (giỏ đã trống
  phía server nên không quay về sheet giỏ như artifact). Hết hạn → rời không hỏi.
- Không có nút “Tôi đã thanh toán” (artifact có `confirmPaid` nhưng không hiển thị; ngoài phạm vi).
- Accessibility: QR nhãn “Mã QR thanh toán {số tiền}”; chip không đọc mỗi giây — chỉ thông báo khi còn 1 phút và khi
  hết hạn; chữ lớn (`fontScale > 1.3`): hàng thông tin xếp nhãn trên, giá trị dưới; Reduce Motion: QR hiện không animation.

## API / dữ liệu

- Route params: `{ orderId: string }`.
- UI: props `order`, `payment`, `bankInfo`, `status`, `now`, `onRetry`, `onCopy`, `onLeave`; fixture QR trong test/preview
  là chuỗi giả rõ ràng (không phải VietQR thật).
- API (2.6): `POST me/orders/:orderId/payments/payos {}`, `GET me/orders/:orderId` → [orders-payment.md §11.6–11.7](../../API_CONTRACT/orders-payment.md).

## Bước của phase

- Bước: **UI**. Task 2.4.2 cài `react-native-qrcode-svg` theo [ADR-0025](../../adr/ADR-0025-qr-code-rendering.md)
  (Accepted) và cập nhật bảng tech stack trong ARCHITECTURE.

## Task

### 2.4.1 Khung màn, số tiền, chip đếm ngược

- Test trước: `formatVnd`; đồng hồ đếm từ `expiresAt` với fake timers; về `00:00` chuyển hết hạn; AppState foreground tính lại.
- testID: `payment-screen`, `payment-back`, `payment-amount`, `payment-expiry`.
- i18n key: `payment.title`, `payment.amountLabel`, `payment.expiresIn`, `payment.expired`.

### 2.4.2 Thẻ QR và trạng thái

- Test trước: creating → skeleton; `qrCode` → QR với đúng `value`; `qrCode` null → fallback + retry; hết hạn → lớp phủ + nút về Khoá học.
- testID: `payment-qr`, `payment-qr-loading`, `payment-qr-missing`, `payment-qr-expired`, `payment-retry`, `payment-go-courses`.
- i18n key: `payment.qr.caption`, `payment.qr.creating`, `payment.qr.missing`, `payment.qr.expired`, `payment.errors.*`.

### 2.4.3 Bảng thông tin, mock, sao chép, rời màn

- Test trước: 6 hàng theo thứ tự khi có `bankInfo`; 2 hàng khi `null`; Sao chép số tài khoản/nội dung gọi clipboard
  đúng giá trị + toast; Back hiện hộp thoại khi còn hạn, không hỏi khi hết hạn.
- testID: `payment-info`, `payment-info-row-{key}`, `payment-copy-{key}`, `payment-note`, `payment-leave-dialog`, `payment-toast`.
- i18n key: `payment.info.*`, `payment.note`, `payment.copied`, `payment.leave.*`.

## Tiêu chí nghiệm thu

- [x] Khớp artifact/ảnh: header, số tiền 28/800, chip peach, thẻ QR 220, bảng 6 hàng, ghi chú; tab bar ẩn.
- [ ] QR từ backend thật quét được bằng app ngân hàng (kiểm ở UAT), màu `forest` đủ tương phản.
- [x] Mock chuyển khoản chỉ ở một file/một import, gỡ được trong một thay đổi nhỏ; production không hiện mock (Q12).
- [x] Không mở trình duyệt PayOS; đồng hồ không rò rỉ interval.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/PHASE_02_04_PAYMENT_QR.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.

- Tiêu chí checkbox thứ 2: **Chưa kiểm tra: chưa có kết quả quét QR backend bằng app ngân hàng/xác minh sandbox. Owner đã duyệt UAT Phase 2 với giới hạn ghi trong API_REVIEW; thanh toán hiện payment-pending, ngoài CI bắt buộc theo owner.**
