# ADR-0022: Gắn API Phase 1 để hoàn thiện luồng auth và kiểm thử Foundation

- Status: Accepted
- Date: 2026-10-17
- Author: @LogKoNger (Codex hỗ trợ soạn thảo)
- Approved by: @Bero, chỉ đạo trực tiếp trong chat ngày2026-10-17: “Duyệt ADR-0022”.

## Context

Owner đã xác nhận trong chat: **“UI phase 1 đã được approve”**. Mốc UI của Phase 1 đã đạt theo ADR-0021;
bước tiếp theo là gắn API trong cùng phase. Xác nhận này không phải UAT cuối phase.

Phase 0 vẫn `Blocked` vì còn kiểm thử auth/phiên hết hạn và UAT 5–6. Quy trình B.3 yêu cầu Foundation hoàn tất
trước phase màn hình; ADR-0018 chỉ cho ngoại lệ **UI** và giữ auth integration ngoài phạm vi đó. Nếu chờ Foundation
xong mới tích hợp Login thì tiếp tục phụ thuộc vòng. `src/navigation/index.tsx` còn bị khoá theo ARCHITECTURE.

## Decision

Owner đã duyệt phạm vi sau:

1. Cho phép gắn API của Phase 1 khi Foundation còn chờ UAT, dựa trên UI đã duyệt và đặc tả
   [1.6 Tích hợp API](../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_06_API_INTEGRATION.md).
2. Phạm vi API: register, resend email, login, bootstrap `auth/me`, logout; Home dùng catalog public và lịch Student.
   Cookie/refresh dùng HTTP Foundation hiện có; không lưu token/password hoặc tạo session giả.
3. Cho phép sửa riêng `src/navigation/index.tsx` **nếu cần** để nối bootstrap, guard theo role và reset stack khi
   phiên hết hạn, kèm test và cập nhật ARCHITECTURE trong cùng thay đổi. Không mở khoá `src/config/**`, native/build,
   theme, test runtime hoặc package; không thêm thư viện. Nếu các file đó cần sửa, phải xin ADR tương ứng riêng.
4. Dùng auth thật để bổ sung bằng chứng kiểm thử Foundation: refresh thành công/thất bại, clear cache, về Login,
   Back không mở màn bảo vệ. Bước kiểm tra Origin thật chỉ làm khi có endpoint/dữ liệu/quyền phù hợp; thiếu thì
   ghi rõ còn chặn, không dùng register/login để giả bằng chứng cho mutation cần Origin.
5. Không làm Google OIDC, deep link xác thực email, quên mật khẩu, thanh toán, compiler thật hoặc dashboard staff.
   Staff không được đưa vào Home Student; đích staff chưa triển khai phải được báo rõ và không truy vấn dữ liệu Student.
6. Các CTA tới màn chưa có tiếp tục disabled/giải thích. Không tự tạo API xếp hạng nổi bật, mentor, dự án hoặc thông báo.
7. Phase 0 giữ trạng thái/UAT riêng. Chỉ owner xác nhận UAT mới đóng Foundation hoặc Phase 1; ADR này không tự nghiệm thu
   bước nào. Phase 1 chỉ bàn giao UAT sau API và kiểm tra đạt.

ADR này chỉ mở rộng phạm vi ngoại lệ của ADR-0018 cho bước API của Phase 1; không thay quyền duyệt UI/UAT theo
ADR-0021 hoặc các ràng buộc API contract.

## Alternatives

- Chờ Foundation UAT xong mới nối Login: không gỡ được phụ thuộc vòng của kiểm thử phiên hết hạn.
- Gắn API dựa vào quyền UI của ADR-0018: vượt phạm vi ngoại lệ đã được owner duyệt.
- Tự coi UI approval là Foundation/UAT đạt: trái ADR-0021 và không có bằng chứng nghiệp vụ thật.

## Consequences

- Có thể hoàn thiện auth/Home và tạo bằng chứng để owner nghiệm thu Foundation trong cùng tiến trình Phase 1.
- Quyền sửa hạ tầng được giới hạn, không mở toàn bộ navigator/config/build cho các phase sau.
- Phải kiểm thử cookie thật trên Android; unit test/MSW không thay thế bằng chứng native/backend.
- Tài khoản Student ACTIVE và dữ liệu lịch hợp lệ cần cho UAT thành công; chưa có thì ghi giới hạn, không dựng dữ liệu production.

