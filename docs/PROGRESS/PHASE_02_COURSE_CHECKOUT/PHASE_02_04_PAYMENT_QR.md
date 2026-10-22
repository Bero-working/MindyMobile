# Tiến độ 2.4 — Màn Thanh toán QR

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.4.1 Số tiền và đồng hồ
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: countdown 1 test fake timers: hết hạn dừng interval/unmount; AppState foreground có subscription.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.4.2 QR và trạng thái
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: payment 4 test: creating, QR, thiếu QR/retry, hết hạn, leave confirm; cài react-native-qrcode-svg 6.3.26 ghim exact theo ADR-0025.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:14 (+07:00) · @Bero
- Phase: 2.4.3 Thông tin chuyển khoản/sao chép/Back
- Trạng thái: In progress
- Đã làm: AI triển khai theo bàn giao artifact 1792255829-893f.
- Test: Red (module chưa có) → Green: bankInfo test: production null, development mock; đúng một import mock, UI null chỉ 2 hàng; Android copy/Back confirm PASS.
- PR / commit: Chưa tạo.
- Ghi chú: AI tự kiểm tra hành vi; không thay owner xác nhận UI. Kiểm tra cuối/lint/ảnh tại README phase.

### 2026-10-18 00:30 (+07:00) · @Bero
- Phase: Tự kiểm tra UI sub-phase
- Trạng thái: In review
- Đã làm: AI hoàn tất code UI/callback, tách preview khỏi production và đối chiếu nguồn. Xem UI_REVIEW.md và ảnh evidence/; chưa có owner xác nhận UI.
- Test: Tổng Jest 160/160 (38 suite); sau sửa layout skeleton chạy lại catalog/courseSheet 7/7. Lint, format, type-check PASS. Các flow Android chính đã qua, ảnh/trạng thái và giới hạn được tổng hợp ở README phase.
- PR / commit: Chưa tạo.
- Ghi chú: API 2.6 chưa triển khai theo ADR-0021; preview không chứng minh giá/chỗ ngồi/QR thật. iOS, TalkBack thủ công và Reduce Motion native chưa kiểm tra.

### 2026-10-18 00:34 (+07:00) · @Bero
- Phase: 2.4.3 Toast sao chép trên màn nhỏ
- Trạng thái: In review
- Đã làm: Red native 320dp/140% thấy toast ở cuối ScrollView nên ngoài viewport; chuyển thành overlay cố định lề 20, đáy 32 + safe area, pointerEvents none theo bàn giao.
- Test: Jest payment/controller/flow 9/9; lint/format/type-check PASS. Native checkout/QR/Back/copy đã tới bước kiểm tra toast, đang chạy lại ca này sau sửa. Tổng Jest mới nhất 161/161 (38 suite).
- PR / commit: Chưa tạo.
- Ghi chú: Giữ raw log/ảnh Red tại evidence/compact-large-text-retest; kết quả Green cuối ghi ở README phase.


### 2026-10-18 02:00 (+07:00) · @Bero
- Phase: Owner xác nhận UI sub-phase
- Trạng thái: Done (bước UI)
- Đã làm: Owner duyệt UI Phase 2 trong chat: “UI tôi approve”; bằng chứng và phạm vi tại README phase, entry cùng thời gian.
- Test: Kế thừa kiểm tra UI đã bàn giao; chỉ cập nhật tài liệu.
- PR / commit: Chưa tạo.
- Ghi chú: Không phải xác nhận UAT; API 2.6/UAT 2.99 Todo.
