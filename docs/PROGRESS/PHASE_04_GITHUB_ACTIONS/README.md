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

### 2026-10-21 16:04 (+07:00) · @Bero-working (Codex)

- Phase: 4 Kiểm tra guard và tài nguyên emulator
- Trạng thái: In progress
- Test: Helper dọn dung lượng chạy trên máy local trả exit1 ngay trước lệnh dọn; chỉ áp dụng GITHUB_ACTIONS=true, RUNNER_OS=Linux, RUNNER_ENVIRONMENT=github-hosted. Đối chiếu GitHub Variables reference và RunnerContext upstream xác nhận biến RUNNER_ENVIRONMENT được export. Không xoá toolchain trên máy phát triển.
- Sửa: Dừng Gradle daemon sau APK debug trước khi boot emulator để nhường RAM cho AVD4096M và Metro. Giữ nguyên Gradle/native config; lỗi lệnh vẫn fail theo pipefail. Các thay đổi dung lượng/bootstrap fixture đang chờ xác minh runner sạch, chưa đánh dấu4.4/4.5 đạt.

### 2026-10-21 16:43 (+07:00) · @Bero-working (Codex)

- Phase: 4 Đối chiếu ảnh lỗi E2E hosted và chốt viewport/readiness
- Trạng thái: In progress
- Run: c8597c0 / https://github.com/Bero-working/MindyMobile/actions/runs/39574120066. Quality success; debugAPK build đạt; E2E1/14pass,13/14fail, hai Release skipped.
- Bằng chứng: Artifact12335720100 chứa screenshot320×640. compact-welcome.png cho thấy nút preview nằm dưới fold và LogBoxtoast che vùngtap sau khi scroll; Metro có LaunchingDevTools do toast nhận tap. cold-bundle.png cho thấy flowđầu cònBundling77% khi hết thời gian. Audit28request chỉ GET/auth/me + POST/auth/refresh đúng401,0unexpected; bootstrapfixture hoạt động. Ảnh giữ tại evidence/ci-viewport-failure/.
- Sửa: Chốt AVD pixel_8 theo baseline14flowlocal1080×2400/density420 (localAPI37; CIAPI35 theo spec). Kiểm tra profile bằng avdmanager trước build. Prewarm index.bundle cùng queryRN Android, curl fail/timeout300s trước Maestro; không tăng timeout assertions hoặc bỏ assertions. Giữ flow/layout/app nguyên trạng; thêm readiness hạ tầng.
- Kiểm chứng âm: PRkiểmtra#3 / run39576534489: Android invalidGradleoption exit1, iOS invalidXcodeoption exit64, packagingđềuskipped, logsartifactđạt. Snapshot evidence/native-negative-jobs.json. Testbranch sẽ cập nhật baselineviewport/readiness mới rồi chỉ giữ testIDsai cho kiểm chứng E2E; không đưa lỗi thử vào PR#2.

### 2026-10-21 16:44 (+07:00) · @Bero-working (Codex)

- Đính chính entry viewport/readiness trước: Audit thực tế có26request, không phải28.13flow cần Welcome tạo GET/me + POST/refresh; app-launch chỉ assertroot nên không bắt buộc chờ bootstrap.0unexpected vẫn chính xác. Không dùng số28 làm bằng chứng.
- Task: 4.4 kiểm chứng âm — PR#3 cập nhật baseline96bf2ea, commit kiểmtra e5093911e51a012c0d3927b5ceb8f0f0c4afaec1, chỉ giữ app-launch testID sai. Gỡ workflow CLInegative khỏi head sau khi các ca đã xác minh; lịch sử/run39576534489 và artifact vẫn giữ. PR#2 không chứa testID sai hay workflow negative.

### 2026-10-21 16:51 (+07:00) · @Bero-working (Codex)

- Phase: 4 Chốt profile có sẵn trên runner
- Trạng thái: In progress
- Run: 96bf2ea / https://github.com/Bero-working/MindyMobile/actions/runs/39579199882. Quality success; precheck Pixel8 fail trước khi tốn13phút buildAPK. Artifact device-profiles.log xác nhận SDKCLI12 có pixel_7/pixel_7_pro nhưng không pixel_8.
- Sửa: Dùng profilepixel_7 đã có; đặt wm size1080×2400 và density420 rõ ràng trước test, ghi emulator-display.log, cleanup reset. Đây là viewport đã qua14flowlocalPixel8; CI vẫn API35 x86_64 theo spec. Không đổi UI/testassertions. Giữ prewarm bundle300s trước Maestro.
- Ghi chú: Nhánhkiểmtra#3 sẽ đồng bộ baseline này rồi chỉ giữ testID sai. Snapshot CLInegative trước vẫn hợp lệ: lệnh Android/iOS không đổi, chỉ thay viewport/readiness của E2E.

### 2026-10-21 19:31 (+07:00) · @Bero-working (Codex)

