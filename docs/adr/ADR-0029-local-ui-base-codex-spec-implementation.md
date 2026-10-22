# ADR-0029: Thiết kế local làm UI base, Codex đặc tả và có thể triển khai

- Status: Accepted
- Date: 2026-10-18
- Created at: 2026-10-18T21:44:24+07:00
- Author: Codex (soạn theo yêu cầu của owner)
- Approved by: @Bero, chỉ đạo trực tiếp trong chat ngày 2026-10-18: dùng file thiết kế làm UI base có thể thay đổi theo yêu cầu; Codex đặc tả, có thể triển khai; Claude đặc tả hoặc hỗ trợ thiết kế/truy cập Claude Design khi owner yêu cầu.

## Context

Repo đã có bộ thiết kế xuất từ Claude Design tại `assets/Student Home Page Design/`, gồm HTML và asset.
Owner chọn bộ file này làm nền cho UI mobile hiện tại, đồng thời muốn tiếp tục điều chỉnh thiết kế theo yêu cầu.
Quy trình cũ trong [ADR-0019](ADR-0019-claude-design-handoff-codex-ui.md) bắt buộc Claude Code lấy và đặc tả
thiết kế trước khi Codex triển khai. Owner yêu cầu Codex đảm nhiệm đặc tả và có thể triển khai dựa trên nguồn local;
Claude chỉ tham gia đặc tả hoặc thiết kế/truy cập Claude Design khi owner yêu cầu.

## Decision

### 1. Bộ thiết kế local là UI base có thể thay đổi

- Dùng [Student Home.dc.html](../../assets/Student%20Home%20Page%20Design/Student%20Home.dc.html) làm nguồn base
  cho các màn hình và tương tác được mô tả trong file; dùng [Auth.dc.html](../../assets/Student%20Home%20Page%20Design/Auth.dc.html)
  cho phần xác thực. Ảnh và asset đi kèm nằm trong `assets/` và `uploads/` của cùng thư mục thiết kế.
- Đây là bản base tham chiếu cho UI React Native hiện tại. Owner có thể yêu cầu đổi bố cục, phong cách, nội dung,
  asset, trạng thái hoặc tương tác. Không cần bản thiết kế mới từ Claude để thực hiện thay đổi đã được owner yêu cầu
  và đủ rõ để đặc tả; quyết định kỹ thuật mới vẫn tuân thủ quy trình ADR nếu thuộc diện cần ADR.
- Trước khi triển khai, đặc tả phase phải xác định file, màn hình/section/biến thể được dùng, thời điểm khảo sát,
  phần giữ theo base và phần điều chỉnh theo yêu cầu owner. Không tự lấy biến thể khác hoặc coi mọi trạng thái
  trong HTML là chức năng đã được chấp thuận triển khai.
- Khi owner yêu cầu thay đổi, cập nhật đặc tả trong IMPLEMENT trước khi sửa UI tương ứng, ghi rõ yêu cầu và
  sai khác so với base. Không bắt buộc sửa HTML gốc để phản ánh từng thay đổi của app.
