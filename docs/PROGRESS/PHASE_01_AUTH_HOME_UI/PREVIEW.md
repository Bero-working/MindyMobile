# Kiểm tra UI Phase 1 trên Android

## Mở bản xem thử

Máy Windows hiện tại đã lưu JDK 21 làm mặc định của Gradle trong
`C:/Users/admin/.gradle/gradle.properties` qua `org.gradle.java.home`; không cần đặt lại JAVA_HOME
mỗi lần. Đây là cấu hình cục bộ của tài khoản Windows,
áp dụng cho các dự án Gradle của tài khoản này, không được commit vào repo.

Máy ảo hiện tại chỉ còn khoảng 769 MB trống; APK đủ bốn kiến trúc có thể không đủ chỗ để
cập nhật. Khi phát triển trên thiết bị đang kết nối, dùng:

```powershell
npm run android -- --active-arch-only
```

CLI tự chọn kiến trúc của thiết bị; không thay danh sách kiến trúc của bản release.

Trên máy Windows khác, có thể đặt JDK 21 cho terminal trước khi chạy app:

```powershell
$env:JAVA_HOME = 'C:/Program Files/Android/Android Studio/jbr'
npm run android
```

Nếu build dừng ở `com.facebook.react.settings` với lỗi `25.0.3`, terminal đang dùng Java 25.
Biến `JAVA_HOME` ở cấp User có thể đã trỏ tới JDK 21, nhưng terminal hoặc ứng dụng
được mở trước khi cập nhật biến môi trường có thể chưa nhận giá trị đó. Lệnh trên áp dụng ngay
cho terminal hiện tại; mở lại ứng dụng terminal để các terminal mới nhận cấu hình User.

1. Chạy app debug với Metro (`npm start`, sau đó `npm run android` nếu cần cài app).
2. App kiểm tra `auth/me` trước khi điều hướng. Guest mở **Welcome**; Student có cookie hợp lệ mở Home thật.
   Các nút Tạo tài khoản/Đăng nhập mở form production đã nối API; chỉ dùng tài khoản test được cấp.
3. Bấm **Xem thử UI (development)** ở Welcome.
4. Chọn **Thử form Auth** hoặc **Student Home 2a**. Bộ chọn chỉ nằm ở menu. Khi mở màn, nút nổi **UI** góc dưới trái mở/thu gọn công cụ trạng thái; công cụ không chiếm chiều cao layout.
5. **Kiểm tra Foundation** mở lại màn Example với nút health và đổi ngôn ngữ đã có ở Phase 0.

Nếu style mới chưa cập nhật qua Fast Refresh, khởi động lại Metro bằng `npm start -- --reset-cache`,
đợi bundling xong rồi mở lại app. Flow chính chờ Welcome tối đa 90 giây cho lần mở khi cache trống.

Chỉ debug có route/nút preview; release không có đường mở preview, component preview cũng trả null.
Không nhập tài khoản thật vào preview; dữ liệu form chỉ đi tới callback trong bộ nhớ, không gọi API.

## Các tình huống

- Auth: kiểm tra blur/submit, bàn phím Next, hiện/ẩn mật khẩu và lỗi field đầu tiên khi cuộn tới cuối Register.
- **Mô phỏng lỗi** bật/tắt lỗi Login `INVALID_CREDENTIALS` hoặc Register/Resend `MAIL_DELIVERY_UNAVAILABLE`.
  Mở nút nổi **UI** trước khi bấm Mô phỏng lỗi, rồi thu gọn để tiếp tục nhập form. Callback preview chờ 400 ms để quan sát pending; bộ kiểm thử component kiểm tra thêm 422, 429,
  requestId, giữ dữ liệu, bấm lặp và callback sau khi unmount.
