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
