# 4.5 Build Android và iOS

## Mô tả

Thêm hai job build riêng cho Android Release APK/AAB và iOS Simulator Release không ký mã. Bước hạ tầng; UI/API mới không áp dụng. Trạng thái **In progress**, sau 4.4. Cả hai job needs typecheck, eslint, unit-tests và e2e-android; không dùng bản debug trong E2E thay kết quả build Release.

## Task

### 4.5.1 Build Android

- Job ID build-android, tên Build Android; Ubuntu/JDK/SDK/NDK khớp 4.4, Node/npm ci theo 4.1; timeout 45 phút. Dùng Gradle wrapper của repo, cache Gradle hợp với wrapper/build files.
- Tạo .env.ci theo cấu hình Release trong README phase, ENVFILE trỏ đường dẫn tuyệt đối. API_URL phải có giá trị, APP_ENV=production, DEBUG_MODE=false; không đặt APP_ENV=development để né validation.
- Tạo debug keystore tạm như 4.4 vì debug.keystore không track và release hiện tái sử dụng debug signing. Không lấy khoá production; không đổi signingConfig hoặc Gradle.
- Chạy npm run build:android và npm run build:android:bundle, không gọi build-release.sh vì còn menu tương tác, yarn và giả định đường dẫn App cũ. Giữ danh sách ABI hiện có cho bản Release.
- Kiểm tra file android/app/build/outputs/apk/release/app-release.apk và android/app/build/outputs/bundle/release/app-release.aab tồn tại, kích thước >0; upload artifact riêng với SHA-256, revision/run và log build khi lỗi.
- Artifact ghi rõ CI/debug signing, không phải gói phát hành lên Play Store.
- Kiểm chứng âm: gây lỗi build có kiểm soát trên nhánh kiểm tra; xác nhận job fail và không có thông báo build đạt/artifact thành công giả. Hoàn tác và build APK/AAB đạt.

### 4.5.2 Build iOS Simulator

- Job ID build-ios, tên Build iOS Simulator; runner macOS/Xcode cố định được xác minh với RN 0.80, Node/npm ci theo 4.1; timeout 60 phút.
- Cài Ruby/Bundler theo Gemfile và bundle exec pod install trong ios/; không yêu cầu workspace đã có trong checkout. Ghi phiên bản Ruby/Bundler/Pods và dependency giải quyết thực tế vì repo chưa track Gemfile.lock/Podfile.lock; không sửa chúng hoặc Podfile để né lỗi trong phase này.
- Dùng ENVFILE=.env.ci dạng đường dẫn tuyệt đối và env Release như Android. Không dùng file .xcode.env.local từ máy dev; thiết lập Node binary cho runner nếu cần qua môi trường được RN hỗ trợ.
- Chạy xcodebuild với workspace ios/MindyMobile.xcworkspace, scheme MindyMobile, configuration Release, sdk iphonesimulator, destination generic/platform=iOS Simulator, derivedDataPath rõ ràng và CODE_SIGNING_ALLOWED=NO.
- Không dùng nguyên npm run build:ios vì script hiện archive thiết bị generic/platform=iOS. Không cần Apple certificate, provisioning profile hoặc developer team cho mục tiêu Simulator.
- Kiểm tra Products/Release-iphonesimulator/MindyMobile.app trong derivedDataPath, nén rồi upload với checksum/revision; log khi lỗi. Không gọi kết quả này là IPA/archive thiết bị.
- Nếu Gemfile/Podfile/native config hiện có không build được, ghi lỗi và tạo ADR riêng trước thay đổi file khoá; không bỏ job iOS hoặc continue-on-error để đóng phase.

### 4.5.3 Hoàn thiện hướng dẫn và bàn giao

- Ghi hướng dẫn chạy lại, tải artifact, phân biệt debug E2E/Release CI/Simulator, giới hạn signing và backend trong CONTRIBUTING hoặc guide CI được liên kết từ đó.
- Ghi sơ đồ needs thực tế, job names, variables, cache, timeout, retention và runtime/action versions. Chỉ hướng dẫn required checks theo tên ổn định; không tự đổi settings branch protection.
- Kiểm tra pipeline cùng revision có đủ 5 nhóm, không thêm Expo Doctor hoặc Image Optimization; tổng hợp bằng chứng cho 4.99.

## Tiêu chí nghiệm thu

- [ ] Hai job chỉ chạy sau quality checks và E2E đạt, cùng revision.
- [ ] APK và AAB Release tồn tại, upload được, signing debug được công khai đúng mục đích CI.
- [ ] iOS Simulator Release build đạt trên macOS, có .app artifact, không yêu cầu signing production.
- [ ] Build lỗi/thiếu output không được báo thành công; log và checksum đủ tra cứu.
- [ ] Không thay native/package/Gemfile/lock policy ngoài phạm vi; lỗi hạ tầng phát sinh có ADR riêng.
- [ ] Guide vận hành và PROGRESS đủ cho owner thực hiện UAT.