- Phase: 4.1.1 Điều chỉnh nhánh kích hoạt CI theo yêu cầu owner
- Trạng thái: Done
- Đã làm: Đổi bộ lọc push từ main sang dev và giới hạn pull_request tới dev trong .github/workflows/ci.yml. Đồng bộ README Phase 4, đặc tả 4.1, hướng dẫn UAT 4.99 và guide CI; giữ workflow_dispatch. Các entry cũ mô tả main/PR mọi nhánh là lịch sử cấu hình trước thay đổi này.
- Test: Parse YAML bằng js-yaml PASS; xác nhận push.branches và pull_request.branches đều chỉ có dev, workflow_dispatch và 6 job được giữ nguyên PASS; git diff --check PASS. Chưa kiểm chứng trigger mới trên GitHub Actions; chưa push thay đổi trong lượt này.
- Ghi chú: AI tự kiểm tra thay đổi trigger; phase vẫn In progress, chưa UAT. GitHub handle xác minh qua API /user với credential hiện có. Các thay đổi Phase 3, .gitignore và e2e/flows/api-health.yaml có sẵn được giữ nguyên.

### 2026-10-21 19:35 (+07:00) · @Bero-working (Codex)

- Phase: 4.4 Chẩn đoán LogBox che thao tác trên runner và tiếp tục CI cho dev
- Trạng thái: In progress
- Bằng chứng: Run 39580163195 tại revision 1809131 có quality checks đạt, E2E 6/14 đạt và 8/14 lỗi, hai build cuối skipped đúng needs. Artifact 12339427271 và logcat xác nhận cảnh báo `[Reanimated] Reduced motion setting is enabled on this device.`; ảnh tại evidence/ci-reduced-motion cho thấy LogBox che preview-tools/tab/filter apply. Không coi lỗi thao tác này là kết quả API.
- Nguyên nhân và sửa: Action emulator đặt disable-animations=true khiến transition_animation_scale=0. NativeProxyCommon.java của Reanimated đang cài đọc chính setting này để bật Reduced Motion. Đổi action sang false và đặt rõ cả ba animation scale 1.0 trước mở app, ghi emulator-animation.log. Không sửa app, native config, dependency hoặc assertions; giữ nguyên 14 flow.
- Test: Bash syntax helper PASS; parse YAML và assert filter push/PR dev cùng disable-animations=false PASS; diff --check PASS. Hosted mới còn chờ, chưa đánh dấu 4.4/4.5 đạt.
- PR: Tiếp tục PR #2, chuyển nhánh đích sang dev theo yêu cầu owner. Không merge hoặc thay branch protection/default branch. PROGRESS cũ giữ nguyên làm lịch sử.

### 2026-10-21 20:15 (+07:00) · @Bero-working (Codex)

- Phase: 4.4 Kiểm chứng motion trên hosted và sửa thao tác Maestro
- Trạng thái: In progress
- Run: https://github.com/Bero-working/MindyMobile/actions/runs/39600990649 tại afea99e. Quality checks đạt; E2E 12/14 đạt, 2 lỗi; cả hai Release bị chặn đúng needs. emulator-animation.log xác nhận cả ba scale=1.0; audit fixture không có request nghiệp vụ. Các lỗi do LogBox trước đó đã hết.
- Bằng chứng: Artifact 12346824650, report và hai ảnh tại evidence/ci-interactions/. Pagination hiển thị đầy đủ tại bounds [677,1969][782,2074] nhưng centerElement=true tiếp tục cố kéo phần tử cuối trang tới giữa, hết 20s. Tap payment-copy-account mất 12285ms do đợi settle trong màn countdown cập nhật mỗi giây; toast controller tự ẩn sau 2500ms nên assertion kế tiếp đã quá muộn.
- Sửa: Đặc tả trước khi sửa flow: courses-browse giữ visibilityPercentage=100 nhưng centerElement=false; cart-checkout-qr giới hạn waitToSettleTimeoutMs=100 trên tap sao chép, giữ nguyên assertVisible payment-toast. Không tăng thời gian toast, timeout assertion hoặc sửa app/native. Đối chiếu tài liệu Maestro scrollUntilVisible và tapOn; đang kiểm tra local hai flow.
- Ghi chú: Bản kiểm chứng âm 39601188597 cũng đã fail và chặn build; sẽ đồng bộ hai sửa thao tác trước khi chốt bằng chứng testID sai. Chưa đánh dấu E2E/build đạt hoặc UAT.

### 2026-10-21 20:20 (+07:00) · @Bero-working (Codex)

- Phase: 4.4 Hoàn tất sửa thao tác pagination/toast local, chạy lại hosted
- Trạng thái: In progress
- Test local: Payment flow PASS 56s với waitToSettleTimeoutMs=100 trên tap copy; courses PASS 70s sau khi cuộn pagination ra khỏi tab bar cố định. Giữ toàn bộ assertions cũ, thêm assertion nút pagination; không đổi app/native/timeout assertion. Bằng chứng tại evidence/ci-interactions và nhật ký 4.4; nhật ký cũng ghi lỗi local trung gian, không gộp thành suite 2/2 đạt cùng lượt.
- Kiểm chứng âm: Run 39601188597 tại 084e159 fail đúng testID app-launch cố ý sai và chặn Release; đồng thời có hai lỗi thao tác của baseline afea99e. Đính chính ý định entry trước: không cần lặp probe app-launch không đổi sau sửa hai flow khác. Không coi các lỗi thao tác là kiểm chứng âm mong muốn.
- Ghi chú: Bản sửa chuẩn sẽ chạy lại đủ 14 flow hosted. Chưa có kết quả Release hoặc đủ điều kiện UAT.
