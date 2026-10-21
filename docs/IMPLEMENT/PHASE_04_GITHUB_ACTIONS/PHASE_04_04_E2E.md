# 4.4 E2E Android

## Mô tả

Tự động chạy Maestro trên Android Emulator với bản debug có preview, lưu bằng chứng khi lỗi. Bước hạ tầng, không thiết kế UI hoặc tích hợp API mới. Trạng thái **In progress**, sau 4.3; job runtime chờ typecheck, eslint và unit-tests đạt.

## Task

### 4.4.1 Phân loại flow

- Rà 15 file hiện có trong e2e/flows. Gắn tag ci cho 14 flow smoke/preview: app-launch, auth-ui-login, auth-ui-register, student-home-ui, courses-browse, course-class-scroll, cart-checkout-qr, carousel-autoplay, student-schedule, student-account, my-classes-detail, my-classes-folders, student-learning-responsive, session-detail-footer.
- api-health.yaml gắn tag backend; các flow e2e/api và e2e/backend giữ ngoài job PR mặc định. Các flow preview vẫn đi qua bootstrap của app: GET /auth/me và refresh khi 401. Dùng fixture HTTP cục bộ trả lỗi khách theo auth.md và README contract, không tạo phiên; audit fail khi có API ngoài hai route bootstrap. Không flow tag ci nào cần tài khoản/backend thật. Nếu phát hiện phụ thuộc thì sửa phân loại/đặc tả và ghi rõ, không ngầm bỏ flow để báo đủ 14.
- Lệnh dự kiến: npm run test:e2e -- --include-tags ci. Kiểm tra CLI nhận tham số, phát hiện đủ flow và không có 0 test. Tag không thay assertions hoặc cơ chế preview.
- Kiểm chứng trước: liệt kê flow mặc định có api-health cần server; sau phân loại, bộ ci không gọi api-health và vẫn đủ hành trình UI đã liệt kê.

### 4.4.2 Chuẩn bị native và emulator

- Runner Ubuntu 24.04 có KVM; JDK 17; SDK/Build Tools 35, NDK 27.1.12297006 theo Gradle hiện tại. Chốt image emulator x86_64 API 35, profile pixel_7 và wm size1080×2400/density420 (cùng viewport14flow local Pixel8) và bản Maestro 2.11.0 sau khi xác nhận upstream/khả năng chạy. Pin action emulator theo SHA; lưu version/ABI thực tế.
- Trên runner GitHub-hosted Linux tạm, giải phóng toolchain .NET/Swift/GHC/Boost/CodeQL không dùng và gỡ NDK khác qua sdkmanager; giữ NDK27.1.12297006. Guard không cho bước dọn hệ thống chạy ngoài runner tạm; ghi df và log trước/sau để đủ chỗ cho APK + system image.
- Tạo .env.ci với APP_ENV=development, APP_ORIGIN trống, DEBUG_MODE=false và API_URL=http://127.0.0.1:7777/api/v1 dành riêng fixture bootstrap cục bộ; ENVFILE phải được chọn trước khi build. Không đưa tài khoản/secret vào source hoặc log.
- Tạo debug keystore tạm ở ~/.android/debug.keystore với alias/password debug chuẩn để Gradle dùng config hiện tại; không sửa android/**.
- Cấp quyền chạy gradlew trong runner; assembleDebug với -PreactNativeArchitectures=x86_64 --max-workers=2. Cài APK vào emulator, APP_ID=com.mindymobile.
- Khởi động preview-api.py trên loopback port 7777, chờ health tối đa 30 giây; chỉ whitelist GET /auth/me và POST /auth/refresh với 401 theo contract. Giữ chuỗi bootstrap/refresh theo contract; ghi audit method/path/status, không headers/body/query. Reset/dừng fixture trong cleanup.
- Chạy Metro nền với log riêng, chờ endpoint /status báo sẵn sàng và adb wait-for-device/boot hoàn tất trước khi chạy Maestro; adb reverse tcp:8081 tcp:8081. Sau /status, tải debug index.bundle với query Android/RN và timeout300giây trước Maestro để hoàn tất cold bundle. Giữ Metro suốt lượt test và dừng bằng cleanup/trap.
- Cho emulator ít nhất 4 GB RAM khi runner đáp ứng; ghi cấu hình tài nguyên. Giữ window/transition/animator animation scale ở 1.0 trước khi mở app và ghi emulator-animation.log: Reanimated 3 đọc TRANSITION_ANIMATION_SCALE=0 thành Reduced Motion, phát cảnh báo LogBox che nút trong bản debug. Không tắt/cất cảnh báo trong app hoặc sửa assertions để né lỗi. Kiểm tra font scale/kích thước được flow responsive đặt hoặc reset, không để flow làm ảnh hưởng ca sau.
- Nếu cần sửa native/Metro/config khoá để chạy được, tách ADR riêng; không ép tắt Hermes/New Architecture để né lỗi.

### 4.4.3 Chạy và xuất bằng chứng

- Job ID e2e-android, tên E2E Android; timeout 45 phút, timeout sẵn sàng riêng cho emulator/Metro. Readiness lỗi phải fail rõ bước, không retry vô hạn.
- Chạy suite tag ci và báo số flow passed/failed, xuất báo cáo bằng option đã đối chiếu với CLI được pin. Không coi unit test hay build APK là kết quả E2E.
- Upload báo cáo, screenshot, Maestro log và Metro/logcat cần thiết cả khi lỗi; lọc dữ liệu nhạy cảm và không upload .env/keystore. Retention 7 ngày.
- Red → Green: đổi tạm một testID thành phần tử không tồn tại; xác nhận job fail và giữ artifact chẩn đoán, hoàn tác rồi suite đầy đủ đạt. Không retry assertion lỗi để che flake.
- Ghi rõ đây là E2E smoke/preview trên app native; không chứng minh auth, thanh toán hay quyền truy cập từ backend thật.

## Tiêu chí nghiệm thu

- [ ] Clean runner build/cài/mở app debug, Metro và emulator sẵn sàng.
- [ ] Toàn bộ 14 flow đã phân loại chạy đạt; api-health không nằm trong bộ PR bắt buộc.
- [ ] Không dùng backend production/tài khoản thật; không bỏ assertions hoặc sửa app để luôn pass.
- [ ] TestID sai làm job fail; có báo cáo/log/screenshot và cleanup khi lỗi.
- [ ] Build cuối bị chặn nếu E2E lỗi; PROGRESS ghi số flow/revision/toolchain và giới hạn backend.
