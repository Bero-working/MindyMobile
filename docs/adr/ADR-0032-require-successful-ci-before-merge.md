# ADR-0032: Bắt buộc CI đạt trước khi merge

- Status: Accepted
- Date: 2026-10-22
- Created at: 2026-10-22T12:50:56+07:00
- Author: @Bero (Codex soạn; handle do owner cung cấp trong chat)
- Approved by: @Bero — chỉ đạo trực tiếp “Thêm ADR về merge phải được CI chấp nhận” trong chat ngày 2026-10-22, sau khi phản đối việc merge khi CI chưa kết thúc.
- Updated by: @Bero — cùng ngày yêu cầu cho phép dừng AI khi CI đang chạy; owner gửi bằng chứng nếu CI thất bại và tự merge khi CI thành công.

## Context

PR #4 đã được merge vào dev khi CI của PR còn chạy. Kết quả local và CI xanh của PR/commit trước không chứng minh bản đang merge đã được CI chấp nhận. Owner yêu cầu quy định rõ việc phải chờ CI trước khi merge để tránh lặp lại quyết định này.

Phase 4 đã có pipeline gồm sáu job bắt buộc. Xác nhận UAT, quyền merge trên GitHub hoặc yêu cầu “merge vào dev” không thay thế kết quả pipeline của PR hiện tại.

Owner chốt cách bàn giao: không cần giữ AI chạy trong lúc chờ CI. Owner có thể stop AI; CI trên GitHub tiếp tục chạy độc lập. Khi CI xong, owner gửi bằng chứng lỗi để AI xử lý nếu thất bại, hoặc tự merge nếu thành công.

## Decision

Áp dụng cho mọi người và AI agent khi merge PR, bao gồm PR tài liệu, dọn dẹp và PR vào dev. Nhánh đích khác chỉ được merge khi cũng có CI kiểm tra phù hợp và đạt; thiếu workflow/check không được mặc định là đạt.

1. **PHẢI chờ CI của bản mới nhất trong PR hoàn tất và thành công trước khi merge.** Kiểm tra run thuộc đúng PR, head SHA hiện tại và nhánh đích. Nếu workflow checkout merge revision do GitHub tạo, đối chiếu revision đó với đúng head/base đang xét; không yêu cầu merge revision phải bằng head SHA.
2. Pipeline hiện tại phải có đủ sáu job: `typecheck`, `eslint`, `unit-tests`, `e2e-android`, `build-android`, `build-ios`, mỗi job đều hoàn tất với `conclusion: success`. Không chỉ kiểm tra ba job chất lượng đầu hoặc khả năng merge không xung đột. Phạm vi job mới sau này phải được cập nhật trong quy trình tương ứng; không tự bỏ một job bắt buộc.
3. `queued`, `pending`, `in_progress`, chờ duyệt runner, thiếu run/check hoặc không đọc được kết quả đều là **chưa đủ điều kiện merge**. `failure`, `cancelled`, `timed_out`, `action_required`, `neutral`, `skipped` và các kết quả khác `success` của job bắt buộc không được coi là đạt. Run thất bại chỉ được thay bằng lượt chạy lại thành công đúng bản đang xét, không lấy kết quả cũ để che lỗi.
4. Push thêm commit, đổi nhánh đích hoặc thay đổi base làm bản merge cần kiểm tra thay đổi thì phải chờ CI cho bản mới đó. Kết quả local, CI của commit/PR khác và CI chạy trên dev sau merge không thay được kiểm tra trước merge. Không tự miễn CI vì chỉ sửa docs hoặc cho rằng thay đổi ít rủi ro.
5. Ngay trước thao tác merge, đọc lại head/base và kết quả CI; dùng head SHA đã xác minh làm điều kiện khi công cụ hỗ trợ. Nếu PR thay đổi hoặc công cụ không cho xác minh chắc chắn, dừng merge và kiểm tra lại.
6. Yêu cầu “commit/push/tạo PR/merge”, xác nhận phase Done hoặc duyệt UAT **không cấp ngoại lệ bỏ qua CI**. Khi CI đang chạy, AI **được bàn giao rồi kết thúc lượt**, không phải chờ hoặc liên tục theo dõi tới khi CI xong. Owner có thể stop AI; việc dừng AI không phải yêu cầu hủy workflow trên GitHub. Giữ PR chưa merge, không tự merge vì chờ lâu hoặc cần kết thúc lượt làm việc.
7. **Owner theo dõi kết quả và tự merge khi CI thành công**, sau khi đủ điều kiện CI/review/UAT. AI không tự merge hoặc bật auto-merge trong quy trình bàn giao này, kể cả khi yêu cầu trước đó có nhắc merge. Nếu CI thất bại, owner gửi bằng chứng (ảnh, URL run/job hoặc log); khi nhận được, AI đối chiếu đúng run/head, chẩn đoán và sửa trong phạm vi yêu cầu. Nếu có push bản sửa thì bàn giao lượt CI mới theo cùng quy trình. Không tự coi việc owner chưa gửi lỗi là CI đã đạt.
8. **KHÔNG ĐƯỢC** dùng quyền admin, force/bypass, push thẳng vào nhánh đích, tắt check hoặc nới rule để vượt điều kiện CI. Nhánh chưa có branch protection vẫn phải tuân thủ.
9. Khi bàn giao lúc CI đang chạy, ghi URL PR/run, head SHA, trạng thái đã quan sát và phần còn chờ; nói rõ owner sẽ tự merge khi đạt hoặc gửi bằng chứng khi lỗi. Nếu chưa có URL run thì ghi rõ chưa quan sát được run, không đoán kết quả. Không báo đã merge hoặc CI thành công khi chưa có bằng chứng thực tế. Khi owner cung cấp xác nhận merge, ghi nhận kết quả theo bằng chứng đó, không coi đó là thao tác AI thực hiện.

