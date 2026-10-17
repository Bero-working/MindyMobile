# Bước 5 — Refresh, phiên hết hạn và điều hướng Login

- Thời gian: 2026-10-17 22:47 (+07:00).
- Thực hiện: Codex; GitHub handle đã xác minh qua connector: @LogKoNger.
- Phạm vi: chạy lại test hiện có, không sửa production code hoặc cấu hình backend.
- Lệnh: `npx jest src/config/http/http.config.test.ts src/modules/auth/sessionNavigation.test.tsx src/modules/auth/hooks/useAuthSession.test.tsx --runInBand --verbose --json --outputFile=docs/PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-uat5-session-jest.json`.
- Kết quả: exit 0; 3/3 suite, 28/28 test PASS, 0 thất bại; thời gian Jest 8.312 giây.
- [Kết quả Jest đầy đủ](2026-10-17-uat5-session-jest.json).

## Đã xác nhận qua HTTP/MSW và component test

| Yêu cầu | Bằng chứng |
| --- | --- |
| Nhiều request 401 dùng chung một refresh | Test concurrent requests và HTTP instances cùng backend PASS; refresh count = 1 |
| Refresh thành công thì retry request gốc | Các response sau refresh đúng dữ liệu mong đợi; giữ Idempotency-Key/body |
| Retry tối đa một lần | Endpoint vẫn 401 được gọi đúng 2 lần; kết thúc lỗi, không lặp refresh |
| Refresh lỗi xoá cache/auth | Cache private không còn; isAuthenticated = false |
| Phiên hết hạn đưa về Login | Test render App, đăng nhập bằng form production qua MSW, Home xuất hiện; sau protected request 401 + refresh 401, Login xuất hiện, Home biến mất và cache private bị xoá |
| Không khôi phục phiên từ response cũ sau logout | Test login/bootstrap hoàn tất muộn sau logout PASS |
| Không gửi Bearer | Test HTTP DTO/headers PASS; code dùng withCredentials cho cookie |

Có cảnh báo React cập nhật HookContainer ngoài `act(...)` trong nhóm useAuthSession; test vẫn PASS.
Không sửa cảnh báo trong lượt chỉ chạy kiểm thử này.

## Giới hạn

- MSW giả phản hồi 401/refresh; không chứng minh cookie native hết hạn hoặc refresh với backend thật.
- Emulator `emulator-5554` đang kết nối. Chưa có phiên test và cách kiểm soát hết hạn/thu hồi để chạy ca native tương ứng.
- Test điều hướng xác nhận Home không còn render; không thực hiện thao tác Android Back sau refresh hết hạn trong lượt này.
- Đã hỏi owner về điều kiện phiên test; không đổi đồng hồ thiết bị, cookie, TTL hoặc thu hồi phiên khác để tự tạo tình huống.
- Bước 5 đạt phần test tự động. Phần Android/backend hết hạn vẫn cần bằng chứng; không đánh dấu owner UAT bước 5 hoặc Foundation Done.

## Cập nhật sau xác nhận owner

Owner sau đó duyệt bước 5 và xác nhận “Bước 6 approve và done phase 0, không cần đợi refresh” trong chat ngày
2026-10-17. Phase 0/UAT đã chuyển Done theo xác nhận. Kiểm tra bổ sung thấy Home production trên emulator
và auth/me trả 200 với role STUDENT. Dừng trước khi access cookie hết hạn; không thu hồi phiên hoặc gọi
mutation Origin. Các giới hạn ở trên mô tả mức bằng chứng kiểm thử, không còn là blocker nghiệm thu của owner.
