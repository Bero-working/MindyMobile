# Progress Phase 00: Foundation

Nhật ký cấp phase của [Phase 0](../../IMPLEMENT/PHASE_00_FOUNDATION/README.md): đổi trạng thái phase, Dọn dẹp, Kiểm tra, Nghiệm thu. Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md).

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0 In progress
- Trạng thái: In progress
- Đã làm: Bắt đầu triển khai 11 sub-phase; handle Bero được người dùng xác nhận. Không có metadata .git; không thể tính diff so main hay tạo PR/commit trong workspace này.
- Test: Xem kết quả chi tiết trong từng sub-phase; chưa có nghiệm thu native/E2E.
- PR / commit: Chưa có.
- Ghi chú: Codex thực hiện; owner nghiệm thu theo B.5, chưa bắt đầu phase màn hình.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0 Dọn dẹp
- Trạng thái: In progress
- Đã làm: Bỏ token MMKV, logger cũ, bn-BN và import liên quan; chỉ chỉnh type/guard tối thiểu để bật lint mới. Dọn asset link không phải font; giữ giấy phép Nunito. appConfig.ts chỉ format lỗi đã có. Không tự thêm UI kit chưa có spec.
- Test: Xem kết quả chi tiết trong từng sub-phase; chưa có nghiệm thu native/E2E.
- PR / commit: Chưa có.
- Ghi chú: Codex thực hiện; owner nghiệm thu theo B.5, chưa bắt đầu phase màn hình.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0 Kiểm tra
- Trạng thái: Blocked
- Đã làm: Unit/integration, lint, format, type-check đã chạy; Metro production Android bundle thành công. Native assembleDebug lỗi CLI15 không nhận BaseReactPackage/react-native-config; cần ADR-0016. E2E chưa chạy do thiếu Maestro; lệnh khởi động emulator kèm cài CLI bị automatic review chặn: blocked by policy.
- Test: Xem kết quả chi tiết trong từng sub-phase; chưa có nghiệm thu native/E2E.
- PR / commit: Chưa có.
- Ghi chú: Codex thực hiện; owner nghiệm thu theo B.5, chưa bắt đầu phase màn hình.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0 Blocked
- Trạng thái: Blocked
- Đã làm: Chờ owner duyệt ADR-0015/0016; chờ backend chốt APP_ORIGIN/CORS_ORIGINS; chưa có Login route; chưa kiểm tra màu/font/UUID và flow trên Android. Không tự đánh dấu Done hoặc bật UI CODEOWNERS.
- Test: Xem kết quả chi tiết trong từng sub-phase; chưa có nghiệm thu native/E2E.
- PR / commit: Chưa có.
- Ghi chú: Codex thực hiện; owner nghiệm thu theo B.5, chưa bắt đầu phase màn hình.

### 2026-10-17 12:07 (+07:00) · @Bero
- Phase: 0 Kiểm tra — kết quả cuối phiên
- Trạng thái: Blocked
- Đã làm: Hoàn tất phần code có ADR Accepted; cập nhật ARCHITECTURE/guide/CLAUDE và bảng trạng thái; không bật UI CODEOWNERS. Giữ giao diện mặc định sáng, bỏ thao tác chuyển dark của màn template.
- Test: npm run lint:rules ✓ (0 cảnh báo sau khi bỏ qua coverage) · npm run lint:code-format ✓ · npm run lint:type-check ✓ · npm test -- --runInBand --silent ✓ (12 suite, 35 test).
- Test bổ sung: Metro bundle Android production ✓; PostScript name 4 font và byte asset Android khớp ✓; UIAppFonts iOS đủ 4 tên ✓. Coverage nhóm hạ tầng mới đo riêng: 89,31% dòng; utilities mới 96,77%; HTTP 84%; QueryClient/theme 100%.
- Native/E2E: assembleDebug chưa thành công do CLI15/react-native-config; test:e2e đã gọi nhưng không tìm thấy Maestro. Automatic review chặn thao tác khởi động emulator kèm cài Maestro với lý do “blocked by policy”. Chưa kiểm tra màu/font trên thiết bị, chưa build iOS.
- PR / commit: Không có, workspace không chứa .git.
- Ghi chú: Chờ duyệt ADR-0015 và ADR-0016, xác nhận APP_ORIGIN/CORS từ backend và màn Login cho điều hướng hết phiên. Hai câu hỏi duyệt ADR đang chờ phản hồi; không cài UUID hoặc nâng CLI khi chưa được duyệt. Coverage trên không phải coverage toàn bộ boilerplate.