- Login hợp lệ chỉ hiện thông báo đã nhận callback theo role; không tạo phiên hoặc mở Home như một lần login thật.
- Register hợp lệ chuyển **Kiểm tra email**, luôn dùng thông báo trung lập. Resend chỉ chạy sau khi bấm.
- Home: mở nút **UI**, chọn **Thành công / Đang tải / Trống / Lỗi**, rồi thu gọn để xem vùng lịch và khoá học. Khi thay trạng thái,
  có thể cần cuộn lại tới vùng cần kiểm tra. Retry đưa fixture về thành công.
- Course và dấu `+` là hai callback riêng; lịch truyền classId/sessionId/accessMode. Các callback hiện kết quả
  trong lớp thông báo nổi phía trên; không thêm giỏ, mở meeting, chạy compiler hoặc tạo route giả cho màn chưa có.
- Vuốt hoặc chạm chấm để đổi ba slide giới thiệu/ba ghi chú; năm tab giữ Home ở giữa.
- Pull-to-refresh giữ nội dung, khoá gửi lặp; không tự chuyển carousel bằng timer.

## Nguồn và giới hạn

- Auth và Student Home **2a** theo `IMPLEMENT/PHASE_01_AUTH_HOME_UI/references/DESIGN_SOURCE.md`.
- Mascot laptop nguyên gốc 540×432 RGBA đã copy vào `src/assets/illustrations/`; hash trùng nguồn.
  Không cắt screenshot hoặc dùng mascot tự sinh. Ảnh course giữ fallback vì thiết kế chưa có ảnh thật.
- Ảnh học viên chưa đưa vào app do bản ghi nguồn còn chờ xác nhận quyền dùng; không thay bằng ảnh người khác.
  Mascot map/book dùng đúng kích thước104/76dp theo bàn giao, độ phân giải nguồn thấp nên có thể hơi mờ. Cả3 ảnh slide để trống theo D3; thay ảnh trong src/modules/home/constants/homeIntro.constant.ts (start/mentor/project), không thay code component.
- Giữ token/Nunito đã duyệt; tăng vùng bấm lên ít nhất 44×44. Course giữ ảnh 3:4 ở cỡ chữ thường;
  chữ lớn chuyển nội dung xuống dưới ảnh để tránh chồng chữ.
- Không triển khai Google, forgot password, deep link email hoặc dashboard staff. Auth/bootstrap/điều hướng phiên và
  API Home production đã được nối theo ADR-0022; preview vẫn chỉ dùng fixture, không cấp phiên production.
  Foundation/UAT 5–6 vẫn độc lập. iOS chưa chạy vì môi trường hiện tại là Windows.

## Kiểm tra API thật

Luồng `e2e/api/auth-api.yaml` nằm ngoài bộ fixture mặc định: bắt đầu trên Login production đã được nhập tài khoản test,
đóng bàn phím bằng chạm vùng trống rồi chạy:

```powershell
maestro test -e APP_ID=com.mindymobile e2e/api/auth-api.yaml
```

Không đưa credential vào YAML, biến môi trường đã lưu, route params, ảnh chụp Login hay log Maestro.
Luồng kiểm tra Home, mở lại app không xoá dữ liệu để xác nhận cookie/auth-me, logout, Back và khởi động guest.
Không tự gửi register/resend tới email thật. Kiểm tra refresh khi hết hạn cần điều kiện session/backend riêng;
Maestro fixture không chứng minh refresh native. Logout ở cuối Home production là phản hồi phiên cần cho bước API;
các tab/CTA tới màn chưa có tiếp tục disabled.

## Chạy lại kiểm tra

```powershell
npm run lint:rules
npm run lint:code-format
npm run lint:type-check
npm test -- --runInBand
npm run test:e2e -- -e APP_ID=com.mindymobile
```

Flow riêng `e2e/accessibility/phase-one-large-text.yaml` dành cho fontScale 1.3 và Reduce Motion.
Khi kiểm tra, lưu rồi khôi phục cài đặt thiết bị; báo cáo và ảnh nằm trong thư mục `evidence/`.
Kết quả cuối cùng và phần chưa kiểm tra được ghi trong [nhật ký](README.md); chỉ owner xác nhận UAT.
