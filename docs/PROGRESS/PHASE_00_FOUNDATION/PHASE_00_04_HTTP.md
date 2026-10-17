# Progress 0.4 HTTP

Nhật ký thực hiện task của [0.4 HTTP](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_04_HTTP.md). Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md), không sửa entry cũ.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.4.1
- Trạng thái: In review
- Đã làm: Tạo ApiErrorBody/Paginated và ApiError/isApiErrorCode; parse biên API bằng zod.
- Test: Test message/details và mã lỗi xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.4.2
- Trạng thái: In review
- Đã làm: Bỏ Bearer và API token MMKV; mọi lỗi qua ApiError, giữ credentials; bỏ timeout retry của template để tránh gửi lặp mutation.
- Test: MSW test request không Bearer, 404, mạng và envelope sai xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.4.3
- Trạng thái: Blocked
- Đã làm: Refresh single-flight theo baseURL, generation chống 401 trễ, retry request gốc một lần; refresh lỗi clear QueryClient/reset auth.
- Test: MSW test 3 request song song, refresh lỗi, 401 trễ sau refresh lỗi, không vòng lặp xanh. Chưa có route Login trong repo để nối điều hướng.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.4.4
- Trạng thái: Blocked
- Đã làm: APP_ORIGIN qua env.ts; route protected tự gắn Origin; giá trị env thật để trống, thiếu cấu hình báo lỗi rõ.
- Test: MSW kiểm tra Origin cho materials/release/file access xanh. Chưa có xác nhận CORS_ORIGINS từ backend.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 13:35 (+07:00) · @Bero
- Phase: 0.4.1–0.4.4 Triển khai lại / AI tự kiểm tra
- Trạng thái: Blocked
- Đã làm: AI rà soát cookie, ApiError, refresh single-flight và Origin. Bổ sung 4 kiểm tra: Origin trống chặn trước khi gửi; query giữ offset/0/false/array; nhiều Http instance dùng chung refresh; mutation không retry lỗi transport.
- Test: 19 test HTTP/MSW xanh, đi qua interceptor thật. Retry giữ nguyên Idempotency-Key và body; refresh lỗi clear cache/reset auth; không còn token MMKV/Bearer trong production code.
- PR / commit: Chưa tạo; kiểm tra trên working tree từ 5087fbf (main).
- Ghi chú: Chưa đạt đầy đủ 0.4.3: thiếu màn Login/auth navigator. 0.4.4 còn chờ backend xác nhận APP_ORIGIN/CORS_ORIGINS; test mock không thay cho tích hợp backend. Codex thực hiện; handle dùng lại xác nhận trực tiếp đã ghi trong nhật ký trước, vì máy không có gh CLI.

### 2026-10-17 13:42 (+07:00) · @Bero
- Phase: 0.4.4 Xác nhận Origin development
- Trạng thái: In review
- Đã làm: Owner trả lời câu hỏi xác nhận Origin bằng http://localhost:3003. AI cấu hình APP_ORIGIN này trong .env (APP_ENV=development), giữ nguyên header localhost, không đổi sang 10.0.2.2. Production chưa được xác nhận nên .env.production giữ trống. Cập nhật ARCHITECTURE, roadmap, README phase, CLAUDE và điều kiện UAT theo ADR-0002.
- Test: lint:rules ✓ · lint:code-format ✓ · lint:type-check ✓ · Jest 13 suite / 43 test ✓ (19 test HTTP/MSW). BuildConfig Android đã sinh APP_ORIGIN đúng http://localhost:3003.
- PR / commit: Chưa tạo; thay đổi chưa commit.
- Ghi chú: Coi địa chỉ localhost owner cung cấp là cấu hình development hiện có; không suy rộng xác nhận sang production. Chưa gọi mutation backend thật. Blocker Origin development được gỡ; 0.4.3 còn thiếu Login/auth navigator, vì vậy 0.4/0.99 và Phase 0 vẫn Blocked. Kết quả build native ghi thêm ở nhật ký cấp phase sau khi hoàn tất.

