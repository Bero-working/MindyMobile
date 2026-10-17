# ADR-0017: AI tự nghiệm thu trong PROGRESS, owner nghiệm thu cuối cùng bằng UAT

- Status: Accepted
- Date: 2026-10-17
- Author: @Bero (ghi nhận với Codex)
- Approved by: @Bero (chỉ đạo trực tiếp trong chat 2026-10-17)

> Cập nhật: **Superseded by [ADR-0021](ADR-0021-per-phase-ui-approval-api-uat.md)** đối với thứ tự bàn giao trước UAT, bổ sung mốc owner xác nhận UI trước API. Các quyết định còn lại của ADR này tiếp tục có hiệu lực.

## Context
[ADR-0014](ADR-0014-docs-workflow.md) quy định owner là người nghiệm thu và chỉ owner đánh dấu phase `Done`.
Cần làm rõ quyền tự kiểm tra, tự nghiệm thu và đánh giá của AI trong quá trình triển khai, đồng thời giữ quyền
nghiệm thu cuối cùng cho owner (@Bero).

## Decision
- Owner (@Bero) là người nghiệm thu cuối cùng.
- Trong quá trình triển khai, AI được tự kiểm tra, tự nghiệm thu và đánh giá kết quả của task/sub-phase theo
  tiêu chí trong `IMPLEMENT/`, ghi kết quả vào `PROGRESS/` và tiếp tục công việc theo thứ tự, phụ thuộc đã quy định.
- Entry tự nghiệm thu phải nêu rõ AI thực hiện, phạm vi và tiêu chí đã kiểm tra, kết quả đạt/chưa đạt, bằng chứng
  (test, log, ảnh hoặc flow phù hợp), phần chưa kiểm tra và vấn đề còn tồn tại. Không ghi đạt cho phần chưa kiểm tra.
- Mỗi phase lớn (phase cấp cao nhất trong `IMPLEMENT/`, bao gồm Phase 0 và các phase màn hình) kết thúc bằng
  **UAT (User Acceptance Testing) do owner thực hiện** theo tiêu chí nghiệm thu của phase.
- Bước UAT có file riêng trong `IMPLEMENT/<phase>/`, đặt tên **`PHASE_<NN>_99_User_Acceptance.md`**:
  - `<NN>` là số thứ tự phase lớn, đệm số 0 đến đủ hai chữ số: `00`…`09`, rồi `10`…`99` giữ nguyên
    (ví dụ Phase 12 → `PHASE_12_99_User_Acceptance.md`, không viết `PHASE_012_...`). Nếu số phase vượt quá 99
    thì dừng lại hỏi owner trước khi đặt tên, vì tên hai chữ số không còn sắp xếp đúng thứ tự.
  - `99` là số bước con cố định, dành riêng cho nghiệm thu của User; các sub-phase triển khai dùng số `01`–`98`
    để bước UAT luôn nằm cuối danh sách file `PHASE_*` khi sắp xếp theo tên.
  - Giữ nguyên cách viết tiếng Anh `User_Acceptance`; đây là ngoại lệ của quy tắc UPPER_SNAKE_CASE cho tên phần.
  - Ví dụ: `PHASE_02_99_User_Acceptance.md`; Phase 0 dùng `PHASE_00_99_User_Acceptance.md`.
- README của mỗi phase liệt kê bước `N.99` ở cuối bảng sub-phase. File UAT ghi phạm vi nghiệm thu, điều kiện
  bắt đầu, các bước User kiểm tra, kết quả mong đợi, liên kết bằng chứng AI và phần ghi nhận kết quả/xác nhận
  của owner. Kết quả UAT thực tế được ghi thêm vào `PROGRESS/<phase>/README.md` theo quy tắc nhật ký cấp phase.
- Sau Dọn dẹp và Kiểm tra đạt yêu cầu, AI ghi tổng hợp tự nghiệm thu vào `PROGRESS/<phase>/README.md`, chuyển
  phase cùng bước `N.99` sang `In review` và bàn giao file `PHASE_<NN>_99_User_Acceptance.md` cùng bằng chứng
  cho owner. Bước `N.99` được thực hiện sau toàn bộ sub-phase triển khai, Dọn dẹp và Kiểm tra.
- Kết quả tự nghiệm thu của AI không thay thế UAT. Chỉ khi owner xác nhận UAT đạt thì phase mới được chuyển sang
  `Done`. AI không tự xác nhận UAT thay owner hoặc tự đánh dấu phase `Done`.
- Nếu UAT chưa đạt, AI ghi nhận phản hồi vào entry PROGRESS mới, sửa lỗi, kiểm tra lại và bàn giao owner UAT lại.
  Việc chưa có phản hồi từ owner không được xem là UAT đạt.

ADR này bổ sung, làm rõ phần nghiệm thu của ADR-0014; các quy định còn lại của ADR-0014 tiếp tục có hiệu lực.

## Alternatives
- Owner nghiệm thu từng task/sub-phase: làm gián đoạn triển khai, không cần thiết khi AI có thể tự kiểm tra và ghi
  bằng chứng trong PROGRESS.
- AI tự nghiệm thu cuối cùng và đóng phase: không bảo đảm quyền quyết định cuối cùng của owner.

## Consequences
+ AI có thể chủ động đánh giá trong quá trình triển khai; owner theo dõi được kết quả và giới hạn kiểm tra qua PROGRESS.
+ Mỗi phase lớn có mốc UAT rõ ràng, quyền nghiệm thu cuối cùng thuộc owner.
+ File nghiệm thu của User dùng hậu tố cố định `99_User_Acceptance`, dễ tìm và nằm cuối các file sub-phase.
- AI phải chuẩn bị bằng chứng và hướng dẫn UAT; phase chờ owner xác nhận trước khi được đánh dấu `Done`.
