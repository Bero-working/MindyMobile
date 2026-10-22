# Tiến độ 1.5 — Điều hướng và kiểm thử luồng UI

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.5.1 Route và ranh giới preview
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Theo ADR-0018, thêm routes/paramlist/module exports/Stack.Screen; Welcome là initial route. Route preview chỉ __DEV__, component cũng guard release. Home production yêu cầu phiên thật, không dùng fixture hoặc role mặc định. Example giữ qua preview Foundation.
- Test: Test Welcome→Login/Register, link form không mang credentials, release không render preview và Home không hiển thị fixture xanh. Không triển khai session event/reset khi hết phiên; phần này thuộc auth integration/Foundation. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
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
- Phase: 1.5.1–1.5.2 · Kiểm thử và preview toàn màn
- Trạng thái: In progress
- Đã làm: AI thực hiện. Giữ route/callback đã có, preview chỉ __DEV__. Thêm bộ chọn nổi UI, panel trạng thái thu gọn, thông báo callback overlay không đẩy màn. Cập nhật Maestro để mở/đóng công cụ trước đổi trạng thái.
- Test: RNTL auth/home/navigation/shared52/52 trước review; full suite sau review xem báo cáo handoff-jest. Maestro lượt đầu3/5; lỗi2flow do NativeWind đổi Button variant kích hoạt upgrade warning rồi serialize React context, không phải thiếu NavigationContainer. Đặt key theo variant ở Button để remount nhánh style an toàn, đang chạy lại E2E.
- PR / commit: Chưa tạo.
- Ghi chú: Không sửa node_modules, navigation infrastructure hoặc native config; không đánh đồng fixture với backend auth.

### 2026-10-17 21:08 (+07:00) · @LogKoNger
- Phase: 5 Kiểm tra sau chỉnh UI và bàn giao
- Trạng thái: In review
- Đã làm: AI đối chiếu bản chạy với bàn giao, sửa finding quan trọng, giữ UAT cuối cùng cho owner. Home320dp đã sửa mascot che chữ; kích thước vùng chạm dùng dp tường minh.
- Test: Jest20 suite/102 test đạt; lint:rules, lint:code-format, lint:type-check đạt. Maestro main: api-health/app-launch/Login/Register đạt ở lượt2026-10-17_205658; Home đạt sau sửa flow retry ở lượt210136 (1/1). Chữ lớn1.3×/Reduce Motion1/1, visual sections1/1 và compact320dp1/1 đạt. Hệ thống máy ảo đã khôi phục1080×2400, font1.0, animator_duration_scale=null.
- PR / commit: Chưa tạo.
- Ghi chú: Bằng chứng, giới hạn và sai khác nhỏ ở README và evidence/2026-10-17-handoff-review.md. Không xác nhận cookie/backend hoặc UAT thay owner.