### 2026-10-17 13:49 (+07:00) · @Bero
- Phase: 0.4.4 Kiểm tra backend online sau cập nhật env
- Trạng thái: In review
- Đã làm: Owner cho biết đã đổi env backend và dùng Origin localhost:3003 cho cả web/mobile. AI kiểm tra trực tiếp backend online https://api.quanh123.id.vn: GET /api/v1/health/live với Origin http://localhost:3003 trả 200; OPTIONS /api/v1/auth/login trả 204, Access-Control-Allow-Origin đúng localhost:3003 và Access-Control-Allow-Credentials=true. Xác nhận CORS online, không chỉ dựa lời xác nhận.
- Test: .env mobile do owner sửa đã trỏ API_URL tới backend HTTPS online, giữ APP_ORIGIN localhost:3003. BuildConfig cũ còn localhost:3000 nên AI build lại: assembleDebug x86_64 ✓ (21 giây, 543 task); BuildConfig mới đúng cả hai biến. Cài APK và mở MainActivity trên emulator-5554 thành công.
- PR / commit: Chưa tạo.
- Ghi chú: 3003 hiện là cổng web Next.js, không phải cổng backend mobile. Web và mobile có thể cùng gửi Origin localhost:3003 tới backend online; hai server độc lập trên cùng host/IP không thể cùng bind cổng này. Không sửa lại .env của owner, không đổi backend local (file local vẫn PORT=3000, CORS_ORIGINS localhost:3001), không kiểm tra đăng nhập/mutation có tài khoản. Phase còn blocker Login và owner UAT.

### 2026-10-17 14:03 (+07:00) · @Bero
- Phase: 0.4 Kiểm tra kết nối API qua màn mẫu
- Trạng thái: In review
- Đã làm: Owner báo nút API không hoạt động, đổi ngôn ngữ tốt và yêu cầu dùng health để xác nhận. AI xác định service mẫu đang gọi users?limit=1 và chờ UsersResponse của dummy API. Thay bằng health/live theo contract §5, Zod kiểm tra status/timestamp; đổi query/controller sang health, bỏ render user card giả khỏi màn mẫu. Hiện thông báo thành công hoặc lỗi có code/HTTP status ngay dưới nút, có hai ngôn ngữ và testID. Không thay đổi HTTP hạ tầng/env hoặc luồng đổi ngôn ngữ.
- Test: Red: 3 test service fail vì chưa có checkHealth. Green: 3 test service cho DTO hợp lệ, lỗi 503 và response sai; 2 test controller cho chỉ gọi khi bấm, báo kết quả và phục hồi khi thử lại. Lint không lỗi/cảnh báo, format/type-check xanh; Jest 15 suite / 48 test xanh. Maestro app-launch + api-health 2/2 xanh (35 giây); api-health bấm nút trên Android rồi xác nhận example-api-success với backend online thật.
- Bằng chứng: [Maestro API health](evidence/2026-10-17-api-health-maestro.xml); flow e2e/flows/api-health.yaml; test service/controller cạnh module example.
- PR / commit: Chưa tạo.
- Ghi chú: Chỉ health connectivity được xác nhận; chưa thử auth/mutation. Owner phản hồi language switch tốt là xác nhận riêng phần này, không coi là UAT đạt toàn phase. Phase vẫn Blocked do thiếu Login/auth navigator và owner chưa nghiệm thu cuối cùng. Không build native lại vì chỉ sửa JS/translation, E2E chạy app debug qua Metro.

