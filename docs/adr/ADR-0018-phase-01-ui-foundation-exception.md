# ADR-0018: Gỡ phụ thuộc vòng để triển khai UI Phase 1

- Status: Accepted
- Date: 2026-10-17
- Author: @LogKoNger (Codex hỗ trợ soạn thảo)
- Approved by: Owner, xác nhận trực tiếp trong chat ngày 2026-10-17: “Duyệt ADR 18”

## Context

Owner yêu cầu triển khai Phase 1. Đặc tả đã có tại
[PHASE_01_AUTH_HOME_UI](../IMPLEMENT/PHASE_01_AUTH_HOME_UI/README.md).
Phase 0 đã được owner nghiệm thu một phần, còn bước UAT 5–6 liên quan đến phiên hết hạn,
đích Login và mutation có Origin với backend thật. Quy trình B.3 yêu cầu nghiệm thu Phase 0
trước các phase màn hình, trong khi Foundation lại cần màn Login của Phase 1.

`src/navigation/index.tsx` bị khoá theo ARCHITECTURE. Component nativecn/shared UI cần cho
Phase 1 chưa có đầy đủ. Yêu cầu triển khai phase chưa được coi là xác nhận UAT hoặc
ADR Accepted cho các thay đổi hạ tầng này.

## Decision

Đề xuất owner duyệt đồng thời phạm vi sau:

1. Cho phép triển khai UI Phase 1 trước khi hoàn tất UAT Phase 0 để gỡ phụ thuộc vòng.
   Ngoại lệ chỉ áp dụng phase này; giữ Phase 0 và bước 0.99 ở trạng thái Blocked tới khi
   owner xác nhận các bước còn lại. Không tự đánh dấu nghiệm thu đạt.
2. Cho phép sửa `src/navigation/index.tsx` để đăng ký Welcome, Login, Register và Student Home
   cùng thay đổi tương ứng ở routes, param list và module exports. Cập nhật ARCHITECTURE
   trong cùng thay đổi khi triển khai. Không mở quyền sửa các file hạ tầng khác.
3. Hoàn thiện các component nền tảng còn thiếu: Button, Input, Skeleton, ScreenState,
   PressableScale và CoverImage theo ADR-0004, token hiện có và test hành vi trong task 1.1.2.
   Component nativecn có nguồn được ghi lại; không dùng bản sao riêng để lách quy định.
   Không thêm package, sửa cấu hình build/test/theme hoặc thay provider theo ADR này.
4. Giữ phạm vi UI đã đặc tả: controller nhận adapter/callback có kiểu; fixture chỉ dùng
   trong test/preview. Không tạo session giả, lưu token/password hoặc cho người chưa xác thực
   vào Student Home production. CTA thiếu tích hợp thật phải ẩn hoặc disabled có giải thích.
   Home fixture chỉ có ở preview dành cho development, không thể bật trong release.
5. Tích hợp cookie auth, bootstrap `auth/me`, điều hướng khi refresh thất bại và kiểm tra
   mutation Origin thật vẫn cần phạm vi triển khai/kiểm thử riêng. UI callback và preview
   không được dùng làm bằng chứng hoàn tất các bước UAT 5–6 của Foundation.

Owner đã xác nhận ngoại lệ và quyền sửa ở trên qua thông điệp “Duyệt ADR 18”.
Asset mascot gốc vẫn là đầu vào cần bổ sung theo task 1.1.1: không cắt screenshot hoặc
tự sinh hình thay thế để đánh dấu giao diện đã hoàn tất.

## Alternatives

- Giữ nguyên thứ tự: Phase 1 tiếp tục chờ Foundation; cần phê duyệt một phạm vi Login tối thiểu
  riêng cho Phase 0 để gỡ phụ thuộc vòng.
- Thực hiện auth integration đầy đủ cùng Phase 1: mở rộng vượt phạm vi UI hiện tại,
  cần đặc tả và phê duyệt riêng, không thuộc đề xuất này.

## Consequences

- Có thể triển khai và kiểm thử UI theo thứ tự 1.1–1.5 sau khi owner duyệt,
  giữ nguyên ranh giới giữa UI, tích hợp backend và UAT.
- Chỉ mở quyền thay đổi navigator và phạm vi shared UI đã liệt kê; các khoá khác giữ nguyên.
- Chưa thể tuyên bố Phase 0 hoặc Phase 1 Done chỉ từ ADR hoặc test UI.
- Bàn giao UI đầy đủ còn phụ thuộc asset gốc và kiểm thử native theo đặc tả.