### 2026-10-17 12:17 (+07:00) · @Bero
- Phase: 0 Tiếp tục triển khai sau duyệt ADR
- Trạng thái: In progress
- Đã làm: Owner duyệt ADR-0015 và ADR-0016 trực tiếp trong chat. Đã cập nhật Accepted trước khi cài; UUID v11 + polyfill v1.11 và CLI major 19 đã cài.
- Test: Red UUID fail vì chưa có module, Green UUID v4 + key khác nhau xanh; MSW retry giữ nguyên key và body xanh. CLI config nhận được cả RNCConfigPackage và RNGetRandomValuesPackage.
- PR / commit: Chưa có.
- Ghi chú: Polyfill v2 yêu cầu RN >=0.81 nên chọn v1.11 tương thích RN0.80. Maestro2.11 cài riêng từ archive chính thức đã kiểm tra SHA256; emulator khởi động riêng headless thành công, không lặp lại lệnh gộp đã bị chặn. Build Android đang chạy.

### 2026-10-17 12:29 (+07:00) · @Bero
- Phase: 0 Kiểm tra và bàn giao sau duyệt ADR-0015/0016
- Trạng thái: Blocked
- Đã làm: Hai ADR đã Accepted và triển khai xong; CLI19.1.2 autolinking đúng RNCConfig/RNG. UUID11.1.1 + polyfill1.11 chạy trên Hermes. Native smoke tạm đã xoá, index.js được khôi phục nguyên bản với polyfill import đầu; kiểm tra app chính riêng.
- Test: lint:rules ✓ · lint:code-format ✓ · lint:type-check ✓ · npm test -- --runInBand --silent ✓ (13 suite, 37 test). Metro production Android bundle ✓. Gradle assembleDebug -PreactNativeArchitectures=x86_64 --max-workers=2 ✓ (BUILD SUCCESSFUL, 543 task). APK cài và chạy trên emulator-5554 API37 ✓. Maestro app-launch ✓ (1/1, 19s).
- Kiểm tra hình ảnh/runtime: RGB mint chính xác (51,138,133,255); bốn Nunito weight và dấu tiếng Việt đúng; hermes=true, uuidV4=true, distinct=true; app chính mở mặc định tiếng Việt.
- Bằng chứng: [Native foundation](evidence/2026-10-17-native-foundation.png), [app chính](evidence/2026-10-17-main-app.png), [kết quả runtime](evidence/2026-10-17-native-foundation.json).
- PR / commit: Không có; workspace không có metadata .git.
- Ghi chú: Còn 0.4.4 chờ backend APP_ORIGIN/CORS_ORIGINS và đích Login cho 0.4.3 (hiện clear cache/reset auth đã có test). Chưa nghiệm thu phase, không tự đánh dấu Done/bật UI CODEOWNERS. Android đã kiểm tra debug x86_64, chưa build release đa ABI hoặc iOS. SDK/NDK/CMake thiếu đã được Gradle cài từ nguồn Android trong lần build đầu.

### 2026-10-17 13:37 (+07:00) · @Bero
- Phase: 0 Triển khai lại / AI tự kiểm tra
- Trạng thái: In progress
- Đã làm: Codex rà soát tuần tự 0.1–0.11 theo IMPLEMENT, contract và ADR Accepted. Sửa logger theo Red → Green: che thuộc tính Error, token dạng access_token/refreshToken và tham chiếu vòng; thêm 4 test HTTP. Không cài thêm thư viện, không tạo màn nghiệp vụ. Ghi tự kiểm tra riêng cho mỗi sub-phase và bổ sung PHASE_00_99_User_Acceptance.md theo ADR-0017.
- Test: Hai test logger mới đã fail trước khi sửa; cả 5 test logger và 19 test HTTP xanh sau sửa.
- PR / commit: Chưa tạo. Repo hiện có .git, HEAD 5087fbf (main); các entry 12:xx nói không có .git mô tả môi trường của phiên cũ.
- Ghi chú: Giữ nguyên các chỉnh sửa workflow có sẵn của người dùng. Handle @Bero dùng lại từ xác nhận trực tiếp được ghi ở nhật ký trước; máy hiện không có gh CLI.

