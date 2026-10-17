# Progress 0.9 Hạ tầng test

Nhật ký thực hiện task của [0.9 Hạ tầng test](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_09_TEST_INFRA.md). Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md), không sửa entry cũ.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.9.1
- Trạng thái: In review
- Đã làm: Cài MSW; server strict unhandled requests, health handler, URL test /api/v1; Jest Node export conditions/ESM transforms và Axios HTTP adapter.
- Test: MSW chặn request thật qua Axios interceptor. Phần này dựng trước HTTP nhằm đáp ứng TDD, như phụ thuộc đã ghi trong phase README.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.9.2
- Trạng thái: In review
- Đã làm: Tạo createTestQueryClient, renderWithProviders/renderHookWithProviders; safe-area mock đúng để app smoke render cây con.
- Test: Hook nhận dữ liệu MSW qua QueryClientProvider xanh; app smoke có assert app-root và dọn timer.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:07 (+07:00) · @Bero
- Phase: 0.9.1 Kiểm tra bổ sung
- Trạng thái: In review
- Đã làm: Xác nhận MSW onUnhandledRequest error chặn request không có handler, không rơi ra mạng thật.
- Test: test unhandled request xanh; toàn bộ 35 test xanh.
- PR / commit: Chưa có.
- Ghi chú: Adapter HTTP chỉ dùng trong Jest; app native giữ networking/cookie của RN.

### 2026-10-17 13:35 (+07:00) · @Bero
- Phase: 0.9.1–0.9.2 Triển khai lại / AI tự kiểm tra
- Trạng thái: In review
- Đã làm: AI kiểm tra MSW/node, Axios HTTP adapter và helper QueryClient riêng cho mỗi test.
- Test: Hook qua provider/MSW nhận DTO; request chưa mock bị chặn bởi onUnhandledRequest:error; toàn bộ 13 suite / 43 test xanh.
- PR / commit: Chưa tạo; kiểm tra trên working tree từ 5087fbf (main).
- Ghi chú: Bằng chứng Jest mới ở evidence/2026-10-17-reimplementation-jest.json; không gọi backend thật trong test. Codex thực hiện; handle dùng lại xác nhận trực tiếp đã ghi trong nhật ký trước, vì máy không có gh CLI.

### 2026-10-17 22:52 (+07:00) · @LogKoNger
- Phase: 0 Nghiệm thu — owner duyệt bước 6 và đóng Foundation
- Trạng thái: Done
- Đã làm: Ghi nhận xác nhận trực tiếp “Bước 6 approve và done phase 0, không cần đợi refresh”. Owner đã duyệt đủ UAT 1–9 (gồm 4a). Đóng Phase 0, 0.99 và các sub-phase còn chờ; đồng bộ roadmap/IMPLEMENT, bật khoá src/components/ui/ trong CODEOWNERS theo quy trình sau nghiệm thu và cập nhật ARCHITECTURE.
- Test: Không chạy thêm test hoặc mutation backend trong lượt ghi nhận. Test tự động bước 5 đã đạt 28/28 (3 suite), có cảnh báo React act(...). Đã xác nhận emulator-5554 đang ở Home production với phiên Student; gọi auth/me qua phiên hiện có trả 200. Access cookie hết hạn lúc 22:55:28 (+07:00); owner yêu cầu dừng chờ trước mốc đó. Chưa chạy ca native refresh sau hết hạn/thu hồi hoặc Android Back sau refresh lỗi, chưa gọi mutation Origin thật. Không ghi các ca này thành PASS.
- PR / commit: Chưa tạo.
- Ghi chú: Dừng phần native theo chỉ đạo; chưa thu hồi phiên, thay cookie, đổi đồng hồ hoặc TTL. Hai flow native chuẩn bị và kiểm tra cú pháp đã được gỡ vì không thực hiện. Giữ bằng chứng 28 test và giới hạn kỹ thuật, các điểm tồn đọng bước 9 vẫn được ghi rõ trong UAT. Không sửa entry lịch sử. UAT Phase 1 đã Done trước đó giữ nguyên.
