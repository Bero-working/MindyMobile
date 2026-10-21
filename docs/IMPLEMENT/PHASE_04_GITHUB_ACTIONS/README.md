# Phase 04: GitHub Actions

## Mục tiêu và phạm vi

Tự động kiểm tra chất lượng và khả năng build MindyMobile trên GitHub Actions, trả kết quả riêng cho từng nhóm kiểm tra và lưu bằng chứng để tra lỗi. Owner yêu cầu tạo phase 4 và xác nhận bỏ Expo Doctor cùng Image Optimization trong chat ngày 2026-10-21 (+07:00).

- Có: TypeScript, ESLint, unit/component/integration test bằng Jest, E2E bằng Maestro trên Android Emulator, build Android APK/AAB và iOS Simulator không ký mã.
- Kèm kiểm tra định dạng Prettier hiện có trong job lint, theo Definition of Done của repo; đây không phải sub-phase mới.
- Không gồm: Expo Doctor, Image Optimization, phát hành lên store, ký bằng khoá production, deploy backend, E2E iOS hoặc tự thay đổi branch protection.
- Trạng thái: **In progress**. Đã triển khai workflow và helper 4.1–4.5; đang kiểm chứng local/GitHub, chưa UAT.

Đây là phase hạ tầng CI theo yêu cầu trực tiếp của owner, ngoại lệ phạm vi cho quy ước phase màn hình tại docs/README.md B.3; không thay quy ước của các phase sau. Không có UI hoặc tích hợp API nghiệp vụ mới, nên thiết kế UI, owner duyệt UI và bước gắn API không áp dụng. UAT cuối phase vẫn bắt buộc.

## Hiện trạng đầu vào

Khảo sát ngày 2026-10-21 từ package.json, cấu hình native, e2e/flows và [kiểm tra sau UAT Phase 3](../../PROGRESS/PHASE_03_STUDENT_LEARNING/README.md):

| Phần | Đã có | Điểm cần xử lý trong phase |
| --- | --- | --- |
| Workflow | .github/CODEOWNERS; chưa có .github/workflows/ | Tạo workflow mới, không gọi script build tương tác |
| TypeScript | npm run lint:type-check; noEmit, strict | Giữ nguyên tsconfig và kiểm tra toàn phạm vi đang include |
| ESLint | npm run lint:rules, npm run lint:code-format | Lint toàn repo đang lỗi JavaScript trong asset thiết kế; cần ngoại lệ hẹp theo ADR-0031 trước khi sửa cấu hình |
| Jest | npm test; MSW trong Node | Có lịch sử open handles; test:report tham chiếu jest-junit chưa có trong devDependencies, nên không dùng script này |
| Maestro | npm run test:e2e; 15 flow trong e2e/flows | 14 flow smoke/preview; api-health.yaml cần backend. Phải phân loại trước khi đưa lên CI |
| Android | Gradle 8.14.1, SDK/Build Tools 35, NDK 27.1.12297006 | Debug keystore không được track; release hiện ký bằng debug config; APK/AAB chỉ là bản CI |
| iOS | Podfile, scheme MindyMobile | Cần runner macOS, pod install và build Simulator; Gemfile.lock/Podfile.lock chưa được track |

Không suy từ kết quả local cũ thành CI đã đạt. Kết quả khảo sát/kiểm tra mới ghi riêng tại [PROGRESS](../../PROGRESS/PHASE_04_GITHUB_ACTIONS/README.md).

## Thiết kế workflow đích

File dự kiến: `.github/workflows/ci.yml`; helper nếu cần nằm trong `.github/scripts/`.

