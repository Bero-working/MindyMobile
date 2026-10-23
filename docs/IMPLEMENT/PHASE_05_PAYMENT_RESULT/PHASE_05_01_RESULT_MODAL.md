# 5.1 Payment result ticket

## Mô tả và nguồn

Bổ sung ticket kết quả trên màn QR hiện tại. Mốc UI được kiểm tra bằng fixture/callback trước khi nối API ở 5.3. Nguồn ảnh và lịch sử thay đổi tại [DESIGN_SOURCE](references/DESIGN_SOURCE.md); tuân thủ ADR-0029. Trạng thái **Done** — owner đã duyệt UI và xác nhận UAT trong chat; giới hạn kiểm tra accessibility bên dưới được giữ riêng.

## Đặc tả UI mới — ticket theo ảnh owner ngày 2026-10-22

Nguồn và thông số cuối tại [DESIGN_SOURCE](references/DESIGN_SOURCE.md#thay-đổi-nguồn-theo-ảnh-owner--2026-10-22). Giấy SVG mép xé, thông tin in phẳng và CTA bên ngoài; không dùng khung/card bo góc. Bố cục modal cũ chỉ còn trong bằng chứng lịch sử.

### Bố cục và trạng thái cuối

- Giấy SVG trắng liên tục, cạnh trên gần vuông, mép dưới rách dạng sóng; rộng viewport trừ48dp, tối đa360dp. Không card, bóng hoặc nền bo góc trong ticket.
- Nội dung: dấu trạng thái56dp → tiêu đề22/28dp → mô tả14/21dp → đường đục lỗ → mã đơn13/19dp → tổng tiền28/34dp. Dữ liệu phẳng trên giấy; không thêm trường đơn giả.
- Giấy padding24dp, chừa34dp đáy gồm mép xé. Một CTA nằm ngoài giấy, cách20dp, cao>=52dp, góc2dp. Nền thanh toán tối lại và bị cô lập tương tác.
- Ticket và CTA trong một vùng cuộn safe-area, không giới hạn chiều cao giấy. Font lớn/màn thấp cuộn được đến nút.
- Chỉ ba ticket PAID (SUCCESS), CANCELLED (FAIL), EXPIRED. Các trạng thái khác không tạo ticket. Không dùng màu đơn lẻ để báo trạng thái; SVG + tiêu đề/mô tả. Số tiền dùng formatVnd, text payment.result.* đủ Việt/Anh.
- Không đóng bằng backdrop, không tự chuyển Home, không hẹn giờ đóng. Native presentation dùng để giữ focus/Back và cô lập nền; hình thức là tờ vé, không khung dialog. Không animation tự chạy; nút kế thừa Reduce Motion.
- PAID “Về trang chủ”; CANCELLED/EXPIRED “Thử lại” về Courses. Khóa bấm lặp khi rời ticket, không thêm nút kiểm tra lại. QR/loading/lỗi giữ giao diện hiện có ngoài ticket.

## Task tuần tự

### 5.1.1 Chốt nguồn và mô hình trạng thái UI

Owner cung cấp ảnh ticket sau bản đầu; đã cập nhật references và đặc tả trước khi sửa UI ticket. Viết test fail cho mapping fixture PAID/CANCELLED/EXPIRED; dùng view model riêng, không mở rộng enum API. Sau đó tạo props/type tối thiểu. testID gốc: `payment-result-surface`; i18n: `payment.result.*`.

### 5.1.2 Render ticket

Test fail cho title, mô tả, dữ liệu đơn và CTA đúng trạng thái; component module-local `src/modules/payment/components/PaymentResultTicket.tsx` tái sử dụng UI hiện có. testID: `payment-result-title`, `payment-result-description`, `payment-result-order`, `payment-result-ticket`. Không sửa `src/components/ui/**` đang khoá.

### 5.1.3 Accessibility và đối chiếu

Test hành vi focus/thông báo lặp; kiểm tra native màn thường, 320dp, font 1.3×, màn thấp và Reduce Motion. Lưu ảnh từng trạng thái và sai khác trong PROGRESS; fixture không chứng minh thanh toán thật.

## Tiêu chí nghiệm thu

Xem [đối chiếu UI](../../PROGRESS/PHASE_05_PAYMENT_RESULT/UI_REVIEW.md); owner đã duyệt UI, các vế TalkBack/iOS/Reduce Motion native còn thiếu bằng chứng đầy đủ.

- [x] Có nguồn/bố cục được owner chọn và thông số; bố cục/asset được đối chiếu trên native.
- [x] Đủ trạng thái; không lộ thao tác QR bên dưới; không đóng ngoài ý muốn.
- [ ] Nội dung Việt/Anh, target ≥44×44dp, chữ lớn và focus/Reduce Motion đúng.
- [x] Test UI và ảnh đối chiếu có revision/môi trường; sai khác ghi PROGRESS.

Kết quả UI và xác nhận owner được ghi tại [nhật ký 5.1](../../PROGRESS/PHASE_05_PAYMENT_RESULT/PHASE_05_01_RESULT_MODAL.md) và [nhật ký phase](../../PROGRESS/PHASE_05_PAYMENT_RESULT/README.md).

Bằng chứng: UI_REVIEW, ảnh mới ba trạng thái tại three-results-normal/three-results-compact, unit và Maestro fixture. Mục accessibility đạt một phần: ngôn ngữ/target/chữ lớn/focus có bằng chứng; TalkBack/iOS và Reduce Motion native chưa kiểm tra đầy đủ. Không tick cả mục theo kết quả unit.
