# ADR-0023: Sắp xếp ADR trùng số khi merge theo ngày giờ tạo

- Status: Accepted
- Date: 2026-10-17
- Created at: 2026-10-17T22:40:25+07:00
- Author: Codex (soạn theo yêu cầu của owner)
- Approved by: @Bero, chỉ đạo trực tiếp trong chat ngày 2026-10-17: “Thêm ADR tiếp theo: Khi merge code, nếu conflict trùng ADR thì xem xét ngày, giờ để sắp xếp các file ADR tương đương”.

## Context

Các nhánh làm việc song song có thể cùng chọn số ADR tiếp theo. Khi merge, hai quyết định khác nhau có thể
trùng số, thậm chí trùng tên file. Cần giữ đủ nội dung và sắp xếp các ADR bị trùng theo ngày giờ tạo.

## Decision

1. Khi merge gặp ADR trùng số hoặc tên file, đối chiếu nội dung của cả hai nhánh trước khi giải quyết conflict.
   Hai bản của cùng một quyết định được hợp nhất; hai quyết định khác nhau phải giữ thành hai file riêng.
2. Với các quyết định khác nhau bị trùng số, so sánh ngày **và giờ tạo**: ADR tạo trước xếp trước, ADR tạo sau
   nhận số tiếp theo chưa dùng. Chỉ đánh lại số các ADR bị trùng và các ADR mới trong đợt merge nếu cần;
   không đánh lại số toàn bộ ADR đã có trên nhánh đích.
3. ADR mới ghi thêm `Created at` theo ISO 8601 có múi giờ, ví dụ `2026-10-17T22:40:25+07:00`, bên cạnh
   `Date`. So sánh theo cùng một múi giờ; không dùng giờ sửa file trên máy hoặc giờ merge làm giờ tạo.
4. ADR cũ chưa có giờ tạo thì đối chiếu `Date` và thời điểm commit đầu tiên thêm file trên nhánh gốc.
   Nếu vẫn không xác định được thứ tự hoặc thời điểm bằng nhau, người xử lý merge thống nhất thứ tự với
   tác giả/owner và ghi rõ căn cứ trong mô tả merge/PR; không tự bịa timestamp.
5. Khi đổi số, cập nhật đồng bộ tên file, tiêu đề, mục lục ADR và mọi tham chiếu tới quyết định đó trong repo,
   kể cả `Superseded by`. Với tham chiếu đang trùng số, đối chiếu ngữ cảnh để trỏ đúng quyết định;
   không thay số hàng loạt chỉ dựa trên chuỗi ký tự.
6. Việc sắp xếp hoặc đổi số không thay nội dung quyết định, trạng thái hay quyền phê duyệt. ADR có số lớn hơn
   không tự thay thế ADR khác; quan hệ thay thế vẫn phải ghi rõ theo quy ước hiện có.

## Alternatives

- Giữ một phía của conflict và bỏ phía còn lại: có thể làm mất một quyết định độc lập.
- Chỉ so sánh ngày: không phân biệt được các ADR tạo trong cùng ngày.
- Dùng giờ sửa file hoặc giờ merge: không phản ánh thời điểm tạo quyết định trên nhánh gốc.

## Consequences

- Giữ được các quyết định khi nhiều nhánh cùng tạo ADR và có căn cứ để sắp xếp các file trùng số.
- Người xử lý merge phải kiểm tra liên kết và tham chiếu sau khi đánh lại số.
- ADR cũ thiếu timestamp có thể cần xác nhận thứ tự từ tác giả/owner.
