# Tiến độ Phase 04 — GitHub Actions

Đặc tả: [IMPLEMENT Phase 4](../../IMPLEMENT/PHASE_04_GITHUB_ACTIONS/README.md). Trạng thái triển khai **Todo**. Nhật ký chỉ ghi thêm; kết quả UAT 4.99 ghi tại đây.

### 2026-10-21 14:53 (+07:00) · @Bero

- Phase: 4 Khởi tạo đặc tả
- Trạng thái: Todo
- Đã làm: Codex soạn phase theo yêu cầu owner, gồm TypeScript, ESLint, Jest, Maestro Android và build Android/iOS Simulator; owner xác nhận bỏ Expo Doctor và Image Optimization. Thêm task tuần tự 4.1–4.5, UAT 4.99, roadmap và ADR-0031 Proposed cho phạm vi lint asset thiết kế. Handle Bero do owner cung cấp trong chat vì máy không có gh để truy vấn.
- Test: Đã rà package.json, tsconfig, ESLint/Jest, e2e flows, Gradle, Podfile/Gemfile và lịch sử kiểm tra Phase 3. Kết quả kiểm tra mới và kiểm tra tài liệu sẽ ghi entry riêng sau khi hoàn tất; chưa có workflow GitHub để chạy.
- PR / commit: Chưa tạo.
- Ghi chú: Chỉ lập phase; không sửa workflow, cấu hình, native/dependency hoặc mã app. ADR-0031 chưa Accepted. Không suy kết quả local thành CI đạt; giữ nguyên các thay đổi Phase 3 và .gitignore có sẵn. Phase chưa triển khai và chưa UAT.

### 2026-10-21 14:59 (+07:00) · @Bero

- Phase: 4 Kiểm tra đặc tả và hiện trạng đầu vào
- Trạng thái: Todo
- Đã làm: Codex kiểm tra 16 file Markdown trong IMPLEMENT/PROGRESS Phase 4, roadmap và ADR; không có liên kết tệp thiếu hoặc lỗi whitespace. Đối chiếu đúng 14 tên flow smoke/preview trong spec với 15 flow hiện có trừ api-health. git diff --check đạt. Mã nguồn nền tại HEAD 55a7e12304f3a39bc6d6984f321de477d086d87c, không có thay đổi mã app/config do lượt này.
- Test: Chạy trực tiếp CLI cục bộ đã cài, tương đương script package.json: TypeScript tsc exit 0; Prettier --check trên src/tests/__tests__ exit 0; ESLint toàn repo --no-cache exit 1 với 626 lỗi/44 warnings; Jest --ci --runInBand --watch=false chạy 63/63 suites và 294/294 tests đạt trong 79.652 giây nhưng không tự thoát. Tiến trình Jest bị dừng bởi timeout chẩn đoán 180 giây, không dùng forceExit và không ghi nhận lượt Jest là kiểm tra kết thúc thành công.
- PR / commit: Chưa tạo.
- Ghi chú: ESLint/open handles là hiện trạng cần xử lý ở 4.2/4.3, không sửa trong lượt lập phase. Log và summary local ở thư mục TEMP/mindy-phase04-checks, không đưa raw log vào repo. Chưa chạy native E2E/build hoặc bất kỳ workflow trên GitHub trong lượt này; bằng chứng native cũ thuộc Phase 3. Phase 4, các sub-phase và UAT giữ Todo; lập đặc tả đã hoàn tất.

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Phase: 4 Triển khai CI
- Trạng thái: In progress
- Đã làm: Owner duyệt ADR-0031; tạo workflow6job cho5nhóm, helper env/toolchain/E2E/packaging/redaction, tag14flowci và1backend; sửa lifecycle trong2testApp, guideCI. Không thêm dependency, không đổi native/Jest config; giữ thay đổi Phase3 và .gitignore của owner.
- Test: TypeScript/ESLint/Prettier PASS;63suites/294tests với coverage PASS và process tự thoát; type/lint/format/assertion negative đều fail đúng. actionlint1.7.7 YAML/expression PASS; ShellCheck0.10.0 với3helper PASS; GitBash bash-n PASS. npmci+tsc archive sạch PASS. E2E local đang chạy; hosted/build/events/negative native chưa kiểm tra.
- PR / commit: Chuẩn bị nhánh codex/phase-04-github-actions từ55a7e12, PR nháp basefeat/phase-03 (remote cùngHEAD; main chưa có Phase3). Không merge hay đổi branch protection. GitHub identity từ credential/API: Bero-working.
- Ghi chú: Chưa đủ điều kiện UAT; không đặt Done. Runtime/action versions và nguồn tại guides/ci.md. Kết quả chạy tiếp ghi entry mới.

### 2026-10-21 15:25 (+07:00) · @Bero-working (Codex)

