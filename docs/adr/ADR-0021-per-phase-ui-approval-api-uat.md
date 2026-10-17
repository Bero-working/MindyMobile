# ADR-0021: Mỗi phase đi qua UI → owner xác nhận → gắn API → UAT

- Status: Accepted
- Date: 2026-10-17
- Author: @Bero (Codex hỗ trợ soạn thảo)
- Approved by: @Bero (chỉ đạo trực tiếp trong chat: “Quy trình sẽ là thiết kế UI -> xác nhận (tôi) -> gắn API -> nghiệm thu UAT”; làm rõ “Đây là quy trình theo từng phase”)

## Context

Quy trình hiện tại có bàn giao thiết kế, triển khai và UAT cuối phase nhưng chưa có mốc owner xác nhận UI
trước khi gắn API. Bằng chứng UI dùng fixture/callback có thể bị hiểu nhầm là đủ điều kiện UAT toàn phase.
Owner yêu cầu một luồng hoàn chỉnh **bên trong từng phase**, với hai lần xác nhận có mục đích riêng.

## Decision

### 1. Thứ tự bắt buộc trong mỗi phase

**Thiết kế và triển khai UI → owner xác nhận UI → gắn API của chính phase đó → owner nghiệm thu UAT.**

- Không làm UI của tất cả phase rồi mới gom API sang một phase khác. Mỗi phase tổ chức các mốc trên trong
  phạm vi của mình; quy tắc phụ thuộc giữa các phase vẫn có hiệu lực.
- Trước khi dựng UI, Claude Code bàn giao đặc tả theo ADR-0019; Codex triển khai và đối chiếu trên app chạy thật.
  Có thể đọc API contract để thiết kế đúng field/validation từ đầu; việc đọc contract không phải gắn API.
- Trong bước UI, dữ liệu kiểm soát được nằm trong test/preview, callback có kiểu; không gọi API nghiệp vụ thật
  cho phần đang thiết kế, không tạo phiên giả trong production.
- Codex bàn giao ảnh, tương tác, các trạng thái và sai khác trong PROGRESS để owner xác nhận UI.
- **Chỉ bắt đầu gắn API khi owner đã xác nhận UI của phase.** AI tự kiểm tra, test xanh, các yêu cầu chỉnh UI,
  việc duyệt ADR này hoặc owner chưa phản hồi đều không thay thế xác nhận UI.
- Sau xác nhận UI, đặc tả các task API của cùng phase trong IMPLEMENT rồi tích hợp service, query/mutation,
  controller, dữ liệu thật và điều hướng/quyền liên quan theo contract. Không tự gọi API PLANNED hoặc dựng endpoint.
- Sau gắn API, dọn dẹp, kiểm tra và bàn giao UAT cuối phase. Chỉ owner xác nhận UAT đạt mới chuyển phase `Done`.

### 2. Hai mốc xác nhận của owner

| Mốc | Owner xác nhận | Cho phép tiếp tục |
| --- | --- | --- |
| Xác nhận UI | Giao diện và tương tác của phase trên bản chạy; phạm vi/sai khác đã ghi rõ | Gắn API trong cùng phase |
| UAT cuối phase | Luồng nghiệp vụ đã tích hợp API, kết quả thực tế, trạng thái lỗi và quyền theo phạm vi | Chuyển phase sang `Done` |

- Không dùng kết quả duyệt UI làm kết quả UAT, và không dùng fixture/callback làm bằng chứng API thật.
- Nếu UI chưa đạt, sửa UI, kiểm tra và bàn giao lại trước khi gắn API.
- Nếu UAT chưa đạt, sửa phần liên quan, kiểm tra và bàn giao UAT lại; thay đổi UI ảnh hưởng phần đã duyệt phải
  được owner xác nhận lại trước khi tiếp tục phần API phụ thuộc vào thay đổi đó.
- Mốc không áp dụng (ví dụ phần hạ tầng không có UI, hoặc phase không dùng API) phải được ghi rõ cùng lý do
  trong đặc tả; không tạo UI/API giả để lấp quy trình. UAT cuối phase vẫn do owner thực hiện.

### 3. Theo dõi trong tài liệu

- README mỗi phase có bảng bốn mốc: UI, xác nhận UI, gắn API, UAT. Mỗi mốc dùng trạng thái hiện có, không tạo
  enum trạng thái mới. Xác nhận UI và UAT được ghi riêng, kèm thời gian, người xác nhận và bằng chứng trong PROGRESS.
- Chờ owner duyệt UI: phase `In review`, ghi rõ **chờ xác nhận UI**, mốc API và UAT còn `Todo`.
- Được duyệt UI và bắt đầu gắn API: phase `In progress`. Chưa có API/phụ thuộc cần thiết: ghi `Blocked`, không
  bỏ qua bước tích hợp để đóng phase.
- API và kiểm tra đạt: phase cùng bước `N.99` là `In review`, ghi rõ **chờ UAT**. File
  `PHASE_<NN>_99_User_Acceptance.md` vẫn dành cho UAT cuối phase, không dùng cho mốc xác nhận UI.
- TDD, task/sub-phase tuần tự, tự kiểm tra của AI, Dọn dẹp/Kiểm tra và nhật ký chỉ ghi thêm tiếp tục áp dụng
  trong từng bước. MSW dùng cho test có HTTP; test UI chỉ callback thì không dựng MSW giả.

### 4. Áp dụng cho công việc đang có

- Phase 1 hiện có UI và bằng chứng kiểm tra; chưa có xác nhận hoàn tất UI hoặc tích hợp backend auth.
  Tiếp tục ở **chờ owner xác nhận UI**, chưa bắt đầu UAT cuối phase.
- Giữ bằng chứng và nhật ký cũ; thêm entry làm rõ mốc hiện tại. Quyết định này không tự duyệt UI, nghiệm thu UAT,
  đóng Phase 0 hoặc gỡ điều kiện Foundation/API.

ADR này thay thế một phần: thứ tự vòng đời phase của ADR-0014/ADR-0017 và luồng bàn giao ở mục 3 ADR-0019
được thay bằng thứ tự trong ADR này. Các quy định còn lại, đặc biệt phân công thiết kế, tự kiểm tra của AI, quyền
UAT của owner, khoá hạ tầng và hợp đồng API, vẫn giữ hiệu lực.

## Alternatives

- Gắn API song song trước khi owner xác nhận UI: không đáp ứng mốc xác nhận mà owner yêu cầu, có thể phải sửa lại tích hợp.
- Một phase làm toàn bộ UI, phase sau gắn toàn bộ API: không đúng yêu cầu luồng trọn vẹn trong từng phase.
- Chỉ duyệt UI rồi đóng phase: thiếu kiểm chứng luồng nghiệp vụ với API.

## Consequences

- Owner kiểm soát UI trước khi đầu tư tích hợp; tiến độ từng phase phân biệt rõ bản UI và luồng nghiệp vụ thật.
- Mỗi phase có hai mốc owner xác nhận, với bằng chứng và phạm vi riêng.
- AI phải chờ xác nhận UI trước bước API; một phase có UI hoàn tất vẫn chưa thể `Done` khi chưa UAT đạt.
