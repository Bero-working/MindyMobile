# API contract: Giỏ hàng và checkout

Quy tắc chung của thanh toán, giỏ hàng và checkout của Student (§11 phần đầu, §11.1–11.4). Phần order và
PayOS (§11.5–11.8) ở [orders-payment.md](orders-payment.md).

> Số mục (§) giữ nguyên theo contract gốc để tham chiếu chéo vẫn tra được. Mục nào nằm ở file nào: xem
> [bảng đối chiếu](README.md#bảng-đối-chiếu-mục-cũ-sang-file-mới). Quy ước chung (cookie, header `Origin`,
> format lỗi, `Idempotency-Key`, polling): [README.md](README.md).

---

## 11. Cart, checkout, order, thanh toán (Student)

Role **STUDENT**. Quy tắc nghiệp vụ:

- **Chỉ thanh toán toàn bộ** (không trả góp). **Giá luôn do server tính**; FE không gửi giá.
- Checkout giữ chỗ (seat hold) đến `expiresAt`: PayOS mặc định **15 phút**, CASH mặc định **48 giờ**.
- **Redirect PayOS không xác nhận thanh toán.** Chỉ khi BE báo `PAID` mới có quyền học.

### 11.1 GET `/api/v1/me/cart` — 200 `CartDto`

```json
{
  "items": [{
    "classId": "33333333-3333-4333-8333-333333333333",
    "classCode": "WEB101-A", "className": "Web lớp A",
    "courseId": "22222222-2222-4222-8222-222222222222", "courseTitle": "Web cơ bản",
    "deliveryMode": "ONLINE", "startDate": "2026-10-13", "endDate": "2026-11-14",
    "priceSnapshot": 1500000,
    "currentPriceAmount": 1500000,
    "isPurchasable": true,
    "addedAt": "2026-10-10T03:00:00.000Z"
  }],
  "totalAmount": 1500000
}
```

`currentPriceAmount` là giá sẽ tính khi checkout (có thể khác `priceSnapshot`, cần hiện thay đổi).
`isPurchasable=false` → lớp không còn mua được, hiện cảnh báo và gợi ý bỏ khỏi giỏ. `totalAmount` chỉ để hiển thị.

Chi tiết hành vi (đối chiếu source 2026-10-17):

- Chưa từng thêm lớp → `200 { "items": [], "totalAmount": 0 }` (không 404).
- `items` sort theo thời điểm thêm (`addedAt` tăng dần).
- `totalAmount` = tổng `currentPriceAmount` của **mọi** item, kể cả item `isPurchasable=false`.
- `isPurchasable` = khoá học active **và** lớp `OPEN` **và** chưa qua `endDate`. Field này **không** xét
  chỗ trống: lớp hết chỗ vẫn `isPurchasable=true`, checkout sẽ trả 409 `CLASS_FULL`.
- Lớp không còn đọc được (bị xoá dữ liệu) bị bỏ khỏi `items` mà không báo lỗi.
- **Sau checkout thành công, server xoá toàn bộ giỏ trong cùng transaction tạo order.** Refetch
  `GET /me/cart` sẽ nhận `items: []`, `totalAmount: 0`; FE hiển thị đúng response, không tự giữ item cũ.
  Checkout thất bại (409/422) → giỏ giữ nguyên, refetch để hiện trạng thái mới (giá, `isPurchasable`).
- Hai checkout đồng thời của cùng học viên: request sau chờ khoá giỏ rồi nhận 409 `CART_EMPTY`,
  không tạo order trùng.

### 11.2 POST `/api/v1/me/cart/items` — 201 `CartDto`

Body `{ "classId": "<UUID v4 lớp OPEN>" }`. Lỗi: 404 `CLASS_NOT_FOUND`, 409 `CART_ITEM_ALREADY_EXISTS`,
`CART_LIMIT_EXCEEDED` (tối đa 20), `CLASS_NOT_OPEN`, `CLASS_FULL`, `CLASS_ALREADY_ENROLLED`.

### 11.3 DELETE `/api/v1/me/cart/items/:classId` — 204

404 `CART_ITEM_NOT_FOUND`.

### 11.4 POST `/api/v1/me/cart/checkout` — 201 `CheckoutResultDto`

Body `{ "paymentType": "PAYOS" }` hoặc `"CASH"`. Checkout **toàn bộ giỏ**.

- `PAYOS`: **1 order** cho cả giỏ.
- `CASH`: **1 order cho mỗi mentor** (mentor sẽ thu tiền). Tất cả order tạo trong một transaction.

```json
{
  "orders": [{
    "id": "55555555-5555-4555-8555-555555555555",
    "orderCode": "MD7K3QX9PA2B4C",
    "paymentType": "CASH",
    "status": "PENDING",
    "totalAmount": 1500000,
    "expiresAt": "2026-10-12T10:00:00.000Z",
    "paidAt": null,
    "mentorId": "44444444-4444-4444-8444-444444444444",
    "createdAt": "2026-10-10T10:00:00.000Z",
    "details": [{
      "id": "66666666-6666-4666-8666-666666666666",
      "classId": "33333333-3333-4333-8333-333333333333",
      "courseTitle": "Web cơ bản", "className": "Web lớp A",
      "priceAmount": 1500000, "quantity": 1, "totalAmount": 1500000
    }]
  }]
}
```

Lỗi: 409 `CART_EMPTY`, `CLASS_NOT_OPEN`, `CLASS_FULL`, `CLASS_ALREADY_ENROLLED`. Không tự retry khi mất
response; GET `/me/orders` để kiểm trước.

Thành công: giỏ đã bị xoá phía server (xem §11.1) → refetch `GET /me/cart` (badge giỏ = 0),
`GET /me/classes`. Một lỗi bất kỳ → **không** tạo order nào, giỏ giữ nguyên.

Sau checkout:

- `PAYOS` → gọi 11.7 tạo link rồi chuyển hướng.
- `CASH` → hiện hướng dẫn "Thanh toán tiền mặt cho mentor trước `expiresAt`"; lớp sẽ có
  `accessMode=CASH_PREVIEW` ở My Classes (§14).
