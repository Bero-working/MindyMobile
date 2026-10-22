# Bàn giao Phase 4 — GitHub Actions

Trạng thái: **In review — chờ owner UAT 4.99**. Các sub-phase 4.1–4.5 đã được AI tự kiểm tra đạt. Owner báo CI hoàn tất kèm ảnh ngày 2026-10-22; đây chưa phải xác nhận UAT Phase 4. Chỉ chuyển phase Done sau khi owner nghiệm thu theo [hướng dẫn UAT](../../IMPLEMENT/PHASE_04_GITHUB_ACTIONS/PHASE_04_99_User_Acceptance.md).

## Run đã kiểm chứng

- [CI #20 / run 39700197090](https://github.com/Bero-working/MindyMobile/actions/runs/39700197090): **success**, 6/6 job đạt, không skipped; tổng thời gian **1 giờ 9 phút 28 giây**.
- PR: [#2, base dev](https://github.com/Bero-working/MindyMobile/pull/2).
- Head đã kiểm tra: `6a887c588a63278924661c1c8580aa63c7b107ef`.
- Checkout/metadata sản phẩm là PR merge revision `6ee3eda91cb2853ee3e2cd4bd2d039d1d9c0c95f`. Hai sản phẩm Android/iOS cùng revision và run, khác với SHA head là đúng cơ chế pull_request.
- Run bắt đầu 2026-10-22 07:31:25, kết thúc 08:40:53 (+07:00).

| Job | Kết quả | Thời gian / bằng chứng |
| --- | --- | --- |
| Type checking | PASS | 47 giây |
| ESLint and formatting | PASS | 49 giây; ngoại lệ nguồn thiết kế theo ADR-0031 |
| Unit tests | PASS | 63 suites / 294 tests, Jest 45.134 giây, tự thoát; toàn job 1 phút 23 giây |
| E2E Android | PASS | 13/13 flow, 0 lỗi/skipped, không retry; suite 1272.090 giây, toàn job 42 phút 31 giây |
| Build Android | PASS | Codegen → Release APK → AAB → kiểm tra output/upload; 25 phút 26 giây |
| Build iOS Simulator | PASS | Release Simulator không ký mã; 10 phút 51 giây |

E2E audit có 26 request khởi tạo phiên khách, không có request nghiệp vụ ngoài fixture. `course-class-scroll` đã đạt trong 63.835 giây sau sửa dùng nút mở khoá học và xác nhận sheet hiện trước khi cuộn. Toàn bộ assertions chức năng cũ được giữ. Lần pass trước và lỗi thao tác trung gian vẫn được ghi riêng trong nhật ký.

## Sản phẩm đã tải và kiểm tra

Tải từ mục Artifacts của run; retention 7 ngày. Không đưa binary hoặc raw log vào repository.

| Artifact | ID | Kiểm tra thực tế |
| --- | --- | --- |
| android-release-ci-debug-signed-39700197090-1 | 12395198712 | APK 79,988,038 byte; AAB 52,175,660 byte; SHA-256 đều khớp; manifest/dex có trong cả hai gói |
| ios-simulator-release-39700197090-1 | 12394901712 | Archive 15,062,247 byte, SHA-256 khớp; có Info.plist và executable 34,582,904 byte; đúng iPhoneSimulator / SDK iphonesimulator18.5 |
| unit-tests-39700197090-1 | 12392187974 | Coverage và log 63 suites / 294 tests đạt |
| e2e-android-39700197090-1 | 12393459024 | JUnit 13/13, ảnh/log và audit fixture |
| android-build-logs-39700197090-1 | 12395885542 | Log Codegen, APK/AAB, toolchain và dung lượng runner |
| ios-build-logs-39700197090-1 | 12394513487 | Log build/Pods cùng phiên bản và lockfile giải thực tế trên runner |

APK có đủ `armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`; Android SDK apksigner xác minh chữ ký thành công, DN `CN=Android Debug, O=Android, C=US`. Đây là bản CI ký debug, chưa phải gói phát hành Play Store. iOS là Simulator không ký mã, chưa chứng minh IPA/archive thiết bị hoặc App Store.

Snapshot và kiểm tra sản phẩm: [jobs](evidence/hosted-6a887c5/jobs.json), [artifact inventory](evidence/hosted-6a887c5/artifacts.json), [E2E report](evidence/hosted-6a887c5/report.xml), [E2E verification](evidence/hosted-6a887c5/e2e-verification.json), [product verification/checksums](evidence/hosted-6a887c5/products-verification.json).

## Kiểm tra lỗi và dọn dẹp

- [Quality negative](evidence/quality-negative-jobs.json): type/lint/Jest lỗi đúng, job sau bị chặn; probe đã hoàn tác.
- [E2E negative](evidence/e2e-negative-jobs.json) và [JUnit](evidence/e2e-negative-report.xml): testID cố ý sai làm thất bại và chặn Release. Run này còn hai lỗi thao tác của baseline cũ, không được mô tả là chỉ có một lỗi. PR #3 đã đóng và probe được hoàn tác.
- [Native negative](evidence/native-negative-jobs.json): lệnh Android/iOS sai trả failure, bước đóng gói skipped. Các ca thiếu/rỗng output của helper cũng đã fail đúng, theo nhật ký.
- Actionlint 1.7.7, ShellCheck 0.10.0, bash syntax, YAML/inventory/thứ tự 13 flow và kiểm tra giữ assertions đã đạt. Bản bàn giao không có probe cố ý sai.
- Đã dừng emulator/Metro do lượt kiểm tra local tạo; giữ raw log và sản phẩm tải ở TEMP để tra cứu. Chỉ commit tài liệu/ảnh/report/tóm tắt trong phạm vi Phase 4. Thay đổi Phase 3, .gitignore và việc xoá api-health.yaml có sẵn của owner được giữ ngoài commit Phase 4.

## Giới hạn và bước còn lại

- Thanh toán `cart-checkout-qr` vẫn `payment-pending`, loại khỏi CI theo yêu cầu owner; chưa được nghiệm thu. API thật không được chứng minh bởi preview fixture.
- Pull request tới dev đã được kiểm chứng. Push dev/workflow_dispatch chưa chạy vì workflow chưa có trên dev/default main. Bộ lọc push main và PR tới nhánh khác dev đã kiểm tra YAML, chưa thực hiện sự kiện thật. Không tự merge/đổi nhánh mặc định hoặc branch protection để tạo bằng chứng; kiểm tra tiếp khi owner đưa workflow lên nhánh phù hợp.
- Gemfile.lock/Podfile.lock chưa track theo phạm vi đã chốt; dependency Ruby/Pods chưa tái lập tuyệt đối. Toolchain và cách chạy lại tại [guide CI](../../guides/ci.md).
- Phần còn lại: owner thực hiện [UAT 4.99](../../IMPLEMENT/PHASE_04_GITHUB_ACTIONS/PHASE_04_99_User_Acceptance.md); kết quả ghi thêm vào [nhật ký cấp phase](README.md). CI xanh không tự chuyển phase sang Done.