- Phase: 4 Kiểm chứng workflow và helper
- Trạng thái: In progress
- Đã làm: Tạo PR nháp https://github.com/Bero-working/MindyMobile/pull/2 (base feat/phase-03), commit 2e676f8. Run PR đầu: https://github.com/Bero-working/MindyMobile/actions/runs/39568777659. Type checking và ESLint and formatting hosted đã success; Jest đang chạy tại thời điểm entry.
- Test: Helper packaging negative thiếu APK/AAB/app fail; fixture packaging kiểm tra SHA256/revision PASS; prepare-env chọn production/default API và từ chối newline PASS; redaction Authorization/password/Cookie PASS. Đây là test helper bằng fixture, không phải native build. actionlint 1.7.7 với ShellCheck 0.10.0 và ba helper PASS; sửa newline dư cuối helper. Coverage local: statements 83.62%, branches 81.51%, functions 75%, lines 84.52%, 63 suite/294 test PASS trong 41.694 giây, tự thoát.
- Ghi chú: Metro chuyển sang Node CLI trực tiếp để trap dừng đúng process. E2E local đang đạt 9/14 flow; chưa kết luận suite. Đang chạy lại Node 22 local; chưa đạt thì không suy từ Node 24. Các kết quả sau sẽ ghi entry mới; UAT giữ Todo.

### 2026-10-21 15:29 (+07:00) · @Bero-working (Codex)

- Phase: 4 Chốt runtime sau kiểm chứng
- Trạng thái: In progress
- Quyết định: Cập nhật đặc tả trước khi sửa workflow: Node 24.16.0 thay dự kiến Node 22.22.0. Node 22 trên local treo CPU trong suite Home khi chạy đủ suite, tái hiện cả khi chỉ chạy file Home; riêng test carousel/nativewind/learningFlow chạy đạt. Chưa xác định root cause sâu, không sửa assertion hoặc skip suite để né lỗi. Job Jest hosted Node 22 cũng chưa hoàn tất tại thời điểm entry, chưa có log đầy đủ nên không kết luận cùng nguyên nhân. Node 24.16.0 chạy đủ 63 suite/294 test với coverage trong 41.694 giây, process tự kết thúc; đây là runtime được chọn để kiểm chứng hosted tiếp.
- Test: Hai quality checks Type checking/ESLint hosted PASS trên cả commit 2e676f8 và f018251. Run 39568777659 cancelled do push commit kế, không được ghi toàn pipeline đạt. Run 39569133471 sẽ bị thay thế bởi commit runtime mới. Giữ giới hạn runtime Node 22 trong nhật ký, không forceExit hay tăng timeout.
- Ghi chú: Runtime không thêm npm dependency hoặc sửa package.json; engines hiện có cho phép Node >=18. E2E local 13/14 đang qua; kết quả cuối ghi riêng.

### 2026-10-21 15:31 (+07:00) · @Bero-working (Codex)

- Phase: 4 E2E local và chuẩn bị kiểm chứng âm hosted
- Trạng thái: In progress
- Test: Maestro 2.11.0, emulator-5554 Pixel_8, 14/14 flow tag ci PASS trong 11m19s; JUnit evidence/local/maestro-ci-report.xml. Đây là APK debug đã cài và Metro có sẵn, chưa chứng minh runner sạch/env.ci hoặc API thật. Flow api-health không chạy. Bản copy app-launch đổi testID thành phase04-deliberately-missing-id fail đúng (1/1 flow failed), report evidence/local/maestro-negative-report.xml; source flow gốc giữ nguyên.
- Đã làm: Tạo probe tạm trong src/phase04-ci-negative-probe.test.ts để GitHub kiểm tra type sai, biến không dùng và assertion sai cùng run; nhánh PR dùng cho kiểm chứng, chưa bàn giao. Sẽ xoá probe ngay sau khi quan sát failure/needs và chạy lại bản chuẩn. Không giữ probe trong bản cuối.
- Run: Bản Node24 a037cff đang được kiểm chứng; run Node22 f018251 đã cancelled khi thay runtime, không báo thành công.

### 2026-10-21 15:35 (+07:00) · @Bero-working (Codex)

- Phase: 4 Kiểm chứng âm hosted hoàn tất cho quality gates
- Trạng thái: In progress
- Run: https://github.com/Bero-working/MindyMobile/actions/runs/39569983962 trên commit e95881d, Node 24.16.0, PR #2.
- Test: Type checking fail exit 2 với TS2322 tại probe; ESLint fail exit 1 với no-unused-vars tại probe; Jest fail exit 1 đúng assertion Expected2/Received1. Toàn bộ suite thật vẫn 63/63 suite và 294/294 test PASS, cộng 1 suite/test cố ý sai: 64 suite, 295 test, 57.309 giây, process tự thoát. E2E Android, Build Android và Build iOS Simulator đều skipped do quality gates fail; snapshot evidence/quality-negative-jobs.json. Coverage artifact của lượt lỗi được upload.
- Đã làm: Xoá probe khỏi source ngay sau khi xác minh; chuẩn bị commit khôi phục để chạy đủ pipeline sạch. Sửa hai liên kết spec đang trỏ audit Phase3 chỉ có local sang README Phase3 đã track; không đưa thay đổi Phase3 của owner vào commit.
- Ghi chú: Kết quả âm này không chứng minh E2E/native build đạt; tiếp tục run bản khôi phục, UAT chưa bắt đầu.

