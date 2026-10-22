# Progress 0.7 QueryClient

Nhật ký thực hiện task của [0.7 QueryClient](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_07_QUERY_CLIENT.md). Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md), không sửa entry cũ.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.7.1
- Trạng thái: In review
- Đã làm: StaleTime 30s; query retry mạng/5xx tối đa 2, mutation không retry; defaultError ApiError.
- Test: Test retry 0/404/500, giới hạn và type-check xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.7.2
- Trạng thái: In review
- Đã làm: Nối onlineManager với NetInfo, focusManager với AppState và cleanup listener.
- Test: Test connectivity/focus/unsubscribe xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 13:35 (+07:00) · @Bero
- Phase: 0.7.1–0.7.2 Triển khai lại / AI tự kiểm tra
- Trạng thái: In review
- Đã làm: AI kiểm tra staleTime, retry mạng/5xx, mutation không retry và manager mạng/focus.
- Test: 3 test QueryClient xanh; mặc định ApiError và type-check toàn repo xanh.
- PR / commit: Chưa tạo; kiểm tra trên working tree từ 5087fbf (main).
- Ghi chú: NetInfo/AppState được mock trong unit test; không ghi đã kiểm tra thao tác offline/foreground bằng tay trên thiết bị. Codex thực hiện; handle dùng lại xác nhận trực tiếp đã ghi trong nhật ký trước, vì máy không có gh CLI.

### 2026-10-17 22:52 (+07:00) · @LogKoNger
- Phase: 0 Nghiệm thu — owner duyệt bước 6 và đóng Foundation
- Trạng thái: Done
- Đã làm: Ghi nhận xác nhận trực tiếp “Bước 6 approve và done phase 0, không cần đợi refresh”. Owner đã duyệt đủ UAT 1–9 (gồm 4a). Đóng Phase 0, 0.99 và các sub-phase còn chờ; đồng bộ roadmap/IMPLEMENT, bật khoá src/components/ui/ trong CODEOWNERS theo quy trình sau nghiệm thu và cập nhật ARCHITECTURE.
- Test: Không chạy thêm test hoặc mutation backend trong lượt ghi nhận. Test tự động bước 5 đã đạt 28/28 (3 suite), có cảnh báo React act(...). Đã xác nhận emulator-5554 đang ở Home production với phiên Student; gọi auth/me qua phiên hiện có trả 200. Access cookie hết hạn lúc 22:55:28 (+07:00); owner yêu cầu dừng chờ trước mốc đó. Chưa chạy ca native refresh sau hết hạn/thu hồi hoặc Android Back sau refresh lỗi, chưa gọi mutation Origin thật. Không ghi các ca này thành PASS.
- PR / commit: Chưa tạo.
- Ghi chú: Dừng phần native theo chỉ đạo; chưa thu hồi phiên, thay cookie, đổi đồng hồ hoặc TTL. Hai flow native chuẩn bị và kiểm tra cú pháp đã được gỡ vì không thực hiện. Giữ bằng chứng 28 test và giới hạn kỹ thuật, các điểm tồn đọng bước 9 vẫn được ghi rõ trong UAT. Không sửa entry lịch sử. UAT Phase 1 đã Done trước đó giữ nguyên.
