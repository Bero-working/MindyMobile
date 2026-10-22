# Tiến độ 4.5 — Build Android và iOS

Nhật ký triển khai chỉ ghi thêm theo ENTRY.md. Chưa bắt đầu; task và tiêu chí tại [IMPLEMENT 4.5](../../IMPLEMENT/PHASE_04_GITHUB_ACTIONS/PHASE_04_05_BUILD.md).

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.5.1: Job Build Android needs đủ quality+E2E; envproduction, debug signing tạm, script APK/AAB gốc. Helper bắt thiếu/rỗng output trước upload, có checksum/revision. Chưa có native build/hosted artifact tại entry này.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.5.2: Job Build iOS Simulator macOS15/Xcode16.4 (đối chiếu runner-images upstream), Ruby3.2.6/Bundler2.6.9, bundle/pod install, ghi lockfile/version thực tế; xcodebuild SimulatorRelease không ký mã. Máy local Windows không thể xác nhận build iOS; chờ runner thật.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.5.3: Guide CI ghi needs, job names, variables, timeout/cache/artifact/signing/backend/lockfile và cách chạy lại; không đổi settings repo.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-22 06:46 (+07:00) · @Bero-working (Codex)

- Phase: 4.4/4.5 Tiếp tục kiểm chứng hosted
- Trạng thái: In progress
- Run: https://github.com/Bero-working/MindyMobile/actions/runs/39618310147 tại 5b3fe3ad06027a1f39ee160f44bf608c663204d8. TypeScript, ESLint/formatting, Jest, E2E Android và Build iOS Simulator đều success. E2E đã qua guard 13 testcase; thanh toán vẫn payment-pending theo yêu cầu owner. Artifact iOS Simulator ID 12356876663 có 14954622 byte; đang tải để kiểm tra checksum/revision.
- Lỗi Android: job 119304867030 thất bại tại configureCMakeRelWithDebInfo arm64-v8a; autolinking tham chiếu JNI codegen chưa tồn tại trong node_modules của runner riêng. Không coi pipeline này đạt.
- Sửa: Cập nhật đặc tả 4.5.1, giữ và hoàn thiện thay đổi workflow có sẵn: chạy generateCodegenArtifactsFromSchema trước assembleRelease/bundleRelease, log riêng. Đối chiếu tác vụ trong React Native Gradle plugin đang cài và tài liệu https://reactnative.dev/docs/the-new-architecture/using-codegen. Không sửa native/dependency/app hoặc lấy output từ E2E.
- Kiểm tra: actionlint 1.7.7, YAML/assert thứ tự codegen trước Release và triggers dev, git diff --check PASS. Chuẩn bị commit/push đúng phạm vi Phase 4 vào PR #2 để chạy lại; giữ thay đổi Phase 3/.gitignore/api-health của owner. Chưa đủ điều kiện UAT.

### 2026-10-22 06:52 (+07:00) · @Bero-working (Codex)

- Task: 4.5.2 Kiểm tra sản phẩm iOS đã build
- Trạng thái: iOS Simulator đạt; sub-phase 4.5 còn In progress vì Android Release đang kiểm chứng.
- Bằng chứng: Artifact 12356876663 từ run 39618310147 đã tải, SHA-256 archive khớp SHA256SUMS. Gói chứa Info.plist và executable Mach-O 34582904 byte; CFBundleSupportedPlatforms=[iPhoneSimulator], DTPlatformName=iphonesimulator, SDK iphonesimulator18.5. revision.json ghi PR merge revision ad3d48c0a991d1985682f3497417d59d0ae8ebe5, đúng checkout của sự kiện PR có head 5b3fe3a. Tóm tắt tại evidence/hosted-5b3fe3a/ios-verification.json; không thêm binary/log thô vào repo.
- Giới hạn: Đây là Release Simulator không ký mã, không chứng minh IPA/archive thiết bị hoặc phát hành store. Pipeline mới 39695570257 tại 4ff221a có cả ba quality job success, đang build debug cho E2E; chưa có kết quả Android Release mới. Push dev/dispatch còn chờ workflow xuất hiện trên nhánh phù hợp; không tự merge hay đổi settings để tạo bằng chứng.