### 2026-10-17 13:37 (+07:00) · @Bero
- Phase: 0 Dọn dẹp
- Trạng thái: In progress
- Đã làm: Kiểm tra diff của thay đổi lần này, cập nhật guide logging bỏ mẫu cũ còn truyền Error thô, sửa mô tả npm lint/MMKV trong docs. Không xoá/sửa code mẫu ngoài phase, không bật khoá UI.
- Test: git diff --check không có lỗi khoảng trắng. main...HEAD rỗng vì chưa có commit mới; chỉ rà soát các file working tree thuộc phạm vi thay đổi lần này.
- PR / commit: Chưa tạo.
- Ghi chú: Không dùng quy trình Dọn dẹp để sửa các file workflow đã thay đổi từ trước.

### 2026-10-17 13:37 (+07:00) · @Bero
- Phase: 0 Kiểm tra
- Trạng thái: In review
- Đã làm: AI chạy lại lint/format/type-check, toàn bộ Jest, build/cài Android debug và Maestro. Xem ảnh app mới mặc định tiếng Việt/giao diện sáng. Đối chiếu bốn font asset Android bằng SHA256 và khai báo UIAppFonts iOS; xem lại ảnh font/token và JSON Hermes/UUID lần 12:29.
- Test: lint:rules ✓ · lint:code-format ✓ · lint:type-check ✓ · Jest 13 suite / 43 test ✓ · Gradle assembleDebug -PreactNativeArchitectures=x86_64 --max-workers=2 ✓ (543 task, 16 giây) · cài APK ✓ · Maestro app-launch 1/1 ✓ (30 giây).
- Bằng chứng mới: [Jest JSON](evidence/2026-10-17-reimplementation-jest.json), [Maestro JUnit](evidence/2026-10-17-reimplementation-maestro.xml), [ảnh app](evidence/2026-10-17-reimplementation-main-app.png).
- PR / commit: Chưa tạo; thay đổi chưa commit.
- Ghi chú: Hai lần Maestro đầu không đạt vì driver bị Android lowmemorykiller đóng với emulator 2 GB; chạy lại thành công với 4 GB. Không chạy lại entry smoke font/UUID đã xoá; bằng chứng native-foundation 12:29 là bằng chứng cũ. Chưa build release đa ABI, chưa chạy iOS, chưa xác minh cookie/Origin với backend thật. Logger chỉ che theo key trong dữ liệu có cấu trúc, không phân tích PII trong chuỗi message/body tự do.

### 2026-10-17 13:37 (+07:00) · @Bero
- Phase: 0 Bàn giao / 0.99 User Acceptance
- Trạng thái: Blocked
- Đã làm: AI chuẩn bị [hướng dẫn UAT](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_99_User_Acceptance.md), điều kiện bắt đầu, bước owner kiểm tra, kết quả mong đợi, bằng chứng và phần ghi xác nhận. Các sub-phase trừ HTTP ở In review; 0.4 và 0.99 Blocked. Đã đồng bộ roadmap và README phase.
- Test: Kết quả kỹ thuật đã đạt nêu trên; chưa đạt đầy đủ tiêu chí phase vì 0.4 còn phụ thuộc ngoài phạm vi.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa có xác nhận APP_ORIGIN/CORS_ORIGINS từ backend và chưa có màn Login/auth navigator để hoàn tất 0.4.3. Đã hỏi giá trị Origin trong chat; không lấy im lặng làm xác nhận. Owner @Bero chưa UAT, không đặt Done và không bắt đầu phase màn hình. Khi hết blocker và kiểm tra đầy đủ đạt, chuyển phase/0.99 In review để owner UAT theo ADR-0017.

### 2026-10-17 13:43 (+07:00) · @Bero
- Phase: 0.4.4 Xác nhận Origin / 0 Kiểm tra
- Trạng thái: Blocked
- Đã làm: Owner cung cấp http://localhost:3003 sau câu hỏi xác nhận Origin. AI cập nhật .env development theo ADR-0002, cập nhật ARCHITECTURE/roadmap/README/UAT và build lại native. BuildConfig.java chứa đúng APP_ORIGIN=http://localhost:3003; APK mới đã cài lên emulator-5554. Gỡ blocker xác nhận Origin development; không áp dụng giá trị này cho production.
- Test: lint:rules ✓ · lint:code-format ✓ · lint:type-check ✓ · Jest 13 suite / 43 test ✓ · assembleDebug x86_64 ✓ (1 phút 19 giây, 543 task) · cài APK ✓ · Maestro app-launch 1/1 ✓ (38 giây). git diff --check ✓.
- Bằng chứng: [Maestro sau cập nhật Origin](evidence/2026-10-17-origin-maestro.xml); biến native sinh tại android/app/build/generated/source/buildConfig/debug/com/mindymobile/BuildConfig.java (file build, không commit).
- PR / commit: Chưa tạo.
- Ghi chú: Xác nhận từ owner, chưa gọi mutation backend thật để kiểm tra CORS/cookie. .env.production giữ APP_ORIGIN trống vì chưa xác nhận production. Phase 0/0.4/0.99 vẫn Blocked do 0.4.3 chưa có Login/auth navigator; owner chưa thực hiện UAT. Không tự đặt Done.