- Sự kiện: pull_request có nhánh đích là `dev`; push vào `dev` theo yêu cầu owner, không phụ thuộc nhánh mặc định của remote; workflow_dispatch để chạy tay. Push vào `main` và PR tới nhánh khác `dev` không tự kích hoạt CI. Không lọc paths khiến required checks bị treo khi chỉ sửa docs.
- permissions: contents: read; concurrency theo workflow và PR/ref, huỷ run cũ khi có commit mới; CI=true và HUSKY=0.
- Mỗi job checkout cùng revision, npm ci theo package-lock.json, cache npm theo lockfile; không cache node_modules hoặc phụ thuộc vào thư mục máy cá nhân.
- Chốt Node 24.16.0 (thay dự kiến Node 22 sau kiểm chứng Jest), JDK 17, Ubuntu 24.04 cho Android; macOS có Xcode hỗ trợ RN 0.80 cho iOS. Chốt phiên bản patch/runtime, runner macOS/Xcode và SHA action cụ thể trong task tương ứng, đối chiếu upstream rồi ghi vào PROGRESS. Không dùng latest cho Maestro.
- TypeScript, lint và Jest độc lập; E2E Android chỉ chạy sau cả ba job đạt. Hai job build cuối chỉ chạy khi quality checks và E2E Android đều đạt. Đây là quan hệ chạy trên CI; triển khai sub-phase vẫn tuần tự.

| Job ID ổn định | Lệnh / kết quả | Timeout dự kiến |
| --- | --- | --- |
| typecheck | npm run lint:type-check | 10 phút |
| eslint | npm run lint:rules -- --no-cache; npm run lint:code-format | 10 phút |
| unit-tests | npm test -- --ci --runInBand --watch=false --coverage | 15 phút |
| e2e-android | Build/cài debug x86_64, Metro và Maestro với tag ci | 45 phút |
| build-android | npm run build:android; npm run build:android:bundle | 45 phút |
| build-ios | xcodebuild Release cho iOS Simulator, CODE_SIGNING_ALLOWED=NO | 60 phút |

Artifact: coverage, báo cáo/log E2E đã loại dữ liệu nhạy cảm, log native và sản phẩm build; đặt tên theo platform/run để không trùng, retention 7 ngày. Báo cáo chẩn đoán tải lên cả khi test lỗi; artifact APK/AAB/app bắt buộc tồn tại nếu build được báo đạt. Thiếu file phải fail thay vì upload rỗng. Không dùng continue-on-error hoặc ép exit 0 cho job bắt buộc.

## Môi trường và build

- Tạo file `.env.ci` trong runner, chọn bằng ENVFILE trước khi build native; không sửa/đọc ra log nội dung .env cá nhân đang được track.
- Debug E2E: APP_ENV=development, DEBUG_MODE=false, APP_ORIGIN để trống, API_URL=http://127.0.0.1:7777/api/v1 (env development tự ánh xạ Android sang 10.0.2.2). Fixture Python cục bộ chỉ trả GET /auth/me → 401 AUTHENTICATION_REQUIRED và POST /auth/refresh → 401 INVALID_REFRESH_TOKEN theo contract để bootstrap khách; request API khác trả 500 và làm E2E fail qua audit. Không có tài khoản, cookie hợp lệ hoặc backend nghiệp vụ; preview không được coi là kiểm thử API thật.
- Build Release CI: APP_ENV=production, DEBUG_MODE=false, API_URL không rỗng. Mặc định dùng `https://example.invalid/api/v1` cho bản chỉ kiểm tra build; có thể dùng repository variable CI_API_URL trỏ staging. APP_ORIGIN chỉ nhận CI_APP_ORIGIN đã được backend xác nhận, nếu chưa có thì để trống. Các giá trị này là cấu hình nhúng trong app, không phải nơi giữ secret.
- Không gọi backend production, không tạo enrollment/giao dịch để làm CI xanh. Flow api-health và các thư mục e2e/api, e2e/backend không thuộc job PR bắt buộc; chỉ chạy riêng khi có môi trường và yêu cầu kiểm thử API.
- Build Android debug phục vụ E2E thuộc job e2e-android, không thay kết quả build Release APK/AAB cuối pipeline. Tạo debug keystore tạm trên runner để khớp signingConfigs hiện có, không thay Gradle.
- iOS chỉ chứng minh build Simulator; không suy thành archive thiết bị, IPA hoặc đủ điều kiện App Store. Hai lockfile Ruby/Pods chưa track là giới hạn tái lập cần ghi phiên bản thực tế; việc đưa lockfile vào repo nằm ngoài đặc tả này.

## Sub-phase và phụ thuộc

