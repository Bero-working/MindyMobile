# Tiến độ 1.2 — Welcome và Login

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.2.1 Welcome và callback
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Welcome với hai CTA Register/Login và nút preview chỉ development; không Google/forgot/remember-me.
- Test: Test CTA đúng callback, không render Google; Android auth-ui-login đã qua trong các lần chạy trước bản asset cuối. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.2.2 Form Login
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Email trim/format/tối đa 320; password 1–128 giữ nguyên whitespace. Input autofill, Next/focus, toggle, validation blur/submit.
- Test: Schema biên password 0/1/128/129, invalid blur/submit và password whitespace xanh. Focus field đầu tiên khi submit/422 đã có test RED→GREEN. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.2.3 Pending/lỗi/thành công
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Ref lock chặn double submit ngay cả keyboard; lỗi theo code/fallback/requestId, giữ dữ liệu; success chỉ chuyển giao AuthResult theo role. Không ghi auth store hoặc route params chứa password.
- Test: Test double submit, INVALID_CREDENTIALS, requestId, giữ dữ liệu, callback role MENTOR và không callback sau unmount xanh. Production không có adapter nên disabled có giải thích. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
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
- Phase: 1.2.1–1.2.3 · Welcome/Login theo bàn giao
- Trạng thái: In progress
- Đã làm: AI thực hiện. Welcome H1 28, Login H1 26 màu đen; description 14.5; input pill trắng/line, placeholder, nút gradient có bóng; dòng chân prompt đen/link mint gạch chân. Giữ validation/password whitespace/focus/pending/error và callback role hiện có.
- Test: Auth + shared UI 32/32; test mới brand/placeholder đã RED→GREEN. Maestro lượt đầu mở/chụp Welcome/Login và nhập/toggle/submit qua; phát hiện lỗi đổi variant ở công cụ preview, đang kiểm tra lại sau sửa.
- PR / commit: Chưa tạo.
- Ghi chú: Production submit vẫn disabled khi chưa có adapter; không tạo phiên giả.

### 2026-10-17 21:08 (+07:00) · @LogKoNger
- Phase: 2 Kiểm tra sau chỉnh UI và bàn giao
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
- Đồng bộ: [IMPLEMENT](../../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_02_LOGIN.md) và [bảng đối chiếu](../ACCEPTANCE_SYNC_2026-10-22.md); nhật ký cũ giữ nguyên.