- Dữ liệu mẫu, API giả, nội dung marketing và tài khoản trong prototype không trở thành contract hoặc business rule.
  Giữ thứ tự ưu tiên nguồn ở [docs/README.md](../README.md#b1-thứ-tự-ưu-tiên-khi-các-nguồn-mâu-thuẫn).
  Chuyển thiết kế sang component React Native và token/asset phù hợp, không nhúng HTML để thay màn hình native.

### 2. Codex mặc định đặc tả, có thể đảm nhiệm triển khai

- **Codex mặc định viết và cập nhật đặc tả trong `docs/IMPLEMENT/<phase>/`.** Codex có thể đọc bộ thiết kế local,
  đặc tả, triển khai, kiểm tra và ghi PROGRESS trong cùng luồng công việc được owner giao.
- **Claude có thể đảm nhiệm đặc tả nếu owner yêu cầu.** Nếu cần tạo/chỉnh thiết kế hoặc truy cập Claude Design,
  owner sẽ giao Claude thực hiện và bàn giao kết quả cần thiết vào repo. Không bắt buộc chờ Claude với phần việc
  đã có đủ nguồn local và yêu cầu rõ ràng.
- README phase ghi nguồn và phạm vi; file sub-phase ghi bố cục, kích thước/spacing/safe area, token, typography,
  ảnh/icon, nội dung/i18n, dữ liệu mẫu/thật và mapping API, loading/empty/error/success, validation, CTA/điều hướng,
  animation, accessibility/chữ lớn/Reduce Motion, sai khác native và tiêu chí nghiệm thu quan sát được.
- Tài liệu/ảnh đối chiếu bổ sung đặt trong `references/` của phase và liên kết tới asset nguồn cụ thể.
  Thông số ước lượng, mục không áp dụng, đầu vào thiếu và phần chưa xác minh phải được ghi rõ;
  không thay đặc tả bằng mỗi đường link hoặc câu “làm giống thiết kế”.
- Phần chưa rõ ảnh hưởng kết quả phải được bổ sung hoặc hỏi owner; chỉ phần phụ thuộc cần chờ.
  Không mô tả nguồn chưa truy cập hoặc UI chưa render như đã được xác minh.
- Sau triển khai, Codex đối chiếu UI chạy thật với base cộng các thay đổi đã đặc tả, ở trạng thái/kích thước phù hợp;
  kiểm tra tương tác, ghi bằng chứng, sai khác và phần chưa kiểm tra vào `docs/PROGRESS/<phase>/`.

### 3. Quy trình áp dụng trong từng phase

**Codex đặc tả (Claude có thể đảm nhiệm khi owner yêu cầu) → triển khai UI (Codex có thể đảm nhiệm) →
owner xác nhận UI → gắn API của cùng phase → Dọn dẹp/Kiểm tra → owner UAT.**

- Giữ các mốc xác nhận UI trước API và UAT cuối phase theo [ADR-0021](ADR-0021-per-phase-ui-approval-api-uat.md).
  Việc chấp nhận UI base hoặc ADR này không tự xác nhận UI chạy thật hay UAT của bất kỳ phase nào.
- Áp dụng cho đặc tả mới và các thay đổi tiếp theo của app hiện tại. Giữ lịch sử bàn giao, bằng chứng và kết quả
  UAT đã ghi; không tự mở lại hoặc đóng phase chỉ vì thay nguồn base/phân công.
- ADR này **thay thế ADR-0019** về nguồn và phân công bàn giao/đặc tả/triển khai; **thay thế một phần ADR-0021**
  ở yêu cầu Claude Code bắt buộc bàn giao trước UI. Thứ tự các mốc của ADR-0021, TDD, nhật ký chỉ ghi thêm,
  thứ tự phụ thuộc, khoá hạ tầng và quyền nghiệm thu của owner tiếp tục có hiệu lực.

## Alternatives

- Luôn chờ Claude đặc tả từ Claude Design: thêm phụ thuộc khi nguồn local đã đủ và không đáp ứng phân công mới.
- Cố định UI theo HTML: không đáp ứng yêu cầu owner có thể thay đổi bản base.
- Triển khai trực tiếp từ HTML mà không cập nhật IMPLEMENT: thiếu căn cứ cho thay đổi, kiểm tra và nghiệm thu.

## Consequences

- Codex có đủ nguồn trong repo để đặc tả và triển khai; owner chủ động giao Claude khi cần.
- UI có một bản base chung và các thay đổi được ghi rõ trong đặc tả, thuận tiện đối chiếu và UAT.
- Người đặc tả phải duy trì nguồn, phạm vi và các sai khác; HTML gốc có thể khác UI đã được owner yêu cầu điều chỉnh.