### 2026-10-21 15:41 (+07:00) · @Bero-working (Codex)

- Phase: 4 Kiểm chứng runner sạch / sửa PATH Android
- Trạng thái: In progress
- Run: https://github.com/Bero-working/MindyMobile/actions/runs/39570425701, commit 6cc61b6.
- Test: Type checking, ESLint and formatting, Unit tests đều hosted success. Jest 63 suite/294 test PASS trong 50.319 giây, coverage 83.62/81.51/75/84.52%, tự thoát. E2E fail exit127 trước native build vì sdkmanager không có trong PATH; Build Android/iOS skipped đúng dependency. Chưa có APK/AAB/app artifact.
- Sửa: Helper tìm sdkmanager trong ANDROID_HOME/cmdline-tools thay vì giả định PATH; ghi cmdline-tools/platform-tools/emulator vào GITHUB_PATH. Khởi tạo ci-logs và ghi toolchain log trước cài SDK để lỗi chuẩn bị cũng có diagnostics. Không sửa native/dependency hoặc thêm action. Đối chiếu Ubuntu2404 runner-images xác nhận SDK root /usr/local/lib/android/sdk, command-line tools đã cài; image run ubuntu24/20261018.339.
- Ghi chú: Lỗi upload trống của run này xảy ra do bước toolchain dừng trước mkdir cũ; bản sửa bắt đầu tạo log ngay đầu helper. Tiếp tục kiểm chứng runner sạch; không coi quality PASS là E2E/build PASS.

### 2026-10-21 15:58 (+07:00) · @Bero-working (Codex)

- Phase: 4 Xác minh phụ thuộc bootstrap và thêm fixture CI
- Trạng thái: In progress
- Phát hiện: Navigation chạy useAuthSession trước Welcome/preview; URL example.invalid làm NETWORK_ERROR và chặn vào Welcome. Phân loại cũ thiếu phụ thuộc bootstrap dù 14 flow chỉ dùng preview. Cập nhật đặc tả/guide cho fixture HTTP cục bộ; không bỏ flow hoặc thay assertions.
- Sửa: preview-api.py (Python stdlib) trên loopback 7777, GET /api/v1/auth/me → 401 AUTHENTICATION_REQUIRED, POST /api/v1/auth/refresh → 401 INVALID_REFRESH_TOKEN theo auth.md và API_CONTRACT/README. Không cấp session/cookie hợp lệ hoặc gọi backend thật. API khác trả500 và audit khiến job fail; audit chỉ method/path/status. Development ENVFILE dùng127.0.0.1:7777, env.ts hiện có tự ánh xạ10.0.2.2. E2E khởi động/health/cleanup fixture, curl có timeout hữu hạn và deadline readiness. Không sửa navigator/auth/HTTP/native/config khoá hoặc thêm dependency.
- Test: Fixture real HTTP readiness/guest/refresh PASS; request /orders bị500 và đánh unexpected; query token fixture không xuất hiện trong audit. Bash syntax PASS. Maestro CLI trong zip có class major61, xác nhận tương thích Java17. Bản a1639e4 đã qua toolchain và build x86_64 debug APK, đang bước chạy flow; thay run để APK mới nhúng URL fixture, không coi run cũ là14flow CI đạt.
- Tự nghiệm thu: 4.1–4.3 Done với hosted quality và kiểm chứng âm; 4.4/4.5 tiếp tục, Phase4/UAT chưa Done. Giữ14/14 local preview và nguồn API thật là hai bằng chứng riêng.

### 2026-10-21 16:02 (+07:00) · @Bero-working (Codex)

- Phase: 4 Chẩn đoán dung lượng runner Android
- Trạng thái: In progress
- Run: a1639e4 / https://github.com/Bero-working/MindyMobile/actions/runs/39571171627 hoàn tất failure. Debug x86_64 build SUCCESSFUL trong12m55s,543tasks. Lỗi gốc sau đó: cài Google APIs Intel x86_64 system image → No space left on device; adb5554 connection refused là lỗi cleanup sau cài đặt, emulator chưa sẵn sàng. Không phải lỗi assertions hoặc buildAPK. Hai job Release skipped.
- Sửa: prepare-linux-runner.sh chỉ cho phép GitHub-hosted Linux tạm; dọn .NET/Swift/GHC/Boost/CodeQL không dùng, ghi df trước/sau. Android toolchain gỡ NDK khác qua SDK Manager, giữ/cài27.1.12297006. Áp dụng cho E2E và Build Android để chừa chỗ cho system image/native outputs. Không sửa native hoặc file máy phát triển.
- Ghi chú: Run34d23a0 chứa fixture đang được thay bằng bản bổ sung dung lượng trước khi lặp build tốn thời gian. Giữ nguyên assertions và runtimegates. Bằng chứng native full pipeline vẫn chưa đủ, tiếp tục kiểm chứng.
