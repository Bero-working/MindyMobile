# 2.5 Điều hướng và kiểm thử luồng UI

## Mô tả

Đăng ký màn Khoá học và Thanh toán, nối điểm vào từ Home, kiểm thử luồng UI Khoá học → chọn lớp → giỏ → QR trên thiết bị.

Sửa `src/navigation/index.tsx` theo [ADR-0024](../../adr/ADR-0024-phase-02-navigation-routes.md) (Accepted 2026-10-17).

## Đặc tả

- Route mới: `courses = 'COURSES'`, `payment = 'PAYMENT'` (params `{ orderId: string }`). Sửa đủ 4 chỗ theo kiến
  trúc: `routes.ts`, `RootStackParamList`, `src/modules/index.ts`, `<Stack.Screen>`. Chỉ đăng ký trong nhánh phiên
  **STUDENT** đã có từ Phase 1; staff không thấy.
- Module: `src/modules/courses/` (màn Khoá học, sheet khoá học, bộ lọc), `src/modules/cart/` (sheet giỏ),
  `src/modules/payment/` (màn QR). Mỗi module theo mẫu `services/ hooks/ components/ types/ schemas/`.
- Sheet giỏ và sheet khoá học là component dùng chung mở từ Home và Khoá học, không phải route. “Mua ngay” thành công → đóng sheet khoá học, mở sheet giỏ. Trạng thái mở/đóng sheet giữ trong
  controller của màn, không đưa vào Zustand.
- Chuyển Khoá học ↔ Home qua tab bar: `navigation.navigate` (không push chồng). Khoá học không có nút back.
- Nối Phase 1: Home tab “Khoá học”, CTA “Khám phá khoá học”, nút giỏ (mở sheet giỏ ngay trên Home), `+` trên thẻ
  Home (mở sheet khoá học). Bỏ trạng thái disabled “chưa có màn” của các điểm này; giữ disabled cho Lịch học,
  Thông báo, Tài khoản.
- Checkout xong: `navigation.navigate(routes.payment, { orderId })`. Rời Thanh toán: `navigate(routes.courses)`;
  không để Back quay lại sheet giỏ đang pending.
- Preview `__DEV__`: thêm mục Khoá học/Giỏ/Thanh toán với fixture vào preview Phase 1; không có trong release.

## Bước của phase

- Bước: **UI**.

## Task

### 2.5.1 Đăng ký route và điểm vào

- Test trước: tab Khoá học mở `COURSES`; Home giỏ mở sheet; `+` mở sheet khoá học; “Mua ngay” mở sheet giỏ; checkout callback điều hướng
  `PAYMENT` với `orderId`; role staff không có route; Back Android ở Thanh toán hiện xác nhận.
- testID: tái dùng của 2.1–2.4.

### 2.5.2 Kiểm thử trên thiết bị

- RNTL cho luồng ghép bằng fixture. Maestro: `e2e/flows/courses-browse.yaml` (lọc chip, bộ lọc, lật trang, mở sheet khoá học),
  `e2e/flows/cart-checkout-qr.yaml` (Chọn lớp → Mua ngay → giỏ → Thanh toán → thấy `payment-qr`). Flow UI chạy với preview;
  bản chạy backend thật bổ sung ở 2.6.
- Chụp ảnh từng màn/trạng thái, so cạnh 4 ảnh tham chiếu và artifact `1792255829-893f`; gồm cả Home: thẻ “Khoá học nổi bật”
  dùng mũi tên và carousel giới thiệu tràn mép (thay đổi của nguồn mới, owner áp dụng cho UI Phase 2); kiểm tra Android Back, chữ lớn, đọc màn hình, Reduce Motion, màn nhỏ.

## Tiêu chí nghiệm thu

- [x] Không có route chưa đăng ký hay nút chết; release không có fixture/preview.
- [x] ARCHITECTURE cập nhật cùng thay đổi navigator theo ADR-0024.
- [x] Ảnh đối chiếu và kết quả Maestro trong PROGRESS; phase chuyển In review “chờ owner xác nhận UI”.


## Chạy E2E không cần APP_ID thủ công — 2026-10-18

Owner chạy npm run test:e2e không truyền -e nên cả9flow nhận appId undefined và không mở được app. Mọi flow E2E dùng biểu thức mặc định APP_ID || "com.mindymobile", vẫn ưu tiên -e APP_ID khi truyền. Giữ package script/hạ tầng hiện có; không thêm thư viện. Cập nhật CONTRIBUTING và kiểm tra đúng lệnh npm run test:e2e không -e trên Android. Phase/UAT giữ In review dù test đạt, chờ owner duyệt lại.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/PHASE_02_05_NAVIGATION.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.
