# 2.6 Tích hợp API

## Mô tả

Gắn API thật cho Catalog, Cart, Checkout PAYOS và tạo link PayOS. **Chỉ bắt đầu sau khi owner xác nhận UI** của
2.1–2.5 và có liên kết xác nhận trong PROGRESS ([ADR-0021](../../adr/ADR-0021-per-phase-ui-approval-api-uat.md)).
Claude Code đã rà và chốt đặc tả dưới đây ngày 2026-10-18 02:04, sau duyệt UI (xem mục
[Rà soát sau duyệt UI](#rà-soát-sau-duyệt-ui--2026-10-18)).

## API / dữ liệu

| Dùng ở | Route | Ghi chú |
| --- | --- | --- |
| 2.1 | `GET course-categories?page=1&pageSize=50` | Chỉ hiện `isActive` |
| 2.1 | `GET courses?page&pageSize=6&categoryId&deliveryMode` | Phân trang theo nút số (6/trang, `total` → số trang); không gửi key rỗng/`undefined` |
| 2.1 | `GET courses?page=1&pageSize=6` (không lọc) | Gợi ý = 3 khoá đầu theo thứ tự server (2.1 §API). Cùng query key với lưới khi lưới ở trang 1 không lọc |
| 2.1 | `GET courses?page=1&pageSize=1&categoryId&deliveryMode` | Sheet Bộ lọc: lấy `total` cho “Xem {n} khoá học” theo lựa chọn nháp |
| 2.1 | `GET courses/:id/classes?page=1&pageSize=100` | `nextClass` (map vào `openClass` của thẻ) = lớp có `startDate` nhỏ nhất của trang 1; không có lớp → không có `nextClass`. Một query/khoá, cache theo `courseId`; tối đa 6 request song song (một trang lưới). Lỗi → thẻ vẫn hiện, ẩn phần ngày |
| 2.1, 2.3, Home | `GET me/cart` | Badge giỏ ở Khoá học và Home; lớp đã lưu của khoá (sheet khoá học) |
| 2.2 | `GET courses/:id`, `GET courses/:id/classes?page=1&pageSize=20` | 404 `COURSE_NOT_FOUND` → trạng thái lỗi của sheet. Sheet không dùng dữ liệu thẻ đã có; tải lại theo `courseId` (cả từ Home) |
| 2.2 | `GET classes/:classId` | Thứ + giờ từ `units[].sessions[].startsAt`, hiển thị theo `Asia/Ho_Chi_Minh` (APP_TIME_ZONE, response không có `timeZone`). Tối đa 3 request song song; lỗi thì bỏ qua (chỉ hiện khoảng ngày) |
| 2.2 | `POST me/cart/items { classId }` | **Chỉ** khi bấm icon giỏ hoặc “Mua ngay” với lớp đang chọn chưa có trong giỏ. 201 `CartDto` → `setQueryData` bằng response server (không optimistic) |
| 2.2 | `DELETE me/cart/items/:classId` | **Chỉ** để bỏ lớp cũ cùng khoá **sau khi** POST lớp thay thế thành công. Chọn/bỏ chọn trong sheet không gọi API |
| 2.3 | `GET me/cart` | Refetch mỗi lần mở sheet giỏ |
| 2.3 | `DELETE me/cart/items/:classId` | Nút “Xoá”; 204 → refetch giỏ |
| 2.3 | `POST me/cart/checkout { paymentType: "PAYOS" }` | Lấy `orders[0].id` → `navigate(PAYMENT, { orderId })`. Không tự retry. Server xoá giỏ trong cùng transaction → refetch `me/cart`, invalidate lịch Home |
| 2.3 | `GET me/orders?status=PENDING&page=1&pageSize=5` | Chỉ cho “Kiểm tra lại” khi mất response checkout (xem quy tắc dưới) |
| 2.4 | `GET me/orders/:id` | `details[].courseTitle`, `orderCode`, `totalAmount`, `expiresAt`, `status` khi mở màn |
| 2.4 | `POST me/orders/:id/payments/payos {}` | `CREATING` → gọi lại sau 2s → 4s → 8s → 8s… tối đa ~30s tính từ lần gọi đầu; quá hạn → “Chưa có mã QR” + Thử lại. Gọi lặp an toàn |

### Quy tắc

- Nguồn: [catalog.md §8](../../API_CONTRACT/catalog.md#8-catalog-public), [cart.md](../../API_CONTRACT/cart.md),
  [orders-payment.md §11.6–11.7](../../API_CONTRACT/orders-payment.md), quy ước chung [README](../../API_CONTRACT/README.md).
- Response parse bằng zod (ADR-0009); DTO sai schema → `ApiError` 502 mã riêng của module, hiện trạng thái lỗi vùng.
  Route có prefix `/api/v1` qua `API_URL`; lỗi xử lý theo `statusCode + code`, không so `message`.
- Query key factory: `coursesQueryKeys`, `cartQueryKeys`, `orderQueryKeys`; key có `user.id` + `generation` của phiên
  như Home Phase 1, để đổi phiên không lộ cache người trước. Chỉ bật khi phiên STUDENT `ready`.
- Không optimistic ([ADR-0011](../../adr/ADR-0011-no-optimistic-update.md)): giỏ chỉ đổi theo response/refetch.
  Body chỉ có `classId` hoặc `paymentType`; không gửi giá.
- **Chọn lớp** (owner duyệt UI 2026-10-18): chọn/bỏ/đổi lớp chỉ đổi lựa chọn tạm. Icon giỏ → thêm lớp đã chọn, giữ
  sheet, hiện noti. “Mua ngay” → thêm lớp đã chọn, đóng sheet khoá học, mở sheet giỏ. Mỗi khoá giữ một lớp: lớp đã chọn
  chưa có trong giỏ → POST; thành công mới DELETE lớp cũ cùng khoá; POST lỗi → giữ lớp cũ. Không đụng lớp của khoá khác.
  Sau chuỗi thao tác (thành công hoặc lỗi) → refetch `me/cart`. `CART_ITEM_ALREADY_EXISTS`/`CART_ITEM_NOT_FOUND`
  coi là đã đồng bộ (chỉ refetch, không báo lỗi). Mã khác → thông báo theo `cart.errors.<code>`, mặc định `generic`.
- **Mất response checkout**: lỗi `status 0` (mạng/timeout) hoặc `≥ 500` → hiện “Không rõ đơn đã tạo chưa” + “Kiểm tra
  lại”, khoá nút Thanh toán. “Kiểm tra lại” gọi `me/orders?status=PENDING…` và tìm order `PAYOS` có tập `details[].classId`
  trùng tập `classId` của giỏ lúc checkout → mở Thanh toán. Không thấy → refetch giỏ; giỏ còn lớp → bỏ trạng thái không
  rõ, cho checkout lại; giỏ rỗng → báo `cart.errors.generic`. Lỗi 4xx (`CART_EMPTY`, `CLASS_FULL`…) → báo theo mã, refetch giỏ.
- **Thanh toán**: `PAYMENT_ORDER_INVALID` → hiện hết hạn + “Về trang Khoá học”. `PAYMENT_UNAVAILABLE`,
  `PAYMENT_AMOUNT_INVALID`, `ORDER_NOT_FOUND`, `ORDER_ACCESS_DENIED` → thông báo theo mã (key i18n có sẵn).
  Order không còn `PENDING` khi mở → coi như `PAYMENT_ORDER_INVALID`, không gọi tạo link. Không poll `PAID`.
- Sau checkout invalidate `cart` và lịch Home (`me/schedule`). Phase chưa có query `me/classes` để invalidate.
- Không route nào ở bảng trên cần header `Origin` hoặc `Idempotency-Key` ([README §1.3](../../API_CONTRACT/README.md));
  tất cả là IMPL, không có route PLANNED.
- Thông tin chuyển khoản (ngân hàng, số tài khoản, chủ tài khoản, nội dung) **không có** trong `PaymentDto`: giữ mock
  của [2.4](PHASE_02_04_PAYMENT_QR.md#dữ-liệu-mock-chuyển-khoản-q3). Khi contract BE thêm field, đồng bộ theo ADR-0026,
  map vào `bankInfo` và xoá file mock trong cùng PR.
- Preview `__DEV__` (`PhaseTwoPreview`) giữ fixture để đối chiếu UI; route production không dùng fixture.
- Ngoài phạm vi: poll `PAID`, `payment-result`, `CASH`, lịch sử đơn, mở `checkoutUrl` bằng trình duyệt.

## Bước của phase

- Bước: **API**. Liên kết xác nhận UI của owner: [PROGRESS — owner duyệt UI ngày 2026-10-18](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/README.md), lời xác nhận “UI tôi approve”.
- Test service/hook dùng MSW theo contract; test UI giữ fixture.

## Task

### 2.6.1 Catalog service và query

- File: `src/modules/courses/schemas/catalog.schema.ts`, `services/catalog.service.ts`, `hooks/useCatalogQuery.ts`;
  nối `CoursesRoute`.
- Test trước (MSW): danh mục lọc `isActive`; list gửi đúng `page/pageSize/categoryId/deliveryMode`, bỏ key rỗng;
  `nextClass` chọn `startDate` sớm nhất, lỗi lớp không làm hỏng thẻ; `total` cho bộ lọc; lỗi mạng/5xx; zod lỗi schema.
  Route: đổi chip/trang/bộ lọc gọi lại đúng tham số, đổi chip/bộ lọc về trang 1.

### 2.6.2 Cart, chi tiết khoá học và mutation

- File: `src/modules/cart/schemas/cart.schema.ts`, `cart/services/cart.service.ts`, `cart/hooks/useCartQuery.ts`,
  `courses/hooks/useCourseDetailQuery.ts`; adapter production `ShoppingSheets` (Home + Khoá học) và badge Home.
- Test trước (MSW): lấy/thêm/xoá giỏ; POST trả `CartDto` được ghi thẳng vào cache; từng mã 409/404 hiện đúng thông
  báo; đổi lớp = POST rồi DELETE, POST lỗi không DELETE; không optimistic (badge chỉ đổi sau response);
  chi tiết khoá học + lớp + lịch (lỗi `classes/:id` bỏ qua), `COURSE_NOT_FOUND`.

### 2.6.3 Checkout và tạo link PayOS

- File: `cart.service.checkout`, `src/modules/payment/schemas/order.schema.ts`, `payment/services/payment.service.ts`,
  `payment/hooks/usePaymentQuery.ts`; nối `PaymentRoute`.
- Test trước (MSW): checkout PAYOS → điều hướng với `orders[0].id`, refetch giỏ; payos `CREATING` → `PENDING` có
  `qrCode`; backoff dừng sau ~30s; `PAYMENT_UNAVAILABLE`, `PAYMENT_ORDER_INVALID`, order không `PENDING`;
  mất response checkout không retry, “Kiểm tra lại” tìm đúng order.

### 2.6.4 Kiểm tra với backend thật

- Tài khoản STUDENT test, lớp OPEN còn chỗ, PayOS sandbox. Ghi ảnh QR, kết quả quét bằng app ngân hàng (không cần
  chuyển tiền), lỗi đã tái hiện và phần không tái hiện được vào PROGRESS.

## Tiêu chí nghiệm thu

- [x] Có liên kết owner duyệt UI trước khi bắt đầu.
- [x] Không gọi API PLANNED; không gửi giá; không optimistic; lỗi theo `code`.
- [ ] QR từ backend thật quét được; giới hạn còn lại ghi trong PROGRESS.

## Rà soát sau duyệt UI — 2026-10-18

Đầu vào cần rà (ghi trước đó): “Chọn/bỏ lớp chỉ đổi draft; POST thêm giỏ chỉ ở icon giỏ hoặc Mua ngay; DELETE lớp cũ
chỉ sau khi POST lớp thay thế thành công hoặc người dùng xoá ở giỏ. Mỗi khoá giữ một lớp.” Claude Code đã chốt:

- Bảng route: bỏ dòng “DELETE … Bỏ chọn” cũ; POST/DELETE của 2.2 theo quy tắc **Chọn lớp** ở trên.
- `nextClass`: đổi `pageSize=1` thành `pageSize=100` và tự chọn `startDate` sớm nhất, vì contract không bảo đảm thứ tự
  sắp xếp của `courses/:id/classes` (Phase 1 cũng không dựa vào thứ tự). Vẫn một request/khoá.
- Thêm nguồn gợi ý (3 khoá đầu `courses?page=1` không lọc), quy tắc mất response checkout, order không `PENDING`.
- Lịch lớp hiển thị theo `Asia/Ho_Chi_Minh` vì `ClassDetailDto` không có `timeZone`; ghi lại để đối chiếu ở 2.6.4.
- Không có mâu thuẫn với contract, business rule hoặc ADR; không cần route PLANNED, không sửa hạ tầng, không thêm thư viện.


## Bàn giao API — 2026-10-18

2.6.1–2.6.3 hoàn tất code/test service, hook và route. 2.6.4 có bằng chứng Android tạo QR thật, server xoá giỏ, QR screenshot giải mã khớp backend; chưa quét bank app hoặc xác nhận sandbox phía server. Bước 2.6 **In review**, phase và 2.99 **In review — chờ owner UAT**. Không tự xác nhận các kiểm tra ngân hàng còn thiếu hoặc chuyển phase Done. Chi tiết [API_REVIEW](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/API_REVIEW.md).


## Lỗi add-to-cart và ADR-0028 — 2026-10-18

Owner đã duyệt ADR-0028. HTTP giữ mã lỗi khi optional details trả object ngoài contract, bỏ qua metadata đó thay vì mất toàn envelope; không đổi auth/retry. Thông báo CLASS_ALREADY_ENROLLED bao phủ cả đăng ký và giữ chỗ. Có hồi quy HTTP/hook/integration; native lần kiểm tra lại server cho thêm giỏ thành công, nhánh409 hậu sửa chưa tái hiện native. Xem API_REVIEW và ADR-0028.

## Trạng thái sau owner UAT — 2026-10-18

**Done** theo owner xác nhận “UAT phase 2 được approve” ngày2026-10-18. Mô tả In review ở mục bàn giao trước là lịch sử; giới hạn bằng chứng vẫn giữ tại API_REVIEW. Xem nhật ký cấp phase.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/PHASE_02_06_API_INTEGRATION.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.

- Tiêu chí checkbox thứ 3: **Chưa kiểm tra: QR backend đã tạo/hiển thị, nhưng chưa có bằng chứng quét bằng app ngân hàng. Giữ giới hạn thanh toán theo API_REVIEW; không dùng CI preview hoặc UAT tổng thể để tick ca này.**
