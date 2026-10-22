# Business Rules

Rule nghiệp vụ của Mindy Center mà app mobile phải tuân theo: quyền, giỏ hàng, thanh toán, lớp học, tài liệu, điểm
danh, định dạng tiền và ngày giờ. Ai viết controller, spec phase hoặc review tính năng đều cần đọc. Đây là bản tóm tắt
phần ảnh hưởng tới mobile; route, body và mã lỗi đầy đủ nằm trong [API_CONTRACT/](API_CONTRACT/README.md), và contract
thắng khi hai nơi lệch nhau (xem [thứ tự ưu tiên](README.md#b1-thứ-tự-ưu-tiên-khi-các-nguồn-mâu-thuẫn)).

## 1. Chung

- Chỉ gọi API có nhãn **IMPL**. API **PLANNED** (contract [§0](API_CONTRACT/README.md#0-trạng-thái-triển-khai--đọc-trước-khi-gọi-api),
  [§22](API_CONTRACT/README.md#22-api-chưa-có--fe-không-được-gọi)) chưa có route: không làm UI gọi tới. Gồm: sửa hồ
  sơ, đổi/quên mật khẩu, tiến độ học, huỷ order/hoàn tiền, Student xem điểm danh, đổi lịch/học bù, xin nghỉ.
- Không gửi `role`, `status`, `studentId`/`mentorId` của chính mình. Server lấy người dùng từ cookie.
- Body không được có field lạ (backend trả 422). Optional rỗng thì bỏ field, không gửi chuỗi rỗng.
- Timestamp gửi lên phải có offset (`Z` hoặc `+07:00`). Query string có `+07:00` phải encode qua `URLSearchParams`.
- Dùng `asOf` của server để quyết định quyền/thời hạn, không dùng đồng hồ máy.
- Ẩn tính năng theo `user.role`, nhưng server vẫn là nơi quyết định. 403 `INSUFFICIENT_ROLE` → ẩn tính năng, không
  retry.

## 2. Auth

API: [auth.md](API_CONTRACT/auth.md).

- Khởi động app: gọi `GET auth/me`. 200 → vào app theo `role`; 401 → màn Login.
- Đăng ký: luôn hiện "Kiểm tra email", kể cả khi email đã tồn tại (response giống nhau). Password 6–128 ký tự.
- `INVALID_CREDENTIALS` là lỗi chung, không nói sai email hay sai mật khẩu.
- Đăng xuất: gọi `auth/logout`, sau đó `queryClient.clear()`, huỷ polling, xoá signed URL trong bộ nhớ, reset store.
- Google OIDC và link xác thực email đi qua redirect trình duyệt. Trên mobile cần deep link và cách chuyển cookie
  về app; contract chưa mô tả cho mobile → **chưa làm** cho tới khi thống nhất với backend. Xem
  [ADR-0013](adr/ADR-0013-defer-google-oidc-payos-deeplink.md).

## 3. Catalog, giỏ hàng, thanh toán (Student)

API: [catalog.md](API_CONTRACT/catalog.md), [cart.md](API_CONTRACT/cart.md),
[orders-payment.md](API_CONTRACT/orders-payment.md).

- Catalog chỉ trả khoá học active và lớp `OPEN`. Hiện `availableSeats`; hết chỗ thì khoá nút thêm vào giỏ.
- `courseUnitId` (thuộc khoá học) khác `classUnitId` (thuộc lớp). Không ghép theo title/position.
- Giỏ tối đa **20 lớp**. Xử lý riêng: `CART_ITEM_ALREADY_EXISTS`, `CART_LIMIT_EXCEEDED`, `CLASS_FULL`,
  `CLASS_ALREADY_ENROLLED`, `CLASS_NOT_OPEN`, `CART_EMPTY`.
- Chờ xác nhận PayOS: poll `GET me/orders/:orderId` có backoff và giới hạn số lần; dừng khi `PAID`, `EXPIRED`,
  `CANCELLED`, `REQUIRES_REVIEW`, 401, 403. Luồng mở trang PayOS và quay lại app cần deep link → thống nhất với
  backend trước khi làm ([ADR-0013](adr/ADR-0013-defer-google-oidc-payos-deeplink.md)).
- Sau checkout / PAID / xác nhận tiền mặt: refetch `me/classes`, `me/schedule`, chi tiết/preview lớp.

## 4. Lớp của tôi, lịch, tài liệu (Student)

API: [my-classes.md](API_CONTRACT/my-classes.md), [materials.md](API_CONTRACT/materials.md).

- UI chi tiết lớp theo `accessMode`: `FULL` → chi tiết đầy đủ; `CASH_PREVIEW` → màn preview; `NONE` → giải thích
  theo `accessReason`.
- Lịch hiển thị theo `timeZone` của response.
- Signed URL của tài liệu chỉ giữ trong bộ nhớ, không lưu MMKV, không cache chéo user. Hết hạn thì xin lại.
- `POST .../files/:fileId/access` cần header `Origin` (xem [guides/api-client.md](guides/api-client.md#http-client)).

## 5. Mentor

API: [mentor-teaching.md](API_CONTRACT/mentor-teaching.md), [attendance.md](API_CONTRACT/attendance.md),
[materials.md](API_CONTRACT/materials.md).

- Điểm danh: mọi mutation gửi `Idempotency-Key` và `expectedVersion` lấy từ GET mới nhất.
  409 `SESSION_VERSION_CONFLICT` → refetch và cho mentor xem lại trước khi gửi lại.
- Poll roster mỗi **30 giây** khi màn hình đang focus và buổi học `IN_PROGRESS`; dừng khi `COMPLETED`, `CANCELLED`,
  401, 403 hoặc rời màn hình.
- Xác nhận thu tiền mặt: hỏi xác nhận trước khi gửi; xử lý `CASH_ORDER_CLOSED`, `CASH_CONFIRMATION_INVALID`.
- Mutation materials và release chương cần header `Origin`.

## 6. Không optimistic update cho dữ liệu do server quyết định

- **KHÔNG ĐƯỢC** làm optimistic update cho thanh toán, điểm danh, giỏ hàng (server quyết định chỗ ngồi, giá, trạng
  thái). Chỉ cập nhật UI theo response của server.
- 409 có `expectedRevision` / `expectedVersion` → refetch rồi để người dùng quyết định lại. Không tự tăng version rồi
  retry.

Lý do: [ADR-0011](adr/ADR-0011-no-optimistic-update.md). Cách làm trong code: [guides/api-client.md](guides/api-client.md#mutation).

## 7. Định dạng tiền và ngày giờ

- Tiền: `priceAmount` là số nguyên VND, hiển thị dạng `1.500.000 VND`: nhóm nghìn bằng dấu chấm
  (`Intl.NumberFormat('vi-VN')`), sau đó một khoảng trắng và `VND`. Dùng chung một hàm `formatVnd`. Owner chốt trong
  chat ngày 2026-10-17 (Phase 2, Q10), thay cách hiển thị `Intl` currency (`1.500.000 ₫`) trước đây.
- Ngày giờ: hiển thị theo field `timeZone` của response (hiện là `Asia/Ho_Chi_Minh`), không theo múi giờ máy.
- Ngày thuần (`YYYY-MM-DD`) không chuyển qua `Date` để tránh lệch ngày.


### Điều chỉnh chọn lớp của owner — 2026-10-18

Chọn/bỏ chọn lớp trong modal chỉ thay đổi lựa chọn tạm, không thay đổi giỏ. Hiện tại mỗi khoá chỉ chọn và giữ tối đa một lớp trong giỏ; chọn lớp khác thay lựa chọn cũ. Nút icon giỏ cạnh Mua ngay xác nhận thêm lớp đã chọn, giữ modal mở. Mua ngay xác nhận thêm lớp đã chọn rồi mở giỏ. Nếu đổi lớp của cùng khoá đã có trong giỏ, thêm lớp mới thành công trước khi bỏ lớp cũ; thêm thất bại giữ lớp cũ. Chưa chọn lớp hoặc lớp đã hết chỗ thì khoá cả hai hành động. Quy tắc một lớp mỗi khoá có thể được owner điều chỉnh sau.