### 2026-10-17 14:03 (+07:00) · @Bero
- Phase: 0.4 Kiểm tra kết nối API qua màn mẫu
- Trạng thái: In review
- Đã làm: Owner báo nút API không hoạt động, đổi ngôn ngữ tốt và yêu cầu dùng health để xác nhận. AI xác định service mẫu đang gọi users?limit=1 và chờ UsersResponse của dummy API. Thay bằng health/live theo contract §5, Zod kiểm tra status/timestamp; đổi query/controller sang health, bỏ render user card giả khỏi màn mẫu. Hiện thông báo thành công hoặc lỗi có code/HTTP status ngay dưới nút, có hai ngôn ngữ và testID. Không thay đổi HTTP hạ tầng/env hoặc luồng đổi ngôn ngữ.
- Test: Red: 3 test service fail vì chưa có checkHealth. Green: 3 test service cho DTO hợp lệ, lỗi 503 và response sai; 2 test controller cho chỉ gọi khi bấm, báo kết quả và phục hồi khi thử lại. Lint không lỗi/cảnh báo, format/type-check xanh; Jest 15 suite / 48 test xanh. Maestro app-launch + api-health 2/2 xanh (35 giây); api-health bấm nút trên Android rồi xác nhận example-api-success với backend online thật.
- Bằng chứng: [Maestro API health](evidence/2026-10-17-api-health-maestro.xml); flow e2e/flows/api-health.yaml; test service/controller cạnh module example.
- PR / commit: Chưa tạo.
- Ghi chú: Chỉ health connectivity được xác nhận; chưa thử auth/mutation. Owner phản hồi language switch tốt là xác nhận riêng phần này, không coi là UAT đạt toàn phase. Phase vẫn Blocked do thiếu Login/auth navigator và owner chưa nghiệm thu cuối cùng. Không build native lại vì chỉ sửa JS/translation, E2E chạy app debug qua Metro.

### 2026-10-17 14:06 (+07:00) · @Bero
- Phase: 0.99 User Acceptance — owner chấp nhận bước 1–4a
- Trạng thái: Blocked
- Đã làm: Owner xác nhận trực tiếp trong chat: “Từ 1-4a đã được chấp nhận”. AI ghi nhận 1, 2, 3, 4 và 4a được owner chấp nhận trong file UAT, đồng bộ README phase và roadmap. Phạm vi gồm kiểm tra code/test, build/chạy Android, bằng chứng NativeWind/Nunito, đổi/lưu ngôn ngữ và nút API health.
- Test: Không chạy lại test vì chỉ ghi nhận kết quả UAT của owner, không đổi code. Bằng chứng trước đó: 15 suite / 48 test và Maestro 2/2 xanh; API health đã xác nhận trên Android.
- PR / commit: Chưa tạo.
- Ghi chú: Bước 5–9 chưa được owner xác nhận; không suy diễn là đã đạt hoặc không đạt. Bước 3 chấp nhận bằng chứng hiện có, không ghi đã xem màn kiểm tra tạm trên UI emulator hiện tại. 0.4 còn thiếu Login/auth navigator; Phase 0 và 0.99 giữ Blocked, chưa Done, chưa bật UI CODEOWNERS. Codex chỉ ghi lại xác nhận của owner.

