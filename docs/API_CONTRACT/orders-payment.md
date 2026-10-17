# API contract: Order và thanh toán

Order, thanh toán PayOS của Student (§11.5–11.8) và đối soát payment của Admin (§13). Quy tắc chung của §11
(chỉ thanh toán toàn bộ, giữ chỗ, redirect PayOS không xác nhận thanh toán) ở
[cart.md](cart.md#11-cart-checkout-order-thanh-toán-student).

> Số mục (§) giữ nguyên theo contract gốc để tham chiếu chéo vẫn tra được. Mục nào nằm ở file nào: xem
> [bảng đối chiếu](README.md#bảng-đối-chiếu-mục-cũ-sang-file-mới). Quy ước chung (cookie, header `Origin`,
> format lỗi, `Idempotency-Key`, polling): [README.md](README.md).

---

## 11. (tiếp) Order và thanh toán (Student)

### 11.5 GET `/api/v1/me/orders?page=1&pageSize=20&status=PAID`

200 `{ items: OrderDto[], page, pageSize, total }`. Đây là **lịch sử mua**, không phải danh sách lớp
(dùng `/me/classes`).

### 11.6 GET `/api/v1/me/orders/:orderId` — 200 `OrderPaymentDto`

`OrderDto` + `payment` (nullable):

```json
{
  "...OrderDto fields": "...",
  "payment": {
    "paymentId": "77777777-7777-4777-8777-777777777777",
    "orderId": "55555555-5555-4555-8555-555555555555",
    "providerOrderCode": 1000000000,
    "status": "PENDING",
    "checkoutUrl": "https://pay.payos.vn/web/...",
    "qrCode": null,
    "expiresAt": "2026-10-10T10:15:00.000Z",
    "amount": 1500000
  }
}
```

- `providerOrderCode`: mã số PayOS; `null` với CASH.
- `checkoutUrl` chỉ có khi payment `PENDING` và order còn trả được; ngược lại `null`.
- `qrCode` có thể `null` → dùng `checkoutUrl`.
- CASH đã xác nhận: payment `SUCCEEDED`, `checkoutUrl`/`qrCode` null.
- 403 `ORDER_ACCESS_DENIED` (order của người khác), 404 `ORDER_NOT_FOUND`.

### 11.7 POST `/api/v1/me/orders/:orderId/payments/payos` — 201 `PaymentDto`

Body `{}`. Tạo hoặc **tái sử dụng** link cho order PayOS `PENDING` còn hạn (gọi lặp an toàn).

- `status: "CREATING"` → link đang tạo, **thử lại sau vài giây** (backoff).
- `status: "PENDING"` + `checkoutUrl` → `window.location.href = checkoutUrl`.
- Lỗi: 409 `PAYMENT_ORDER_INVALID` (order không phải PayOS/đã đóng/hết hạn), 422 `PAYMENT_AMOUNT_INVALID`,
  503 `PAYMENT_UNAVAILABLE` (PayOS tạm ngừng hoặc tắt tạo link → báo thử lại sau).

### 11.8 Trang kết quả PayOS: GET `/api/v1/me/orders/payment-result?orderCode=…`

PayOS redirect về `/payment/result?orderCode=1000000000&id=…&code=…&cancel=…&status=…`.

1. Chỉ đọc `orderCode` (chuỗi số `^[1-9][0-9]{0,15}$`). **Không** tin `code/status/cancel`.
2. Gọi `GET /api/v1/me/orders/payment-result?orderCode=1000000000` → 200 `OrderPaymentDto` (giống 11.6).
3. Render theo `status` của BE:
   - `PAID` → thành công, refetch `/me/classes` + `/me/schedule`.
   - `PENDING` → "Đang chờ xác nhận", poll `GET /me/orders/:id` có backoff + giới hạn (ví dụ 3s → 5s → 10s,
     tối đa ~2 phút), dừng khi order kết thúc/401/403/rời trang.
   - `payment.status = REQUIRES_REVIEW` → "Đang đối soát", **không** mời thanh toán lại.
   - `EXPIRED`/`CANCELLED` → hết hạn giữ chỗ, mời checkout lại.
4. Lỗi: 404 mã chưa có/không hợp lệ, 403 order của người khác, 422 query sai.

---

## 13. Admin đối soát payment

Role **ADMIN**.

| Route | Response |
|---|---|
| GET `/api/v1/admin/payments/reconciliation?page&pageSize` | 200 `{ items: [{ id, paymentId\|null, providerOrderCode, referenceCode, amount, currency, reason\|null, source, actorId\|null, createdAt }], total, page, pageSize }` |
| POST `/api/v1/admin/payments/:paymentId/reconcile` (body `{}`) | 200 `{ status }` — trạng thái payment sau khi đối soát với provider |
