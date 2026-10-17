# Progress 0.5 Idempotency-Key

Nhật ký thực hiện task của [0.5 Idempotency-Key](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_05_IDEMPOTENCY_KEY.md). Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md), không sửa entry cũ.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.5.1
- Trạng thái: Blocked
- Đã làm: Soạn ADR-0015 Proposed (uuid v11 + react-native-get-random-values); gửi yêu cầu duyệt owner.
- Test: Chưa cài thư viện, chưa tạo hàm sinh UUID vì chờ Accepted theo B.8.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:21 (+07:00) · @Bero
- Phase: 0.5.1
- Trạng thái: In review
- Đã làm: Owner @Bero xác nhận duyệt trong chat; ADR-0015 chuyển Accepted trước cài dependency.
- Test: Không áp dụng test cho quyết định ADR.
- PR / commit: Chưa có, workspace không có .git.
- Ghi chú: Không dùng polyfill2 vì peer RN>=0.81; không đổi phiên bản React Native của dự án.

### 2026-10-17 12:21 (+07:00) · @Bero
- Phase: 0.5.2
- Trạng thái: In review
- Đã làm: Cài uuid11.1.1 và react-native-get-random-values1.11.0; polyfill import đầu index.js; createIdempotencyKey dùng v4, không tự gắn/sinh key trong interceptor.
- Test: Red module chưa tồn tại → Green định dạng v4 và hai ý định có key khác nhau; MSW xác nhận auth refresh retry giữ nguyên key/body. Metro Android production bundle xanh, kiểm tra Hermes trên thiết bị đang chờ APK.
- PR / commit: Chưa có, workspace không có .git.
- Ghi chú: Không dùng polyfill2 vì peer RN>=0.81; không đổi phiên bản React Native của dự án.

### 2026-10-17 12:29 (+07:00) · @Bero
- Phase: 0.5.2 Kiểm tra Hermes
- Trạng thái: In review
- Đã làm: App trên emulator API37 chạy đúng createIdempotencyKey từ source mới và polyfill native.
- Test: Hermes=true, uuidV4=true, distinct=true; 37 test toàn repo xanh.
- PR / commit: Chưa có, workspace không có .git.
- Ghi chú: Không dùng Math.random trong hàm sinh key, không tự sinh lại key khi interceptor retry. Bằng chứng trong evidence/2026-10-17-native-foundation.png, evidence/2026-10-17-main-app.png và JSON cùng tên.