### 2026-10-17 14:21 (+07:00) · @Bero
- Phase: 0.99 User Acceptance — owner chấp nhận bước 7, 8, 9
- Trạng thái: Blocked
- Đã làm: AI đối chiếu bước 9: bảng tech stack trong ARCHITECTURE với package.json và node_modules (RN 0.80.1, React 19.1.0, CLI 19.1.2, NativeWind 4.2.7, Tailwind 3.4.19, uuid 11.1.1, get-random-values 1.11.0, MSW 2.15.0, Maestro 2.11.0...), danh sách file khoá với .github/CODEOWNERS (khớp; src/components/ui còn comment đúng quy định) và cây thư mục đích. Owner chọn phương án (a): chấp nhận bước 9 kèm 4 điểm tồn đọng ghi trong file UAT (package boilerplate chưa có trong bảng, babel-plugin-inline-dotenv còn bật, devDependency không dùng/@types/react-native lỗi thời, gesture-handler/screens chưa liệt kê). Owner xác nhận trong chat “approve 7, 8”. Cập nhật file UAT, README phase và roadmap.
- Test: Không chạy lại test vì chỉ ghi nhận UAT và đối chiếu tài liệu, không đổi code. Bằng chứng bước 7, 8 là kết quả Jest/Maestro đã có trong PROGRESS.
- PR / commit: Chưa tạo.
- Ghi chú: Còn bước 5–6 (refresh/điều hướng Login, mutation có Origin với backend thật), phụ thuộc màn Login/auth navigator. 4 điểm tồn đọng của bước 9 chưa có ADR, chưa xử lý. Phase 0, 0.4 và 0.99 giữ Blocked, chưa Done, chưa bật khoá UI trong CODEOWNERS.

### 2026-10-17 14:24 (+07:00) · @Bero
- Phase: 0.99 Đồng bộ UAT đã chấp nhận sang sub-phase
- Trạng thái: Blocked
- Đã làm: Tick tiêu chí nghiệm thu và chuyển 0.1/0.2/0.3/0.11 sang Done theo xác nhận trực tiếp owner về UAT 1–4a; đồng bộ bảng trạng thái và nhật ký riêng. Tick tiêu chí cấp phase build/chạy Android, màu/font tương ứng.
- Test: Chỉ cập nhật tài liệu; không đổi code hoặc chạy lại test. Kiểm tra git diff --check.
- PR / commit: Chưa tạo.
- Ghi chú: Trước đó mới tick file UAT, chưa đồng bộ checklist sub-phase. Giữ nguyên cập nhật UAT 7–9 đang có sẵn trong tài liệu; lần này chỉ đồng bộ phạm vi 1–4a đã được xác nhận trong chat này. Không tự đặt toàn Phase 0/0.99 Done, không bật khoá UI.

### 2026-10-17 22:12 (+07:00) · @LogKoNger
- Phase: 0 Cập nhật phụ thuộc sau ADR-0022
- Trạng thái: Blocked
- Đã làm: Login/auth navigator đã có trong Phase1; bổ sung bằng chứng backend thật cho cookie/auth-me, Home, logout/Back. Xem [0.4](PHASE_00_04_HTTP.md) và [API Phase1](../PHASE_01_AUTH_HOME_UI/PHASE_01_06_API_INTEGRATION.md).
- Test: Jest132/132, Android UI4/4 và API1/1 đạt trong lượt Phase1; không sửa HTTP/config/native.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa kiểm tra native refresh khi hết hạn và mutation cần Origin; owner UAT5–6 chưa đạt. Không tự đổi trạng thái owner đã nghiệm thu hoặc đóng Foundation.

### 2026-10-17 22:47 (+07:00) · @LogKoNger
- Phase: 0.99 Bước 5 — chạy test refresh/phiên hết hạn và điều hướng Login
- Trạng thái: Blocked ở bằng chứng native/backend hết hạn
- Đã làm: Codex chạy lại các suite HTTP, sessionNavigation và useAuthSession theo yêu cầu owner. Xác nhận qua MSW: concurrent 401 dùng chung refresh, request gốc retry tối đa một lần, refresh lỗi xoá cache/auth, App chuyển từ Home về Login; response login/bootstrap muộn sau logout không khôi phục phiên. Không sửa production code.
- Test: Jest exit 0; 3/3 suite, 28/28 test PASS, 0 fail, 8.312 giây. Có cảnh báo React act(...) ở HookContainer, không làm test thất bại. Báo cáo và JSON tại evidence/2026-10-17-uat5-session.md và evidence/2026-10-17-uat5-session-jest.json.
- PR / commit: Chưa tạo.
- Ghi chú: Emulator emulator-5554 đang kết nối nhưng chưa có phiên test/cách kiểm soát hết hạn hoặc thu hồi để thử Android/backend thật. Đã hỏi owner điều kiện này. Không coi MSW là cookie native; chưa thử Android Back sau refresh hết hạn. Chưa tick owner UAT bước 5; Phase 0 vẫn Blocked ở bước 5–6. Xác nhận UAT Phase 1 trước đó giữ nguyên.

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