ADR này bổ sung điều kiện merge cho quy trình docs hiện có, không thay quyền UAT của owner. Việc cấu hình branch protection/ruleset trên GitHub là biện pháp thực thi riêng; lượt ban hành ADR này chỉ cập nhật tài liệu, không tự thay cài đặt repository hoặc workflow.

## Alternatives

- Merge khi local test đạt hoặc CI của commit trước xanh: không kiểm chứng đúng bản thay đổi đang đưa vào nhánh đích.
- Merge trước rồi chờ push CI trên dev: lỗi đã vào nhánh dùng chung trước khi được phát hiện.
- Chỉ tuân thủ khi GitHub khóa nút merge: quyền kỹ thuật có thể cho phép thao tác trong khi điều kiện chất lượng chưa đạt.
- Tự miễn CI cho PR docs/dọn dẹp hoặc suy yêu cầu merge thành ngoại lệ: trái yêu cầu owner và tạo cách bỏ qua kiểm tra không rõ ràng.

## Consequences

- Mọi PR được merge đều có bằng chứng CI của đúng bản đã kiểm tra; kết quả pending hoặc thiếu check không còn bị diễn giải thành được phép merge.
- Phải chờ cả E2E và build native, có thể lâu hơn quality checks; runner lỗi/thiếu tài nguyên có thể trì hoãn merge.
- AI có thể kết thúc sau bàn giao, không cần chạy chờ CI; owner chịu trách nhiệm xem kết quả, gửi bằng chứng lỗi hoặc tự merge khi đạt. Dừng AI không hủy CI và không đồng nghĩa task đã merge thành công.
- Cần cập nhật tài liệu khi thay đổi tập job bắt buộc. Cần cấu hình GitHub riêng nếu muốn hệ thống tự chặn thao tác thay vì chỉ dựa vào quy trình.
- Quy định có hiệu lực từ chỉ đạo này; không sửa lịch sử PR #4 thành đã chờ CI, và không tạo kết quả kiểm thử mới cho các run trước.
