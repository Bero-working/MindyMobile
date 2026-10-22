# Tiến độ 2.3 — Sheet Giỏ hàng

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.3.1 Khung sheet và giỏ rỗng
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: cart: rỗng, total 0, CTA disabled; khung gorhom, backdrop 45%, inset bottom.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.3.2 Dòng lớp/đổi giá/không mua được
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: cart: total từ props không tự cộng; đổi giá, unavailable, callback remove giữ item tới dữ liệu cập nhật.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.3.3 Checkout pending/lỗi
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: cart: pending khoá xoá/checkout; unknown khoá retry checkout và hiện verify. Flow ghép callback checkout tới QR PASS.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:30 (+07:00) · @Bero
- Phase: Tự kiểm tra UI sub-phase
- Trạng thái: In review
- Đã làm: AI hoàn tất code UI/callback, tách preview khỏi production và đối chiếu nguồn. Xem UI_REVIEW.md và ảnh evidence/; chưa có owner xác nhận UI.
- Test: Tổng Jest 160/160 (38 suite); sau sửa layout skeleton chạy lại catalog/courseSheet 7/7. Lint, format, type-check PASS. Các flow Android chính đã qua, ảnh/trạng thái và giới hạn được tổng hợp ở README phase.
- PR / commit: Chưa tạo.
- Ghi chú: API 2.6 chưa triển khai theo ADR-0021; preview không chứng minh giá/chỗ ngồi/QR thật. iOS, TalkBack thủ công và Reduce Motion native chưa kiểm tra.


### 2026-10-18 02:00 (+07:00) · @Bero
- Phase: Owner xác nhận UI sub-phase
- Trạng thái: Done (bước UI)
- Đã làm: Owner duyệt UI Phase 2 trong chat: “UI tôi approve”; bằng chứng và phạm vi tại README phase, entry cùng thời gian.
- Test: Kế thừa kiểm tra UI đã bàn giao; chỉ cập nhật tài liệu.
- PR / commit: Chưa tạo.
- Ghi chú: Không phải xác nhận UAT; API 2.6/UAT 2.99 Todo.
