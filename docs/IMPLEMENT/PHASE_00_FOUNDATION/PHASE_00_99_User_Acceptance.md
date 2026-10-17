# 0.99 User Acceptance — Foundation

- Người nghiệm thu: **@Bero**.
- Trạng thái: **Done** — owner duyệt bước 5, bước 6 và đóng Phase 0 trong chat ngày 2026-10-17. Dừng chờ refresh theo chỉ đạo; không ghi các ca native/backend chưa chạy thành PASS.
- Quy trình: [ADR-0017](../../adr/ADR-0017-ai-self-review-owner-uat.md).

## Phạm vi

Nghiệm thu nền tảng 0.1–0.11: NativeWind/token, Nunito, theme, cookie HTTP, UUID,
logger, QueryClient, lint, MSW/helper test, Maestro và tiếng Việt mặc định.
Không bao gồm màn hình nghiệp vụ hoặc bộ component nativecn chưa có sub-phase.

## Điều kiện bắt đầu

- [x] Owner đã nghiệm thu toàn Phase 0; các sub-phase được đóng theo xác nhận, giới hạn bằng chứng giữ trong PROGRESS.
- [x] Owner xác nhận `APP_ORIGIN=http://localhost:3003` cho development; đã cấu hình `.env`. Production chưa được xác nhận.
- [x] Có màn Login và auth navigator theo ADR-0022; HTTP refresh lỗi đi qua navigator/clear cache đã kiểm tra MSW,
  Android login/cookie sau mở lại app/logout/Back đã đạt. Chưa thay bằng chứng refresh native khi hết hạn.
- [x] Lint, format, type-check, unit/integration test và Maestro Android đều xanh trên code bàn giao (AI đã kiểm tra; owner chấp nhận bước 1).
- [x] App debug đã build, cài trên Android Emulator và Metro đang chạy (owner chấp nhận bước 2).

## Bằng chứng AI

- [Chạy lại bước 5 — 28/28 test refresh/phiên/điều hướng PASS ngày 2026-10-17](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-uat5-session.md). Phần native/backend hết hạn chưa được xác nhận; không thay checkbox UAT của owner.

- [Tổng hợp tự kiểm tra và giới hạn](../../PROGRESS/PHASE_00_FOUNDATION/README.md).
- [Kết quả Jest lần triển khai lại](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-reimplementation-jest.json).
- [Maestro lần triển khai lại — 1/1 xanh](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-reimplementation-maestro.xml).
- [Maestro sau cấu hình Origin development — 1/1 xanh](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-origin-maestro.xml).
- [Maestro kiểm tra nút API health online — 2/2 xanh](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-api-health-maestro.xml).
- [App mặc định tiếng Việt — ảnh mới](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-reimplementation-main-app.png).
- [Token/font trên Android — lần kiểm tra trước](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-native-foundation.png).
- [Hermes/UUID — lần kiểm tra trước](../../PROGRESS/PHASE_00_FOUNDATION/evidence/2026-10-17-native-foundation.json).

## Các bước owner kiểm tra

