# ADR-0019: Claude Code đặc tả thiết kế Claude Design, Codex triển khai UI

- Status: Superseded by ADR-0029
- Date: 2026-10-17
- Author: @Bero (Codex hỗ trợ soạn thảo)
- Approved by: Owner, chỉ đạo trực tiếp trong chat ngày 2026-10-17: Claude Code lấy design từ Claude Design,
  mô tả kỹ trong IMPLEMENT và Codex dựa vào đó triển khai đúng UI yêu cầu.

> Cập nhật ngày 2026-10-18: **Superseded by [ADR-0029](ADR-0029-local-ui-base-codex-spec-implementation.md)**.
> Nguồn UI base và phân công đặc tả/triển khai theo ADR-0029; yêu cầu đặc tả chi tiết và đối chiếu bản chạy được
> kế thừa trong ADR mới. Trước đó, luồng mục 3 đã được thay thế một phần bởi [ADR-0021](ADR-0021-per-phase-ui-approval-api-uat.md).

## Context

Thiết kế từ Claude Design có thể gồm nhiều màn hình, phiên bản và biến thể. Chỉ bàn giao link hoặc ảnh tổng thể
không đủ để triển khai chính xác bố cục, asset, thông số hiển thị và tương tác. Cần phân công rõ người lấy thiết kế,
người đặc tả và người triển khai, với tài liệu trong repo làm căn cứ đối chiếu.

[ADR-0014](ADR-0014-docs-workflow.md) đã quy định IMPLEMENT chứa đặc tả và tiêu chí nghiệm thu, PROGRESS chứa
nhật ký. [ADR-0017](ADR-0017-ai-self-review-owner-uat.md) giữ quyền UAT cuối cùng cho owner.

## Decision

### 1. Claude Code chịu trách nhiệm lấy và đặc tả thiết kế

- Claude Code truy cập nguồn Claude Design do owner chỉ định, kiểm tra đúng màn hình, phiên bản và biến thể;
  lấy ảnh tham chiếu và asset gốc cần thiết cho UI.
- Claude Code mô tả thiết kế **chi tiết trong `docs/IMPLEMENT/<phase>/` trước khi Codex triển khai UI tương ứng**.
  README của phase ghi nguồn thiết kế, phạm vi và lựa chọn phiên bản; file sub-phase ghi chi tiết từng phần UI.
  Ảnh, asset và bản ghi đối chiếu đặt trong `references/` của phase, liên kết từ đặc tả.
- Không chỉ ghi “làm giống thiết kế” hoặc bàn giao mỗi đường link. Mỗi phần UI phải có đủ thông tin:
  - Nguồn, phiên bản/biến thể, thời điểm khảo sát và ảnh tham chiếu tương ứng.
  - Thứ tự các khối, bố cục, căn chỉnh, kích thước, khoảng cách, padding, vùng cuộn, phần cố định và safe area.
  - Màu/token, font, cỡ chữ, độ đậm, chiều cao dòng, bo góc, viền, bóng, icon và cách đặt/cắt ảnh.
    Ghi giá trị cụ thể hoặc token; thông số ước lượng phải được ghi rõ.
  - Nội dung hiển thị, dữ liệu mẫu so với dữ liệu thật, i18n key và mapping API khi có.
  - Trạng thái loading/empty/error/success; trạng thái form, validation, pending, disabled và phản hồi thao tác.
  - Hành vi CTA, điều hướng, bàn phím, animation, accessibility, chữ lớn và Reduce Motion khi áp dụng.
  - Đường dẫn asset, cách sử dụng; điểm thiếu/chưa xác nhận và sai khác cần thiết khi chuyển sang React Native.
  - Tiêu chí nghiệm thu quan sát được, liên kết ảnh/nguồn và các bước kiểm tra UI.
- Với mục không áp dụng, ghi rõ lý do. Nếu không truy cập được nguồn hoặc thiếu thông tin/asset ảnh hưởng tới
  kết quả, Claude Code ghi rõ phần bị chặn và yêu cầu bổ sung; không mô tả như đã xác minh.

### 2. Codex chịu trách nhiệm triển khai đúng đặc tả UI

- Codex đọc README phase, file sub-phase và tài liệu/ảnh tham chiếu được bàn giao; triển khai React Native theo
  đặc tả trong IMPLEMENT, dùng component, token và asset đã chỉ định.
- Codex không tự đổi phiên bản, biến thể, bố cục, phong cách hoặc thay asset để lấp chỗ thiếu. Khi thiếu đầu vào,
  yêu cầu Claude Code bổ sung đặc tả; phần cần owner quyết định thì hỏi owner. Chỉ phần phụ thuộc bị chặn phải chờ.
- Sai khác do contract, nghiệp vụ hoặc giới hạn native phải được ghi rõ trong IMPLEMENT trước khi triển khai;
  tuân thủ thứ tự ưu tiên nguồn tại [quy trình B.1](../README.md#b1-thứ-tự-ưu-tiên-khi-các-nguồn-mâu-thuẫn).
  Thay token/file hạ tầng hay thêm thư viện vẫn theo quy trình ADR hiện có.
- Sau triển khai, Codex kiểm tra UI chạy thật với ảnh/đặc tả ở cùng trạng thái và kích thước tham chiếu phù hợp,
  kiểm tra tương tác, ghi ảnh/bằng chứng, sai khác và phần chưa kiểm tra vào `docs/PROGRESS/<phase>/`.
  Test hành vi đạt không thay thế việc đối chiếu giao diện.

### 3. Bàn giao và nghiệm thu

Luồng chuẩn: **Claude Design → Claude Code lấy thiết kế và đặc tả IMPLEMENT → Codex triển khai, kiểm tra và
ghi PROGRESS → owner UAT**.

- Thay đổi thiết kế sau bàn giao được Claude Code cập nhật vào IMPLEMENT kèm nguồn/phiên bản và phạm vi ảnh hưởng
  trước khi Codex sửa UI tương ứng. Lịch sử triển khai và đối chiếu tiếp tục ghi thêm trong PROGRESS.
- Với phase đã có đặc tả hoặc đang `In review`, Claude Code rà soát và bổ sung khi thiếu; Codex đối chiếu UI theo
  bản bàn giao đã cập nhật. ADR này không tự xác nhận UI hiện tại đã khớp thiết kế hoặc thay đổi trạng thái phase.
- Quyền tự kiểm tra của AI và UAT cuối phase giữ theo ADR-0017; chỉ owner xác nhận UAT đạt mới chuyển phase `Done`.

ADR này bổ sung phân công bàn giao thiết kế cho ADR-0014 và ADR-0017; các quy định còn lại tiếp tục có hiệu lực.

## Alternatives

- Codex tự đọc Claude Design và vừa suy diễn vừa triển khai: không đáp ứng phân công của owner, dễ chọn sai
  phiên bản hoặc bỏ sót chi tiết chưa được ghi trong đặc tả.
- Claude Code chỉ chuyển link/ảnh: thiếu thông số, trạng thái và hành vi để triển khai và nghiệm thu nhất quán.

## Consequences

- Trách nhiệm rõ ràng: Claude Code bảo đảm chất lượng đầu vào thiết kế; Codex bảo đảm UI triển khai đúng bàn giao.
- IMPLEMENT là căn cứ chi tiết để triển khai và đối chiếu; PROGRESS lưu bằng chứng thực tế cho owner UAT.
- Claude Code cần cập nhật đặc tả khi thiết kế thay đổi; phần UI thiếu đầu vào phải chờ bổ sung trước khi hoàn thiện.