### 2026-10-17 22:12 (+07:00) · @LogKoNger
- Phase: 0.4 Bổ sung bằng chứng auth từ Phase1 theo ADR-0022
- Trạng thái: Blocked; owner UAT5–6 chưa xác nhận
- Đã làm: Phase1 đã có Auth API, Login/role guard/bootstrap và navigator reset. Không sửa HTTP/config trong lượt tích hợp. Không còn thiếu màn Login để tiếp tục xác minh phiên.
- Test: MSW HTTP refresh lỗi đi qua navigator về Login và clear private cache; root/auth/home toàn suite132 test đạt. Android với backend thật đã qua login Student, cookie/auth-me sau stop/mở lại app, Home dữ liệu thật, logout/Back/khởi động guest. [Report native](../PHASE_01_AUTH_HOME_UI/evidence/2026-10-17-api-native.xml), [nhật ký chi tiết](../PHASE_01_AUTH_HOME_UI/PHASE_01_06_API_INTEGRATION.md).
- PR / commit: Chưa tạo.
- Ghi chú: Chưa có native expiry/refresh-success/refresh-failure tự động bằng phiên backend thật, chưa gọi mutation materials/release/file-access có Origin. Không dùng login/logout thay bằng chứng Origin. Owner chưa UAT5–6; Foundation vẫn Blocked.

### 2026-10-17 22:51 (+07:00) · @LogKoNger
- Phase: 0.99 User Acceptance — owner duyệt bước 5
- Trạng thái: Blocked ở bước 6
- Đã làm: Ghi nhận xác nhận trực tiếp của owner: “Tôi approve bước 5 phase 0 UAT”. Tick bước 5, đồng bộ roadmap, README Foundation và checklist HTTP. Owner đã chấp nhận UAT 1–5, 7–9; chỉ còn bước 6 mutation có Origin thật.
- Test: Không chạy lại test khi ghi xác nhận; lượt gần nhất bước 5 có 28/28 test PASS. Owner đồng thời yêu cầu làm cả test tự động và Android/backend thật; kiểm tra native đang tiếp tục, đã xác nhận phiên Student thật đang ở Home, access cookie sẽ hết hạn tự nhiên lúc 22:55:28 (+07:00).
- PR / commit: Chưa tạo.
- Ghi chú: Xác nhận của owner không biến ca native chưa chạy thành PASS. Không đóng Foundation/0.4/0.99 hoặc tự xác nhận bước 6. Không sửa entry cũ.

### 2026-10-17 22:52 (+07:00) · @LogKoNger
- Phase: 0 Nghiệm thu — owner duyệt bước 6 và đóng Foundation
- Trạng thái: Done
- Đã làm: Ghi nhận xác nhận trực tiếp “Bước 6 approve và done phase 0, không cần đợi refresh”. Owner đã duyệt đủ UAT 1–9 (gồm 4a). Đóng Phase 0, 0.99 và các sub-phase còn chờ; đồng bộ roadmap/IMPLEMENT, bật khoá src/components/ui/ trong CODEOWNERS theo quy trình sau nghiệm thu và cập nhật ARCHITECTURE.
- Test: Không chạy thêm test hoặc mutation backend trong lượt ghi nhận. Test tự động bước 5 đã đạt 28/28 (3 suite), có cảnh báo React act(...). Đã xác nhận emulator-5554 đang ở Home production với phiên Student; gọi auth/me qua phiên hiện có trả 200. Access cookie hết hạn lúc 22:55:28 (+07:00); owner yêu cầu dừng chờ trước mốc đó. Chưa chạy ca native refresh sau hết hạn/thu hồi hoặc Android Back sau refresh lỗi, chưa gọi mutation Origin thật. Không ghi các ca này thành PASS.
- PR / commit: Chưa tạo.
- Ghi chú: Dừng phần native theo chỉ đạo; chưa thu hồi phiên, thay cookie, đổi đồng hồ hoặc TTL. Hai flow native chuẩn bị và kiểm tra cú pháp đã được gỡ vì không thực hiện. Giữ bằng chứng 28 test và giới hạn kỹ thuật, các điểm tồn đọng bước 9 vẫn được ghi rõ trong UAT. Không sửa entry lịch sử. UAT Phase 1 đã Done trước đó giữ nguyên.