| # | File | Phụ thuộc | Trạng thái |
| --- | --- | --- | --- |
| 4.1 | [Type checking và khung workflow](PHASE_04_01_TYPE_CHECKING.md) | Phase 0–3 Done | Done |
| 4.2 | [ESLint và định dạng](PHASE_04_02_LINTING.md) | 4.1; ADR-0031 Accepted trước sửa .eslintrc.js | Done |
| 4.3 | [Unit test](PHASE_04_03_UNIT_TEST.md) | 4.2 | Done |
| 4.4 | [E2E Android](PHASE_04_04_E2E.md) | 4.3 | In progress |
| 4.5 | [Build Android và iOS](PHASE_04_05_BUILD.md) | 4.4 | In progress |
| 4.99 | [User Acceptance](PHASE_04_99_User_Acceptance.md) | 4.5 → Dọn dẹp → Kiểm tra | Todo |

Không thêm npm dependency trong phương án này. File hạ tầng dự kiến sửa duy nhất là .eslintrc.js theo [ADR-0031 Accepted](../../adr/ADR-0031-ci-design-assets-eslint-scope.md); chỉ sửa sau Accepted và cập nhật ARCHITECTURE.md cùng thay đổi. Nếu phát hiện cần sửa Jest setup/config, package.json, native hoặc file khoá khác thì đặc tả ADR riêng trước task đó; không mở khoá chung cho phase.

## Dọn dẹp và kiểm tra

- Dọn file/log tạm do Phase 4 tạo; giữ thay đổi Phase 3 và .gitignore đang có của owner. Không chỉnh asset thiết kế gốc.
- Kiểm tra YAML và expression workflow bằng công cụ phù hợp, kiểm tra bash helper nếu có; ghi tên/phiên bản công cụ vào PROGRESS. Chỉ kiểm tra cú pháp không chứng minh job chạy được.
- Chạy đủ TypeScript, ESLint, Prettier, Jest, bộ flow tag ci trên Android và hai job build; lưu URL run/revision, thời gian, số test/flow, artifact và giới hạn.
- Kiểm tra âm bằng thay đổi tạm trên nhánh kiểm tra: type sai, vi phạm ESLint, assertion Jest sai, testID E2E không tồn tại, lệnh build lỗi. Xác nhận từng job trả failure và build sau bị chặn; hoàn tác trước bàn giao.
- Thử pull_request tới `dev`, push vào `dev` và workflow_dispatch khi workflow có trên nhánh phù hợp; xác nhận push vào `main` và PR tới nhánh khác `dev` không tự kích hoạt CI. Khi chưa thể kiểm tra một sự kiện, ghi chưa kiểm tra; không đánh dấu đạt.

## Tiêu chí nghiệm thu chung

- [ ] Đúng 5 nhóm owner yêu cầu; không có Expo Doctor hoặc Image Optimization trong workflow.
- [ ] Các job báo kết quả riêng, không bỏ qua lỗi; build cuối chỉ chạy khi các kiểm tra bắt buộc đạt.
- [ ] Clean runner cài npm ci, môi trường và native toolchain thành công; không cần đường dẫn local/secret production.
- [ ] Phạm vi lint có giải thích và ADR; code app, test và cấu hình vẫn được lint.
- [ ] Jest kết thúc tự nhiên; không dùng forceExit để che open handles.
- [ ] Maestro chạy đủ bộ tag ci, ít nhất trên Android Emulator; API thật có trạng thái riêng.
- [ ] Có APK/AAB và app iOS Simulator từ CI cùng revision; giới hạn signing/backend được ghi rõ.
- [ ] Có bằng chứng thử lỗi, artifact, hướng dẫn chạy lại và owner UAT đạt trước khi chuyển Done.

## Nguồn kỹ thuật

- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax): events, permissions, needs, concurrency và timeout.
- [React Native 0.80 environment](https://reactnative.dev/docs/0.80/set-up-your-environment): yêu cầu môi trường Android/iOS và JDK.
- [Maestro CLI installation](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli): yêu cầu Java và cài CLI.
- Quy chuẩn repo: [testing](../../guides/testing.md), [linting](../../guides/linting.md), [CONTRIBUTING](../../CONTRIBUTING.md), [ARCHITECTURE](../../ARCHITECTURE.md), ADR-0001/0007/0008/0014/0017.