| Bước | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| 1 | Chạy `npm run lint:rules`, `npm run lint:code-format`, `npm run lint:type-check`, `npm test -- --runInBand` | Tất cả thành công; không bỏ qua test lỗi. |
| 2 | Build/cài Android theo [CONTRIBUTING](../../CONTRIBUTING.md#chạy-flow-nền-tảng-phase-0); mở app sau khi xoá dữ liệu app test | App mở được, nội dung mẫu mặc định tiếng Việt, giao diện sáng. |
| 3 | Đối chiếu bằng chứng NativeWind và Nunito với tiêu chí 0.1–0.3 | Mint đúng `#338A85`; đủ Regular, SemiBold, Bold, ExtraBold; dấu tiếng Việt rõ; SVG hoạt động. Yêu cầu AI dựng lại kiểm tra native nếu cần xem trực tiếp các mẫu đã gỡ. |
| 4 | Chuyển ngôn ngữ sang English rồi đóng/mở lại app | Ngôn ngữ được lưu; chuyển về tiếng Việt được; không còn Bengali. |
| 4a | Bấm “Thử kết nối API”, sau đó đổi ngôn ngữ | Gọi health/live thật, hiện thông báo máy chủ Mindy đang hoạt động ngay dưới nút; thông báo đổi theo ngôn ngữ. Lỗi có code/HTTP status và có thể thử lại. |
| 5 | Xem test HTTP/MSW; thử phiên hết hạn trên backend test sau khi có Login | Nhiều request dùng một refresh; request gốc retry tối đa một lần; refresh lỗi xoá cache/auth và về Login. Không lưu token trong MMKV hoặc gắn Bearer. |
| 6 | Gọi mutation materials/release/file access với Origin đã được backend duyệt | Gửi đúng Origin; không gặp `ORIGIN_NOT_ALLOWED`. Khi cấu hình Origin trống, app chặn request bằng `APP_ORIGIN_REQUIRED`. Không dùng Origin giả trong môi trường thật. |
| 7 | Xem test UUID, logger, QueryClient và MSW | UUID v4 khác nhau; retry giữ key/body; logger che trường nhạy cảm kể cả trong Error và xử lý tham chiếu vòng; retry query chỉ mạng/5xx; MSW bắt request chưa mock. |
| 8 | Chạy `npm run test:e2e -- -e APP_ID=com.mindymobile` | Flow app-launch xanh trên Android Emulator. |
| 9 | Đối chiếu tech stack và danh sách file khoá trong ARCHITECTURE | Khớp package/config thực tế; component UI chỉ bật khoá sau khi owner xác nhận UAT đạt. |

iOS chỉ kiểm tra khi có macOS; chưa có kết quả iOS trong lần bàn giao Windows này.
Flow app-launch chỉ xác nhận app khởi chạy, không thay thế kiểm tra cookie/Origin với backend.

## Ghi nhận kết quả của owner

- Ngày ghi nhận: **2026-10-17, 14:06 (+07:00)**.
- Môi trường: Android Emulator; API `https://api.quanh123.id.vn/api/v1`, Origin `http://localhost:3003`.
  Chưa ghi nhận phiên bản/commit backend.
- Xác nhận trực tiếp của @Bero trong chat: **“Từ 1-4a đã được chấp nhận”**.
- [x] Bước 1 — lint, format, type-check và unit/integration test.
- [x] Bước 2 — build/cài và mở app Android, tiếng Việt mặc định, giao diện sáng.
- [x] Bước 3 — chấp nhận bằng chứng NativeWind/Nunito theo tiêu chí 0.1–0.3.
- [x] Bước 4 — đổi và lưu ngôn ngữ.
- [x] Bước 4a — nút kiểm tra API health và thông báo theo ngôn ngữ.
- [x] Bước 5 — refresh/phiên hết hạn và điều hướng Login. Owner xác nhận trực tiếp trong chat ngày 2026-10-17: “Tôi approve bước 5 phase 0 UAT”. Test tự động 28/28 PASS; bằng chứng native bổ sung ghi riêng trong PROGRESS.
- [x] Bước 6 — owner xác nhận trực tiếp trong chat ngày 2026-10-17: “Bước 6 approve và done phase 0, không cần đợi refresh”. Chấp nhận nghiệm thu theo chỉ đạo; lượt này không gọi mutation Origin thật.
- [x] Bước 7 — UUID/logger/QueryClient/MSW. Owner xác nhận trong chat 2026-10-17 14:21 (+07:00): “approve 7, 8”.
- [x] Bước 8 — owner nghiệm thu flow E2E. Owner xác nhận cùng lúc với bước 7.
- [x] Bước 9 — tech stack và file khoá. Owner chấp nhận ngày 2026-10-17 14:21 (+07:00), chọn phương án (a):
  chấp nhận hiện trạng, ghi điểm còn tồn đọng (chưa xử lý, chưa có ADR):
  1. Package boilerplate có trong `package.json` nhưng chưa có trong bảng tech stack: clipboard, material-top-tabs,
     pager-view, webview, react-error-boundary, device-info (đang dùng ở `appInfo.service.ts`), new-app-screen.
  2. `babel-plugin-inline-dotenv` còn bật trong `babel.config.js`, là cơ chế env thứ hai cạnh `react-native-config`;
     hiện `src` không dùng `process.env`.
  3. DevDependency không dùng: `babel-plugin-root-import`, `dotenv`; `@types/react-native` 0.73 lỗi thời so với RN 0.80.
  4. `react-native-gesture-handler`, `react-native-screens` đang dùng nhưng chưa liệt kê trong bảng tech stack.

Owner đã xác nhận đủ các bước UAT và đóng Phase 0 ngày 2026-10-17. Chỉ đạo cuối cùng yêu cầu không đợi refresh;
ca refresh native hết hạn và mutation Origin thật chưa được chạy trong lượt này, không ghi thành kết quả PASS.
Màn kiểm tra NativeWind/Nunito tạm đã gỡ; xác nhận bước 3 không được ghi thành đã xem trực tiếp
màn kiểm tra này trên UI emulator hiện tại. Phase và 0.99 chuyển `Done` theo xác nhận owner.

Ghi thêm kết quả thực tế vào [PROGRESS cấp phase](../../PROGRESS/PHASE_00_FOUNDATION/README.md),
không sửa nhật ký cũ. AI sửa lỗi và bàn giao lại nếu UAT chưa đạt. Chỉ sau khi owner xác nhận
UAT đạt mới đổi 0.99 và Phase 0 thành `Done`, rồi bật khoá UI trong CODEOWNERS.
