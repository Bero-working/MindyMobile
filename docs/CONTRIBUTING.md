# Đóng góp code

Hướng dẫn chạy app, chạy test, thứ tự làm một tính năng theo TDD và Definition of Done. Ai viết code trong repo đều
cần đọc. Quy trình phase (IMPLEMENT/PROGRESS, nghiệm thu) nằm trong [docs/README.md](README.md#quy-trình-làm-việc).

Tham khảo thêm từ boilerplate: https://sohantalukder.github.io/react-native-boilerplate/docs/development/ và
https://sohantalukder.github.io/react-native-boilerplate/docs/configuration/ (đường dẫn thư mục theo
[bảng đối chiếu](ARCHITECTURE.md#đối-chiếu-tên-với-boilerplate)).

## Lệnh

GitHub Actions, toolchain, cách chạy lại và tải artifact: [hướng dẫn CI](guides/ci.md).

```bash
npm install
npm start                       # Metro
npm run android                 # hoặc npm run ios (cần macOS)
npm test                        # Jest
npx jest src/modules/catalog    # Chạy test của một module
npm run test:report             # Coverage
npm run test:e2e                # Maestro (sau khi Phase 0.10 thêm script)
npm run lint:rules              # ESLint
npm run lint:code-format        # Prettier
npm run lint:type-check         # tsc
```

`npm run lint` và `lint:fix` gọi các script con bằng npm; không cần yarn.

## Chạy máy ảo và Dev Menu

- **Android Emulator**: tạo AVD trong Android Studio, mở emulator rồi `npm run android`. Trong emulator, `localhost`
  của máy host là `10.0.2.2`. `src/config/env.ts` tự đổi khi `APP_ENV=development`. Thiết bị thật cắm USB thì chạy
  `adb reverse tcp:8081 tcp:8081`.
- **iOS Simulator**: chỉ trên macOS. Chạy `npm run pod-install` trước lần đầu, sau đó `npm run ios`.
- **Dev Menu**: ở chế độ development, lắc thiết bị hoặc bấm:
  - iOS Simulator: `Cmd + D`
  - Android Emulator: `Cmd + M` (Mac) hoặc `Ctrl + M` (Windows/Linux)
- Reload nhanh: bấm `R` hai lần trên Android, `Cmd + R` trên iOS. Fast Refresh bật mặc định và giữ state component
  khi sửa code.
- Đổi file `.env` / `.env.production` phải build lại native. Reload Metro không đủ.
- Bật `global.css` hoặc sửa `tailwind.config.js` mà style không ăn: chạy `npm start -- --reset-cache`.

## Các bước trong từng phase

Theo [ADR-0029](adr/ADR-0029-local-ui-base-codex-spec-implementation.md), Codex mặc định đặc tả trong
`docs/IMPLEMENT/<phase>/` và có thể triển khai; Claude có thể đặc tả khi owner yêu cầu. Bộ file
`assets/Student Home Page Design/` là UI base có thể thay đổi theo yêu cầu owner. Đặc tả ghi rõ nguồn và
thay đổi so với base trước khi sửa UI; owner sẽ giao Claude khi cần thiết kế hoặc truy cập Claude Design.

Theo [ADR-0021](adr/ADR-0021-per-phase-ui-approval-api-uat.md): **thiết kế và triển khai UI → owner xác nhận UI → gắn API của cùng phase → owner UAT**.
TDD dưới đây áp dụng trong bước đang làm, không cho phép tự vượt mốc xác nhận UI. UI dùng fixture/callback riêng;
chỉ bắt đầu service/query/mutation nghiệp vụ thật sau khi owner xác nhận UI. Chỉ chuyển phase Done sau UAT đạt.

## Thứ tự làm một tính năng (TDD)

Bắt buộc theo [ADR-0008](adr/ADR-0008-tdd.md).

1. Đọc file domain tương ứng trong [API_CONTRACT/](API_CONTRACT/README.md). Ghi chú route, body, mã lỗi, rule polling.
2. Viết type trong `types/` ([guides/typescript.md](guides/typescript.md)).
3. **Red**: viết MSW handler và test cho service. Chạy, test phải fail.
4. **Green**: viết service cho test pass.
5. Lặp red → green cho hook query/mutation, rồi controller, rồi component/màn hình.
6. **Refactor** khi test đang xanh.
7. Viết Maestro flow cho luồng chính của màn hình.
8. Chạy đủ checklist ở [Definition of Done](#definition-of-done).

Không viết code production trước khi có test fail cho nó. Sửa bug cũng vậy: viết test tái hiện bug trước.

Cách viết test: [guides/testing.md](guides/testing.md).

## Chạy flow nền tảng Phase 0

Cài [Maestro CLI từ bản phát hành chính thức](https://github.com/mobile-dev-inc/Maestro/releases), thêm thư mục
`bin` vào PATH và kiểm tra `maestro --version`. Cần Java theo yêu cầu của bản CLI được chọn, Android SDK và emulator
đang chạy. Nếu môi trường Windows không chạy được launcher của bản CLI, dùng môi trường được upstream hỗ trợ;
không coi unit test là kết quả E2E.

Build và cài app debug (`npm run android`), để Metro chạy (`npm start`), sau đó:

```bash
npm run test:e2e
```

Các flow mặc định `APP_ID` là `com.mindymobile`, nên lệnh trên không cần truyền tham số. Có thể ghi đè bằng
`npm run test:e2e -- -e APP_ID=<package-hoặc-bundle-id>`; tham số được ưu tiên. Flow `e2e/flows/app-launch.yaml`
mở app và kiểm tra `app-root`. Trên macOS, truyền bundle id
iOS thực tế thay vì Android applicationId; kiểm tra `PRODUCT_BUNDLE_IDENTIFIER` trong Xcode project. Flow không gọi
API nghiệp vụ và không chứa thông tin tài khoản.

`APP_ORIGIN` trong `.env` và `.env.production` phải được backend xác nhận có trong `CORS_ORIGINS`. Giá trị chưa được
xác nhận để trống; mutation cần Origin sẽ báo `APP_ORIGIN_REQUIRED`, không gửi origin suy đoán.

CLI đã nâng lên major 19 theo [ADR-0016](adr/ADR-0016-react-native-cli-compatibility.md), khắc phục việc CLI15 bỏ sót `BaseReactPackage`.
UUID v11 + polyfill v1.11 đã triển khai theo [ADR-0015](adr/ADR-0015-idempotency-key-uuid.md). Polyfill v2 yêu cầu RN >=0.81 nên không dùng.
Maestro CLI 2.11.0 trong phiên này nằm tại `%USERPROFILE%/.maestro/cli-2.11.0/maestro/bin`; thêm đường dẫn đó vào PATH cho terminal chạy E2E.

Emulator API37 nên có ít nhất 4 GB RAM khi chạy Maestro. Lần chạy lại với AVD 2 GB,
Android lowmemorykiller đã đóng driver và CLI báo startup timeout; khởi động emulator
với `-memory 4096` cho lần kiểm tra (không cần đổi file cấu hình AVD).

Trên máy Windows hiện tại, dùng JDK 21 đi kèm Android Studio cho Gradle (Java mặc định của máy là 25):

```powershell
$env:JAVA_HOME = 'C:/Program Files/Android/Android Studio/jbr'
$env:ANDROID_HOME = "$env:LOCALAPPDATA/Android/Sdk"
$env:PATH = "$env:USERPROFILE/.maestro/cli-2.11.0/maestro/bin;$env:PATH"
# Build debug cho Android Emulator x86_64:
cd android
./gradlew.bat assembleDebug -PreactNativeArchitectures=x86_64 --max-workers=2
cd ..
# Sau khi cài APK và để Metro chạy:
npm run test:e2e
```

## Definition of Done

Trước khi merge PR, bắt buộc chờ đủ sáu job CI của bản PR mới nhất hoàn tất thành công theo [ADR-0032](adr/ADR-0032-require-successful-ci-before-merge.md) và [quy trình B.10](README.md#b10-điều-kiện-bắt-buộc-trước-khi-merge). Test local, CI commit cũ và xác nhận UAT không thay điều kiện này. Còn pending/chạy/thiếu kết quả hoặc job bắt buộc chưa success thì giữ PR chưa merge; không bypass dù GitHub vẫn cho phép thao tác.

AI có thể bàn giao URL PR/run, head SHA và trạng thái CI rồi kết thúc lượt; owner có thể stop AI trong khi CI trên GitHub tiếp tục chạy. Owner gửi bằng chứng nếu CI thất bại để AI xử lý, hoặc tự merge khi CI thành công và đủ các điều kiện khác. AI không phải chờ CI, không tự merge/bật auto-merge trong quy trình này. Bản sửa được push sau đó phải bàn giao CI mới tương tự.

- [ ] Test viết trước code, tất cả xanh (`npm test`).
- [ ] Có Maestro flow cho luồng chính (màn hình mới hoặc luồng thay đổi).
- [ ] `npm run lint:rules`, `npm run lint:code-format`, `npm run lint:type-check` không lỗi.
- [ ] Không có `any`, `unknown`, `@ts-ignore`, `eslint-disable` mới (ngoại lệ ghi ở
      [guides/logging.md](guides/logging.md)).
- [ ] Text hiển thị đi qua `t(...)`, có key cho tất cả ngôn ngữ đang hỗ trợ.
- [ ] Màn hình có đủ 4 trạng thái: loading, empty, error, success ([guides/ux.md](guides/ux.md#trạng-thái-màn-hình)).
- [ ] Chạy thử trên Android Emulator (và iOS Simulator nếu có máy Mac).
