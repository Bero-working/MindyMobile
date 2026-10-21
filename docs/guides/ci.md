# GitHub Actions CI

Workflow: [.github/workflows/ci.yml](../../.github/workflows/ci.yml).
Chạy trên PR tới mọi nhánh, push vào `main` (nhánh mặc định đã xác minh từ remote),
và **Actions → CI → Run workflow** khi workflow có trên default branch.
PR đầu tiên có thể nhắm `feat/phase-03` vì Phase 3 chưa được merge vào main.
Không tự thay branch protection hoặc merge PR.

## Kết quả và thứ tự

| Job ID | Tên check | Phụ thuộc | Timeout |
| --- | --- | --- | --- |
| typecheck | Type checking | — | 10 phút |
| eslint | ESLint and formatting | — | 10 phút |
| unit-tests | Unit tests | — | 15 phút |
| e2e-android | E2E Android | Cả ba quality checks | 45 phút |
| build-android | Build Android | Ba quality checks và E2E Android | 45 phút |
| build-ios | Build iOS Simulator | Ba quality checks và E2E Android | 60 phút |

Mọi job checkout revision của cùng sự kiện. PR dùng merge revision do GitHub cung cấp;
`revision.json` trong sản phẩm build ghi đúng `GITHUB_SHA` đó, run và attempt.
Run mới huỷ run cũ của cùng PR/ref. Không lọc paths; sửa docs vẫn có checks.
Job lỗi làm các job phụ thuộc bị chặn; không có `continue-on-error` hoặc `forceExit`.

## Môi trường

- Ubuntu 24.04; Node **24.16.0**; `npm ci` từ package-lock hiện có. Chỉ cache npm,
  không cache node_modules. Gradle dùng setup-gradle v4.4.2, cache PR chỉ đọc.
- Hai job Linux native giải phóng toolchain .NET/Swift/GHC/Boost/CodeQL không dùng và gỡ các NDK khác qua SDK Manager trên runner GitHub-hosted tạm, có guard và log dung lượng. Không chạy helper dọn hệ thống trên máy phát triển.
- Android: Temurin **17.0.14+7**, SDK/Build Tools 35, NDK 27.1.12297006;
  emulator Google APIs 35 x86_64, 2 cores, RAM 4096 MB, KVM, tắt animation.
- Maestro **2.11.0**, zip release `cli-2.11.0`, xác thực SHA-256
  `5384593cb4e7a106489e75a821d157dd43f4e438df6bc308b72e82c685e1283a`.
  CLI đã đối chiếu `--include-tags`, JUnit, debug-output và test-output-dir.
- iOS: macOS 15, Xcode **16.4** qua DEVELOPER_DIR; Ruby **3.2.6**, Bundler **2.6.9**.
  Pods và gems giải theo Gemfile hiện có; phiên bản/lockfile thực tế lưu trong log artifact.
  Chưa track Gemfile.lock/Podfile.lock nên dependency Ruby/Pods chưa tái lập tuyệt đối.
- Actions checkout v4.2.2, setup-node v4.4.0, setup-java v4.7.1, setup-gradle v4.4.2,
  emulator-runner v2.34.0, ruby/setup-ruby v1.207.0, upload-artifact v4.6.2 đều pin commit SHA.

Runner tạo `.env.ci`, chọn bằng ENVFILE tuyệt đối; không dùng `.env` cá nhân để cấu hình native.
E2E dùng APP_ENV=development, API_URL=http://127.0.0.1:7777/api/v1 (Android tự ánh xạ sang 10.0.2.2),
APP_ORIGIN trống và DEBUG_MODE=false. Đây là 14 flow smoke/preview gắn tag `ci`;
`api-health` mang tag `backend`, e2e/api và e2e/backend không chạy trong PR CI.
Fixture Python cục bộ chỉ phục vụ bootstrap khách: GET /auth/me trả 401 AUTHENTICATION_REQUIRED, rồi POST /auth/refresh trả 401 INVALID_REFRESH_TOKEN theo contract. Không tạo phiên/cookie hợp lệ. Request API khác trả 500 và khiến E2E fail qua audit JSONL; không gọi backend thật. Chạy preview không chứng minh API auth, thanh toán hay quyền truy cập thật.

