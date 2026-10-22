# ADR-0028: Giữ mã lỗi API khi details có cấu trúc ngoài contract

- Status: Accepted
- Date: 2026-10-18
- Author: @Bero (Codex hỗ trợ soạn thảo)
- Approved by: @Bero trong chat ngày2026-10-18: “Duyệt ADR-28”.

## Context

Owner yêu cầu kiểm tra add-to-cart sau khi app hiện lỗi chung. Backend thật trả POST /me/cart/items HTTP409,
code CLASS_ALREADY_ENROLLED, message “You already hold a seat or are enrolled in this class”, requestId và
details là mảng object {classId}. GET giỏ trước/sau đều rỗng. Bằng chứng không có credential:
[add-cart-investigation.json](../PROGRESS/PHASE_02_COURSE_CHECKOUT/evidence/add-cart-investigation.json).

Contract chỉ mô tả details dạng chuỗi/mảng chuỗi. HTTP hiện parse cả envelope bằng một schema strict về kiểu
details; một optional field khác dạng làm mất cả code và requestId hợp lệ, chuyển thành HTTP_ERROR.
Điều này ngăn lớp UI dùng bản dịch CLASS_ALREADY_ENROLLED đang có.

## Decision

- Chỉ mở khoá src/config/http/http.config.ts và test tương ứng để optional details không đúng dạng được bỏ qua;
  vẫn xác thực statusCode/code/message và requestId như cũ, giữ details chuỗi/mảng chuỗi hợp lệ.
- Không mở rộng kiểu ApiError, không hiển thị raw object/message backend, không đổi retry/cookie/refresh/Origin.
- Cập nhật bản dịch CLASS_ALREADY_ENROLLED thành “Bạn đã đăng ký hoặc đang được giữ chỗ ở lớp này.” và bản Anh
  tương đương để bao phủ cả seat hold và enrollment.
- Test hồi quy:409 có details object vẫn giữ CLASS_ALREADY_ENROLLED/status/requestId; details hợp lệ vẫn giữ;
  envelope thiếu code/message vẫn về HTTP_ERROR. Hook phải hiện thông báo nghiệp vụ, không mở giỏ khi POST bị từ chối.
- Sau Accepted: cập nhật docs/ARCHITECTURE.md cùng thay đổi, áp dụng patch và chạy test HTTP/cart/selection;
  native dùng lớp bị chặn xác nhận thông báo đúng, không checkout mới hay huỷ order hiện có.

Patch dự kiến cho dòng hạ tầng: [ADR-0028-http-error-details.patch](proposals/ADR-0028-http-error-details.patch).
Owner đã duyệt; phạm vi mở khoá được ghi tại docs/ARCHITECTURE.md theo docs/README.md §B.8.

## Alternatives

- Bắt mọi HTTP409 thành đã đăng ký: sai vì409 còn CLASS_FULL/CART_LIMIT_EXCEEDED và các lỗi khác.
- Đọc message tiếng Anh để suy ra code: trái contract, không dùng.
- Tự bỏ chỗ giữ/huỷ order để thêm lại: ngoài phạm vi yêu cầu của owner và không xử lý lỗi parser.

## Consequences

App báo đúng lý do server từ chối, không biến lỗi nghiệp vụ hợp lệ thành lỗi chung vì metadata optional.
API vẫn từ chối lớp đã có chỗ/đăng ký; ADR không thay nghiệp vụ backend hay tự cho phép thêm lớp đó.
