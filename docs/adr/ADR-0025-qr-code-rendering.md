# ADR-0025: Thư viện render mã QR thanh toán

- Status: Accepted
- Date: 2026-10-17
- Created at: 2026-10-17T23:00:00+07:00
- Author: @Bero
- Approved by: @Bero (chat 2026-10-17, Phase 2 Q4)

## Context
Màn Thanh toán của [Phase 2](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_04_PAYMENT_QR.md) hiển thị mã QR.
Backend trả `payment.qrCode` là **chuỗi** VietQR ([orders-payment.md §11.6](../API_CONTRACT/orders-payment.md)), không
phải ảnh, nên app phải tự mã hoá chuỗi thành QR. Repo chưa có thư viện QR; `react-native-svg` đã có.

## Decision
Dùng `react-native-qrcode-svg` (JS thuần, vẽ bằng `react-native-svg`, phụ thuộc `qrcode`). Ghim phiên bản ổn định mới
nhất tại thời điểm cài, cài như `dependencies`, không cần native module mới nên không phải build lại native ngoài
autolinking hiện có. Chỉ dùng trong `src/modules/payment/`. Cập nhật bảng tech stack trong `ARCHITECTURE.md`.

## Alternatives
- Tự viết bộ mã hoá QR: dễ sai mức sửa lỗi/mask, tốn công, khó kiểm thử.
- Ảnh QR từ dịch vụ ngoài (URL sinh ảnh): gửi dữ liệu thanh toán cho bên thứ ba, phụ thuộc mạng.
- Mở `checkoutUrl` của PayOS: cần deep link quay lại app, đang hoãn theo ADR-0013.

## Consequences
+ QR render offline từ dữ liệu backend, màu chỉnh theo token.
- Thêm 2 package JS; Jest có thể cần mock `react-native-svg` như hiện tại. Cần kiểm tra quét bằng app ngân hàng thật.