Release dùng APP_ENV=production và DEBUG_MODE=false. Repository variables tuỳ chọn:

| Variable | Mặc định | Ý nghĩa |
| --- | --- | --- |
| CI_API_URL | https://example.invalid/api/v1 | URL nhúng vào bản CI; có thể chỉ định staging |
| CI_APP_ORIGIN | Trống | Chỉ đặt sau khi backend xác nhận Origin |

Đây là cấu hình công khai nhúng trong app, không đặt credential vào variables này.
CI chỉ build Release, không tự mở app Release hoặc thực hiện giao dịch trên backend.
Quyền workflow là `contents: read`, không cần secret production.

## Chạy lại và đọc lỗi

Mở check của PR để xem bước lỗi. **Re-run failed jobs** chạy lại cùng revision;
sửa mã rồi push tạo run mới. `workflow_dispatch` chỉ có sau khi GitHub nhận workflow
trên default branch; thiếu nút Run workflow trong PR đầu tiên không phải kết quả đạt.

Kiểm tra local tương ứng:

```bash
npm ci
npm run lint:type-check
npm run lint:rules -- --no-cache
npm run lint:code-format
npm test -- --ci --runInBand --watch=false --coverage
npm run test:e2e -- --include-tags ci
```

E2E local cần app debug đã cài, Metro và emulator. Khi APK dùng URL CI, chạy `python3 .github/scripts/preview-api.py` trên host trước Maestro để phục vụ bootstrap khách. Runner tự build/cài APK, chờ
Metro tối đa 180 giây và emulator tối đa 300 giây, reverse port 8081, chạy 14 flow
và kiểm tra JUnit đủ 14 testcase thành công. Fixture có readiness tối đa 30 giây và audit chỉ method/path/status. Cleanup dừng fixture/Metro/logcat và reset font/kích thước.
Không bỏ assertion hoặc retry test thất bại để làm xanh pipeline.

Nếu npm ci lỗi, đọc bước cài dependency và giữ nguyên lockfile để tái hiện;
không thay bằng npm install. Lỗi native/Pods trong file hạ tầng bị khoá cần ADR riêng
trước khi sửa theo docs/README.md B.8.

## Artifact

Tải tại phần **Artifacts** của workflow run, retention **7 ngày**, tên có run ID/attempt:

- `unit-tests-*`: coverage và Jest log, kể cả khi assertion lỗi.
- `e2e-android-*`: JUnit, screenshot/debug/result Maestro, Metro/logcat và log debug build.
- `android-release-ci-debug-signed-*`: APK/AAB Release, SHA256SUMS và revision.json.
  Ký bằng debug keystore tạm; chỉ để kiểm tra build, chưa phải gói phát hành Play Store.
- `ios-simulator-release-*`: tar.gz chứa MindyMobile.app, SHA256SUMS và revision.json.
  Release Simulator không ký mã; chưa chứng minh archive thiết bị/IPA/App Store.
- `android-build-logs-*`, `ios-build-logs-*`: log native; iOS kèm phiên bản và lockfile đã giải.

Thiếu/rỗng APK/AAB hoặc executable Simulator làm job fail. Upload sản phẩm chỉ sau build
và kiểm tra output đạt; diagnostics dùng always và đã lọc giá trị credential-shaped.
Không upload env, keystore, cache hay toàn workspace. Nếu lỗi trước khi tạo log/coverage,
đọc trực tiếp log bước trong Actions; artifact không tồn tại không có nghĩa đã kiểm tra đạt.

## Nguồn đối chiếu

[Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax),
[runner macOS 15](https://github.com/actions/runner-images/blob/main/images/macos/macos-15-Readme.md),
[Maestro TestCommand 2.11.0](https://github.com/mobile-dev-inc/Maestro/blob/cli-2.11.0/maestro-cli/src/main/java/maestro/cli/command/TestCommand.kt).
SHA các action được xác minh trực tiếp từ tag upstream bằng git ls-remote ngày 2026-10-21.
