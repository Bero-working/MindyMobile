# Tiến độ 1.3 — Register và kiểm tra email

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.3.1 Form và payload
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Tên/email/phone/password/confirm theo contract; chỉ gửi displayName/email/password/phone khi có giá trị. Không trim password, bỏ confirm/role/status khỏi payload.
- Test: Test name whitespace/1/150/151, phone 0/6/7/32/33, password 5/6/128/129, confirm lệch và payload whitelist xanh. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.3.2 Submit và Check email
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Pending ref lock; success chuyển trạng thái Kiểm tra email trung lập rồi xoá giá trị form, không tạo session/Home. 422 map field; lỗi khác lên form.
- Test: Test accepted callback→Check email, 422 field, giữ password khi lỗi xanh; review phát hiện thiếu focus, đã sửa callback firstInvalid và scrollResponderScrollNativeHandleToKeyboard. Native Register đã qua; lần cuối đang chạy. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.3.3 Gửi lại email
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Callback resend riêng, không tự gửi khi render, pending/error/success riêng; không đếm ngược suy đoán.
- Test: Test chỉ gửi khi bấm, double press chỉ một callback, lỗi429 vẫn giữ Check email và thông báo trung lập xanh. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:46 (+07:00) · @LogKoNger
- Phase: AI tự kiểm tra sub-phase và bàn giao UAT
- Trạng thái: In review
- Đã làm: Hoàn tất phần UI trong phạm vi; dùng mascot gốc, không dùng ảnh học viên chưa xác nhận quyền. Review độc lập phát hiện focus field lỗi và accessibilityState của Button; đã sửa với test RED→GREEN. Kiểm tra native phát hiện stylesheet cũ và tên course bị lặp trong fallback; đã reset Metro, bỏ tên lặp, giữ vị trí caption. Button dùng đủ chiều ngang cho label; intro giữ vùng ảnh placeholder, about có giấy nghiêng/băng dính/góc gấp. Không thêm dependency hoặc sửa auth/backend Foundation.
- Test: Jest cuối 20 suite/97 test xanh; lint:rules, lint:code-format, lint:type-check xanh. Maestro Android 5/5 flow chính; fontScale1.3 + animator_duration_scale0 1/1, đã khôi phục font1.0 và animator không đặt (null). Kiểm tra riêng Login 1/1 và Home 1/1 sau sửa UI; báo cáo trong evidence/. Native screenshot đối chiếu đã có.
- PR / commit: Chưa tạo.
- Ghi chú: UAT owner chưa thực hiện; sub-phase In review, không Done. iOS, release binary và TalkBack thủ công chưa chạy. UI callback không chứng minh cookie/backend/auth hết phiên.

### 2026-10-17 20:52 (+07:00) · @LogKoNger
- Phase: 1.3.1–1.3.3 · Register/Check email theo bàn giao
- Trạng thái: In progress
- Đã làm: AI thực hiện. Register hero thấp hơn Login20dp; mô tả hai dòng, dòng cuối đậm. Giữ thứ tự5 field theo contract và whitelist payload. Check email dùng shell Login, hiện email, Back Android về Login, ẩn nút Back trên màn, CTA Login trước resend và feedback riêng.
- Test: Auth regression xanh; Maestro auth-ui-register lượt đầu đạt, gồm validation, submit trung lập, resend và về Login.
- PR / commit: Chưa tạo.
- Ghi chú: Không deep link, không session Register; iOS/TalkBack thủ công chưa kiểm tra.

### 2026-10-17 21:08 (+07:00) · @LogKoNger
- Phase: 3 Kiểm tra sau chỉnh UI và bàn giao
- Trạng thái: In review
- Đã làm: AI đối chiếu bản chạy với bàn giao, sửa finding quan trọng, giữ UAT cuối cùng cho owner. Home320dp đã sửa mascot che chữ; kích thước vùng chạm dùng dp tường minh.
- Test: Jest20 suite/102 test đạt; lint:rules, lint:code-format, lint:type-check đạt. Maestro main: api-health/app-launch/Login/Register đạt ở lượt2026-10-17_205658; Home đạt sau sửa flow retry ở lượt210136 (1/1). Chữ lớn1.3×/Reduce Motion1/1, visual sections1/1 và compact320dp1/1 đạt. Hệ thống máy ảo đã khôi phục1080×2400, font1.0, animator_duration_scale=null.
- PR / commit: Chưa tạo.
- Ghi chú: Bằng chứng, giới hạn và sai khác nhỏ ở README và evidence/2026-10-17-handoff-review.md. Không xác nhận cookie/backend hoặc UAT thay owner.


### 2026-10-22 09:25 (+07:00) · @Bero-working (Codex)

- Phase: Đồng bộ tiêu chí sau tổng kết test/AI review theo yêu cầu owner.
- Trạng thái: Done theo UAT owner đã có; giữ các giới hạn kiểm chứng, không ghi nhận UAT mới.
- Tiêu chí: tick bổ sung 4 mục đủ bằng chứng đã ghi; 0 mục giữ chưa đủ bằng chứng và nêu lý do trong IMPLEMENT/bảng đối chiếu.
- Test: Chỉ rà hồ sơ, không chạy lại app/Jest/Maestro/backend; không biến kết quả lịch sử hoặc owner approval thành lượt test mới.
- Đồng bộ: [IMPLEMENT](../../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_03_REGISTER.md) và [bảng đối chiếu](../ACCEPTANCE_SYNC_2026-10-22.md); nhật ký cũ giữ nguyên.
