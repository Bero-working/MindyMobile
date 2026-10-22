# 1.5 Điều hướng và kiểm thử luồng UI

## Mô tả

Ghép các màn đã hoàn thành vào luồng UI có thể kiểm tra trên thiết bị. Phải giải quyết các phụ thuộc Phase 0,
component nền tảng và quyền sửa navigator trong [README](README.md#phụ-thuộc-và-điều-kiện-triển-khai) trước.

## API / dữ liệu

Không thêm service trong task UI. Tích hợp auth thật trong cùng Phase1 theo [1.6](PHASE_01_06_API_INTEGRATION.md), sau owner duyệt UI và giải quyết ngoại lệ Foundation: bootstrap dùng `GET auth/me`, 401 cuối
cùng về Login, đăng nhập điều hướng theo `user.role`, register 202 không tạo phiên. Tái sử dụng HTTP refresh
single-flight của Foundation; không nhân đôi cơ chế refresh trong màn hình.

## Task

### 1.5.1 Hợp đồng callback và luồng điều hướng

- Module dự kiến: `src/modules/auth/` cho Welcome/Login/Register; `src/modules/home/` cho Student Home.
- Screen chỉ render; controller giữ validation/action/state. Preview nhận adapter/fixture riêng, không thêm
  nhánh bypass auth vào production hoặc lưu password vào route params/store/log.
- Luồng: Welcome → Login ↔ Register; Register 202 → Check email → Login. Login success của **STUDENT** mới có
  thể về Student Home khi tầng tích hợp cung cấp phiên thật. Staff giữ callback đích theo role; không ép về Home.
- Sau khi có ADR hợp lệ, cập nhật đủ routes enum, param list, module exports và Stack.Screen theo kiến trúc.
- Reset stack khi hết phiên/đăng nhập thành công để Back không mở lại màn cũ; liên kết hết phiên thật thuộc phạm
  vi Foundation/auth integration, cần test riêng, không coi callback fixture là bằng chứng cookie.
- Test cần viết trước: route callback, register không tới Home, không gửi password trong params, role staff không
  rơi vào Student Home; stack reset khi adapter phát sự kiện tương ứng.
- testID/i18n: tái sử dụng ID/key của 1.2–1.4.

### 1.5.2 Kiểm thử UI trên thiết bị

- RNTL: form boundary, submit lặp, lỗi từng trạng thái, callback navigation và render Home với fixture xác định.
- Nếu adapter tương lai thực sự dùng HTTP, thêm MSW handler theo contract; không viết MSW giả khi chỉ test callback.
- Maestro dự kiến: `auth-ui-login.yaml`, `auth-ui-register.yaml`, `student-home-ui.yaml`.
- Nêu rõ cách mở preview, fixture, build và reset trạng thái trong PROGRESS trước khi chạy Maestro. Không thêm
  công tắc preview có thể bật trong release; thay đổi hạ tầng/build nếu cần phải được duyệt đúng quy trình.
- Chụp ảnh Welcome/Login/Register/Check email/Home và loading/empty/error; so với Claude ở cùng viewport nội dung.
- Kiểm tra Android Back, bàn phím, safe area, màn nhỏ, cỡ chữ hệ thống lớn và Reduce Motion; iOS nếu có macOS.

## Dọn dẹp và Kiểm tra

- Chỉ dọn file thuộc phase theo quy trình repo; giữ mọi thay đổi đang có của người dùng ngoài phạm vi.
- Chạy `npm run lint:rules`, `npm run lint:code-format`, `npm run lint:type-check`, `npm test`, `npm run test:e2e`.
- Ghi lệnh/kết quả, ảnh, môi trường, fixture và phần chưa kiểm tra vào PROGRESS; đủ điều kiện mới chuyển `In review`.

## Tiêu chí nghiệm thu

- [ ] Ba màn và Welcome/Check email có luồng preview kiểm tra được, không có production auth bypass.
- [ ] Không claim backend/auth end-to-end từ test UI; kết quả UAT tách rõ giới hạn này.
- [ ] Kiểm thử/ảnh đối chiếu đầy đủ, không có nút chết hoặc route chưa đăng ký.
