# Dọn UI demo sau hoàn tất

Ngày: 2026-11-19 (Asia/Bangkok). Thực hiện: Codex.

## Yêu cầu owner

“tất cả đã hoàn thành, bây giờ làm sạch lại, bỏ tất cả phần UI demo, chạy full test”.

## Thay đổi

- Gỡ toàn bộ module `src/modules/preview`, module Example của boilerplate và splash mẫu cũ.
- Gỡ route, param type, barrel export và nút mở preview trên Welcome ở cả development/release.
- Giữ `SessionSplash` đang phục vụ khôi phục phiên và toàn bộ luồng ứng dụng dùng API thật.
- Gỡ bản dịch chỉ dành cho gallery demo và Example ở cả tiếng Việt/Anh.
- Chuyển fixture còn dùng bởi test màn lịch/lớp sang `tests/fixtures/learningUi.ts`; fixture không còn phụ thuộc bản dịch demo.
- Gỡ test chỉ kiểm tra màn demo; giữ test component, hook, API adapter và production integration.
- Gỡ Maestro flow dựa vào gallery/dữ liệu giả. Viết lại hai flow auth chạy trên màn thật, kiểm tra navigation và lỗi form trống mà không gửi đăng ký/thanh toán.
- Cập nhật `e2e/config-ci.yaml`, hướng dẫn E2E, README và ghi chú kiến trúc hiện tại. Giữ nhật ký/spec lịch sử.
- Sửa định dạng còn lỗi ở `src/modules/home/types/home.type.ts` để full format check qua.

## Kiểm tra

- `npm run lint:type-check`: đạt.
- `npm run lint:rules`: đạt, còn 1 cảnh báo `no-script-url` có sẵn trong test URL nguy hiểm của `ClassDetailScreen.test.tsx`.
- `npm run lint:code-format`: đạt.
- `git diff --check`: đạt.
- `npm run test:e2e`: **3/3 flow đạt**, Android Emulator `emulator-5554`, 2 phút 17 giây. Artifact tại `C:/Users/admin/.maestro/tests/2026-11-19_203124/`.
- `npm test -- --runInBand --silent`: lượt cuối **86/86 suite, 459/459 test đạt**, 151,247 giây.
- Lượt Jest đầu: 85/86 suite, 458/459 test đạt; test bootstrap tài khoản staff hết thời gian chờ khi chạy đồng thời với các kiểm tra khác. Chạy riêng lại `sessionNavigation.test.tsx`: 9/9 test đạt; lượt toàn bộ sau đó đã đạt mà không tăng timeout hoặc sửa hành vi ứng dụng.

## Giới hạn

- Các flow `e2e/api/` và `e2e/backend/` cần phiên học viên/dataset/trạng thái thanh toán được chuẩn bị riêng; không thuộc lượt smoke `npm run test:e2e` và chưa chạy lại trong đợt này.
- Chưa chạy iOS trên môi trường Windows. Không thay xác nhận UAT của owner bằng kết quả test tự động.
