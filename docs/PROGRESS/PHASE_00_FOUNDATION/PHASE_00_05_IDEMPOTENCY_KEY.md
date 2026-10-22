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

### 2026-10-17 13:35 (+07:00) · @Bero
- Phase: 0.5.1–0.5.2 Triển khai lại / AI tự kiểm tra
- Trạng thái: In review
- Đã làm: AI đối chiếu ADR-0015 Accepted, uuid11/polyfill1.11 và import polyfill đầu entry.
- Test: UUID v4 khác nhau và HTTP retry giữ nguyên key/body xanh.
- PR / commit: Chưa tạo; kiểm tra trên working tree từ 5087fbf (main).
- Ghi chú: Hermes runtime dùng bằng chứng native-foundation.json lần trước; không cài thêm hoặc nâng phiên bản thư viện. Codex thực hiện; handle dùng lại xác nhận trực tiếp đã ghi trong nhật ký trước, vì máy không có gh CLI.

### 2026-10-17 22:52 (+07:00) · @LogKoNger
- Phase: 0 Nghiệm thu — owner duyệt bước 6 và đóng Foundation
- Trạng thái: Done
- Đã làm: Ghi nhận xác nhận trực tiếp “Bước 6 approve và done phase 0, không cần đợi refresh”. Owner đã duyệt đủ UAT 1–9 (gồm 4a). Đóng Phase 0, 0.99 và các sub-phase còn chờ; đồng bộ roadmap/IMPLEMENT, bật khoá src/components/ui/ trong CODEOWNERS theo quy trình sau nghiệm thu và cập nhật ARCHITECTURE.
- Test: Không chạy thêm test hoặc mutation backend trong lượt ghi nhận. Test tự động bước 5 đã đạt 28/28 (3 suite), có cảnh báo React act(...). Đã xác nhận emulator-5554 đang ở Home production với phiên Student; gọi auth/me qua phiên hiện có trả 200. Access cookie hết hạn lúc 22:55:28 (+07:00); owner yêu cầu dừng chờ trước mốc đó. Chưa chạy ca native refresh sau hết hạn/thu hồi hoặc Android Back sau refresh lỗi, chưa gọi mutation Origin thật. Không ghi các ca này thành PASS.
- PR / commit: Chưa tạo.
- Ghi chú: Dừng phần native theo chỉ đạo; chưa thu hồi phiên, thay cookie, đổi đồng hồ hoặc TTL. Hai flow native chuẩn bị và kiểm tra cú pháp đã được gỡ vì không thực hiện. Giữ bằng chứng 28 test và giới hạn kỹ thuật, các điểm tồn đọng bước 9 vẫn được ghi rõ trong UAT. Không sửa entry lịch sử. UAT Phase 1 đã Done trước đó giữ nguyên.


### 2026-10-22 09:25 (+07:00) · @Bero-working (Codex)

- Phase: Đồng bộ tiêu chí sau tổng kết test/AI review theo yêu cầu owner.
- Trạng thái: Done theo UAT owner đã có; giữ các giới hạn kiểm chứng, không ghi nhận UAT mới.
- Tiêu chí: tick bổ sung 3 mục đủ bằng chứng đã ghi; 0 mục giữ chưa đủ bằng chứng và nêu lý do trong IMPLEMENT/bảng đối chiếu.
- Test: Chỉ rà hồ sơ, không chạy lại app/Jest/Maestro/backend; không biến kết quả lịch sử hoặc owner approval thành lượt test mới.
- Đồng bộ: [IMPLEMENT](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_05_IDEMPOTENCY_KEY.md) và [bảng đối chiếu](../ACCEPTANCE_SYNC_2026-10-22.md); nhật ký cũ giữ nguyên.
